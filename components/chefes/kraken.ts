// O Kraken (Ato VIII, onda 30): boia no mar — nao anda alem de 60% do campo (da borda direita ate a
// muralha). Tentaculos: a cada 8 s acerta os herois de uma fileira (linha da grade; a com mais
// herois) avisada 1 s antes: dano (dano do tipo x1,5). Submerge a 50%, uma vez: 3 s sem poder ser
// alvo, sem tomar dano e sem atacar (_semAlvo) e volta curado em 5% da vida maxima. A 66% e a 33% chama 2
// serpentes do mar. Nao fala.
import type { Enemy, Ally } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro, invocar, reduzirDano, instalarReducao } from './util';
import { CANVAS_WIDTH } from '../systems/combat';

export const KRAKEN_CAMPO = 0.6;
export const TENTACULO_CADA = 8000, TENTACULO_AVISO = 1000, TENTACULO_MULT = 1.5;
export const SUBMERGE_EM = 0.5, SUBMERGE_DURA = 3000, SUBMERGE_CURA = 0.05;
export const KRAKEN_LIMIARES = [0.66, 0.33];

export const limiteKraken = (ctx: CtxChefe) => CANVAS_WIDTH - (CANVAS_WIDTH - ctx.muralhaX) * KRAKEN_CAMPO;
export function fileiraMaisCheia(ctx: CtxChefe): number | undefined {
  const n = new Array(ctx.grade.rows).fill(0);
  for (const a of ctx.aliados) if (a.hp > 0) n[a.gridPosition.row]++;
  let melhor: number | undefined;
  n.forEach((q, r) => { if (q > 0 && (melhor === undefined || q > n[melhor])) melhor = r; });
  return melhor;
}
const submersoK = (e: Enemy) => (e as any)._semAlvo ? 0 : 1;
const celula = (col: number, row: number) => ({ gridPosition: { col, row } } as Ally);

export const kraken: ModuloChefe = {
  ...reduzirDano(submersoK),
  aCadaQuadro(ctx, chefe, dt) {
    instalarReducao(chefe, submersoK);
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    const lim = limiteKraken(ctx);
    if (chefe.position.x < lim) chefe.position.x = lim;   // fica no mar
    const c = centro(chefe);
    // chamadas 66% / 33%
    x._krakenChamou ??= [];
    KRAKEN_LIMIARES.forEach((l, i) => {
      if (x._krakenChamou[i] || chefe.hp >= chefe.maxHp * l) return;
      x._krakenChamou[i] = true;
      for (const dy of [-90, 90]) ctx.adicionarInimigo(invocar(ctx, chefe, 'serpente_mar', c.x - 40, c.y + dy));
      ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#22d3ee', 40);
    });
    // submerge a 50%, uma vez
    if (x._semAlvo && ctx.agora >= x._submergeAte) {
      x._semAlvo = false;
      chefe.hp = Math.min(chefe.maxHp, chefe.hp + chefe.maxHp * SUBMERGE_CURA);
      ctx.efeito(c.x, c.y - chefe.height / 2, '✚', '#4ade80', 40);
    }
    if (!x._submergiu && chefe.hp < chefe.maxHp * SUBMERGE_EM) {
      x._submergiu = true; x._semAlvo = true; x._submergeAte = ctx.agora + SUBMERGE_DURA;
      x._semAtacarAte = x._submergeAte;   // submerso nao ataca (gancho _semAtacarAte do GameCanvas)
      ctx.efeito(c.x, c.y, '≈', '#0e7490', 50);
    }
    // tentaculos (depois de chegar)
    if (chefe.position.x >= ctx.chegadaX || x._semAlvo) return;   // submerso: tentaculos pausados
    x._tentT = (x._tentT ?? 0) + dt;
    if (x._tentFileira === undefined && x._tentT >= TENTACULO_CADA - TENTACULO_AVISO) {
      const r = fileiraMaisCheia(ctx);
      if (r !== undefined) {
        x._tentFileira = r;
        for (let col = 0; col < ctx.grade.cols; col++) { const p = ctx.posAliado(celula(col, r)); ctx.efeito(p.x, p.y - 30, '⚠', '#22d3ee', 60); }
      }
    }
    if (x._tentT < TENTACULO_CADA) return;
    x._tentT -= TENTACULO_CADA;
    const r: number | undefined = x._tentFileira; x._tentFileira = undefined;
    if (r === undefined) return;
    for (const a of ctx.aliados) {
      if (a.hp <= 0 || a.gridPosition.row !== r) continue;
      ctx.ferirAliado(a, chefe.damage * TENTACULO_MULT, '#22d3ee');
    }
    for (let col = 0; col < ctx.grade.cols; col++) { const p = ctx.posAliado(celula(col, r)); ctx.efeito(p.x, p.y - 20, '〰', '#0891b2', 35); }
  },
};
