import { monotonicFactory } from 'ulidx';

const ulid = monotonicFactory();

/** New row id: a ULID, sortable by creation time and safe to merge across devices. */
export function newId(): string {
  return ulid();
}
