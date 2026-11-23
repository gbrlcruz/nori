<script lang="ts">
  import type { Snippet } from 'svelte';

  let { title, subtitle = '', children }: { title: string; subtitle?: string; children?: Snippet } = $props();
</script>

<header class="screen-header">
  <div class="rule"></div>
  <div class="row">
    <div>
      <h1 class="display">{title}</h1>
      {#if subtitle}<p class="subtitle">{subtitle}</p>{/if}
    </div>
    {@render children?.()}
  </div>
  <div class="rule"></div>
</header>

<style>
  .screen-header {
    margin-bottom: var(--s-5);
  }
  .rule {
    height: 2px;
    background: var(--danger);
    width: 64%;
  }
  .rule:last-child {
    width: 100%;
    height: 1px;
    opacity: 0.6;
  }
  .row {
    display: flex;
    align-items: end;
    justify-content: space-between;
    gap: var(--s-4);
    padding: var(--s-4) 0;
  }
  .subtitle {
    margin-top: var(--s-2);
    color: var(--text-soft);
    font-size: var(--fs-sm);
  }
</style>
