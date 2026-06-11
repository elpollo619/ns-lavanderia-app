// =====================================================================
// POST /functions/v1/reservations-create
// Crea reserva + Stripe PaymentIntent (capture_method=manual para holds)
//
// Modelo del diseño (design_handoff): programa fija duración y recargo,
// extras suman al total. El precio se calcula SIEMPRE en el servidor.
//
// Body: { machine_id: string, start_time: ISO,
//         program_id: 'eco'|'standard'|'intensiv',
//         extra_ids?: string[],
//         payment_method?: 'twint'|'card'|'apple_pay'|'google_pay' }
// Response: { reservation_id, client_secret, amount_cents, currency }
// =====================================================================
import { serve } from "https://deno.land/std@0.224.0/http/server.ts";
import { corsHeaders } from "../_shared/cors.ts";
import { getAuthUser, getServiceClient } from "../_shared/supabase.ts";
import { stripe } from "../_shared/stripe.ts";

// Catálogo del diseño — mantener en sync con src/design/data.ts
const PROGRAMS: Record<string, { name: string; mins: number; addCents: number }> = {
  eco: { name: "Eco", mins: 35, addCents: 0 },
  standard: { name: "Standard", mins: 45, addCents: 50 },
  intensiv: { name: "Intensiv", mins: 60, addCents: 150 },
};
const EXTRAS: Record<string, number> = {
  waschmittel: 150,
  weichspueler: 100,
  express: 80,
};

interface CreateBody {
  machine_id: string;
  start_time: string;
  program_id: keyof typeof PROGRAMS;
  extra_ids?: string[];
  payment_method?: "twint" | "card" | "apple_pay" | "google_pay";
}

serve(async (req) => {
  if (req.method === "OPTIONS") return new Response("ok", { headers: corsHeaders });

  try {
    // 1. Auth
    const { user } = await getAuthUser(req);

    // 2. Body validation
    const body = (await req.json()) as CreateBody;
    if (!body.machine_id || !body.start_time || !body.program_id) {
      return json({ error: "Missing required fields" }, 400);
    }
    const program = PROGRAMS[body.program_id];
    if (!program) {
      return json({ error: "Invalid program" }, 400);
    }
    const extraIds = (body.extra_ids ?? []).filter((id) => id in EXTRAS);
    const startTime = new Date(body.start_time);
    if (isNaN(startTime.getTime()) || startTime < new Date()) {
      return json({ error: "start_time must be in the future" }, 400);
    }
    const durationMinutes = program.mins;
    const endTime = new Date(startTime.getTime() + durationMinutes * 60_000);

    // 3. Service client (RLS bypass para validar atómicamente)
    const supabase = getServiceClient();

    // 4. Obtener máquina + precio (server-side: el cliente no fija importes)
    const { data: machine, error: mErr } = await supabase
      .from("machines")
      .select("id, name, status, price_cents")
      .eq("id", body.machine_id)
      .single();
    if (mErr || !machine) return json({ error: "Machine not found" }, 404);
    if (machine.status === "offline" || machine.status === "maintenance") {
      return json({ error: "Machine not bookable" }, 409);
    }

    const extrasCents = extraIds.reduce((sum, id) => sum + EXTRAS[id], 0);
    const amount_cents = machine.price_cents + program.addCents + extrasCents;

    // 5. Obtener/crear stripe_customer_id
    const { data: userRow } = await supabase
      .from("users").select("stripe_customer_id, email")
      .eq("id", user.id).single();

    let customerId = userRow?.stripe_customer_id;
    if (!customerId) {
      const customer = await stripe.customers.create({
        email: userRow?.email ?? user.email!,
        metadata: { supabase_user_id: user.id },
      });
      customerId = customer.id;
      await supabase.from("users").update({ stripe_customer_id: customerId }).eq("id", user.id);
    }

    // 6. Crear PaymentIntent (manual capture para hold de no-show)
    // Nota: para TWINT, capture_method debe ser 'automatic' si se quiere
    // setup_future_usage. Aquí usamos manual + setup_future_usage off_session.
    const paymentMethods = body.payment_method === "twint"
      ? ["twint"]
      : ["card", "twint"];

    const intent = await stripe.paymentIntents.create({
      amount: amount_cents,
      currency: "chf",
      customer: customerId,
      payment_method_types: paymentMethods,
      capture_method: "manual",
      setup_future_usage: "off_session", // para captura fee no-show
      metadata: {
        supabase_user_id: user.id,
        machine_id: body.machine_id,
        start_time: startTime.toISOString(),
        duration_minutes: String(durationMinutes),
        program: program.name,
      },
    });

    // 7. Insertar reserva (la EXCLUDE constraint protege overlap)
    const { data: reservation, error: rErr } = await supabase
      .from("reservations")
      .insert({
        user_id: user.id,
        machine_id: body.machine_id,
        start_time: startTime.toISOString(),
        end_time: endTime.toISOString(),
        duration_minutes: durationMinutes,
        status: "pending_payment",
        payment_intent_id: intent.id,
        payment_method: body.payment_method ?? null,
        amount_cents,
        currency: "chf",
        program: program.name,
        extras: extraIds,
      })
      .select()
      .single();

    if (rErr) {
      // Si overlap, cancelar el PaymentIntent creado
      await stripe.paymentIntents.cancel(intent.id).catch(() => {});
      if (rErr.message?.includes("no_overlap")) {
        return json({ error: "Slot already reserved" }, 409);
      }
      return json({ error: rErr.message }, 400);
    }

    return json({
      reservation_id: reservation.id,
      client_secret: intent.client_secret,
      amount_cents,
      currency: "chf",
      payment_intent_id: intent.id,
    });
  } catch (err) {
    if (err instanceof Response) return err;
    console.error("reservations-create error:", err);
    return json({ error: (err as Error).message }, 500);
  }
});

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { ...corsHeaders, "Content-Type": "application/json" },
  });
}
