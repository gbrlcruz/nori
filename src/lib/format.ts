// Brazilian number, money and text helpers. All user-facing numbers go through here.

const brl = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });

/** 123456 → "R$ 1.234,56" (with a regular space, so it's predictable in tests and layout). */
export function formatBRL(cents: number): string {
  return brl.format(cents / 100).replace(/ /g, ' ');
}

/** 1234.5 → "1.234,5" with up to `maxDecimals` decimals. */
export function formatNumberBR(n: number, maxDecimals = 2, minDecimals = 0): string {
  return new Intl.NumberFormat('pt-BR', {
    minimumFractionDigits: minDecimals,
    maximumFractionDigits: maxDecimals,
  }).format(n);
}

/** 78.5 → "78,5 kg" */
export function formatKg(kg: number): string {
  return `${formatNumberBR(kg, 1)} kg`;
}

/** 1500 ml → "1,5 l"; 500 → "500 ml" */
export function formatMl(ml: number): string {
  return ml >= 1000 ? `${formatNumberBR(ml / 1000, 2)} l` : `${formatNumberBR(ml, 0)} ml`;
}

/** Lowercase, accents removed. Used to compare user input with names. */
export function normalizeKey(s: string): string {
  return s
    .normalize('NFD')
    .replace(/[̀-ͯ]/g, '')
    .toLowerCase()
    .trim();
}

/** "Alimentação Fora" → "alimentacao-fora". Keywords are single words by convention, but be tolerant. */
export function slugify(s: string): string {
  return normalizeKey(s)
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

/** Portuguese plural for simple counters: plural(3, 'dia', 'dias') → "3 dias". */
export function plural(n: number, one: string, many: string): string {
  return `${formatNumberBR(n, 0)} ${n === 1 ? one : many}`;
}
