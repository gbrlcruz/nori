<script lang="ts">
  /** The Nori onigiri. `fill` (0–1) raises the nori band, which doubles as a progress/loading indicator. */
  let { size = 64, fill = 1, label = '' }: { size?: number; fill?: number; label?: string } = $props();

  const bandTop = $derived(412 - 140 * Math.max(0, Math.min(1, fill)));
</script>

<svg
  width={size}
  height={size}
  viewBox="60 60 392 392"
  role={label ? 'img' : undefined}
  aria-label={label || undefined}
  aria-hidden={label ? undefined : 'true'}
>
  <polygon points="256,118 404,376 108,376" fill="var(--accent)" stroke="var(--accent)" stroke-width="92" stroke-linejoin="round" />
  <polygon points="256,118 404,376 108,376" fill="#fffdf8" stroke="#fffdf8" stroke-width="72" stroke-linejoin="round" />
  <rect x="198" y={bandTop} width="116" height={412 - bandTop} fill="var(--accent)" />
</svg>
