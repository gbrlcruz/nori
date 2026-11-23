import 'fake-indexeddb/auto';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { NoriDB, SCHEMA_VERSION } from './schema';
import { addQuickNote, allActive, createRow, getSettings, purgeDeleted, restore, setSetting, softDelete } from './repo';

let db: NoriDB;
let n = 0;

beforeEach(async () => {
  db = new NoriDB(`nori-test-${n++}`);
  await db.open();
});

afterEach(async () => {
  await db.delete();
});

describe('schema v1', () => {
  it('opens at the declared schema version', () => {
    expect(db.verno).toBe(SCHEMA_VERSION);
  });

  it('seeds Pix and Dinheiro, with Pix as the default account', async () => {
    const accounts = await db.accounts.toArray();
    expect(accounts.map((a) => a.keyword).sort()).toEqual(['dinheiro', 'pix']);
    const settings = await getSettings(db);
    const pix = accounts.find((a) => a.keyword === 'pix')!;
    expect(settings.defaultAccountId).toBe(pix.id);
    expect(settings.weekStart).toBe('mon');
    expect(settings.mealTypes.map((m) => m.keyword)).toEqual(['cafe', 'almoco', 'lanche', 'jantar', 'ceia']);
    expect(settings.onboardingDone).toBe(false);
  });

  it('stores settings', async () => {
    await setSetting('weekStart', 'sun', db);
    await setSetting('totalBudgetCents', 300000, db);
    const s = await getSettings(db);
    expect(s.weekStart).toBe('sun');
    expect(s.totalBudgetCents).toBe(300000);
  });
});

describe('rows', () => {
  it('stamps a ULID and timestamps on create', async () => {
    const note = await addQuickNote('  comprar pilha ', db);
    expect(note.id).toMatch(/^[0-9A-HJKMNP-TV-Z]{26}$/);
    expect(note.body).toBe('comprar pilha');
    expect(note.category).toBe('entrada');
    expect(note.createdAt).toBe(note.updatedAt);
  });

  it('ULIDs sort by creation order', async () => {
    const a = await createRow(db.tasks, { title: 'a', date: null, time: null, done: false, doneAt: null, sortOrder: 0 });
    const b = await createRow(db.tasks, { title: 'b', date: null, time: null, done: false, doneAt: null, sortOrder: 0 });
    expect(a.id < b.id).toBe(true);
  });

  it('soft delete hides a row and restore brings it back', async () => {
    const note = await addQuickNote('ideia', db);
    await softDelete(db.notes, note.id);
    expect(await allActive(db.notes)).toHaveLength(0);
    expect(await db.notes.count()).toBe(1);
    await restore(db.notes, note.id);
    expect(await allActive(db.notes)).toHaveLength(1);
  });

  it('purges rows deleted more than 30 days ago', async () => {
    const old = await addQuickNote('velha', db);
    const recent = await addQuickNote('recente', db);
    await db.notes.update(old.id, { deletedAt: new Date(Date.now() - 31 * 86_400_000).toISOString() });
    await softDelete(db.notes, recent.id);
    expect(await purgeDeleted(db)).toBe(1);
    expect(await db.notes.count()).toBe(1);
  });
});
