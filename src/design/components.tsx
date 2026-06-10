/**
 * Componentes base del design system N's LAVANDERIA.
 * Referencia: design_handoff_ns_laundry_app/README.md (app/components.jsx del prototipo).
 * Press-feedback scale 0.975 · transiciones ~150ms · hit targets ≥ 44px.
 */
import React, { useEffect, useRef } from 'react';
import {
  Animated,
  Easing,
  Pressable,
  StyleProp,
  Text,
  TextInput,
  TextInputProps,
  View,
  ViewStyle,
} from 'react-native';
import Svg, { Circle, Path } from 'react-native-svg';
import { FONTS, RADIUS, SPACE, TYPE, money, remainingMins, useTheme, useTick } from './theme';
import { Machine } from './data';
import { IconArrowRight, IconCheck } from './icons';

// ---------------------------------------------------------------------------
// Press — wrapper con scale 0.975 animado (~150ms)
// ---------------------------------------------------------------------------
interface PressProps {
  onPress?: () => void;
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  children: React.ReactNode;
}

export function Press({ onPress, disabled, style, children }: PressProps) {
  const scale = useRef(new Animated.Value(1)).current;
  const to = (v: number) =>
    Animated.timing(scale, {
      toValue: v,
      duration: 150,
      easing: Easing.out(Easing.quad),
      useNativeDriver: true,
    }).start();
  return (
    <Pressable
      onPress={onPress}
      disabled={disabled}
      onPressIn={() => to(0.975)}
      onPressOut={() => to(1)}
      hitSlop={6}
      style={style}
    >
      <Animated.View style={{ transform: [{ scale }] }}>{children}</Animated.View>
    </Pressable>
  );
}

// ---------------------------------------------------------------------------
// Tipografía
// ---------------------------------------------------------------------------
interface TxtProps {
  children: React.ReactNode;
  size?: number;
  font?: string;
  color?: string;
  style?: object;
  numberOfLines?: number;
}

export function Txt({ children, size = TYPE.body, font = FONTS.book, color, style, numberOfLines }: TxtProps) {
  const { theme } = useTheme();
  return (
    <Text
      numberOfLines={numberOfLines}
      style={[{ fontSize: size, fontFamily: font, color: color ?? theme.ink }, style]}
    >
      {children}
    </Text>
  );
}

/** Label uppercase con letter-spacing (11–12px) */
export function Label({ children, color, style }: { children: React.ReactNode; color?: string; style?: object }) {
  const { theme } = useTheme();
  return (
    <Text
      style={[
        {
          fontSize: TYPE.label,
          fontFamily: FONTS.medium,
          color: color ?? theme.muted,
          textTransform: 'uppercase',
          letterSpacing: 1.2,
        },
        style,
      ]}
    >
      {children}
    </Text>
  );
}

// ---------------------------------------------------------------------------
// Card
// ---------------------------------------------------------------------------
export function DCard({
  children,
  style,
  raised,
}: {
  children: React.ReactNode;
  style?: StyleProp<ViewStyle>;
  raised?: boolean;
}) {
  const { theme } = useTheme();
  return (
    <View
      style={[
        {
          backgroundColor: theme.surface,
          borderRadius: RADIUS.card,
          padding: SPACE.cardPad,
          borderWidth: 1,
          borderColor: theme.line,
        },
        raised ? theme.shadowRaised : theme.shadowSoft,
        style,
      ]}
    >
      {children}
    </View>
  );
}

// ---------------------------------------------------------------------------
// Button
// ---------------------------------------------------------------------------
interface DButtonProps {
  children: React.ReactNode;
  onPress?: () => void;
  variant?: 'primary' | 'ghost' | 'danger';
  disabled?: boolean;
  style?: StyleProp<ViewStyle>;
  icon?: React.ReactNode;
}

export function DButton({ children, onPress, variant = 'primary', disabled, style, icon }: DButtonProps) {
  const { theme } = useTheme();
  const isPrimary = variant === 'primary';
  const isDanger = variant === 'danger';
  return (
    <Press onPress={onPress} disabled={disabled} style={style}>
      <View
        style={{
          minHeight: 54,
          borderRadius: RADIUS.button,
          backgroundColor: isPrimary ? theme.accent : 'transparent',
          borderWidth: isPrimary ? 0 : 1,
          borderColor: isDanger ? theme.danger : theme.line,
          alignItems: 'center',
          justifyContent: 'center',
          flexDirection: 'row',
          gap: 8,
          paddingHorizontal: 20,
          opacity: disabled ? 0.5 : 1,
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.bold,
            fontSize: TYPE.body2,
            color: isPrimary ? '#ffffff' : isDanger ? theme.danger : theme.ink,
          }}
        >
          {children}
        </Text>
        {icon}
      </View>
    </Press>
  );
}

// ---------------------------------------------------------------------------
// StatusPill — Frei (verde) · Läuft (acento) · Fertig (ámbar, punto pulsante) ·
// Reserviert (muted, muestra hora)
// ---------------------------------------------------------------------------
export function StatusPill({ machine }: { machine: Machine }) {
  const { theme } = useTheme();
  useTick(); // re-render para countdown

  const cfg = {
    frei: { text: 'Frei', color: theme.green, bg: theme.greenSoft },
    laeuft: { text: 'Läuft', color: theme.accent, bg: theme.accentSoft },
    fertig: { text: 'Fertig', color: theme.amber, bg: theme.amberSoft },
    reserviert: { text: machine.reservedAt ? `${machine.reservedAt}` : 'Reserviert', color: theme.muted, bg: theme.surfaceAlt },
  }[machine.status];

  return (
    <View
      style={{
        flexDirection: 'row',
        alignItems: 'center',
        gap: 6,
        backgroundColor: cfg.bg,
        borderRadius: RADIUS.pill,
        paddingHorizontal: 10,
        paddingVertical: 5,
      }}
    >
      {machine.status === 'fertig' ? (
        <PulsingDot color={cfg.color} />
      ) : (
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: cfg.color }} />
      )}
      <Text style={{ fontFamily: FONTS.medium, fontSize: TYPE.label2, color: cfg.color }}>
        {cfg.text}
      </Text>
    </View>
  );
}

function PulsingDot({ color }: { color: string }) {
  const opacity = useRef(new Animated.Value(1)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(opacity, { toValue: 0.25, duration: 700, useNativeDriver: true }),
        Animated.timing(opacity, { toValue: 1, duration: 700, useNativeDriver: true }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [opacity]);
  return (
    <Animated.View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: color, opacity }} />
  );
}

// ---------------------------------------------------------------------------
// Ring — progreso giratorio con minutos restantes (máquinas en marcha)
// ---------------------------------------------------------------------------
export function Ring({ endsAt, size = 46 }: { endsAt: number; size?: number }) {
  const { theme } = useTheme();
  useTick();
  const mins = remainingMins(endsAt);

  const spin = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(spin, {
        toValue: 1,
        duration: 1800,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [spin]);
  const rotate = spin.interpolate({ inputRange: [0, 1], outputRange: ['0deg', '360deg'] });

  const r = (size - 6) / 2;
  const c = 2 * Math.PI * r;

  return (
    <View style={{ width: size, height: size, alignItems: 'center', justifyContent: 'center' }}>
      <Animated.View style={{ position: 'absolute', width: size, height: size, transform: [{ rotate }] }}>
        <Svg width={size} height={size} viewBox={`0 0 ${size} ${size}`}>
          <Circle cx={size / 2} cy={size / 2} r={r} stroke={theme.line} strokeWidth={3} fill="none" />
          <Circle
            cx={size / 2}
            cy={size / 2}
            r={r}
            stroke={theme.accent}
            strokeWidth={3}
            fill="none"
            strokeDasharray={`${c * 0.7} ${c * 0.3}`}
            strokeLinecap="round"
          />
        </Svg>
      </Animated.View>
      <Text style={{ fontFamily: FONTS.bold, fontSize: 13, color: theme.accent }}>{mins}</Text>
      <Text style={{ fontFamily: FONTS.medium, fontSize: 8, color: theme.muted, marginTop: -1 }}>MIN</Text>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Porthole — ojo de buey de la máquina
// ---------------------------------------------------------------------------
export function Porthole({ size = 46, type }: { size?: number; type: 'waschen' | 'trocknen' }) {
  const { theme } = useTheme();
  const r = size / 2;
  return (
    <Svg width={size} height={size} viewBox="0 0 46 46">
      <Circle cx={23} cy={23} r={20} stroke={theme.ink} strokeWidth={1.9} fill="none" opacity={0.85} />
      <Circle cx={23} cy={23} r={13.5} stroke={theme.ink} strokeWidth={1.9} fill="none" opacity={0.5} />
      {type === 'waschen' ? (
        <Path
          d="M11 25c3-2.4 6-2.4 9 0s6 2.4 9 0 4-2 6-1"
          stroke={theme.accent}
          strokeWidth={1.9}
          fill="none"
          strokeLinecap="round"
        />
      ) : (
        <Path
          d="M17 18c0 3.3 5 3.3 5 6.6M23 18c0 3.3 5 3.3 5 6.6"
          stroke={theme.accent}
          strokeWidth={1.9}
          fill="none"
          strokeLinecap="round"
        />
      )}
    </Svg>
  );
}

// ---------------------------------------------------------------------------
// MachineCard — fila de lista del Home y celda seleccionable del flujo Buchen
// ---------------------------------------------------------------------------
interface MachineCardProps {
  machine: Machine;
  onPress?: () => void;
  selected?: boolean;
  compact?: boolean; // grid 2 col en el flujo
}

export function MachineCard({ machine, onPress, selected, compact }: MachineCardProps) {
  const { theme } = useTheme();
  const free = machine.status === 'frei';
  return (
    <Press onPress={onPress} disabled={!onPress}>
      <View
        style={[
          {
            backgroundColor: theme.surface,
            borderRadius: RADIUS.card,
            padding: compact ? 14 : SPACE.cardPad,
            borderWidth: selected ? 2 : 1,
            borderColor: selected ? theme.accent : theme.line,
            flexDirection: compact ? 'column' : 'row',
            alignItems: compact ? 'flex-start' : 'center',
            gap: compact ? 10 : 14,
          },
          theme.shadowSoft,
        ]}
      >
        {machine.status === 'laeuft' && machine.endsAt ? (
          <Ring endsAt={machine.endsAt} />
        ) : (
          <Porthole type={machine.type} />
        )}
        <View style={{ flex: compact ? undefined : 1, gap: 3 }}>
          <Txt size={TYPE.body2} font={FONTS.medium}>{machine.name}</Txt>
          <Txt size={TYPE.label2} color={theme.muted}>
            {machine.cap} · {money(machine.price)} / Gang
          </Txt>
        </View>
        <View style={{ alignItems: compact ? 'flex-start' : 'flex-end', gap: 6, marginTop: compact ? 2 : 0 }}>
          <StatusPill machine={machine} />
          {free && onPress && !compact && (
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 4 }}>
              <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.label2, color: theme.accent }}>
                Buchen
              </Text>
              <IconArrowRight size={13} color={theme.accent} />
            </View>
          )}
        </View>
        {selected && (
          <View
            style={{
              position: 'absolute',
              top: 10,
              right: 10,
              width: 22,
              height: 22,
              borderRadius: 11,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={14} color="#fff" strokeWidth={2.4} />
          </View>
        )}
      </View>
    </Press>
  );
}

// ---------------------------------------------------------------------------
// Chip — filtros (Alle / Waschen / Trocknen)
// ---------------------------------------------------------------------------
export function Chip({
  label,
  active,
  onPress,
}: {
  label: string;
  active?: boolean;
  onPress?: () => void;
}) {
  const { theme } = useTheme();
  return (
    <Press onPress={onPress}>
      <View
        style={{
          minHeight: 44,
          paddingHorizontal: 18,
          borderRadius: RADIUS.pill,
          backgroundColor: active ? theme.accent : theme.surfaceAlt,
          borderWidth: 1,
          borderColor: active ? theme.accent : theme.line,
          alignItems: 'center',
          justifyContent: 'center',
        }}
      >
        <Text
          style={{
            fontFamily: FONTS.medium,
            fontSize: TYPE.body,
            color: active ? '#fff' : theme.inkSoft,
          }}
        >
          {label}
        </Text>
      </View>
    </Press>
  );
}

// ---------------------------------------------------------------------------
// Field — input 54px, radius 16, bg #f3f5fa (hell) / glass (dunkel)
// ---------------------------------------------------------------------------
interface FieldProps extends TextInputProps {
  label: string;
  right?: React.ReactNode;
}

export function Field({ label, right, ...rest }: FieldProps) {
  const { theme } = useTheme();
  const [focused, setFocused] = React.useState(false);
  return (
    <View style={{ gap: 7 }}>
      <Label color={theme.inkSoft}>{label}</Label>
      <View
        style={{
          height: 54,
          borderRadius: 16,
          backgroundColor: theme.fieldBg,
          borderWidth: 1.5,
          borderColor: focused ? theme.accent : theme.fieldBorder,
          flexDirection: 'row',
          alignItems: 'center',
          paddingHorizontal: 16,
        }}
      >
        <TextInput
          {...rest}
          onFocus={() => setFocused(true)}
          onBlur={() => setFocused(false)}
          placeholderTextColor={theme.muted}
          style={{
            flex: 1,
            fontFamily: FONTS.book,
            fontSize: TYPE.body2,
            color: theme.ink,
            height: '100%',
          }}
        />
        {right}
      </View>
    </View>
  );
}

// ---------------------------------------------------------------------------
// StepBar — 4 puntos: Maschine · Zeit · Programm · Zahlung
// ---------------------------------------------------------------------------
export const STEPS = ['Maschine', 'Zeit', 'Programm', 'Zahlung'] as const;

export function StepBar({ step }: { step: number }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'center', gap: 6 }}>
      {STEPS.map((s, i) => (
        <React.Fragment key={s}>
          <View
            style={{
              width: i === step ? 22 : 8,
              height: 8,
              borderRadius: 4,
              backgroundColor: i <= step ? theme.accent : theme.line,
            }}
          />
        </React.Fragment>
      ))}
    </View>
  );
}

// ---------------------------------------------------------------------------
// SectionTitle
// ---------------------------------------------------------------------------
export function SectionTitle({
  title,
  right,
}: {
  title: string;
  right?: React.ReactNode;
}) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', alignItems: 'baseline', justifyContent: 'space-between' }}>
      <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.titleLg, color: theme.ink }}>{title}</Text>
      {right}
    </View>
  );
}
