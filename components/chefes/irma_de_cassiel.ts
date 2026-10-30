// Irma de Cassiel (Ato VI, onda 20): voa. A cada 4 s cura 8% da vida maxima dos anjos (tipos anjo*)
// num raio de 220 px. Com Cassiel (aliado 'cassiel') em campo: a fala de chegada vira contra.cassiel
// (falarChefe no GameCanvas) e ela nao ataca por 3 s depois de chegar.
import type { ModuloChefe } from './tipos';
import { centro, dist2 } from './util';

export const IRMA_CURA_CADA = 4000;
export const IRMA_CURA = 0.08;
export const IRMA_RAIO = 220;
export const IRMA_TREGUA = 3000;

export const irmaDeCassiel: ModuloChefe = {
  aoNascer(ctx, chefe) {
    (chefe as any)._contraCassiel = ctx.aliados.some(a => (a.type as string) === 'cassiel');
  },
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    if (x._contraCassiel && !x._treguaFeita && chefe.position.x < ctx.chegadaX) {
      x._treguaFeita = true; x._semAtacarAte = ctx.agora + IRMA_TREGUA;
    }
    x._irmaT = (x._irmaT ?? 0) + dt;
    if (x._irmaT < IRMA_CURA_CADA) return;
    x._irmaT -= IRMA_CURA_CADA;
    const c = centro(chefe);
    for (const e of ctx.inimigos) {
      if (e === chefe || e.hp <= 0 || e.hp >= e.maxHp || !(e.type as string).startsWith('anjo')) continue;
      const ce = centro(e);
      if (dist2(c, ce) > IRMA_RAIO * IRMA_RAIO) continue;
      e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * IRMA_CURA));
      ctx.efeito(ce.x, ce.y - e.height / 2, '✚', '#fda4af', 30);
    }
  },
};
