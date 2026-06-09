// =====================================================================
// POST /functions/v1/reservations-confirm
// Webhook Stripe: actualiza reserva según eventos del PaymentIntent.
// Configurar en Stripe Dashboard → Webhooks → endpoint:
//   https://<project>.functions.supabase.co/reservations-confirm
// Events: payment_intent.succeeded, payment_intent.amount_capturable_updated,
//         payment_intent.payment_failed, payment_intent.canceled
// =====================================================================
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getServiceClient } from "../_shared/supabase.ts";
import { stripe } from "../_shared/stripe.ts";

const WEBHOOK_SECRET = Deno.env.get("STRIPE_WEBHOOK_SECRET")!;

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  const sig = req.headers.get("stripe-signature");
  if (!sig) return new Response("Missing signature", { status: 400 });

  const rawBody = await req.text();
  let event;
  try {
    event = await stripe.webhooks.constructEventAsync(rawBody, sig, WEBHOOK_SECRET);
  } catch (err) {
    console.error("Webhook signature failed:", err);
    return new Response("Invalid signature", { status: 400 });
  }

  const supabase = getServiceClient();

  // Idempotencia: si el event_id ya existe, ignorar
  const { data: existing } = await supabase
    .from("payments").select("id").eq("stripe_event_id", event.id).maybeSingle();
  if (existing) return new Response("ok (duplicate)", { status: 200 });

  try {
    switch (event.type) {
      case "payment_intent.amount_capturable_updated":
      case "payment_intent.succeeded": {
        const pi = event.data.object as any;
        const isCaptured = event.type === "payment_intent.succeeded";

        const { data: reservation } = await supabase
          .from("reservations").select("*")
          .eq("payment_intent_id", pi.id).single();
        if (!reservation) break;

        // Si es la captura del fee de no-show: no cambiar status reserva
        const isNoShowCapture = reservation.noshow_fee_captured ||
          pi.metadata?.type === "noshow_fee";

        if (!isNoShowCapture) {
          await supabase.from("reservations").update({
            status: "confirmed",
            payment_method: pi.payment_method_types?.[0] ?? null,
          }).eq("id", reservation.id);
        }

        await supabase.from("payments").insert({
          reservation_id: reservation.id,
          user_id: reservation.user_id,
          stripe_intent_id: pi.id,
          stripe_charge_id: pi.latest_charge ?? null,
          amount_cents: pi.amount,
          currency: pi.currency,
          status: isCaptured ? "succeeded" : "requires_capture",
          type: isNoShowCapture ? "noshow_fee" : "reservation",
          payment_method: pi.payment_method_types?.[0] ?? null,
          stripe_event_id: event.id,
        });
        break;
      }

      case "payment_intent.payment_failed": {
        const pi = event.data.object as any;
        const { data: reservation } = await supabase
          .from("reservations").select("id, user_id")
          .eq("payment_intent_id", pi.id).single();
        if (!reservation) break;

        await supabase.from("reservations").update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        }).eq("id", reservation.id);

        await supabase.from("payments").insert({
          reservation_id: reservation.id,
          user_id: reservation.user_id,
          stripe_intent_id: pi.id,
          amount_cents: pi.amount,
          currency: pi.currency,
          status: "failed",
          type: "reservation",
          failure_reason: pi.last_payment_error?.message ?? "unknown",
          stripe_event_id: event.id,
        });
        break;
      }

      case "payment_intent.canceled": {
        const pi = event.data.object as any;
        await supabase.from("reservations").update({
          status: "cancelled",
          cancelled_at: new Date().toISOString(),
        }).eq("payment_intent_id", pi.id);
        break;
      }
    }
    return new Response("ok", { status: 200 });
  } catch (err) {
    console.error("webhook handler error:", err);
    return new Response("error", { status: 500 });
  }
});
