// Anjo Caido (Ato VI, onda 15): voa (lista.ts ehVoador). A 50% de vida chama 2 anjos comuns.
import type { ModuloChefe } from './tipos';
import { centro, invocar } from './util';

export const anjoCaido: ModuloChefe = {
  aCadaQuadro(ctx, chefe) {
    const x = chefe as any;
    if (x._chamouAnjos || chefe.hp <= 0 || chefe.hp >= chefe.maxHp * 0.5) return;
    x._chamouAnjos = true;
    const c = centro(chefe);
    for (const dy of [-80, 80]) ctx.adicionarInimigo(invocar(ctx, chefe, 'anjo', c.x + 40, c.y + dy));
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#c4b5fd', 40);
  },
};
