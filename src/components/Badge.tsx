import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, borderRadius, typography } from '@/types/design';

interface BadgeProps {
  label: string;
  variant?: 'forest' | 'accent' | 'muted';
}

/**
 * Pill badge for categorization and labels
 * Forest green (secondary) is the default style following MÉRITO brand guidelines
 */
export function Badge({ label, variant = 'forest' }: BadgeProps) {
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
  forest: {
    backgroundColor: `rgba(77, 103, 88, 0.12)`,
  },
  accent: {
    backgroundColor: `rgba(163, 72, 47, 0.12)`,
  },
  muted: {
    backgroundColor: `rgba(97, 88, 79, 0.12)`,
  },
  text: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.extrabold,
    textTransform: 'uppercase',
    letterSpacing: typography.fontSize.caption * 0.06,
  },
  forestText: {
    color: colors.forest,
  },
  accentText: {
    color: colors.accent,
  },
  mutedText: {
    color: colors.muted,
  },
});
