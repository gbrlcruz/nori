# Nori

Command-first personal organizer for a small group of friends: tasks, habits, finance, notes, movies, books, workouts and nutrition. Offline-first PWA, all data stays on the device, zero running cost.

- **Spec:** [`SPEC.md`](SPEC.md) (source of truth)
- **Instructions for Claude / contributors:** [`CLAUDE.md`](CLAUDE.md)

## Develop

```bash
npm install
npm run dev        # http://localhost:5173
npm test           # unit tests (Vitest)
npm run check      # type check
npm run build      # production build + service worker → dist/
npm run preview    # serve dist/ to test install/offline locally
```

## Deploy (free, Cloudflare Pages)

1. Push this repo to GitHub.
2. Cloudflare dashboard → Workers & Pages → Create → Pages → connect the repo.
3. Framework preset: **None**. Build command: `npm run build`. Output directory: `dist`.
4. Every push to `main` publishes a new version. Installed apps update themselves on next launch.

## Para os amigos (instalação)

1. Abra o link do Nori no celular.
2. **iPhone:** no Safari, toque em **Compartilhar** → **Adicionar à Tela de Início**. Use sempre pelo ícone (no Safari os dados ficam separados).
3. **Android:** no Chrome, menu **⋮** → **Instalar app**.
4. Seus dados ficam só no seu aparelho. Faça backup em **Configurações** de vez em quando.

## Status

Milestone 1 (foundation) is done: app shell, navigation, PWA install + offline, Dexie schema v1, design tokens, onboarding, quick notes from the command bar. Next: milestone 2, the command engine. See `CLAUDE.md` → Current status.
