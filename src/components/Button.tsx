import React from 'react';
import { Pressable, Text, StyleSheet, ViewStyle, TextStyle } from 'react-native';
import { colors, spacing, typography } from '@/types/design';

interface ButtonProps {
  children: string;
  onPress: () => void;
  variant?: 'primary' | 'secondary';
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
        variant === 'primary' ? styles.primary : styles.secondary,
        pressed && !disabled && (variant === 'primary' ? styles.primaryPressed : styles.secondaryPressed),
        disabled && styles.disabled,
        style,
      ]}
    >
      <Text style={[styles.text, variant === 'primary' ? styles.primaryText : styles.secondaryText]}>
        {children}
      </Text>
    </Pressable>
  );
}

const styles = StyleSheet.create({
  base: {
    minHeight: 48,
    paddingHorizontal: spacing.lg,
    paddingVertical: spacing.sm,
    borderRadius: spacing.pill,
    justifyContent: 'center',
    alignItems: 'center',
  },
  primary: {
    backgroundColor: colors.accent,
  },
  primaryPressed: {
    backgroundColor: colors.accentDeep,
  },
  secondary: {
    backgroundColor: colors.bgSoft,
    borderWidth: 1,
    borderColor: colors.line,
  },
  secondaryPressed: {
    backgroundColor: colors.bg,
  },
  disabled: {
    opacity: 0.5,
  },
  text: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.bold,
  },
  primaryText: {
    color: '#FFF7F1',
  },
  secondaryText: {
    color: colors.text,
  },
});
