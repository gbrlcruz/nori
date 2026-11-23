import { describe, expect, it } from 'vitest';
import { formatBRL, formatKg, formatMl, formatNumberBR, normalizeKey, plural, slugify } from './format';

describe('format', () => {
  it('formats money in reais', () => {
    expect(formatBRL(3250)).toBe('R$ 32,50');
    expect(formatBRL(123456)).toBe('R$ 1.234,56');
    expect(formatBRL(0)).toBe('R$ 0,00');
  });

  it('formats numbers and units', () => {
    expect(formatNumberBR(1234.5)).toBe('1.234,5');
    expect(formatKg(78.5)).toBe('78,5 kg');
    expect(formatMl(500)).toBe('500 ml');
    expect(formatMl(1500)).toBe('1,5 l');
  });

  it('normalizes and slugifies names', () => {
    expect(normalizeKey('  Água ')).toBe('agua');
    expect(slugify('Alimentação')).toBe('alimentacao');
    expect(slugify('Cartão LATAM Pass')).toBe('cartao-latam-pass');
  });

  it('pluralizes', () => {
    expect(plural(1, 'dia', 'dias')).toBe('1 dia');
    expect(plural(12, 'dia', 'dias')).toBe('12 dias');
  });
});
