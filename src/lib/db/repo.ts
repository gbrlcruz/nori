// Generic helpers for user-data tables: id/timestamp stamping, soft delete, settings.
import type { EntityTable } from 'dexie';
import { db as defaultDb, type NoriDB } from './schema';
import { newId } from './ids';
import { nowTimestamp } from '../dates';
import type { BaseRow, Note, Settings } from './types';
import { defaultSettings } from './seed';

export type NewRow<T extends BaseRow> = Omit<T, keyof BaseRow>;

export async function createRow<T extends BaseRow>(
  table: EntityTable<T, 'id'>,
  data: NewRow<T>,
): Promise<T> {
  const now = nowTimestamp();
  const row = { ...data, id: newId(), createdAt: now, updatedAt: now, deletedAt: null } as T;
  await table.add(row);
  return row;
}

export async function updateRow<T extends BaseRow>(
  table: EntityTable<T, 'id'>,
  id: string,
  patch: Partial<NewRow<T>>,
): Promise<void> {
  // Dexie's UpdateSpec typing is too strict for a generic helper.
  await table.update(id as never, { ...patch, updatedAt: nowTimestamp() } as never);
}

export async function softDelete<T extends BaseRow>(table: EntityTable<T, 'id'>, id: string): Promise<void> {
  const now = nowTimestamp();
  await table.update(id as never, { deletedAt: now, updatedAt: now } as never);
}

export async function restore<T extends BaseRow>(table: EntityTable<T, 'id'>, id: string): Promise<void> {
  await table.update(id as never, { deletedAt: null, updatedAt: nowTimestamp() } as never);
}

/** All rows that are not soft-deleted. */
export async function allActive<T extends BaseRow>(table: EntityTable<T, 'id'>): Promise<T[]> {
  return table.filter((r) => !r.deletedAt).toArray();
}

/** Removes rows soft-deleted more than `days` ago. Run once a day. */
export async function purgeDeleted(database: NoriDB = defaultDb, days = 30): Promise<number> {
  const cutoff = new Date(Date.now() - days * 86_400_000).toISOString();
  let purged = 0;
  for (const table of database.tables) {
    if (table.schema.primKey.name !== 'id') continue;
    purged += await table.filter((r: BaseRow) => !!r.deletedAt && r.deletedAt < cutoff).delete();
  }
  return purged;
}

// ---- Settings ----

export async function getSettings(database: NoriDB = defaultDb): Promise<Settings> {
  const rows = await database.settings.toArray();
  const result = { ...defaultSettings(null) } as Record<string, unknown>;
  for (const row of rows) result[row.key] = row.value;
  return result as unknown as Settings;
}

export async function setSetting<K extends keyof Settings>(
  key: K,
  value: Settings[K],
  database: NoriDB = defaultDb,
): Promise<void> {
  await database.settings.put({ key, value });
}

// ---- Notes (quick note from the command bar) ----

export async function addQuickNote(body: string, database: NoriDB = defaultDb): Promise<Note> {
  return createRow(database.notes, { title: null, body: body.trim(), category: 'entrada', pinned: false });
}
