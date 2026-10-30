// Serafim Caido (Ato VI, onda 30): voa. A 66% e a 33% chama 3 anjos da Hoste (uma vez cada);
// a cada 8 s, Julgamento: o heroi com mais vida perde 15% da vida maxima (aviso 1 s antes).
import type { Ally } from '../../types';
import type { ModuloChefe } from './tipos';
import { centro, invocar } from './util';

export const SERAFIM_LIMIARES = [0.66, 0.33];
export const JULGAMENTO_CADA = 8000;
export const JULGAMENTO_AVISO = 1000;
export const JULGAMENTO_DANO = 0.15;
const HOSTE = ['anjo', 'anjo_rubro', 'anjo_sombrio'];

export const serafimCaido: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    x._serafimChamou ??= [];
    const c = centro(chefe);
    SERAFIM_LIMIARES.forEach((l, i) => {
      if (x._serafimChamou[i] || chefe.hp >= chefe.maxHp * l) return;
      x._serafimChamou[i] = true;
      HOSTE.forEach((t, k) => ctx.adicionarInimigo(invocar(ctx, chefe, t, c.x + 50, c.y + (k - 1) * 90)));
      ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#fde68a', 40);
    });
    if (chefe.position.x >= ctx.chegadaX) return;   // Julgamento so depois de chegar
    x._julgT = (x._julgT ?? 0) + dt;
    if (!x._julgAlvo && x._julgT >= JULGAMENTO_CADA - JULGAMENTO_AVISO && ctx.aliados.length) {
      let alvo: Ally | undefined;
      for (const a of ctx.aliados) if (a.hp > 0 && (!alvo || a.hp > alvo.hp)) alvo = a;
      if (alvo) {
        x._julgAlvo = alvo;
        const p = ctx.posAliado(alvo);
        ctx.efeito(p.x, p.y - 40, '⚠', '#fde047', 60);
      }
    }
    if (x._julgT < JULGAMENTO_CADA) return;
    x._julgT -= JULGAMENTO_CADA;
    const alvo: Ally | undefined = x._julgAlvo; x._julgAlvo = undefined;
    if (alvo && alvo.hp > 0 && ctx.aliados.includes(alvo)) {
      ctx.ferirAliado(alvo, Math.ceil(alvo.maxHp * JULGAMENTO_DANO), '#fde047');
      const p = ctx.posAliado(alvo);
      ctx.efeito(p.x, p.y - 55, '⚖', '#fde047', 45);
    }
  },
};
