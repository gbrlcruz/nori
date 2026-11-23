import { describe, expect, it } from 'vitest';
import {
  addDays, addMonths, daysInMonth, diffDays, formatDateBR, formatLongDateBR, formatMonthBR,
  formatTimeBR, isISODate, startOfWeek, toISODate, weekDates, weekday,
} from './dates';

describe('dates', () => {
  it('uses the local calendar date, not UTC', () => {
    // 23/11/2026 21:30 local must stay the 23rd even though UTC is already the 24th in Brazil.
    expect(toISODate(new Date(2026, 10, 23, 21, 30))).toBe('2026-11-23');
  });

  it('adds days across month and year boundaries', () => {
    expect(addDays('2026-11-30', 1)).toBe('2026-12-01');
    expect(addDays('2026-12-31', 1)).toBe('2027-01-01');
    expect(addDays('2026-03-01', -1)).toBe('2026-02-28');
  });

  it('adds months', () => {
    expect(addMonths('2026-12', 1)).toBe('2027-01');
    expect(addMonths('2026-12', 9)).toBe('2027-09');
    expect(addMonths('2026-01', -1)).toBe('2025-12');
  });

  it('knows month lengths', () => {
    expect(daysInMonth('2026-02')).toBe(28);
    expect(daysInMonth('2028-02')).toBe(29);
    expect(daysInMonth('2026-11')).toBe(30);
  });

  it('computes weekdays and week starts', () => {
    expect(weekday('2026-11-23')).toBe(1); // Monday
    expect(startOfWeek('2026-11-29', 'mon')).toBe('2026-11-23');
    expect(startOfWeek('2026-11-29', 'sun')).toBe('2026-11-29');
    expect(weekDates('2026-11-25', 'mon')).toEqual([
      '2026-11-23', '2026-11-24', '2026-11-25', '2026-11-26', '2026-11-27', '2026-11-28', '2026-11-29',
    ]);
  });

  it('diffs days', () => {
    expect(diffDays('2026-11-23', '2026-12-15')).toBe(22);
    expect(diffDays('2026-11-23', '2026-11-22')).toBe(-1);
  });

  it('validates ISO dates', () => {
    expect(isISODate('2026-11-23')).toBe(true);
    expect(isISODate('2026-02-30')).toBe(false);
    expect(isISODate('23/11/2026')).toBe(false);
  });

  it('formats in pt-BR', () => {
    expect(formatDateBR('2026-11-23')).toBe('23/11/2026');
    expect(formatMonthBR('2026-11')).toBe('novembro de 2026');
    expect(formatLongDateBR('2026-11-23')).toBe('segunda, 23 de novembro');
    expect(formatTimeBR('14:30')).toBe('14h30');
    expect(formatTimeBR('09:00')).toBe('9h');
  });
});
