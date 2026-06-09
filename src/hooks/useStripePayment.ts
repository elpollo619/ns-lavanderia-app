/**
 * useStripePayment - Hook para integrar Stripe PaymentSheet con TWINT, Apple Pay, Google Pay y tarjeta.
 *
 * Flujo:
 *  1. createIntent(reservationId, amountChf) -> llama Edge Function `payment-create-intent`
 *  2. initPaymentSheet(clientSecret) -> inicializa SDK
 *  3. presentPaymentSheet() -> muestra modal nativo
 *  4. Retorna {success, error, canceled}
 *
 * NOTA: Apple Pay / Google Pay requieren development build (no funcionan en Expo Go).
 */
import { useState, useCallback } from 'react';
import { useStripe } from '@stripe/stripe-react-native';
import { supabase } from '../lib/supabase';

export type PaymentResult =
  | { status: 'success'; paymentIntentId: string }
  | { status: 'canceled' }
  | { status: 'error'; message: string };

interface CreateIntentResponse {
  client_secret: string;
  payment_intent_id: string;
}

export function useStripePayment() {
  const { initPaymentSheet, presentPaymentSheet } = useStripe();
  const [loading, setLoading] = useState(false);

  /**
   * Crea PaymentIntent en backend (capture_method=manual para pre-auth).
   */
  const createIntent = useCallback(
    async (reservationId: string, amountChf: number, userId: string): Promise<CreateIntentResponse> => {
      const { data, error } = await supabase.functions.invoke<CreateIntentResponse>(
        'payment-create-intent',
        {
          body: {
            reservation_id: reservationId,
            amount_chf: amountChf,
            user_id: userId,
          },
        }
      );
      if (error || !data) {
        throw new Error(error?.message ?? 'No se pudo crear el PaymentIntent');
      }
      return data;
    },
    []
  );

  /**
   * Flujo completo: crea intent + inicializa + presenta PaymentSheet.
   */
  const payReservation = useCallback(
    async (params: {
      reservationId: string;
      amountChf: number;
      userId: string;
      customerEmail?: string;
    }): Promise<PaymentResult> => {
      setLoading(true);
      try {
        // 1. Crear PaymentIntent
        const { client_secret, payment_intent_id } = await createIntent(
          params.reservationId,
          params.amountChf,
          params.userId
        );

        // 2. Inicializar PaymentSheet
        const initRes = await initPaymentSheet({
          merchantDisplayName: "N's Lavandería",
          paymentIntentClientSecret: client_secret,
          // TWINT requiere CHF como currency en el PaymentIntent (backend)
          // Apple Pay / Google Pay aparecen automáticamente si están configurados
          applePay: { merchantCountryCode: 'CH' },
          googlePay: {
            merchantCountryCode: 'CH',
            currencyCode: 'CHF',
            testEnv: __DEV__,
          },
          defaultBillingDetails: params.customerEmail
            ? { email: params.customerEmail }
            : undefined,
          allowsDelayedPaymentMethods: false,
          returnURL: 'nslavanderia://stripe-redirect',
        });

        if (initRes.error) {
          return { status: 'error', message: initRes.error.message };
        }

        // 3. Presentar PaymentSheet
        const presentRes = await presentPaymentSheet();

        if (presentRes.error) {
          if (presentRes.error.code === 'Canceled') {
            return { status: 'canceled' };
          }
          return { status: 'error', message: presentRes.error.message };
        }

        return { status: 'success', paymentIntentId: payment_intent_id };
      } catch (e: any) {
        return { status: 'error', message: e?.message ?? 'Error desconocido' };
      } finally {
        setLoading(false);
      }
    },
    [createIntent, initPaymentSheet, presentPaymentSheet]
  );

  return { payReservation, createIntent, loading };
}
