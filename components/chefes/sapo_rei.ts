// Sapo-Rei (Ato VII, onda 5): a cada 10 s chama 2 sapos comuns ao lado (so depois de entrar no campo).
import type { ModuloChefe } from './tipos';
import { centro, invocar, semRecompensa } from './util';

export const SAPO_REI_CADA = 10000;

export const sapoRei: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
    x._reiT = (x._reiT ?? 0) + dt;
    if (x._reiT < SAPO_REI_CADA) return;
    x._reiT -= SAPO_REI_CADA;
    const c = centro(chefe);
    for (const dy of [-70, 70]) ctx.adicionarInimigo(semRecompensa(invocar(ctx, chefe, 'sapo', c.x + 20, c.y + dy)));
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#4ade80', 40);
  },
};
