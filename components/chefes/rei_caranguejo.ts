// Rei Caranguejo (Ato VIII, onda 20): Carapaca. Recebe 70% menos dano, exceto numa janela de 3 s a
// cada 10 s em que abre a guarda (os ultimos 3 s de cada ciclo, contados desde que nasceu). Aberto:
// marca _guardaAberta (o GameCanvas brilha o sprite) e um sinal sobre ele.
import type { Enemy } from '../../types';
import type { ModuloChefe } from './tipos';
import { centro, reduzirDano, instalarReducao } from './util';

export const CARAPACA_CICLO = 10000, CARAPACA_ABERTA = 3000, CARAPACA_FICA = 0.3;
export const guardaAberta = (e: Enemy) => !!(e as any)._guardaAberta;

export const reiCaranguejo: ModuloChefe = {
  ...reduzirDano(e => guardaAberta(e) ? 1 : CARAPACA_FICA),
  aCadaQuadro(ctx, chefe, dt) {
    instalarReducao(chefe, e => guardaAberta(e) ? 1 : CARAPACA_FICA);
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    x._carapacaT = ((x._carapacaT ?? 0) + dt) % CARAPACA_CICLO;
    const aberta = x._carapacaT >= CARAPACA_CICLO - CARAPACA_ABERTA;
    if (aberta && !x._guardaAberta) {
      const c = centro(chefe);
      ctx.efeito(c.x, c.y - chefe.height / 2 - 12, '◎', '#fbbf24', 60);
    }
    x._guardaAberta = aberta;
  },
};
