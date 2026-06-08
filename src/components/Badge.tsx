import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/types/design';

interface BadgeProps {
  label: string;
  variant?: 'primary' | 'accent' | 'muted';
}

/**
 * Pill badge for categorization and labels
 * Uses N's Hotel design system (dunkelblau + hellblau)
 */
export function Badge({ label, variant = 'accent' }: BadgeProps) {
  return (
    <View style={[styles.base, styles[variant]]}>
      <Text style={[styles.text, styles[`${variant}Text`]]}>{label}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.xs,
    borderRadius: borderRadius.pill,
    alignSelf: 'flex-start',
  },
  primary: {
    backgroundColor: 'rgba(42, 51, 80, 0.12)',
  },
  accent: {
    backgroundColor: 'rgba(1, 177, 226, 0.12)',
  },
  muted: {
    backgroundColor: 'rgba(139, 143, 153, 0.12)',
  },
  text: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: typography.fontSize.caption * 0.06,
  },
  primaryText: {
    color: colors.primary,
  },
  accentText: {
    color: colors.accent,
  },
  mutedText: {
    color: colors.muted,
  },
});
