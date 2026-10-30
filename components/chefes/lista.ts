// Quem e chefe (um lugar testavel). CHEFES_LEGADO e a lista que ja vivia no GameCanvas
// (Atos I-V e modos fora de ato: nao mude). CHEFES_ATO6 sao os tipos novos da Etapa 1b.
export const CHEFES_LEGADO = ['boss', 'goblin_king', 'orc_warlord', 'grim_reaper', 'velshade', 'dwarf_geomancer', 'elf_champion', 'minotaur_king', 'medusa', 'dragon_lord', 'half_brother_ogre', 'half_brother_cyclops', 'vampire_lord', 'demon', 'malachar', 'infernatil', 'ghazbaran', 'zathroth'] as const;
export const CHEFES_ATO6 = ['cultista_mor', 'coro', 'anjo_caido', 'irma_de_cassiel', 'fenix_ancia', 'serafim_caido'] as const;
// Chefes dos atos novos (VI em diante): ato novo so acrescenta aqui. O GameCanvas espalha esta
// lista nas listas antigas por lugar (que diferem entre si nos tipos legados) — nao mude o legado.
export const CHEFES_ATO7 = ['sapo_rei', 'kwazul', 'alfa_matilha', 'xiphra', 'chefe_tribal', 'ossoth'] as const;
export const CHEFES_ATO8 = ['capitao_afogado', 'mae_das_aguas', 'garuda', 'rei_caranguejo', 'serpente_ancia', 'kraken'] as const;
export const CHEFES_ATO9 = ['general_ossos', 'cranio_ancestral', 'drider', 'estatua_leste', 'estatua_oeste', 'cerbero_alfa', 'quimera'] as const;
// Ato V refeito (Etapa 3a): so entram em campo com ATO5_REFEITO (components/data/atos.ts). Os chefes
// do Ato X sao os legados do V antigo (ja em CHEFES_LEGADO).
export const CHEFES_ATO5R = ['sargento_ashfen', 'tesoureiro', 'chefe_saqueador', 'capitao_ashfen', 'lich_colegiado', 'reitor'] as const;
// Luta final do Ato X (Etapa 3b, components/chefes/fome.ts): os Pontos Fracos e o Coracao da Fome
// + o Devorador Anciao (fase 3; sprite do mind_flayer em 1,5x: SPRITE_ATO10)
export const CHEFES_ATO10 = ['fome_ponto', 'fome_coracao', 'mind_flayer_anciao'] as const;
// Heroi Corrompido (Etapa 3b, components/chefes/corrompido.ts): um chefe por heroi jogavel (sprite de
// scripts/sprites-corrompidos.py), na onda 31 (chefe final) do X depois da primeira vitoria
export const HEROIS_CORROMPIVEIS = ['mage', 'archer', 'druid', 'cleric', 'paladin', 'warlock', 'priest', 'necromancer', 'bard', 'runesmith', 'sylvanite', 'dreadlord', 'jester', 'vex', 'zylvara', 'morrigan', 'ixara', 'berserker', 'frost_warden', 'inquisitor', 'yue', 'billy', 'malachar_human'] as const;
export const CHEFES_CORROMPIDOS: readonly string[] = HEROIS_CORROMPIVEIS.map(h => `corrupted_${h}`);
export const CHEFES_ATOS_NOVOS: readonly string[] = [...CHEFES_ATO6, ...CHEFES_ATO7, ...CHEFES_ATO8, ...CHEFES_ATO9, ...CHEFES_ATO5R, ...CHEFES_ATO10, ...CHEFES_CORROMPIDOS];
export const CHEFES_TIPOS: ReadonlySet<string> = new Set<string>([...CHEFES_LEGADO, ...CHEFES_ATOS_NOVOS]);
// "E chefe?" (legado + atos novos): use onde a lista servia so para isso
export const ehChefe = (tipo: string): boolean => CHEFES_TIPOS.has(tipo);

// Tipos novos sem sprite proprio: desenhados com o sprite de outro tipo (EntitySprites SPRITE_REMAP)
export const SPRITE_ATO6: Record<string, string> = {
  cultista_mor: 'cultista_vermelho',
  coro: 'cultista_negro',
  coro_cultista: 'cultista_azul',
  anjo_caido: 'anjo_sombrio',
  irma_de_cassiel: 'anjo_rubro',
  fenix_ancia: 'fenix_do_caos',
  serafim_caido: 'fallen_seraph',
};

// Chefes do Ato VII sem sprite proprio (kwazul, xiphra e ossoth tem: scripts/sprites-ato7.py)
export const SPRITE_ATO7: Record<string, string> = {
  sapo_rei: 'sapo_xama_b',
  alfa_matilha: 'lobo_b',
  chefe_tribal: 'tribo_raposa_c',
};

// Chefes do Ato VIII sem sprite proprio (capitao_afogado, garuda e kraken tem: scripts/sprites-ato8.py)
export const SPRITE_ATO8: Record<string, string> = {
  mae_das_aguas: 'agua_viva_d',
  rei_caranguejo: 'caranguejo_c',
  serpente_ancia: 'serpente_mar',
};

// Chefes do Ato IX sem sprite proprio (drider, estatua_leste/oeste e quimera tem: scripts/sprites-ato9.py)
export const SPRITE_ATO9: Record<string, string> = {
  general_ossos: 'legiao_e',
  cranio_ancestral: 'cranio_d',
  cerbero_alfa: 'cerbero_b',
};

// Chefes do Ato V refeito sem sprite proprio (tesoureiro, capitao_ashfen e reitor tem: scripts/sprites-ato5-refeito.py)
export const SPRITE_ATO5R: Record<string, string> = {
  sargento_ashfen: 'soldado_ashfen_d',
  chefe_saqueador: 'saqueador_martelo',
  lich_colegiado: 'lich5_b',
};

// Luta final do X: o Devorador Anciao usa o sprite do Devorador comum (tamanho pelo raio, 1,5x)
export const SPRITE_ATO10: Record<string, string> = {
  mind_flayer_anciao: 'mind_flayer',
};

// Demonios (secao "Demons" do ANIMATED_ENEMIES) — o Cultista vermelho os fortalece
export const DEMONIOS: ReadonlySet<string> = new Set(['fire_devil', 'demon_skeleton', 'imp', 'devil', 'demon', 'lesser_demon', 'lord_demon', 'demon_eyes', 'void_stalker', 'malachar']);

// Hoste Caida (Ato VI), vespas (Ato VII), aguas-vivas, Mae das Aguas e Garuda (Ato VIII), cranios e Quimera (Ato IX), runas hostis (V refeito): voam (sombra + balanco) e ignoram a fileira da frente (Vanguarda, coluna 3)
export function ehVoador(tipo: string): boolean {
  if (tipo.startsWith('anjo_sem_asas')) return false;
  return tipo === 'anjo' || tipo === 'anjo_rubro' || tipo === 'anjo_sombrio' || tipo === 'anjo_caido' || tipo === 'irma_de_cassiel'
    || tipo === 'serafim_caido' || tipo.startsWith('morcego') || tipo.startsWith('fenix')
    || tipo.startsWith('vespa')   // Ato VII
    || tipo.startsWith('agua_viva') || tipo === 'mae_das_aguas' || tipo === 'garuda'   // Ato VIII
    || tipo.startsWith('cranio') || tipo === 'quimera'   // Ato IX (cranio*, inclusive o Cranio Ancestral)
    || tipo.startsWith('runa_hostil');   // Ato V refeito
}
// Prioridade de alvo por coluna (maior = mirado primeiro). Normal: a coluna mesmo (a Vanguarda, 3,
// na frente). Voador: passa por cima da Vanguarda — ela vira a ultima opcao (so se nao houver outro).
export function prioridadeAlvo(tipo: string, col: number): number {
  return ehVoador(tipo) && col === 3 ? -0.5 : col;
}
// Ignora obstaculos de chao dos herois (Muralha Glacial, pocas de gelo). Hoje os voadores dos atos
// VI-VIII nao ignoram (o jogo nao distingue); so a Quimera (Ato IX) ignora — legado intocado.
export const ignoraChao = (tipo: string): boolean => tipo === 'quimera';
