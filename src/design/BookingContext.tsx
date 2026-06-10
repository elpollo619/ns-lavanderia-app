/**
 * Estado app-level del handoff: booking actual (para la next-booking card del Home).
 */
import React, { createContext, useContext, useState } from 'react';

export interface Booking {
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

interface BookingContextValue {
  booking: Booking | null;
  setBooking: (b: Booking | null) => void;
}

const BookingContext = createContext<BookingContextValue>({
  booking: null,
  setBooking: () => {},
});

export function BookingProvider({ children }: { children: React.ReactNode }) {
  const [booking, setBooking] = useState<Booking | null>(null);
  return (
    <BookingContext.Provider value={{ booking, setBooking }}>{children}</BookingContext.Provider>
  );
}

export function useBooking() {
  return useContext(BookingContext);
}
