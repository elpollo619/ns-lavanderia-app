/**
 * Helpers de tiempo del flujo Buchen — puros, sin dependencias de RN.
 */

/** "14:00" + 45 → "14:45" (envuelve a medianoche). */
export function addMinutes(slot: string, mins: number): string {
  const [h, m] = slot.split(':').map(Number);
  const total = h * 60 + m + mins;
  return `${String(Math.floor(total / 60) % 24).padStart(2, '0')}:${String(total % 60).padStart(2, '0')}`;
}

/** Fecha real a partir del día seleccionado (offset desde hoy) y el slot "HH:MM". */
export function slotToDate(dayOffset: number, slot: string, from: Date = new Date()): Date {
  const [h, m] = slot.split(':').map(Number);
  const d = new Date(from);
  d.setDate(d.getDate() + dayOffset);
  d.setHours(h, m, 0, 0);
  return d;
}
