<script lang="ts">
  import ScreenHeader from '../ui/ScreenHeader.svelte';
  import ComingSoon from '../ui/ComingSoon.svelte';

  let { title, subtitle = '', milestone, items }: { title: string; subtitle?: string; milestone: number; items: string[] } =
    $props();
</script>

<ScreenHeader {title} {subtitle} />
<ComingSoon {milestone} {items} />
