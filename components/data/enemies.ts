// ══════════════════════════════════════════════════════════════════════
// data/enemies.ts
// Extracted from GameCanvas.tsx — damage types, resistances and enemy
// utilities. No React or canvas dependency.
// ══════════════════════════════════════════════════════════════════════

import { t } from '../../i18n';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type DamageType =
  | 'physical'
  | 'arcane'
  | 'nature'
  | 'holy'
  | 'death'
  | 'shadow'
  | 'chaos';

// ---------------------------------------------------------------------------
// Damage type per ally
// ---------------------------------------------------------------------------

export const ALLY_DAMAGE_TYPE: Record<string, DamageType> = {
  archer:      'physical',
  zylvara:     'physical',
  vex:         'physical',
  mage:        'arcane',
  runesmith:   'arcane',
  druid:       'nature',
  sylvanite:   'nature',
  cleric:      'holy',
  priest:      'holy',
  paladin:     'holy',
  necromancer: 'death',
  warlock:     'shadow',
  dreadlord:   'shadow',
  bard:        'chaos',
  morrigan:    'shadow', // Soul Devourer — shadow/void damage
  ixara:       'chaos',
  jester:      'chaos',
  berserker:   'physical',
  frost_warden:'arcane',   // frost is closest to arcane in the current type system
  inquisitor:  'holy',
  malachar_human: 'arcane', // void/arcane hybrid — arcane is dominant
  yue:         'chaos',    // danca — palco, nao escola de magia
  billy:       'physical',
};

// ---------------------------------------------------------------------------
// Display do tipo de dano (cor, label, emoji) — usado nos tooltips e cards
// ---------------------------------------------------------------------------

export interface DmgTypeDisplay {
  color: string;
  bg:    string;
  /** abreviacao de 3 letras, pros badges apertados (PHY, ARC...) */
  label: string;
  /** nome por extenso, pra onde cabe (chip de tipo na selecao de heroi) */
  full:  string;
  emoji: string;
}

export const DMG_TYPE_DISPLAY: Record<DamageType, DmgTypeDisplay> = {
  physical: { color: '#9cabaf', bg: 'rgba(74,93,102,0.85)',   get label() { return t('damageType.physical'); }, get full() { return t('damageType.physical.full'); }, emoji: '⚔️'  },
  arcane:   { color: '#c3b3bf', bg: 'rgba(95,75,103,0.85)',   get label() { return t('damageType.arcane'); }, get full() { return t('damageType.arcane.full'); }, emoji: '🔮'  },
  nature:   { color: '#959e87', bg: 'rgba(50,59,44,0.85)',    get label() { return t('damageType.nature'); }, get full() { return t('damageType.nature.full'); }, emoji: '🌿'  },
  holy:     { color: '#b98e79', bg: 'rgba(80,53,40,0.85)',    get label() { return t('damageType.holy'); }, get full() { return t('damageType.holy.full'); }, emoji: '✨'  },
  death:    { color: '#b6bebe', bg: 'rgba(74,93,101,0.85)',   get label() { return t('damageType.death'); }, get full() { return t('damageType.death.full'); }, emoji: '💀'  },
  shadow:   { color: '#c3b3bf', bg: 'rgba(87,68,95,0.85)',   get label() { return t('damageType.shadow'); }, get full() { return t('damageType.shadow.full'); }, emoji: '🌑'  },
  chaos:    { color: '#c59993', bg: 'rgba(105,58,51,0.85)',   get label() { return t('damageType.chaos'); }, get full() { return t('damageType.chaos.full'); }, emoji: '🌀'  },
};

// ---------------------------------------------------------------------------
// Enemy resistances
// 1.40 = weakness (takes 40% more) | 0.60 = resistance (takes 40% less)
// ---------------------------------------------------------------------------

export const ENEMY_RESISTANCES: Record<string, Partial<Record<DamageType, number>>> = {
  // ── Goblins: fragile, no real resistances ─────────────────────────────
  goblin:           { physical: 1.0,  arcane: 1.1  },
  goblin_archer:    { physical: 1.0                },
  goblin_assassin:  { physical: 1.0,  holy: 1.2   },
  goblin_mage:      { arcane: 0.70,   physical: 1.2, holy: 1.2 },
  goblin_shaman:    { nature: 0.75,   holy: 1.3   },
  goblin_king:      { physical: 0.80, holy: 1.3,   arcane: 1.2 },

  // ── Orcs: thick hide, resistant to physical ─────────────────────────────
  orc:              { physical: 0.65, arcane: 1.3,  holy: 1.2  },
  orc_spearman:     { physical: 0.70, arcane: 1.2              },
  orc_warrior:      { physical: 0.55, arcane: 1.4,  holy: 1.3  },
  orc_berserker:    { physical: 0.70, nature: 1.2,  chaos: 1.2 },
  orc_leader:       { physical: 0.60, arcane: 1.3              },
  orc_warlord:      { physical: 0.55, arcane: 1.4,  holy: 1.3  },

  // ── Mortos-vivos: fracos a sagrado/fogo, resistentes a morte ─────────────
  skeleton:         { holy: 1.50,  chaos: 1.3,  physical: 0.70, death: 0.50 },
  skeleton_warrior: { holy: 1.40,  chaos: 1.2,  physical: 0.65, death: 0.50 },
  ghoul:            { holy: 1.40,               physical: 0.75, death: 0.55 },
  mummy:            { holy: 1.35,  chaos: 1.3,  physical: 0.70, death: 0.55 },
  lich:             { holy: 1.50,               physical: 0.60, arcane: 0.75, death: 0.40 },
  ghost:            { holy: 1.45,  arcane: 1.2, physical: 0.30, death: 0.50 },
  wraith:           { holy: 1.45,  arcane: 1.2, physical: 0.35, death: 0.45 },
  wight:            { holy: 1.40,               physical: 0.65, death: 0.50 },
  banshee:          { holy: 1.45,  arcane: 1.1, physical: 0.40, death: 0.50 },
  grim_reaper:      { holy: 1.50,  arcane: 0.80,physical: 0.55, death: 0.35 },

  // ── Elves: agile, weak to shadow ────────────────────────────────────────
  elf:              { shadow: 1.35, nature: 0.65, physical: 1.1 },
  elf_scout:        { shadow: 1.30, nature: 0.70, arcane: 1.1  },
  elf_arcanist:     { shadow: 1.40, arcane: 0.65, nature: 0.70 },
  elf_champion:     { shadow: 1.30, nature: 0.65, holy: 1.1   },
  troll:            { physical: 0.70, nature: 1.2 } as Partial<Record<DamageType, number>>,
  // Note: troll had `fire: 1.40` originally but 'fire' is not a valid DamageType.
  // Kept without 'fire' for now — add 'fire' to DamageType if needed.

  // ── Minotauros: robustos, fracos a arcano ────────────────────────────────
  minotaur:             { arcane: 1.35, holy: 1.2,  physical: 0.75 },
  minotaur_archer:      { arcane: 1.30,              physical: 0.80 },
  minotaur_warrior:     { arcane: 1.40, holy: 1.2,  physical: 0.60 },
  minotaur_guard:       { arcane: 1.35,              physical: 0.60, nature: 1.1 },
  minotaur_king:        { arcane: 1.40, holy: 1.3,  physical: 0.55 },
  // Ato I — deserto (17/9/2026)
  centaur:              { physical: 1.0,  nature: 1.20, arcane: 1.15 },
  centaur_archer:       { physical: 1.0,  nature: 1.20, arcane: 1.15 },
  harpy:                { physical: 1.15, arcane: 0.85, holy: 1.25 },
  stone_guardian:       { physical: 0.35, arcane: 1.50, nature: 1.3, chaos: 1.3 },
  medusa:               { physical: 0.55, holy: 1.40,   arcane: 1.2 },
  fire_dragon:          { physical: 0.75, nature: 0.70, arcane: 1.30, holy: 1.20 },

  // ── Dragons: resistant to physical/chaos, weak to arcane/holy ──────────
  dragon:       { physical: 0.55, chaos: 0.70, arcane: 1.35, holy: 1.25 },
  wyvern:       { physical: 0.60, chaos: 0.75, arcane: 1.30, nature: 1.2 },
  mini_dragon:  { physical: 0.60,              arcane: 1.30             },
  frost_dragon: { physical: 0.55, nature: 0.75,chaos: 1.30,  holy: 1.25 },
  dragon_lord:  { physical: 0.45, chaos: 0.65, arcane: 1.40, holy: 1.30 },

  // ── Giants: physical resistance, weak to arcane ────────────────────────
  cyclops:              { physical: 0.65, arcane: 1.35, nature: 1.1  },
  cyclops_stonehurler:  { physical: 0.65, arcane: 1.30               },
  ogre:                 { physical: 0.60, arcane: 1.40, nature: 1.2  },
  ogre_berserker:       { physical: 0.65, arcane: 1.35, chaos: 1.2  },
  half_brother_ogre:    { physical: 0.55, arcane: 1.40, holy: 1.2   },
  half_brother_cyclops: { physical: 0.55, arcane: 1.40, nature: 1.2 },
  golem:                { physical: 0.40, arcane: 1.50, nature: 1.3, chaos: 1.3 },
  slime:                { physical: 0.50, holy: 1.30,   chaos: 1.30 },

  // ── Vampires: weak to holy, resistant to physical/shadow ──────────────
  vampire:           { holy: 1.45, chaos: 1.2, physical: 0.70, shadow: 0.60 },
  dhampir:           { holy: 1.35,             physical: 0.75, shadow: 0.65 },
  dhampir_ballister: { holy: 1.30,                              shadow: 0.65 },
  dhampir_mage:      { holy: 1.35, arcane: 0.75,               shadow: 0.60 },
  vampire_lord:      { holy: 1.50, chaos: 1.2, physical: 0.60, shadow: 0.50 },

  // ── Demons/Fire: resistant to chaos/fire, weak to holy ─────────────
  imp:           { holy: 1.40, nature: 1.2, chaos: 0.65              },
  fire_devil:    { holy: 1.35, nature: 1.3, chaos: 0.55, physical: 0.80 },
  devil:         { holy: 1.40, chaos: 0.60, nature: 1.2              },
  demon_skeleton:{ holy: 1.40,              physical: 0.70, death: 0.55 },
  demon:         { holy: 1.45, chaos: 0.55, arcane: 1.2,  nature: 1.2 },
  lord_demon:    { holy: 1.40, chaos: 0.60, arcane: 1.2              },
  lesser_demon:  { holy: 1.35, chaos: 0.65                           },

  // ── Void/Abyss: resistant to physical, weak to holy/arcane ───────────
  void_stalker:    { physical: 0.55, arcane: 1.35, holy: 1.35, shadow: 0.65 },
  demon_eyes:      { physical: 0.60, arcane: 1.30, holy: 1.30, shadow: 0.70 },
  void_herald:     { physical: 0.60, arcane: 1.35, holy: 1.30, shadow: 0.65 },
  warlock_shade:   { holy: 1.40,     arcane: 0.70,              shadow: 0.60 },
  flux_anomaly:    { physical: 0.65, arcane: 1.40, nature: 1.2              },
  fallen_seraph:   { shadow: 1.40,   holy: 0.70,  arcane: 1.2              },
  corrupt_paladin: { shadow: 1.35,   death: 1.30, holy: 0.70               },
  death_knight:    { holy: 1.40,     shadow: 0.60,physical: 0.65, death: 0.55 },
  mind_flayer:     { physical: 0.60, arcane: 1.35, chaos: 1.30, shadow: 0.65 },
  mind_flayer_anciao: { physical: 0.60, arcane: 1.35, chaos: 1.30, shadow: 0.65 },   // Devorador Anciao (Fome): o mesmo
  hydra:           { physical: 0.65, arcane: 1.30, nature: 1.25             },
  beholder:        { physical: 0.55, arcane: 1.35, shadow: 0.70, holy: 1.25 },

  // ── Elementais ───────────────────────────────────────────────────────────
  fire_elemental:  { nature: 1.45, holy: 1.2, chaos: 0.55, physical: 0.70 },
  earth_elemental: { nature: 0.60, chaos: 1.30,arcane: 1.35,physical: 0.65 },
  ice_witch:       { nature: 1.35, chaos: 1.25,arcane: 0.70               },
  pixie:           { shadow: 1.40, holy: 0.75, physical: 0.80              },

  // ── Profundezas/Sombras ──────────────────────────────────────────────────
  deepling_scout:  { arcane: 1.30, nature: 1.2, physical: 0.80 },
  deepling_warrior:{ arcane: 1.25, nature: 1.2, physical: 0.75 },
  bonelord:        { holy: 1.40,               physical: 0.65, death: 0.50 },
  shadow_beast:    { holy: 1.35,  arcane: 1.25, shadow: 0.55, physical: 0.70 },
  nightmare:       { holy: 1.35,  arcane: 1.20, shadow: 0.60               },
  nightstalker:    { holy: 1.40,  arcane: 1.25, shadow: 0.55               },

  // ── Chefes finais ────────────────────────────────────────────────────────
  infernatil: { holy: 1.40, arcane: 1.30, chaos: 0.50, physical: 0.65 },
  ghazbaran:  { holy: 1.35, arcane: 1.30, shadow: 0.60,physical: 0.60 },
  zathroth:   { holy: 1.35, arcane: 1.25, shadow: 0.55,chaos: 0.70   },
  malachar:   { holy: 1.40, arcane: 1.30, chaos: 0.60, physical: 0.55 },
};

// ---------------------------------------------------------------------------
// Bosses imunes a CC (freeze, root, stun)
// ---------------------------------------------------------------------------

export const BOSS_IMMUNE_TYPES = new Set<string>([
  'goblin_king',
  'orc_warlord',
  'grim_reaper',
  'dwarf_geomancer',
  'elf_champion',
  'minotaur_king',
  'medusa',
  'dragon_lord',
  'half_brother_ogre',
  'half_brother_cyclops',
  'vampire_lord',
  'demon',
  'malachar',
  'boss',
]);

// ---------------------------------------------------------------------------
// Utility: returns the damage multiplier of an ally against an enemy
// ---------------------------------------------------------------------------

export const getDamageMultiplier = (allyType: string, enemyType: string): number => {
  const dmgType = ALLY_DAMAGE_TYPE[allyType];
  if (!dmgType) return 1.0;
  const resistances = ENEMY_RESISTANCES[enemyType];
  if (!resistances) return 1.0;
  return resistances[dmgType] ?? 1.0;
};
