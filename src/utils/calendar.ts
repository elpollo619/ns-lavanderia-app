import type { DurationMinutes } from '@/types/database';

/** Formatea una fecha como "Mo, 09.06.2026" (estilo suizo alemán). */
export function formatDateDE(date: Date): string {
  return date.toLocaleDateString('de-CH', {
    weekday: 'short',
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
}

/** Formatea hora como "14:30". */
export function formatTimeDE(date: Date): string {
  return date.toLocaleTimeString('de-CH', {
    hour: '2-digit',
    minute: '2-digit',
  });
}

/** Genera slots de hora cada 30 min entre 06:00 y 22:00 para una fecha dada. */
export function generateTimeSlots(date: Date): Date[] {
  const slots: Date[] = [];
  for (let h = 6; h < 22; h++) {
    for (const m of [0, 30]) {
      const slot = new Date(date);
      slot.setHours(h, m, 0, 0);
      slots.push(slot);
    }
  }
  return slots;
}

/** Devuelve los próximos N días empezando por hoy. */
export function nextDays(count: number): Date[] {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  return Array.from({ length: count }, (_, i) => {
    const d = new Date(today);
    d.setDate(today.getDate() + i);
    return d;
  });
}

/** Calcula end = start + minutos. */
export function addMinutes(start: Date, minutes: DurationMinutes): Date {
  return new Date(start.getTime() + minutes * 60 * 1000);
}

/** True si el slot ya pasó respecto a "now". */
export function isPast(slot: Date): boolean {
  return slot.getTime() <= Date.now();
}
