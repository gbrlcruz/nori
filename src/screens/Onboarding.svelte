<script lang="ts">
  import Logo from '../ui/Logo.svelte';
  import Onigiri from '../ui/Onigiri.svelte';
  import { setSetting } from '../lib/db/repo';
  import { isAndroid, isIOS, isStandalone, requestPersistence } from '../lib/platform.svelte';

  const standalone = isStandalone();
  const ios = isIOS();
  const android = isAndroid();

  let busy = $state(false);

  async function start() {
    busy = true;
    await requestPersistence();
    await setSetting('onboardingDone', true);
  }
</script>

<main class="onboarding">
  <div class="hero halftone">
    <Onigiri size={120} label="Onigiri, o símbolo do Nori" />
  </div>

  <Logo />
  <p class="lead">Tarefas, hábitos, finanças, notas, filmes, livros, treino e alimentação. Tudo pela barra de comandos.</p>

  <ol class="steps">
    <li class="card">
      <strong>1. Instale na tela de início</strong>
      {#if standalone}
        <p>Pronto, o Nori já está instalado.</p>
      {:else if ios}
        <p>No Safari, toque em <strong>Compartilhar</strong> e depois em <strong>Adicionar à Tela de Início</strong>.</p>
        <p class="warn">Use sempre pelo ícone. No iPhone, o Safari guarda os dados separados do app instalado.</p>
      {:else if android}
        <p>No Chrome, abra o menu <strong>⋮</strong> e toque em <strong>Instalar app</strong>.</p>
      {:else}
        <p>No navegador, procure a opção <strong>Instalar</strong> na barra de endereço ou no menu.</p>
      {/if}
    </li>
    <li class="card">
      <strong>2. Seus dados ficam só neste aparelho</strong>
      <p>Nada vai para a internet. Faça backups em Configurações de vez em quando.</p>
    </li>
    <li class="card">
      <strong>3. Funciona sem internet</strong>
      <p>Tudo continua funcionando offline. Capas de filmes e livros aparecem quando a conexão voltar.</p>
    </li>
  </ol>

  <button class="btn primary start" type="button" onclick={start} disabled={busy}>Começar</button>
</main>

<style>
  .onboarding {
    max-width: 480px;
    margin: 0 auto;
    padding: calc(var(--s-6) + env(safe-area-inset-top)) var(--s-4) calc(var(--s-6) + env(safe-area-inset-bottom));
    display: flex;
    flex-direction: column;
    gap: var(--s-4);
  }
  .hero {
    display: grid;
    place-items: center;
    height: 200px;
    border: var(--border);
    border-radius: var(--radius-lg);
    background-color: var(--surface);
  }
  .lead {
    font-size: var(--fs-lg);
    font-weight: 500;
    line-height: 1.35;
  }
  .steps {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--s-3);
  }
  .steps p {
    margin-top: var(--s-1);
    color: var(--text-soft);
    font-size: var(--fs-sm);
  }
  .warn {
    color: var(--text) !important;
    border-left: 3px solid var(--danger);
    padding-left: var(--s-2);
  }
  .start {
    min-height: 52px;
    font-size: var(--fs-lg);
  }
</style>
