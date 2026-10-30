// Capitao Afogado (Ato VIII, onda 5): Ancora. A cada 9 s (depois de chegar) atira a ancora no heroi
// mais proximo: dano (dano do tipo x2) e atordoa 1,2 s. Aviso 0,8 s antes (linha ate o alvo).
import type { Ally } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro, dist2 } from './util';

export const ANCORA_CADA = 9000, ANCORA_AVISO = 800, ANCORA_ATORDOA = 1200, ANCORA_MULT = 2;
const PONTOS = 7;

export function maisPerto(ctx: CtxChefe, c: { x: number; y: number }): Ally | undefined {
  let alvo: Ally | undefined, melhor = Infinity;
  for (const a of ctx.aliados) {
    if (a.hp <= 0) continue;
    const d = dist2(c, ctx.posAliado(a));
    if (d < melhor) { melhor = d; alvo = a; }
  }
  return alvo;
}
// linha de pontos do chefe ate o heroi + alerta sobre ele
export function avisarLinha(ctx: CtxChefe, de: { x: number; y: number }, a: Ally, cor: string, vida: number) {
  const p = ctx.posAliado(a);
  for (let k = 1; k <= PONTOS; k++) {
    const f = k / (PONTOS + 1);
    ctx.efeito(de.x + (p.x - de.x) * f, de.y + (p.y - de.y) * f, '•', cor, vida);
  }
  ctx.efeito(p.x, p.y - 40, '⚠', cor, vida);
}

export const capitaoAfogado: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
    x._ancoraT = (x._ancoraT ?? 0) + dt;
    if (!x._ancoraAlvo && x._ancoraT >= ANCORA_CADA - ANCORA_AVISO) {
      const alvo = maisPerto(ctx, centro(chefe));
      if (alvo) { x._ancoraAlvo = alvo; avisarLinha(ctx, centro(chefe), alvo, '#94a3b8', 48); }
    }
    if (x._ancoraT < ANCORA_CADA) return;
    x._ancoraT -= ANCORA_CADA;
    const alvo: Ally | undefined = x._ancoraAlvo; x._ancoraAlvo = undefined;
    if (!alvo || alvo.hp <= 0 || !ctx.aliados.includes(alvo)) return;
    ctx.ferirAliado(alvo, chefe.damage * ANCORA_MULT, '#94a3b8');
    ctx.atordoarAliado(alvo, ctx.agora + ANCORA_ATORDOA);
    const p = ctx.posAliado(alvo);
    ctx.efeito(p.x, p.y - 50, '⚓', '#cbd5e1', 45);
  },
};
