import type { Transaction as DexieTransaction } from 'dexie';
import { newId } from './ids';
import { nowTimestamp } from '../dates';
import type { Account, MealType, SettingRow, Settings } from './types';

export const DEFAULT_MEAL_TYPES: MealType[] = [
  { keyword: 'cafe', name: 'Café da manhã', until: '10:30' },
  { keyword: 'almoco', name: 'Almoço', until: '15:00' },
  { keyword: 'lanche', name: 'Lanche da tarde', until: '18:00' },
  { keyword: 'jantar', name: 'Jantar', until: '22:00' },
  { keyword: 'ceia', name: 'Ceia', until: null },
];

export function defaultSettings(defaultAccountId: string | null): Settings {
  return {
    defaultAccountId,
    weekStart: 'mon',
    totalBudgetCents: null,
    kcalTarget: null,
    proteinTargetG: null,
    mealTypes: DEFAULT_MEAL_TYPES,
    lastBackupAt: null,
    schemaVersion: 1,
    onboardingDone: false,
  };
}

/** Runs once, when the database is first created. */
export async function seed(tx: DexieTransaction): Promise<void> {
  const now = nowTimestamp();
  const pix: Account = {
    id: newId(), createdAt: now, updatedAt: now,
    keyword: 'pix', name: 'Pix', kind: 'pix', closingDay: null, dueDay: null,
  };
  const cash: Account = {
    id: newId(), createdAt: now, updatedAt: now,
    keyword: 'dinheiro', name: 'Dinheiro', kind: 'cash', closingDay: null, dueDay: null,
  };
  await tx.table('accounts').bulkAdd([pix, cash]);

  const settings = defaultSettings(pix.id);
  const rows = (Object.keys(settings) as (keyof Settings)[]).map(
    (key) => ({ key, value: settings[key] }) as SettingRow,
  );
  await tx.table('settings').bulkAdd(rows);
}
