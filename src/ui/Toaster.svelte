<script lang="ts">
  import { toast } from './toast.svelte';
</script>

<div class="toaster" role="status" aria-live="polite">
  {#each toast.items as t (t.id)}
    <div class="toast">
      <span>{t.message}</span>
      {#if t.action}
        <button
          type="button"
          onclick={async () => {
            await t.action!.run();
            toast.dismiss(t.id);
          }}>{t.action.label}</button
        >
      {/if}
    </div>
  {/each}
</div>

<style>
  .toaster {
    position: fixed;
    left: 50%;
    bottom: calc(var(--nav-h) + env(safe-area-inset-bottom) + var(--s-3));
    transform: translateX(-50%);
    z-index: 40;
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
    width: min(92vw, 420px);
    pointer-events: none;
  }
  .toast {
    pointer-events: auto;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    padding: var(--s-3) var(--s-4);
    background: var(--text);
    color: var(--bg);
    border-radius: var(--radius);
    font-size: var(--fs-sm);
    font-weight: 500;
  }
  button {
    border: 0;
    background: none;
    color: var(--mustard);
    font-weight: 700;
    padding: var(--s-1) 0;
  }
  @media (min-width: 900px) {
    .toaster {
      bottom: var(--s-5);
      left: calc(50% + var(--sidebar-w) / 2);
    }
  }
</style>
