/**
 * Set de iconos de línea — estilo del handoff: trazo 1.9, terminaciones redondas.
 * Reemplaza el set inline del prototipo (app/theme.jsx → Icon).
 */
import React from 'react';
import Svg, { Path, Circle, Rect, Line } from 'react-native-svg';

export interface IconProps {
  size?: number;
  color?: string;
  strokeWidth?: number;
}

function base(size: number) {
  return { width: size, height: size, viewBox: '0 0 24 24', fill: 'none' as const };
}
const sw = (p: IconProps) => p.strokeWidth ?? 1.9;
const lc = 'round' as const;

export const IconBell = (p: IconProps) => (
  <Svg {...base(p.size ?? 22)}>
    <Path
      d="M18 9a6 6 0 0 0-12 0c0 5-2 6-2 6h16s-2-1-2-6"
      stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} strokeLinejoin={lc}
    />
    <Path d="M10.3 19a2 2 0 0 0 3.4 0" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
  </Svg>
);

export const IconGift = (p: IconProps) => (
  <Svg {...base(p.size ?? 22)}>
    <Rect x={3.5} y={8} width={17} height={4} rx={1} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M5 12v7a1.5 1.5 0 0 0 1.5 1.5h11A1.5 1.5 0 0 0 19 19v-7" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
    <Line x1={12} y1={8} x2={12} y2={20.5} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M12 8s-4.5.2-5.5-1.8C5.8 4.8 7 3.5 8.4 3.5 10.5 3.5 12 8 12 8Zm0 0s4.5.2 5.5-1.8c.7-1.4-.5-2.7-1.9-2.7C13.5 3.5 12 8 12 8Z" stroke={p.color} strokeWidth={sw(p)} strokeLinejoin={lc} />
  </Svg>
);

export const IconChevronRight = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Path d="m9 5 7 7-7 7" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} strokeLinejoin={lc} />
  </Svg>
);

export const IconChevronLeft = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Path d="m15 5-7 7 7 7" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} strokeLinejoin={lc} />
  </Svg>
);

export const IconArrowRight = (p: IconProps) => (
  <Svg {...base(p.size ?? 18)}>
    <Path d="M4 12h15m0 0-6-6m6 6-6 6" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} strokeLinejoin={lc} />
  </Svg>
);

export const IconCheck = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Path d="m5 12.5 4.5 4.5L19 7.5" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} strokeLinejoin={lc} />
  </Svg>
);

export const IconQr = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Rect x={4} y={4} width={6.5} height={6.5} rx={1.2} stroke={p.color} strokeWidth={sw(p)} />
    <Rect x={13.5} y={4} width={6.5} height={6.5} rx={1.2} stroke={p.color} strokeWidth={sw(p)} />
    <Rect x={4} y={13.5} width={6.5} height={6.5} rx={1.2} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M13.5 13.5h2.8v2.8h-2.8zM17.2 17.2H20V20h-2.8z" stroke={p.color} strokeWidth={sw(p)} strokeLinejoin={lc} />
  </Svg>
);

export const IconWallet = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Rect x={3} y={6} width={18} height={13} rx={3} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M3 10h18" stroke={p.color} strokeWidth={sw(p)} />
    <Circle cx={17} cy={14.5} r={1.1} fill={p.color} />
  </Svg>
);

export const IconCard = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Rect x={3} y={5.5} width={18} height={13} rx={2.5} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M3 10h18" stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M6.5 14.5h4" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
  </Svg>
);

export const IconCalendar = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Rect x={4} y={5.5} width={16} height={15} rx={2.5} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M4 10h16M8.5 3.5v4M15.5 3.5v4" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
  </Svg>
);

export const IconClock = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Circle cx={12} cy={12} r={8.5} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M12 7.5V12l3 2" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} strokeLinejoin={lc} />
  </Svg>
);

export const IconHelp = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Circle cx={12} cy={12} r={8.5} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M9.6 9.3a2.5 2.5 0 1 1 3.4 3.1c-.8.4-1 .9-1 1.8" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
    <Circle cx={12} cy={17} r={0.4} fill={p.color} stroke={p.color} strokeWidth={1} />
  </Svg>
);

export const IconLogout = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Path d="M14 4H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h7" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
    <Path d="M10 12h10m0 0-3.5-3.5M20 12l-3.5 3.5" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} strokeLinejoin={lc} />
  </Svg>
);

export const IconEye = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Path d="M2.5 12S6 5.5 12 5.5 21.5 12 21.5 12 18 18.5 12 18.5 2.5 12 2.5 12Z" stroke={p.color} strokeWidth={sw(p)} strokeLinejoin={lc} />
    <Circle cx={12} cy={12} r={3} stroke={p.color} strokeWidth={sw(p)} />
  </Svg>
);

export const IconEyeOff = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Path d="M4 4.5 20 19.5" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
    <Path d="M9.9 6c.7-.3 1.4-.5 2.1-.5 6 0 9.5 6.5 9.5 6.5a17 17 0 0 1-3 3.7M6.6 7.6A16.6 16.6 0 0 0 2.5 12S6 18.5 12 18.5c1.2 0 2.3-.2 3.3-.7" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} strokeLinejoin={lc} />
  </Svg>
);

export const IconHome = (p: IconProps) => (
  <Svg {...base(p.size ?? 22)}>
    <Path d="m4 10.5 8-6.5 8 6.5V19a1.5 1.5 0 0 1-1.5 1.5h-13A1.5 1.5 0 0 1 4 19Z" stroke={p.color} strokeWidth={sw(p)} strokeLinejoin={lc} />
    <Path d="M9.5 20.5v-6h5v6" stroke={p.color} strokeWidth={sw(p)} strokeLinejoin={lc} />
  </Svg>
);

export const IconPlusCircle = (p: IconProps) => (
  <Svg {...base(p.size ?? 22)}>
    <Circle cx={12} cy={12} r={8.5} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M12 8.5v7M8.5 12h7" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
  </Svg>
);

export const IconUser = (p: IconProps) => (
  <Svg {...base(p.size ?? 22)}>
    <Circle cx={12} cy={8.5} r={3.7} stroke={p.color} strokeWidth={sw(p)} />
    <Path d="M4.8 20a7.6 7.6 0 0 1 14.4 0" stroke={p.color} strokeWidth={sw(p)} strokeLinecap={lc} />
  </Svg>
);

export const IconApple = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Path
      d="M16.6 12.6c0-2.4 2-3.5 2-3.5a4.4 4.4 0 0 0-3.4-1.9c-1.5-.1-2.8.9-3.5.9-.7 0-1.9-.9-3.1-.9A4.6 4.6 0 0 0 4.7 9.6c-1.6 2.9-.4 7.2 1.2 9.5.8 1.2 1.7 2.4 2.9 2.4 1.2 0 1.6-.8 3.1-.8 1.4 0 1.8.8 3.1.8 1.3 0 2.1-1.2 2.8-2.3a9.6 9.6 0 0 0 1.3-2.6 4.1 4.1 0 0 1-2.5-4ZM14.3 5.4A4.2 4.2 0 0 0 15.3 2a4.2 4.2 0 0 0-2.8 1.5A4 4 0 0 0 11.5 6.8a3.5 3.5 0 0 0 2.8-1.4Z"
      fill={p.color}
    />
  </Svg>
);

export const IconGoogle = (p: IconProps) => (
  <Svg {...base(p.size ?? 20)}>
    <Path
      d="M21.35 12.2c0-.7-.06-1.3-.18-2H12v3.9h5.3a4.6 4.6 0 0 1-2 3v2.5h3.2c1.9-1.7 2.9-4.3 2.9-7.4Z"
      fill="#4285F4"
    />
    <Path d="M12 22c2.7 0 5-.9 6.6-2.4l-3.2-2.5c-.9.6-2 1-3.4 1a6 6 0 0 1-5.6-4.1H3.1v2.6A10 10 0 0 0 12 22Z" fill="#34A853" />
    <Path d="M6.4 14a6 6 0 0 1 0-3.9V7.5H3.1a10 10 0 0 0 0 9.1L6.4 14Z" fill="#FBBC05" />
    <Path d="M12 6c1.5 0 2.8.5 3.8 1.5L18.7 4.6A10 10 0 0 0 3.1 7.5L6.4 10A6 6 0 0 1 12 6Z" fill="#EA4335" />
  </Svg>
);
