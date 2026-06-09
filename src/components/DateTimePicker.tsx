import React, { useMemo } from 'react';
import { View, Text, Pressable, ScrollView, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/types/design';
import {
  formatDateDE,
  formatTimeDE,
  generateTimeSlots,
  nextDays,
  isPast,
  addMinutes,
} from '@/utils/calendar';
import type { DurationMinutes, Reservation } from '@/types/database';
import { overlaps } from '@/api/reservations';

interface DateTimePickerProps {
  selectedDate: Date | null;
  selectedTime: Date | null;
  selectedDuration: DurationMinutes;
  existingReservations: Reservation[]; // para deshabilitar slots ocupados
  onDateChange: (date: Date) => void;
  onTimeChange: (time: Date) => void;
  onDurationChange: (duration: DurationMinutes) => void;
}

const DURATIONS: Array<{ value: DurationMinutes; label: string }> = [
  { value: 30, label: '30 Min' },
  { value: 60, label: '1 Std' },
  { value: 120, label: '2 Std' },
];

/**
 * Date + Time + Duration picker.
 * - Días: horizontal scroll (próximos 14 días).
 * - Horas: horizontal scroll (06:00 - 22:00 cada 30 min).
 * - Duración: 3 chips (30 min, 1 h, 2 h).
 *
 * Validaciones:
 * - No permite slots en el pasado.
 * - Deshabilita slots que se solaparían con reservas existentes
 *   considerando la duración elegida.
 */
export function DateTimePicker({
  selectedDate,
  selectedTime,
  selectedDuration,
  existingReservations,
  onDateChange,
  onTimeChange,
  onDurationChange,
}: DateTimePickerProps) {
  const days = useMemo(() => nextDays(14), []);
  const slots = useMemo(
    () => (selectedDate ? generateTimeSlots(selectedDate) : []),
    [selectedDate],
  );

  const isSlotBlocked = (slot: Date): boolean => {
    if (isPast(slot)) return true;
    const end = addMinutes(slot, selectedDuration);
    return existingReservations.some((r) =>
      overlaps(slot, end, new Date(r.start_time), new Date(r.end_time)),
    );
  };

  return (
    <ScrollView contentContainerStyle={styles.container} showsVerticalScrollIndicator={false}>
      {/* Día */}
      <Text style={styles.sectionLabel}>Datum</Text>
      <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
        {days.map((day) => {
          const selected = selectedDate?.toDateString() === day.toDateString();
          return (
            <Pressable
              key={day.toISOString()}
              onPress={() => onDateChange(day)}
              style={[styles.dayChip, selected && styles.chipSelected]}
            >
              <Text style={[styles.dayChipLabel, selected && styles.chipSelectedText]}>
                {formatDateDE(day)}
              </Text>
            </Pressable>
          );
        })}
      </ScrollView>

      {/* Duración */}
      <Text style={styles.sectionLabel}>Dauer</Text>
      <View style={styles.row}>
        {DURATIONS.map((d) => {
          const selected = selectedDuration === d.value;
          return (
            <Pressable
              key={d.value}
              onPress={() => onDurationChange(d.value)}
              style={[styles.durationChip, selected && styles.chipSelected]}
            >
              <Text style={[styles.durationLabel, selected && styles.chipSelectedText]}>
                {d.label}
              </Text>
            </Pressable>
          );
        })}
      </View>

      {/* Hora */}
      {selectedDate && (
        <>
          <Text style={styles.sectionLabel}>Uhrzeit</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.row}>
            {slots.map((slot) => {
              const blocked = isSlotBlocked(slot);
              const selected = selectedTime?.getTime() === slot.getTime();
              return (
                <Pressable
                  key={slot.toISOString()}
                  onPress={() => !blocked && onTimeChange(slot)}
                  disabled={blocked}
                  style={[
                    styles.timeChip,
                    selected && styles.chipSelected,
                    blocked && styles.chipBlocked,
                  ]}
                >
                  <Text
                    style={[
                      styles.timeLabel,
                      selected && styles.chipSelectedText,
                      blocked && styles.timeLabelBlocked,
                    ]}
                  >
                    {formatTimeDE(slot)}
                  </Text>
                </Pressable>
              );
            })}
          </ScrollView>
        </>
      )}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: { paddingVertical: spacing.base, gap: spacing.base },
  sectionLabel: {
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.primary,
    textTransform: 'uppercase',
    letterSpacing: 1,
    marginTop: spacing.base,
    marginBottom: spacing.sm,
  },
  row: { flexDirection: 'row', gap: spacing.sm, paddingRight: spacing.base },
  dayChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
  },
  dayChipLabel: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  durationChip: {
    flex: 1,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    alignItems: 'center',
  },
  durationLabel: {
    fontSize: typography.fontSize.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  timeChip: {
    paddingHorizontal: spacing.base,
    paddingVertical: spacing.md,
    borderRadius: borderRadius.md,
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.line,
    minWidth: 72,
    alignItems: 'center',
  },
  timeLabel: {
    fontSize: typography.fontSize.body,
    color: colors.primary,
    fontWeight: typography.fontWeight.semibold,
  },
  timeLabelBlocked: { color: colors.muted, textDecorationLine: 'line-through' },
  chipSelected: { backgroundColor: colors.accent, borderColor: colors.accent },
  chipSelectedText: { color: colors.white },
  chipBlocked: { backgroundColor: colors.bgCanvas, opacity: 0.6 },
});
