<script lang="ts">
  import CommandBar from '../ui/CommandBar.svelte';
  import Onigiri from '../ui/Onigiri.svelte';
  import { live } from '../lib/live.svelte';
  import { db } from '../lib/db/schema';
  import { getSettings } from '../lib/db/repo';
  import { formatLongDateBR, todayISO, weekDates, weekdayShortBR } from '../lib/dates';

  const today = todayISO();

  const settings = live(() => getSettings(), null);
  const week = $derived(weekDates(today, settings.value?.weekStart ?? 'mon'));

  const inbox = live(
    () =>
      db.notes
        .where('category')
        .equals('entrada')
        .filter((n) => !n.deletedAt)
        .reverse()
        .sortBy('createdAt')
        .then((rows) => rows.slice(0, 5)),
    [],
  );
</script>

<div class="inicio">
  <p class="today mono">{formatLongDateBR(today)}</p>

  <CommandBar />

  <section aria-labelledby="hoje">
    <h2 id="hoje">Hoje</h2>
    <div class="card empty halftone">
      <Onigiri size={40} />
      <p><span>Nada para hoje.</span> <span class="hint mono">/tarefa</span> <span>chega em breve.</span></p>
    </div>
  </section>

  <section aria-labelledby="habitos">
    <h2 id="habitos">Hábitos da semana</h2>
    <div class="week card" role="list">
      {#each week as d (d)}
        <div class="day" class:today={d === today} role="listitem" aria-current={d === today ? 'date' : undefined}>
          <span class="wd">{weekdayShortBR(d)}</span>
          <span class="num mono">{Number(d.slice(8))}</span>
        </div>
      {/each}
    </div>
  </section>

  <section aria-labelledby="orcamento">
    <h2 id="orcamento">Orçamento do mês</h2>
    <div class="card budget">
      <p class="soft">Defina um orçamento em Finanças para ver quanto ainda dá para gastar.</p>
    </div>
  </section>

  {#if inbox.value.length}
    <section aria-labelledby="entrada">
      <h2 id="entrada">Entrada</h2>
      <ul class="inbox">
        {#each inbox.value as note (note.id)}
          <li class="card">{note.body}</li>
        {/each}
      </ul>
    </section>
  {/if}
</div>

<style>
  .inicio {
    display: flex;
    flex-direction: column;
    gap: var(--s-5);
  }
  .today {
    color: var(--text-soft);
    font-size: var(--fs-sm);
    margin-bottom: calc(-1 * var(--s-2));
  }
  h2 {
    font-size: var(--fs-sm);
    font-weight: 800;
    text-transform: uppercase;
    letter-spacing: 0.08em;
    margin-bottom: var(--s-2);
  }
  .empty {
    display: flex;
    align-items: center;
    gap: var(--s-3);
  }
  .empty p span {
    background: var(--surface);
  }
  .hint {
    color: var(--accent);
    font-weight: 500;
  }
  .week {
    display: grid;
    grid-template-columns: repeat(7, 1fr);
    gap: var(--s-1);
    padding: var(--s-2);
  }
  .day {
    display: flex;
    flex-direction: column;
    align-items: center;
    padding: var(--s-2) 0;
    border-radius: var(--radius);
  }
  .day.today {
    background: var(--highlight);
    font-weight: 700;
  }
  .wd {
    font-size: var(--fs-xs);
    color: var(--text-soft);
    text-transform: uppercase;
  }
  .day.today .wd {
    color: var(--text);
  }
  .num {
    font-size: var(--fs-lg);
  }
  .soft {
    color: var(--text-soft);
    font-size: var(--fs-sm);
  }
  .inbox {
    list-style: none;
    margin: 0;
    padding: 0;
    display: flex;
    flex-direction: column;
    gap: var(--s-2);
  }
  .inbox li {
    padding: var(--s-3) var(--s-4);
  }
</style>
