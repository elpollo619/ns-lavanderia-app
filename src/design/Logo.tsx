/**
 * Logo N's LAVANDERIA — vector estático.
 * Paths exportados del Markenpaket (01_Logos/03_Gestapelt + 06_App-Icon),
 * generados originalmente con logo-builder.js (Gotham + Caflisch como curvas).
 * Variantes según handoff: `tile` (app icon) y `stacked` (hero de Auth).
 */
import React from 'react';
import Svg, { Path, Rect, G } from 'react-native-svg';
import { BRAND } from './theme';

// Monograma "N's": N + triángulo cian del apóstrofe + s
const MONO_N =
  'M70.600 0L70.600-70L55.400-70L55.400-26.900L22.600-70L8.400-70L8.400 0L23.600 0L23.600-44.500L57.500 0Z';
const MONO_APOSTROPHE = 'M 77.717 -69.998 L 93.778 -69.998 L 77.728 -34.990 Z';
const MONO_S =
  'M121.380-13.753L121.380-13.923C121.380-22.269 114.646-25.335 108.841-27.464C104.351-29.168 100.404-30.360 100.404-32.915L100.404-33.085C100.404-34.873 101.875-36.236 104.739-36.236C107.757-36.236 111.860-34.618 115.962-31.978L120.451-40.920C115.962-44.241 110.234-46.200 104.971-46.200C96.611-46.200 89.800-41.005 89.800-31.722L89.800-31.552C89.800-22.695 96.379-19.714 102.184-17.841C106.751-16.308 110.776-15.371 110.776-12.561L110.776-12.391C110.776-10.347 109.228-8.984 105.822-8.984C101.952-8.984 97.230-10.858 92.741-14.434L87.710-5.918C93.206-1.149 99.707 0.980 105.513 0.980C114.491 0.980 121.380-3.619 121.380-13.753Z';

// Marco cuadrado abierto del emblema
const FRAME =
  'M 77.69999999999999 6.930000000000001 L 77.69999999999999 26.94999999999999 L -128.24 26.94999999999999 L -128.24 -178.99 L 77.69999999999999 -178.99 L 77.69999999999999 -80.43';

// Wordmark "LAVANDERIA" (sin la E, que lleva la barra de acento encima)
const WORDMARK =
  'M9.900 0L57.200 0L57.200-7.300L17.800-7.300L17.800-70L9.900-70Z M77.400 0L85.500 0L93.800-18.500L131.900-18.500L140.100 0L148.600 0L116.700-70.500L109.300-70.500ZM96.900-25.600L112.900-61.300L128.800-25.600Z M198.500 0.500L205.500 0.500L235.600-70L227.100-70L202.100-9.700L177.200-70L168.400-70Z M255.400 0L263.500 0L271.800-18.500L309.900-18.500L318.100 0L326.600 0L294.700-70.500L287.300-70.500ZM274.900-25.600L290.900-61.300L306.800-25.600Z M352.400 0L360.100 0L360.100-57.400L405.300 0L411.600 0L411.600-70L403.900-70L403.900-13.900L359.800-70L352.400-70Z M443.400 0L467.700 0C489.700 0 504.900-15.300 504.900-35L504.900-35.200C504.900-54.900 489.700-70 467.700-70L443.400-70ZM467.700-62.700C485.400-62.700 496.700-50.500 496.700-35L496.700-34.800C496.700-19.200 485.400-7.300 467.700-7.300L451.300-7.300L451.300-62.700Z M612.600 0L620.500 0L620.500-27.200L640.500-27.200L660.800 0L670.500 0L649-28.600C660-30.500 668-37.400 668-49L668-49.200C668-54.800 666.100-59.500 662.600-63C658.200-67.400 651.400-70 642.700-70L612.600-70ZM620.500-34.300L620.500-62.700L642.100-62.700C653.400-62.700 660-57.600 660-48.900L660-48.700C660-39.700 652.400-34.300 642-34.300Z M697.600 0L705.500 0L705.500-70L697.600-70Z M732 0L740.100 0L748.400-18.500L786.500-18.500L794.700 0L803.200 0L771.300-70.500L763.900-70.500ZM751.500-25.600L767.500-61.300L783.400-25.600Z';
const WORDMARK_E =
  'M533.600 0L584.700 0L584.700-7.200L541.500-7.200L541.500-31.700L579.700-31.700L579.700-38.900L541.500-38.900L541.500-62.800L584.200-62.800L584.200-70L533.600-70Z';

interface LogoProps {
  /** Color del trazo principal (defecto: dunkelblau; en modo oscuro: blanco) */
  color?: string;
  width?: number;
  height?: number;
}

/** Variante `stacked` — emblema arriba, wordmark con barra cian debajo (hero Auth). */
export function LogoStacked({ color = BRAND.dunkelblau, width = 168, height = 116 }: LogoProps) {
  return (
    <Svg width={width} height={height} viewBox="-33.173 -33.173 873.446 398.076">
      <G transform="translate(410.7775 186.585)">
        <Path d={FRAME} fill="none" stroke={color} strokeWidth={15.19} />
        <Path d={MONO_N} fill={color} />
        <Path d={MONO_APOSTROPHE} fill={BRAND.hellblau} />
        <Path d={MONO_S} fill={color} />
      </G>
      <G transform="translate(0 331.73)">
        <Path d={WORDMARK} fill={color} />
        <Path d={WORDMARK_E} fill={color} />
        <Rect x={533.6} y={-70} width={51.1} height={6} fill={BRAND.hellblau} />
      </G>
    </Svg>
  );
}

/** Variante `tile` — app icon: cuadrado redondeado dunkelblau con monograma blanco. */
export function LogoTile({ width = 64, height = 64 }: { width?: number; height?: number }) {
  return (
    <Svg width={width} height={height} viewBox="0 0 1000 1000">
      <Rect x={0} y={0} width={1000} height={1000} rx={220} ry={220} fill={BRAND.dunkelblau} />
      <G transform="translate(250 600.9227220299884) scale(4.119294776734223)">
        <Path d={MONO_N} fill="#ffffff" />
        <Path d={MONO_APOSTROPHE} fill={BRAND.hellblau} />
        <Path d={MONO_S} fill="#ffffff" />
      </G>
    </Svg>
  );
}
