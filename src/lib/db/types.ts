// Row types. Field meanings are documented in SPEC.md → Data model.
import type { ISODate, YearMonth, WeekStart } from '../dates';

/** Fields every user-data row has. */
export interface BaseRow {
  id: string; // ULID
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  deletedAt?: string | null; // soft delete
}

export type HHmm = string;
export type EnrichmentState = 'done' | 'pending' | 'failed' | 'manual';
export type HabitUnit = 'ml' | 'p' | 'min' | 'km' | 'g' | 'un';
export type AccountKind = 'pix' | 'cash' | 'debit' | 'credit';
export type TransactionKind = 'expense' | 'income' | 'saving';
export type FoodSource = 'taco' | 'off' | 'custom';

export interface MealType {
  keyword: string; // cafe, almoco, lanche, jantar, ceia
  name: string; // Café da manhã, Almoço…
  until: HHmm | null; // inferred meal when none is given: the first whose `until` is after now
}

export interface Settings {
  defaultAccountId: string | null;
  weekStart: WeekStart;
  totalBudgetCents: number | null;
  kcalTarget: number | null;
  proteinTargetG: number | null;
  mealTypes: MealType[];
  lastBackupAt: string | null;
  schemaVersion: number;
  onboardingDone: boolean;
}

export interface SettingRow<K extends keyof Settings = keyof Settings> {
  key: K;
  value: Settings[K];
}

export interface Task extends BaseRow {
  title: string;
  date: ISODate | null; // null = Algum dia
  time: HHmm | null; // null = untimed
  done: boolean;
  doneAt: string | null;
  sortOrder: number;
}

export interface Reminder extends BaseRow {
  title: string;
  date: ISODate;
  time: HHmm | null;
  dismissedAt: string | null;
}

export type Recurrence = { kind: 'daily' } | { kind: 'perWeek'; times: number };

export interface Habit extends BaseRow {
  keyword: string;
  name: string;
  requiresAmount: boolean;
  unit: HabitUnit | null;
  dailyTarget: number | null;
  recurrence: Recurrence;
  archived: boolean;
  sortOrder: number;
}

export interface HabitCheckin extends BaseRow {
  habitId: string;
  date: ISODate;
  amount: number | null;
}

export interface Category extends BaseRow {
  keyword: string;
  name: string;
  archived: boolean;
}

export interface Account extends BaseRow {
  keyword: string;
  name: string;
  kind: AccountKind;
  closingDay: number | null;
  dueDay: number | null;
}

export interface Budget extends BaseRow {
  month: YearMonth | '*';
  categoryId: string | null; // null = the total budget
  capCents: number;
}

export interface Transaction extends BaseRow {
  kind: TransactionKind;
  amountCents: number;
  categoryId: string | null;
  accountId: string | null;
  description: string;
  date: ISODate;
  budgetMonth: YearMonth;
  installmentGroupId: string | null;
  installmentIndex: number | null; // 1-based
  installmentCount: number | null;
  recurringId: string | null;
}

export interface Recurring extends BaseRow {
  description: string;
  amountCents: number;
  categoryId: string | null;
  accountId: string | null;
  dayOfMonth: number;
  startMonth: YearMonth;
  remaining: number | null; // null = no end
}

export interface Media extends BaseRow {
  type: 'movie' | 'tv';
  title: string;
  originalTitle: string | null;
  year: number | null;
  season: number | null;
  status: 'want' | 'watched';
  rating: number | null; // 1–10
  watchedOn: ISODate | null;
  director: string | null;
  tmdbId: number | null;
  posterPath: string | null;
  enrichment: EnrichmentState;
}

export interface Book extends BaseRow {
  title: string;
  author: string | null;
  status: 'want' | 'reading' | 'read';
  startedOn: ISODate | null;
  finishedOn: ISODate | null;
  rating: number | null; // 1–10
  isbn: string | null;
  googleBooksId: string | null;
  coverUrl: string | null;
  enrichment: EnrichmentState;
}

export interface Workout extends BaseRow {
  date: ISODate;
  exercise: string;
  sets: number;
  reps: number;
  loadKg: number | null; // null = bodyweight
  templateId: string | null;
  note: string | null;
}

export interface WorkoutTemplate extends BaseRow {
  name: string;
  exercises: { exercise: string; sets: number; reps: number }[];
}

export interface BodyWeight extends BaseRow {
  date: ISODate;
  kg: number;
}

export interface FoodCustom extends BaseRow {
  name: string;
  kcal100: number;
  protein100: number;
  carbs100: number;
  fat100: number;
  unitG: number | null;
  defaultG: number | null;
  barcode: string | null;
}

export interface Meal extends BaseRow {
  date: ISODate;
  mealType: string;
  foodSource: FoodSource;
  foodId: string;
  foodName: string;
  grams: number;
  kcal: number;
  proteinG: number;
  carbsG: number;
  fatG: number;
}

export interface Note extends BaseRow {
  title: string | null;
  body: string;
  category: string;
  pinned: boolean;
}

// ---- Local-only tables (not exported) ----

export interface CachedImage {
  key: string; // e.g. "tmdb:w185/abc.jpg"
  blob: Blob;
  savedAt: string;
}

export interface EnrichmentJob {
  id: string;
  table: 'media' | 'books';
  recordId: string;
  attempts: number;
  nextTryAt: string;
  lastError: string | null;
}

export interface CommandHistoryEntry {
  id: string;
  input: string;
  at: string;
  createdIds: { table: string; id: string }[];
}

export interface FoodTaco {
  id: string;
  name: string;
  kcal100: number;
  protein100: number;
  carbs100: number;
  fat100: number;
}
