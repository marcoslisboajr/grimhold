// Tentaculo (Ato X, comum): nao anda. Nasce espalhado pelo campo (x entre 35% e 60% do campo, da
// muralha a borda direita: ao alcance dos herois comuns; y de onde nasceu) e fica ali; ataca a
// distancia curta (alcance 260 na ficha). Rede de seguranca: se so restam tentaculos vivos em campo
// por TENTACULO_MURCHA ms (relogio virtual), eles murcham e morrem (recompensa normal) — a onda acaba.
import type { ModuloChefe } from './tipos';

export const TENTACULO_X_MIN = 0.35, TENTACULO_X_MAX = 0.6, TENTACULO_MURCHA = 15000;
export const TENTACULOS = ['tentaculo', 'tentaculo_b'];
const ehTentaculo = (t: string) => t.startsWith('tentaculo');
export const tentaculo: ModuloChefe = {
  aoNascer(ctx, eu) {
    const largura = ctx.chegadaX + 160 - ctx.muralhaX;   // chegadaX = borda direita - 160 (GameCanvas)
    const fx = TENTACULO_X_MIN + Math.random() * (TENTACULO_X_MAX - TENTACULO_X_MIN);
    eu.position.x = ctx.muralhaX + largura * fx - eu.width / 2;
    (eu as any)._fixo = { x: eu.position.x, y: eu.position.y };
  },
  aCadaQuadro(ctx, eu) {
    const x = eu as any;
    if (!x._fixo) x._fixo = { x: eu.position.x, y: eu.position.y };
    eu.position.x = x._fixo.x; eu.position.y = x._fixo.y;
    if (eu.hp <= 0) return;
    const soTentaculos = ctx.inimigos.every(e => e.hp <= 0 || ehTentaculo(e.type as string));
    if (!soTentaculos) { x._sozinhoDesde = undefined; return; }
    x._sozinhoDesde ??= ctx.agora;
    if (ctx.agora - x._sozinhoDesde >= TENTACULO_MURCHA) {
      eu.hp = 0;   // murcha: o jogo conta a morte normal (paga)
      ctx.efeito(eu.position.x + eu.width / 2, eu.position.y, '✖', '#a78bfa', 30);
    }
  },
};
