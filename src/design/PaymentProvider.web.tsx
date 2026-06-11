/**
 * Passthrough WEB — @stripe/stripe-react-native no soporta web.
 */
import React from 'react';

export function PaymentProvider({ children }: { children: React.ReactElement }) {
  return children;
}
