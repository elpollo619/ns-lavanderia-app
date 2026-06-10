/**
 * Meine Buchungen — lista de reservas del usuario (próximas + historial).
 * Cancelación de reservas futuras vía RLS (reservations_cancel_own_future).
 */
import React, { useCallback, useEffect, useState } from 'react';
import { Alert, RefreshControl, ScrollView, Text, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { BookingRow, cancelBooking, listMyBookings } from '@/api/bookings';
import { useBooking } from '@/design/BookingContext';
import { DCard, Label, Press, Txt } from '@/design/components';
import { IconChevronLeft } from '@/design/icons';
import { FONTS, RADIUS, TYPE, money, useTheme } from '@/design/theme';

const STATUS_LABEL: Record<BookingRow['status'], string> = {
  pending_payment: 'Zahlung offen',
  confirmed: 'Bestätigt',
  active: 'Läuft',
  completed: 'Abgeschlossen',
  cancelled: 'Storniert',
  noshowed: 'Nicht erschienen',
};

const MONTHS = ['Jan', 'Feb', 'Mär', 'Apr', 'Mai', 'Jun', 'Jul', 'Aug', 'Sep', 'Okt', 'Nov', 'Dez'];
const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];

function fmt(row: BookingRow): string {
  const s = new Date(row.start_time);
  const e = new Date(row.end_time);
  const hh = (d: Date) =>
    `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;
  return `${WEEKDAYS[s.getDay()]}, ${s.getDate()}. ${MONTHS[s.getMonth()]} · ${hh(s)} – ${hh(e)}`;
}

export default function BuchungenScreen() {
  const { theme } = useTheme();
  const router = useRouter();
  const { refresh } = useBooking();
  const [rows, setRows] = useState<BookingRow[] | null>(null);
  const [refreshing, setRefreshing] = useState(false);

  const load = useCallback(async () => {
    try {
      setRows(await listMyBookings());
    } catch {
      setRows([]);
    }
  }, []);

  useEffect(() => {
    load();
  }, [load]);

  const onCancel = (row: BookingRow) => {
    Alert.alert(
      'Buchung stornieren?',
      `${row.machines?.name ?? 'Maschine'} · ${fmt(row)}`,
      [
        { text: 'Behalten', style: 'cancel' },
        {
          text: 'Stornieren',
          style: 'destructive',
          onPress: async () => {
            try {
              await cancelBooking(row.id);
              await load();
              await refresh();
            } catch (err) {
              Alert.alert(
                "N's LAVANDERIA",
                err instanceof Error ? err.message : 'Stornieren fehlgeschlagen.'
              );
            }
          },
        },
      ]
    );
  };

  const cancellable = (row: BookingRow) =>
    ['pending_payment', 'confirmed'].includes(row.status) &&
    new Date(row.start_time).getTime() > Date.now();

  const statusColor = (row: BookingRow) =>
    row.status === 'confirmed' || row.status === 'active'
      ? theme.green
      : row.status === 'pending_payment'
        ? theme.amber
        : theme.muted;

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: theme.bg }} edges={['top']}>
      {/* Header */}
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
          Meine Buchungen
        </Text>
      </View>

      <ScrollView
        contentContainerStyle={{ padding: 20, gap: 12, paddingBottom: 28 }}
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
        {rows === null ? (
          <Txt size={TYPE.body} color={theme.muted}>
            Wird geladen …
          </Txt>
        ) : rows.length === 0 ? (
          <DCard style={{ alignItems: 'center', gap: 6, paddingVertical: 28 }}>
            <Txt size={TYPE.body2} font={FONTS.medium}>
              Noch keine Buchungen
            </Txt>
            <Txt size={TYPE.body} color={theme.muted}>
              Deine Reservierungen erscheinen hier.
            </Txt>
          </DCard>
        ) : (
          rows.map((row) => (
            <DCard key={row.id} style={{ gap: 8 }}>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Txt size={TYPE.body2} font={FONTS.bold} style={{ flex: 1 }}>
                  {row.machines?.name ?? 'Maschine'}
                </Txt>
                <View
                  style={{
                    backgroundColor: theme.surfaceAlt,
                    borderRadius: RADIUS.pill,
                    paddingHorizontal: 10,
                    paddingVertical: 4,
                  }}
                >
                  <Text
                    style={{
                      fontFamily: FONTS.medium,
                      fontSize: TYPE.label,
                      color: statusColor(row),
                    }}
                  >
                    {STATUS_LABEL[row.status]}
                  </Text>
                </View>
              </View>
              <Txt size={TYPE.body} color={theme.inkSoft}>
                {fmt(row)}
              </Txt>
              <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
                <Txt size={TYPE.body} color={theme.muted} style={{ flex: 1 }}>
                  {row.program ? `${row.program} · ` : ''}
                  {money(row.amount_cents / 100)}
                </Txt>
                {cancellable(row) && (
                  <Press onPress={() => onCancel(row)}>
                    <View style={{ minHeight: 44, justifyContent: 'center', paddingHorizontal: 6 }}>
                      <Text
                        style={{ fontFamily: FONTS.medium, fontSize: TYPE.body, color: theme.danger }}
                      >
                        Stornieren
                      </Text>
                    </View>
                  </Press>
                )}
              </View>
            </DCard>
          ))
        )}
        <Label style={{ textAlign: 'center', marginTop: 8 }}>
          Zahlung vor Ort · Online-Zahlung folgt
        </Label>
      </ScrollView>
    </SafeAreaView>
  );
}
