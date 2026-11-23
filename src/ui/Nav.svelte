<script lang="ts">
  import { ROUTES, router, type RouteId } from '../lib/router.svelte';
  import Icon from './Icon.svelte';
  import Onigiri from './Onigiri.svelte';

  const primary = ROUTES.filter((r) => r.primary);
  const desktop = ROUTES.filter((r) => r.id !== 'mais');

  const href = (id: RouteId) => (id === 'inicio' ? '#/' : `#/${id}`);
</script>

<!-- Mobile: bottom bar -->
<nav class="bottom" aria-label="Navegação principal">
  {#each primary as r (r.id)}
    <a href={href(r.id)} class:active={router.navId === r.id} aria-current={router.navId === r.id ? 'page' : undefined}>
      <Icon name={r.icon} />
      <span>{r.label}</span>
    </a>
  {/each}
</nav>

<!-- Desktop: sidebar with stacked vertical labels -->
<nav class="side" aria-label="Navegação principal">
  <a class="home-mark" href="#/" aria-label="Início">
    <Onigiri size={40} />
  </a>
  {#each desktop as r (r.id)}
    <a href={href(r.id)} class:active={router.current === r.id} aria-current={router.current === r.id ? 'page' : undefined} title={r.label}>
      <Icon name={r.icon} size={22} />
      {#if router.current === r.id}
        <span class="vertical">{r.label}</span>
      {:else}
        <span class="visually-hidden">{r.label}</span>
      {/if}
    </a>
  {/each}
</nav>

<style>
  .bottom {
    position: fixed;
    inset: auto 0 0 0;
    z-index: 20;
    display: grid;
    grid-template-columns: repeat(5, 1fr);
    height: calc(var(--nav-h) + env(safe-area-inset-bottom));
    padding-bottom: env(safe-area-inset-bottom);
    background: var(--surface);
    border-top: var(--border);
  }
  .bottom a {
    display: flex;
    flex-direction: column;
    align-items: center;
    justify-content: center;
    gap: 2px;
    color: var(--text-soft);
    text-decoration: none;
    font-size: 0.7rem;
    font-weight: 600;
  }
  .bottom a.active {
    color: var(--accent);
  }
  .bottom a.active :global(svg) {
    stroke-width: 2.4;
  }

  .side {
    display: none;
  }

  @media (min-width: 900px) {
    .bottom {
      display: none;
    }
    .side {
      position: fixed;
      inset: 0 auto 0 0;
      z-index: 20;
      width: var(--sidebar-w);
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s-2);
      padding: var(--s-4) 0;
      background: var(--surface);
      border-right: var(--border);
      overflow-y: auto;
    }
    .home-mark {
      margin-bottom: var(--s-3);
    }
    .side a:not(.home-mark) {
      display: flex;
      flex-direction: column;
      align-items: center;
      gap: var(--s-2);
      width: 64px;
      padding: var(--s-3) 0;
      border-radius: var(--radius);
      color: var(--text-soft);
      text-decoration: none;
    }
    .side a.active {
      color: var(--accent);
      background: var(--accent-soft);
    }
    .vertical {
      writing-mode: vertical-rl;
      text-orientation: upright;
      font-size: 0.62rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      text-transform: uppercase;
      line-height: 1;
    }
  }
</style>
