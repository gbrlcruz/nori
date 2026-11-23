<script lang="ts">
  import Onigiri from './Onigiri.svelte';

  let { milestone, items }: { milestone: number; items: string[] } = $props();
</script>

<section class="coming card halftone" aria-label="Em construção">
  <Onigiri size={56} />
  <div>
    <p class="tag mono">marco {milestone}</p>
    <p class="lead">Esta tela ainda está sendo preparada. Vai ter:</p>
    <ul>
      {#each items as item}<li>{item}</li>{/each}
    </ul>
  </div>
</section>

<style>
  .coming {
    display: flex;
    gap: var(--s-4);
    align-items: flex-start;
  }
  .tag {
    display: inline-block;
    font-size: var(--fs-xs);
    padding: 2px var(--s-2);
    border: 1px solid var(--accent);
    color: var(--accent);
    border-radius: 999px;
    background: var(--surface);
    margin-bottom: var(--s-2);
  }
  .lead {
    font-weight: 600;
    background: var(--surface);
    width: fit-content;
  }
  ul {
    margin: var(--s-2) 0 0;
    padding-left: 1.1em;
  }
  li {
    background: var(--surface);
    width: fit-content;
  }
</style>
