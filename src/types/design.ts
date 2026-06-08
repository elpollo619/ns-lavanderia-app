/**
 * Design System Types — MÉRITO Brand Identity
 * Paleta, tipografía y componentes para N's Lavandería
 */

export const colors = {
  // Primary — Terracota
  accent: '#A3482F',
  accentDeep: '#7E341F',
  accentSoft: '#D9A17F',

  // Secondary — Forest Green (Suiza)
  forest: '#4D6758',

  // Backgrounds
  bg: '#F6EFE4',
  bgSoft: '#EFE4D5',
  surface: 'rgba(255, 252, 247, 0.78)',
  surfaceStrong: '#FFFAF4',

  // Text
  text: '#1D1C1A',
  muted: '#61584F',
  line: 'rgba(29, 28, 26, 0.10)',

  // Utilities
  white: '#FFFFFF',
  black: '#000000',
  transparent: 'transparent',

  // Status (opcional)
  success: '#4D6758',
  error: '#A3482F',
  warning: '#D9A17F',
} as const;

export const typography = {
  fontFamily: {
    display: '"Cormorant Garamond", serif',
    system: '"Manrope", sans-serif',
    fallback: 'system-ui, -apple-system, sans-serif',
  },
  fontSize: {
    // Display (Cormorant)
    h1: 48,
    h2: 35,
    h3: 20,
    h4: 17,

    // Body (Manrope)
    body: 16,
    bodyLarge: 17,
    bodySmall: 14,

    // Caption & Labels
    caption: 12,
    labelSmall: 11,
  },
  fontWeight: {
    // Cormorant Garamond
    displayMedium: '500',
    displaySemibold: '600',
    displayBold: '700',

    // Manrope
    regular: '400',
    medium: '500',
    semibold: '600',
    bold: '700',
    extrabold: '800',
  },
  lineHeight: {
    tight: 0.94,     // H1
    snug: 0.98,      // H2
    normal: 1.1,     // H3, H4
    relaxed: 1.2,    // Label
    loose: 1.7,      // Body
  },
  letterSpacing: {
    tight: -0.04,
    normal: 0,
    wide: 0.20,
    wider: 0.06,
  },
} as const;

export const spacing = {
  // Base 8px system
  xs: 4,       // 0.25rem
  sm: 8,       // 0.5rem
  md: 12,      // 0.75rem
  base: 16,    // 1rem
  lg: 20,      // 1.25rem
  xl: 24,      // 1.5rem
  '2xl': 32,   // 2rem
  '3xl': 40,   // 2.5rem
  '4xl': 48,   // 3rem
} as const;

export const borderRadius = {
  pill: 999,
  lg: 22,      // Cards
  md: 16,      // Inputs
  sm: 12,      // Small elements
  xs: 8,
} as const;

export const shadows = {
  sm: '0 2px 4px rgba(76, 52, 34, 0.08)',
  base: '0 4px 12px rgba(76, 52, 34, 0.10)',
  md: '0 12px 24px rgba(126, 52, 31, 0.25)',
  lg: '0 20px 60px rgba(76, 52, 34, 0.12)',
} as const;
