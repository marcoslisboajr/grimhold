// Chefe dos Saqueadores (Ato V refeito, onda 15): abaixo de 50% da vida chama 4 saqueadores, um de
// cada arma, uma vez. Por limiar = pagam normal. Nao fala.
import type { ModuloChefe } from './tipos';
import { centro, invocar } from './util';

export const SAQUEADORES = ['saqueador', 'saqueador_lanca', 'saqueador_martelo', 'saqueador_espada'];
export const chefeSaqueador: ModuloChefe = {
  aCadaQuadro(ctx, chefe) {
    const x = chefe as any;
    if (chefe.hp <= 0 || x._saqueChamou || chefe.hp >= chefe.maxHp * 0.5) return;
    x._saqueChamou = true;
    const c = centro(chefe);
    SAQUEADORES.forEach((t, k) => ctx.adicionarInimigo(invocar(ctx, chefe, t, c.x + 50, c.y + (k - 1.5) * 64)));
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '⚒', '#f59e0b', 40);
  },
};
