<script lang="ts">
  import ScreenHeader from '../ui/ScreenHeader.svelte';
  import Icon from '../ui/Icon.svelte';
  import { ROUTES } from '../lib/router.svelte';

  const items = ROUTES.filter((r) => !r.primary);
</script>

<ScreenHeader title="Mais" />

<ul class="tiles">
  {#each items as r (r.id)}
    <li>
      <a class="card" href={`#/${r.id}`}>
        <Icon name={r.icon} size={28} />
        <span>{r.label}</span>
      </a>
    </li>
  {/each}
</ul>

<style>
  .tiles {
    list-style: none;
    margin: 0;
    padding: 0;
    display: grid;
    grid-template-columns: repeat(2, 1fr);
    gap: var(--s-3);
  }
  a {
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
    min-height: 104px;
    justify-content: space-between;
    color: var(--text);
    text-decoration: none;
    font-weight: 700;
    border: 1.5px solid var(--text);
  }
  a :global(svg) {
    color: var(--accent);
  }
  a:active {
    transform: translate(1px, 1px);
  }
</style>
