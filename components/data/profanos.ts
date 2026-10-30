// ═════════════════════════════════════════════════════════════════
// data/profanos.ts — classificacao unica de inimigos "profanos" (28/09/2026).
// Mortos-vivos e demonios (demonios, diabos, cria do abismo, anjos caidos).
// Usado pelo bonus do Paladino (sinergia Vanguarda Sagrada, reliquia cm_paladin_1)
// e pela Retribuicao da Clériga (so mortos-vivos). Nada de listas soltas no GameCanvas.
// ═════════════════════════════════════════════════════════════════

/** Mortos-vivos: esqueletos, espectros, liches, mumias, vampiros, afogados. */
export const MORTOS_VIVOS: ReadonlySet<string> = new Set<string>([
  // Atos I-V legados
  'skeleton', 'skeleton_warrior', 'ghost', 'ghoul', 'mummy', 'lich', 'grim_reaper',
  'demon_skeleton', 'vampire', 'vampire_lord', 'wraith', 'wight', 'banshee', 'bonelord',
  'death_knight', 'velshade', 'dread_reaper',
  // Ato V refeito
  'lich5', 'lich5_b', 'lich_colegiado',
  // Ato VI
  'lanterna', 'lanterna_b', 'lich6', 'lich6_rubro', 'lich6_dourado',
  'esqueleto6', 'esqueleto6_lanca', 'esqueleto6_escudo',
  // Ato VIII (marinheiros afogados que voltaram do fundo)
  'afogado', 'afogado_b', 'afogado_c', 'afogado_d', 'afogado_veterano', 'capitao_afogado',
  // Ato IX
  'legiao', 'legiao_b', 'legiao_c', 'legiao_d', 'legiao_e',
  'cranio', 'cranio_b', 'cranio_c', 'cranio_d', 'cranio_ancestral',
  'mumia', 'mumia_b', 'general_ossos',
]);

/** Demonios, diabos e afins: infernais, cria do vazio/abismo, caes do inferno, anjos caidos. */
export const DEMONIOS: ReadonlySet<string> = new Set<string>([
  // Atos I-V legados / Ato X
  'imp', 'devil', 'fire_devil', 'demon', 'lesser_demon', 'lord_demon', 'elder_demon',
  'demon_eyes', 'void_stalker', 'void_herald', 'warlock_shade', 'fallen_seraph',
  'infernatil', 'ghazbaran', 'zathroth', 'malachar',
  // Ato VI (Hoste Caida)
  'anjo', 'anjo_rubro', 'anjo_sombrio', 'anjo_sem_asas', 'anjo_sem_asas_rubro', 'anjo_sem_asas_sombrio',
  'anjo_caido', 'serafim_caido',
  // Ato IX (caes do inferno)
  'cerbero', 'cerbero_b', 'cerbero_alfa',
]);

export const ehMortoVivo = (tipo: string | undefined | null): boolean => !!tipo && MORTOS_VIVOS.has(tipo);
export const ehDemonio = (tipo: string | undefined | null): boolean => !!tipo && DEMONIOS.has(tipo);
/** Alvo do bonus sagrado do Paladino: morto-vivo ou demonio. */
export const ehProfano = (tipo: string | undefined | null): boolean => ehMortoVivo(tipo) || ehDemonio(tipo);
