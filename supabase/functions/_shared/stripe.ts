// Cliente Stripe compartido (Deno runtime)
import Stripe from "https://esm.sh/stripe@14?target=deno";

export const stripe = new Stripe(Deno.env.get("STRIPE_SECRET_KEY")!, {
  apiVersion: "2024-06-20",
  httpClient: Stripe.createFetchHttpClient(),
});

/**
 * Calcula la capture window según el método de pago.
 * - TWINT: 7 días máximo
 * - Tarjeta (incl. Apple/Google Pay): hasta 30 días con extended auth
 */
export function captureWindowDays(method: string | null): number {
  if (method === "twint") return 7;
  return 30;
}
