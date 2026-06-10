/**
 * Datos del prototipo (handoff README) — máquinas con estado live,
 * programas, extras y métodos de pago. UI en alemán, precios en CHF.
 * Integración con Supabase: fase posterior; el diseño es la referencia.
 */

export type MachineStatus = 'frei' | 'laeuft' | 'fertig' | 'reserviert';
export type MachineType = 'waschen' | 'trocknen';

export interface Machine {
  id: string;
  name: string;
  type: MachineType;
  cap: string;
  price: number;          // CHF por Gang
  status: MachineStatus;
  endsAt?: number;        // timestamp — solo 'laeuft'
  reservedAt?: string;    // "14:00" — solo 'reserviert'
}

const now = Date.now();

export const MACHINES: Machine[] = [
  { id: 'w1', name: 'Waschmaschine 01', type: 'waschen', cap: '8 kg', price: 4.5, status: 'frei' },
  { id: 't1', name: 'Trockner 02', type: 'trocknen', cap: '7 kg', price: 3.5, status: 'laeuft', endsAt: now + 32 * 60000 },
  { id: 'w2', name: 'Waschmaschine 03', type: 'waschen', cap: '8 kg', price: 4.5, status: 'frei' },
  { id: 't2', name: 'Trockner 04', type: 'trocknen', cap: '7 kg', price: 3.5, status: 'fertig' },
  { id: 'w3', name: 'Waschmaschine 05', type: 'waschen', cap: '8 kg', price: 4.5, status: 'reserviert', reservedAt: '14:00' },
  { id: 't3', name: 'Trockner 06', type: 'trocknen', cap: '7 kg', price: 3.5, status: 'frei' },
];

export interface Program {
  id: string;
  name: string;
  temp: string;
  mins: number;
  add: number; // recargo CHF
}

export const PROGRAMS: Program[] = [
  { id: 'eco', name: 'Eco', temp: '30 °C', mins: 35, add: 0 },
  { id: 'standard', name: 'Standard', temp: '40 °C', mins: 45, add: 0.5 },
  { id: 'intensiv', name: 'Intensiv', temp: '60 °C', mins: 60, add: 1.5 },
];

export interface Extra {
  id: string;
  name: string;
  add: number;
}

export const EXTRAS: Extra[] = [
  { id: 'waschmittel', name: 'Waschmittel', add: 1.5 },
  { id: 'weichspueler', name: 'Weichspüler', add: 1.0 },
  { id: 'express', name: 'Express-Schleudern', add: 0.8 },
];

export interface PayMethod {
  id: string;
  name: string;
  detail?: string;
}

export const GUTHABEN = 32.0;

export const PAY_METHODS: PayMethod[] = [
  { id: 'karte', name: 'Karte', detail: '•••• 4242' },
  { id: 'apple', name: 'Apple Pay' },
  { id: 'guthaben', name: "N's Guthaben", detail: `CHF ${GUTHABEN.toFixed(2)}` },
  { id: 'vorort', name: 'Vor Ort bezahlen' },
];

// --------------------------------------------------------------------------
// Días (HEUTE + Mo–So) y slots de hora
// --------------------------------------------------------------------------
export interface DayItem {
  id: string;
  label: string;  // HEUTE | Mo | Di ...
  date: number;   // día del mes
  month: string;  // JUN
}

const WEEKDAYS = ['So', 'Mo', 'Di', 'Mi', 'Do', 'Fr', 'Sa'];
const MONTHS = ['JAN', 'FEB', 'MÄR', 'APR', 'MAI', 'JUN', 'JUL', 'AUG', 'SEP', 'OKT', 'NOV', 'DEZ'];

export function buildDays(count = 7): DayItem[] {
  const out: DayItem[] = [];
  for (let i = 0; i < count; i++) {
    const d = new Date();
    d.setDate(d.getDate() + i);
    out.push({
      id: `d${i}`,
      label: i === 0 ? 'HEUTE' : WEEKDAYS[d.getDay()],
      date: d.getDate(),
      month: MONTHS[d.getMonth()],
    });
  }
  return out;
}

export interface SlotItem {
  id: string;
  label: string; // "08:00"
  taken: boolean;
}

export function buildSlots(): SlotItem[] {
  const taken = new Set(['09:00', '11:00', '15:00', '18:00']);
  const out: SlotItem[] = [];
  for (let h = 7; h <= 21; h++) {
    const label = `${String(h).padStart(2, '0')}:00`;
    out.push({ id: label, label, taken: taken.has(label) });
  }
  return out;
}
