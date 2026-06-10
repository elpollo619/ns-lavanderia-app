/**
 * Máquinas desde Supabase con suscripción realtime.
 * Mapea las filas de la tabla `machines` al tipo del design system.
 * Fallback: si no hay sesión, no hay datos o falla la red, usa el mock
 * del prototipo (MACHINES) para que el diseño siga siendo demostrable.
 */
import { useEffect, useState } from 'react';
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

export function useMachines(): { machines: Machine[]; live: boolean } {
  const [machines, setMachines] = useState<Machine[]>(MACHINES);
  const [live, setLive] = useState(false);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      const { data, error } = await supabase
        .from('machines')
        .select('id, name, machine_type, status, price_cents, capacity_kg')
        .order('name');
      if (!cancelled && !error && data && data.length > 0) {
        setMachines((data as MachineRow[]).map(mapRow));
        setLive(true);
      }
    };

    load();

    const channel = supabase
      .channel('machines-live')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'machines' }, () => load())
      .subscribe();

    return () => {
      cancelled = true;
      supabase.removeChannel(channel);
    };
  }, []);

  return { machines, live };
}
