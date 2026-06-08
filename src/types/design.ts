/**
 * Design System Types — N's Hotel Brand Identity
 * Paleta azul: dunkelblau (#2a3350) + hellblau (#01b1e2)
 * Tipografía: Inter (sans-serif)
 * Aplicado a N's Lavandería app móvil
 */

export const colors = {
  // Primary — Dunkelblau (azul oscuro muy profundo)
  primary: '#2a3350',
  primaryHover: '#1f2740',
  primaryLight: '#4a5168', // dunkelblau-75 para texto secundario
  primarySubtle: 'rgba(42, 51, 80, 0.15)', // bordes
  primaryVerySubtle: 'rgba(42, 51, 80, 0.08)', // rings sutiles

  // Secondary — Hellblau (azul claro/cian)
  accent: '#01b1e2',
  accentHover: '#039fcc',
  accentSoft: '#E6F7FD',

  // Backgrounds
  bg: '#FFFFFF',
  bgCanvas: '#F4F8FC',
  surface: '#FFFFFF',

  // Text
  text: '#2a3350', // dunkelblau
  textSecondary: '#4a5168', // dunkelblau-75
  muted: '#8b8f99', // dunkelblau-50
  line: 'rgba(42, 51, 80, 0.15)',

  // Utilities
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Status
  success: '#01b1e2',
  error: '#2a3350',
  warning: '#01b1e2',
} as const;

export const typography = {
  fontFamily: {
    display: '"Inter", "-apple-system", "system-ui", sans-serif',
    system: '"Inter", "-apple-system", "system-ui", sans-serif',
    fallback: 'system-ui, -apple-system, sans-serif',
  },
  fontSize: {
    // Display (Inter Bold)
    h1: 56,
    h2: 42,
    h3: 28,
    h4: 20,

    // Body (Inter Regular)
    body: 16,
    bodyLarge: 17,
    bodySmall: 14,

    // Caption & Labels
    caption: 13,
    labelSmall: 12,
  },
  fontWeight: {
    // Inter weights
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 1.05,
    snug: 1.1,
    normal: 1.15,
    relaxed: 1.2,
    loose: 1.7,
  },
  letterSpacing: {
    tight: -0.02,
    normal: 0,
    wide: 0.08,
    wider: 0.12,
  },
} as const;

export const spacing = {
  // Base 8px system
  xs: 4,
  sm: 8,
  md: 12,
  base: 16,
  lg: 20,
  xl: 24,
  '2xl': 32,
  '3xl': 40,
  '4xl': 48,
} as const;

export const borderRadius = {
  pill: 999,
  lg: 16,      // Cards, buttons
  md: 12,      // Inputs
  sm: 8,       // Small elements
  xs: 4,
} as const;

export const shadows = {
  sm: '0 1px 2px rgba(42, 51, 80, 0.04), 0 4px 12px rgba(42, 51, 80, 0.04)',
  base: '0 4px 12px rgba(42, 51, 80, 0.10)',
  md: '0 8px 28px rgba(42, 51, 80, 0.10)',
  lg: '0 20px 60px rgba(42, 51, 80, 0.12)',
} as const;
