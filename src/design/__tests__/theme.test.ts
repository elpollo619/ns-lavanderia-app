import { BRAND, RADIUS, THEMES, money, remainingMins } from '../theme';

describe('money (handoff: CHF x.xx, siempre 2 decimales)', () => {
  it('formatea con 2 decimales', () => {
    expect(money(4.5)).toBe('CHF 4.50');
    expect(money(6.5)).toBe('CHF 6.50');
    expect(money(32)).toBe('CHF 32.00');
    expect(money(0.8)).toBe('CHF 0.80');
  });
});

describe('remainingMins', () => {
  it('redondea hacia arriba los minutos restantes', () => {
    expect(remainingMins(Date.now() + 32 * 60000)).toBe(32);
    expect(remainingMins(Date.now() + 30500)).toBe(1);
  });

  it('nunca devuelve negativos', () => {
    expect(remainingMins(Date.now() - 60000)).toBe(0);
  });
});

describe('tokens de marca (handoff: no inventar valores)', () => {
  it('colores de marca exactos', () => {
    expect(BRAND.dunkelblau).toBe('#2a3350');
    expect(BRAND.hellblau).toBe('#01b1e2');
    expect(BRAND.hellblauDark).toBe('#19c1ef');
  });

  it('acentos por theme', () => {
    expect(THEMES.hell.accent).toBe('#01b1e2');
    expect(THEMES.dunkel.accent).toBe('#19c1ef');
  });

  it('radius del handoff: card 20, small 12 (card−8), button 16 (small+4)', () => {
    expect(RADIUS.card).toBe(20);
    expect(RADIUS.small).toBe(RADIUS.card - 8);
    expect(RADIUS.button).toBe(RADIUS.small + 4);
    expect(RADIUS.pill).toBe(999);
  });
});
