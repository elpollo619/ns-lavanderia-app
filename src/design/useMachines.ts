/**
 * Máquinas desde Supabase con suscripción realtime.
 * Mapea las filas de la tabla `machines` al tipo del design system.
 * Fallback: si no hay sesión, no hay datos o falla la red, usa el mock
 * del prototipo (MACHINES) para que el diseño siga siendo demostrable.
 */
import { useEffect, useState } from 'react';
import { useAuth } from '@/contexts/AuthContext';
import { supabase } from '@/lib/supabase';
import { Machine, MACHINES } from './data';

interface MachineRow {
  id: string;
  name: string;
  machine_type: 'washer' | 'dryer';
  status: 'available' | 'in_use' | 'maintenance';
  price_cents: number;
  capacity_kg: number;
}

function mapRow(row: MachineRow): Machine {
  return {
    id: row.id,
    name: row.name,
    type: row.machine_type === 'washer' ? 'waschen' : 'trocknen',
    cap: `${row.capacity_kg} kg`,
    price: row.price_cents / 100,
    // El enum de DB no distingue fertig/reserviert; esos estados vendrán de
    // las reservas. 'maintenance' se muestra como reservado (no reservable).
    status: row.status === 'available' ? 'frei' : row.status === 'in_use' ? 'laeuft' : 'reserviert',
  };
}

/**
 * Marca como 'reserviert' (con hora) las máquinas libres que tienen una
 * reserva empezando dentro de la próxima hora, según slots_availability.
 */
async function enrichWithUpcoming(machines: Machine[]): Promise<Machine[]> {
  const now = new Date();
  const inOneHour = new Date(now.getTime() + 60 * 60000);
  const { data, error } = await supabase
    .from('slots_availability')
    .select('machine_id, slot_start, is_available')
    .eq('is_available', false)
    .gte('slot_start', now.toISOString())
    .lte('slot_start', inOneHour.toISOString())
    .order('slot_start');
  if (error || !data) return machines;

  const firstBusy = new Map<string, string>();
  for (const row of data as { machine_id: string; slot_start: string }[]) {
    if (!firstBusy.has(row.machine_id)) {
      const d = new Date(row.slot_start);
      firstBusy.set(
        row.machine_id,
        `${String(d.getHours()).padStart(2, '0')}:${String(d.getMinutes()).padStart(2, '0')}`
      );
    }
  }

  return machines.map((m) =>
    m.status === 'frei' && firstBusy.has(m.id)
      ? { ...m, status: 'reserviert' as const, reservedAt: firstBusy.get(m.id) }
      : m
  );
}

let channelSeq = 0;

export function useMachines(): { machines: Machine[]; live: boolean } {
  const { user } = useAuth();
  const [machines, setMachines] = useState<Machine[]>(MACHINES);
  const [live, setLive] = useState(false);

  // Re-ejecutar cuando la sesión esté lista: la restauración desde
  // AsyncStorage es asíncrona y el primer fetch puede salir como anon
  // (RLS lo rechaza) → quedaría el mock para siempre.
  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, machine_type, status, price_cents, capacity_kg')
        .order('name');
      if (!cancelled && !error && data && data.length > 0) {
        const mapped = await enrichWithUpcoming((data as MachineRow[]).map(mapRow));
        if (!cancelled) {
          setMachines(mapped);
          setLive(true);
        }
      }
    };

    load();

    // Nombre único por instancia: Home y Buchen usan este hook a la vez y
    // reutilizar el mismo canal tras subscribe() lanza un error de Realtime.
    const channel = supabase
      .channel(`machines-live-${++channelSeq}`)
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, [user?.id]);

  return { machines, live };
}

/**
 * Horas ocupadas (labels "HH:00") para una máquina y un día (offset desde hoy),
 * desde la vista slots_availability. Un slot de 1 h cuenta como ocupado si
 * cualquiera de sus mitades de 30 min no está disponible.
 * Devuelve null mientras carga o si no hay datos live (→ usar mock).
 */
export function useTakenSlots(machineId: string | null, dayOffset: number): Set<string> | null {
  const [taken, setTaken] = useState<Set<string> | null>(null);

  useEffect(() => {
    let cancelled = false;
    setTaken(null);
    if (!machineId) return;

    const dayStart = new Date();
    dayStart.setDate(dayStart.getDate() + dayOffset);
    dayStart.setHours(0, 0, 0, 0);
    const dayEnd = new Date(dayStart.getTime() + 24 * 3600 * 1000);

    supabase
      .from('slots_availability')
      .select('slot_start, is_available')
      .eq('machine_id', machineId)
      .eq('is_available', false)
      .gte('slot_start', dayStart.toISOString())
      .lt('slot_start', dayEnd.toISOString())
      .then(({ data, error }) => {
        if (cancelled || error || !data) return;
        const set = new Set<string>();
        for (const row of data as { slot_start: string }[]) {
          const d = new Date(row.slot_start);
          set.add(`${String(d.getHours()).padStart(2, '0')}:00`);
        }
        setTaken(set);
      });

    return () => {
      cancelled = true;
    };
  }, [machineId, dayOffset]);

  return taken;
}
