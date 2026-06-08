import React from 'react';
import { Text, TextProps, StyleSheet } from 'react-native';
import { colors, typography, spacing } from '@/types/design';

// H1 — Título de héroe
export function H1(props: TextProps) {
  return <Text {...props} style={[styles.h1, props.style]} />;
}

// H2 — Título de sección
export function H2(props: TextProps) {
  return <Text {...props} style={[styles.h2, props.style]} />;
}

// H3 — Título de card/subsección
export function H3(props: TextProps) {
  return <Text {...props} style={[styles.h3, props.style]} />;
}

// H4 — Título de elemento/label
export function H4(props: TextProps) {
  return <Text {...props} style={[styles.h4, props.style]} />;
}

// Body — Texto de cuerpo
export function Body(props: TextProps) {
  return <Text {...props} style={[styles.body, props.style]} />;
}

// BodySmall — Texto pequeño
export function BodySmall(props: TextProps) {
  return <Text {...props} style={[styles.bodySmall, props.style]} />;
}

// Caption — Label pequeño
export function Caption(props: TextProps) {
  return <Text {...props} style={[styles.caption, props.style]} />;
}

// Eyebrow — Kicker en uppercase
export function Eyebrow(props: TextProps) {
  return <Text {...props} style={[styles.eyebrow, props.style]} />;
}

// Muted — Texto de apoyo
export function Muted(props: TextProps) {
  return <Text {...props} style={[styles.muted, props.style]} />;
}

const styles = StyleSheet.create({
  h1: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.h1,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    lineHeight: typography.fontSize.h1 * typography.lineHeight.tight,
    marginBottom: spacing.xl,
  },
  h2: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.h2,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    lineHeight: typography.fontSize.h2 * typography.lineHeight.snug,
    marginBottom: spacing.lg,
  },
  h3: {
    fontFamily: typography.fontFamily.display,
    fontSize: typography.fontSize.h3,
    fontWeight: typography.fontWeight.semibold,
    color: colors.text,
    lineHeight: typography.fontSize.h3 * typography.lineHeight.normal,
    marginBottom: spacing.md,
  },
  h4: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.h4,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.text,
    lineHeight: typography.fontSize.h4 * typography.lineHeight.normal,
    marginBottom: spacing.sm,
  },
  body: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    color: colors.muted,
    lineHeight: typography.fontSize.body * typography.lineHeight.loose,
  },
  bodySmall: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.bodySmall,
    fontWeight: typography.fontWeight.regular,
    color: colors.muted,
    lineHeight: typography.fontSize.bodySmall * typography.lineHeight.relaxed,
  },
  caption: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.muted,
    lineHeight: typography.fontSize.caption * typography.lineHeight.relaxed,
    textTransform: 'uppercase',
    letterSpacing: typography.fontSize.caption * typography.letterSpacing.wide,
  },
  eyebrow: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.caption,
    fontWeight: typography.fontWeight.extrabold,
    color: colors.accent,
    letterSpacing: typography.fontSize.caption * typography.letterSpacing.wide,
    textTransform: 'uppercase',
    marginBottom: spacing.md,
  },
  muted: {
    fontFamily: typography.fontFamily.system,
    fontSize: typography.fontSize.body,
    fontWeight: typography.fontWeight.regular,
    color: colors.muted,
    lineHeight: typography.fontSize.body * typography.lineHeight.loose,
  },
});
