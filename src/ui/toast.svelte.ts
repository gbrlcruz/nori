// Minimal toast queue. `toast.show('Nota salva', { action: { label: 'Desfazer', run } })`.

export interface ToastAction {
  label: string;
  run: () => void | Promise<void>;
}

interface ToastItem {
  id: number;
  message: string;
  action?: ToastAction;
}

class Toasts {
  items = $state<ToastItem[]>([]);
  #next = 1;

  show(message: string, opts: { action?: ToastAction; ms?: number } = {}) {
    const id = this.#next++;
    this.items = [...this.items, { id, message, action: opts.action }];
    setTimeout(() => this.dismiss(id), opts.ms ?? 6000);
  }

  dismiss(id: number) {
    this.items = this.items.filter((t) => t.id !== id);
  }
}

export const toast = new Toasts();
