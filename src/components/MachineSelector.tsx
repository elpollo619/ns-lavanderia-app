import React from 'react';
import { View, Text, Pressable, StyleSheet, ScrollView, ActivityIndicator } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/types/design';
import { Badge } from './Badge';
import type { Machine } from '@/types/database';

interface MachineSelectorProps {
  machines: Machine[];
  selectedId: string | null;
  onSelect: (machine: Machine) => void;
  loading?: boolean;
}

/**
 * Grid 2 columnas de máquinas. Estilo "FeatureCardDual-like":
 * card blanca con borde sutil, badge de estado y nombre destacado.
 * Máquinas no disponibles se muestran deshabilitadas.
 */
export function MachineSelector({
  machines,
  selectedId,
  onSelect,
  loading = false,
}: MachineSelectorProps) {
  if (loading) {
    return (
      <View style={styles.center}>
        <ActivityIndicator size="large" color={colors.accent} />
      </View>
    );
  }

  return (
    <ScrollView contentContainerStyle={styles.grid} showsVerticalScrollIndicator={false}>
      {machines.map((machine) => {
        const isSelected = selectedId === machine.id;
        const isAvailable = machine.status === 'available';
        const disabled = !isAvailable;

        return (
          <Pressable
            key={machine.id}
            onPress={() => !disabled && onSelect(machine)}
            disabled={disabled}
            style={({ pressed }) => [
              styles.card,
              isSelected && styles.cardSelected,
              disabled && styles.cardDisabled,
              pressed && !disabled && styles.cardPressed,
            ]}
          >
            <Badge
              label={isAvailable ? 'VERFÜGBAR' : machine.status === 'in_use' ? 'BESETZT' : 'WARTUNG'}
              variant={isAvailable ? 'accent' : 'muted'}
            />
            <Text style={styles.name}>{machine.name}</Text>
            <Text style={styles.type}>
              {machine.machine_type === 'washer' ? 'Waschmaschine' : 'Trockner'}
            </Text>
            {machine.location && <Text style={styles.location}>{machine.location}</Text>}
          </Pressable>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  center: { flex: 1, justifyContent: 'center', alignItems: 'center', padding: spacing.xl },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between',
    gap: spacing.base,
    paddingVertical: spacing.base,
  },
  card: {
    width: '48%',
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.lg,
    borderWidth: 2,
    borderColor: colors.primaryVerySubtle,
    minHeight: 140,
    justifyContent: 'space-between',
  },
  cardSelected: {
    borderColor: colors.accent,
    backgroundColor: colors.accentSoft,
  },
  cardDisabled: { opacity: 0.45 },
  cardPressed: { transform: [{ scale: 0.98 }] },
  name: {
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.bold,
    color: colors.primary,
    marginTop: spacing.sm,
  },
  type: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    marginTop: spacing.xs,
  },
  location: {
    fontSize: typography.fontSize.caption,
    color: colors.muted,
    marginTop: spacing.xs,
  },
});
