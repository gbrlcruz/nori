<script lang="ts">
  import Nav from './ui/Nav.svelte';
  import Logo from './ui/Logo.svelte';
  import Icon from './ui/Icon.svelte';
  import Toaster from './ui/Toaster.svelte';
  import Inicio from './screens/Inicio.svelte';
  import Mais from './screens/Mais.svelte';
  import Configuracoes from './screens/Configuracoes.svelte';
  import Onboarding from './screens/Onboarding.svelte';
  import Placeholder from './screens/Placeholder.svelte';
  import { router } from './lib/router.svelte';
  import { connection } from './lib/platform.svelte';
  import { live } from './lib/live.svelte';
  import { getSettings, purgeDeleted } from './lib/db/repo';

  const settings = live(() => getSettings(), null);

  // Daily housekeeping: purge rows soft-deleted more than 30 days ago.
  $effect(() => {
    purgeDeleted().catch((e) => console.error('[purge]', e));
  });

  const placeholders: Record<string, { title: string; milestone: number; items: string[] }> = {
    agenda: {
      title: 'Agenda',
      milestone: 4,
      items: ['Semana em colunas, com "Algum dia"', 'Calendário do mês', '/tarefa e /lembrete'],
    },
    financas: {
      title: 'Finanças',
      milestone: 5,
      items: ['/gastei, /recebi e /guardei', 'Orçamento por categoria e ritmo do mês', 'Faturas dos cartões e parcelas futuras'],
    },
    notas: {
      title: 'Notas',
      milestone: 6,
      items: ['Cartões por categoria', 'Busca', '/nota com #categoria'],
    },
    habitos: {
      title: 'Hábitos',
      milestone: 4,
      items: ['Grade da semana com carimbos', 'Hábitos com quantidade e meta diária', '/fiz'],
    },
    midia: {
      title: 'Mídia',
      milestone: 7,
      items: ['Quero ver e Assistidos', 'Pôsteres do TMDB, também offline', '/assisti e /quero-ver'],
    },
    leitura: {
      title: 'Leitura',
      milestone: 7,
      items: ['Lendo, Quero ler e Lidos', 'Capas e autores automáticos', '/lendo, /li e /quero-ler'],
    },
    treino: {
      title: 'Treino',
      milestone: 8,
      items: ['Modelos de treino (A, B, C)', 'Evolução de carga por exercício', '/treino e /peso'],
    },
    nutricao: {
      title: 'Nutrição',
      milestone: 9,
      items: ['Refeições do dia com calorias e proteína', 'Tabela TACO, funciona offline', '/comi'],
    },
  };
</script>

{#if settings.loaded && settings.value && !settings.value.onboardingDone}
  <Onboarding />
{:else if settings.loaded}
  <Nav />
  <div class="shell">
    <header class="topbar">
      <a href="#/" class="brand" aria-label="Nori, início"><Logo compact /></a>
      {#if !connection.online}
        <span class="offline mono" role="status"><Icon name="wifi-off" size={14} /> offline</span>
      {/if}
    </header>

    <main>
      {#if router.current === 'inicio'}
        <Inicio />
      {:else if router.current === 'mais'}
        <Mais />
      {:else if router.current === 'configuracoes'}
        <Configuracoes />
      {:else}
        {@const p = placeholders[router.current]}
        <Placeholder title={p.title} milestone={p.milestone} items={p.items} />
      {/if}
    </main>
  </div>
  <Toaster />
{/if}

<style>
  .shell {
    max-width: var(--content-max);
    margin: 0 auto;
    padding: env(safe-area-inset-top) var(--s-4) calc(var(--nav-h) + env(safe-area-inset-bottom) + var(--s-6));
  }
  .topbar {
    display: flex;
    align-items: center;
    justify-content: space-between;
    min-height: 56px;
  }
  .brand {
    text-decoration: none;
  }
  .offline {
    display: inline-flex;
    align-items: center;
    gap: var(--s-1);
    padding: 2px var(--s-2);
    border: 1px solid var(--text-soft);
    border-radius: 999px;
    font-size: var(--fs-xs);
    color: var(--text-soft);
  }
  main {
    padding-top: var(--s-2);
  }
  @media (min-width: 900px) {
    .shell {
      margin-left: calc(var(--sidebar-w) + max(var(--s-6), (100vw - var(--sidebar-w) - var(--content-max)) / 2));
      margin-right: auto;
      padding-bottom: var(--s-7);
    }
    .brand {
      visibility: hidden;
    }
  }
</style>
