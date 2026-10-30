// Cranio Ancestral (Ato IX, onda 10): voa (ehVoador). A cada 8 s (depois de chegar) cospe 2
// cranios em chamas (cranio_c) a frente dele; abaixo de 50% da vida cospe 3. Nao fala.
import type { ModuloChefe } from './tipos';
import { centro, invocar, semRecompensa } from './util';

export const CUSPE_CADA = 8000, CUSPE_N = 2, CUSPE_N_FURIA = 3, CUSPE_FURIA = 0.5;

export const cranioAncestral: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
    x._cuspeT = (x._cuspeT ?? 0) + dt;
    if (x._cuspeT < CUSPE_CADA) return;
    x._cuspeT -= CUSPE_CADA;
    const n = chefe.hp < chefe.maxHp * CUSPE_FURIA ? CUSPE_N_FURIA : CUSPE_N;
    const c = centro(chefe);
    for (let k = 0; k < n; k++) {
      const dy = (k - (n - 1) / 2) * 60;
      ctx.adicionarInimigo(semRecompensa(invocar(ctx, chefe, 'cranio_c', c.x - chefe.width / 2 - 30, c.y + dy)));   // cuspidos nao pagam
    }
    ctx.efeito(c.x - chefe.width / 2, c.y, '🔥', '#f97316', 30);
  },
};
