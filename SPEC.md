# Nori — Product & Technical Spec v1

Nov 23, 2026 · Source of truth for decisions. Living copy of the [spec doc](https://claude.ai/artifact/CoGxmRcV4pWzbCYjWhETV2). When a decision changes, update this file in the same commit.

## Overview

Nori is a command-first personal organizer that runs as an installable, offline-capable web app (PWA), with all data stored on the device. It covers tasks, habits, finance, notes, movies and series, books, workouts and nutrition, and costs nothing to run.

**Users:** the owner and a few close friends, all Brazilian. No sign-up, no accounts, no monetization.

**Hard constraints**

- Every user-facing string (commands, labels, messages) is in Brazilian Portuguese. Units: R$, kg, g, ml, l, km. Dates are written dd/mm/aaaa.
- Zero cost: static hosting, free APIs only, no server.
- Works offline. Integrations switch off gracefully when there's no connection.
- No cross-device sync in v1.

**Decision log**

| # | Decision | Choice |
| --- | --- | --- |
| 1 | How it's delivered | Static PWA hosted on Cloudflare Pages. Friends install it to the home screen. |
| 2 | Main device | The phone. The desktop gets data by importing a backup. |
| 3 | Command syntax | Text first, options at the end in any order (see Command grammar). |
| 4 | Rating scale | x/10, stored as an integer 1–10 |
| 5 | Rating required? | Optional on `/assisti` and `/li` |
| 6 | Director | Not in the command. Filled in by TMDB, editable on the card. |
| 7 | Author separator | ` - ` (space, dash, space) |
| 8 | `/gastei` with no payment method | Uses the default payment method set in Configurações (initially Pix) |
| 9 | New commands | `/quero-ler`, `/recebi`, `/guardei`, `/peso`, `/treino`, `/nota` |
| 10 | Installments in the budget | Each installment counts in the month it's charged |
| 11 | Budget colors | Based on pace (share spent compared with share of month gone) |
| 12 | Framework | Svelte 5 + Vite |
| 13 | First day of the week | Monday (adjustable in Configurações) |
| 14 | TMDB key | One shared key built into the app |
| 15 | Import | Ships in v1 alongside export |

## Architecture

Nori has no backend. The host serves static files, and everything the user creates lives in IndexedDB on the phone.

```
┌──────────────────────── Phone · installed PWA ────────────────────────┐
│                                                                        │
│  Command bar ──▶ Parser ──▶ Repositories ◀──▶ IndexedDB (Dexie)        │
│                                 ▲   ▲            ▲  your data + TACO   │
│  Service worker   Enrichment ───┘   │            │                     │
│  offline app      queue             ▼            ▼                     │
│  + covers           ▲            Screens      Backup .zip              │
└──────▲──────────────┼────────────────────────────┼─────────────────────┘
       │              ▼                            ▼
 Cloudflare Pages   Free APIs (online only)     Desktop browser
 serves code only   TMDB · Google Books ·       imports the backup
                    Open Library · Open Food Facts
```

A command goes from the bar through the parser and repositories into IndexedDB, and screens read back through the same repositories. External APIs are only reached by autocomplete and the enrichment queue. The desktop gets data only through a backup file.

| Layer | Choice | Why |
| --- | --- | --- |
| UI | Svelte 5 + Vite + TypeScript | Small bundle, simple components |
| Storage | Dexie over IndexedDB | Typed tables, indexes, migrations, transactions |
| Offline and install | `vite-plugin-pwa` (Workbox) | Precaches the app shell. Runtime cache for images. |
| IDs | ULID (`ulidx`) | Sort by creation time, safe to merge across devices |
| Zip | `fflate` | Small and fast, runs in the browser |
| Tests | Vitest | The parser and finance rules are pure functions |
| Hosting | Cloudflare Pages (free) | HTTPS, built on every push to `main` |

No analytics, cookies or accounts. The only network calls are the app's own files and the APIs in Integrations.

## Data model

All data lives in IndexedDB through Dexie, one table per entity. Most tables map one-to-one to a CSV in the backup.

**Conventions**

- Every row has `id` (a ULID string), `createdAt` and `updatedAt` (ISO timestamps).
- Deleting a row sets `deletedAt`. A daily cleanup purges rows deleted more than 30 days ago. This is what makes undo trivial.
- Calendar dates are `YYYY-MM-DD` strings and times are `HH:mm`, both in local time. There are no timezone conversions.
- Money is an integer number of cents (`amountCents`).
- Every `keyword` is a lowercase slug with no spaces or accents (`alimentacao`). The display `name` keeps its accents (`Alimentação`).
- Snapshots: records that come from an API also store the fields needed to display them offline, even after the API data changes.

| Table | Purpose | Fields |
| --- | --- | --- |
| `settings` | Key-value preferences | `defaultAccountId`, `weekStart` (`mon`), `totalBudgetCents`, `kcalTarget`, `proteinTargetG`, `mealTypes[]`, `lastBackupAt`, `schemaVersion` |
| `tasks` | To-dos | `title`, `date` (null = Algum dia), `time` (null = untimed), `done`, `doneAt`, `sortOrder` |
| `reminders` | Countdowns on the home screen | `title`, `date`, `time`, `dismissedAt` |
| `habits` | Habit definitions | `keyword`, `name`, `requiresAmount`, `unit` (`ml` `p` `min` `km` `g` `un`), `dailyTarget`, `recurrence` ({`kind`: `daily`} or {`kind`: `perWeek`, `times`}), `archived`, `sortOrder` |
| `habitCheckins` | One row per log | `habitId`, `date`, `amount` (in the habit's unit) |
| `categories` | Spending categories | `keyword`, `name`, `archived` |
| `accounts` | Payment methods | `keyword`, `name`, `kind` (`pix` `cash` `debit` `credit`), `closingDay`, `dueDay` (credit only). Seeded: `pix`, `dinheiro`. |
| `budgets` | Spending caps | `month` (`YYYY-MM`, or `*` = every month), `categoryId` (null = the total), `capCents` |
| `transactions` | Money in and out | `kind` (`expense` `income` `saving`), `amountCents` (saving is negative for a withdrawal), `categoryId`, `accountId`, `description`, `date`, `budgetMonth`, `installmentGroupId`, `installmentIndex`, `installmentCount`, `recurringId` |
| `recurring` | Subscriptions and installment plans that already exist | `description`, `amountCents`, `categoryId`, `accountId`, `dayOfMonth`, `startMonth`, `remaining` (null = no end) |
| `media` | Movies and series | `type` (`movie` `tv`), `title`, `originalTitle`, `year`, `season`, `status` (`want` `watched`), `rating` (1–10), `watchedOn`, `director`, `tmdbId`, `posterPath`, `enrichment` (`done` `pending` `failed` `manual`) |
| `books` | Books | `title`, `author`, `status` (`want` `reading` `read`), `startedOn`, `finishedOn`, `rating`, `isbn`, `googleBooksId`, `coverUrl`, `enrichment` |
| `workouts` | One row per exercise performed | `date`, `exercise`, `sets`, `reps`, `loadKg` (null = bodyweight), `templateId`, `note` |
| `workoutTemplates` | Treino A, B, C | `name`, `exercises[]` ({`exercise`, `sets`, `reps`}) |
| `bodyWeight` | Weigh-ins | `date`, `kg` |
| `foodsCustom` | Foods the user adds | `name`, `kcal100`, `protein100`, `carbs100`, `fat100`, `unitG` (grams per `un`), `defaultG`, `barcode` |
| `meals` | Food logs | `date`, `mealType`, `foodSource` (`taco` `off` `custom`), `foodId`, `foodName`, `grams`, `kcal`, `proteinG`, `carbsG`, `fatG` (all snapshots) |
| `notes` | Second brain | `title`, `body` (Markdown), `category` (default `entrada`), `pinned` |

**Local only, not exported:** `images` (cached poster and cover files), `enrichmentQueue` (`table`, `recordId`, `attempts`, `nextTryAt`, `lastError`), `commandHistory` (`input`, `at`, `createdIds[]`, used for ↑ and undo) and `foodsTaco` (read-only, ships with the app).

**How finance rows are derived**

- **Installments:** `/gastei 1.200 … latam 10x` writes 10 `transactions` sharing one `installmentGroupId`. Each is 12000 cents, with any leftover cents added to the first.
- **`budgetMonth`:** for credit accounts, the month the statement is **due**. A purchase before `closingDay` closes on this month's closing date, and one on or after it closes on next month's. The due date is the next `dueDay` after that closing date. Installment *i* adds *i* months. For every other account it's the month of `date`. All budget math uses `budgetMonth`.
- **Recurring charges:** materialized into `transactions` when a month is first opened, then `remaining` counts down.

## Command grammar

The rule: **text first, options at the end, in any order.** The parser reads options from the end of the line backwards for as long as each word matches an option shape. Everything before the first word that doesn't match is the text.

**Parsing rules**

1. A line that starts with `/` is a command. Anything else is saved as a note in the `entrada` category.
2. Command names are compared lowercase, with accents and hyphens removed. `/quero-ver`, `/querover` and `/QUERO-VER` are the same command.
3. Some commands start with fixed positions (the head), such as the amount and category in `/gastei`. Options are then read backwards from the end. Whatever is left between the head and the options is the text.
4. Each option type can appear only once. Reading stops at a second date, a second time, and so on, and that word stays in the text.
5. Bare numbers are never options in text commands. Numbers in titles (`2049`, `1917`) stay in the text.
6. Close-but-wrong shapes raise an error instead of falling into the text: `4,5/5`, `11/10`, `8,5/10`, `0x`.
7. In `/assisti` and `/li`, `N/10` is always a rating. An October date there must include the year: `08/10/26`.
8. `"quotes"` force their contents to be text. An autocomplete pick locks the title as a chip, which has the same effect.
9. Registered names (categories, accounts, habits, templates) are matched case- and accent-insensitively. The match can be the exact keyword or a unique prefix of 3+ characters. Ambiguous or unknown names raise an error.

**Option shapes**

| Type | Accepted forms | Notes |
| --- | --- | --- |
| Date | `hoje` `ontem` `anteontem` `amanhã` · `seg` `ter` `qua` `qui` `sex` `sáb` `dom` and the full names · `15/12` `15/12/26` `15/12/2026` | Logging commands treat a weekday or `dd/mm` as the most recent past date (today counts). Planning commands (`/tarefa`, `/lembrete`) treat it as the next one. |
| No date | `sem-data` | `/tarefa` only. Sends the task to Algum dia. |
| Time | `14h` `14h30` `14:30` | |
| Money | `32` `32,50` `12,9` `1.200` `1.200,50` `R$32,50` `32.50` | A dot followed by exactly 3 digits is a thousands separator. A comma, or a dot followed by 1–2 digits, is the decimal point. |
| Rating | `8/10` | An integer from 1 to 10 |
| Season | `t2` `t02` | |
| Installments | `10x` | 2–48, credit accounts only |
| Amount | `500ml` `1,5l` `150g` `2un` `30min` `1h` `20p` `5km` | Converted within the same kind of unit (l→ml, h→min) |
| Load | `40kg` `42,5kg` | |
| Sets × reps | `4x10` | |
| Meal | `café` `almoço` `lanche` `jantar` `ceia` | Left out: before 10:30 café, until 15:00 almoço, until 18:00 lanche, until 22:00 jantar, otherwise ceia |
| Note category | `#ideias` | |
| Account | a registered account keyword | |

**Commands**

```
/gastei <valor> <categoria> [descrição] [conta] [Nx] [data]
/recebi <valor> [descrição] [data]
/guardei <valor> [descrição] [data]              negative = withdrawal

/assisti <título> [tN] [nota] [data]             no tN = movie
/quero-ver <título> [tN]                          alias /qv
/lendo <título> [- autor] [data]
/li <título> [- autor] [nota] [data]
/quero-ler <título> [- autor]                     alias /ql

/tarefa <texto> [data | sem-data] [hora]          no date = today, no time = untimed
/lembrete <título> <data> [hora]
/fiz <hábito> [quantidade] [data]
/nota <texto> [#categoria]

/comi <alimento> [quantidade] [refeição] [data]
/peso <kg> [data]
/treino <exercício> <sériesxreps> [carga] [data]
/treino <modelo>                                  opens a session from a template

/                                                 lists all commands
/ajuda [comando]
```

**Side effects worth knowing**

- `/gastei` with no account uses the default account (Pix to start).
- `/assisti` on a title already in Quero ver moves that record to Assistidos instead of creating a new one. `/li` does the same with Lendo and Quero ler.
- `/comi` with no amount uses the food's default portion. That's `defaultG` for custom foods and 100 g for TACO foods. `ml` counts as grams. `un` requires the food to have `unitG`.
- `/treino <modelo>` with no sets opens the session screen, pre-filled with the loads from the last session of that template.

**Feedback**

- **Live preview:** while typing, a row of chips under the bar shows how the line will be read, e.g. `Gasto · R$ 32,50 · Mercado · Pix · hoje`. Enter confirms.
- **Error:** the bar turns vermilion and shakes for 300 ms. One line below it says why, with an action when there is one (`criar categoria`).
- **Success:** a toast reading `Registrado · Desfazer` for 6 s. Undo soft-deletes every row the command created. Pressing ↑ on an empty bar brings back the last command.
- **Input attributes:** `autocapitalize="none"` `autocorrect="off"` `spellcheck="false"` `enterkeyhint="send"`. A row of command chips sits above the keyboard on mobile.

**Error messages**

| Situation | Message |
| --- | --- |
| Unknown command | `comando "/x" não existe — digite / para ver a lista` |
| Unknown category, account or habit | `categoria "lazr" não existe — criar?` |
| Ambiguous prefix | `"al" pode ser: alimentação, aluguel` |
| Habit needs an amount | `água precisa de quantidade (ml)` |
| Installments on a non-credit account | `parcelas só no cartão de crédito` |
| Bad rating | `nota de 1 a 10 (ex.: 8/10)` |
| Missing required field | `lembrete precisa de data` |
| `un` without a unit weight | `informe em gramas — esse alimento não tem peso por unidade` |

**Test cases**

Assume today is Monday 23/11/2026 at 19:00. Categories are `mercado`, `transporte`, `eletronicos`, `lazer`, `alimentacao` and `aluguel`. Accounts are `pix` (default), `dinheiro` and `latam` (credit, closes on day 5, due on day 12).

| Input | Expected |
| --- | --- |
| `/gastei 32,50 mercado` | expense 3250 · mercado · pix · 2026-11-23 |
| `/gastei 32.50 mercado` | same as above |
| `/gastei 12,9 alim` | expense 1290 · alimentacao |
| `/gastei 18 transporte uber pro centro dinheiro ontem` | expense 1800 · transporte · "uber pro centro" · dinheiro · 2026-11-22 |
| `/gastei 1.200 eletronicos fone novo latam 10x` | 10 rows of 12000 · latam · date 2026-11-23 · budgetMonth 2026-12 through 2027-09 |
| `/gastei 1.200 eletronicos pix 10x` | error: installments only on credit |
| `/gastei 45 al` | error: ambiguous (alimentação, aluguel) |
| `/gastei 45 lazr` | error: unknown category, offers to create it |
| `/recebi 5.000 salário` | income 500000 · "salário" |
| `/guardei -200 reserva` | saving −20000 · "reserva" |
| `/assisti Blade Runner 2049 8/10` | movie "Blade Runner 2049" · rating 8 · 2026-11-23 |
| `/assisti Ruptura t2 9/10 sábado` | tv "Ruptura" · season 2 · rating 9 · 2026-11-21 |
| `/assisti Interestelar` | movie · no rating |
| `/assisti Duna 4,5/5` | error: bad rating |
| `/quero-ver Ruptura t3` | tv · season 3 · status want |
| `/lendo Torto Arado - Itamar Vieira Junior` | book · author "Itamar Vieira Junior" · reading · started 2026-11-23 |
| `/li Torto Arado 9/10` | the existing reading record → read · finished 2026-11-23 · rating 9 |
| `/fiz agua 500` | checkin agua · 500 |
| `/fiz água 1,5l` | checkin agua · 1500 |
| `/fiz agua` | error: needs an amount (ml) |
| `/fiz academia ontem` | checkin academia · 2026-11-22 |
| `/tarefa Ligar pro João depois do almoço sexta 14h` | "Ligar pro João depois do almoço" · 2026-11-27 · 14:00 |
| `/tarefa Revisar slides de sexta amanhã` | "Revisar slides de sexta" · 2026-11-24 |
| `/tarefa Comprar presente` | 2026-11-23 · untimed |
| `/tarefa Aprender japonês sem-data` | Algum dia |
| `/lembrete Dentista 15/12 14h` | 2026-12-15 · 14:00 |
| `/lembrete Dentista` | error: needs a date |
| `/comi arroz branco 150g almoço` | top TACO match · 150 g · almoço |
| `/comi banana 2un` | needs `unitG` · meal jantar (inferred from 19:00) |
| `/peso 78,5` | 78.5 kg · 2026-11-23 |
| `/treino supino inclinado 4x10 30kg` | "supino inclinado" · 4 × 10 · 30 kg |
| `/treino barra fixa 3x8` | bodyweight (load null) |
| `/treino A` | opens the session for template A |
| `/nota app de receitas #ideias` | note · category ideias |
| `comprar pilha` | note · category entrada |

## Screens and modules

On mobile, a bottom bar holds **Início · Agenda · Finanças · Notas · Mais**. Mais opens Hábitos, Mídia, Leitura, Treino, Nutrição and Configurações. On desktop, the same items sit in a left sidebar with vertical labels. A small `offline` chip appears in the header with no connection, along with a count of records waiting for enrichment.

### Início

1. **Command bar**, pinned to the top. Text without a `/` is the quick note.
2. **Reminders**, as countdowns: `faltam 12 dias`, `amanhã`, `faltam 5 horas`, `faltam 20 min`, `hoje`. A passed reminder disappears the next day. Each one has an "Adicionar ao calendário" (.ics) action.
3. **Hoje**: today's tasks, plus overdue undone tasks tagged `atrasada`. Tap to tick.
4. **Hábitos da semana**: the compact habit grid with today's column highlighted.
5. **Orçamento do mês**: `R$ 1.240 de R$ 3.000 · sobra R$ 1.760`, colored by pace.

**Pace color.** *Committed* is the month's recurring charges and installments. *Variable* is everything else spent so far. *Elapsed* is days passed divided by days in the month.

```
projected = committed + variable / elapsed
```

The bar is green when projected is up to 90% of the total budget, orange up to 110%, and red above that or once spending reaches 100%. Separating committed spending stops rent on day 1 from turning the bar red. The text and an icon always accompany the color.

### Agenda

- **Semana:** a kanban with seven day columns starting on `weekStart`, plus an **Algum dia** column. Drag a card to move it between days. On mobile, the days stack vertically and today is scrolled into view.
- **Mês:** a calendar grid with dots for tasks and reminders. Tap a day to see its list.
- Done tasks are struck through. Overdue tasks keep their date and also appear in Hoje.

### Hábitos

- **Grid:** one row per habit, one column per weekday, drawn as manuscript grid paper. Tapping a cell stamps or unstamps it.
- **Measured habits:** tapping opens an amount field. The cell fills as a ring toward `dailyTarget`, and several check-ins on one day add up.
- **Habits done N times a week:** the row ends with `2/3`.
- **Streaks:** consecutive days met for daily habits, and consecutive weeks met for weekly ones.
- **New-habit form:** keyword, name, "precisa de quantidade" checkbox → unit, daily target, recurrence (`todo dia` or `N vezes por semana`).

### Finanças

- A month selector, then the budget bar and remaining amount.
- **Por categoria:** spending against each cap.
- **Por conta:** credit accounts show statements by due month (total, due date, items). Other accounts show their transactions.
- **Lançamentos:** all transactions grouped by day. Tap to edit or delete.
- **Parcelas futuras:** installments still to come, by month.
- **Header totals:** income this month and total savings to date.
- **Registration:**
  - Categories: keyword, name, cap.
  - Accounts: keyword, name, kind, closing and due days. Credit cards can add existing installment plans (description, amount, installments left), which become `recurring` rows.
  - Recurring charges.

### Mídia and Leitura

- **Mídia tabs:** Quero ver (default) and Assistidos.
- **Leitura tabs:** Lendo, Quero ler and Lidos.
- **Grid:** cover grid, 2 columns on mobile and 5 on desktop.
- **Without an image:** a typographic card with the title in the display font, the year, and a halftone background.
- **Lists:** sort by date or rating, filter movie or series. Leitura shows a yearly count: `12 livros em 2026`.
- **Detail sheet:** edit every field, rate, and re-run enrichment.

### Treino

- Today's session, templates (Treino A, B, C), and history.
- **Exercise page:** a line chart of the top load per session over time.
- **Peso corporal:** a weigh-in chart.

### Nutrição

- **Dia:** sections per meal type. Progress bars for kcal and protein against targets, e.g. `faltam 620 kcal · 45 g de proteína`.
- **Semana and Mês:** daily kcal bars against the target line.
- **Alimentos:** search TACO, add custom foods, and look up packaged products by barcode when online.

### Notas

- Cards in a masonry grid, with pinned notes first.
- Category chips to filter (`entrada` holds quick notes), plus full-text search.
- Markdown editor.

### Configurações

- **Preferences:** default account, first day of the week, kcal and protein targets, total budget, meal types.
- **Management:** categories, accounts, habits, workout templates.
- **Backup:** Exportar, Importar, and the date of the last backup.
- **Device:** storage status (persistent or not) and how to install to the home screen.
- **Sobre:** credits, including the required TMDB attribution.

## Integrations and offline behavior

Every command works offline. Integrations only add autocomplete and enrichment (covers, years, directors, nutrition values), and anything added offline is enriched later from a queue.

| Service | Used for | Key | Notes |
| --- | --- | --- | --- |
| [TMDB](https://developer.themoviedb.org/docs/faq) | Movie and series search, posters, director | One shared key, built in at compile time (`VITE_TMDB_KEY`) | Free for non-commercial use with attribution. Search with `language=pt-BR` so "Inter" suggests "Interestelar". The required logo and notice go in Configurações → Sobre. |
| Google Books | Book search and covers (better coverage of Brazilian editions) | None | Prefer an ISBN match when there is one. Rewrite cover URLs to `https`. |
| Open Library | Fallback book search and covers | None | Used when Google Books returns nothing |
| [TACO](https://github.com/raulfdm/taco-api) | Generic Brazilian foods (arroz, feijão, frango…) | None, bundled as JSON | Works offline. The source (NEPA/UNICAMP) must be credited in Sobre. |
| Open Food Facts | Packaged products, by barcode or name | None | Online only. A chosen product is copied into `foodsCustom` with its barcode, so it then works offline. |
| MyFitnessPal | Not used | | No public API is available. |

**Autocomplete:** starts after 3 characters, with a 250 ms debounce. Results are cached in memory for the session. If a request fails or takes more than 3 s, the dropdown closes quietly and the line is saved as typed.

**Enrichment queue**

1. A title saved without an API pick (offline, or the user ignored the dropdown) is stored with `enrichment: pending` and added to `enrichmentQueue`.
2. When the app is open and online (on startup and on the `online` event), the queue runs one item at a time.
3. A single confident match (same title, plus the same year or author when known) is applied automatically. Several candidates set `enrichment: manual` and show a `confirmar` badge on the card, which opens a picker.
4. A failure retries with backoff (1 min, 10 min, 1 h, 6 h, 24 h). After 5 attempts the record is marked `failed` and keeps its typographic card. It can be retried from the detail sheet.
5. Enrichment never overwrites a field the user edited.

**Images:** posters and covers are saved in the small sizes (TMDB `w185`) into the `images` table when the record is created or enriched, so covers show offline. Check during the foundation milestone that each image host allows these cross-origin requests. If one doesn't, fall back to the service worker's cache, and keep an eye on storage, since browsers count such cached files at an inflated size.

| Feature | Online | Offline |
| --- | --- | --- |
| All commands | Yes | Yes |
| Title autocomplete | Yes | No, saved as typed and enriched later |
| `/comi` | TACO, custom foods, Open Food Facts | TACO and custom foods |
| Covers | Yes | If cached, otherwise a typographic card |
| Backup export/import | Yes | Yes |

## Backup

Backups are a zip of CSV files plus Markdown notes. In v1 they are the only way to restore data or move it between devices, so import ships together with export.

```
nori-backup-2026-11-23.zip
├── manifest.json           app, appVersion, schemaVersion, exportedAt, row count per file
├── settings.json
├── tasks.csv
├── reminders.csv           (new)
├── habits.csv
├── habit_checkins.csv
├── transactions.csv
├── categories.csv
├── accounts.csv
├── budgets.csv
├── recurring.csv           (new)
├── media.csv
├── books.csv
├── workouts.csv
├── workout_templates.json  (new, nested lists)
├── body_weight.csv
├── meals.csv
├── foods_custom.csv
└── notes/
    └── 01JD…-app-de-receitas.md   YAML frontmatter (id, title, category, pinned, createdAt, updatedAt) + Markdown body
```

**CSV format:** the backup is built for restoring, not for spreadsheets.

- UTF-8 with a BOM, comma-separated (RFC 4180).
- Columns in `snake_case`. Money as integer `amount_cents`. Dates and timestamps in ISO format. Decimals with a dot.
- Soft-deleted rows, cached images, the TACO table and the enrichment queue are left out. Images come back through enrichment, using the stored external IDs.

**Import**

1. Pick a `.zip`. Nori reads `manifest.json`. An older `schemaVersion` is migrated. A newer one is refused with `backup de uma versão mais nova — atualize o Nori`.
2. A summary appears before anything changes, e.g. `312 lançamentos, 48 filmes, 17 livros…`.
3. Choose a mode:
   - **Mesclar** (default): rows are matched by `id`, and the newer `updatedAt` wins. This is how the phone → desktop copy works repeatedly.
   - **Substituir tudo:** wipes the database first and needs a second confirmation.
4. Nori first downloads a backup of the current data, then applies the import in a single Dexie transaction. Nothing is written if any file fails to parse.

**Keeping data safe**

- Call `navigator.storage.persist()` on first launch, and show the result in Configurações.
- Show a banner on Início when the last backup is more than 7 days old: `último backup há 9 dias — exportar agora`.
- On iPhone, the onboarding screen explains that Nori must always be opened from the home-screen icon. A Safari tab has separate storage from the installed app.

## Visual identity

The look follows two-color Japanese print posters: cream paper, cobalt ink and a sparing vermilion. The loud parts (halftone, bursts, offset print shadows) are kept for headers, empty states and celebrations. Screens full of data stay calm.

**Palette** (design tokens, adjustable)

| Token | Hex | Use |
| --- | --- | --- |
| `--washi` | `#F4ECDD` | Page background |
| `--paper` | `#FBF6EC` | Cards and sheets |
| `--sumi` | `#1A1A1A` | Text |
| `--sumi-soft` | `#5C574F` | Secondary text, rules |
| `--cobalt` | `#1F2FD1` | Interface: links, buttons, focus, chips, nori |
| `--vermilion` | `#E8341C` | Alerts, errors, over budget, seal stamps. Nothing else. |
| `--mustard` | `#E3C72B` | Highlights: today's column, selection |
| `--matcha` | `#4F7D3A` | Budget on track |
| `--kaki` | `#E07B1F` | Budget at risk |

The dark theme follows the system setting. It uses `--sumi` as the background, `--washi` for text and a lighter cobalt (`#7380FF`) for contrast. Every text and color pair meets WCAG AA, and color is never the only signal.

**Type:** two families, both open-licensed and self-hosted through `@fontsource` so they work offline.

- **Archivo:** 800–900 for display and headings, 400–600 for body text.
- **JetBrains Mono:** the command bar, chips, numbers and amounts, with tabular figures.

**Motifs**

- **Onigiri:** the app icon is a rounded triangle with a cobalt nori band on washi. The band filling up doubles as the loading indicator.
- **Logo:** "Nori" in Archivo Black next to のり (hiragana for *nori*), drawn as SVG so no Japanese font is needed.
- **Habit grid:** drawn as manuscript grid paper (genkō yōshi). A completed cell gets a vermilion seal stamp (a slightly rotated, textured circle).
- **Halftone texture** (CSS radial gradients): behind typographic covers and empty states.
- **Offset print shadow:** large headings get a 2 px cobalt or vermilion offset, like a misregistered print.
- **Starburst:** when a goal is hit (habit target, protein target, a month under budget), with the number inside.
- **Desktop sidebar:** stacked vertical labels (F I N A N Ç A S).
- **Framing:** thin vermilion rules at the top and bottom of section headers.

**Motion:** the error shake lasts 300 ms. A stamp scales from 1.2 to 1 with a small rotation. Page transitions are under 200 ms. Everything respects `prefers-reduced-motion`.

## Build plan

The build order puts the command engine and backups first, then the daily-use modules, with the API-heavy modules last. Each milestone ends with something usable on the phone.

1. **Foundation.** Scaffold Vite, Svelte 5 and TypeScript. Set up `vite-plugin-pwa`, the Dexie schema v1 with a migration hook, design tokens, self-hosted fonts, routing, settings, `storage.persist()` and the install onboarding. Deploy to Cloudflare Pages. Check cross-origin access for the TMDB, Google Books and Open Library image hosts.
   - *Done when:* installed from the home screen on an iPhone and an Android phone, and it opens in airplane mode.
2. **Command engine.** The parser as a pure TypeScript module with no UI imports, plus the live preview chips, error states, undo, command history, the `/` list, `/ajuda` and quick notes.
   - *Done when:* every test case in the Command grammar table passes in Vitest.
3. **Backup.** Zip export and import with `fflate`: Mesclar and Substituir modes, schema migration and the reminder banner.
   - *Done when:* data exported from one device and imported on another matches row for row.
4. **Daily core.** Início, Agenda (week kanban and month), Hábitos, reminders with .ics, and `/tarefa`, `/lembrete` and `/fiz`.
5. **Finance.** `/gastei`, `/recebi` and `/guardei`. Categories, accounts, budgets, installments, recurring charges, statements and the pace color.
6. **Notes.** `/nota`, the card grid, categories and search.
7. **Media and books.** `/assisti`, `/quero-ver`, `/lendo`, `/li` and `/quero-ler`. TMDB, Google Books and Open Library, the enrichment queue and the image cache.
8. **Fitness.** `/treino` and `/peso`, templates, sessions and progression charts.
9. **Nutrition.** `/comi`, the bundled TACO table, Open Food Facts, custom foods, targets, and the day, week and month views.
10. **Polish.** Dark theme, starbursts, an accessibility pass and a one-page install guide for friends.

**Repository layout**

```
src/
  lib/
    parser/         tokens.ts, dates.ts, money.ts, commands/*.ts, parser.test.ts
    db/             schema.ts, migrations.ts, repositories/*.ts
    integrations/   tmdb.ts, books.ts, taco.ts, off.ts, enrichment.ts
    backup/         export.ts, import.ts, csv.ts
    finance/        installments.ts, budgetMonth.ts, pace.ts
  screens/          Inicio, Agenda, Habitos, Financas, Midia, Leitura, Treino, Nutricao, Notas, Configuracoes
  ui/               CommandBar, Chip, Stamp, HabitGrid, TypoCover, Starburst, charts/
  styles/           tokens.css, base.css
public/taco.json
```

**Dependencies:** `dexie`, `ulidx`, `fflate`, `vite-plugin-pwa`, `@fontsource/archivo`, `@fontsource/jetbrains-mono`, `vitest`. Charts are small hand-written SVG components.

**Developing:** `npm install && npm run dev`. **Deploying:** push to `main`, and Cloudflare Pages builds and publishes. **For friends:** open the link and add it to the home screen. They never run a command.

**After v1:** cross-device sync, Letterboxd and Goodreads import, bank statement import, "where to watch" on the watchlist, the Sunday weekly review and a year-end summary.

## Sources

- [TMDB developer FAQ](https://developer.themoviedb.org/docs/faq): free non-commercial use and attribution requirements
- [TMDB API terms of use](https://www.themoviedb.org/api-terms-of-use)
- [MyFitnessPal API status](https://mcpservers.org/servers/cotlet-dev-integrations-myfitnesspal-api-mcp-server): not accepting API access requests (checked Nov 2026)
- [taco-api](https://github.com/raulfdm/taco-api): TACO data as open source (MIT)
- [TACO, 4th edition (NEPA/UNICAMP)](https://edisciplinas.usp.br/mod/resource/view.php?id=2301180): reproduction allowed with the source cited
- [web.dev — Storage for the web](https://web.dev/articles/storage-for-the-web): Safari's 7-day eviction and the home-screen exemption
- [MDN — Storage quotas and eviction criteria](https://developer.mozilla.org/docs/Web/API/Storage_API/Storage_quotas_and_eviction_criteria)
