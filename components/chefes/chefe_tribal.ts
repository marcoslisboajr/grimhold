// Chefe Tribal (Ato VII, onda 25): a 66% e a 33% chama 1 guerreiro de cada tribo (uma vez cada).
import type { ModuloChefe } from './tipos';
import { centro, invocar } from './util';

export const TRIBAL_LIMIARES = [0.66, 0.33];
export const TRIBOS = ['tribo_lobo', 'tribo_raposa', 'tribo_ave', 'tribo_peixe'];

export const chefeTribal: ModuloChefe = {
  aCadaQuadro(ctx, chefe) {
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    x._tribalChamou ??= [];
    const c = centro(chefe);
    TRIBAL_LIMIARES.forEach((l, i) => {
      if (x._tribalChamou[i] || chefe.hp >= chefe.maxHp * l) return;
      x._tribalChamou[i] = true;
      TRIBOS.forEach((t, k) => ctx.adicionarInimigo(invocar(ctx, chefe, t, c.x + 50, c.y + (k - 1.5) * 75)));
      ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#fb923c', 40);
    });
  },
};
