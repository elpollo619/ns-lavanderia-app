/**
 * Profil — handoff: app/screens-profile.jsx.
 * Identidad · Wallet "N's Guthaben" · Stats · Einstellungen (incl. Dunkelmodus) · Abmelden.
 */
import React, { useMemo } from 'react';
import { Alert, ScrollView, Switch, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { LinearGradient } from 'expo-linear-gradient';
import { useAuth } from '@/contexts/AuthContext';
import { DButton, DCard, Label, Press, Txt } from '@/design/components';
import { GUTHABEN } from '@/design/data';
import {
  IconBell,
  IconCalendar,
  IconCard,
  IconChevronRight,
  IconHelp,
} from '@/design/icons';
import { BRAND, FONTS, RADIUS, TYPE, money, useTheme } from '@/design/theme';

const SETTINGS = [
  { id: 'buchungen', label: 'Meine Buchungen', Icon: IconCalendar },
  { id: 'zahlung', label: 'Zahlungsarten', Icon: IconCard },
  { id: 'noti', label: 'Benachrichtigungen', Icon: IconBell },
  { id: 'hilfe', label: 'Hilfe & Support', Icon: IconHelp },
];

export default function ProfileScreen() {
  const { theme, direction, setDirection } = useTheme();
  const { user, signOut } = useAuth();
  const router = useRouter();

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

  const soon = () => Alert.alert("N's LAVANDERIA", 'Demnächst verfügbar.');

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      <ScrollView contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 28 }}>
        <Text style={{ fontFamily: FONTS.bold, fontSize: 24, color: theme.ink }}>Profil</Text>

        {/* Identidad */}
        <DCard style={{ flexDirection: 'row', alignItems: 'center', gap: 14 }}>
          <View
            style={{
              width: 56,
              height: 56,
              borderRadius: 28,
              backgroundColor: theme.accentSoft,
              alignItems: 'center',
              justifyContent: 'center',
            }}
          >
            <Text style={{ fontFamily: FONTS.bold, fontSize: 18, color: theme.accent }}>
              {initials}
            </Text>
          </View>
          <View style={{ flex: 1, gap: 3 }}>
            <View style={{ flexDirection: 'row', alignItems: 'center', gap: 8 }}>
              <Txt size={TYPE.title} font={FONTS.bold}>
                {userName}
              </Txt>
              <View
                style={{
                  backgroundColor: theme.accentSoft,
                  borderRadius: RADIUS.pill,
                  paddingHorizontal: 9,
                  paddingVertical: 3,
                }}
              >
                <Text style={{ fontFamily: FONTS.medium, fontSize: 10, color: theme.accent }}>
                  Mitglied
                </Text>
              </View>
            </View>
            <Txt size={TYPE.body} color={theme.muted} numberOfLines={1}>
              {user?.email ?? ''}
            </Txt>
          </View>
        </DCard>

        {/* Wallet */}
        <LinearGradient
          colors={[BRAND.dunkelblau, '#3a4568']}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={{ borderRadius: RADIUS.card, padding: 18, gap: 14 }}
        >
          <Label color="rgba(255,255,255,0.6)">N's Guthaben</Label>
          <Text style={{ fontFamily: FONTS.bold, fontSize: 32, color: '#fff' }}>
            {money(GUTHABEN)}
          </Text>
          <View style={{ flexDirection: 'row', gap: 10 }}>
            <Press onPress={soon} style={{ flex: 1 }}>
              <View
                style={{
                  minHeight: 44,
                  borderRadius: RADIUS.small,
                  backgroundColor: BRAND.hellblauDark,
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.body, color: '#fff' }}>
                  Aufladen
                </Text>
              </View>
            </Press>
            <Press onPress={soon} style={{ flex: 1 }}>
              <View
                style={{
                  minHeight: 44,
                  borderRadius: RADIUS.small,
                  borderWidth: 1,
                  borderColor: 'rgba(255,255,255,0.3)',
                  alignItems: 'center',
                  justifyContent: 'center',
                }}
              >
                <Text style={{ fontFamily: FONTS.medium, fontSize: TYPE.body, color: '#fff' }}>
                  Verlauf
                </Text>
              </View>
            </Press>
          </View>
        </LinearGradient>

        {/* Stats */}
        <View style={{ flexDirection: 'row', gap: 12 }}>
          <StatCard value="3" label="Ladungen / Monat" />
          <StatCard value="1" label="Gratis-Ladung" accent />
          <StatCard value={money(9)} label="Gespart" />
        </View>

        {/* Einstellungen */}
        <DCard style={{ padding: 6, gap: 0 }}>
          {SETTINGS.map((s, i) => (
            <Press
              key={s.id}
              onPress={s.id === 'buchungen' ? () => router.push('/buchungen') : soon}
            >
              <View
                style={{
                  flexDirection: 'row',
                  alignItems: 'center',
                  gap: 14,
                  paddingHorizontal: 12,
                  paddingVertical: 14,
                  borderBottomWidth: i < SETTINGS.length - 1 ? 1 : 0,
                  borderBottomColor: theme.line,
                  minHeight: 52,
                }}
              >
                <s.Icon size={20} color={theme.accent} />
                <Txt size={TYPE.body2} font={FONTS.medium} style={{ flex: 1 }}>
                  {s.label}
                </Txt>
                <IconChevronRight size={18} color={theme.muted} />
              </View>
            </Press>
          ))}
          {/* Dunkelmodus — ajuste de tema (handoff: Theme-Umschaltung als App-Einstellung) */}
          <View
            style={{
              flexDirection: 'row',
              alignItems: 'center',
              gap: 14,
              paddingHorizontal: 12,
              paddingVertical: 14,
              borderTopWidth: 1,
              borderTopColor: theme.line,
              minHeight: 52,
            }}
          >
            <View style={{ width: 20, alignItems: 'center' }}>
              <View
                style={{
                  width: 16,
                  height: 16,
                  borderRadius: 8,
                  backgroundColor: direction === 'dunkel' ? theme.accent : theme.muted,
                }}
              />
            </View>
            <Txt size={TYPE.body2} font={FONTS.medium} style={{ flex: 1 }}>
              Dunkelmodus
            </Txt>
            <Switch
              value={direction === 'dunkel'}
              onValueChange={(v) => setDirection(v ? 'dunkel' : 'hell')}
              trackColor={{ true: theme.accent, false: theme.line }}
              thumbColor="#ffffff"
            />
          </View>
        </DCard>

        {/* Abmelden */}
        <DButton variant="danger" onPress={() => signOut()}>
          Abmelden
        </DButton>

        <Txt size={TYPE.label2} color={theme.muted} style={{ textAlign: 'center' }}>
          N's LAVANDERIA · Teil der N's HOTEL Familie · Version 1.0
        </Txt>
      </ScrollView>
    </SafeAreaView>
  );
}

function StatCard({ value, label, accent }: { value: string; label: string; accent?: boolean }) {
  const { theme } = useTheme();
  return (
    <DCard style={{ flex: 1, alignItems: 'center', gap: 4, paddingVertical: 16, paddingHorizontal: 8 }}>
      <Text
        style={{
          fontFamily: FONTS.bold,
          fontSize: 20,
          color: accent ? theme.accent : theme.ink,
        }}
      >
        {value}
      </Text>
      <Text
        style={{
          fontFamily: FONTS.medium,
          fontSize: 10,
          color: theme.muted,
          textAlign: 'center',
        }}
      >
        {label}
      </Text>
    </DCard>
  );
}
