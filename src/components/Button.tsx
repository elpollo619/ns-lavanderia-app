import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle } from 'react-native';
import { colors, spacing, typography, borderRadius, shadows } from '@/types/design';

interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary' | 'white';
  disabled?: boolean;
  style?: ViewStyle;
}

export function Button({
  children,
  onPress,
  variant = 'primary',
  disabled = false,
  style,
}: ButtonProps) {
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      style={({ pressed }) => [
        styles.base,
        variant === 'primary' && styles.primary,
        variant === 'secondary' && styles.secondary,
        variant === 'white' && styles.white,
        pressed && !disabled && styles.pressed,
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, variant === 'primary' || variant === 'secondary' ? styles.lightText : styles.darkText]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 56,
    paddingHorizontal: spacing.xl,
    paddingVertical: spacing.base,
    borderRadius: borderRadius.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.primary,
  },
  secondary: {
    backgroundColor: colors.accent,
  },
  white: {
    backgroundColor: colors.white,
    borderWidth: 1,
    borderColor: colors.primaryVerySubtle,
  },
  pressed: {
    opacity: 0.9,
    transform: [{ translateY: 1 }],
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
    letterSpacing: typography.letterSpacing.normal,
  },
  lightText: {
    color: colors.white,
  },
  darkText: {
    color: colors.text,
  },
});
