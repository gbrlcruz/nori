<script lang="ts">
  // Milestone 1: the bar saves quick notes (text without "/"). The parser arrives in milestone 2.
  import { addQuickNote, softDelete } from '../lib/db/repo';
  import { db } from '../lib/db/schema';
  import { toast } from './toast.svelte';

  let value = $state('');
  let error = $state('');
  let shaking = $state(false);
  let lastInput = '';

  function fail(message: string) {
    error = message;
    shaking = false;
    requestAnimationFrame(() => (shaking = true));
  }

  async function submit(e: SubmitEvent) {
    e.preventDefault();
    const text = value.trim();
    if (!text) return;

    if (text.startsWith('/')) {
      fail('Os comandos chegam em breve. Por enquanto, escreva sem a barra para salvar uma nota.');
      return;
    }

    const note = await addQuickNote(text);
    lastInput = text;
    value = '';
    error = '';
    toast.show('Nota salva em Entrada', {
      action: { label: 'Desfazer', run: () => softDelete(db.notes, note.id) },
    });
  }

  function onkeydown(e: KeyboardEvent) {
    if (e.key === 'ArrowUp' && !value && lastInput) {
      e.preventDefault();
      value = lastInput;
    }
    if (e.key === 'Escape') {
      value = '';
      error = '';
    }
  }
</script>

<form class="command" class:error={!!error} class:shaking onsubmit={submit} onanimationend={() => (shaking = false)}>
  <label for="command-input" class="visually-hidden">Comando ou nota rápida</label>
  <span class="prompt mono" aria-hidden="true">›</span>
  <input
    id="command-input"
    class="mono"
    type="text"
    bind:value
    oninput={() => (error = '')}
    {onkeydown}
    placeholder="/gastei 32,50 mercado — ou anote algo"
    autocomplete="off"
    autocapitalize="none"
    autocorrect="off"
    spellcheck="false"
    enterkeyhint="send"
    aria-invalid={!!error}
    aria-describedby={error ? 'command-error' : undefined}
  />
  <button class="send" type="submit" aria-label="Enviar">↵</button>
</form>
{#if error}
  <p id="command-error" class="message" role="alert">{error}</p>
{/if}

<style>
  .command {
    display: flex;
    align-items: center;
    gap: var(--s-2);
    padding: 0 var(--s-2) 0 var(--s-4);
    min-height: 56px;
    background: var(--surface);
    border: 2px solid var(--text);
    border-radius: var(--radius-lg);
    box-shadow: 4px 4px 0 var(--accent);
    transition: border-color 120ms, box-shadow 120ms;
  }
  .command:focus-within {
    border-color: var(--accent);
  }
  .command.error {
    border-color: var(--danger);
    box-shadow: 4px 4px 0 var(--danger);
  }
  .command.shaking {
    animation: shake var(--shake) ease-in-out;
  }
  .prompt {
    color: var(--accent);
    font-size: 1.3rem;
    font-weight: 500;
  }
  .error .prompt {
    color: var(--danger);
  }
  input {
    flex: 1;
    min-width: 0;
    border: 0;
    outline: 0;
    background: transparent;
    color: var(--text);
    font-size: 1rem; /* ≥16px stops iOS from zooming on focus */
    padding: var(--s-3) 0;
  }
  input::placeholder {
    color: var(--text-soft);
    opacity: 0.8;
  }
  .send {
    width: 40px;
    height: 40px;
    border: 0;
    border-radius: var(--radius);
    background: var(--accent);
    color: var(--accent-ink);
    font-size: 1.1rem;
    font-weight: 700;
  }
  .error .send {
    background: var(--danger);
  }
  .message {
    margin-top: var(--s-2);
    color: var(--danger);
    font-size: var(--fs-sm);
    font-weight: 600;
  }
</style>
