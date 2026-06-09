// Edge Function: payment-create-intent
// POST { reservation_id, amount_chf, user_id }
// Crea un PaymentIntent en Stripe con capture_method=manual (pre-auth).
// Habilita TWINT, tarjeta, Apple Pay y Google Pay (configurar Apple/Google en dashboard).
// Devuelve { client_secret, payment_intent_id } para el cliente.
//
// ENV requeridas:
//   STRIPE_SECRET_KEY            (sk_live_... o sk_test_...)
//   SUPABASE_URL
//   SUPABASE_SERVICE_ROLE_KEY    (para insertar en payments con bypass de RLS)

import { serve } from 'https://deno.land/std@0.224.0/http/server.ts';
import Stripe from 'https://esm.sh/stripe@14.21.0?target=deno';
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2.39.0';
import { corsHeaders } from '../_shared/cors.ts';

const stripe = new Stripe(Deno.env.get('STRIPE_SECRET_KEY')!, {
  apiVersion: '2024-06-20',
  httpClient: Stripe.createFetchHttpClient(),
});

const supabaseAdmin = createClient(
  Deno.env.get('SUPABASE_URL')!,
  Deno.env.get('SUPABASE_SERVICE_ROLE_KEY')!
);

interface Body {
  reservation_id: string;
  amount_chf: number; // en CHF (ej. 8.50)
  user_id: string;
}

serve(async (req) => {
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  try {
    // Validar JWT del cliente (Supabase ya verifica si verify_jwt=true en config)
    const authHeader = req.headers.get('Authorization');
    if (!authHeader) {
      return new Response(JSON.stringify({ error: 'No autorizado' }), {
        status: 401,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    const body: Body = await req.json();
    const { reservation_id, amount_chf, user_id } = body;

    if (!reservation_id || !amount_chf || !user_id) {
      return new Response(
        JSON.stringify({ error: 'Faltan parámetros: reservation_id, amount_chf, user_id' }),
        { status: 400, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
      );
    }

    if (amount_chf < 0.5) {
      return new Response(JSON.stringify({ error: 'Monto mínimo CHF 0.50' }), {
        status: 400,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Verificar que la reserva existe y pertenece al usuario
    const { data: reservation, error: resErr } = await supabaseAdmin
      .from('reservations')
      .select('id, user_id, status, payment_intent_id')
      .eq('id', reservation_id)
      .eq('user_id', user_id)
      .single();

    if (resErr || !reservation) {
      return new Response(JSON.stringify({ error: 'Reserva no encontrada' }), {
        status: 404,
        headers: { ...corsHeaders, 'Content-Type': 'application/json' },
      });
    }

    // Si ya existe intent y está en estado válido, reutilizar
    if (reservation.payment_intent_id) {
      const existing = await stripe.paymentIntents.retrieve(reservation.payment_intent_id);
      if (['requires_payment_method', 'requires_confirmation', 'requires_action'].includes(existing.status)) {
        return new Response(
          JSON.stringify({
            client_secret: existing.client_secret,
            payment_intent_id: existing.id,
          }),
          { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
        );
      }
    }

    const amountCents = Math.round(amount_chf * 100);

    // Crear PaymentIntent con manual capture (pre-auth)
    const intent = await stripe.paymentIntents.create({
      amount: amountCents,
      currency: 'chf',
      capture_method: 'manual', // pre-auth: hold de fondos, captura diferida
      payment_method_types: ['card', 'twint'], // Apple/Google Pay van vía 'card'
      metadata: {
        reservation_id,
        user_id,
      },
      description: `Reserva ${reservation_id} - N's Lavandería`,
    });

    // Registrar en tabla payments
    await supabaseAdmin.from('payments').insert({
      reservation_id,
      stripe_intent_id: intent.id,
      amount_cents: amountCents,
      currency: 'chf',
      status: 'pending',
      type: 'reservation',
    });

    // Vincular intent_id a la reserva
    await supabaseAdmin
      .from('reservations')
      .update({ payment_intent_id: intent.id })
      .eq('id', reservation_id);

    return new Response(
      JSON.stringify({
        client_secret: intent.client_secret,
        payment_intent_id: intent.id,
      }),
      { status: 200, headers: { ...corsHeaders, 'Content-Type': 'application/json' } }
    );
  } catch (e: any) {
    console.error('[payment-create-intent] error', e);
    return new Response(JSON.stringify({ error: e?.message ?? 'Error interno' }), {
      status: 500,
      headers: { ...corsHeaders, 'Content-Type': 'application/json' },
    });
  }
});
