import { EXTRAS, PROGRAMS, buildDays, buildSlots } from '../data';

describe('PROGRAMS (handoff: Eco/Standard/Intensiv)', () => {
  it('tiene los tres programas con duración y recargo del diseño', () => {
    expect(PROGRAMS).toHaveLength(3);
    expect(PROGRAMS.find((p) => p.id === 'eco')).toMatchObject({ mins: 35, add: 0 });
    expect(PROGRAMS.find((p) => p.id === 'standard')).toMatchObject({ mins: 45, add: 0.5 });
    expect(PROGRAMS.find((p) => p.id === 'intensiv')).toMatchObject({ mins: 60, add: 1.5 });
  });
});

describe('EXTRAS (handoff)', () => {
  it('precios exactos del diseño', () => {
    expect(EXTRAS.find((e) => e.id === 'waschmittel')?.add).toBe(1.5);
    expect(EXTRAS.find((e) => e.id === 'weichspueler')?.add).toBe(1.0);
    expect(EXTRAS.find((e) => e.id === 'express')?.add).toBe(0.8);
  });
});

describe('total de la reserva = máquina + programa + extras', () => {
  it('Waschmaschine (4.50) + Standard (0.50) + Waschmittel (1.50) = 6.50', () => {
    const machinePrice = 4.5;
    const prog = PROGRAMS.find((p) => p.id === 'standard')!;
    const extras = EXTRAS.filter((e) => e.id === 'waschmittel');
    const total = machinePrice + prog.add + extras.reduce((s, e) => s + e.add, 0);
    expect(total).toBeCloseTo(6.5);
  });
});

describe('buildDays', () => {
  it('genera 7 días empezando por HEUTE', () => {
    const days = buildDays();
    expect(days).toHaveLength(7);
    expect(days[0].label).toBe('HEUTE');
    expect(days[1].label).not.toBe('HEUTE');
  });
});

describe('buildSlots', () => {
  it('genera slots de 07:00 a 21:00', () => {
    const slots = buildSlots();
    expect(slots[0].label).toBe('07:00');
    expect(slots[slots.length - 1].label).toBe('21:00');
    expect(slots).toHaveLength(15);
  });
});
