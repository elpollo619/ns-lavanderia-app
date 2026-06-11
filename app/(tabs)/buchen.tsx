/**
 * Buchen — flujo de 4 pasos (handoff: app/screens-reserve.jsx).
 * Maschine → Zeit → Programm & Extras → Zahlung → Bestätigung.
 * Total = precio máquina + recargo programa + extras.
 * Fin = inicio + duración del programa.
 */
import React, { useEffect, useMemo, useRef, useState } from 'react';
import { Alert, Animated, Easing, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useLocalSearchParams, useRouter } from 'expo-router';
import { cancelBooking, createVorOrtBooking, grantAccess } from '@/api/bookings';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/design/BookingContext';
import { scheduleReminder } from '@/design/notify';
import { payOnline, stripeConfigured } from '@/design/payments';
import { addMinutes, slotToDate } from '@/design/time';
import {
  DButton,
  DCard,
  Label,
  MachineCard,
  Press,
  StepBar,
  STEPS,
  Txt,
} from '@/design/components';
import {
  buildDays,
  buildSlots,
  EXTRAS,
  GUTHABEN,
  PAY_METHODS,
  PROGRAMS,
} from '@/design/data';
import { useMachines, useTakenSlots } from '@/design/useMachines';
import { IconCheck, IconChevronLeft, IconQr } from '@/design/icons';
import { FONTS, RADIUS, TYPE, money, useTheme } from '@/design/theme';

const DAYS = buildDays();
const SLOTS = buildSlots();

/** Libera el slot si el pago se canceló/falló — sin bloquear la UI. */
function cancelBookingSafe(reservationId: string): void {
  cancelBooking(reservationId).catch(() => {});
}


export default function BuchenScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { setBooking } = useBooking();
  const { user } = useAuth();
  const params = useLocalSearchParams<{ machine?: string }>();
  const { machines } = useMachines();

  const [step, setStep] = useState(0);
  const [machineId, setMachineId] = useState<string | null>(null);
  const [dayId, setDayId] = useState(DAYS[0].id);
  const [slot, setSlot] = useState<string | null>(null);
  const [programId, setProgramId] = useState(PROGRAMS[0].id);
  const [extras, setExtras] = useState<Record<string, boolean>>({});
  const [payId, setPayId] = useState(PAY_METHODS[0].id);
  const [promo, setPromo] = useState('');
  const [confirmed, setConfirmed] = useState(false);
  const [busy, setBusy] = useState(false);

  // Tap en máquina libre del Home → pre-seleccionada, arranca en "Zeit"
  useEffect(() => {
    if (params.machine && machines.some((m) => m.id === params.machine && m.status === 'frei')) {
      setMachineId(params.machine);
      setStep(1);
      setConfirmed(false);
    }
  }, [params.machine, machines]);

  const machine = machines.find((m) => m.id === machineId) ?? null;
  const day = DAYS.find((d) => d.id === dayId)!;
  const dayOffset = DAYS.indexOf(day);
  // Disponibilidad real (vista slots_availability); null → mock del prototipo
  const takenLive = useTakenSlots(user ? machineId : null, dayOffset);
  const prog = PROGRAMS.find((p) => p.id === programId)!;
  const extrasTotal = useMemo(
    () => EXTRAS.reduce((sum, e) => sum + (extras[e.id] ? e.add : 0), 0),
    [extras]
  );
  const total = (machine?.price ?? 0) + prog.add + extrasTotal;
  const endTime = slot ? addMinutes(slot, prog.mins) : null;

  const canNext =
    step === 0 ? !!machine : step === 1 ? !!slot : step === 2 ? true : true;

  const reset = () => {
    setStep(0);
    setMachineId(null);
    setSlot(null);
    setProgramId(PROGRAMS[0].id);
    setExtras({});
    setPayId(PAY_METHODS[0].id);
    setPromo('');
    setConfirmed(false);
  };

  const confirm = async () => {
    if (!machine || !slot || busy) return;

    const startDate = slotToDate(dayOffset, slot);

    if (user) {
      const extraIds = EXTRAS.filter((e) => extras[e.id]).map((e) => e.id);

      if (payId === 'vorort') {
        setBusy(true);
        try {
          const row = await createVorOrtBooking({
            userId: user.id,
            machineId: machine.id,
            start: startDate,
            durationMinutes: prog.mins,
            amountCents: Math.round(total * 100),
            program: prog.name,
            extras: extraIds,
          });
          // Provisioning de acceso (modelo LikeMagic) — no bloquea la confirmación
          grantAccess(row.id).catch(() => {});
        } catch (err) {
          Alert.alert("N's LAVANDERIA", err instanceof Error ? err.message : 'Buchung fehlgeschlagen.');
          return;
        } finally {
          setBusy(false);
        }
      } else if (payId === 'karte' || payId === 'apple') {
        // Pago online: reserva + PaymentIntent en el servidor → PaymentSheet.
        // Sin clave Stripe configurada (o en web) cae al aviso de abajo.
        if (!stripeConfigured()) {
          Alert.alert(
            "N's LAVANDERIA",
            'Online-Zahlung (Karte, Apple Pay) wird mit Stripe aktiviert. Wähle vorerst „Vor Ort bezahlen“, um verbindlich zu buchen.'
          );
          return;
        }
        setBusy(true);
        try {
          const res = await payOnline({
            machineId: machine.id,
            start: startDate,
            programId: prog.id,
            extraIds,
            email: user.email ?? undefined,
          });
          if (res.status === 'canceled') {
            // Sheet cerrado por el usuario → liberar el slot reservado
            if (res.reservationId) cancelBookingSafe(res.reservationId);
            return;
          }
          if (res.status === 'error') {
            if (res.reservationId) cancelBookingSafe(res.reservationId);
            Alert.alert("N's LAVANDERIA", res.message);
            return;
          }
          // El webhook también lo hace server-side; esta llamada es idempotente
          grantAccess(res.reservationId).catch(() => {});
        } finally {
          setBusy(false);
        }
      } else {
        // N's Guthaben — wallet aún sin backend
        Alert.alert(
          "N's LAVANDERIA",
          "N's Guthaben wird bald verfügbar. Wähle vorerst „Vor Ort bezahlen“ oder Karte."
        );
        return;
      }

      scheduleReminder(machine.name, startDate).catch(() => {});
    }

    setBooking({
      machineId: machine.id,
      machineName: machine.name,
      machineType: machine.type,
      dayLabel: day.label,
      date: day.date,
      month: day.month,
      start: slot,
      end: endTime!,
      programName: prog.name,
      total,
    });
    setConfirmed(true);
  };

  if (confirmed && machine && slot) {
    return (
      <ConfirmView
        machineName={machine.name}
        dayLabel={day.label}
        date={day.date}
        month={day.month}
        start={slot}
        end={endTime!}
        total={total}
        onDone={() => {
          reset();
          router.push('/(tabs)');
        }}
      />
    );
  }

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      {/* Sticky header */}
      <View
        style={{
          flexDirection: 'row',
          alignItems: 'center',
          gap: 12,
          paddingHorizontal: 20,
          paddingVertical: 12,
          borderBottomWidth: 1,
          borderBottomColor: theme.line,
        }}
      >
        <Press onPress={() => (step > 0 ? setStep(step - 1) : router.back())}>
          <View
            style={{
              width: 44,
              height: 44,
              borderRadius: 22,
              backgroundColor: theme.surface,
              borderWidth: 1,
              borderColor: theme.line,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconChevronLeft size={20} color={theme.ink} />
          </View>
        </Press>
        <View style={{ flex: 1 }}>
          <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.titleLg, color: theme.ink }}>
            Buchen
          </Text>
          <Txt size={TYPE.label2} color={theme.muted}>
            Schritt {step + 1} von 4 · {STEPS[step]}
          </Txt>
        </View>
        <StepBar step={step} />
      </View>

      <ScrollView contentContainerStyle={{ padding: 20, gap: 14, paddingBottom: 120 }}>
        {step === 0 && (
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 12 }}>
            {machines.map((m) => (
              <View key={m.id} style={{ width: '47.5%' }}>
                <MachineCard
                  machine={m}
                  compact
                  selected={machineId === m.id}
                  onPress={m.status === 'frei' ? () => setMachineId(m.id) : undefined}
                />
              </View>
            ))}
          </View>
        )}

        {step === 1 && (
          <View style={{ gap: 18 }}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={{ gap: 10 }}>
              {DAYS.map((d) => {
                const active = d.id === dayId;
                return (
                  <Press key={d.id} onPress={() => setDayId(d.id)}>
                    <View
                      style={{
                        width: 64,
                        paddingVertical: 12,
                        borderRadius: RADIUS.button,
                        alignItems: 'center',
                        gap: 3,
                        backgroundColor: active ? theme.accent : theme.surface,
                        borderWidth: 1,
                        borderColor: active ? theme.accent : theme.line,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONTS.medium,
                          fontSize: 10,
                          letterSpacing: 1,
                          color: active ? 'rgba(255,255,255,0.85)' : theme.muted,
                        }}
                      >
                        {d.label.toUpperCase()}
                      </Text>
                      <Text style={{ fontFamily: FONTS.bold, fontSize: 18, color: active ? '#fff' : theme.ink }}>
                        {d.date}
                      </Text>
                      <Text
                        style={{
                          fontFamily: FONTS.medium,
                          fontSize: 9,
                          letterSpacing: 1,
                          color: active ? 'rgba(255,255,255,0.85)' : theme.muted,
                        }}
                      >
                        {d.month}
                      </Text>
                    </View>
                  </Press>
                );
              })}
            </ScrollView>

            <View style={{ flexDirection: 'row', flexWrap: 'wrap', gap: 10 }}>
              {SLOTS.map((s) => {
                const active = slot === s.id;
                // Disponibilidad real si hay datos live; mock del prototipo si no.
                const isPast = dayOffset === 0 && parseInt(s.id, 10) <= new Date().getHours();
                const taken = isPast || (takenLive ? takenLive.has(s.id) : s.taken);
                return (
                  <Press key={s.id} onPress={taken ? undefined : () => setSlot(s.id)} style={{ width: '31%' }}>
                    <View
                      style={{
                        minHeight: 44,
                        borderRadius: RADIUS.small,
                        alignItems: 'center',
                        justifyContent: 'center',
                        backgroundColor: active ? theme.accent : theme.surface,
                        borderWidth: 1,
                        borderColor: active ? theme.accent : theme.line,
                        opacity: taken ? 0.45 : 1,
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONTS.medium,
                          fontSize: TYPE.body,
                          color: active ? '#fff' : theme.ink,
                          textDecorationLine: taken ? 'line-through' : 'none',
                        }}
                      >
                        {s.label}
                      </Text>
                    </View>
                  </Press>
                );
              })}
            </View>
          </View>
        )}

        {step === 2 && (
          <View style={{ gap: 18 }}>
            <View style={{ gap: 10 }}>
              <Label>Programm</Label>
              {PROGRAMS.map((p) => {
                const active = programId === p.id;
                return (
                  <Press key={p.id} onPress={() => setProgramId(p.id)}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: theme.surface,
                        borderRadius: RADIUS.card,
                        padding: 16,
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? theme.accent : theme.line,
                      }}
                    >
                      <View style={{ flex: 1, gap: 2 }}>
                        <Txt size={TYPE.body2} font={FONTS.medium}>
                          {p.name}
                        </Txt>
                        <Txt size={TYPE.label2} color={theme.muted}>
                          {p.temp} · {p.mins} Min
                        </Txt>
                      </View>
                      <Txt size={TYPE.body} font={FONTS.bold} color={p.add === 0 ? theme.green : theme.ink}>
                        {p.add === 0 ? 'inkl.' : `+${money(p.add)}`}
                      </Txt>
                    </View>
                  </Press>
                );
              })}
            </View>

            <View style={{ gap: 10 }}>
              <Label>Extras</Label>
              {EXTRAS.map((e) => {
                const active = !!extras[e.id];
                return (
                  <Press key={e.id} onPress={() => setExtras((x) => ({ ...x, [e.id]: !x[e.id] }))}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: theme.surface,
                        borderRadius: RADIUS.card,
                        padding: 16,
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? theme.accent : theme.line,
                      }}
                    >
                      <View
                        style={{
                          width: 24,
                          height: 24,
                          borderRadius: 7,
                          borderWidth: active ? 0 : 1.5,
                          borderColor: theme.line,
                          backgroundColor: active ? theme.accent : 'transparent',
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        {active && <IconCheck size={15} color="#fff" strokeWidth={2.6} />}
                      </View>
                      <Txt size={TYPE.body2} font={FONTS.medium} style={{ flex: 1 }}>
                        {e.name}
                      </Txt>
                      <Txt size={TYPE.body} font={FONTS.bold}>
                        +{money(e.add)}
                      </Txt>
                    </View>
                  </Press>
                );
              })}
            </View>
          </View>
        )}

        {step === 3 && machine && slot && (
          <View style={{ gap: 18 }}>
            <DCard style={{ gap: 10 }}>
              <Label>Übersicht</Label>
              <Row k="Maschine" v={machine.name} />
              <Row k="Programm" v={`${prog.name} · ${prog.mins} Min`} />
              <Row k="Datum" v={`${day.label === 'HEUTE' ? 'Heute' : day.label}, ${day.date}. ${day.month}`} />
              <Row k="Uhrzeit" v={`${slot} – ${endTime}`} />
            </DCard>

            <View style={{ gap: 10 }}>
              <Label>Zahlungsart</Label>
              {PAY_METHODS.map((p) => {
                const active = payId === p.id;
                return (
                  <Press key={p.id} onPress={() => setPayId(p.id)}>
                    <View
                      style={{
                        flexDirection: 'row',
                        alignItems: 'center',
                        gap: 12,
                        backgroundColor: theme.surface,
                        borderRadius: RADIUS.card,
                        padding: 16,
                        borderWidth: active ? 2 : 1,
                        borderColor: active ? theme.accent : theme.line,
                      }}
                    >
                      <View
                        style={{
                          width: 22,
                          height: 22,
                          borderRadius: 11,
                          borderWidth: active ? 7 : 1.5,
                          borderColor: active ? theme.accent : theme.line,
                        }}
                      />
                      <Txt size={TYPE.body2} font={FONTS.medium} style={{ flex: 1 }}>
                        {p.name}
                      </Txt>
                      {p.detail && (
                        <Txt size={TYPE.body} color={theme.muted}>
                          {p.detail}
                        </Txt>
                      )}
                    </View>
                  </Press>
                );
              })}
            </View>

            <DCard style={{ gap: 10 }}>
              <Label>Gutscheincode</Label>
              <View
                style={{
                  height: 48,
                  borderRadius: RADIUS.small,
                  backgroundColor: theme.fieldBg,
                  borderWidth: 1,
                  borderColor: theme.fieldBorder,
                  justifyContent: 'center',
                  paddingHorizontal: 14,
                }}
              >
                <TextInput
                  value={promo}
                  onChangeText={setPromo}
                  placeholder="Code eingeben"
                  placeholderTextColor={theme.muted}
                  autoCapitalize="characters"
                  style={{
                    fontFamily: FONTS.book,
                    fontSize: TYPE.body,
                    color: theme.ink,
                    height: '100%',
                  }}
                />
              </View>
            </DCard>

            <DCard style={{ gap: 10 }}>
              <Row k={`Waschgang · ${prog.name}`} v={money(machine.price + prog.add)} />
              {EXTRAS.filter((e) => extras[e.id]).map((e) => (
                <Row key={e.id} k={e.name} v={money(e.add)} />
              ))}
              <View style={{ height: 1, backgroundColor: theme.line }} />
              <View style={{ flexDirection: 'row', justifyContent: 'space-between' }}>
                <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.title, color: theme.ink }}>
                  Gesamt
                </Text>
                <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.title, color: theme.ink }}>
                  {money(total)}
                </Text>
              </View>
              {payId === 'guthaben' && (
                <Txt size={TYPE.label2} color={theme.muted}>
                  Verbleibendes Guthaben nach Zahlung: {money(GUTHABEN - total)}
                </Txt>
              )}
            </DCard>
          </View>
        )}
      </ScrollView>

      {/* Sticky bottom CTA */}
      <View
        style={{
          position: 'absolute',
          left: 0,
          right: 0,
          bottom: 0,
          padding: 16,
          backgroundColor: theme.bg,
          borderTopWidth: 1,
          borderTopColor: theme.line,
        }}
      >
        <DButton
          disabled={!canNext || busy}
          onPress={() => (step < 3 ? setStep(step + 1) : confirm())}
        >
          {step < 3 ? 'Weiter' : busy ? 'Wird gebucht …' : `${money(total)} bezahlen & buchen`}
        </DButton>
      </View>
    </SafeAreaView>
  );
}

function Row({ k, v }: { k: string; v: string }) {
  const { theme } = useTheme();
  return (
    <View style={{ flexDirection: 'row', justifyContent: 'space-between', gap: 12 }}>
      <Txt size={TYPE.body} color={theme.inkSoft}>
        {k}
      </Txt>
      <Txt size={TYPE.body} font={FONTS.medium}>
        {v}
      </Txt>
    </View>
  );
}

// ---------------------------------------------------------------------------
// Bestätigung — check con halo pulsante + resumen + hinweis QR
// ---------------------------------------------------------------------------
function ConfirmView({
  machineName,
  dayLabel,
  date,
  month,
  start,
  end,
  total,
  onDone,
}: {
  machineName: string;
  dayLabel: string;
  date: number;
  month: string;
  start: string;
  end: string;
  total: number;
  onDone: () => void;
}) {
  const { theme } = useTheme();
  const halo = useRef(new Animated.Value(0)).current;
  useEffect(() => {
    const loop = Animated.loop(
      Animated.timing(halo, {
        toValue: 1,
        duration: 1600,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      })
    );
    loop.start();
    return () => loop.stop();
  }, [halo]);
  const haloScale = halo.interpolate({ inputRange: [0, 1], outputRange: [1, 1.9] });
  const haloOpacity = halo.interpolate({ inputRange: [0, 1], outputRange: [0.35, 0] });

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }}>
      <View style={{ flex: 1, alignItems: 'center', justifyContent: 'center', padding: 24, gap: 18 }}>
        <View style={{ width: 110, height: 110, alignItems: 'center', justifyContent: 'center' }}>
          <Animated.View
            style={{
              position: 'absolute',
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: theme.accent,
              transform: [{ scale: haloScale }],
              opacity: haloOpacity,
            }}
          />
          <View
            style={{
              width: 84,
              height: 84,
              borderRadius: 42,
              backgroundColor: theme.accent,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconCheck size={40} color="#fff" strokeWidth={2.6} />
          </View>
        </View>

        <Text style={{ fontFamily: FONTS.bold, fontSize: 26, color: theme.ink, textAlign: 'center' }}>
          Buchung bestätigt!
        </Text>
        <Txt size={TYPE.body2} color={theme.inkSoft} style={{ textAlign: 'center', maxWidth: 280 }}>
          Wir erinnern dich 15 Minuten vor deinem Termin.
        </Txt>

        <DCard style={{ alignSelf: 'stretch', gap: 10 }}>
          <Row k="Maschine" v={machineName} />
          <Row k="Datum" v={`${dayLabel === 'HEUTE' ? 'Heute' : dayLabel}, ${date}. ${month}`} />
          <Row k="Uhrzeit" v={`${start} – ${end}`} />
          <Row k="Bezahlt" v={money(total)} />
          <View style={{ height: 1, backgroundColor: theme.line }} />
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            <IconQr size={19} color={theme.accent} />
            <Txt size={TYPE.body} color={theme.inkSoft} style={{ flex: 1 }}>
              QR-Code an der Maschine vorzeigen
            </Txt>
          </View>
        </DCard>

        <DButton onPress={onDone} style={{ alignSelf: 'stretch' }}>
          Fertig
        </DButton>
      </View>
    </SafeAreaView>
  );
}
