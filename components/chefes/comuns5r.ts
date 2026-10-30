// Habilidades dos comuns do Ato V refeito (registradas por tipo como os chefes).
import type { ModuloChefe } from './tipos';

// Runa hostil (voa: ehVoador). As runas do Veltharion ('runesmith') recusam ordens do Reitor: runa
// hostil mira outro heroi se puder e, se o tiro sair nele assim mesmo, nao fere.
export const VELTHARION = 'runesmith';
export const RUNAS_HOSTIS = ['runa_hostil', 'runa_hostil_b'];
export const runaHostil: ModuloChefe = {
  escolherAlvo(_ctx, _eu, candidatos) {
    return candidatos.find(a => (a.type as string) !== VELTHARION);
  },
  danoEmAliado(_ctx, _eu, alvo, dano) {
    return (alvo.type as string) === VELTHARION ? 0 : dano;
  },
};
