/**
 * Admin-Bereich — dashboard del dueño (v1).
 * Solo visible/usable con users.role='admin' (las políticas RLS con
 * is_admin() permiten ver todas las reservas y editar máquinas).
 * Umsatz del mes · Buchungen de hoy · máquinas con toggle Wartung.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { DCard, Label, Press, Txt } from '@/design/components';
import { IconChevronLeft } from '@/design/icons';
import { FONTS, RADIUS, TYPE, money, useTheme } from '@/design/theme';
import { useIsAdmin } from '@/design/useRole';

interface AdminMachine {
  id: string;
  name: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
}

interface AdminBooking {
  id: string;
  start_time: string;
  end_time: string;
  status: string;
  amount_cents: number;
  machines: { name: string } | null;
}

const STATUS_DE: Record<string, string> = {
  available: 'Verfügbar',
  in_use: 'Läuft',
  maintenance: 'Wartung',
  offline: 'Offline',
  pending_payment: 'Zahlung offen',
  confirmed: 'Bestätigt',
  active: 'Läuft',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
  noshowed: 'No-Show',
};

export default function AdminScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const isAdmin = useIsAdmin();

  const [revenueMonth, setRevenueMonth] = useState<number | null>(null);
  const [today, setToday] = useState<AdminBooking[] | null>(null);
  const [machines, setMachines] = useState<AdminMachine[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);

    const [rev, tod, mach] = await Promise.all([
      supabase
        .from('reservations')
        .select('amount_cents')
        .in('status', ['confirmed', 'active', 'completed'])
        .gte('start_time', monthStart.toISOString()),
      supabase
        .from('reservations')
        .select('id, start_time, end_time, status, amount_cents, machines(name)')
        .gte('start_time', dayStart.toISOString())
        .lt('start_time', dayEnd.toISOString())
        .order('start_time'),
      supabase.from('machines').select('id, name, status').order('name'),
    ]);

    setRevenueMonth(
      (rev.data ?? []).reduce((sum, r) => sum + ((r as { amount_cents: number }).amount_cents ?? 0), 0) / 100
    );
    setToday((tod.data ?? []) as unknown as AdminBooking[]);
    setMachines((mach.data ?? []) as AdminMachine[]);
  }, []);

  useEffect(() => {
    if (isAdmin) load();
  }, [isAdmin, load]);

  const toggleMaintenance = async (m: AdminMachine) => {
    const next = m.status === 'maintenance' ? 'available' : 'maintenance';
    const { error } = await supabase.from('machines').update({ status: next }).eq('id', m.id);
    if (error) {
      Alert.alert('Admin', error.message);
      return;
    }
    await load();
  };

  const hhmm = (iso: string) => {
    const d = new Date(iso);
    return `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  };

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
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
        <Press onPress={() => router.back()}>
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
        <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.titleLg, color: theme.ink }}>
          Admin-Bereich
        </Text>
      </View>

      {!isAdmin ? (
        <View style={{ padding: 24 }}>
          <Txt size={TYPE.body2} color={theme.muted}>
            Kein Zugriff — dieser Bereich ist für Administratoren.
          </Txt>
        </View>
      ) : (
        <ScrollView
          contentContainerStyle={{ padding: 20, gap: 18, paddingBottom: 28 }}
          refreshControl={
            <RefreshControl
              refreshing={refreshing}
              onRefresh={async () => {
                setRefreshing(true);
                await load();
                setRefreshing(false);
              }}
              tintColor={theme.accent}
            />
          }
        >
          {/* KPIs */}
          <View style={{ flexDirection: 'row', gap: 12 }}>
            <DCard style={{ flex: 1, gap: 4 }}>
              <Label>Umsatz · Monat</Label>
              <Text style={{ fontFamily: FONTS.bold, fontSize: 22, color: theme.ink }}>
                {revenueMonth === null ? '—' : money(revenueMonth)}
              </Text>
            </DCard>
            <DCard style={{ flex: 1, gap: 4 }}>
              <Label>Buchungen · Heute</Label>
              <Text style={{ fontFamily: FONTS.bold, fontSize: 22, color: theme.ink }}>
                {today === null ? '—' : today.length}
              </Text>
            </DCard>
          </View>

          {/* Maschinen */}
          <View style={{ gap: 10 }}>
            <Label>Maschinen</Label>
            {machines.map((m) => {
              const inMaintenance = m.status === 'maintenance';
              return (
                <DCard key={m.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt size={TYPE.body2} font={FONTS.medium}>
                      {m.name}
                    </Txt>
                    <Txt size={TYPE.label2} color={inMaintenance ? theme.amber : theme.muted}>
                      {STATUS_DE[m.status] ?? m.status}
                    </Txt>
                  </View>
                  <Press onPress={() => toggleMaintenance(m)}>
                    <View
                      style={{
                        minHeight: 44,
                        paddingHorizontal: 14,
                        borderRadius: RADIUS.small,
                        borderWidth: 1,
                        borderColor: inMaintenance ? theme.green : theme.amber,
                        alignItems: 'center',
                        justifyContent: 'center',
                      }}
                    >
                      <Text
                        style={{
                          fontFamily: FONTS.medium,
                          fontSize: TYPE.body,
                          color: inMaintenance ? theme.green : theme.amber,
                        }}
                      >
                        {inMaintenance ? 'Freigeben' : 'Wartung'}
                      </Text>
                    </View>
                  </Press>
                </DCard>
              );
            })}
          </View>

          {/* Heutige Buchungen */}
          <View style={{ gap: 10 }}>
            <Label>Heutige Buchungen</Label>
            {today === null ? (
              <Txt size={TYPE.body} color={theme.muted}>
                Wird geladen …
              </Txt>
            ) : today.length === 0 ? (
              <DCard>
                <Txt size={TYPE.body} color={theme.muted}>
                  Heute keine Buchungen.
                </Txt>
              </DCard>
            ) : (
              today.map((b) => (
                <DCard key={b.id} style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt size={TYPE.body2} font={FONTS.medium}>
                      {b.machines?.name ?? 'Maschine'}
                    </Txt>
                    <Txt size={TYPE.label2} color={theme.muted}>
                      {hhmm(b.start_time)} – {hhmm(b.end_time)} · {STATUS_DE[b.status] ?? b.status}
                    </Txt>
                  </View>
                  <Txt size={TYPE.body} font={FONTS.bold}>
                    {money(b.amount_cents / 100)}
                  </Txt>
                </DCard>
              ))
            )}
          </View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
}
