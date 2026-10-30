// Cerbero Alfa (Ato IX, onda 25): tres cabecas. Cada ataque acerta o alvo e mais ate 2 herois a ate
// 90 px dele (os mais proximos), com dano x0,6 nos extras. A 50% chama 2 cerberos, uma vez. Nao fala.
import type { Ally } from '../../types';
import type { ModuloChefe } from './tipos';
import { centro, dist2, invocar } from './util';

export const CABECAS_EXTRAS = 2, CABECAS_RAIO = 90, CABECAS_MULT = 0.6;

export const cerberoAlfa: ModuloChefe = {
  danoEmAliado(ctx, _eu, alvo, dano) {
    const p = ctx.posAliado(alvo);
    const extras = ctx.aliados
      .filter(a => a !== alvo && a.hp > 0 && dist2(p, ctx.posAliado(a)) <= CABECAS_RAIO * CABECAS_RAIO)
      .sort((a, b) => dist2(p, ctx.posAliado(a)) - dist2(p, ctx.posAliado(b)))
      .slice(0, CABECAS_EXTRAS) as Ally[];
    for (const a of extras) ctx.ferirAliado(a, dano * CABECAS_MULT, '#f97316');
    return dano;
  },
  aCadaQuadro(ctx, chefe) {
    const x = chefe as any;
    if (chefe.hp <= 0 || x._cerberoChamou || chefe.hp >= chefe.maxHp * 0.5) return;
    x._cerberoChamou = true;
    const c = centro(chefe);
    for (const dy of [-90, 90]) ctx.adicionarInimigo(invocar(ctx, chefe, 'cerbero', c.x + 40, c.y + dy));
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#f97316', 40);
  },
};
