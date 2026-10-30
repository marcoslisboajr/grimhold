// O Reitor (Ato V refeito, onda 30): a cada 9 s (depois de chegar) invoca 2 runas hostis (por timer:
// sem recompensa). Falas contra.mage e contra.runesmith (Krash e Veltharion) pelo falarChefe. As runas
// do Veltharion recusam ordens dele: runa hostil nao fere o Veltharion (comuns5r.ts).
import { invocacaoPorTimer } from './invocacao_timer';

export const REITOR_CADA = 9000, REITOR_N = 2;
export const reitor = invocacaoPorTimer(['runa_hostil', 'runa_hostil_b'], REITOR_N, REITOR_CADA, 'ᚱ', '#c084fc');
