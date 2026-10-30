// Mae das Aguas (Ato VIII, onda 10): voa (ehVoador). A 66% e a 33% se divide: chama 3 aguas-vivas
// (variantes aleatorias) em volta, uma vez cada. Nao fala.
import type { ModuloChefe } from './tipos';
import { centro, invocar } from './util';

export const MAE_LIMIARES = [0.66, 0.33];
export const AGUAS_VIVAS = ['agua_viva', 'agua_viva_b', 'agua_viva_c', 'agua_viva_d'];
export const aguaVivaAleatoria = () => AGUAS_VIVAS[Math.floor(Math.random() * AGUAS_VIVAS.length)];

export const maeDasAguas: ModuloChefe = {
  aCadaQuadro(ctx, chefe) {
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    x._maeChamou ??= [];
    const c = centro(chefe);
    MAE_LIMIARES.forEach((l, i) => {
      if (x._maeChamou[i] || chefe.hp >= chefe.maxHp * l) return;
      x._maeChamou[i] = true;
      for (let k = 0; k < 3; k++) {
        const ang = (k / 3) * Math.PI * 2 + Math.PI / 2;
        ctx.adicionarInimigo(invocar(ctx, chefe, aguaVivaAleatoria(), c.x + Math.cos(ang) * 80, c.y + Math.sin(ang) * 80));
      }
      ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#67e8f9', 40);
    });
  },
};
