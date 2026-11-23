import { liveQuery } from 'dexie';

/**
 * Reactive Dexie query for Svelte 5 components:
 *   const notes = live(() => allActive(db.notes), []);
 *   {#each notes.value as n}…
 * Re-runs automatically whenever the tables it reads change.
 */
export function live<T>(query: () => Promise<T> | T, initial: T) {
  const state = $state({ value: initial, loaded: false });
  $effect(() => {
    const sub = liveQuery(query).subscribe({
      next: (v) => {
        state.value = v;
        state.loaded = true;
      },
      error: (e) => console.error('[live]', e),
    });
    return () => sub.unsubscribe();
  });
  return state;
}
