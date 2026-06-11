/**
 * StripeProvider — solo nativo. Si no hay clave publishable real,
 * es un passthrough (la app funciona sin Stripe configurado).
 */
import React from 'react';
import { StripeProvider } from '@stripe/stripe-react-native';
import { STRIPE_PUBLISHABLE_KEY, stripeConfigured } from './payments';

export function PaymentProvider({ children }: { children: React.ReactElement }) {
  if (!stripeConfigured()) {
    return children;
  }
  return (
    <StripeProvider
      publishableKey={STRIPE_PUBLISHABLE_KEY}
      merchantIdentifier="merchant.com.nslavanderia"
      urlScheme="nslavanderia"
    >
      {children}
    </StripeProvider>
  );
}
