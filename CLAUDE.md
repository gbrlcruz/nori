# Nori — instructions for Claude

Nori is a command-first personal organizer: an offline-first PWA, all data on the device, no backend. `SPEC.md` is the source of truth. Read the relevant section before changing a feature, and update `SPEC.md` in the same commit when a decision changes.

## Hard rules

- **Every user-facing string is in Brazilian Portuguese.** That covers commands, labels, buttons, errors, toasts, empty states, `aria-label`s and the manifest. Code, comments, identifiers, commit messages and docs stay in English.
- **Brazilian formats:** `R$ 1.234,56`, `23/11/2026`, `14h30`, kg / g / ml / l / km. Use the helpers in `src/lib/format.ts`, never ad-hoc `toFixed`.
- **No backend, no accounts, no analytics, no cookies.** The only network calls are the app's own files and the free APIs listed in SPEC → Integrations.
- **Offline first.** Every command must work offline. Never load fonts, scripts or styles from a CDN. Fonts come from `@fontsource`.
- **Money is integer cents** (`amountCents`). Never store floats for money.
- **Dates are local `YYYY-MM-DD` strings, times are `HH:mm`.** Use `src/lib/dates.ts`. Never use `toISOString()` for a calendar date: it shifts to UTC and breaks after 21:00 in Brazil.
- **IDs are ULIDs** (`newId()` in `src/lib/db/ids.ts`). Every row has `id`, `createdAt` and `updatedAt`. Delete means setting `deletedAt` (soft delete), and every query filters `deletedAt` out.
- **Keywords** (categories, accounts, habits) are lowercase slugs with no accents or spaces (`slugify()`). The display `name` keeps accents.
- **Vermilion (`--vermilion`) is only for alerts, errors, over budget and seal stamps.** The interface uses cobalt.
- **Schema changes** need a new `db.version(n)` in `src/lib/db/schema.ts` with an upgrade function. Never edit a past version. Bump `SCHEMA_VERSION`.

## Architecture

```
src/
  lib/
    db/          Dexie schema, types, seed, ids        (no UI imports)
    parser/      command parser, pure functions        (milestone 2)
    finance/     installments, budgetMonth, pace       (pure functions)
    backup/      zip export/import                     (milestone 3)
    integrations/ TMDB, books, TACO, Open Food Facts   (milestone 7+)
    dates.ts format.ts platform.svelte.ts router.svelte.ts live.svelte.ts
  screens/       one Svelte component per screen
  ui/            shared components
  styles/        tokens.css (design tokens), base.css
```

- Keep `src/lib/**` free of Svelte and DOM imports where possible, so it can be unit-tested in Node.
- Svelte 5 runes (`$state`, `$derived`, `$effect`, `$props`). No legacy `export let` or stores in new code.
- Routing is hash-based (`#/financas`) so static hosting needs no rewrite rules and works offline.
- Read data in components with `live(() => query, initial)` from `src/lib/live.svelte.ts` (Dexie liveQuery): screens update automatically when the data changes.
- Write through `src/lib/db/repo.ts` (`createRow`, `updateRow`, `softDelete`) so ids and timestamps are always stamped.

## Commands

```
npm run dev        dev server
npm test           Vitest (run before saying a task is done)
npm run check      svelte-check + tsc
npm run build      production build (includes the service worker)
npm run icons      regenerate PNG icons from public/icon.svg
```

## Working style

- Work one milestone at a time (SPEC → Build plan). Propose a short plan first and wait for approval on anything non-trivial.
- Write the tests first for pure logic (parser, finance, backup). The test-case table in SPEC → Command grammar is the acceptance suite for the parser.
- A task is done when `npm test`, `npm run check` and `npm run build` all pass.
- Don't add dependencies without saying why. The bundle must stay small.

## Current status

- [x] Milestone 1 — Foundation (scaffold, PWA, Dexie schema v1, tokens, fonts, routing, onboarding, persistence)
- [ ] Milestone 1 — deploy to Cloudflare Pages and test install on iPhone + Android (needs the owner)
- [ ] Milestone 1 — check CORS on TMDB / Google Books / Open Library image hosts (needs a browser with network)
- [ ] Milestone 2 — Command engine
- [ ] Milestones 3–10 (see SPEC → Build plan)
