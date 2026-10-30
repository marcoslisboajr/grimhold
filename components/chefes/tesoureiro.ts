// O Tesoureiro (Ato V refeito, onda 10; docs/LORE.md §9). Sem arma (ataque fraco, na ficha).
// - A cada acerto na muralha rouba ouro (TESOUREIRO_ROUBO, ate o que houver); no primeiro acerto
//   (chegou vivo a muralha) leva tambem 20% do ouro da run, uma vez. Guarda o total em _roubado.
// - A cada 8 s (depois de chegar) "contrata" um inimigo em campo: +30% de vida maxima e atual, uma vez
//   por inimigo (efeito dourado).
// - Ao sair de campo devolve todo o ouro roubado (inclusive os 20%): morto por qualquer caminho
//   (despacharMorte) ou tirado sem morrer (varrerSaidas -> aoSair). Uma vez so. Nada paga a mais.
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro } from './util';

export const TESOUREIRO_ROUBO = 10, TESOUREIRO_CHEGADA = 0.20;
export const CONTRATO_CADA = 8000, CONTRATO_MULT = 1.3;

export function contratar(e: Enemy): boolean {
  const x = e as any;
  if (x._contratado) return false;
  x._contratado = true;
  e.maxHp = Math.round(e.maxHp * CONTRATO_MULT);
  e.hp = e.hp * CONTRATO_MULT;
  return true;
}

export const tesoureiro: ModuloChefe = {
  aoNascer(_ctx, chefe) { (chefe as any)._roubado = 0; },
  aoAcertarMuralha(ctx, chefe) {
    if (!ctx.ouro || !ctx.mudarOuro) return;
    const x = chefe as any;
    let leva = Math.min(TESOUREIRO_ROUBO, ctx.ouro());
    if (!x._levou20) { x._levou20 = true; leva += Math.floor((ctx.ouro() - leva) * TESOUREIRO_CHEGADA); }
    if (leva <= 0) return;
    ctx.mudarOuro(-leva);
    x._roubado = (x._roubado ?? 0) + leva;
    const c = centro(chefe);
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, `-${leva}g`, '#facc15', 35);
  },
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
    x._contratoT = (x._contratoT ?? 0) + dt;
    if (x._contratoT < CONTRATO_CADA) return;
    x._contratoT -= CONTRATO_CADA;
    const livres = ctx.inimigos.filter(e => e !== chefe && e.hp > 0 && !(e as any)._contratado);
    if (!livres.length) return;
    const e = livres[Math.floor(Math.random() * livres.length)];
    contratar(e);
    const c = centro(e);
    ctx.efeito(c.x, c.y - e.height / 2 - 8, '$', '#facc15', 40);
  },
  aoMorrer(ctx, chefe) { devolver(ctx, chefe); },
  aoSair(ctx, chefe) { devolver(ctx, chefe); },
};

function devolver(ctx: CtxChefe, chefe: Enemy) {
  const x = chefe as any;
  const volta = x._roubado ?? 0;
  x._roubado = 0;
  if (volta > 0 && ctx.mudarOuro) {
    ctx.mudarOuro(volta);
    const c = centro(chefe);
    ctx.efeito(c.x, c.y, `+${volta}g`, '#facc15', 45);
  }
}
