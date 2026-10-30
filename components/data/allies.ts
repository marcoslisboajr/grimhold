// ══════════════════════════════════════════════════════════════════════
// data/allies.ts
// Sistema de masteria, relíquias de personagem, relíquias de conta e
// constantes de aliados. Extraído do GameCanvas.tsx.
// O texto (name/desc/flavor/tag) vem do i18n, por GETTERS. Para mexer no
// texto, edite i18n/locales/en.json na chave 'relic.<id>.*'.
// ══════════════════════════════════════════════════════════════════════

import { t } from '../../i18n';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export interface CharRelicDef {
  id:           string;
  name:         string;
  desc:         string;
  icon:         string;
  color:        string;
  glow:         string;
  border:       string;
  masteryLevel: 2 | 4 | 6 | 8 | 10;
}

export interface AccountRelicDef {
  id:     string;
  name:   string;
  icon:   string;
  desc:   string;
  flavor: string;
  color:  string;
  border: string;
  glow:   string;
  tag:    string;
  apply:  (p: any) => any;
}

// ---------------------------------------------------------------------------
// Sistema de Masteria
// ---------------------------------------------------------------------------

/**
 * XP necessário para passar do nível `level` para o próximo.
 * Estilo LoL: rápido no início, pesado no final.
 */
export const MASTERY_XP_PER_LEVEL = (level: number): number => {
  const thresholds: Record<number, number> = {
    1: 1800,   // L1→2:  ~1 run fácil
    2: 3600,   // L2→3:  ~2 runs
    3: 7200,   // L3→4:  ~3 runs
    4: 14400,  // L4→5:  ~5 runs
    5: 25200,  // L5→6:  ~8 runs
    6: 36000,  // L6→7:  ~12 runs
    7: 50400,  // L7→8:  ~16 runs
    8: 72000,  // L8→9:  ~23 runs
    9: 100800, // L9→10: ~32 runs
  };
  return thresholds[level] ?? 999999;
};

/** XP de masteria ganho por run: base 300 + (20 × ondas) + (1 × kills) */
export const calcMasteryXP = (waves: number, kills: number): number =>
  Math.round(300 + waves * 20 + kills * 1);

/** Mastery levels at which each character relic is unlocked */
export const MASTERY_UNLOCK_LEVELS: ReadonlyArray<number> = [2, 4, 6, 8, 10];

// ---------------------------------------------------------------------------
// Account Relics (unlocked by account level)
// ---------------------------------------------------------------------------

export const ACCOUNT_RELICS: AccountRelicDef[] = [
  {
    id:     'relic_acc_barrier',
    get name() { return t('relic.relic_acc_barrier.name'); },
    icon:   '🔷',
    get desc() { return t('relic.relic_acc_barrier.desc'); },
    get flavor() { return t('relic.relic_acc_barrier.flavor'); },
    color:  '#8398a0', border: '#344045', glow: 'rgba(136,158,168,0.25)',
    get tag() { return t('relic.relic_acc_barrier.tag'); },
    apply:  (p: any) => ({ ...p, relicBarrierResonance: true }),
  },
  {
    id:     'relic_acc_predator',
    get name() { return t('relic.relic_acc_predator.name'); },
    icon:   '🦅',
    get desc() { return t('relic.relic_acc_predator.desc'); },
    get flavor() { return t('relic.relic_acc_predator.flavor'); },
    color:  '#bc8e78', border: '#603f2f', glow: 'rgba(189,144,122,0.25)',
    get tag() { return t('relic.relic_acc_predator.tag'); },
    apply:  (p: any) => ({ ...p, relicPredator: true }),
  },
  {
    id:     'relic_acc_ancient',
    get name() { return t('relic.relic_acc_ancient.name'); },
    icon:   '🌀',
    get desc() { return t('relic.relic_acc_ancient.desc'); },
    get flavor() { return t('relic.relic_acc_ancient.flavor'); },
    color:  '#c3b3bf', border: '#5a4860', glow: 'rgba(196,182,202,0.25)',
    get tag() { return t('relic.relic_acc_ancient.tag'); },
    apply:  (p: any) => ({
      ...p,
      allies: p.allies.map((a: any) => ({
        ...a,
        level:          Math.min(a.isHero ? 15 : 10, a.level + 1),
        damage:         Math.round(a.damage * 1.10),
        maxHp:          Math.round(a.maxHp * 1.08),
        hp:             Math.round(a.hp * 1.08),
        attackSpeed:    Math.max(200, Math.round(a.attackSpeed * 0.97)),
        range:          Math.round(a.range * 1.02),
      })),
    }),
  },
  {
    id:     'relic_acc_warlord',
    get name() { return t('relic.relic_acc_warlord.name'); },
    icon:   '👑',
    get desc() { return t('relic.relic_acc_warlord.desc'); },
    get flavor() { return t('relic.relic_acc_warlord.flavor'); },
    color:  '#bc8e78', border: '#603f2f', glow: 'rgba(181,130,106,0.25)',
    get tag() { return t('relic.relic_acc_warlord.tag'); },
    apply:  (p: any) => p, // handled specially at game start
  },
];

// ---------------------------------------------------------------------------
// Per-character relics (unlocked via mastery)
// ---------------------------------------------------------------------------

export const CHAR_RELICS: Record<string, CharRelicDef[]> = {

  // ── Mage ─────────────────────────────────────────────────────────────────
  mage: [
    { id: 'cm_mage_1', get name() { return t('relic.cm_mage_1.name'); },  masteryLevel: 2,  icon: '🔮', color: '#9cabaf', border: '#344045', glow: 'rgba(160,178,186,0.3)',   get desc() { return t('relic.cm_mage_1.desc'); } },
    { id: 'cm_mage_2', get name() { return t('relic.cm_mage_2.name'); },         masteryLevel: 4,  icon: '💧', color: '#b6bebe', border: '#47585f', glow: 'rgba(178,192,199,0.3)',  get desc() { return t('relic.cm_mage_2.desc'); } },
    { id: 'cm_mage_3', get name() { return t('relic.cm_mage_3.name'); },          masteryLevel: 6,  icon: '🌀', color: '#c3b3bf', border: '#5a4860', glow: 'rgba(198,185,204,0.3)',  get desc() { return t('relic.cm_mage_3.desc'); } },
    { id: 'cm_mage_4', get name() { return t('relic.cm_mage_4.name'); },     masteryLevel: 8,  icon: '⚡', color: '#dddbd4', border: '#725b7b', glow: 'rgba(211,219,223,0.3)',  get desc() { return t('relic.cm_mage_4.desc'); } },
    { id: 'cm_mage_5', get name() { return t('relic.cm_mage_5.name'); },     masteryLevel: 10, icon: '🌌', color: '#dddbd4', border: '#9b82a2', glow: 'rgba(233,237,239,0.4)',  get desc() { return t('relic.cm_mage_5.desc'); } },
  ],

  // ── Archer ───────────────────────────────────────────────────────────────
  archer: [
    { id: 'cm_archer_1', get name() { return t('relic.cm_archer_1.name'); },         masteryLevel: 2,  icon: '🦅', color: '#959e87', border: '#30392a', glow: 'rgba(145,164,132,0.3)',   get desc() { return t('relic.cm_archer_1.desc'); } },
    { id: 'cm_archer_2', get name() { return t('relic.cm_archer_2.name'); },  masteryLevel: 4,  icon: '🏹', color: '#cbcabc', border: '#404c38', glow: 'rgba(184,197,176,0.3)', get desc() { return t('relic.cm_archer_2.desc'); } },
    { id: 'cm_archer_3', get name() { return t('relic.cm_archer_3.name'); },     masteryLevel: 6,  icon: '🎯', color: '#959e87', border: '#30392a', glow: 'rgba(138,159,124,0.3)',   get desc() { return t('relic.cm_archer_3.desc'); } },
    { id: 'cm_archer_4', get name() { return t('relic.cm_archer_4.name'); },    masteryLevel: 8,  icon: '💨', color: '#cbcabc', border: '#404c38', glow: 'rgba(201,211,195,0.3)',  get desc() { return t('relic.cm_archer_4.desc'); } },
    { id: 'cm_archer_5', get name() { return t('relic.cm_archer_5.name'); },    masteryLevel: 10, icon: '☄️', color: '#dbd6cc', border: '#404c38', glow: 'rgba(246,248,245,0.4)',  get desc() { return t('relic.cm_archer_5.desc'); } },
  ],

  // ── Warlock ──────────────────────────────────────────────────────────────
  warlock: [
    { id: 'cm_warlock_1', get name() { return t('relic.cm_warlock_1.name'); },        masteryLevel: 2,  icon: '👁️', color: '#c3b3bf', border: '#5a4860', glow: 'rgba(196,182,202,0.3)', get desc() { return t('relic.cm_warlock_1.desc'); } },
    { id: 'cm_warlock_2', get name() { return t('relic.cm_warlock_2.name'); },        masteryLevel: 4,  icon: '🌑', color: '#af9bb1', border: '#725b7b', glow: 'rgba(172,152,180,0.3)',  get desc() { return t('relic.cm_warlock_2.desc'); } },
    { id: 'cm_warlock_3', get name() { return t('relic.cm_warlock_3.name'); },    masteryLevel: 6,  icon: '🔮', color: '#9b82a2', border: '#8a6e96', glow: 'rgba(150,125,160,0.3)',   get desc() { return t('relic.cm_warlock_3.desc'); } },
    { id: 'cm_warlock_4', get name() { return t('relic.cm_warlock_4.name'); },      masteryLevel: 8,  icon: '🌀', color: '#9b82a2', border: '#5a4860', glow: 'rgba(154,130,165,0.3)',   get desc() { return t('relic.cm_warlock_4.desc'); } },
    { id: 'cm_warlock_5', get name() { return t('relic.cm_warlock_5.name'); },     masteryLevel: 10, icon: '💀', color: '#dddbd4', border: '#725b7b', glow: 'rgba(231,235,237,0.4)',  get desc() { return t('relic.cm_warlock_5.desc'); } },
  ],

  // ── Druid ────────────────────────────────────────────────────────────────
  druid: [
    { id: 'cm_druid_1', get name() { return t('relic.cm_druid_1.name'); },    masteryLevel: 2,  icon: '🌿', color: '#78866c', border: '#30392a', glow: 'rgba(128,150,113,0.3)',   get desc() { return t('relic.cm_druid_1.desc'); } },
    { id: 'cm_druid_2', get name() { return t('relic.cm_druid_2.name'); },      masteryLevel: 4,  icon: '🍂', color: '#b1b5a3', border: '#23291f', glow: 'rgba(168,183,158,0.3)',  get desc() { return t('relic.cm_druid_2.desc'); } },
    { id: 'cm_druid_3', get name() { return t('relic.cm_druid_3.name'); },      masteryLevel: 6,  icon: '🌸', color: '#dbd6cc', border: '#404c38', glow: 'rgba(204,212,198,0.3)',  get desc() { return t('relic.cm_druid_3.desc'); } },
    { id: 'cm_druid_4', get name() { return t('relic.cm_druid_4.name'); },    masteryLevel: 8,  icon: '🌙', color: '#dbd6cc', border: '#516047', glow: 'rgba(229,233,226,0.3)',  get desc() { return t('relic.cm_druid_4.desc'); } },
    { id: 'cm_druid_5', get name() { return t('relic.cm_druid_5.name'); },          masteryLevel: 10, icon: '🌍', color: '#dbd6cc', border: '#617355', glow: 'rgba(244,246,243,0.4)',  get desc() { return t('relic.cm_druid_5.desc'); } },
  ],

  // ── Necromancer ──────────────────────────────────────────────────────────
  necromancer: [
    { id: 'cm_necro_1', get name() { return t('relic.cm_necro_1.name'); },       masteryLevel: 2,  icon: '💀', color: '#9cabaf', border: '#242c2f', glow: 'rgba(152,171,180,0.3)', get desc() { return t('relic.cm_necro_1.desc'); } },
    { id: 'cm_necro_2', get name() { return t('relic.cm_necro_2.name'); },          masteryLevel: 4,  icon: '🦴', color: '#dddbd4', border: '#344045', glow: 'rgba(208,216,220,0.3)', get desc() { return t('relic.cm_necro_2.desc'); } },
    { id: 'cm_necro_3', get name() { return t('relic.cm_necro_3.name'); },          masteryLevel: 6,  icon: '⚰️', color: '#dddbd4', border: '#47585f', glow: 'rgba(230,234,236,0.3)', get desc() { return t('relic.cm_necro_3.desc'); } },
    { id: 'cm_necro_4', get name() { return t('relic.cm_necro_4.name'); },      masteryLevel: 8,  icon: '🧟', color: '#dddbd4', border: '#6d8894', glow: 'rgba(243,246,247,0.3)', get desc() { return t('relic.cm_necro_4.desc'); } },
    { id: 'cm_necro_5', get name() { return t('relic.cm_necro_5.name'); },     masteryLevel: 10, icon: '💫', color: '#efe4df', border: '#9cabaf', glow: 'rgba(255,255,255,0.35)',get desc() { return t('relic.cm_necro_5.desc'); } },
  ],

  // ── Cleric ───────────────────────────────────────────────────────────────
  cleric: [
    { id: 'cm_cleric_1', get name() { return t('relic.cm_cleric_1.name'); },       masteryLevel: 2,  icon: '✨', color: '#d9c1b6', border: '#603f2f', glow: 'rgba(216,202,176,0.3)', get desc() { return t('relic.cm_cleric_1.desc'); } },
    { id: 'cm_cleric_2', get name() { return t('relic.cm_cleric_2.name'); },       masteryLevel: 4,  icon: '🌟', color: '#d9c1b6', border: '#603f2f', glow: 'rgba(216,202,175,0.3)', get desc() { return t('relic.cm_cleric_2.desc'); } },
    { id: 'cm_cleric_3', get name() { return t('relic.cm_cleric_3.name'); },     masteryLevel: 6,  icon: '🛡️', color: '#b98e79', border: '#7a503c', glow: 'rgba(195,174,134,0.3)',  get desc() { return t('relic.cm_cleric_3.desc'); } },
    { id: 'cm_cleric_4', get name() { return t('relic.cm_cleric_4.name'); },       masteryLevel: 8,  icon: '⚡', color: '#bc8e78', border: '#936149', glow: 'rgba(181,130,106,0.3)',  get desc() { return t('relic.cm_cleric_4.desc'); } },
    { id: 'cm_cleric_5', get name() { return t('relic.cm_cleric_5.name'); },     masteryLevel: 10, icon: '👼', color: '#e4d1c8', border: '#ac7357', glow: 'rgba(249,245,243,0.4)',  get desc() { return t('relic.cm_cleric_5.desc'); } },
  ],

  // ── Paladin ──────────────────────────────────────────────────────────────
  paladin: [
    { id: 'cm_paladin_1', get name() { return t('relic.cm_paladin_1.name'); },       masteryLevel: 2,  icon: '⚔️', color: '#bc8e78', border: '#603f2f', glow: 'rgba(181,130,106,0.3)',  get desc() { return t('relic.cm_paladin_1.desc'); } },
    { id: 'cm_paladin_2', get name() { return t('relic.cm_paladin_2.name'); },    masteryLevel: 4,  icon: '🛡️', color: '#b98e79', border: '#603f2f', glow: 'rgba(195,174,134,0.3)',  get desc() { return t('relic.cm_paladin_2.desc'); } },
    { id: 'cm_paladin_3', get name() { return t('relic.cm_paladin_3.name'); },masteryLevel: 6,  icon: '✝️', color: '#d9c1b6', border: '#7a503c', glow: 'rgba(216,202,175,0.3)', get desc() { return t('relic.cm_paladin_3.desc'); } },
    { id: 'cm_paladin_4', get name() { return t('relic.cm_paladin_4.name'); },    masteryLevel: 8,  icon: '🗡️', color: '#e3d2c9', border: '#936149', glow: 'rgba(236,230,217,0.3)', get desc() { return t('relic.cm_paladin_4.desc'); } },
    { id: 'cm_paladin_5', get name() { return t('relic.cm_paladin_5.name'); }, masteryLevel: 10, icon: '👑', color: '#e3d2c9', border: '#ac7357', glow: 'rgba(248,246,242,0.4)',  get desc() { return t('relic.cm_paladin_5.desc'); } },
  ],

  // ── Priest ───────────────────────────────────────────────────────────────
  priest: [
    { id: 'cm_priest_1', get name() { return t('relic.cm_priest_1.name'); },      masteryLevel: 2,  icon: '💚', color: '#cbcabc', border: '#30392a', glow: 'rgba(184,197,176,0.3)', get desc() { return t('relic.cm_priest_1.desc'); } },
    { id: 'cm_priest_2', get name() { return t('relic.cm_priest_2.name'); },               masteryLevel: 4,  icon: '🍀', color: '#959e87', border: '#404c38', glow: 'rgba(145,164,132,0.3)',   get desc() { return t('relic.cm_priest_2.desc'); } },
    { id: 'cm_priest_3', get name() { return t('relic.cm_priest_3.name'); },      masteryLevel: 6,  icon: '☯️', color: '#78866c', border: '#404c38', glow: 'rgba(112,133,98,0.3)',    get desc() { return t('relic.cm_priest_3.desc'); } },
    { id: 'cm_priest_4', get name() { return t('relic.cm_priest_4.name'); },            masteryLevel: 8,  icon: '💫', color: '#dbd6cc', border: '#617355', glow: 'rgba(216,223,211,0.3)',  get desc() { return t('relic.cm_priest_4.desc'); } },
    { id: 'cm_priest_5', get name() { return t('relic.cm_priest_5.name'); },              masteryLevel: 10, icon: '🌈', color: '#dbd6cc', border: '#959e87', glow: 'rgba(246,248,245,0.4)',  get desc() { return t('relic.cm_priest_5.desc'); } },
  ],

  // ── Bard ─────────────────────────────────────────────────────────────────
  bard: [
    { id: 'cm_bard_1', get name() { return t('relic.cm_bard_1.name'); },          masteryLevel: 2,  icon: '🎵', color: '#c3b3bf', border: '#5a4860', glow: 'rgba(184,167,191,0.3)', get desc() { return t('relic.cm_bard_1.desc'); } },
    { id: 'cm_bard_2', get name() { return t('relic.cm_bard_2.name'); },        masteryLevel: 4,  icon: '🎶', color: '#9b82a2', border: '#5a4860', glow: 'rgba(160,138,170,0.3)',  get desc() { return t('relic.cm_bard_2.desc'); } },
    { id: 'cm_bard_3', get name() { return t('relic.cm_bard_3.name'); },         masteryLevel: 6,  icon: '🎸', color: '#8a6e96', border: '#725b7b', glow: 'rgba(137,109,149,0.3)',  get desc() { return t('relic.cm_bard_3.desc'); } },
    { id: 'cm_bard_4', get name() { return t('relic.cm_bard_4.name'); },                masteryLevel: 8,  icon: '🎤', color: '#d5cacd', border: '#8a6e96', glow: 'rgba(211,201,216,0.3)', get desc() { return t('relic.cm_bard_4.desc'); } },
    { id: 'cm_bard_5', get name() { return t('relic.cm_bard_5.name'); },     masteryLevel: 10, icon: '🌠', color: '#e1d7d5', border: '#c3b3bf', glow: 'rgba(242,239,244,0.4)', get desc() { return t('relic.cm_bard_5.desc'); } },
  ],

  // ── Runesmith ────────────────────────────────────────────────────────────
  runesmith: [
    { id: 'cm_rune_1', get name() { return t('relic.cm_rune_1.name'); },          masteryLevel: 2,  icon: '⚡', color: '#6d8894', border: '#344045', glow: 'rgba(118,143,154,0.3)',  get desc() { return t('relic.cm_rune_1.desc'); } },
    { id: 'cm_rune_2', get name() { return t('relic.cm_rune_2.name'); },       masteryLevel: 4,  icon: '🔺', color: '#5a707a', border: '#47585f', glow: 'rgba(92,115,126,0.3)',   get desc() { return t('relic.cm_rune_2.desc'); } },
    { id: 'cm_rune_3', get name() { return t('relic.cm_rune_3.name'); },             masteryLevel: 6,  icon: '🌩️', color: '#6d8894', border: '#5a707a', glow: 'rgba(104,131,143,0.3)',  get desc() { return t('relic.cm_rune_3.desc'); } },
    { id: 'cm_rune_4', get name() { return t('relic.cm_rune_4.name'); },            masteryLevel: 8,  icon: '🔋', color: '#b6bebe', border: '#47585f', glow: 'rgba(178,192,199,0.3)', get desc() { return t('relic.cm_rune_4.desc'); } },
    { id: 'cm_rune_5', get name() { return t('relic.cm_rune_5.name'); },       masteryLevel: 10, icon: '⚡', color: '#dddbd4', border: '#5a707a', glow: 'rgba(237,240,241,0.4)', get desc() { return t('relic.cm_rune_5.desc'); } },
  ],

  // ── Sylvanite ────────────────────────────────────────────────────────────
  sylvanite: [
    { id: 'cm_sylva_1', get name() { return t('relic.cm_sylva_1.name'); },           masteryLevel: 2,  icon: '🌺', color: '#959e87', border: '#30392a', glow: 'rgba(138,159,124,0.3)',   get desc() { return t('relic.cm_sylva_1.desc'); } },
    { id: 'cm_sylva_2', get name() { return t('relic.cm_sylva_2.name'); },          masteryLevel: 4,  icon: '🌳', color: '#78866c', border: '#404c38', glow: 'rgba(110,130,96,0.3)',   get desc() { return t('relic.cm_sylva_2.desc'); } },
    { id: 'cm_sylva_3', get name() { return t('relic.cm_sylva_3.name'); },             masteryLevel: 6,  icon: '🍄', color: '#516047', border: '#404c38', glow: 'rgba(85,101,75,0.3)',   get desc() { return t('relic.cm_sylva_3.desc'); } },
    { id: 'cm_sylva_4', get name() { return t('relic.cm_sylva_4.name'); },          masteryLevel: 8,  icon: '🌪️', color: '#cbcabc', border: '#516047', glow: 'rgba(201,211,195,0.3)',  get desc() { return t('relic.cm_sylva_4.desc'); } },
    { id: 'cm_sylva_5', get name() { return t('relic.cm_sylva_5.name'); },          masteryLevel: 10, icon: '🌏', color: '#dbd6cc', border: '#78866c', glow: 'rgba(242,244,241,0.4)',  get desc() { return t('relic.cm_sylva_5.desc'); } },
  ],

  // ── Dreadlord ────────────────────────────────────────────────────────────
  dreadlord: [
    { id: 'cm_dread_1', get name() { return t('relic.cm_dread_1.name'); },           masteryLevel: 2,  icon: '🌑', color: '#c59993', border: '#6b3b34', glow: 'rgba(206,162,155,0.3)', get desc() { return t('relic.cm_dread_1.desc'); } },
    { id: 'cm_dread_2', get name() { return t('relic.cm_dread_2.name'); },           masteryLevel: 4,  icon: '🌘', color: '#b27870', border: '#81483f', glow: 'rgba(188,128,119,0.3)',   get desc() { return t('relic.cm_dread_2.desc'); } },
    { id: 'cm_dread_3', get name() { return t('relic.cm_dread_3.name'); },                masteryLevel: 6,  icon: '🔥', color: '#9f584e', border: '#81483f', glow: 'rgba(172,97,86,0.3)',   get desc() { return t('relic.cm_dread_3.desc'); } },
    { id: 'cm_dread_4', get name() { return t('relic.cm_dread_4.name'); },         masteryLevel: 8,  icon: '⚫', color: '#e2d0c7', border: '#9f584e', glow: 'rgba(224,197,193,0.3)', get desc() { return t('relic.cm_dread_4.desc'); } },
    { id: 'cm_dread_5', get name() { return t('relic.cm_dread_5.name'); },         masteryLevel: 10, icon: '💥', color: '#e2d0c7', border: '#b27870', glow: 'rgba(245,236,235,0.4)', get desc() { return t('relic.cm_dread_5.desc'); } },
  ],

  // ── Jester ───────────────────────────────────────────────────────────────
  jester: [
    { id: 'cm_jester_1', get name() { return t('relic.cm_jester_1.name'); },          masteryLevel: 2,  icon: '🎲', color: '#bc8e78', border: '#603f2f', glow: 'rgba(189,144,122,0.3)',  get desc() { return t('relic.cm_jester_1.desc'); } },
    { id: 'cm_jester_2', get name() { return t('relic.cm_jester_2.name'); },            masteryLevel: 4,  icon: '🃏', color: '#ac7357', border: '#7a503c', glow: 'rgba(176,121,95,0.3)',  get desc() { return t('relic.cm_jester_2.desc'); } },
    { id: 'cm_jester_3', get name() { return t('relic.cm_jester_3.name'); },             masteryLevel: 6,  icon: '🎭', color: '#ac7357', border: '#936149', glow: 'rgba(165,109,81,0.3)',   get desc() { return t('relic.cm_jester_3.desc'); } },
    { id: 'cm_jester_4', get name() { return t('relic.cm_jester_4.name'); },        masteryLevel: 8,  icon: '♠️', color: '#e4d1c8', border: '#ac7357', glow: 'rgba(227,207,197,0.3)', get desc() { return t('relic.cm_jester_4.desc'); } },
    { id: 'cm_jester_5', get name() { return t('relic.cm_jester_5.name'); },          masteryLevel: 10, icon: '🎆', color: '#e4d1c8', border: '#ac7357', glow: 'rgba(241,232,227,0.4)', get desc() { return t('relic.cm_jester_5.desc'); } },
  ],

  // ── Vex ──────────────────────────────────────────────────────────────────
  vex: [
    { id: 'cm_vex_1', get name() { return t('relic.cm_vex_1.name'); },            masteryLevel: 2,  icon: '🗡️', color: '#c3b3bf', border: '#5a4860', glow: 'rgba(196,182,202,0.3)', get desc() { return t('relic.cm_vex_1.desc'); } },
    { id: 'cm_vex_2', get name() { return t('relic.cm_vex_2.name'); },              masteryLevel: 4,  icon: '👤', color: '#af9bb1', border: '#725b7b', glow: 'rgba(172,152,180,0.3)',  get desc() { return t('relic.cm_vex_2.desc'); } },
    { id: 'cm_vex_3', get name() { return t('relic.cm_vex_3.name'); },             masteryLevel: 6,  icon: '🩸', color: '#9b82a2', border: '#8a6e96', glow: 'rgba(150,125,160,0.3)',   get desc() { return t('relic.cm_vex_3.desc'); } },
    { id: 'cm_vex_4', get name() { return t('relic.cm_vex_4.name'); },           masteryLevel: 8,  icon: '💜', color: '#9b82a2', border: '#5a4860', glow: 'rgba(154,130,165,0.3)',   get desc() { return t('relic.cm_vex_4.desc'); } },
    { id: 'cm_vex_5', get name() { return t('relic.cm_vex_5.name'); },          masteryLevel: 10, icon: '🌑', color: '#dddbd4', border: '#8a6e96', glow: 'rgba(242,244,245,0.4)',  get desc() { return t('relic.cm_vex_5.desc'); } },
  ],

  // ── Zylvara ──────────────────────────────────────────────────────────────
  zylvara: [
    { id: 'cm_zylvara_1', get name() { return t('relic.cm_zylvara_1.name'); },   masteryLevel: 2,  icon: '🩸', color: '#b6bebe', border: '#344045', glow: 'rgba(178,192,199,0.3)', get desc() { return t('relic.cm_zylvara_1.desc'); } },
    { id: 'cm_zylvara_2', get name() { return t('relic.cm_zylvara_2.name'); },         masteryLevel: 4,  icon: '👤', color: '#9cabaf', border: '#47585f', glow: 'rgba(157,175,183,0.3)',   get desc() { return t('relic.cm_zylvara_2.desc'); } },
    { id: 'cm_zylvara_3', get name() { return t('relic.cm_zylvara_3.name'); },         masteryLevel: 6,  icon: '👁️', color: '#8398a0', border: '#5a707a', glow: 'rgba(133,156,166,0.3)',    get desc() { return t('relic.cm_zylvara_3.desc'); } },
    { id: 'cm_zylvara_4', get name() { return t('relic.cm_zylvara_4.name'); },             masteryLevel: 8,  icon: '🌑', color: '#ced0cb', border: '#6d8894', glow: 'rgba(201,211,216,0.3)',  get desc() { return t('relic.cm_zylvara_4.desc'); } },
    { id: 'cm_zylvara_5', get name() { return t('relic.cm_zylvara_5.name'); },  masteryLevel: 10, icon: '💀', color: '#dddbd4', border: '#9cabaf', glow: 'rgba(237,240,242,0.4)',  get desc() { return t('relic.cm_zylvara_5.desc'); } },
  ],

  // ── Morrigan ─────────────────────────────────────────────────────────────
  morrigan: [
    { id: 'cm_morri_1', get name() { return t('relic.cm_morri_1.name'); },            masteryLevel: 2,  icon: '👁️', color: '#c3b3bf', border: '#725b7b', glow: 'rgba(196,182,202,0.3)', get desc() { return t('relic.cm_morri_1.desc'); } },
    { id: 'cm_morri_2', get name() { return t('relic.cm_morri_2.name'); },      masteryLevel: 4,  icon: '💜', color: '#af9bb1', border: '#8a6e96', glow: 'rgba(172,152,180,0.3)',  get desc() { return t('relic.cm_morri_2.desc'); } },
    { id: 'cm_morri_3', get name() { return t('relic.cm_morri_3.name'); },      masteryLevel: 6,  icon: '🌑', color: '#9b82a2', border: '#5a4860', glow: 'rgba(154,130,165,0.3)',  get desc() { return t('relic.cm_morri_3.desc'); } },
    { id: 'cm_morri_4', get name() { return t('relic.cm_morri_4.name'); },      masteryLevel: 8,  icon: '🔮', color: '#dddbd4', border: '#725b7b', glow: 'rgba(231,235,237,0.3)', get desc() { return t('relic.cm_morri_4.desc'); } },
    { id: 'cm_morri_5', get name() { return t('relic.cm_morri_5.name'); },     masteryLevel: 10, icon: '⚡', color: '#dddbd4', border: '#9b82a2', glow: 'rgba(248,249,250,0.4)', get desc() { return t('relic.cm_morri_5.desc'); } },
  ],

  // ── Ixara ────────────────────────────────────────────────────────────────
  ixara: [
    { id: 'cm_ixara_1', get name() { return t('relic.cm_ixara_1.name'); },          masteryLevel: 2,  icon: '🔥', color: '#c3b3bf', border: '#5a4860', glow: 'rgba(184,167,191,0.3)', get desc() { return t('relic.cm_ixara_1.desc'); } },
    { id: 'cm_ixara_2', get name() { return t('relic.cm_ixara_2.name'); },         masteryLevel: 4,  icon: '😈', color: '#9b82a2', border: '#5a4860', glow: 'rgba(160,138,170,0.3)',  get desc() { return t('relic.cm_ixara_2.desc'); } },
    { id: 'cm_ixara_3', get name() { return t('relic.cm_ixara_3.name'); },              masteryLevel: 6,  icon: '🩸', color: '#8a6e96', border: '#725b7b', glow: 'rgba(137,109,149,0.3)',  get desc() { return t('relic.cm_ixara_3.desc'); } },
    { id: 'cm_ixara_4', get name() { return t('relic.cm_ixara_4.name'); },           masteryLevel: 8,  icon: '💢', color: '#d5cacd', border: '#8a6e96', glow: 'rgba(211,201,216,0.3)', get desc() { return t('relic.cm_ixara_4.desc'); } },
    { id: 'cm_ixara_5', get name() { return t('relic.cm_ixara_5.name'); },         masteryLevel: 10, icon: '💥', color: '#e1d7d5', border: '#c3b3bf', glow: 'rgba(242,239,244,0.4)', get desc() { return t('relic.cm_ixara_5.desc'); } },
  ],

  // ── Berserker ─────────────────────────────────────────────────────────────
  berserker: [
    { id: 'cm_berserk_1', get name() { return t('relic.cm_berserk_1.name'); },      masteryLevel: 2,  icon: '🩸', color: '#c59993', border: '#6b3b34', glow: 'rgba(206,162,155,0.3)', get desc() { return t('relic.cm_berserk_1.desc'); } },
    { id: 'cm_berserk_2', get name() { return t('relic.cm_berserk_2.name'); },   masteryLevel: 4,  icon: '🥁', color: '#b27870', border: '#81483f', glow: 'rgba(188,128,119,0.3)',   get desc() { return t('relic.cm_berserk_2.desc'); } },
    { id: 'cm_berserk_3', get name() { return t('relic.cm_berserk_3.name'); },      masteryLevel: 6,  icon: '💢', color: '#9f584e', border: '#81483f', glow: 'rgba(172,97,86,0.3)',   get desc() { return t('relic.cm_berserk_3.desc'); } },
    { id: 'cm_berserk_4', get name() { return t('relic.cm_berserk_4.name'); },   masteryLevel: 8,  icon: '⚔️', color: '#e2d0c7', border: '#9f584e', glow: 'rgba(224,197,193,0.3)', get desc() { return t('relic.cm_berserk_4.desc'); } },
    { id: 'cm_berserk_5', get name() { return t('relic.cm_berserk_5.name'); },        masteryLevel: 10, icon: '🔥', color: '#e2d0c7', border: '#b27870', glow: 'rgba(245,236,235,0.4)', get desc() { return t('relic.cm_berserk_5.desc'); } },
  ],

  // ── Frost Warden ─────────────────────────────────────────────────────────
  frost_warden: [
    { id: 'cm_frost_1', get name() { return t('relic.cm_frost_1.name'); },          masteryLevel: 2,  icon: '❄️', color: '#b6bebe', border: '#344045', glow: 'rgba(178,192,199,0.3)', get desc() { return t('relic.cm_frost_1.desc'); } },
    { id: 'cm_frost_2', get name() { return t('relic.cm_frost_2.name'); },           masteryLevel: 4,  icon: '🌨️', color: '#8398a0', border: '#47585f', glow: 'rgba(136,158,168,0.3)',  get desc() { return t('relic.cm_frost_2.desc'); } },
    { id: 'cm_frost_3', get name() { return t('relic.cm_frost_3.name'); },               masteryLevel: 6,  icon: '💎', color: '#dddbd4', border: '#5a707a', glow: 'rgba(214,222,225,0.3)', get desc() { return t('relic.cm_frost_3.desc'); } },
    { id: 'cm_frost_4', get name() { return t('relic.cm_frost_4.name'); },         masteryLevel: 8,  icon: '🌀', color: '#dddbd4', border: '#6d8894', glow: 'rgba(237,240,241,0.3)', get desc() { return t('relic.cm_frost_4.desc'); } },
    { id: 'cm_frost_5', get name() { return t('relic.cm_frost_5.name'); },          masteryLevel: 10, icon: '⚡', color: '#dddbd4', border: '#8398a0', glow: 'rgba(246,248,249,0.4)', get desc() { return t('relic.cm_frost_5.desc'); } },
  ],

  // ── Inquisitor ────────────────────────────────────────────────────────────
  inquisitor: [
    { id: 'cm_inq_1', get name() { return t('relic.cm_inq_1.name'); },          masteryLevel: 2,  icon: '📖', color: '#d9c1b6', border: '#603f2f', glow: 'rgba(216,202,175,0.3)', get desc() { return t('relic.cm_inq_1.desc'); } },
    { id: 'cm_inq_2', get name() { return t('relic.cm_inq_2.name'); },           masteryLevel: 4,  icon: '⚖️', color: '#b98e79', border: '#603f2f', glow: 'rgba(195,174,134,0.3)',  get desc() { return t('relic.cm_inq_2.desc'); } },
    { id: 'cm_inq_3', get name() { return t('relic.cm_inq_3.name'); },            masteryLevel: 6,  icon: '✝️', color: '#bc8e78', border: '#7a503c', glow: 'rgba(181,130,106,0.3)',  get desc() { return t('relic.cm_inq_3.desc'); } },
    { id: 'cm_inq_4', get name() { return t('relic.cm_inq_4.name'); },                 masteryLevel: 8,  icon: '⚔️', color: '#e3d2c9', border: '#936149', glow: 'rgba(236,230,217,0.3)', get desc() { return t('relic.cm_inq_4.desc'); } },
    { id: 'cm_inq_5', get name() { return t('relic.cm_inq_5.name'); },          masteryLevel: 10, icon: '👁️', color: '#e3d2c9', border: '#ac7357', glow: 'rgba(248,246,242,0.4)', get desc() { return t('relic.cm_inq_5.desc'); } },
  ],

  // ── Malachar, the Redeemed ──────────────────────────────────────────────────
  malachar_human: [
    { id: 'cm_mal_1', get name() { return t('relic.cm_mal_1.name'); },    masteryLevel: 2,  icon: '📖', color: '#dddbd4', border: '#5a4860', glow: 'rgba(211,219,223,0.3)', get desc() { return t('relic.cm_mal_1.desc'); } },
    { id: 'cm_mal_2', get name() { return t('relic.cm_mal_2.name'); },     masteryLevel: 4,  icon: '🌀', color: '#c3b3bf', border: '#8a6e96', glow: 'rgba(198,185,204,0.3)', get desc() { return t('relic.cm_mal_2.desc'); } },
    { id: 'cm_mal_3', get name() { return t('relic.cm_mal_3.name'); },           masteryLevel: 6,  icon: '💀', color: '#b6bebe', border: '#5a707a', glow: 'rgba(178,192,199,0.3)', get desc() { return t('relic.cm_mal_3.desc'); } },
    { id: 'cm_mal_4', get name() { return t('relic.cm_mal_4.name'); },  masteryLevel: 8,  icon: '⚡', color: '#dddbd4', border: '#725b7b', glow: 'rgba(233,237,239,0.3)', get desc() { return t('relic.cm_mal_4.desc'); } },
    { id: 'cm_mal_5', get name() { return t('relic.cm_mal_5.name'); },    masteryLevel: 10, icon: '✨', color: '#dddbd4', border: '#9b82a2', glow: 'rgba(248,249,250,0.4)', get desc() { return t('relic.cm_mal_5.desc'); } },
  ],
  // ── Yue ────────────────────────────────────────────────────────
  yue: [
    { id: 'cm_yue_1', get name() { return t('relic.cm_yue_1.name'); }, masteryLevel: 2, icon: '💄', color: '#f0d9e8', border: '#8a5a78', glow: 'rgba(240,217,232,0.3)', get desc() { return t('relic.cm_yue_1.desc'); } },
    { id: 'cm_yue_2', get name() { return t('relic.cm_yue_2.name'); }, masteryLevel: 4, icon: '🪭', color: '#e8a0c8', border: '#8a5a78', glow: 'rgba(232,160,200,0.3)', get desc() { return t('relic.cm_yue_2.desc'); } },
    { id: 'cm_yue_3', get name() { return t('relic.cm_yue_3.name'); }, masteryLevel: 6, icon: '🎀', color: '#f0abcf', border: '#a06a90', glow: 'rgba(240,171,207,0.3)', get desc() { return t('relic.cm_yue_3.desc'); } },
    { id: 'cm_yue_4', get name() { return t('relic.cm_yue_4.name'); }, masteryLevel: 8, icon: '🌟', color: '#fbe3f2', border: '#b07aa0', glow: 'rgba(251,227,242,0.3)', get desc() { return t('relic.cm_yue_4.desc'); } },
    { id: 'cm_yue_5', get name() { return t('relic.cm_yue_5.name'); }, masteryLevel: 10, icon: '🎪', color: '#ffffff', border: '#c48ab4', glow: 'rgba(255,255,255,0.4)', get desc() { return t('relic.cm_yue_5.desc'); } },
  ],

  // ── Billy ──────────────────────────────────────────────────────
  billy: [
    { id: 'cm_billy_1', get name() { return t('relic.cm_billy_1.name'); }, masteryLevel: 2, icon: '🎩', color: '#d9c1b6', border: '#603f2f', glow: 'rgba(217,193,182,0.3)', get desc() { return t('relic.cm_billy_1.desc'); } },
    { id: 'cm_billy_2', get name() { return t('relic.cm_billy_2.name'); }, masteryLevel: 4, icon: '⏱️', color: '#b98e79', border: '#603f2f', glow: 'rgba(185,142,121,0.3)', get desc() { return t('relic.cm_billy_2.desc'); } },
    { id: 'cm_billy_3', get name() { return t('relic.cm_billy_3.name'); }, masteryLevel: 6, icon: '🌹', color: '#e07a7a', border: '#7a503c', glow: 'rgba(224,122,122,0.3)', get desc() { return t('relic.cm_billy_3.desc'); } },
    { id: 'cm_billy_4', get name() { return t('relic.cm_billy_4.name'); }, masteryLevel: 8, icon: '🎯', color: '#e3d2c9', border: '#936149', glow: 'rgba(227,210,201,0.3)', get desc() { return t('relic.cm_billy_4.desc'); } },
    { id: 'cm_billy_5', get name() { return t('relic.cm_billy_5.name'); }, masteryLevel: 10, icon: '🎭', color: '#e8b04a', border: '#ac7357', glow: 'rgba(232,176,74,0.4)', get desc() { return t('relic.cm_billy_5.desc'); } },
  ],
};

// ---------------------------------------------------------------------------
// Undead enemy types — used in damage checks and abilities
// ---------------------------------------------------------------------------

// Classificacao unica em data/profanos.ts (mortos-vivos dos Atos I-X).
export { MORTOS_VIVOS as UNDEAD_TYPES } from './profanos';

// ---------------------------------------------------------------------------
// Custos de desbloqueio por raridade
// ---------------------------------------------------------------------------

// Estandartes (24/09/2026): heróis saem da essência (que fica para forja e skins).
// Ganha-se +1 por chefe morto, +1 por ato vencido, +3 na primeira vitória de cada ato.
// Os 10 da loja somam 80 (~20–30 runs). Heróis de conquista também podem ser comprados,
// mais caro (ESTANDARTE_CONQUISTA), para quem não quiser caçar a condição.
export const ESTANDARTE_CUSTO: Record<string, number> = {
  common: 3, uncommon: 5, semiRare: 8, rare: 12, legendary: 18,
};
export const ESTANDARTE_CONQUISTA = 15;   // mínimo para herói de conquista

export const UNLOCK_COST_BY_RARITY: Record<string, number> = {
  common:    200,  // ~2-3 runs
  uncommon:  350,  // ~4-5 runs
  semiRare:  600,  // ~7-8 runs
  rare:      1000, // ~12-14 runs
  legendary: 1800, // ~20+ runs (conquest heroes use this as reference only)
};
