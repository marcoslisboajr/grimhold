// Kwa'Zul, o Xama-Sapo (Ato VII, onda 10): Lingua. A cada 8 s puxa o heroi mais distante da muralha
// (menor coluna) para a coluna da frente (Vanguarda, grade.cols - 1), na mesma linha ou na livre
// mais proxima; sem celula livre so atordoa. O puxado fica atordoado 1,5 s. Aviso 0,8 s antes
// (linha de pontos do Kwa'Zul ate o heroi).
import type { Ally } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro } from './util';

export const LINGUA_CADA = 8000;
export const LINGUA_AVISO = 800;
export const LINGUA_ATORDOA = 1500;
const PONTOS = 8;

export function celulaNaFrente(ctx: CtxChefe, a: Ally): { col: number; row: number } | undefined {
  const col = ctx.grade.cols - 1;
  const ocupada = (row: number) => ctx.aliados.some(o => o !== a && o.gridPosition.col === col && o.gridPosition.row === row);
  const linhas = Array.from({ length: ctx.grade.rows }, (_, r) => r)
    .sort((p, q) => Math.abs(p - a.gridPosition.row) - Math.abs(q - a.gridPosition.row) || p - q);
  const row = linhas.find(r => !ocupada(r));
  return row === undefined ? undefined : { col, row };
}
function maisLonge(ctx: CtxChefe): Ally | undefined {
  let alvo: Ally | undefined;
  for (const a of ctx.aliados) if (a.hp > 0 && (!alvo || a.gridPosition.col < alvo.gridPosition.col)) alvo = a;
  return alvo;
}

export const kwazul: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
    x._linguaT = (x._linguaT ?? 0) + dt;
    if (!x._linguaAlvo && x._linguaT >= LINGUA_CADA - LINGUA_AVISO) {
      const alvo = maisLonge(ctx);
      if (alvo) {
        x._linguaAlvo = alvo;
        const c = centro(chefe), p = ctx.posAliado(alvo);
        for (let k = 1; k <= PONTOS; k++) {
          const f = k / (PONTOS + 1);
          ctx.efeito(c.x + (p.x - c.x) * f, c.y + (p.y - c.y) * f, '•', '#f472b6', 48);
        }
        ctx.efeito(p.x, p.y - 40, '⚠', '#f472b6', 48);
      }
    }
    if (x._linguaT < LINGUA_CADA) return;
    x._linguaT -= LINGUA_CADA;
    const alvo: Ally | undefined = x._linguaAlvo; x._linguaAlvo = undefined;
    if (!alvo || alvo.hp <= 0 || !ctx.aliados.includes(alvo)) return;
    if (alvo.gridPosition.col !== ctx.grade.cols - 1) {
      const dest = celulaNaFrente(ctx, alvo);
      if (dest) ctx.moverAliado(alvo, dest.col, dest.row);
    }
    ctx.atordoarAliado(alvo, ctx.agora + LINGUA_ATORDOA);
    const p = ctx.posAliado(alvo);
    ctx.efeito(p.x, p.y - 45, '✖', '#f472b6', 45);
  },
};
