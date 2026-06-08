import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/types/design';

interface CardProps {
  children: React.ReactNode;
  variant?: 'default' | 'solid';
  style?: ViewStyle;
}

/**
 * Card component with glassmorphism effect and terracota→forest gradient top accent
 */
export function Card({ children, variant = 'default', style }: CardProps) {
  return (
    <View
      style={[
        styles.base,
        variant === 'default' ? styles.default : styles.solid,
        style,
      ]}
    >
      {/* Top accent line (gradient terracota → forest) */}
      <View style={styles.accentLine} />
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.xl,
  },
  default: {
    backgroundColor: colors.surface,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.55)',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 20 },
    shadowOpacity: 0.12,
    shadowRadius: 60,
    elevation: 12,
  },
  solid: {
    backgroundColor: colors.surfaceStrong,
  },
  accentLine: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 4,
    background: `linear-gradient(90deg, ${colors.accent} 0%, ${colors.forest} 100%)`,
  },
});
