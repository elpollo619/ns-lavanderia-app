import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/types/design';
import { Card } from './Card';
import { formatDateDE, formatTimeDE, addMinutes } from '@/utils/calendar';
import type { DurationMinutes, Machine } from '@/types/database';
import { PRICE_BY_DURATION_CHF } from '@/types/database';

interface ReservationSummaryProps {
  machine: Machine;
  startTime: Date;
  duration: DurationMinutes;
}

/**
 * Resumen final antes de pagar:
 * - Máquina (nombre + tipo)
 * - Fecha
 * - Hora de inicio - fin
 * - Duración
 * - Precio total en CHF
 *
 * Diseñado para mostrarse junto al PaymentSheet de Stripe.
 */
export function ReservationSummary({ machine, startTime, duration }: ReservationSummaryProps) {
  const endTime = addMinutes(startTime, duration);
  const price = PRICE_BY_DURATION_CHF[duration];

  return (
    <Card style={styles.card}>
      <Text style={styles.title}>Buchungsübersicht</Text>

      <Row label="Maschine" value={machine.name} />
      <Row
        label="Typ"
        value={machine.machine_type === 'washer' ? 'Waschmaschine' : 'Trockner'}
      />
      <Row label="Datum" value={formatDateDE(startTime)} />
      <Row label="Zeit" value={`${formatTimeDE(startTime)} – ${formatTimeDE(endTime)}`} />
      <Row label="Dauer" value={`${duration} Min`} />

      <View style={styles.divider} />

      <View style={styles.totalRow}>
        <Text style={styles.totalLabel}>Gesamt</Text>
        <Text style={styles.totalValue}>CHF {price.toFixed(2)}</Text>
      </View>

      <Text style={styles.note}>
        Bei No-Show wird eine Gebühr von CHF 5.00 belastet.
      </Text>
    </Card>
  );
}

function Row({ label, value }: { label: string; value: string }) {
  return (
    <View style={styles.row}>
      <Text style={styles.rowLabel}>{label}</Text>
      <Text style={styles.rowValue}>{value}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  card: { gap: spacing.md },
  title: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginBottom: spacing.sm,
  },
  row: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: spacing.xs,
  },
  rowLabel: {
    fontSize: typography.fontSize.body,
    color: colors.textSecondary,
  },
  rowValue: {
    fontSize: typography.fontSize.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  divider: {
    height: 1,
    backgroundColor: colors.line,
    marginVertical: spacing.sm,
  },
  totalRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  totalLabel: {
    fontSize: typography.fontSize.bodyLarge,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
  },
  totalValue: {
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.accent,
  },
  note: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    marginTop: spacing.sm,
    fontStyle: 'italic',
  },
});
