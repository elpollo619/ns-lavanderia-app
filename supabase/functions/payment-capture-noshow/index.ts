// Edge Function: payment-capture-noshow
// Job (programable via Supabase Cron / pg_cron) que captura fees de no-show.
//
// Lógica:
//  1. Busca reservations con status='noshowed' y payment_intent_id no null
//  2. Para cada una: stripe.paymentIntents.capture(intent_id, { amount_to_capture: feeCents })
//  3. Inserta payment type='noshowfee'
//  4. Marca reservation como 'noshow_charged' (o mantiene status='noshowed' + payments)
//
// IMPORTANTE:
//  - TWINT: pre-auth máx 7 días. Si pasa el límite, debe re-cobrarse via off_session.
//  - Tarjeta: hasta 30 días con extended auth.
//
// Fee por defecto: CHF 5.00 (configurable via env NOSHOW_FEE_CENTS).
//
// Invocación: POST manual desde panel admin o cron Supabase:
//   SELECT cron.schedule('noshow-job', '0 3 * * *', $$
//     SELECT net.http_post(
//       url:='https://xxx.supabase.co/functions/v1/payment-capture-noshow',
//       headers:='{"Authorization":"Bearer <SERVICE_ROLE>"}'::jsonb
//     );
//   $$);

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

const FEE_CENTS = parseInt(Deno.env.get('NOSHOW_FEE_CENTS') ?? '500', 10); // CHF 5.00

serve(async (_req) => {
  try {
    // Buscar reservas no-show sin fee aún cobrado
    const { data: reservations, error } = await supabaseAdmin
      .from('reservations')
      .select('id, user_id, payment_intent_id')
      .eq('status', 'noshowed')
      .not('payment_intent_id', 'is', null);

    if (error) throw error;
    if (!reservations || reservations.length === 0) {
      return new Response(JSON.stringify({ processed: 0 }), {
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const results: any[] = [];

    for (const r of reservations) {
      try {
        // Verificar que no exista ya un payment type='noshowfee'
        const { data: existingFee } = await supabaseAdmin
          .from('payments')
          .select('id')
          .eq('reservation_id', r.id)
          .eq('type', 'noshowfee')
          .maybeSingle();

        if (existingFee) {
          results.push({ id: r.id, skipped: 'fee already charged' });
          continue;
        }

        const intent = await stripe.paymentIntents.retrieve(r.payment_intent_id!);

        let captured: Stripe.PaymentIntent;
        if (intent.status === 'requires_capture') {
          // Captura parcial del hold: solo cobramos el fee
          captured = await stripe.paymentIntents.capture(intent.id, {
            amount_to_capture: FEE_CENTS,
          });
        } else if (intent.status === 'succeeded') {
          // Ya capturado: no hacer nada, registrar warning
          results.push({ id: r.id, skipped: 'intent already succeeded' });
          continue;
        } else {
          // Si el hold caducó (TWINT >7d): crear un nuevo intent off_session con el método guardado
          if (intent.payment_method) {
            captured = await stripe.paymentIntents.create({
              amount: FEE_CENTS,
              currency: 'chf',
              customer: intent.customer as string,
              payment_method: intent.payment_method as string,
              off_session: true,
              confirm: true,
              metadata: { reservation_id: r.id, type: 'noshowfee' },
              description: `Fee no-show reserva ${r.id}`,
            });
          } else {
            results.push({ id: r.id, error: 'no payment method available' });
            continue;
          }
        }

        await supabaseAdmin.from('payments').insert({
          reservation_id: r.id,
          stripe_intent_id: captured.id,
          amount_cents: FEE_CENTS,
          currency: 'chf',
          status: captured.status === 'succeeded' ? 'captured' : 'pending',
          type: 'noshowfee',
        });

        results.push({ id: r.id, captured: true, amount_cents: FEE_CENTS });
      } catch (e: any) {
        console.error(`[noshow] error reserva ${r.id}`, e);
        results.push({ id: r.id, error: e?.message });
      }
    }

    return new Response(
      JSON.stringify({ processed: results.length, results }),
      { headers: { 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('[noshow] fatal', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
