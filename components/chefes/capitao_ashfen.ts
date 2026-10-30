// Capitao de Ashfen (Ato V refeito, onda 20): Grito a cada 15 s (depois de chegar): os herois ficam
// com -20% de velocidade de ataque por 5 s (o efeito expira no heroi: _gritoAte). O Gorak ('berserker')
// e imune e, ao contrario, ganha +50% de velocidade de ataque por 5 s (_furiaGorakAte). O GameCanvas
// so multiplica o intervalo de ataque do heroi por intervaloAtaqueAliado. Falas contra.berserker e
// contra.paladin (Gorak e Hellel) pelo falarChefe.
import type { Ally } from '../../types';
import type { ModuloChefe } from './tipos';
import { centro } from './util';

export const GRITO_CADA = 15000, GRITO_DURA = 5000, GRITO_VEL = 0.8, FURIA_VEL = 1.5;
export const GORAK = 'berserker';

// Multiplicador do intervalo entre ataques do heroi (1 = normal). -20% de velocidade = intervalo / 0,8;
// +50% = intervalo / 1,5. Efeito vencido sai do heroi aqui.
export function intervaloAtaqueAliado(a: Ally, agora: number): number {
  const x = a as any;
  let m = 1;
  if (x._gritoAte !== undefined) { if (x._gritoAte > agora) m /= GRITO_VEL; else delete x._gritoAte; }
  if (x._furiaGorakAte !== undefined) { if (x._furiaGorakAte > agora) m /= FURIA_VEL; else delete x._furiaGorakAte; }
  return m;
}

export const capitaoAshfen: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
    x._gritoT = (x._gritoT ?? 0) + dt;
    if (x._gritoT < GRITO_CADA) return;
    x._gritoT -= GRITO_CADA;
    for (const a of ctx.aliados) {
      if (a.hp <= 0) continue;
      const p = ctx.posAliado(a);
      if ((a.type as string) === GORAK) { (a as any)._furiaGorakAte = ctx.agora + GRITO_DURA; ctx.efeito(p.x, p.y - 30, '⚡', '#f97316', 40); }
      else { (a as any)._gritoAte = ctx.agora + GRITO_DURA; ctx.efeito(p.x, p.y - 30, '↓', '#94a3b8', 40); }
    }
    const c = centro(chefe);
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '📯', '#e5e7eb', 45);
  },
};
