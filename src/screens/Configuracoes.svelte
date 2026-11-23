<script lang="ts">
  import ScreenHeader from '../ui/ScreenHeader.svelte';
  import Icon from '../ui/Icon.svelte';
  import { live } from '../lib/live.svelte';
  import { getSettings, setSetting } from '../lib/db/repo';
  import { SCHEMA_VERSION } from '../lib/db/schema';
  import { isIOS, isStandalone, persistState, requestPersistence, storageEstimate, type PersistState } from '../lib/platform.svelte';
  import { formatNumberBR } from '../lib/format';
  import type { WeekStart } from '../lib/dates';

  const settings = live(() => getSettings(), null);

  let persist = $state<PersistState | null>(null);
  let usage = $state<string>('');
  const standalone = isStandalone();
  const ios = isIOS();

  $effect(() => {
    persistState().then((s) => (persist = s));
    storageEstimate().then((e) => {
      if (e) usage = `${formatNumberBR(e.usage / 1024 / 1024, 1)} MB usados`;
    });
  });

  async function askPersist() {
    persist = await requestPersistence();
  }

  function setWeekStart(v: WeekStart) {
    setSetting('weekStart', v);
  }

  const persistLabel: Record<PersistState, string> = {
    persisted: 'Protegido: o navegador não vai apagar seus dados para liberar espaço.',
    'not-persisted': 'Não protegido: o navegador pode apagar os dados se faltar espaço.',
    unsupported: 'Este navegador não informa se os dados estão protegidos.',
  };
</script>

<ScreenHeader title="Configurações" />

<div class="sections">
  <section class="card">
    <h2>Preferências</h2>
    <div class="row">
      <span id="week-label">Primeiro dia da semana</span>
      <div class="segmented" role="radiogroup" aria-labelledby="week-label">
        {#each [['mon', 'Segunda'], ['sun', 'Domingo']] as [v, label] (v)}
          <button
            type="button"
            role="radio"
            aria-checked={settings.value?.weekStart === v}
            class:on={settings.value?.weekStart === v}
            onclick={() => setWeekStart(v as WeekStart)}>{label}</button
          >
        {/each}
      </div>
    </div>
    <p class="soft">Categorias, contas, metas e hábitos chegam junto com cada módulo.</p>
  </section>

  <section class="card">
    <h2>Este aparelho</h2>
    <div class="status">
      <span class="dot" class:ok={standalone}></span>
      <p>
        {#if standalone}
          Instalado na tela de início.
        {:else if ios}
          Aberto no Safari. Toque em <strong>Compartilhar</strong> → <strong>Adicionar à Tela de Início</strong> e use sempre pelo ícone:
          no Safari, os dados ficam separados do app instalado.
        {:else}
          Aberto no navegador. No menu do navegador, escolha <strong>Instalar app</strong> ou <strong>Adicionar à tela inicial</strong>.
        {/if}
      </p>
    </div>
    <div class="status">
      <span class="dot" class:ok={persist === 'persisted'}></span>
      <p>{persist ? persistLabel[persist] : 'Verificando armazenamento…'}</p>
    </div>
    {#if persist === 'not-persisted'}
      <button class="btn" type="button" onclick={askPersist}>Proteger meus dados</button>
    {/if}
    {#if usage}<p class="soft mono">{usage}</p>{/if}
  </section>

  <section class="card">
    <h2>Backup</h2>
    <p class="soft">Exportar e importar chegam no marco 3. Até lá, seus dados ficam só neste aparelho.</p>
  </section>

  <section class="card about">
    <h2>Sobre</h2>
    <p><strong>Nori</strong> <span class="mono soft">v{__APP_VERSION__} · esquema {SCHEMA_VERSION}</span></p>
    <p class="soft">Seus dados ficam só neste aparelho. Sem contas, sem anúncios, sem rastreamento.</p>
    <h3>Créditos</h3>
    <ul class="soft">
      <li>Dados de filmes e séries: TMDB. Este produto usa a API do TMDB, mas não é endossado nem certificado pelo TMDB.</li>
      <li>Alimentos: Tabela Brasileira de Composição de Alimentos (TACO), NEPA/UNICAMP.</li>
      <li>Livros: Google Books e Open Library.</li>
      <li>Fontes: Archivo e JetBrains Mono (SIL Open Font License).</li>
    </ul>
    <p class="soft small"><Icon name="check" size={14} /> Os créditos acima valem a partir dos módulos que usam cada serviço.</p>
  </section>
</div>

<style>
  .sections {
    display: flex;
    flex-direction: column;
    gap: var(--s-4);
  }
  h2 {
    font-size: var(--fs-md);
    font-weight: 800;
    margin-bottom: var(--s-3);
  }
  h3 {
    font-size: var(--fs-sm);
    font-weight: 700;
    margin: var(--s-3) 0 var(--s-1);
  }
  .row {
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: var(--s-3);
    flex-wrap: wrap;
    margin-bottom: var(--s-3);
  }
  .segmented {
    display: inline-flex;
    border: 1.5px solid var(--text);
    border-radius: var(--radius);
    overflow: hidden;
  }
  .segmented button {
    border: 0;
    background: var(--surface);
    padding: var(--s-2) var(--s-3);
    min-height: 40px;
    font-weight: 600;
  }
  .segmented button.on {
    background: var(--accent);
    color: var(--accent-ink);
  }
  .status {
    display: flex;
    gap: var(--s-3);
    align-items: flex-start;
    margin-bottom: var(--s-3);
  }
  .dot {
    flex: none;
    width: 10px;
    height: 10px;
    margin-top: 7px;
    border-radius: 50%;
    background: var(--kaki);
  }
  .dot.ok {
    background: var(--matcha);
  }
  .soft {
    color: var(--text-soft);
    font-size: var(--fs-sm);
  }
  .small {
    font-size: var(--fs-xs);
    margin-top: var(--s-3);
    display: flex;
    gap: var(--s-1);
    align-items: center;
  }
  ul {
    margin: 0;
    padding-left: 1.1em;
  }
  .about p {
    margin-bottom: var(--s-1);
  }
</style>
