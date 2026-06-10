import { supabase } from '@/lib/supabase';

/**
 * Abre la puerta/máquina vía la Edge Function machine-open
 * (valida reserva activa y llama a Seam o SALTO según la máquina).
 */
export async function openMachine(machineId: string): Promise<{ ok: boolean; error?: string }> {
  const { data, error } = await supabase.functions.invoke('machine-open', {
    body: { machine_id: machineId },
  });
  if (error) {
    // FunctionsHttpError lleva el body con el motivo (sin reserva, sin lock, etc.)
    try {
      const ctx = await (error as { context?: Response }).context?.json();
      return { ok: false, error: ctx?.error ?? error.message };
    } catch {
      return { ok: false, error: error.message };
    }
  }
  return { ok: !!data?.ok, error: data?.error };
}
