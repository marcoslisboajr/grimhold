// A Quimera (Ato IX, onda 30): voa (ehVoador) e ignora obstaculos de chao dos herois (Muralha Glacial,
// pocas de gelo: lista.ignoraChao). Sopro: a cada 10 s (depois de chegar) avisa 1 s antes uma fileira
// da grade (a com mais herois) e cospe chamas nela: dano (dano do tipo x1,2). Herois nao tem
// queimadura (DoT) no jogo, entao e so o dano. A 66% e a 33% chama 2 estatuas-lamina, uma vez cada.
import type { Ally } from '../../types';
import type { ModuloChefe } from './tipos';
import { centro, invocar } from './util';
import { fileiraMaisCheia } from './kraken';

export const SOPRO_CADA = 10000, SOPRO_AVISO = 1000, SOPRO_MULT = 1.2;
export const QUIMERA_LIMIARES = [0.66, 0.33];
const celula = (col: number, row: number) => ({ gridPosition: { col, row } } as Ally);

export const quimera: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    const c = centro(chefe);
    x._quimeraChamou ??= [];
    QUIMERA_LIMIARES.forEach((l, i) => {
      if (x._quimeraChamou[i] || chefe.hp >= chefe.maxHp * l) return;
      x._quimeraChamou[i] = true;
      for (const dy of [-90, 90]) ctx.adicionarInimigo(invocar(ctx, chefe, 'estatua_lamina', c.x + 40, c.y + dy));
      ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#f97316', 40);
    });
    if (chefe.position.x >= ctx.chegadaX) return;
    x._soproT = (x._soproT ?? 0) + dt;
    if (x._soproFileira === undefined && x._soproT >= SOPRO_CADA - SOPRO_AVISO) {
      const r = fileiraMaisCheia(ctx);
      if (r !== undefined) {
        x._soproFileira = r;
        for (let col = 0; col < ctx.grade.cols; col++) { const p = ctx.posAliado(celula(col, r)); ctx.efeito(p.x, p.y - 30, '⚠', '#f97316', 60); }
      }
    }
    if (x._soproT < SOPRO_CADA) return;
    x._soproT -= SOPRO_CADA;
    const r: number | undefined = x._soproFileira; x._soproFileira = undefined;
    if (r === undefined) return;
    for (const a of ctx.aliados) {
      if (a.hp <= 0 || a.gridPosition.row !== r) continue;
      ctx.ferirAliado(a, chefe.damage * SOPRO_MULT, '#f97316');
    }
    for (let col = 0; col < ctx.grade.cols; col++) { const p = ctx.posAliado(celula(col, r)); ctx.efeito(p.x, p.y - 20, '🔥', '#ea580c', 35); }
  },
};
