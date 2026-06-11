/**
 * Reservas del flujo de diseño (Buchen).
 * "Vor Ort bezahlen" inserta directo vía RLS (sin Stripe); los métodos
 * online pasarán por la Edge Function reservations-create cuando haya claves.
 */
import { supabase } from '@/lib/supabase';

export interface BookingRow {
  id: string;
  machine_id: string;
  start_time: string;
  end_time: string;
  duration_minutes: number;
  status: 'pending_payment' | 'confirmed' | 'active' | 'completed' | 'cancelled' | 'noshowed';
  payment_method: string | null;
  amount_cents: number;
  program: string | null;
  extras: string[];
  machines: { name: string; machine_type: 'washer' | 'dryer' } | null;
}

const SELECT = `
  id, machine_id, start_time, end_time, duration_minutes, status,
  payment_method, amount_cents, program, extras,
  machines ( name, machine_type )
`;

export interface CreateVorOrtInput {
  userId: string;
  machineId: string;
  start: Date;
  durationMinutes: number;
  amountCents: number;
  program: string;
  extras: string[];
}

/** Crea una reserva pagadera en el local (status confirmed, sin PaymentIntent). */
export async function createVorOrtBooking(input: CreateVorOrtInput): Promise<BookingRow> {
  const end = new Date(input.start.getTime() + input.durationMinutes * 60000);
  const { data, error } = await supabase
    .from('reservations')
    .insert({
      user_id: input.userId,
      machine_id: input.machineId,
      start_time: input.start.toISOString(),
      end_time: end.toISOString(),
      duration_minutes: input.durationMinutes,
      status: 'confirmed',
      payment_method: 'vorort',
      amount_cents: input.amountCents,
      program: input.program,
      extras: input.extras,
    })
    .select(SELECT)
    .single();

  if (error) {
    // 23P01 = exclusion constraint no_overlap → slot ya ocupado
    if (error.code === '23P01') {
      throw new Error('Dieser Zeitslot wurde gerade vergeben. Bitte wähle einen anderen.');
    }
    throw new Error(error.message);
  }
  return data as unknown as BookingRow;
}

/** Próxima reserva vigente del usuario (para la card del Home). */
export async function getNextBooking(): Promise<BookingRow | null> {
  const { data, error } = await supabase
    .from('reservations')
    .select(SELECT)
    .in('status', ['pending_payment', 'confirmed', 'active'])
    .gte('end_time', new Date().toISOString())
    .order('start_time', { ascending: true })
    .limit(1)
    .maybeSingle();
  if (error) return null;
  return (data as unknown as BookingRow) ?? null;
}

/** Todas las reservas del usuario, más recientes primero. */
export async function listMyBookings(): Promise<BookingRow[]> {
  const { data, error } = await supabase
    .from('reservations')
    .select(SELECT)
    .order('start_time', { ascending: false })
    .limit(50);
  if (error) throw new Error(error.message);
  return (data ?? []) as unknown as BookingRow[];
}

/** Cancela una reserva futura propia (política reservations_cancel_own_future). */
export async function cancelBooking(id: string): Promise<void> {
  const { error } = await supabase
    .from('reservations')
    .update({ status: 'cancelled', cancelled_at: new Date().toISOString() })
    .eq('id', id);
  if (error) throw new Error(error.message);
  // Revocar la credencial de acceso si existía (fire-and-forget)
  revokeAccess(id).catch(() => {});
}

/**
 * Provisioning de acceso (modelo LikeMagic): credencial en SALTO KS vía
 * Seam con ventana inicio−15 → fin+15 min. Sin proveedor configurado la
 * función devuelve 'skipped' — no bloquea la reserva.
 */
export async function grantAccess(reservationId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('reservation-grant-access', {
    body: { reservation_id: reservationId },
  });
  if (error) throw new Error(error.message);
}

export async function revokeAccess(reservationId: string): Promise<void> {
  const { error } = await supabase.functions.invoke('reservation-revoke-access', {
    body: { reservation_id: reservationId },
  });
  if (error) throw new Error(error.message);
}
