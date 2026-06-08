import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { colors, spacing, typography, borderRadius } from '@/types/design';

interface FeatureCardDualProps {
  icon: string;
  number: string;
  title: string;
  description: string;
}

export function FeatureCardDual({ icon, number, title, description }: FeatureCardDualProps) {
  return (
    <View style={styles.container}>
      {/* TOP: Dunkelblau section */}
      <View style={styles.topSection}>
        {/* Number (top-left) */}
        <View style={styles.numberContainer}>
          <Text style={styles.numberText}>{number}</Text>
        </View>

        {/* Icon (centered) */}
        <Text style={styles.icon}>{icon}</Text>

        {/* Dot (top-right) */}
        <View style={styles.dot} />
      </View>

      {/* BOTTOM: White section */}
      <View style={styles.bottomSection}>
        <Text style={styles.title}>{title}</Text>
        <Text style={styles.description}>{description}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    backgroundColor: colors.white,
    borderRadius: borderRadius.lg,
    overflow: 'hidden',
    // Shadow for iOS
    shadowColor: colors.primary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 8,
    // Elevation for Android
    elevation: 2,
  },

  topSection: {
    backgroundColor: colors.primary,
    height: 128,
    justifyContent: 'center',
    alignItems: 'center',
    position: 'relative',
  },

  numberContainer: {
    position: 'absolute',
    left: spacing.base,
    top: spacing.sm,
  },

  numberText: {
    fontSize: 10,
    fontWeight: typography.fontWeight.bold,
    color: colors.white,
    opacity: 0.4,
    letterSpacing: 1.2,
  },

  icon: {
    fontSize: 56,
    textAlign: 'center',
  },

  dot: {
    position: 'absolute',
    right: spacing.base,
    top: spacing.sm,
    width: 4,
    height: 4,
    borderRadius: 2,
    backgroundColor: colors.accent,
  },

  bottomSection: {
    padding: spacing.lg,
    paddingVertical: spacing.lg,
  },

  title: {
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    color: colors.text,
    marginBottom: spacing.xs,
    fontFamily: typography.fontFamily.system,
  },

  description: {
    fontSize: typography.fontSize.bodySmall,
    color: colors.textSecondary,
    lineHeight: 22,
    fontFamily: typography.fontFamily.system,
  },
});
