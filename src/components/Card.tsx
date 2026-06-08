import React from 'react';
import { View, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, borderRadius, shadows } from '@/types/design';

interface CardProps {
  children: React.ReactNode;
  style?: ViewStyle;
}

/**
 * Card component — Clean white card with subtle shadow
 * Diseño N's Hotel: blanco, sombra sutil, bordes redondeados
 */
export function Card({ children, style }: CardProps) {
  return (
    <View style={[styles.card, style]}>
      {children}
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    padding: spacing.xl,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.04,
    shadowRadius: 12,
    elevation: 4,
  },
});
