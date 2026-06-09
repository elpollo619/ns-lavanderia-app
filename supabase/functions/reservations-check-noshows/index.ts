// =====================================================================
// POST /functions/v1/reservations-check-noshows
// Cron job (configurar en Supabase → Database → Cron):
//   SELECT cron.schedule('check-noshows', '*/10 * * * *',
//     $$ SELECT net.http_post(
//          url := 'https://<project>.functions.supabase.co/reservations-check-noshows',
//          headers := jsonb_build_object('Authorization','Bearer <CRON_SECRET>')
//        ) $$);
//
// Lógica: para cada reserva 'confirmed' cuyo start_time + grace pasó y
// nadie abrió la máquina, marcar como 'noshowed' y capturar fee.
// =====================================================================
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { stripe } from "../_shared/stripe.ts";

const CRON_SECRET = Deno.env.get("CRON_SECRET")!;
const GRACE_MINUTES = 15; // tiempo de cortesía post-start_time

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  // Auth: solo cron (header simple Bearer)
  const auth = req.headers.get("Authorization");
  if (auth !== `Bearer ${CRON_SECRET}`) {
    return new Response("Unauthorized", { status: 401 });
  }

  const supabase = getServiceClient();
  const cutoff = new Date(Date.now() - GRACE_MINUTES * 60_000).toISOString();

  // Reservas confirmadas cuyo grace ya pasó y no fueron chequeadas
  // En la app real: tambien filtrar por "no hubo access_log unlock"
  const { data: candidates, error } = await supabase
    .from("reservations")
    .select("id, user_id, machine_id, payment_intent_id, status, start_time, noshow_fee_captured, machines(noshow_fee_cents)")
    .eq("status", "confirmed")
    .is("noshow_checked_at", null)
    .lt("start_time", cutoff);

  if (error) {
    console.error("query error:", error);
    return new Response(JSON.stringify({ error: error.message }), { status: 500 });
  }

  const results: any[] = [];

  for (const r of candidates ?? []) {
    try {
      // TODO: chequear access_logs / IoT para confirmar no-show real
      // Por ahora: marcar como noshow tras grace si nadie abrió
      const noShowFee = (r.machines as any)?.noshow_fee_cents ?? 500;

      // 1. Capturar PaymentIntent parcialmente (solo el fee, no el total)
      let captured = false;
      if (r.payment_intent_id && !r.noshow_fee_captured) {
        try {
          await stripe.paymentIntents.capture(r.payment_intent_id, {
            amount_to_capture: noShowFee,
          });
          captured = true;
        } catch (capErr) {
          console.error(`capture failed for ${r.id}:`, capErr);
          // Fallback: usar off_session payment con method guardado
        }
      }

      // 2. Marcar reserva como noshowed
      await supabase.from("reservations").update({
        status: "noshowed",
        noshow_checked_at: new Date().toISOString(),
        noshow_fee_captured: captured,
      }).eq("id", r.id);

      results.push({ id: r.id, captured, fee_cents: noShowFee });
    } catch (err) {
      console.error(`reservation ${r.id} failed:`, err);
      results.push({ id: r.id, error: (err as Error).message });
    }
  }

  return new Response(JSON.stringify({ processed: results.length, results }), {
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
});
