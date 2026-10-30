// Fenix Ancia (Ato VI, onda 25): renasce uma vez — na 1a morte volta com 40% da vida no mesmo
// lugar (chamas); so a 2a morte conta. Nao fala.
import type { ModuloChefe } from './tipos';
import { centro } from './util';

export const FENIX_RENASCE = 0.40;

export const fenixAncia: ModuloChefe = {
  antesDeMorrer(ctx, chefe) {
    const x = chefe as any;
    if (x._renasceu) return false;
    x._renasceu = true;
    x._renasceuEm = ctx.agora;
    chefe.hp = Math.ceil(chefe.maxHp * FENIX_RENASCE);
    chefe.bleedStacks = 0;
    const c = centro(chefe);
    for (let k = 0; k < 6; k++) {
      const a = (k / 6) * Math.PI * 2;
      ctx.efeito(c.x + Math.cos(a) * 50, c.y + Math.sin(a) * 40, '🔥', '#f97316', 50);
    }
    return true;
  },
};
