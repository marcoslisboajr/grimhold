// ══════════════════════════════════════════════════════════════════════
// data/skillTrees.ts
// Skill tree definitions per character.
// Só os EFEITOS são dados aqui — o texto (name/desc de cada nó) vem do
// i18n, por GETTERS, resolvidos na hora do render. Para mexer no texto,
// edite i18n/locales/en.json na chave 'skill.<id>.name' / '.desc'.
// ══════════════════════════════════════════════════════════════════════

import { t } from '../../i18n';

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

/**
 * Effect of a skill tree node.
 * The game loop reads these fields via getSkillBonus() / hasSkill().
 *
 * All fields are optional — a node can carry multiple effects at once.
 */
export interface SkillEffect {
  // ── Flat stat bonuses ────────────────────────────────────────────────
  /** +X% base damage of the main ally */
  damageBonus?: number;
  /** +X% attack speed (negative value = faster) */
  attackSpeedBonus?: number;
  /** +X% range */
  rangeBonus?: number;
  /** +X% max HP */
  hpBonus?: number;
  /** +X% projectile speed */
  projSpeedBonus?: number;

  // ── Lifesteal ────────────────────────────────────────────────────────
  /**
   * 0.0–1.0 — fraction of damage dealt restored as HP to the ally.
   * E.g. 0.08 = 8% lifesteal.
   * The game loop applies this on every hit from the main ally.
   */
  lifesteal?: number;

  // ── Boolean flags ────────────────────────────────────────────────────
  /** Projectile pierces 1 extra enemy */
  pierce?: boolean;
  /** On-hit slow: -amount% for duration seconds */
  onHitSlow?: { amount: number; duration: number };
  /** On-hit bleed: chance + dps + duration */
  onHitBleed?: { chance: number; dps: number; duration: number };
  /** On-hit poison: chance + extra stacks */
  onHitPoison?: { chance: number; extraStacks: number };
  /** Extra AoE radius on explosions/kills (px) */
  aoeBonus?: number;
  /** Additional crit chance (0.0–1.0) */
  critChanceBonus?: number;
  /** Crit damage multiplier */
  critDmgMultiplier?: number;

  // ── Wave triggers ────────────────────────────────────────────────────
  /** Free barrier HP at the start of each wave */
  barrierBonusPerWave?: number;
  /** Free stacks at the start of each wave (Dreadlord, Ixara…) */
  freeStacksPerWave?: number;
  /** Ally HP restored at the start of each wave */
  allyHealPerWave?: number;

  // ── On-kill ──────────────────────────────────────────────────────────
  /** Extra gold per kill from the main ally */
  goldOnKill?: number;
  /** HP restored to the barrier per kill */
  barrierHealOnKill?: number;
  /** HP restored to the ally itself per kill */
  selfHealOnKill?: number;

  // ── Misc ─────────────────────────────────────────────────────────────
  /** Aura radius bonus for ally (Bard, Sylvanite…) in px */
  auraBonusRadius?: number;
  /** Extra chain lightning bounces (Runesmith) */
  chainBounces?: number;
  /** Extra duration added to applied debuffs (seconds) */
  debuffDurationBonus?: number;
  /** Special ability cooldown reduction (0.0–1.0) */
  specialCooldownReduction?: number;

  // ── Custom-logic effects ─────────────────────────────────────────────
  /**
   * Free tag for complex effects handled individually by the game loop.
   * Use when the effect doesn't fit the fields above.
   * E.g. 'mage_singularity', 'necro_lich_ascension', 'archer_last_stand'
   */
  customTag?: string;
}

export type SkillPath = 'root' | 'A' | 'B' | 'capstone';

export interface SkillNode {
  id:        string;
  name:      string;
  desc:      string;
  icon:      string;
  cost:      number;
  path:      SkillPath;
  /**
   * IDs of nodes that must be unlocked before this one.
   * Root nodes have no requires.
   */
  requires?: string[];
  /**
   * IDs of nodes that become locked when this one is unlocked.
   * Used for mutually exclusive choices.
   */
  excludes?: string[];
  effect:    SkillEffect;
}

export interface SkillTree {
  charType: string;
  nodes:    SkillNode[];
}

// ---------------------------------------------------------------------------
// Helper — builds requires array for linear paths
// ---------------------------------------------------------------------------
const req = (...ids: string[]): string[] => ids;

// ---------------------------------------------------------------------------
// Trees
// ---------------------------------------------------------------------------

export const SKILL_TREES: SkillTree[] = [

  // ════════════════════════════════════════════════════════════════════
  // MAGE
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'mage',
    nodes: [
      {
        id: 'sk_mage_root', icon: '🔮', cost: 1, path: 'root',
        get name() { return t('skill.sk_mage_root.name'); },
        get desc() { return t('skill.sk_mage_root.desc'); },
        effect: { damageBonus: 0.10 },
      },
      // ── Path A: Control/CC ───────────────────────────────────────
      {
        id: 'sk_mage_a1', icon: '❄️', cost: 1, path: 'A',
        requires: req('sk_mage_root'),
        get name() { return t('skill.sk_mage_a1.name'); },
        get desc() { return t('skill.sk_mage_a1.desc'); },
        effect: { onHitSlow: { amount: 0.15, duration: 1.5 } },
      },
      {
        id: 'sk_mage_a2', icon: '🧊', cost: 1, path: 'A',
        requires: req('sk_mage_a1'),
        get name() { return t('skill.sk_mage_a2.name'); },
        get desc() { return t('skill.sk_mage_a2.desc'); },
        effect: { debuffDurationBonus: 0.5 },
      },
      {
        id: 'sk_mage_a3', icon: '⏳', cost: 2, path: 'A',
        requires: req('sk_mage_a2'),
        excludes: ['sk_mage_b3'],
        get name() { return t('skill.sk_mage_a3.name'); },
        get desc() { return t('skill.sk_mage_a3.desc'); },
        effect: { customTag: 'mage_stun_immobilize' },
      },
      {
        id: 'sk_mage_a4', icon: '🔗', cost: 1, path: 'A',
        requires: req('sk_mage_a1'),
        get name() { return t('skill.sk_mage_a4.name'); },
        get desc() { return t('skill.sk_mage_a4.desc'); },
        effect: { customTag: 'mage_chain_slow' },
      },
      // ── Path B: Damage/Burst ────────────────────────────────────────
      {
        id: 'sk_mage_b1', icon: '⚡', cost: 1, path: 'B',
        requires: req('sk_mage_root'),
        get name() { return t('skill.sk_mage_b1.name'); },
        get desc() { return t('skill.sk_mage_b1.desc'); },
        effect: { customTag: 'mage_overload_timer' },
      },
      {
        id: 'sk_mage_b2', icon: '💥', cost: 1, path: 'B',
        requires: req('sk_mage_b1'),
        get name() { return t('skill.sk_mage_b2.name'); },
        get desc() { return t('skill.sk_mage_b2.desc'); },
        effect: { aoeBonus: 60, customTag: 'mage_kill_explode' },
      },
      {
        id: 'sk_mage_b3', icon: '🌌', cost: 2, path: 'B',
        requires: req('sk_mage_b2'),
        excludes: ['sk_mage_a3'],
        get name() { return t('skill.sk_mage_b3.name'); },
        get desc() { return t('skill.sk_mage_b3.desc'); },
        effect: { customTag: 'mage_singularity' },
      },
      {
        id: 'sk_mage_b4', icon: '🔁', cost: 1, path: 'B',
        requires: req('sk_mage_b1'),
        get name() { return t('skill.sk_mage_b4.name'); },
        get desc() { return t('skill.sk_mage_b4.desc'); },
        effect: { customTag: 'mage_arcane_echo' },
      },
      // ── Capstone ────────────────────────────────────────────────────
      {
        id: 'sk_mage_cap', icon: '🌠', cost: 2, path: 'capstone',
        requires: req('sk_mage_a3', 'sk_mage_b3'), // requires one of the two advanced pathss
        get name() { return t('skill.sk_mage_cap.name'); },
        get desc() { return t('skill.sk_mage_cap.desc'); },
        effect: { customTag: 'mage_overdrive' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // ARCHER — lifesteal no caminho B
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'archer',
    nodes: [
      {
        id: 'sk_archer_root', icon: '🦅', cost: 1, path: 'root',
        get name() { return t('skill.sk_archer_root.name'); },
        get desc() { return t('skill.sk_archer_root.desc'); },
        effect: { rangeBonus: 0.15 },
      },
      // ── Path A: Precision/Crits ────────────────────────────────────
      {
        id: 'sk_archer_a1', icon: '🎯', cost: 1, path: 'A',
        requires: req('sk_archer_root'),
        get name() { return t('skill.sk_archer_a1.name'); },
        get desc() { return t('skill.sk_archer_a1.desc'); },
        effect: { customTag: 'archer_crit_armor_shred' },
      },
      {
        id: 'sk_archer_a2', icon: '🧘', cost: 1, path: 'A',
        requires: req('sk_archer_a1'),
        get name() { return t('skill.sk_archer_a2.name'); },
        get desc() { return t('skill.sk_archer_a2.desc'); },
        effect: { customTag: 'archer_patience_crit' },
      },
      {
        id: 'sk_archer_a3', icon: '💀', cost: 2, path: 'A',
        requires: req('sk_archer_a2'),
        excludes: ['sk_archer_b3'],
        get name() { return t('skill.sk_archer_a3.name'); },
        get desc() { return t('skill.sk_archer_a3.desc'); },
        effect: { customTag: 'archer_double_crit_execute' },
      },
      {
        id: 'sk_archer_a4', icon: '⚔️', cost: 1, path: 'A',
        requires: req('sk_archer_a1'),
        get name() { return t('skill.sk_archer_a4.name'); },
        get desc() { return t('skill.sk_archer_a4.desc'); },
        effect: { critDmgMultiplier: 0.5 },
      },
      // ── Path B: Speed/Volume + Lifesteal ────────────────────
      {
        id: 'sk_archer_b1', icon: '💨', cost: 1, path: 'B',
        requires: req('sk_archer_root'),
        get name() { return t('skill.sk_archer_b1.name'); },
        get desc() { return t('skill.sk_archer_b1.desc'); },
        effect: { attackSpeedBonus: -0.15 },
      },
      {
        id: 'sk_archer_b2', icon: '🩸', cost: 1, path: 'B',
        requires: req('sk_archer_b1'),
        get name() { return t('skill.sk_archer_b2.name'); },
        get desc() { return t('skill.sk_archer_b2.desc'); },
        effect: { lifesteal: 0.05 },
      },
      {
        id: 'sk_archer_b3', icon: '🌧️', cost: 2, path: 'B',
        requires: req('sk_archer_b2'),
        excludes: ['sk_archer_a3'],
        get name() { return t('skill.sk_archer_b3.name'); },
        get desc() { return t('skill.sk_archer_b3.desc'); },
        effect: { lifesteal: 0.07, customTag: 'archer_arrow_spread' }, // acumula com b2: total 12%
      },
      {
        id: 'sk_archer_b4', icon: '🔥', cost: 1, path: 'B',
        requires: req('sk_archer_b1'),
        get name() { return t('skill.sk_archer_b4.name'); },
        get desc() { return t('skill.sk_archer_b4.desc'); },
        effect: { selfHealOnKill: 8 },
      },
      // ── Capstone ────────────────────────────────────────────────────
      {
        id: 'sk_archer_cap', icon: '☄️', cost: 2, path: 'capstone',
        requires: req('sk_archer_a3', 'sk_archer_b3'),
        get name() { return t('skill.sk_archer_cap.name'); },
        get desc() { return t('skill.sk_archer_cap.desc'); },
        effect: { customTag: 'archer_last_stand', lifesteal: 0.10 },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // WARLOCK — lifesteal no caminho B
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'warlock',
    nodes: [
      {
        id: 'sk_warlock_root', icon: '👁️', cost: 1, path: 'root',
        get name() { return t('skill.sk_warlock_root.name'); },
        get desc() { return t('skill.sk_warlock_root.desc'); },
        effect: { customTag: 'warlock_resist_shred' },
      },
      // ── Path A: Debuff/Control ───────────────────────────────────
      {
        id: 'sk_warlock_a1', icon: '🌀', cost: 1, path: 'A',
        requires: req('sk_warlock_root'),
        get name() { return t('skill.sk_warlock_a1.name'); },
        get desc() { return t('skill.sk_warlock_a1.desc'); },
        effect: { customTag: 'warlock_slow_atk_debuff' },
      },
      {
        id: 'sk_warlock_a2', icon: '🕸️', cost: 1, path: 'A',
        requires: req('sk_warlock_a1'),
        get name() { return t('skill.sk_warlock_a2.name'); },
        get desc() { return t('skill.sk_warlock_a2.desc'); },
        effect: { customTag: 'warlock_chain_slow' },
      },
      {
        id: 'sk_warlock_a3', icon: '🌑', cost: 2, path: 'A',
        requires: req('sk_warlock_a2'),
        excludes: ['sk_warlock_b3'],
        get name() { return t('skill.sk_warlock_a3.name'); },
        get desc() { return t('skill.sk_warlock_a3.desc'); },
        effect: { customTag: 'warlock_mass_hex' },
      },
      {
        id: 'sk_warlock_a4', icon: '⛓️', cost: 1, path: 'A',
        requires: req('sk_warlock_a1'),
        get name() { return t('skill.sk_warlock_a4.name'); },
        get desc() { return t('skill.sk_warlock_a4.desc'); },
        effect: { customTag: 'warlock_void_prison' },
      },
      // ── Path B: Drain/Lifesteal ───────────────────────────────────
      {
        id: 'sk_warlock_b1', icon: '💜', cost: 1, path: 'B',
        requires: req('sk_warlock_root'),
        get name() { return t('skill.sk_warlock_b1.name'); },
        get desc() { return t('skill.sk_warlock_b1.desc'); },
        effect: { lifesteal: 0.06 },
      },
      {
        id: 'sk_warlock_b2', icon: '🌘', cost: 1, path: 'B',
        requires: req('sk_warlock_b1'),
        get name() { return t('skill.sk_warlock_b2.name'); },
        get desc() { return t('skill.sk_warlock_b2.desc'); },
        effect: { customTag: 'warlock_dark_hunger' },
      },
      {
        id: 'sk_warlock_b3', icon: '🍖', cost: 2, path: 'B',
        requires: req('sk_warlock_b2'),
        excludes: ['sk_warlock_a3'],
        get name() { return t('skill.sk_warlock_b3.name'); },
        get desc() { return t('skill.sk_warlock_b3.desc'); },
        effect: { lifesteal: 0.08, barrierHealOnKill: 3 }, // acumula com b1: total 14%
      },
      {
        id: 'sk_warlock_b4', icon: '✨', cost: 1, path: 'B',
        requires: req('sk_warlock_b1'),
        get name() { return t('skill.sk_warlock_b4.name'); },
        get desc() { return t('skill.sk_warlock_b4.desc'); },
        effect: { goldOnKill: 1, customTag: 'warlock_gold_chance_25' },
      },
      // ── Capstone ────────────────────────────────────────────────────
      {
        id: 'sk_warlock_cap', icon: '🌀', cost: 2, path: 'capstone',
        requires: req('sk_warlock_a3', 'sk_warlock_b3'),
        get name() { return t('skill.sk_warlock_cap.name'); },
        get desc() { return t('skill.sk_warlock_cap.desc'); },
        effect: { customTag: 'warlock_void_portal' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // DRUID
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'druid',
    nodes: [
      {
        id: 'sk_druid_root', icon: '🌿', cost: 1, path: 'root',
        get name() { return t('skill.sk_druid_root.name'); },
        get desc() { return t('skill.sk_druid_root.desc'); },
        effect: { debuffDurationBonus: 0.2, customTag: 'druid_season_duration' },
      },
      {
        id: 'sk_druid_a1', icon: '🌳', cost: 1, path: 'A',
        requires: req('sk_druid_root'),
        get name() { return t('skill.sk_druid_a1.name'); },
        get desc() { return t('skill.sk_druid_a1.desc'); },
        effect: { debuffDurationBonus: 0.8, customTag: 'druid_rooted_dmg_amp' },
      },
      {
        id: 'sk_druid_a2', icon: '❄️', cost: 1, path: 'A',
        requires: req('sk_druid_a1'),
        get name() { return t('skill.sk_druid_a2.name'); },
        get desc() { return t('skill.sk_druid_a2.desc'); },
        effect: { customTag: 'druid_blizzard_spread' },
      },
      {
        id: 'sk_druid_a3', icon: '🌨️', cost: 2, path: 'A',
        requires: req('sk_druid_a2'),
        excludes: ['sk_druid_b3'],
        get name() { return t('skill.sk_druid_a3.name'); },
        get desc() { return t('skill.sk_druid_a3.desc'); },
        effect: { customTag: 'druid_eternal_winter' },
      },
      {
        id: 'sk_druid_a4', icon: '🌱', cost: 1, path: 'A',
        requires: req('sk_druid_a1'),
        get name() { return t('skill.sk_druid_a4.name'); },
        get desc() { return t('skill.sk_druid_a4.desc'); },
        effect: { customTag: 'druid_vine_surge' },
      },
      {
        id: 'sk_druid_b1', icon: '☀️', cost: 1, path: 'B',
        requires: req('sk_druid_root'),
        get name() { return t('skill.sk_druid_b1.name'); },
        get desc() { return t('skill.sk_druid_b1.desc'); },
        effect: { customTag: 'druid_solar_wrath' },
      },
      {
        id: 'sk_druid_b2', icon: '🌸', cost: 1, path: 'B',
        requires: req('sk_druid_b1'),
        get name() { return t('skill.sk_druid_b2.name'); },
        get desc() { return t('skill.sk_druid_b2.desc'); },
        effect: { customTag: 'druid_cycle_pulse' },
      },
      {
        id: 'sk_druid_b3', icon: '🔥', cost: 2, path: 'B',
        requires: req('sk_druid_b2'),
        excludes: ['sk_druid_a3'],
        get name() { return t('skill.sk_druid_b3.name'); },
        get desc() { return t('skill.sk_druid_b3.desc'); },
        effect: { customTag: 'druid_wildfire' },
      },
      {
        id: 'sk_druid_b4', icon: '🍀', cost: 1, path: 'B',
        requires: req('sk_druid_b1'),
        get name() { return t('skill.sk_druid_b4.name'); },
        get desc() { return t('skill.sk_druid_b4.desc'); },
        effect: { goldOnKill: 1, customTag: 'druid_gold_chance_30' },
      },
      {
        id: 'sk_druid_cap', icon: '🌍', cost: 2, path: 'capstone',
        requires: req('sk_druid_a3', 'sk_druid_b3'),
        get name() { return t('skill.sk_druid_cap.name'); },
        get desc() { return t('skill.sk_druid_cap.desc'); },
        effect: { customTag: 'druid_primal_convergence' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // NECROMANCER — lifesteal via undead no caminho A
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'necromancer',
    nodes: [
      {
        id: 'sk_necro_root', icon: '💀', cost: 1, path: 'root',
        get name() { return t('skill.sk_necro_root.name'); },
        get desc() { return t('skill.sk_necro_root.desc'); },
        effect: { customTag: 'necro_undead_buff' },
      },
      // ── Path A: Army + Undead Lifesteal ───────────────────
      {
        id: 'sk_necro_a1', icon: '💥', cost: 1, path: 'A',
        requires: req('sk_necro_root'),
        get name() { return t('skill.sk_necro_a1.name'); },
        get desc() { return t('skill.sk_necro_a1.desc'); },
        effect: { aoeBonus: 80, customTag: 'necro_undead_explode' },
      },
      {
        id: 'sk_necro_a2', icon: '🩸', cost: 1, path: 'A',
        requires: req('sk_necro_a1'),
        get name() { return t('skill.sk_necro_a2.name'); },
        get desc() { return t('skill.sk_necro_a2.desc'); },
        effect: { lifesteal: 0.08, customTag: 'necro_undead_lifesteal' },
      },
      {
        id: 'sk_necro_a3', icon: '🧟', cost: 2, path: 'A',
        requires: req('sk_necro_a2'),
        excludes: ['sk_necro_b3'],
        get name() { return t('skill.sk_necro_a3.name'); },
        get desc() { return t('skill.sk_necro_a3.desc'); },
        effect: { lifesteal: 0.07, customTag: 'necro_overlord' }, // acumula com a2: total 15%
      },
      {
        id: 'sk_necro_a4', icon: '🌾', cost: 1, path: 'A',
        requires: req('sk_necro_a1'),
        get name() { return t('skill.sk_necro_a4.name'); },
        get desc() { return t('skill.sk_necro_a4.desc'); },
        effect: { customTag: 'necro_soul_harvest' },
      },
      // ── Path B: Curse/Debuff ───────────────────────────────────
      {
        id: 'sk_necro_b1', icon: '☠️', cost: 1, path: 'B',
        requires: req('sk_necro_root'),
        get name() { return t('skill.sk_necro_b1.name'); },
        get desc() { return t('skill.sk_necro_b1.desc'); },
        effect: { customTag: 'necro_curse_spread' },
      },
      {
        id: 'sk_necro_b2', icon: '⚰️', cost: 1, path: 'B',
        requires: req('sk_necro_b1'),
        get name() { return t('skill.sk_necro_b2.name'); },
        get desc() { return t('skill.sk_necro_b2.desc'); },
        effect: { customTag: 'necro_death_mark_amp' },
      },
      {
        id: 'sk_necro_b3', icon: '🦠', cost: 2, path: 'B',
        requires: req('sk_necro_b2'),
        excludes: ['sk_necro_a3'],
        get name() { return t('skill.sk_necro_b3.name'); },
        get desc() { return t('skill.sk_necro_b3.desc'); },
        effect: { customTag: 'necro_plague_bearer', debuffDurationBonus: 1.0 },
      },
      {
        id: 'sk_necro_b4', icon: '💰', cost: 1, path: 'B',
        requires: req('sk_necro_b1'),
        get name() { return t('skill.sk_necro_b4.name'); },
        get desc() { return t('skill.sk_necro_b4.desc'); },
        effect: { goldOnKill: 1, customTag: 'necro_cursed_gold' },
      },
      {
        id: 'sk_necro_cap', icon: '👑', cost: 2, path: 'capstone',
        requires: req('sk_necro_a3', 'sk_necro_b3'),
        get name() { return t('skill.sk_necro_cap.name'); },
        get desc() { return t('skill.sk_necro_cap.desc'); },
        effect: { customTag: 'necro_lich_ascension' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // CLERIC
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'cleric',
    nodes: [
      {
        id: 'sk_cleric_root', icon: '✨', cost: 1, path: 'root',
        get name() { return t('skill.sk_cleric_root.name'); },
        get desc() { return t('skill.sk_cleric_root.desc'); },
        effect: { auraBonusRadius: 120, customTag: 'cleric_holy_ground' },
      },
      {
        id: 'sk_cleric_a1', icon: '💛', cost: 1, path: 'A',
        requires: req('sk_cleric_root'),
        get name() { return t('skill.sk_cleric_a1.name'); },
        get desc() { return t('skill.sk_cleric_a1.desc'); },
        effect: { customTag: 'cleric_heal_amp_20' },
      },
      {
        id: 'sk_cleric_a2', icon: '🛡️', cost: 1, path: 'A',
        requires: req('sk_cleric_a1'),
        get name() { return t('skill.sk_cleric_a2.name'); },
        get desc() { return t('skill.sk_cleric_a2.desc'); },
        effect: { customTag: 'cleric_overheal_shield' },
      },
      {
        id: 'sk_cleric_a3', icon: '🌟', cost: 2, path: 'A',
        requires: req('sk_cleric_a2'),
        excludes: ['sk_cleric_b3'],
        get name() { return t('skill.sk_cleric_a3.name'); },
        get desc() { return t('skill.sk_cleric_a3.desc'); },
        effect: { customTag: 'cleric_mass_renewal' },
      },
      {
        id: 'sk_cleric_a4', icon: '🔆', cost: 1, path: 'A',
        requires: req('sk_cleric_a1'),
        get name() { return t('skill.sk_cleric_a4.name'); },
        get desc() { return t('skill.sk_cleric_a4.desc'); },
        effect: { customTag: 'cleric_post_heal_shield' },
      },
      {
        id: 'sk_cleric_b1', icon: '⚡', cost: 1, path: 'B',
        requires: req('sk_cleric_root'),
        get name() { return t('skill.sk_cleric_b1.name'); },
        get desc() { return t('skill.sk_cleric_b1.desc'); },
        effect: { customTag: 'cleric_smite' },
      },
      {
        id: 'sk_cleric_b2', icon: '🔥', cost: 1, path: 'B',
        requires: req('sk_cleric_b1'),
        get name() { return t('skill.sk_cleric_b2.name'); },
        get desc() { return t('skill.sk_cleric_b2.desc'); },
        effect: { customTag: 'cleric_retribution' },
      },
      {
        id: 'sk_cleric_b3', icon: '⚖️', cost: 2, path: 'B',
        requires: req('sk_cleric_b2'),
        excludes: ['sk_cleric_a3'],
        get name() { return t('skill.sk_cleric_b3.name'); },
        get desc() { return t('skill.sk_cleric_b3.desc'); },
        effect: { customTag: 'cleric_judgment' },
      },
      {
        id: 'sk_cleric_b4', icon: '🕊️', cost: 1, path: 'B',
        requires: req('sk_cleric_b1'),
        get name() { return t('skill.sk_cleric_b4.name'); },
        get desc() { return t('skill.sk_cleric_b4.desc'); },
        effect: { barrierBonusPerWave: 5, customTag: 'cleric_consecration' },
      },
      {
        id: 'sk_cleric_cap', icon: '👼', cost: 2, path: 'capstone',
        requires: req('sk_cleric_a3', 'sk_cleric_b3'),
        get name() { return t('skill.sk_cleric_cap.name'); },
        get desc() { return t('skill.sk_cleric_cap.desc'); },
        effect: { customTag: 'cleric_fallen_seraph' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // PALADIN
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'paladin',
    nodes: [
      {
        id: 'sk_paladin_root', icon: '⚔️', cost: 1, path: 'root',
        get name() { return t('skill.sk_paladin_root.name'); },
        get desc() { return t('skill.sk_paladin_root.desc'); },
        effect: { hpBonus: 0.20 },
      },
      {
        id: 'sk_paladin_a1', icon: '🛡️', cost: 1, path: 'A',
        requires: req('sk_paladin_root'),
        get name() { return t('skill.sk_paladin_a1.name'); },
        get desc() { return t('skill.sk_paladin_a1.desc'); },
        effect: { customTag: 'paladin_shield_wall' },
      },
      {
        id: 'sk_paladin_a2', icon: '🏰', cost: 1, path: 'A',
        requires: req('sk_paladin_a1'),
        get name() { return t('skill.sk_paladin_a2.name'); },
        get desc() { return t('skill.sk_paladin_a2.desc'); },
        effect: { customTag: 'paladin_fortress' },
      },
      {
        id: 'sk_paladin_a3', icon: '🗼', cost: 2, path: 'A',
        requires: req('sk_paladin_a2'),
        excludes: ['sk_paladin_b3'],
        get name() { return t('skill.sk_paladin_a3.name'); },
        get desc() { return t('skill.sk_paladin_a3.desc'); },
        effect: { customTag: 'paladin_last_bastion' },
      },
      {
        id: 'sk_paladin_a4', icon: '🔰', cost: 1, path: 'A',
        requires: req('sk_paladin_a1'),
        get name() { return t('skill.sk_paladin_a4.name'); },
        get desc() { return t('skill.sk_paladin_a4.desc'); },
        effect: { customTag: 'paladin_bulwark_15' },
      },
      {
        id: 'sk_paladin_b1', icon: '🔥', cost: 1, path: 'B',
        requires: req('sk_paladin_root'),
        get name() { return t('skill.sk_paladin_b1.name'); },
        get desc() { return t('skill.sk_paladin_b1.desc'); },
        effect: { damageBonus: 0.30, customTag: 'paladin_sacred_flame' },
      },
      {
        id: 'sk_paladin_b2', icon: '✝️', cost: 1, path: 'B',
        requires: req('sk_paladin_b1'),
        get name() { return t('skill.sk_paladin_b2.name'); },
        get desc() { return t('skill.sk_paladin_b2.desc'); },
        effect: { customTag: 'paladin_crusader_zeal' },
      },
      {
        id: 'sk_paladin_b3', icon: '💫', cost: 2, path: 'B',
        requires: req('sk_paladin_b2'),
        excludes: ['sk_paladin_a3'],
        get name() { return t('skill.sk_paladin_b3.name'); },
        get desc() { return t('skill.sk_paladin_b3.desc'); },
        effect: { customTag: 'paladin_divine_charge' },
      },
      {
        id: 'sk_paladin_b4', icon: '🗡️', cost: 1, path: 'B',
        requires: req('sk_paladin_b1'),
        get name() { return t('skill.sk_paladin_b4.name'); },
        get desc() { return t('skill.sk_paladin_b4.desc'); },
        effect: { customTag: 'paladin_blessed_edge' },
      },
      {
        id: 'sk_paladin_cap', icon: '👑', cost: 2, path: 'capstone',
        requires: req('sk_paladin_a3', 'sk_paladin_b3'),
        get name() { return t('skill.sk_paladin_cap.name'); },
        get desc() { return t('skill.sk_paladin_cap.desc'); },
        effect: { customTag: 'paladin_avatars_oath' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // PRIEST
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'priest',
    nodes: [
      {
        id: 'sk_priest_root', icon: '💚', cost: 1, path: 'root',
        get name() { return t('skill.sk_priest_root.name'); },
        get desc() { return t('skill.sk_priest_root.desc'); },
        effect: { customTag: 'priest_bonus_heal_5' },
      },
      {
        id: 'sk_priest_a1', icon: '🍃', cost: 1, path: 'A',
        requires: req('sk_priest_root'),
        get name() { return t('skill.sk_priest_a1.name'); },
        get desc() { return t('skill.sk_priest_a1.desc'); },
        effect: { debuffDurationBonus: 3, customTag: 'priest_hot_duration' },
      },
      {
        id: 'sk_priest_a2', icon: '💧', cost: 1, path: 'A',
        requires: req('sk_priest_a1'),
        get name() { return t('skill.sk_priest_a2.name'); },
        get desc() { return t('skill.sk_priest_a2.desc'); },
        effect: { customTag: 'priest_auto_hot' },
      },
      {
        id: 'sk_priest_a3', icon: '🌊', cost: 2, path: 'A',
        requires: req('sk_priest_a2'),
        excludes: ['sk_priest_b3'],
        get name() { return t('skill.sk_priest_a3.name'); },
        get desc() { return t('skill.sk_priest_a3.desc'); },
        effect: { customTag: 'priest_life_weave' },
      },
      {
        id: 'sk_priest_a4', icon: '🌿', cost: 1, path: 'A',
        requires: req('sk_priest_a1'),
        get name() { return t('skill.sk_priest_a4.name'); },
        get desc() { return t('skill.sk_priest_a4.desc'); },
        effect: { customTag: 'priest_hot_dmg_redux' },
      },
      {
        id: 'sk_priest_b1', icon: '🙏', cost: 1, path: 'B',
        requires: req('sk_priest_root'),
        get name() { return t('skill.sk_priest_b1.name'); },
        get desc() { return t('skill.sk_priest_b1.desc'); },
        effect: { customTag: 'priest_desperate_prayer' },
      },
      {
        id: 'sk_priest_b2', icon: '🚨', cost: 1, path: 'B',
        requires: req('sk_priest_b1'),
        get name() { return t('skill.sk_priest_b2.name'); },
        get desc() { return t('skill.sk_priest_b2.desc'); },
        effect: { customTag: 'priest_emergency_rites' },
      },
      {
        id: 'sk_priest_b3', icon: '✨', cost: 2, path: 'B',
        requires: req('sk_priest_b2'),
        excludes: ['sk_priest_a3'],
        get name() { return t('skill.sk_priest_b3.name'); },
        get desc() { return t('skill.sk_priest_b3.desc'); },
        effect: { customTag: 'priest_resurrection' },
      },
      {
        id: 'sk_priest_b4', icon: '💥', cost: 1, path: 'B',
        requires: req('sk_priest_b1'),
        get name() { return t('skill.sk_priest_b4.name'); },
        get desc() { return t('skill.sk_priest_b4.desc'); },
        effect: { customTag: 'priest_nova_amp_8' },
      },
      {
        id: 'sk_priest_cap', icon: '🌈', cost: 2, path: 'capstone',
        requires: req('sk_priest_a3', 'sk_priest_b3'),
        get name() { return t('skill.sk_priest_cap.name'); },
        get desc() { return t('skill.sk_priest_cap.desc'); },
        effect: { customTag: 'priest_miracle_worker', allyHealPerWave: 9999 },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // BARD
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'bard',
    nodes: [
      {
        id: 'sk_bard_root', icon: '🎵', cost: 1, path: 'root',
        get name() { return t('skill.sk_bard_root.name'); },
        get desc() { return t('skill.sk_bard_root.desc'); },
        effect: { auraBonusRadius: 30 },
      },
      {
        id: 'sk_bard_a1', icon: '🎶', cost: 1, path: 'A',
        requires: req('sk_bard_root'),
        get name() { return t('skill.sk_bard_a1.name'); },
        get desc() { return t('skill.sk_bard_a1.desc'); },
        effect: { damageBonus: 0.05 },
      },
      {
        id: 'sk_bard_a2', icon: '🔔', cost: 1, path: 'A',
        requires: req('sk_bard_a1'),
        get name() { return t('skill.sk_bard_a2.name'); },
        get desc() { return t('skill.sk_bard_a2.desc'); },
        effect: { specialCooldownReduction: 0.15 },
      },
      {
        id: 'sk_bard_a3', icon: '📈', cost: 2, path: 'A',
        requires: req('sk_bard_a2'),
        excludes: ['sk_bard_b3'],
        get name() { return t('skill.sk_bard_a3.name'); },
        get desc() { return t('skill.sk_bard_a3.desc'); },
        effect: { customTag: 'bard_crescendo' },
      },
      {
        id: 'sk_bard_a4', icon: '📜', cost: 1, path: 'A',
        requires: req('sk_bard_a1'),
        get name() { return t('skill.sk_bard_a4.name'); },
        get desc() { return t('skill.sk_bard_a4.desc'); },
        effect: { customTag: 'bard_early_aura' },
      },
      {
        id: 'sk_bard_b1', icon: '🎸', cost: 1, path: 'B',
        requires: req('sk_bard_root'),
        get name() { return t('skill.sk_bard_b1.name'); },
        get desc() { return t('skill.sk_bard_b1.desc'); },
        effect: { onHitSlow: { amount: 0.20, duration: 3 }, customTag: 'bard_dissonance' },
      },
      {
        id: 'sk_bard_b2', icon: '📣', cost: 1, path: 'B',
        requires: req('sk_bard_b1'),
        get name() { return t('skill.sk_bard_b2.name'); },
        get desc() { return t('skill.sk_bard_b2.desc'); },
        effect: { customTag: 'bard_battle_cry' },
      },
      {
        id: 'sk_bard_b3', icon: '💀', cost: 2, path: 'B',
        requires: req('sk_bard_b2'),
        excludes: ['sk_bard_a3'],
        get name() { return t('skill.sk_bard_b3.name'); },
        get desc() { return t('skill.sk_bard_b3.desc'); },
        effect: { aoeBonus: 80, damageBonus: 2.0, customTag: 'bard_death_metal' },
      },
      {
        id: 'sk_bard_b4', icon: '🎤', cost: 1, path: 'B',
        requires: req('sk_bard_b1'),
        get name() { return t('skill.sk_bard_b4.name'); },
        get desc() { return t('skill.sk_bard_b4.desc'); },
        effect: { customTag: 'bard_encore_effect' },
      },
      {
        id: 'sk_bard_cap', icon: '🌠', cost: 2, path: 'capstone',
        requires: req('sk_bard_a3', 'sk_bard_b3'),
        get name() { return t('skill.sk_bard_cap.name'); },
        get desc() { return t('skill.sk_bard_cap.desc'); },
        effect: { customTag: 'bard_magnum_opus' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // RUNESMITH
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'runesmith',
    nodes: [
      {
        id: 'sk_rune_root', icon: '⚡', cost: 1, path: 'root',
        get name() { return t('skill.sk_rune_root.name'); },
        get desc() { return t('skill.sk_rune_root.desc'); },
        effect: { chainBounces: 1 },
      },
      {
        id: 'sk_rune_a1', icon: '🌩️', cost: 1, path: 'A',
        requires: req('sk_rune_root'),
        get name() { return t('skill.sk_rune_a1.name'); },
        get desc() { return t('skill.sk_rune_a1.desc'); },
        effect: { customTag: 'rune_escalating_chain' },
      },
      {
        id: 'sk_rune_a2', icon: '🔋', cost: 1, path: 'A',
        requires: req('sk_rune_a1'),
        get name() { return t('skill.sk_rune_a2.name'); },
        get desc() { return t('skill.sk_rune_a2.desc'); },
        effect: { attackSpeedBonus: -0.20 },
      },
      {
        id: 'sk_rune_a3', icon: '🌪️', cost: 2, path: 'A',
        requires: req('sk_rune_a2'),
        excludes: ['sk_rune_b3'],
        get name() { return t('skill.sk_rune_a3.name'); },
        get desc() { return t('skill.sk_rune_a3.desc'); },
        effect: { customTag: 'rune_auto_chain' },
      },
      {
        id: 'sk_rune_a4', icon: '⚡', cost: 1, path: 'A',
        requires: req('sk_rune_a1'),
        get name() { return t('skill.sk_rune_a4.name'); },
        get desc() { return t('skill.sk_rune_a4.desc'); },
        effect: { customTag: 'rune_residual_charge' },
      },
      {
        id: 'sk_rune_b1', icon: '🔺', cost: 1, path: 'B',
        requires: req('sk_rune_root'),
        get name() { return t('skill.sk_rune_b1.name'); },
        get desc() { return t('skill.sk_rune_b1.desc'); },
        effect: { aoeBonus: 30 },
      },
      {
        id: 'sk_rune_b2', icon: '🔆', cost: 1, path: 'B',
        requires: req('sk_rune_b1'),
        get name() { return t('skill.sk_rune_b2.name'); },
        get desc() { return t('skill.sk_rune_b2.desc'); },
        effect: { debuffDurationBonus: 3, customTag: 'rune_sigil_duration' },
      },
      {
        id: 'sk_rune_b3', icon: '💥', cost: 2, path: 'B',
        requires: req('sk_rune_b2'),
        excludes: ['sk_rune_a3'],
        get name() { return t('skill.sk_rune_b3.name'); },
        get desc() { return t('skill.sk_rune_b3.desc'); },
        effect: { customTag: 'rune_cascade' },
      },
      {
        id: 'sk_rune_b4', icon: '🕸️', cost: 1, path: 'B',
        requires: req('sk_rune_b1'),
        get name() { return t('skill.sk_rune_b4.name'); },
        get desc() { return t('skill.sk_rune_b4.desc'); },
        effect: { onHitSlow: { amount: 0.30, duration: 2 }, customTag: 'rune_static_prison' },
      },
      {
        id: 'sk_rune_cap', icon: '🌩️', cost: 2, path: 'capstone',
        requires: req('sk_rune_a3', 'sk_rune_b3'),
        get name() { return t('skill.sk_rune_cap.name'); },
        get desc() { return t('skill.sk_rune_cap.desc'); },
        effect: { customTag: 'rune_storm_omega' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // SYLVANITE
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'sylvanite',
    nodes: [
      {
        id: 'sk_sylva_root', icon: '🌺', cost: 1, path: 'root',
        get name() { return t('skill.sk_sylva_root.name'); },
        get desc() { return t('skill.sk_sylva_root.desc'); },
        effect: { onHitPoison: { chance: 1.0, extraStacks: 1 } },
      },
      {
        id: 'sk_sylva_a1', icon: '🧬', cost: 1, path: 'A',
        requires: req('sk_sylva_root'),
        get name() { return t('skill.sk_sylva_a1.name'); },
        get desc() { return t('skill.sk_sylva_a1.desc'); },
        effect: { customTag: 'sylva_poison_tick_speed' },
      },
      {
        id: 'sk_sylva_a2', icon: '💨', cost: 1, path: 'A',
        requires: req('sk_sylva_a1'),
        get name() { return t('skill.sk_sylva_a2.name'); },
        get desc() { return t('skill.sk_sylva_a2.desc'); },
        effect: { customTag: 'sylva_poison_spread' },
      },
      {
        id: 'sk_sylva_a3', icon: '☣️', cost: 2, path: 'A',
        requires: req('sk_sylva_a2'),
        excludes: ['sk_sylva_b3'],
        get name() { return t('skill.sk_sylva_a3.name'); },
        get desc() { return t('skill.sk_sylva_a3.desc'); },
        effect: { aoeBonus: 100, customTag: 'sylva_death_explode' },
      },
      {
        id: 'sk_sylva_a4', icon: '🧪', cost: 1, path: 'A',
        requires: req('sk_sylva_a1'),
        get name() { return t('skill.sk_sylva_a4.name'); },
        get desc() { return t('skill.sk_sylva_a4.desc'); },
        effect: { onHitSlow: { amount: 0.20, duration: 0 }, customTag: 'sylva_neuro' },
      },
      {
        id: 'sk_sylva_b1', icon: '🌳', cost: 1, path: 'B',
        requires: req('sk_sylva_root'),
        get name() { return t('skill.sk_sylva_b1.name'); },
        get desc() { return t('skill.sk_sylva_b1.desc'); },
        effect: { customTag: 'sylva_grove_regen_2' },
      },
      {
        id: 'sk_sylva_b2', icon: '🌿', cost: 1, path: 'B',
        requires: req('sk_sylva_b1'),
        get name() { return t('skill.sk_sylva_b2.name'); },
        get desc() { return t('skill.sk_sylva_b2.desc'); },
        effect: { auraBonusRadius: 40 },
      },
      {
        id: 'sk_sylva_b3', icon: '💚', cost: 2, path: 'B',
        requires: req('sk_sylva_b2'),
        excludes: ['sk_sylva_a3'],
        get name() { return t('skill.sk_sylva_b3.name'); },
        get desc() { return t('skill.sk_sylva_b3.desc'); },
        effect: { allyHealPerWave: 5, customTag: 'sylva_heart_forest' },
      },
      {
        id: 'sk_sylva_b4', icon: '🤝', cost: 1, path: 'B',
        requires: req('sk_sylva_b1'),
        get name() { return t('skill.sk_sylva_b4.name'); },
        get desc() { return t('skill.sk_sylva_b4.desc'); },
        effect: { customTag: 'sylva_symbiosis' },
      },
      {
        id: 'sk_sylva_cap', icon: '🌍', cost: 2, path: 'capstone',
        requires: req('sk_sylva_a3', 'sk_sylva_b3'),
        get name() { return t('skill.sk_sylva_cap.name'); },
        get desc() { return t('skill.sk_sylva_cap.desc'); },
        effect: { customTag: 'sylva_world_poison' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // DREADLORD — lifesteal no caminho A
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'dreadlord',
    nodes: [
      {
        id: 'sk_dread_root', icon: '🌑', cost: 1, path: 'root',
        get name() { return t('skill.sk_dread_root.name'); },
        get desc() { return t('skill.sk_dread_root.desc'); },
        effect: { freeStacksPerWave: 3 },
      },
      {
        id: 'sk_dread_a1', icon: '🍖', cost: 1, path: 'A',
        requires: req('sk_dread_root'),
        get name() { return t('skill.sk_dread_a1.name'); },
        get desc() { return t('skill.sk_dread_a1.desc'); },
        effect: { customTag: 'dread_fast_stacks' },
      },
      {
        id: 'sk_dread_a2', icon: '🩸', cost: 1, path: 'A',
        requires: req('sk_dread_a1'),
        get name() { return t('skill.sk_dread_a2.name'); },
        get desc() { return t('skill.sk_dread_a2.desc'); },
        effect: { lifesteal: 0.07, customTag: 'dread_conditional_lifesteal' },
      },
      {
        id: 'sk_dread_a3', icon: '👁️', cost: 2, path: 'A',
        requires: req('sk_dread_a2'),
        excludes: ['sk_dread_b3'],
        get name() { return t('skill.sk_dread_a3.name'); },
        get desc() { return t('skill.sk_dread_a3.desc'); },
        effect: { lifesteal: 0.08, damageBonus: 0.50, customTag: 'dread_void_form' }, // acumula: total 15%
      },
      {
        id: 'sk_dread_a4', icon: '⬛', cost: 1, path: 'A',
        requires: req('sk_dread_a1'),
        get name() { return t('skill.sk_dread_a4.name'); },
        get desc() { return t('skill.sk_dread_a4.desc'); },
        effect: { barrierHealOnKill: 3, customTag: 'dread_consuming_dark' },
      },
      {
        id: 'sk_dread_b1', icon: '🌘', cost: 1, path: 'B',
        requires: req('sk_dread_root'),
        get name() { return t('skill.sk_dread_b1.name'); },
        get desc() { return t('skill.sk_dread_b1.desc'); },
        effect: { specialCooldownReduction: 0.15 },
      },
      {
        id: 'sk_dread_b2', icon: '💥', cost: 1, path: 'B',
        requires: req('sk_dread_b1'),
        get name() { return t('skill.sk_dread_b2.name'); },
        get desc() { return t('skill.sk_dread_b2.desc'); },
        effect: { aoeBonus: 120, customTag: 'dread_dark_nova' },
      },
      {
        id: 'sk_dread_b3', icon: '🌑', cost: 2, path: 'B',
        requires: req('sk_dread_b2'),
        excludes: ['sk_dread_a3'],
        get name() { return t('skill.sk_dread_b3.name'); },
        get desc() { return t('skill.sk_dread_b3.desc'); },
        effect: { debuffDurationBonus: 2, customTag: 'dread_total_eclipse' },
      },
      {
        id: 'sk_dread_b4', icon: '💀', cost: 1, path: 'B',
        requires: req('sk_dread_b1'),
        get name() { return t('skill.sk_dread_b4.name'); },
        get desc() { return t('skill.sk_dread_b4.desc'); },
        effect: { customTag: 'dread_void_reaper' },
      },
      {
        id: 'sk_dread_cap', icon: '🌊', cost: 2, path: 'capstone',
        requires: req('sk_dread_a3', 'sk_dread_b3'),
        get name() { return t('skill.sk_dread_cap.name'); },
        get desc() { return t('skill.sk_dread_cap.desc'); },
        effect: { customTag: 'dread_apocalyptic_tide' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // JESTER
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'jester',
    nodes: [
      {
        id: 'sk_jester_root', icon: '🎲', cost: 1, path: 'root',
        get name() { return t('skill.sk_jester_root.name'); },
        get desc() { return t('skill.sk_jester_root.desc'); },
        effect: { customTag: 'jester_confuse_chance_10' },
      },
      {
        id: 'sk_jester_a1', icon: '🌀', cost: 1, path: 'A',
        requires: req('sk_jester_root'),
        get name() { return t('skill.sk_jester_a1.name'); },
        get desc() { return t('skill.sk_jester_a1.desc'); },
        effect: { customTag: 'jester_madness_spiral' },
      },
      {
        id: 'sk_jester_a2', icon: '🎭', cost: 1, path: 'A',
        requires: req('sk_jester_a1'),
        get name() { return t('skill.sk_jester_a2.name'); },
        get desc() { return t('skill.sk_jester_a2.desc'); },
        effect: { customTag: 'jester_confuse_spread' },
      },
      {
        id: 'sk_jester_a3', icon: '🔥', cost: 2, path: 'A',
        requires: req('sk_jester_a2'),
        excludes: ['sk_jester_b3'],
        get name() { return t('skill.sk_jester_a3.name'); },
        get desc() { return t('skill.sk_jester_a3.desc'); },
        effect: { customTag: 'jester_pandemonium' },
      },
      {
        id: 'sk_jester_a4', icon: '🃏', cost: 1, path: 'A',
        requires: req('sk_jester_a1'),
        get name() { return t('skill.sk_jester_a4.name'); },
        get desc() { return t('skill.sk_jester_a4.desc'); },
        effect: { customTag: 'jester_wild_trick' },
      },
      {
        id: 'sk_jester_b1', icon: '🍀', cost: 1, path: 'B',
        requires: req('sk_jester_root'),
        get name() { return t('skill.sk_jester_b1.name'); },
        get desc() { return t('skill.sk_jester_b1.desc'); },
        effect: { customTag: 'jester_lucky_draw' },
      },
      {
        id: 'sk_jester_b2', icon: '♠️', cost: 1, path: 'B',
        requires: req('sk_jester_b1'),
        get name() { return t('skill.sk_jester_b2.name'); },
        get desc() { return t('skill.sk_jester_b2.desc'); },
        effect: { customTag: 'jester_house_rules' },
      },
      {
        id: 'sk_jester_b3', icon: '🃏', cost: 2, path: 'B',
        requires: req('sk_jester_b2'),
        excludes: ['sk_jester_a3'],
        get name() { return t('skill.sk_jester_b3.name'); },
        get desc() { return t('skill.sk_jester_b3.desc'); },
        effect: { customTag: 'jester_jokers_hand' },
      },
      {
        id: 'sk_jester_b4', icon: '🎴', cost: 1, path: 'B',
        requires: req('sk_jester_b1'),
        get name() { return t('skill.sk_jester_b4.name'); },
        get desc() { return t('skill.sk_jester_b4.desc'); },
        effect: { customTag: 'jester_card_shark' },
      },
      {
        id: 'sk_jester_cap', icon: '🎆', cost: 2, path: 'capstone',
        requires: req('sk_jester_a3', 'sk_jester_b3'),
        get name() { return t('skill.sk_jester_cap.name'); },
        get desc() { return t('skill.sk_jester_cap.desc'); },
        effect: { customTag: 'jester_grand_chaos' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // VEX — lifesteal já existente, aprofundado na árvore
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'vex',
    nodes: [
      {
        id: 'sk_vex_root', icon: '🗡️', cost: 1, path: 'root',
        get name() { return t('skill.sk_vex_root.name'); },
        get desc() { return t('skill.sk_vex_root.desc'); },
        effect: { onHitBleed: { chance: 0.10, dps: 50, duration: 3 } },
      },
      {
        id: 'sk_vex_a1', icon: '🩸', cost: 1, path: 'A',
        requires: req('sk_vex_root'),
        get name() { return t('skill.sk_vex_a1.name'); },
        get desc() { return t('skill.sk_vex_a1.desc'); },
        effect: { customTag: 'vex_deep_cut' },
      },
      {
        id: 'sk_vex_a2', icon: '💉', cost: 1, path: 'A',
        requires: req('sk_vex_a1'),
        get name() { return t('skill.sk_vex_a2.name'); },
        get desc() { return t('skill.sk_vex_a2.desc'); },
        effect: { customTag: 'vex_hemorrhage' },
      },
      {
        id: 'sk_vex_a3', icon: '☠️', cost: 2, path: 'A',
        requires: req('sk_vex_a2'),
        excludes: ['sk_vex_b3'],
        get name() { return t('skill.sk_vex_a3.name'); },
        get desc() { return t('skill.sk_vex_a3.desc'); },
        effect: { onHitSlow: { amount: 0.40, duration: 0 }, customTag: 'vex_exsanguinate' },
      },
      {
        id: 'sk_vex_a4', icon: '💗', cost: 1, path: 'A',
        requires: req('sk_vex_a1'),
        get name() { return t('skill.sk_vex_a4.name'); },
        get desc() { return t('skill.sk_vex_a4.desc'); },
        effect: { lifesteal: 0.0, selfHealOnKill: 0, customTag: 'vex_life_tap' },
        // lifesteal per bleed tick is handled as customTag
      },
      {
        id: 'sk_vex_b1', icon: '💨', cost: 1, path: 'B',
        requires: req('sk_vex_root'),
        get name() { return t('skill.sk_vex_b1.name'); },
        get desc() { return t('skill.sk_vex_b1.desc'); },
        effect: { specialCooldownReduction: 0.15, customTag: 'vex_flash_step' },
      },
      {
        id: 'sk_vex_b2', icon: '👥', cost: 1, path: 'B',
        requires: req('sk_vex_b1'),
        get name() { return t('skill.sk_vex_b2.name'); },
        get desc() { return t('skill.sk_vex_b2.desc'); },
        effect: { customTag: 'vex_afterimage' },
      },
      {
        id: 'sk_vex_b3', icon: '🌑', cost: 2, path: 'B',
        requires: req('sk_vex_b2'),
        excludes: ['sk_vex_a3'],
        get name() { return t('skill.sk_vex_b3.name'); },
        get desc() { return t('skill.sk_vex_b3.desc'); },
        effect: { customTag: 'vex_death_blink' },
      },
      {
        id: 'sk_vex_b4', icon: '🔥', cost: 1, path: 'B',
        requires: req('sk_vex_b1'),
        get name() { return t('skill.sk_vex_b4.name'); },
        get desc() { return t('skill.sk_vex_b4.desc'); },
        effect: { customTag: 'vex_predator_high' },
      },
      {
        id: 'sk_vex_cap', icon: '👻', cost: 2, path: 'capstone',
        requires: req('sk_vex_a3', 'sk_vex_b3'),
        get name() { return t('skill.sk_vex_cap.name'); },
        get desc() { return t('skill.sk_vex_cap.desc'); },
        effect: { customTag: 'vex_phantom_assassin' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // ZYLVARA — lifesteal no caminho B
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'zylvara',
    nodes: [
      {
        id: 'sk_zylv_root', icon: '🩸', cost: 1, path: 'root',
        get name() { return t('skill.sk_zylv_root.name'); },
        get desc() { return t('skill.sk_zylv_root.desc'); },
        effect: { damageBonus: 0.15 },
      },
      {
        id: 'sk_zylv_a1', icon: '🌫️', cost: 1, path: 'A',
        requires: req('sk_zylv_root'),
        get name() { return t('skill.sk_zylv_a1.name'); },
        get desc() { return t('skill.sk_zylv_a1.desc'); },
        effect: { customTag: 'zylv_toxic_cloak' },
      },
      {
        id: 'sk_zylv_a2', icon: '🐍', cost: 1, path: 'A',
        requires: req('sk_zylv_a1'),
        get name() { return t('skill.sk_zylv_a2.name'); },
        get desc() { return t('skill.sk_zylv_a2.desc'); },
        effect: { onHitPoison: { chance: 0.20, extraStacks: 1 } },
      },
      {
        id: 'sk_zylv_a3', icon: '☠️', cost: 2, path: 'A',
        requires: req('sk_zylv_a2'),
        excludes: ['sk_zylv_b3'],
        get name() { return t('skill.sk_zylv_a3.name'); },
        get desc() { return t('skill.sk_zylv_a3.desc'); },
        effect: { aoeBonus: 80, customTag: 'zylv_lethal_toxin' },
      },
      {
        id: 'sk_zylv_a4', icon: '🧪', cost: 1, path: 'A',
        requires: req('sk_zylv_a1'),
        get name() { return t('skill.sk_zylv_a4.name'); },
        get desc() { return t('skill.sk_zylv_a4.desc'); },
        effect: { customTag: 'zylv_metabolic' },
      },
      {
        id: 'sk_zylv_b1', icon: '👤', cost: 1, path: 'B',
        requires: req('sk_zylv_root'),
        get name() { return t('skill.sk_zylv_b1.name'); },
        get desc() { return t('skill.sk_zylv_b1.desc'); },
        effect: { customTag: 'zylv_ghost_walk' },
      },
      {
        id: 'sk_zylv_b2', icon: '🩸', cost: 1, path: 'B',
        requires: req('sk_zylv_b1'),
        get name() { return t('skill.sk_zylv_b2.name'); },
        get desc() { return t('skill.sk_zylv_b2.desc'); },
        effect: { lifesteal: 0.06, customTag: 'zylv_predator_drain' },
      },
      {
        id: 'sk_zylv_b3', icon: '🌑', cost: 2, path: 'B',
        requires: req('sk_zylv_b2'),
        excludes: ['sk_zylv_a3'],
        get name() { return t('skill.sk_zylv_b3.name'); },
        get desc() { return t('skill.sk_zylv_b3.desc'); },
        effect: { lifesteal: 0.05, customTag: 'zylv_void_stalker' }, // total 11%
      },
      {
        id: 'sk_zylv_b4', icon: '💎', cost: 1, path: 'B',
        requires: req('sk_zylv_b1'),
        get name() { return t('skill.sk_zylv_b4.name'); },
        get desc() { return t('skill.sk_zylv_b4.desc'); },
        effect: { goldOnKill: 2, selfHealOnKill: 5 },
      },
      {
        id: 'sk_zylv_cap', icon: '🦁', cost: 2, path: 'capstone',
        requires: req('sk_zylv_a3', 'sk_zylv_b3'),
        get name() { return t('skill.sk_zylv_cap.name'); },
        get desc() { return t('skill.sk_zylv_cap.desc'); },
        effect: { customTag: 'zylv_apex_predator' },
      },
    ],
  },

  // ════════════════════════════════════════════════════════════════════
  // MORRIGAN
  // ════════════════════════════════════════════════════════════════════
  {
    charType: 'morrigan',
    nodes: [
      {
        id: 'sk_morri_root', icon: '👁️', cost: 1, path: 'root',
        get name() { return t('skill.sk_morri_root.name'); },
        get desc() { return t('skill.sk_morri_root.desc'); },
        effect: { rangeBonus: 0.05, customTag: 'morri_soul_sight' },
      },
      // Path A — Soul Power / Scaling
      {
        id: 'sk_morri_a1', icon: '🌑', cost: 1, path: 'A',
        requires: req('sk_morri_root'),
        get name() { return t('skill.sk_morri_a1.name'); },
        get desc() { return t('skill.sk_morri_a1.desc'); },
        effect: { damageBonus: 0.15, customTag: 'morri_hungry_shadows' },
      },
      {
        id: 'sk_morri_a2', icon: '💜', cost: 1, path: 'A',
        requires: req('sk_morri_a1'),
        get name() { return t('skill.sk_morri_a2.name'); },
        get desc() { return t('skill.sk_morri_a2.desc'); },
        effect: { customTag: 'morri_soul_surge' },
      },
      {
        id: 'sk_morri_a3', icon: '♾️', cost: 2, path: 'A',
        requires: req('sk_morri_a2'),
        excludes: ['sk_morri_b3'],
        get name() { return t('skill.sk_morri_a3.name'); },
        get desc() { return t('skill.sk_morri_a3.desc'); },
        effect: { customTag: 'morri_eternal_hunger' },
      },
      {
        id: 'sk_morri_a4', icon: '🔮', cost: 1, path: 'A',
        requires: req('sk_morri_a1'),
        get name() { return t('skill.sk_morri_a4.name'); },
        get desc() { return t('skill.sk_morri_a4.desc'); },
        effect: { customTag: 'morri_feast_of_ruin' },
      },
      // Path B — Consuming Strike / Devour
      {
        id: 'sk_morri_b1', icon: '🎯', cost: 1, path: 'B',
        requires: req('sk_morri_root'),
        get name() { return t('skill.sk_morri_b1.name'); },
        get desc() { return t('skill.sk_morri_b1.desc'); },
        effect: { customTag: 'morri_predator' },
      },
      {
        id: 'sk_morri_b2', icon: '⚡', cost: 1, path: 'B',
        requires: req('sk_morri_b1'),
        get name() { return t('skill.sk_morri_b2.name'); },
        get desc() { return t('skill.sk_morri_b2.desc'); },
        effect: { customTag: 'morri_devour_mastery' },
      },
      {
        id: 'sk_morri_b3', icon: '🌪️', cost: 2, path: 'B',
        requires: req('sk_morri_b2'),
        excludes: ['sk_morri_a3'],
        get name() { return t('skill.sk_morri_b3.name'); },
        get desc() { return t('skill.sk_morri_b3.desc'); },
        effect: { customTag: 'morri_soul_storm' },
      },
      {
        id: 'sk_morri_b4', icon: '🌒', cost: 1, path: 'B',
        requires: req('sk_morri_b1'),
        get name() { return t('skill.sk_morri_b4.name'); },
        get desc() { return t('skill.sk_morri_b4.desc'); },
        effect: { customTag: 'morri_dark_persistence' },
      },
      // Capstone
      {
        id: 'sk_morri_cap', icon: '☠️', cost: 2, path: 'capstone',
        requires: req('sk_morri_a3', 'sk_morri_b3'),
        get name() { return t('skill.sk_morri_cap.name'); },
        get desc() { return t('skill.sk_morri_cap.desc'); },
        effect: { damageBonus: 0.25, customTag: 'morri_ascendant_witch' },
      },
    ],
  },

    {
    charType: 'ixara',
    nodes: [
      {
        id: 'sk_ixara_root', icon: '😈', cost: 1, path: 'root',
        get name() { return t('skill.sk_ixara_root.name'); },
        get desc() { return t('skill.sk_ixara_root.desc'); },
        effect: { freeStacksPerWave: 2 },
      },
      {
        id: 'sk_ixara_a1', icon: '🩸', cost: 1, path: 'A',
        requires: req('sk_ixara_root'),
        get name() { return t('skill.sk_ixara_a1.name'); },
        get desc() { return t('skill.sk_ixara_a1.desc'); },
        effect: { customTag: 'ixara_kill_fury' },
      },
      {
        id: 'sk_ixara_a2', icon: '💨', cost: 1, path: 'A',
        requires: req('sk_ixara_a1'),
        get name() { return t('skill.sk_ixara_a2.name'); },
        get desc() { return t('skill.sk_ixara_a2.desc'); },
        effect: { projSpeedBonus: 0.20, customTag: 'ixara_bloodrush' },
      },
      {
        id: 'sk_ixara_a3', icon: '🔥', cost: 2, path: 'A',
        requires: req('sk_ixara_a2'),
        excludes: ['sk_ixara_b3'],
        get name() { return t('skill.sk_ixara_a3.name'); },
        get desc() { return t('skill.sk_ixara_a3.desc'); },
        effect: { customTag: 'ixara_berserker' },
      },
      {
        id: 'sk_ixara_a4', icon: '📈', cost: 1, path: 'A',
        requires: req('sk_ixara_a1'),
        get name() { return t('skill.sk_ixara_a4.name'); },
        get desc() { return t('skill.sk_ixara_a4.desc'); },
        effect: { customTag: 'ixara_fury_persist' },
      },
      {
        id: 'sk_ixara_b1', icon: '💥', cost: 1, path: 'B',
        requires: req('sk_ixara_root'),
        get name() { return t('skill.sk_ixara_b1.name'); },
        get desc() { return t('skill.sk_ixara_b1.desc'); },
        effect: { damageBonus: 0.25, customTag: 'ixara_nova_amp' },
      },
      {
        id: 'sk_ixara_b2', icon: '🌊', cost: 1, path: 'B',
        requires: req('sk_ixara_b1'),
        get name() { return t('skill.sk_ixara_b2.name'); },
        get desc() { return t('skill.sk_ixara_b2.desc'); },
        effect: { customTag: 'ixara_shockwave' },
      },
      {
        id: 'sk_ixara_b3', icon: '🌟', cost: 2, path: 'B',
        requires: req('sk_ixara_b2'),
        excludes: ['sk_ixara_a3'],
        get name() { return t('skill.sk_ixara_b3.name'); },
        get desc() { return t('skill.sk_ixara_b3.desc'); },
        effect: { customTag: 'ixara_supernova' },
      },
      {
        id: 'sk_ixara_b4', icon: '🔗', cost: 1, path: 'B',
        requires: req('sk_ixara_b1'),
        get name() { return t('skill.sk_ixara_b4.name'); },
        get desc() { return t('skill.sk_ixara_b4.desc'); },
        effect: { customTag: 'ixara_chain_reaction' },
      },
      {
        id: 'sk_ixara_cap', icon: '👿', cost: 2, path: 'capstone',
        requires: req('sk_ixara_a3', 'sk_ixara_b3'),
        get name() { return t('skill.sk_ixara_cap.name'); },
        get desc() { return t('skill.sk_ixara_cap.desc'); },
        effect: { customTag: 'ixara_demon_unleashed' },
      },
    ],
  },
  // ── Berserker ───────────────────────────────────────────────────────────────
  {
    charType: 'berserker',
    nodes: [
      {
        id: 'sk_berserker_root', icon: '🩸', cost: 1, path: 'root',
        get name() { return t('skill.sk_berserker_root.name'); },
        get desc() { return t('skill.sk_berserker_root.desc'); },
        effect: { customTag: 'berserker_blood_oath' },
      },
      // Path A — Offense / Rampage
      {
        id: 'sk_berserker_a1', icon: '⚔️', cost: 1, path: 'A',
        requires: req('sk_berserker_root'),
        get name() { return t('skill.sk_berserker_a1.name'); },
        get desc() { return t('skill.sk_berserker_a1.desc'); },
        effect: { damageBonus: 0.15, customTag: 'berserker_savage' },
      },
      {
        id: 'sk_berserker_a2', icon: '🥁', cost: 1, path: 'A',
        requires: req('sk_berserker_a1'),
        get name() { return t('skill.sk_berserker_a2.name'); },
        get desc() { return t('skill.sk_berserker_a2.desc'); },
        effect: { specialCooldownReduction: 0.25, customTag: 'berserker_war_drums' },
      },
      {
        id: 'sk_berserker_a3', icon: '💥', cost: 2, path: 'A',
        requires: req('sk_berserker_a2'),
        excludes: ['sk_berserker_b3'],
        get name() { return t('skill.sk_berserker_a3.name'); },
        get desc() { return t('skill.sk_berserker_a3.desc'); },
        effect: { customTag: 'berserker_unstoppable' },
      },
      {
        id: 'sk_berserker_a4', icon: '🛡️', cost: 1, path: 'A',
        requires: req('sk_berserker_a1'),
        get name() { return t('skill.sk_berserker_a4.name'); },
        get desc() { return t('skill.sk_berserker_a4.desc'); },
        effect: { hpBonus: 0.20, customTag: 'berserker_iron_skin' },
      },
      // Path B — Barrier synergy / Risk
      {
        id: 'sk_berserker_b1', icon: '💢', cost: 1, path: 'B',
        requires: req('sk_berserker_root'),
        get name() { return t('skill.sk_berserker_b1.name'); },
        get desc() { return t('skill.sk_berserker_b1.desc'); },
        effect: { customTag: 'berserker_pain_power' },
      },
      {
        id: 'sk_berserker_b2', icon: '⚡', cost: 1, path: 'B',
        requires: req('sk_berserker_b1'),
        get name() { return t('skill.sk_berserker_b2.name'); },
        get desc() { return t('skill.sk_berserker_b2.desc'); },
        effect: { attackSpeedBonus: 0.10, customTag: 'berserker_adrenaline' },
      },
      {
        id: 'sk_berserker_b3', icon: '☠️', cost: 2, path: 'B',
        requires: req('sk_berserker_b2'),
        excludes: ['sk_berserker_a3'],
        get name() { return t('skill.sk_berserker_b3.name'); },
        get desc() { return t('skill.sk_berserker_b3.desc'); },
        effect: { customTag: 'berserker_death_before_defeat' },
      },
      {
        id: 'sk_berserker_b4', icon: '📣', cost: 1, path: 'B',
        requires: req('sk_berserker_b1'),
        get name() { return t('skill.sk_berserker_b4.name'); },
        get desc() { return t('skill.sk_berserker_b4.desc'); },
        effect: { customTag: 'berserker_howl' },
      },
      // Capstone
      {
        id: 'sk_berserker_cap', icon: '👑', cost: 2, path: 'capstone',
        requires: req('sk_berserker_a3', 'sk_berserker_b3'),
        get name() { return t('skill.sk_berserker_cap.name'); },
        get desc() { return t('skill.sk_berserker_cap.desc'); },
        effect: { damageBonus: 0.30, customTag: 'berserker_warlord_incarnate' },
      },
    ],
  },

  // ── Frost Warden ────────────────────────────────────────────────────────────
  {
    charType: 'frost_warden',
    nodes: [
      {
        id: 'sk_frost_warden_root', icon: '❄️', cost: 1, path: 'root',
        get name() { return t('skill.sk_frost_warden_root.name'); },
        get desc() { return t('skill.sk_frost_warden_root.desc'); },
        effect: { customTag: 'frost_warden_permafrost' },
      },
      // Path A — Zone control / Patches
      {
        id: 'sk_frost_warden_a1', icon: '🌨️', cost: 1, path: 'A',
        requires: req('sk_frost_warden_root'),
        get name() { return t('skill.sk_frost_warden_a1.name'); },
        get desc() { return t('skill.sk_frost_warden_a1.desc'); },
        effect: { customTag: 'frost_warden_deep_freeze' },
      },
      {
        id: 'sk_frost_warden_a2', icon: '💎', cost: 1, path: 'A',
        requires: req('sk_frost_warden_a1'),
        get name() { return t('skill.sk_frost_warden_a2.name'); },
        get desc() { return t('skill.sk_frost_warden_a2.desc'); },
        effect: { customTag: 'frost_warden_crystallize' },
      },
      {
        id: 'sk_frost_warden_a3', icon: '🏔️', cost: 2, path: 'A',
        requires: req('sk_frost_warden_a2'),
        excludes: ['sk_frost_warden_b3'],
        get name() { return t('skill.sk_frost_warden_a3.name'); },
        get desc() { return t('skill.sk_frost_warden_a3.desc'); },
        effect: { customTag: 'frost_warden_tundra' },
      },
      {
        id: 'sk_frost_warden_a4', icon: '🌬️', cost: 1, path: 'A',
        requires: req('sk_frost_warden_a1'),
        get name() { return t('skill.sk_frost_warden_a4.name'); },
        get desc() { return t('skill.sk_frost_warden_a4.desc'); },
        effect: { rangeBonus: 0.20, customTag: 'frost_warden_arctic_wind' },
      },
      // Path B — Glacial Wall / Damage
      {
        id: 'sk_frost_warden_b1', icon: '🗡️', cost: 1, path: 'B',
        requires: req('sk_frost_warden_root'),
        get name() { return t('skill.sk_frost_warden_b1.name'); },
        get desc() { return t('skill.sk_frost_warden_b1.desc'); },
        effect: { damageBonus: 0.15, customTag: 'frost_warden_glacial_spike' },
      },
      {
        id: 'sk_frost_warden_b2', icon: '🧱', cost: 1, path: 'B',
        requires: req('sk_frost_warden_b1'),
        get name() { return t('skill.sk_frost_warden_b2.name'); },
        get desc() { return t('skill.sk_frost_warden_b2.desc'); },
        effect: { specialCooldownReduction: 0.33, customTag: 'frost_warden_wall_mastery' },
      },
      {
        id: 'sk_frost_warden_b3', icon: '🌊', cost: 2, path: 'B',
        requires: req('sk_frost_warden_b2'),
        excludes: ['sk_frost_warden_a3'],
        get name() { return t('skill.sk_frost_warden_b3.name'); },
        get desc() { return t('skill.sk_frost_warden_b3.desc'); },
        effect: { customTag: 'frost_warden_avalanche' },
      },
      {
        id: 'sk_frost_warden_b4', icon: '⚡', cost: 1, path: 'B',
        requires: req('sk_frost_warden_b1'),
        get name() { return t('skill.sk_frost_warden_b4.name'); },
        get desc() { return t('skill.sk_frost_warden_b4.desc'); },
        effect: { customTag: 'frost_warden_cold_snap' },
      },
      // Capstone
      {
        id: 'sk_frost_warden_cap', icon: '🌌', cost: 2, path: 'capstone',
        requires: req('sk_frost_warden_a3', 'sk_frost_warden_b3'),
        get name() { return t('skill.sk_frost_warden_cap.name'); },
        get desc() { return t('skill.sk_frost_warden_cap.desc'); },
        effect: { customTag: 'frost_warden_absolute_zero' },
      },
    ],
  },

  // ── Inquisitor ───────────────────────────────────────────────────────────────
  {
    charType: 'inquisitor',
    nodes: [
      {
        id: 'sk_inquisitor_root', icon: '📖', cost: 1, path: 'root',
        get name() { return t('skill.sk_inquisitor_root.name'); },
        get desc() { return t('skill.sk_inquisitor_root.desc'); },
        effect: { customTag: 'inquisitor_studied' },
      },
      // Path A — Verdict / Type mastery
      {
        id: 'sk_inquisitor_a1', icon: '🔍', cost: 1, path: 'A',
        requires: req('sk_inquisitor_root'),
        get name() { return t('skill.sk_inquisitor_a1.name'); },
        get desc() { return t('skill.sk_inquisitor_a1.desc'); },
        effect: { customTag: 'inquisitor_deep_knowledge' },
      },
      {
        id: 'sk_inquisitor_a2', icon: '🎯', cost: 1, path: 'A',
        requires: req('sk_inquisitor_a1'),
        get name() { return t('skill.sk_inquisitor_a2.name'); },
        get desc() { return t('skill.sk_inquisitor_a2.desc'); },
        effect: { damageBonus: 0.10, customTag: 'inquisitor_heresy_hunter' },
      },
      {
        id: 'sk_inquisitor_a3', icon: '⚖️', cost: 2, path: 'A',
        requires: req('sk_inquisitor_a2'),
        excludes: ['sk_inquisitor_b3'],
        get name() { return t('skill.sk_inquisitor_a3.name'); },
        get desc() { return t('skill.sk_inquisitor_a3.desc'); },
        effect: { customTag: 'inquisitor_grand_inquisitor' },
      },
      {
        id: 'sk_inquisitor_a4', icon: '📊', cost: 1, path: 'A',
        requires: req('sk_inquisitor_a1'),
        get name() { return t('skill.sk_inquisitor_a4.name'); },
        get desc() { return t('skill.sk_inquisitor_a4.desc'); },
        effect: { customTag: 'inquisitor_tactical_analysis' },
      },
      // Path B — Sentence / Control
      {
        id: 'sk_inquisitor_b1', icon: '⚡', cost: 1, path: 'B',
        requires: req('sk_inquisitor_root'),
        get name() { return t('skill.sk_inquisitor_b1.name'); },
        get desc() { return t('skill.sk_inquisitor_b1.desc'); },
        effect: { specialCooldownReduction: 0.30, customTag: 'inquisitor_swift_judgment' },
      },
      {
        id: 'sk_inquisitor_b2', icon: '📜', cost: 1, path: 'B',
        requires: req('sk_inquisitor_b1'),
        get name() { return t('skill.sk_inquisitor_b2.name'); },
        get desc() { return t('skill.sk_inquisitor_b2.desc'); },
        effect: { customTag: 'inquisitor_death_warrant' },
      },
      {
        id: 'sk_inquisitor_b3', icon: '🗡️', cost: 2, path: 'B',
        requires: req('sk_inquisitor_b2'),
        excludes: ['sk_inquisitor_a3'],
        get name() { return t('skill.sk_inquisitor_b3.name'); },
        get desc() { return t('skill.sk_inquisitor_b3.desc'); },
        effect: { customTag: 'inquisitor_execution_order' },
      },
      {
        id: 'sk_inquisitor_b4', icon: '🔴', cost: 1, path: 'B',
        requires: req('sk_inquisitor_b1'),
        get name() { return t('skill.sk_inquisitor_b4.name'); },
        get desc() { return t('skill.sk_inquisitor_b4.desc'); },
        effect: { debuffDurationBonus: 2, customTag: 'inquisitor_mark_of_shame' },
      },
      // Capstone
      {
        id: 'sk_inquisitor_cap', icon: '✨', cost: 2, path: 'capstone',
        requires: req('sk_inquisitor_a3', 'sk_inquisitor_b3'),
        get name() { return t('skill.sk_inquisitor_cap.name'); },
        get desc() { return t('skill.sk_inquisitor_cap.desc'); },
        effect: { barrierHealOnKill: 1, customTag: 'inquisitor_divine_purge' },
      },
    ],
  },
  // ── Malachar, the Redeemed ────────────────────────────────────────────────────
  {
    charType: 'malachar_human',
    nodes: [
      {
        id: 'sk_mal_root', icon: '📖', cost: 1, path: 'root',
        get name() { return t('skill.sk_mal_root.name'); },
        get desc() { return t('skill.sk_mal_root.desc'); },
        effect: { attackSpeedBonus: 0.15, customTag: 'mal_grimorio_open' },
      },
      // Path A — Spell Power / Cycle
      {
        id: 'sk_mal_a1', icon: '🔮', cost: 1, path: 'A',
        requires: req('sk_mal_root'),
        get name() { return t('skill.sk_mal_a1.name'); },
        get desc() { return t('skill.sk_mal_a1.desc'); },
        effect: { damageBonus: 0.20, customTag: 'mal_arcane_mastery' },
      },
      {
        id: 'sk_mal_a2', icon: '💀', cost: 1, path: 'A',
        requires: req('sk_mal_a1'),
        get name() { return t('skill.sk_mal_a2.name'); },
        get desc() { return t('skill.sk_mal_a2.desc'); },
        effect: { customTag: 'mal_death_resonance' },
      },
      {
        id: 'sk_mal_a3', icon: '🌌', cost: 2, path: 'A',
        requires: req('sk_mal_a2'),
        excludes: ['sk_mal_b3'],
        get name() { return t('skill.sk_mal_a3.name'); },
        get desc() { return t('skill.sk_mal_a3.desc'); },
        effect: { customTag: 'mal_void_mastery' },
      },
      {
        id: 'sk_mal_a4', icon: '⚡', cost: 1, path: 'A',
        requires: req('sk_mal_a1'),
        get name() { return t('skill.sk_mal_a4.name'); },
        get desc() { return t('skill.sk_mal_a4.desc'); },
        effect: { customTag: 'mal_empowered_soul' },
      },
      // Path B — Solitary / Ascension
      {
        id: 'sk_mal_b1', icon: '🌑', cost: 1, path: 'B',
        requires: req('sk_mal_root'),
        get name() { return t('skill.sk_mal_b1.name'); },
        get desc() { return t('skill.sk_mal_b1.desc'); },
        effect: { customTag: 'mal_solitude_path' },
      },
      {
        id: 'sk_mal_b2', icon: '🚀', cost: 1, path: 'B',
        requires: req('sk_mal_b1'),
        get name() { return t('skill.sk_mal_b2.name'); },
        get desc() { return t('skill.sk_mal_b2.desc'); },
        effect: { customTag: 'mal_ascensao_fast' },
      },
      {
        id: 'sk_mal_b3', icon: '✨', cost: 2, path: 'B',
        requires: req('sk_mal_b2'),
        excludes: ['sk_mal_a3'],
        get name() { return t('skill.sk_mal_b3.name'); },
        get desc() { return t('skill.sk_mal_b3.desc'); },
        effect: { customTag: 'mal_ascensao_total' },
      },
      {
        id: 'sk_mal_b4', icon: '👻', cost: 1, path: 'B',
        requires: req('sk_mal_b1'),
        get name() { return t('skill.sk_mal_b4.name'); },
        get desc() { return t('skill.sk_mal_b4.desc'); },
        effect: { selfHealOnKill: 8, customTag: 'mal_soul_harvest' },
      },
      // Capstone
      {
        id: 'sk_mal_cap', icon: '🌠', cost: 2, path: 'capstone',
        requires: req('sk_mal_a3', 'sk_mal_b3'),
        get name() { return t('skill.sk_mal_cap.name'); },
        get desc() { return t('skill.sk_mal_cap.desc'); },
        effect: { damageBonus: 0.30, customTag: 'mal_forma_final' },
      },
    ],
  },

  // ── yue ─────────────────────────────────────────────────────────
  {
    charType: 'yue',
    nodes: [
      {
        id: 'sk_yue_root', icon: '🎭', cost: 1, path: 'root',
        get name() { return t('skill.sk_yue_root.name'); },
        get desc() { return t('skill.sk_yue_root.desc'); },
        effect: { customTag: 'yue_ensaio' },
      },
      {
        id: 'sk_yue_a1', icon: '👠', cost: 1, path: 'A',
        requires: req('sk_yue_root'),
        get name() { return t('skill.sk_yue_a1.name'); },
        get desc() { return t('skill.sk_yue_a1.desc'); },
        effect: { damageBonus: 0.10 },
      },
      {
        id: 'sk_yue_a2', icon: '🪭', cost: 1, path: 'A',
        requires: req('sk_yue_a1'),
        get name() { return t('skill.sk_yue_a2.name'); },
        get desc() { return t('skill.sk_yue_a2.desc'); },
        effect: { customTag: 'yue_leque_4' },
      },
      {
        id: 'sk_yue_a3', icon: '🌟', cost: 2, path: 'A',
        requires: req('sk_yue_a2'),
        excludes: ['sk_yue_b3'],
        get name() { return t('skill.sk_yue_a3.name'); },
        get desc() { return t('skill.sk_yue_a3.desc'); },
        effect: { customTag: 'yue_plateia_max' },
      },
      {
        id: 'sk_yue_a4', icon: '🥁', cost: 1, path: 'A',
        requires: req('sk_yue_a1'),
        get name() { return t('skill.sk_yue_a4.name'); },
        get desc() { return t('skill.sk_yue_a4.desc'); },
        effect: { attackSpeedBonus: -0.10 },
      },
      {
        id: 'sk_yue_b1', icon: '💄', cost: 1, path: 'B',
        requires: req('sk_yue_root'),
        get name() { return t('skill.sk_yue_b1.name'); },
        get desc() { return t('skill.sk_yue_b1.desc'); },
        effect: { hpBonus: 0.15 },
      },
      {
        id: 'sk_yue_b2', icon: '✨', cost: 1, path: 'B',
        requires: req('sk_yue_b1'),
        get name() { return t('skill.sk_yue_b2.name'); },
        get desc() { return t('skill.sk_yue_b2.desc'); },
        effect: { customTag: 'yue_encanto_4' },
      },
      {
        id: 'sk_yue_b3', icon: '🎀', cost: 2, path: 'B',
        requires: req('sk_yue_b2'),
        excludes: ['sk_yue_a3'],
        get name() { return t('skill.sk_yue_b3.name'); },
        get desc() { return t('skill.sk_yue_b3.desc'); },
        effect: { customTag: 'yue_encanto_longo' },
      },
      {
        id: 'sk_yue_b4', icon: '💔', cost: 1, path: 'B',
        requires: req('sk_yue_b1'),
        get name() { return t('skill.sk_yue_b4.name'); },
        get desc() { return t('skill.sk_yue_b4.desc'); },
        effect: { customTag: 'yue_encanto_dano' },
      },
      {
        id: 'sk_yue_cap', icon: '🎪', cost: 2, path: 'capstone',
        requires: req('sk_yue_a3', 'sk_yue_b3'),
        get name() { return t('skill.sk_yue_cap.name'); },
        get desc() { return t('skill.sk_yue_cap.desc'); },
        effect: { customTag: 'yue_encore' },
      },
    ],
  },

  // ── billy ─────────────────────────────────────────────────────────
  {
    charType: 'billy',
    nodes: [
      {
        id: 'sk_billy_root', icon: '🎩', cost: 1, path: 'root',
        get name() { return t('skill.sk_billy_root.name'); },
        get desc() { return t('skill.sk_billy_root.desc'); },
        effect: { customTag: 'billy_tres_tempos' },
      },
      {
        id: 'sk_billy_a1', icon: '🔫', cost: 1, path: 'A',
        requires: req('sk_billy_root'),
        get name() { return t('skill.sk_billy_a1.name'); },
        get desc() { return t('skill.sk_billy_a1.desc'); },
        effect: { damageBonus: 0.12 },
      },
      {
        id: 'sk_billy_a2', icon: '🎯', cost: 1, path: 'A',
        requires: req('sk_billy_a1'),
        get name() { return t('skill.sk_billy_a2.name'); },
        get desc() { return t('skill.sk_billy_a2.desc'); },
        effect: { customTag: 'billy_quarto_150' },
      },
      {
        id: 'sk_billy_a3', icon: '⏱️', cost: 2, path: 'A',
        requires: req('sk_billy_a2'),
        excludes: ['sk_billy_b3'],
        get name() { return t('skill.sk_billy_a3.name'); },
        get desc() { return t('skill.sk_billy_a3.desc'); },
        effect: { customTag: 'billy_recarga_meia' },
      },
      {
        id: 'sk_billy_a4', icon: '💥', cost: 1, path: 'A',
        requires: req('sk_billy_a1'),
        get name() { return t('skill.sk_billy_a4.name'); },
        get desc() { return t('skill.sk_billy_a4.desc'); },
        effect: { critDmgMultiplier: 0.25 },
      },
      {
        id: 'sk_billy_b1', icon: '👁️', cost: 1, path: 'B',
        requires: req('sk_billy_root'),
        get name() { return t('skill.sk_billy_b1.name'); },
        get desc() { return t('skill.sk_billy_b1.desc'); },
        effect: { rangeBonus: 0.10 },
      },
      {
        id: 'sk_billy_b2', icon: '🎬', cost: 1, path: 'B',
        requires: req('sk_billy_b1'),
        get name() { return t('skill.sk_billy_b2.name'); },
        get desc() { return t('skill.sk_billy_b2.desc'); },
        effect: { customTag: 'billy_cortina_3' },
      },
      {
        id: 'sk_billy_b3', icon: '🌹', cost: 2, path: 'B',
        requires: req('sk_billy_b2'),
        excludes: ['sk_billy_a3'],
        get name() { return t('skill.sk_billy_b3.name'); },
        get desc() { return t('skill.sk_billy_b3.desc'); },
        effect: { customTag: 'billy_cortina_forte' },
      },
      {
        id: 'sk_billy_b4', icon: '🎼', cost: 1, path: 'B',
        requires: req('sk_billy_b1'),
        get name() { return t('skill.sk_billy_b4.name'); },
        get desc() { return t('skill.sk_billy_b4.desc'); },
        effect: { attackSpeedBonus: -0.08 },
      },
      {
        id: 'sk_billy_cap', icon: '5️⃣', cost: 2, path: 'capstone',
        requires: req('sk_billy_a3', 'sk_billy_b3'),
        get name() { return t('skill.sk_billy_cap.name'); },
        get desc() { return t('skill.sk_billy_cap.desc'); },
        effect: { customTag: 'billy_quinto' },
      },
    ],
  },
];

// ---------------------------------------------------------------------------
// Runtime helpers
// ---------------------------------------------------------------------------

/** Returns the skill tree for a character type, or undefined if not found. */
export const getSkillTree = (charType: string): SkillTree | undefined =>
  SKILL_TREES.find(t => t.charType === charType);

/** Returns a specific node by ID. */
export const getSkillNode = (nodeId: string): SkillNode | undefined => {
  for (const tree of SKILL_TREES) {
    const node = tree.nodes.find(n => n.id === nodeId);
    if (node) return node;
  }
  return undefined;
};

/**
 * Checks whether a set of unlocked nodes satisfies the requirements of a given node.
 * @param node       Node to be unlocked
 * @param unlocked   Set of already-unlocked node IDs
 * @param charType   The selected character type
 */
export const canUnlockNode = (
  node: SkillNode,
  unlocked: Set<string>,
  charType: string,
): boolean => {
  // Must belong to the same character
  const tree = getSkillTree(charType);
  if (!tree || !tree.nodes.find(n => n.id === node.id)) return false;

  // All requires must be unlocked
  if (node.requires) {
    // For capstone: any one require is enough (either advanced path)
    if (node.path === 'capstone') {
      const hasAny = node.requires.some(r => unlocked.has(r));
      if (!hasAny) return false;
    } else {
      const hasAll = node.requires.every(r => unlocked.has(r));
      if (!hasAll) return false;
    }
  }

  // None of the excludes can be unlocked
  if (node.excludes) {
    const hasExcluded = node.excludes.some(e => unlocked.has(e));
    if (hasExcluded) return false;
  }

  return true;
};

/**
 * Aggregates all numeric effects from unlocked nodes.
 * Call at run start to build the player bonus object.
 */
export const aggregateSkillEffects = (unlockedIds: string[]): SkillEffect => {
  const result: SkillEffect = {};

  for (const id of unlockedIds) {
    const node = getSkillNode(id);
    if (!node) continue;
    const e = node.effect;

    if (e.damageBonus)       result.damageBonus       = (result.damageBonus ?? 0)       + e.damageBonus;
    if (e.attackSpeedBonus)  result.attackSpeedBonus  = (result.attackSpeedBonus ?? 0)  + e.attackSpeedBonus;
    if (e.rangeBonus)        result.rangeBonus        = (result.rangeBonus ?? 0)        + e.rangeBonus;
    if (e.hpBonus)           result.hpBonus           = (result.hpBonus ?? 0)           + e.hpBonus;
    if (e.projSpeedBonus)    result.projSpeedBonus    = (result.projSpeedBonus ?? 0)    + e.projSpeedBonus;
    if (e.lifesteal)         result.lifesteal         = (result.lifesteal ?? 0)         + e.lifesteal;
    if (e.aoeBonus)          result.aoeBonus          = (result.aoeBonus ?? 0)          + e.aoeBonus;
    if (e.critChanceBonus)   result.critChanceBonus   = (result.critChanceBonus ?? 0)   + e.critChanceBonus;
    if (e.critDmgMultiplier) result.critDmgMultiplier = (result.critDmgMultiplier ?? 0) + e.critDmgMultiplier;
    if (e.chainBounces)      result.chainBounces      = (result.chainBounces ?? 0)      + e.chainBounces;
    if (e.auraBonusRadius)   result.auraBonusRadius   = (result.auraBonusRadius ?? 0)   + e.auraBonusRadius;
    if (e.debuffDurationBonus) result.debuffDurationBonus = (result.debuffDurationBonus ?? 0) + e.debuffDurationBonus;
    if (e.specialCooldownReduction) result.specialCooldownReduction = (result.specialCooldownReduction ?? 0) + e.specialCooldownReduction;
    if (e.barrierBonusPerWave)  result.barrierBonusPerWave  = (result.barrierBonusPerWave ?? 0)  + e.barrierBonusPerWave;
    if (e.freeStacksPerWave)    result.freeStacksPerWave    = (result.freeStacksPerWave ?? 0)    + e.freeStacksPerWave;
    if (e.allyHealPerWave)      result.allyHealPerWave      = (result.allyHealPerWave ?? 0)      + e.allyHealPerWave;
    if (e.goldOnKill)           result.goldOnKill           = (result.goldOnKill ?? 0)           + e.goldOnKill;
    if (e.barrierHealOnKill)    result.barrierHealOnKill    = (result.barrierHealOnKill ?? 0)    + e.barrierHealOnKill;
    if (e.selfHealOnKill)       result.selfHealOnKill       = (result.selfHealOnKill ?? 0)       + e.selfHealOnKill;
  }

  return result;
};

/**
 * Checks whether a customTag is active among the unlocked nodes.
 * Equivalent to isCR() for relics.
 *
 * @example
 *   if (hasSK('mage_singularity', player.unlockedSkills)) { ... }
 */
export const hasSK = (tag: string, unlockedIds: string[]): boolean => {
  return unlockedIds.some(id => {
    const node = getSkillNode(id);
    return node?.effect.customTag === tag;
  });
};

// Returns a Set of all customTag strings from unlocked nodes — O(1) lookups at runtime
export const getCustomTagSet = (unlockedIds: string[]): Set<string> => {
  const tags = new Set<string>();
  for (const id of unlockedIds) {
    const node = getSkillNode(id);
    if (node?.effect.customTag) tags.add(node.effect.customTag);
  }
  return tags;
};
