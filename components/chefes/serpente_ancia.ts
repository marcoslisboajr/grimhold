// Serpente Ancia (Ato VIII, onda 25): Mergulho. A cada 12 s (depois de chegar) some 1,5 s — nao
// pode ser alvo nem toma dano (_semAlvo, index.ts podeSerAlvo) — e ressurge 120 px mais perto da
// muralha, nunca alem do ponto onde atacaria a muralha (muralhaX + largura/2). Submersa nao ataca.
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro, reduzirDano, instalarReducao } from './util';

export const MERGULHO_CADA = 12000, MERGULHO_DURA = 1500, MERGULHO_AVANCO = 120;
export const submerso = (e: Enemy) => !!(e as any)._semAlvo;
export const limiteMuralha = (ctx: CtxChefe, e: Enemy) => ctx.muralhaX + e.width / 2;

export const serpenteAncia: ModuloChefe = {
  ...reduzirDano(e => submerso(e) ? 0 : 1),
  aCadaQuadro(ctx, chefe, dt) {
    instalarReducao(chefe, e => submerso(e) ? 0 : 1);
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    if (x._semAlvo) {
      chefe.position.x = x._mergX; chefe.position.y = x._mergY;   // parado embaixo d'agua
      if (ctx.agora < x._mergAte) return;
      x._semAlvo = false;
      chefe.position.x = Math.max(limiteMuralha(ctx, chefe), x._mergX - MERGULHO_AVANCO);
      const c = centro(chefe); ctx.efeito(c.x, c.y - chefe.height / 2, '≈', '#22d3ee', 35);
      return;
    }
    if (chefe.position.x >= ctx.chegadaX) return;
    x._mergT = (x._mergT ?? 0) + dt;
    if (x._mergT < MERGULHO_CADA) return;
    x._mergT -= MERGULHO_CADA;
    x._semAlvo = true; x._mergAte = ctx.agora + MERGULHO_DURA;
    x._semAtacarAte = x._mergAte;   // submersa nao ataca (gancho _semAtacarAte do GameCanvas)
    x._mergX = chefe.position.x; x._mergY = chefe.position.y;
    const c = centro(chefe); ctx.efeito(c.x, c.y, '≈', '#0e7490', 35);
  },
};
