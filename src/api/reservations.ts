import { supabase } from '@/lib/supabase';
import type { Reservation } from '@/types/database';

/**
 * Devuelve reservas activas (no canceladas) para una máquina en un rango de fechas.
 * Sirve para detectar overlaps antes de enviar la reserva al backend.
 */
export async function listReservationsForMachine(
  machineId: string,
  rangeStart: Date,
  rangeEnd: Date,
): Promise<Reservation[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select('*')
    .eq('machine_id', machineId)
    .in('status', ['pending', 'active'])
    .gte('end_time', rangeStart.toISOString())
    .lte('start_time', rangeEnd.toISOString());

  if (error) throw error;
  return (data ?? []) as Reservation[];
}

export interface CreateReservationInput {
  userId: string;
  machineId: string;
  startTime: Date;
  endTime: Date;
}

/**
 * Crea una reserva en estado 'pending'. El payment_intent_id se rellenará
 * después de confirmar el pago en Stripe (ver paso 3 del flujo).
 *
 * El constraint EXCLUDE de Postgres (no_overlap) garantiza atomicidad: si
 * alguien reservó el mismo slot entre el check y el insert, esta query falla.
 */
export async function createReservation(
  input: CreateReservationInput,
): Promise<Reservation> {
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      user_id: input.userId,
      machine_id: input.machineId,
      start_time: input.startTime.toISOString(),
      end_time: input.endTime.toISOString(),
      status: 'pending',
    })
    .select()
    .single();

  if (error) throw error;
  return data as Reservation;
}

/** Asocia un PaymentIntent de Stripe a una reserva ya creada. */
export async function attachPaymentIntent(
  reservationId: string,
  paymentIntentId: string,
): Promise<void> {
  const { error } = await supabase
    .from('reservations')
    .update({ payment_intent_id: paymentIntentId, status: 'active' })
    .eq('id', reservationId);

  if (error) throw error;
}

/** Comprueba localmente si dos rangos se solapan. */
export function overlaps(
  aStart: Date,
  aEnd: Date,
  bStart: Date,
  bEnd: Date,
): boolean {
  return aStart < bEnd && bStart < aEnd;
}
