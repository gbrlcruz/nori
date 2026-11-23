// Hash router: `#/financas`. Static hosting needs no rewrite rules and it works offline.

export type RouteId =
  | 'inicio' | 'agenda' | 'financas' | 'notas' | 'mais'
  | 'habitos' | 'midia' | 'leitura' | 'treino' | 'nutricao' | 'configuracoes';

export type IconName =
  | 'home' | 'calendar' | 'wallet' | 'note' | 'grid'
  | 'stamp' | 'film' | 'book' | 'dumbbell' | 'bowl' | 'gear';

export interface Route {
  id: RouteId;
  label: string;
  icon: IconName;
  /** Shown in the mobile bottom bar (the rest live under Mais). */
  primary: boolean;
}

export const ROUTES: Route[] = [
  { id: 'inicio', label: 'Início', icon: 'home', primary: true },
  { id: 'agenda', label: 'Agenda', icon: 'calendar', primary: true },
  { id: 'financas', label: 'Finanças', icon: 'wallet', primary: true },
  { id: 'notas', label: 'Notas', icon: 'note', primary: true },
  { id: 'mais', label: 'Mais', icon: 'grid', primary: true },
  { id: 'habitos', label: 'Hábitos', icon: 'stamp', primary: false },
  { id: 'midia', label: 'Mídia', icon: 'film', primary: false },
  { id: 'leitura', label: 'Leitura', icon: 'book', primary: false },
  { id: 'treino', label: 'Treino', icon: 'dumbbell', primary: false },
  { id: 'nutricao', label: 'Nutrição', icon: 'bowl', primary: false },
  { id: 'configuracoes', label: 'Configurações', icon: 'gear', primary: false },
];

const SECONDARY: RouteId[] = ROUTES.filter((r) => !r.primary).map((r) => r.id);

function parseHash(hash: string): RouteId {
  const id = hash.replace(/^#\/?/, '').split(/[/?]/)[0];
  return (ROUTES.find((r) => r.id === id)?.id ?? 'inicio') as RouteId;
}

class Router {
  current = $state<RouteId>(typeof location === 'undefined' ? 'inicio' : parseHash(location.hash));

  constructor() {
    if (typeof window !== 'undefined') {
      window.addEventListener('hashchange', () => {
        this.current = parseHash(location.hash);
        window.scrollTo(0, 0);
      });
    }
  }

  go(id: RouteId) {
    location.hash = id === 'inicio' ? '#/' : `#/${id}`;
  }

  /** Which bottom-bar item is lit: secondary screens light up "Mais". */
  get navId(): RouteId {
    return SECONDARY.includes(this.current) ? 'mais' : this.current;
  }
}

export const router = new Router();

export function routeById(id: RouteId): Route {
  return ROUTES.find((r) => r.id === id)!;
}
