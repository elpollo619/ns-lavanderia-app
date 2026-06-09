import { supabase } from '@/lib/supabase';
import type { Machine } from '@/types/database';

/**
 * Devuelve todas las máquinas (no filtra por status: queremos mostrar también
 * las ocupadas / en mantenimiento, con su badge correspondiente).
 */
export async function listMachines(): Promise<Machine[]> {
  const { data, error } = await supabase
    .from('machines')
    .select('*')
    .order('name', { ascending: true });

  if (error) throw error;
  return (data ?? []) as Machine[];
}
