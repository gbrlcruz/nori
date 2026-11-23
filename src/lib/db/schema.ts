import Dexie, { type EntityTable, type Table } from 'dexie';
import type {
  Account, Book, BodyWeight, Budget, CachedImage, Category, CommandHistoryEntry, EnrichmentJob,
  FoodCustom, FoodTaco, Habit, HabitCheckin, Meal, Media, Note, Recurring, Reminder, SettingRow,
  Settings, Task, Transaction, Workout, WorkoutTemplate,
} from './types';
import { seed } from './seed';

/** Bump together with a new `db.version(n)` below. Written into backups. */
export const SCHEMA_VERSION = 1;

export const DB_NAME = 'nori';

export class NoriDB extends Dexie {
  settings!: Table<SettingRow, keyof Settings>;
  tasks!: EntityTable<Task, 'id'>;
  reminders!: EntityTable<Reminder, 'id'>;
  habits!: EntityTable<Habit, 'id'>;
  habitCheckins!: EntityTable<HabitCheckin, 'id'>;
  categories!: EntityTable<Category, 'id'>;
  accounts!: EntityTable<Account, 'id'>;
  budgets!: EntityTable<Budget, 'id'>;
  transactions!: EntityTable<Transaction, 'id'>;
  recurring!: EntityTable<Recurring, 'id'>;
  media!: EntityTable<Media, 'id'>;
  books!: EntityTable<Book, 'id'>;
  workouts!: EntityTable<Workout, 'id'>;
  workoutTemplates!: EntityTable<WorkoutTemplate, 'id'>;
  bodyWeight!: EntityTable<BodyWeight, 'id'>;
  foodsCustom!: EntityTable<FoodCustom, 'id'>;
  meals!: EntityTable<Meal, 'id'>;
  notes!: EntityTable<Note, 'id'>;
  // local only
  images!: Table<CachedImage, string>;
  enrichmentQueue!: EntityTable<EnrichmentJob, 'id'>;
  commandHistory!: EntityTable<CommandHistoryEntry, 'id'>;
  foodsTaco!: EntityTable<FoodTaco, 'id'>;

  constructor(name = DB_NAME) {
    super(name);

    // Version 1. Never edit a past version: add `this.version(2).stores({...}).upgrade(tx => …)`.
    // Only list indexed fields. Booleans and nulls can't be IndexedDB keys, so they aren't indexed;
    // soft-deleted rows are filtered in code.
    this.version(1).stores({
      settings: 'key',
      tasks: 'id, date, updatedAt',
      reminders: 'id, date',
      habits: 'id, keyword, sortOrder',
      habitCheckins: 'id, habitId, date, [habitId+date]',
      categories: 'id, keyword',
      accounts: 'id, keyword',
      budgets: 'id, month, categoryId',
      transactions: 'id, date, budgetMonth, kind, categoryId, accountId, installmentGroupId, recurringId',
      recurring: 'id, accountId',
      media: 'id, status, type, tmdbId, watchedOn, enrichment',
      books: 'id, status, finishedOn, enrichment',
      workouts: 'id, date, exercise, templateId',
      workoutTemplates: 'id, name',
      bodyWeight: 'id, date',
      foodsCustom: 'id, name, barcode',
      meals: 'id, date, mealType',
      notes: 'id, category, updatedAt',
      images: 'key',
      enrichmentQueue: 'id, nextTryAt, [table+recordId]',
      commandHistory: 'id, at',
      foodsTaco: 'id, name',
    });

    this.on('populate', (tx) => seed(tx));
  }
}

export const db = new NoriDB();
