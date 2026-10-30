// Habilidades dos comuns do Ato VII (registradas por tipo como os chefes).
import type { ModuloChefe } from './tipos';
import { centro, dist2, invocar } from './util';

// Sapo-Xama: a cada 9 s para 1 s e ergue um totem (inimigo parado 'totem_xama') onde esta.
// O totem cura 4% da vida maxima dos inimigos num raio de 140 px a cada 2 s e dura 10 s.
export const XAMA_CADA = 9000, XAMA_PARADA = 1000;
export const TOTEM_CURA_CADA = 2000, TOTEM_CURA = 0.04, TOTEM_RAIO = 140, TOTEM_DURA = 10000;
export const TOTEM_VIDA = 0.3;   // fracao da vida do xama

export const sapoXama: ModuloChefe = {
  aCadaQuadro(ctx, eu, dt) {
    const x = eu as any;
    if (eu.hp <= 0) return;
    if (x._xamaParadoAte !== undefined) {
      if (ctx.agora < x._xamaParadoAte) { eu.position.x = x._xamaX; eu.position.y = x._xamaY; return; }
      x._xamaParadoAte = undefined;
    }
    x._xamaT = (x._xamaT ?? 0) + dt;
    if (x._xamaT < XAMA_CADA) return;
    x._xamaT -= XAMA_CADA;
    x._xamaParadoAte = ctx.agora + XAMA_PARADA; x._xamaX = eu.position.x; x._xamaY = eu.position.y;
    const c = centro(eu);
    const t = invocar(ctx, eu, 'totem_xama', c.x, c.y, { hp: TOTEM_VIDA, dano: 1, vel: 0, raio: 20 });
    t.height = 48; t.position.y = eu.position.y + eu.height - t.height;   // pe do totem no pe do xama
    t.damage = 0; (t as any).attackRange = undefined; (t as any).attackSpeed = undefined;   // nao ataca (nem a muralha)
    totemXama.aoNascer!(ctx, t);   // o jogo nao despacha nascer para invocados: a duracao conta daqui
    ctx.adicionarInimigo(t);
    ctx.efeito(c.x, c.y - eu.height / 2 - 8, '✦', '#4ade80', 36);
  },
};

export const totemXama: ModuloChefe = {
  aoNascer(ctx, eu) { const x = eu as any; x._totemAte = ctx.agora + TOTEM_DURA; x._totemX = eu.position.x; x._totemY = eu.position.y; },
  aCadaQuadro(ctx, eu, dt) {
    const x = eu as any;
    if (eu.hp <= 0) return;
    if (x._totemAte === undefined) totemXama.aoNascer!(ctx, eu);   // invocado: nasce no 1o quadro
    eu.position.x = x._totemX; eu.position.y = x._totemY;   // nao anda (nem empurrado)
    if (ctx.agora >= x._totemAte) {   // expirou: some sem pagar abate
      x._semRecompensa = true; eu.reward = 0; eu.hp = 0; return;
    }
    x._totemT = (x._totemT ?? 0) + dt;
    if (x._totemT < TOTEM_CURA_CADA) return;
    x._totemT -= TOTEM_CURA_CADA;
    const c = centro(eu);
    for (const e of ctx.inimigos) {
      if (e === eu || e.hp <= 0 || e.hp >= e.maxHp || (e.type as string) === 'totem_xama') continue;
      const ce = centro(e);
      if (dist2(c, ce) > TOTEM_RAIO * TOTEM_RAIO) continue;
      e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * TOTEM_CURA));
      ctx.efeito(ce.x, ce.y - e.height / 2, '✚', '#4ade80', 25);
    }
  },
};
