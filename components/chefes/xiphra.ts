// Xiphra, a Louva-a-Deus (Ato VII, onda 20): ataca primeiro o heroi com menor % de vida no alcance
// e acerta critico garantido (dano x2) em heroi abaixo de 25% da vida (no disparo).
import type { Ally } from '../../types';
import type { ModuloChefe } from './tipos';

export const XIPHRA_LIMIAR = 0.25, XIPHRA_CRIT = 2;
const pct = (a: Ally) => a.hp / Math.max(1, a.maxHp);

export const xiphra: ModuloChefe = {
  escolherAlvo(_ctx, _chefe, candidatos) {
    let alvo: Ally | undefined;
    for (const a of candidatos) if (a.hp > 0 && (!alvo || pct(a) < pct(alvo))) alvo = a;
    return alvo;
  },
  danoEmAliado(_ctx, _chefe, alvo, dano) {
    return pct(alvo) < XIPHRA_LIMIAR ? dano * XIPHRA_CRIT : dano;
  },
};
