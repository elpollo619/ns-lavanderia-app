import React, { useState } from 'react';
import { View, Text, StyleSheet, Alert, ScrollView } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { colors, spacing, typography } from '@/types/design';
import {
  Button,
  MachineSelector,
  DateTimePicker,
  ReservationSummary,
} from '@/components';
import { useAuth } from '@/contexts/AuthContext';
import { useReservationFlow } from '@/hooks/useReservationFlow';

/**
 * Pantalla de reservas — flujo de 3 pasos:
 *   1. Maschine wählen        (MachineSelector)
 *   2. Datum & Uhrzeit        (DateTimePicker)
 *   3. Übersicht & Bezahlung  (ReservationSummary + Stripe PaymentSheet)
 *
 * INTEGRACIÓN STRIPE (paso 3): cuando el usuario pulse "Buchen", se debe:
 *   a) llamar a `submitReservation()` para crear la reserva 'pending' en Supabase
 *   b) invocar Edge Function `/payment/create-intent` con el id de la reserva
 *      y el precio (CHF) para obtener un `client_secret`
 *   c) `initPaymentSheet({ paymentIntentClientSecret, merchantDisplayName: "N's Lavandería" })`
 *      desde `useStripe()` de @stripe/stripe-react-native
 *   d) `presentPaymentSheet()` — si succeeded → `confirmPayment(reservationId, paymentIntentId)`
 *
 * Marcado con TODO[STRIPE] abajo. Por ahora muestra un Alert simulando éxito.
 */
export default function ReservationsScreen() {
  const { user } = useAuth();
  const flow = useReservationFlow(user?.id ?? null);
  const [paying, setPaying] = useState(false);

  const handleBuchen = async () => {
    if (!flow.selectedMachine || !flow.selectedTime) return;
    setPaying(true);
    try {
      // 1. Crear reserva pending
      const reservation = await flow.submitReservation();

      // 2. TODO[STRIPE]: crear PaymentIntent via Edge Function
      //    const { clientSecret, paymentIntentId } = await fetch(
      //      `${SUPABASE_URL}/functions/v1/payment-create-intent`,
      //      { method: 'POST', body: JSON.stringify({ reservationId: reservation.id }) }
      //    ).then(r => r.json());

      // 3. TODO[STRIPE]: presentar PaymentSheet
      //    const { error: initErr } = await initPaymentSheet({
      //      paymentIntentClientSecret: clientSecret,
      //      merchantDisplayName: "N's Lavandería",
      //      applePay: { merchantCountryCode: 'CH' },
      //      googlePay: { merchantCountryCode: 'CH', currencyCode: 'chf', testEnv: __DEV__ },
      //    });
      //    if (initErr) throw initErr;
      //    const { error: payErr } = await presentPaymentSheet();
      //    if (payErr) throw payErr;

      // 4. Confirmar pago en backend (mock por ahora)
      const fakeIntentId = `pi_mock_${Date.now()}`;
      await flow.confirmPayment(reservation.id, fakeIntentId);

      Alert.alert('Buchung bestätigt', 'Deine Reservierung ist aktiv.', [
        { text: 'OK', onPress: () => flow.reset() },
      ]);
    } catch (e: any) {
      Alert.alert('Fehler', e?.message ?? 'Buchung fehlgeschlagen');
    } finally {
      setPaying(false);
    }
  };

  return (
    <SafeAreaView style={styles.root}>
      <View style={styles.header}>
        <Text style={styles.headerTitle}>
          {flow.step === 'machine' && 'Maschine wählen'}
          {flow.step === 'datetime' && 'Datum & Uhrzeit'}
          {flow.step === 'summary' && 'Übersicht'}
        </Text>
        <Text style={styles.stepIndicator}>
          Schritt {flow.step === 'machine' ? 1 : flow.step === 'datetime' ? 2 : 3} von 3
        </Text>
      </View>

      <View style={styles.content}>
        {flow.step === 'machine' && (
          <MachineSelector
            machines={flow.machines}
            selectedId={flow.selectedMachine?.id ?? null}
            onSelect={flow.selectMachine}
            loading={flow.loadingMachines}
          />
        )}

        {flow.step === 'datetime' && (
          <DateTimePicker
            selectedDate={flow.selectedDate}
            selectedTime={flow.selectedTime}
            selectedDuration={flow.selectedDuration}
            existingReservations={flow.existingReservations}
            onDateChange={flow.selectDate}
            onTimeChange={flow.selectTime}
            onDurationChange={flow.selectDuration}
          />
        )}

        {flow.step === 'summary' &&
          flow.selectedMachine &&
          flow.selectedTime && (
            <ScrollView contentContainerStyle={{ paddingVertical: spacing.base }}>
              <ReservationSummary
                machine={flow.selectedMachine}
                startTime={flow.selectedTime}
                duration={flow.selectedDuration}
              />
            </ScrollView>
          )}

        {flow.error && <Text style={styles.errorText}>{flow.error}</Text>}
      </View>

      {/* Footer con navegación */}
      <View style={styles.footer}>
        {flow.step !== 'machine' && (
          <Button
            variant="white"
            onPress={() =>
              flow.setStep(flow.step === 'summary' ? 'datetime' : 'machine')
            }
            style={styles.footerBtn}
          >
            Zurück
          </Button>
        )}

        {flow.step === 'machine' && (
          <Button
            variant="secondary"
            onPress={() => flow.setStep('datetime')}
            disabled={!flow.canGoToDateTime}
            style={styles.footerBtn}
          >
            Weiter
          </Button>
        )}

        {flow.step === 'datetime' && (
          <Button
            variant="secondary"
            onPress={() => flow.setStep('summary')}
            disabled={!flow.canGoToSummary}
            style={styles.footerBtn}
          >
            Weiter
          </Button>
        )}

        {flow.step === 'summary' && (
          <Button
            variant="secondary"
            onPress={handleBuchen}
            disabled={paying}
            style={styles.footerBtn}
          >
            {paying ? 'Wird gebucht…' : 'Buchen'}
          </Button>
        )}
      </View>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  root: { flex: 1, backgroundColor: colors.bgCanvas },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.lg,
  },
  headerTitle: {
    color: colors.white,
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.bold,
  },
  stepIndicator: {
    color: colors.accent,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.semibold,
    marginTop: spacing.xs,
    textTransform: 'uppercase',
    letterSpacing: 1,
  },
  content: { flex: 1, paddingHorizontal: spacing.base },
  footer: {
    flexDirection: 'row',
    gap: spacing.sm,
    padding: spacing.base,
    backgroundColor: colors.white,
    borderTopWidth: 1,
    borderTopColor: colors.line,
  },
  footerBtn: { flex: 1 },
  errorText: {
    color: colors.error,
    fontSize: typography.fontSize.bodySmall,
    marginTop: spacing.sm,
    textAlign: 'center',
  },
});
