/**
 * Start / Home — handoff: app/screens-home.jsx.
 * Saludo · próxima reserva o disponibilidad · lista de máquinas con estado live ·
 * promo "Deine 5. Ladung gratis".
 */
import React, { useMemo, useState } from 'react';
import { Alert, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { openMachine } from '@/api/salto';
import { useAuth } from '@/contexts/AuthContext';
import { useBooking } from '@/design/BookingContext';
import { Chip, DButton, DCard, Label, MachineCard, Press, SectionTitle, Txt } from '@/design/components';
import { MachineType } from '@/design/data';
import { useMachines } from '@/design/useMachines';
import { useLoyalty } from '@/design/useLoyalty';
import { IconBell, IconGift, IconQr } from '@/design/icons';
import { BRAND, FONTS, RADIUS, TYPE, money, useTheme } from '@/design/theme';

type Filter = 'alle' | MachineType;

export default function HomeScreen() {
  const { theme } = useTheme();
  const { user } = useAuth();
  const { booking } = useBooking();
  const router = useRouter();
  const [filter, setFilter] = useState<Filter>('alle');
  const { machines: allMachines } = useMachines();
  const loyalty = useLoyalty();
  const [opening, setOpening] = useState(false);

  const handleOpen = async () => {
    if (!booking || opening) return;
    setOpening(true);
    const res = await openMachine(booking.machineId);
    setOpening(false);
    Alert.alert(
      "N's LAVANDERIA",
      res.ok ? 'Tür geöffnet. Gute Wäsche!' : res.error ?? 'Öffnen fehlgeschlagen.'
    );
  };

  const userName = useMemo(() => {
    const raw = (user?.user_metadata?.name as string) || user?.email || 'Gast';
    return raw.includes('@') ? raw.split('@')[0] : raw;
  }, [user]);

  const initials = useMemo(
    () =>
      userName
        .split(/[\s._-]+/)
        .map((p) => p[0])
        .filter(Boolean)
        .slice(0, 2)
        .join('')
        .toUpperCase(),
    [userName]
  );

  const machines = allMachines.filter((m) => filter === 'alle' || m.type === filter);
  const freeCount = allMachines.filter((m) => m.status === 'frei').length;

  const startBooking = (machineId?: string) =>
    router.push(machineId ? `/(tabs)/buchen?machine=${machineId}` : '/(tabs)/buchen');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 20, paddingBottom: 28 }}>
        {/* Header */}
        <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
          <View style={{ flex: 1 }}>
            <Txt size={TYPE.body2} color={theme.inkSoft}>
              Guten Tag,
            </Txt>
            <Text style={{ fontFamily: FONTS.bold, fontSize: 24, color: theme.ink }}>
              {userName}
            </Text>
          </View>
          <Press onPress={() => {}}>
            <View
              style={{
                width: 46,
                height: 46,
                borderRadius: 23,
                backgroundColor: theme.surface,
                borderWidth: 1,
                borderColor: theme.line,
                alignItems: 'center',
                justifyContent: 'center',
              }}
            >
              <IconBell size={21} color={theme.ink} />
            </View>
          </Press>
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: theme.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.bold, fontSize: 15, color: theme.accent }}>
              {initials}
            </Text>
          </View>
        </View>

        {/* Próxima reserva o disponibilidad */}
        {booking ? (
          <DCard style={{ padding: 0, overflow: 'hidden' }}>
            <View style={{ backgroundColor: theme.accentSoft, paddingHorizontal: 18, paddingVertical: 10 }}>
              <Label color={theme.accent}>Deine nächste Buchung</Label>
            </View>
            <View
              style={{
                padding: 18,
                flexDirection: 'row',
                alignItems: 'center',
                gap: 12,
              }}
            >
              <View style={{ flex: 1, gap: 3 }}>
                <Txt size={TYPE.title} font={FONTS.bold}>
                  {booking.machineName}
                </Txt>
                <Txt size={TYPE.body} color={theme.inkSoft}>
                  {booking.dayLabel === 'HEUTE' ? 'Heute' : booking.dayLabel} {booking.date}. {booking.month} ·{' '}
                  {booking.start}–{booking.end} · {booking.programName}
                </Txt>
              </View>
              <Press onPress={handleOpen}>
                <View
                  style={{
                    flexDirection: 'row',
                    alignItems: 'center',
                    gap: 6,
                    backgroundColor: theme.accent,
                    borderRadius: RADIUS.pill,
                    paddingHorizontal: 14,
                    minHeight: 44,
                    opacity: opening ? 0.6 : 1,
                  }}
                >
                  <IconQr size={17} color="#fff" />
                  <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.body, color: '#fff' }}>
                    {opening ? 'Öffnet …' : 'Öffnen'}
                  </Text>
                </View>
              </Press>
            </View>
          </DCard>
        ) : (
          <DCard>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
              <View style={{ flex: 1, gap: 4 }}>
                <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.titleLg, color: theme.ink }}>
                  {freeCount} Maschinen jetzt frei
                </Text>
                <Txt size={TYPE.body} color={theme.inkSoft}>
                  Jetzt buchen und Zeit sparen.
                </Txt>
              </View>
              <DButton onPress={() => startBooking()} style={{ minWidth: 110 }}>
                Buchen
              </DButton>
            </View>
          </DCard>
        )}

        {/* Maschinen */}
        <View style={{ gap: 14 }}>
          <SectionTitle
            title="Maschinen"
            right={
              <Txt size={TYPE.body} color={theme.muted}>
                {freeCount} von {allMachines.length} frei
              </Txt>
            }
          />
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Chip label="Alle" active={filter === 'alle'} onPress={() => setFilter('alle')} />
            <Chip label="Waschen" active={filter === 'waschen'} onPress={() => setFilter('waschen')} />
            <Chip label="Trocknen" active={filter === 'trocknen'} onPress={() => setFilter('trocknen')} />
          </View>
          <View style={{ gap: 12 }}>
            {machines.map((m) => (
              <MachineCard
                key={m.id}
                machine={m}
                onPress={m.status === 'frei' ? () => startBooking(m.id) : undefined}
              />
            ))}
          </View>
        </View>

        {/* Promo */}
        <LinearGradient
          colors={[BRAND.dunkelblau, '#3a4568']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: RADIUS.card, padding: 18, flexDirection: 'row', alignItems: 'center', gap: 14 }}
        >
          <View
            style={{
              width: 46,
              height: 46,
              borderRadius: 23,
              backgroundColor: 'rgba(255,255,255,0.10)',
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <IconGift size={22} color={BRAND.hellblauDark} />
          </View>
          <View style={{ flex: 1, gap: 7 }}>
            <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.body2, color: '#fff' }}>
              Deine 5. Ladung gratis
            </Text>
            <View
              style={{
                height: 6,
                borderRadius: 3,
                backgroundColor: 'rgba(255,255,255,0.15)',
                overflow: 'hidden',
              }}
            >
              <View
                style={{
                  width: `${(loyalty.progress / 5) * 100}%`,
                  height: '100%',
                  borderRadius: 3,
                  backgroundColor: BRAND.hellblauDark,
                }}
              />
            </View>
            <Text style={{ fontFamily: FONTS.medium, fontSize: TYPE.label2, color: 'rgba(255,255,255,0.7)' }}>
              {loyalty.progress} von 5 Ladungen
            </Text>
          </View>
        </LinearGradient>
      </ScrollView>
    </SafeAreaView>
  );
}
