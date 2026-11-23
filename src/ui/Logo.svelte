<script lang="ts">
  import Onigiri from './Onigiri.svelte';

  let { compact = false }: { compact?: boolean } = $props();
</script>

<span class="logo" class:compact aria-label="Nori">
  <Onigiri size={compact ? 26 : 40} />
  <span class="word" aria-hidden="true">Nori</span>
  {#if !compact}
    <!-- のり (hiragana for "nori"), drawn as SVG paths so no Japanese font is needed -->
    <svg class="kana" viewBox="0 0 64 32" width="40" height="20" aria-hidden="true">
      <!-- の -->
      <path
        d="M16 7c-1.5 6-3 13-7 17-3 3-6 0-5-5 1.5-7 9-11 15-10 6 1 9 6 8 11-1 6-6 9-11 10"
        fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"
      />
      <!-- り -->
      <path
        d="M40 6c-1 5-1 10 1 13M52 5c2 8 1 16-6 22"
        fill="none" stroke="currentColor" stroke-width="2.6" stroke-linecap="round" stroke-linejoin="round"
      />
    </svg>
  {/if}
</span>

<style>
  .logo {
    display: inline-flex;
    align-items: center;
    gap: var(--s-2);
    color: var(--text);
  }
  .word {
    font-weight: 900;
    font-size: 1.6rem;
    letter-spacing: -0.03em;
    line-height: 1;
  }
  .compact .word {
    font-size: 1.15rem;
  }
  .kana {
    color: var(--accent);
    margin-left: 2px;
  }
</style>
