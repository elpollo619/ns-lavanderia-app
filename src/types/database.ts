/**
 * Tipos del esquema Supabase para N's Lavandería.
 * Idealmente generar via `supabase gen types typescript` y reemplazar este archivo.
 */

export type MachineType = 'washer' | 'dryer';
export type MachineStatus = 'available' | 'in_use' | 'maintenance';

export interface Machine {
  id: string;
  name: string;
  machine_type: MachineType;
  status: MachineStatus;
  location: string | null;
  created_at: string;
}

export type ReservationStatus =
  | 'pending'
  | 'active'
  | 'completed'
  | 'cancelled'
  | 'noshowed';

export interface Reservation {
  id: string;
  user_id: string;
  machine_id: string;
  start_time: string; // ISO
  end_time: string;   // ISO
  status: ReservationStatus;
  payment_intent_id: string | null;
  created_at: string;
}

/** Duración seleccionable por el usuario en el flujo de reserva. */
export type DurationMinutes = 30 | 60 | 120;

/** Precio por duración (CHF). Centralizado para fácil ajuste. */
export const PRICE_BY_DURATION_CHF: Record<DurationMinutes, number> = {
  30: 4.5,
  60: 7.5,
  120: 12,
};
