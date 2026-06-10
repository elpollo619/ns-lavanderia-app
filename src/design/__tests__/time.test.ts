import { addMinutes, slotToDate } from '../time';

describe('addMinutes', () => {
  it('suma la duración del programa al slot', () => {
    expect(addMinutes('14:00', 35)).toBe('14:35'); // Eco
    expect(addMinutes('14:00', 45)).toBe('14:45'); // Standard
    expect(addMinutes('14:00', 60)).toBe('15:00'); // Intensiv
  });

  it('cruza la hora y la medianoche correctamente', () => {
    expect(addMinutes('09:30', 45)).toBe('10:15');
    expect(addMinutes('23:30', 60)).toBe('00:30');
  });
});

describe('slotToDate', () => {
  const base = new Date('2026-06-10T08:00:00');

  it('hoy + slot conserva el día y fija la hora', () => {
    const d = slotToDate(0, '14:00', base);
    expect(d.getDate()).toBe(10);
    expect(d.getHours()).toBe(14);
    expect(d.getMinutes()).toBe(0);
  });

  it('offset de días avanza la fecha', () => {
    const d = slotToDate(3, '07:00', base);
    expect(d.getDate()).toBe(13);
    expect(d.getHours()).toBe(7);
  });
});
