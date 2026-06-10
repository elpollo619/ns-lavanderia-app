/**
 * N's LAVANDERIA — Design Tokens + Theme (Hell / Dunkel)
 * Fuente de verdad: design_handoff_ns_laundry_app/README.md
 * Tokens del handoff — no inventar valores.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';

// ---------------------------------------------------------------------------
// Marca
// ---------------------------------------------------------------------------
export const BRAND = {
  dunkelblau: '#2a3350',
  hellblau: '#01b1e2',
  hellblauDark: '#19c1ef', // acento en modo oscuro
  weiss: '#ffffff',
} as const;

// ---------------------------------------------------------------------------
// Themes
// ---------------------------------------------------------------------------
export type Direction = 'hell' | 'dunkel';

export interface Theme {
  name: Direction;
  bg: string;            // fondo de pantalla
  surface: string;       // cards
  surfaceAlt: string;    // cards secundarias / chips inactivos
  ink: string;           // texto principal
  inkSoft: string;       // texto secundario
  muted: string;         // texto terciario / deshabilitado
  line: string;          // bordes hairline
  accent: string;
  accentSoft: string;    // fondos teñidos de acento
  fieldBg: string;
  fieldBorder: string;
  green: string;
  greenSoft: string;
  amber: string;
  amberSoft: string;
  danger: string;
  tabBg: string;
  shadowSoft: object;
  shadowRaised: object;
}

export const THEMES: Record<Direction, Theme> = {
  hell: {
    name: 'hell',
    bg: '#f4f6fb',
    surface: '#ffffff',
    surfaceAlt: '#eef1f8',
    ink: BRAND.dunkelblau,
    inkSoft: 'rgba(42,51,80,0.72)',
    muted: 'rgba(42,51,80,0.45)',
    line: 'rgba(42,51,80,0.10)',
    accent: BRAND.hellblau,
    accentSoft: 'rgba(1,177,226,0.10)',
    fieldBg: '#f3f5fa',
    fieldBorder: 'rgba(42,51,80,0.10)',
    green: '#1d9d63',
    greenSoft: 'rgba(29,157,99,0.12)',
    amber: '#d98a16',
    amberSoft: 'rgba(217,138,22,0.12)',
    danger: '#d64545',
    tabBg: '#ffffff',
    shadowSoft: {
      shadowColor: BRAND.dunkelblau,
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.06,
      shadowRadius: 12,
      elevation: 2,
    },
    shadowRaised: {
      shadowColor: BRAND.dunkelblau,
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.1,
      shadowRadius: 30,
      elevation: 6,
    },
  },
  dunkel: {
    name: 'dunkel',
    bg: BRAND.dunkelblau,
    surface: 'rgba(255,255,255,0.07)',
    surfaceAlt: 'rgba(255,255,255,0.05)',
    ink: '#ffffff',
    inkSoft: 'rgba(255,255,255,0.78)',
    muted: 'rgba(255,255,255,0.45)',
    line: 'rgba(255,255,255,0.12)',
    accent: BRAND.hellblauDark,
    accentSoft: 'rgba(25,193,239,0.14)',
    fieldBg: 'rgba(255,255,255,0.07)',
    fieldBorder: 'rgba(255,255,255,0.14)',
    green: '#43d29a',
    greenSoft: 'rgba(67,210,154,0.16)',
    amber: '#f3b54e',
    amberSoft: 'rgba(243,181,78,0.16)',
    danger: '#ff7b7b',
    tabBg: '#232b45',
    shadowSoft: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 2 },
      shadowOpacity: 0.3,
      shadowRadius: 12,
      elevation: 2,
    },
    shadowRaised: {
      shadowColor: '#000000',
      shadowOffset: { width: 0, height: 10 },
      shadowOpacity: 0.45,
      shadowRadius: 30,
      elevation: 6,
    },
  },
};

// ---------------------------------------------------------------------------
// Radius & spacing (README: card 20, small = radius−8, button = small+4, pill 999)
// ---------------------------------------------------------------------------
export const RADIUS = {
  card: 20,
  small: 12,
  button: 16,
  pill: 999,
} as const;

export const SPACE = {
  cardPad: 18,
  section: 20,
  list: 12,
} as const;

// ---------------------------------------------------------------------------
// Tipografía Gotham (Black 800 no existe en el Markenpaket → Bold lo cubre)
// ---------------------------------------------------------------------------
export const FONTS = {
  light: 'Gotham-Light',
  book: 'Gotham-Book',
  medium: 'Gotham-Medium',
  bold: 'Gotham-Bold',
  script: 'CaflischScript',
} as const;

export const TYPE = {
  label: 11,     // uppercase + letter-spacing
  label2: 12,
  body: 14,
  body2: 15,
  title: 17,
  titleLg: 19,
  headline: 24,
  headlineLg: 28,
} as const;

// ---------------------------------------------------------------------------
// Dinero — CHF, siempre 2 decimales
// ---------------------------------------------------------------------------
export function money(v: number): string {
  return `CHF ${v.toFixed(2)}`;
}

// ---------------------------------------------------------------------------
// Ticker 1s para countdowns (máquinas en marcha)
// ---------------------------------------------------------------------------
export function useTick(intervalMs = 1000): number {
  const [tick, setTick] = useState(0);
  useEffect(() => {
    const id = setInterval(() => setTick((t) => t + 1), intervalMs);
    return () => clearInterval(id);
  }, [intervalMs]);
  return tick;
}

export function remainingMins(endsAt: number): number {
  return Math.max(0, Math.ceil((endsAt - Date.now()) / 60000));
}

// ---------------------------------------------------------------------------
// Theme context (Hell por defecto; ajuste de app en Profil → Einstellungen)
// ---------------------------------------------------------------------------
interface ThemeContextValue {
  theme: Theme;
  direction: Direction;
  setDirection: (d: Direction) => void;
}

const ThemeContext = createContext<ThemeContextValue>({
  theme: THEMES.hell,
  direction: 'hell',
  setDirection: () => {},
});

const THEME_KEY = 'ns-theme-direction';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [direction, setDirectionState] = useState<Direction>('hell');

  useEffect(() => {
    AsyncStorage.getItem(THEME_KEY).then((saved) => {
      if (saved === 'hell' || saved === 'dunkel') setDirectionState(saved);
    });
  }, []);

  const setDirection = (d: Direction) => {
    setDirectionState(d);
    AsyncStorage.setItem(THEME_KEY, d).catch(() => {});
  };

  return (
    <ThemeContext.Provider value={{ theme: THEMES[direction], direction, setDirection }}>
      {children}
    </ThemeContext.Provider>
  );
}

export function useTheme() {
  return useContext(ThemeContext);
}
