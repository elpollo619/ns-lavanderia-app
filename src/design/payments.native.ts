/**
 * Pago online con Stripe PaymentSheet — implementación NATIVA (iOS/Android).
 * En web Metro resuelve payments.web.ts (stub), porque
 * @stripe/stripe-react-native no tiene soporte web.
 *
 * Flujo: reservations-create (Edge Function, precio server-side) →
 * initPaymentSheet → presentPaymentSheet → webhook confirma la reserva.
 */
import {
  initPaymentSheet,
  presentPaymentSheet,
} from '@stripe/stripe-react-native';
import { supabase } from '@/lib/supabase';

export const STRIPE_PUBLISHABLE_KEY = process.env.EXPO_PUBLIC_STRIPE_PUBLISHABLE_KEY ?? '';

/** True si hay una clave publishable real (no placeholder). */
export function stripeConfigured(): boolean {
  return /^pk_(test|live)_[A-Za-z0-9]{20,}$/.test(STRIPE_PUBLISHABLE_KEY);
}

export interface OnlinePaymentInput {
  machineId: string;
  start: Date;
  programId: string;
  extraIds: string[];
  email?: string;
}

export type OnlinePaymentResult =
  | { status: 'success'; reservationId: string }
  | { status: 'canceled'; reservationId: string }
  | { status: 'error'; message: string; reservationId?: string };

export async function payOnline(input: OnlinePaymentInput): Promise<OnlinePaymentResult> {
  // 1. Reserva + PaymentIntent (importe calculado en el servidor)
  const { data, error } = await supabase.functions.invoke('reservations-create', {
    body: {
      machine_id: input.machineId,
      start_time: input.start.toISOString(),
      program_id: input.programId,
      extra_ids: input.extraIds,
      payment_method: 'card',
    },
  });
  if (error || !data?.client_secret) {
    let message = error?.message ?? 'Buchung fehlgeschlagen.';
    try {
      const ctx = await (error as { context?: Response })?.context?.json();
      if (ctx?.error === 'Slot already reserved') {
        message = 'Dieser Zeitslot wurde gerade vergeben. Bitte wähle einen anderen.';
      } else if (ctx?.error) {
        message = ctx.error;
      }
    } catch {
      /* sin body */
    }
    return { status: 'error', message };
  }

  const reservationId = data.reservation_id as string;

  // 2. PaymentSheet
  const init = await initPaymentSheet({
    merchantDisplayName: "N's LAVANDERIA",
    paymentIntentClientSecret: data.client_secret,
    applePay: { merchantCountryCode: 'CH' },
    googlePay: { merchantCountryCode: 'CH', currencyCode: 'CHF', testEnv: __DEV__ },
    defaultBillingDetails: input.email ? { email: input.email } : undefined,
    allowsDelayedPaymentMethods: false,
    returnURL: 'nslavanderia://stripe-redirect',
  });
  if (init.error) {
    return { status: 'error', message: init.error.message, reservationId };
  }

  const present = await presentPaymentSheet();
  if (present.error) {
    if (present.error.code === 'Canceled') {
      return { status: 'canceled', reservationId };
    }
    return { status: 'error', message: present.error.message, reservationId };
  }

  return { status: 'success', reservationId };
}
