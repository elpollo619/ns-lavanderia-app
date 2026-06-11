/**
 * Stub WEB del pago online — @stripe/stripe-react-native no soporta web.
 * El flujo online solo está disponible en la app nativa; en web se ofrece
 * "Vor Ort bezahlen".
 */
export const STRIPE_PUBLISHABLE_KEY = '';

export function stripeConfigured(): boolean {
  return false;
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

export async function payOnline(_input: OnlinePaymentInput): Promise<OnlinePaymentResult> {
  return {
    status: 'error',
    message: 'Online-Zahlung ist nur in der App verfügbar. Bitte „Vor Ort bezahlen“ wählen.',
  };
}
