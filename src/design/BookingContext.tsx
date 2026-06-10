/**
 * Estado app-level del handoff: booking actual (para la next-booking card del Home).
 * Se hidrata desde Supabase al arrancar (próxima reserva vigente del usuario)
 * y se actualiza en memoria al confirmar una nueva en el flujo Buchen.
 */
import React, { createContext, useContext, useEffect, useState } from 'react';
import { BookingRow, getNextBooking } from '@/api/bookings';
import { useAuth } from '@/contexts/AuthContext';

export interface Booking {
  machineId: string;
  machineName: string;
  machineType: 'waschen' | 'trocknen';
  dayLabel: string;   // "HEUTE" | "Mo" ...
  date: number;
  month: string;
  start: string;      // "14:00"
  end: string;        // "14:45"
  programName: string;
  total: number;
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];

const hhmm = (d: Date) =>
  `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`;

export function rowToBooking(row: BookingRow): Booking {
  const start = new Date(row.start_time);
  const end = new Date(row.end_time);
  const isToday = start.toDateString() === new Date().toDateString();
  return {
    machineId: row.machine_id,
    machineName: row.machines?.name ?? 'Maschine',
    machineType: row.machines?.machine_type === 'dryer' ? 'trocknen' : 'waschen',
    dayLabel: isToday ? 'HEUTE' : WEEKDAYS[start.getDay()],
    date: start.getDate(),
    month: MONTHS[start.getMonth()],
    start: hhmm(start),
    end: hhmm(end),
    programName: row.program ?? '',
    total: row.amount_cents / 100,
  };
}

interface BookingContextValue {
  booking: Booking | null;
  setBooking: (b: Booking | null) => void;
  refresh: () => Promise<void>;
}

const BookingContext = createContext<BookingContextValue>({
  booking: null,
  setBooking: () => {},
  refresh: async () => {},
});

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const { user } = useAuth();
  const [booking, setBooking] = useState<Booking | null>(null);

  const refresh = async () => {
    if (!user) return;
    const row = await getNextBooking();
    setBooking(row ? rowToBooking(row) : null);
  };

  useEffect(() => {
    if (user) {
      refresh();
    } else {
      setBooking(null);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user?.id]);

  return (
    <BookingContext.Provider value={{ booking, setBooking, refresh }}>
      {children}
    </BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
