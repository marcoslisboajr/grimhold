// Garuda, Ave da Tempestade (Ato VIII, onda 15): voa (ehVoador). Vendaval: a cada 10 s (depois de
// chegar) atordoa 1 s os 2 herois com mais vida (aviso 0,8 s antes). A 50% chama 2 aguas-vivas.
import type { Ally } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro, invocar } from './util';
import { aguaVivaAleatoria } from './mae_das_aguas';

export const VENDAVAL_CADA = 10000, VENDAVAL_AVISO = 800, VENDAVAL_ATORDOA = 1000, VENDAVAL_ALVOS = 2;

export function maisVida(ctx: CtxChefe, n: number): Ally[] {
  return ctx.aliados.filter(a => a.hp > 0).sort((p, q) => q.hp - p.hp).slice(0, n);
}

export const garuda: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    const c = centro(chefe);
    if (!x._garudaChamou && chefe.hp < chefe.maxHp * 0.5) {
      x._garudaChamou = true;
      for (const dy of [-80, 80]) ctx.adicionarInimigo(invocar(ctx, chefe, aguaVivaAleatoria(), c.x + 40, c.y + dy));
    }
    if (chefe.position.x >= ctx.chegadaX) return;   // vendaval so depois de chegar
    x._vendavalT = (x._vendavalT ?? 0) + dt;
    if (!x._vendavalAlvos && x._vendavalT >= VENDAVAL_CADA - VENDAVAL_AVISO) {
      const alvos = maisVida(ctx, VENDAVAL_ALVOS);
      if (alvos.length) {
        x._vendavalAlvos = alvos;
        for (const a of alvos) { const p = ctx.posAliado(a); ctx.efeito(p.x, p.y - 40, '⚠', '#e0f2fe', 48); }
      }
    }
    if (x._vendavalT < VENDAVAL_CADA) return;
    x._vendavalT -= VENDAVAL_CADA;
    const alvos: Ally[] = x._vendavalAlvos ?? []; x._vendavalAlvos = undefined;
    for (const a of alvos) {
      if (a.hp <= 0 || !ctx.aliados.includes(a)) continue;
      ctx.atordoarAliado(a, ctx.agora + VENDAVAL_ATORDOA);
      const p = ctx.posAliado(a); ctx.efeito(p.x, p.y - 45, '🌪', '#e0f2fe', 40);
    }
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '≋', '#e0f2fe', 40);
  },
};
