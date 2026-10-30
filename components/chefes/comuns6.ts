// Habilidades dos comuns do Ato VI (registradas por tipo como os chefes).
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { DEMONIOS } from './lista';
import { centro, dist2 } from './util';

// Cultista vermelho: canaliza — demonios num raio de 180 px causam dano x2.
export const CANAL_RAIO = 180;
const CANAL_MS = 300;   // o reforco dura enquanto um vermelho renova (a cada quadro)
export function tirarCanal(e: Enemy) { const x = e as any; if (x._canalBase !== undefined) { e.damage = x._canalBase; x._canalBase = undefined; x._canalAte = 0; } }
export const cultistaVermelho: ModuloChefe = {
  aCadaQuadro(ctx, eu) {
    if (eu.hp <= 0) return;
    const c = centro(eu);
    for (const e of ctx.inimigos) {
      if (!DEMONIOS.has(e.type as string) || e.hp <= 0) continue;
      const x = e as any;
      if (dist2(c, centro(e)) <= CANAL_RAIO * CANAL_RAIO) {
        if (x._canalBase === undefined) { x._canalBase = e.damage; e.damage = e.damage * 2; }
        x._canalAte = ctx.agora + CANAL_MS;
      }   // fora do raio: expira do lado do demonio (expirarCanal, despacharQuadro)
    }
  },
};

// Cultista branco: a cada 3 s cura 5% da vida maxima dos inimigos num raio de 150 px (nao a si).
export const BRANCO_CADA = 3000, BRANCO_CURA = 0.05, BRANCO_RAIO = 150;
// Chamado para todo inimigo a cada quadro: o reforco some sozinho se nenhum vermelho renovou
// (vale tambem quando o ultimo vermelho sai do campo sem morrer)
export function expirarCanal(e: Enemy, agora: number) { const x = e as any; if (x._canalBase !== undefined && (x._canalAte ?? 0) < agora) tirarCanal(e); }

export const cultistaBranco: ModuloChefe = {
  aCadaQuadro(ctx, eu, dt) {
    const x = eu as any;
    if (eu.hp <= 0) return;
    x._brancoT = (x._brancoT ?? 0) + dt;
    if (x._brancoT < BRANCO_CADA) return;
    x._brancoT -= BRANCO_CADA;
    const c = centro(eu);
    for (const e of ctx.inimigos) {
      if (e === eu || e.hp <= 0 || e.hp >= e.maxHp) continue;
      const ce = centro(e);
      if (dist2(c, ce) > BRANCO_RAIO * BRANCO_RAIO) continue;
      e.hp = Math.min(e.maxHp, e.hp + Math.ceil(e.maxHp * BRANCO_CURA));
      ctx.efeito(ce.x, ce.y - e.height / 2, '✚', '#4ade80', 25);
    }
  },
};

// Cultista verde: a 60 px de um heroi ou da muralha para, pisca 0,6 s e explode (raio 90 px,
// dano do proprio tipo x3 nos herois e na muralha) e morre.
export const VERDE_GATILHO = 60, VERDE_PAVIO = 600, VERDE_RAIO = 90, VERDE_MULT = 3;
const pertoDeHeroi = (ctx: CtxChefe, c: { x: number; y: number }, r: number) => ctx.aliados.filter(a => a.hp > 0 && dist2(c, ctx.posAliado(a)) <= r * r);
const distMuralha = (ctx: CtxChefe, e: Enemy) => e.position.x - (ctx.muralhaX + e.width / 2);
export const cultistaVerde: ModuloChefe = {
  aCadaQuadro(ctx, eu) {
    const x = eu as any;
    if (x._explodiu || eu.hp <= 0) return;
    if (x._pavioEm === undefined) {
      if (distMuralha(ctx, eu) > VERDE_GATILHO && !pertoDeHeroi(ctx, centro(eu), VERDE_GATILHO).length) return;
      x._pavioEm = ctx.agora; x._pavioX = eu.position.x; x._pavioY = eu.position.y;
    }
    eu.position.x = x._pavioX; eu.position.y = x._pavioY;   // parado enquanto o pavio queima
    x._piscando = Math.floor((ctx.agora - x._pavioEm) / 100) % 2 === 0;
    if (!x._avisou) { x._avisou = true; const c = centro(eu); ctx.efeito(c.x, c.y - eu.height / 2 - 6, '!', '#a3e635', 36); }
    if (ctx.agora - x._pavioEm < VERDE_PAVIO) return;
    x._explodiu = true; x._piscando = false;
    const c = centro(eu), dano = eu.damage * VERDE_MULT;
    for (const a of pertoDeHeroi(ctx, c, VERDE_RAIO)) ctx.ferirAliado(a, dano, '#a3e635');
    if (distMuralha(ctx, eu) <= VERDE_RAIO) ctx.ferirMuralha(dano);
    ctx.efeito(c.x, c.y, '💥', '#a3e635', 30);
    eu.hp = 0;
  },
};
