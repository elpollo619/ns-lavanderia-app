/**
 * Admin-Bereich — dashboard del dueño (v1).
 * Solo visible/usable con users.role='admin' (las políticas RLS con
 * is_admin() permiten ver todas las reservas y editar máquinas).
 * Umsatz del mes · Buchungen de hoy · máquinas con toggle Wartung.
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, TextInput, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { supabase } from '@/lib/supabase';
import { DButton, DCard, Label, Press, Txt } from '@/design/components';
import { IconChevronLeft } from '@/design/icons';
import { FONTS, RADIUS, TYPE, money, useTheme } from '@/design/theme';
import { useIsAdmin, useRole } from '@/design/useRole';

interface AdminMachine {
  id: string;
  name: string;
  status: 'available' | 'in_use' | 'maintenance' | 'offline';
}

interface AdminStandort {
  id: string;
  slug: string;
  name: string;
  city: string | null;
  status: string;
  machines: { count: number }[];
}

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/ä/g, 'ae')
    .replace(/ö/g, 'oe')
    .replace(/ü/g, 'ue')
    .replace(/ß/g, 'ss')
    .replace(/[''’]/g, '')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
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
  const { isSuperadmin } = useRole();

  const [revenueMonth, setRevenueMonth] = useState<number | null>(null);
  const [today, setToday] = useState<AdminBooking[] | null>(null);
  const [machines, setMachines] = useState<AdminMachine[]>([]);
  const [standorte, setStandorte] = useState<AdminStandort[]>([]);
  const [refreshing, setRefreshing] = useState(false);

  // Formularios superadmin
  const [newName, setNewName] = useState('');
  const [newCity, setNewCity] = useState('');
  const [adminEmail, setAdminEmail] = useState('');
  const [adminTarget, setAdminTarget] = useState<AdminStandort | null>(null);

  const load = useCallback(async () => {
    const monthStart = new Date();
    monthStart.setDate(1);
    monthStart.setHours(0, 0, 0, 0);
    const dayStart = new Date();
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);

    const [rev, tod, mach, std] = await Promise.all([
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
      supabase.from('standorte').select('id, slug, name, city, status, machines(count)').order('name'),
    ]);

    setRevenueMonth(
      (rev.data ?? []).reduce((sum, r) => sum + ((r as { amount_cents: number }).amount_cents ?? 0), 0) / 100
    );
    setToday((tod.data ?? []) as unknown as AdminBooking[]);
    setMachines((mach.data ?? []) as AdminMachine[]);
    setStandorte((std.data ?? []) as unknown as AdminStandort[]);
  }, []);

  const createStandort = async () => {
    if (!newName.trim()) return;
    const { error } = await supabase.from('standorte').insert({
      name: newName.trim(),
      city: newCity.trim() || null,
      slug: slugify(newName),
      status: 'coming_soon',
    });
    if (error) {
      Alert.alert('Admin', error.message);
      return;
    }
    setNewName('');
    setNewCity('');
    await load();
  };

  const addStandortAdmin = async () => {
    if (!adminTarget || !adminEmail.trim()) return;
    const { data: u } = await supabase
      .from('users')
      .select('id')
      .eq('email', adminEmail.trim().toLowerCase())
      .maybeSingle();
    if (!u) {
      Alert.alert('Admin', 'Kein Konto mit dieser E-Mail gefunden. Die Person muss sich zuerst in der App registrieren.');
      return;
    }
    const { error } = await supabase
      .from('standort_admins')
      .insert({ standort_id: adminTarget.id, user_id: u.id });
    if (error) {
      Alert.alert('Admin', error.message.includes('duplicate') ? 'Ist bereits Admin dieses Standorts.' : error.message);
      return;
    }
    Alert.alert('Admin', `${adminEmail.trim()} ist jetzt Admin von ${adminTarget.name}.`);
    setAdminEmail('');
    setAdminTarget(null);
  };

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

          {/* Standorte */}
          <View style={{ gap: 10 }}>
            <Label>Standorte</Label>
            {standorte.map((s) => (
              <DCard key={s.id} style={{ gap: 8 }}>
                <View style={{ flexDirection: 'row', alignItems: 'center', gap: 12 }}>
                  <View style={{ flex: 1, gap: 2 }}>
                    <Txt size={TYPE.body2} font={FONTS.medium}>
                      {s.name}
                    </Txt>
                    <Txt size={TYPE.label2} color={theme.muted}>
                      {s.city ?? '—'} · {s.machines?.[0]?.count ?? 0} Maschinen ·{' '}
                      {s.status === 'active' ? 'Aktiv' : s.status === 'coming_soon' ? 'Bald' : 'Inaktiv'}
                    </Txt>
                  </View>
                  {isSuperadmin && (
                    <Press onPress={() => setAdminTarget(adminTarget?.id === s.id ? null : s)}>
                      <View
                        style={{
                          minHeight: 44,
                          paddingHorizontal: 14,
                          borderRadius: RADIUS.small,
                          borderWidth: 1,
                          borderColor: theme.accent,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontFamily: FONTS.medium, fontSize: TYPE.body, color: theme.accent }}>
                          Admin +
                        </Text>
                      </View>
                    </Press>
                  )}
                </View>
                {isSuperadmin && adminTarget?.id === s.id && (
                  <View style={{ flexDirection: 'row', gap: 10, alignItems: 'center' }}>
                    <View
                      style={{
                        flex: 1,
                        height: 44,
                        borderRadius: RADIUS.small,
                        backgroundColor: theme.fieldBg,
                        borderWidth: 1,
                        borderColor: theme.fieldBorder,
                        justifyContent: 'center',
                        paddingHorizontal: 12,
                      }}
                    >
                      <TextInput
                        value={adminEmail}
                        onChangeText={setAdminEmail}
                        placeholder="E-Mail des neuen Admins"
                        placeholderTextColor={theme.muted}
                        autoCapitalize="none"
                        keyboardType="email-address"
                        style={{ fontFamily: FONTS.book, fontSize: TYPE.body, color: theme.ink, height: '100%' }}
                      />
                    </View>
                    <Press onPress={addStandortAdmin}>
                      <View
                        style={{
                          minHeight: 44,
                          paddingHorizontal: 16,
                          borderRadius: RADIUS.small,
                          backgroundColor: theme.accent,
                          alignItems: 'center',
                          justifyContent: 'center',
                        }}
                      >
                        <Text style={{ fontFamily: FONTS.bold, fontSize: TYPE.body, color: '#fff' }}>
                          Zuweisen
                        </Text>
                      </View>
                    </Press>
                  </View>
                )}
              </DCard>
            ))}

            {/* Neuer Standort — solo superadmin */}
            {isSuperadmin && (
              <DCard style={{ gap: 10 }}>
                <Label>Neuer Standort</Label>
                <View style={{ flexDirection: 'row', gap: 10 }}>
                  {[
                    { value: newName, set: setNewName, ph: 'Name (z. B. Bahnhofstrasse Bern)' },
                    { value: newCity, set: setNewCity, ph: 'Ort' },
                  ].map((f, i) => (
                    <View
                      key={i}
                      style={{
                        flex: i === 0 ? 2 : 1,
                        height: 44,
                        borderRadius: RADIUS.small,
                        backgroundColor: theme.fieldBg,
                        borderWidth: 1,
                        borderColor: theme.fieldBorder,
                        justifyContent: 'center',
                        paddingHorizontal: 12,
                      }}
                    >
                      <TextInput
                        value={f.value}
                        onChangeText={f.set}
                        placeholder={f.ph}
                        placeholderTextColor={theme.muted}
                        style={{ fontFamily: FONTS.book, fontSize: TYPE.body, color: theme.ink, height: '100%' }}
                      />
                    </View>
                  ))}
                </View>
                <DButton onPress={createStandort} disabled={!newName.trim()}>
                  Standort anlegen
                </DButton>
              </DCard>
            )}
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
