// Edge Function: payment-webhook
// Recibe eventos de Stripe y actualiza estado de reservations + payments.
//
// IMPORTANTE: en supabase/config.toml debe estar `verify_jwt = false` para esta función
// (Stripe no envía JWT, sino su firma propia en `stripe-signature`).
//
// Eventos manejados:
//   - payment_intent.succeeded     -> reservations.status='confirmed', payments.status='succeeded'
//   - payment_intent.amount_capturable_updated -> reserva pre-autorizada, lista para capturar
//   - charge.captured              -> payments.status='captured'
//   - payment_intent.payment_failed-> payments.status='failed'
//   - payment_intent.canceled      -> payments.status='canceled', reservations.status='cancelled'
//
// ENV:
//   STRIPE_SECRET_KEY
//   STRIPE_WEBHOOK_SECRET (whsec_...)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY

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

const webhookSecret = Deno.env.get('STRIPE_WEBHOOK_SECRET')!;

/**
 * El PaymentIntent se crea ANTES del insert de la reserva, así que su
 * metadata no lleva reservation_id — se resuelve por la columna
 * reservations.payment_intent_id.
 */
async function resolveReservationId(pi: Stripe.PaymentIntent): Promise<string | null> {
  if (pi.metadata?.reservation_id) return pi.metadata.reservation_id;
  const { data } = await supabaseAdmin
    .from('reservations')
    .select('id')
    .eq('payment_intent_id', pi.id)
    .maybeSingle();
  return data?.id ?? null;
}

/** Provisioning de acceso (modelo LikeMagic) al confirmar — fire and forget. */
async function grantAccess(reservationId: string): Promise<void> {
  try {
    const res = await fetch(
      `${Deno.env.get('SUPABASE_URL')}/functions/v1/reservation-grant-access`,
      {
        method: 'POST',
        headers: {
          Authorization: `Bearer ${Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ reservation_id: reservationId }),
      }
    );
    if (!res.ok) {
      console.error('[webhook] grant-access falló:', res.status, await res.text());
    }
  } catch (e) {
    console.error('[webhook] grant-access error:', e);
  }
}

serve(async (req) => {
  const signature = req.headers.get('stripe-signature');
  if (!signature) {
    return new Response('Missing stripe-signature', { status: 400 });
  }

  const body = await req.text();

  let event: Stripe.Event;
  try {
    // En Deno usar constructEventAsync (no la versión sync, que usa crypto sync)
    event = await stripe.webhooks.constructEventAsync(
      body,
      signature,
      webhookSecret,
      undefined,
      Stripe.createSubtleCryptoProvider()
    );
  } catch (err: any) {
    console.error('[webhook] firma inválida', err?.message);
    return new Response(`Webhook Error: ${err.message}`, { status: 400 });
  }

  try {
    switch (event.type) {
      case 'payment_intent.succeeded': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const reservationId = await resolveReservationId(pi);
        await supabaseAdmin
          .from('payments')
          .update({ status: 'succeeded' })
          .eq('stripe_intent_id', pi.id);

        if (reservationId) {
          await supabaseAdmin
            .from('reservations')
            .update({ status: 'confirmed' })
            .eq('id', reservationId);
          await grantAccess(reservationId);
        }
        break;
      }

      case 'payment_intent.amount_capturable_updated': {
        // Pre-auth confirmada: fondos retenidos, esperar para capturar
        const pi = event.data.object as Stripe.PaymentIntent;
        const reservationId = await resolveReservationId(pi);
        if (reservationId) {
          await supabaseAdmin
            .from('reservations')
            .update({ status: 'confirmed' })
            .eq('id', reservationId);
          await grantAccess(reservationId);
        }
        await supabaseAdmin
          .from('payments')
          .update({ status: 'authorized' })
          .eq('stripe_intent_id', pi.id);
        break;
      }

      case 'charge.captured': {
        const charge = event.data.object as Stripe.Charge;
        await supabaseAdmin
          .from('payments')
          .update({ status: 'captured' })
          .eq('stripe_intent_id', charge.payment_intent as string);
        break;
      }

      case 'payment_intent.payment_failed': {
        const pi = event.data.object as Stripe.PaymentIntent;
        await supabaseAdmin
          .from('payments')
          .update({ status: 'failed' })
          .eq('stripe_intent_id', pi.id);
        break;
      }

      case 'payment_intent.canceled': {
        const pi = event.data.object as Stripe.PaymentIntent;
        const reservationId = await resolveReservationId(pi);
        await supabaseAdmin
          .from('payments')
          .update({ status: 'canceled' })
          .eq('stripe_intent_id', pi.id);
        if (reservationId) {
          await supabaseAdmin
            .from('reservations')
            .update({ status: 'cancelled' })
            .eq('id', reservationId);
        }
        break;
      }

      default:
        console.log(`[webhook] Evento no manejado: ${event.type}`);
    }

    return new Response(JSON.stringify({ received: true }), {
      status: 200,
      headers: { 'Content-Type': 'application/json' },
    });
  } catch (e: any) {
    console.error('[webhook] error procesando', e);
    return new Response(JSON.stringify({ error: e.message }), { status: 500 });
  }
});
