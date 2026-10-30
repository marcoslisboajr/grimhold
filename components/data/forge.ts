// ══════════════════════════════════════════════════════════════════════
// data/forge.ts
// Extracted from GameCanvas.tsx — permanent Forge upgrades,
// purchased with Essence between runs.
// No React or canvas dependency.
// ══════════════════════════════════════════════════════════════════════

import { storage } from '../systems/storage';
import { t } from '../../i18n';
export type ForgeCategory = 'barrier' | 'economy' | 'allies' | 'combat';

export interface ForgeUpgrade {
  id:           string;
  name:         string;
  icon:         string;
  desc:         string;
  flavor:       string;
  maxLevel:     number;
  costPerLevel: number[];
  category:     ForgeCategory;
}

export const FORGE_UPGRADES: ForgeUpgrade[] = [
  // ── Barrier (12) ─────────────────────────────────────────────────────────
  {
    id: 'forge_barrier_hp',
    get name() { return t('forgeUp.forge_barrier_hp.name'); }, icon: '🏰',
    get desc() { return t('forgeUp.forge_barrier_hp.desc'); },
    get flavor() { return t('forgeUp.forge_barrier_hp.flavor'); },
    maxLevel: 5, costPerLevel: [40, 60, 90, 130, 180], category: 'barrier',
  },
  {
    id: 'forge_barrier_regen',
    get name() { return t('forgeUp.forge_barrier_regen.name'); }, icon: '🪨',
    get desc() { return t('forgeUp.forge_barrier_regen.desc'); },
    get flavor() { return t('forgeUp.forge_barrier_regen.flavor'); },
    maxLevel: 3, costPerLevel: [60, 100, 160], category: 'barrier',
  },
  {
    id: 'forge_barrier_resist',
    get name() { return t('forgeUp.forge_barrier_resist.name'); }, icon: '🛡️',
    get desc() { return t('forgeUp.forge_barrier_resist.desc'); },
    get flavor() { return t('forgeUp.forge_barrier_resist.flavor'); },
    maxLevel: 3, costPerLevel: [80, 130, 200], category: 'barrier',
  },
  {
    id: 'forge_barrier_spikes',
    get name() { return t('forgeUp.forge_barrier_spikes.name'); }, icon: '🪓',
    get desc() { return t('forgeUp.forge_barrier_spikes.desc'); },
    get flavor() { return t('forgeUp.forge_barrier_spikes.flavor'); },
    maxLevel: 4, costPerLevel: [50, 80, 120, 170], category: 'barrier',
  },
  {
    id: 'forge_barrier_start_shield',
    get name() { return t('forgeUp.forge_barrier_start_shield.name'); }, icon: '🔷',
    get desc() { return t('forgeUp.forge_barrier_start_shield.desc'); },
    get flavor() { return t('forgeUp.forge_barrier_start_shield.flavor'); },
    maxLevel: 3, costPerLevel: [60, 100, 150], category: 'barrier',
  },
  {
    id: 'forge_repair_cost',
    get name() { return t('forgeUp.forge_repair_cost.name'); }, icon: '🔧',
    get desc() { return t('forgeUp.forge_repair_cost.desc'); },
    get flavor() { return t('forgeUp.forge_repair_cost.flavor'); },
    maxLevel: 3, costPerLevel: [45, 75, 120], category: 'barrier',
  },
  {
    id: 'forge_repair_boost',
    get name() { return t('forgeUp.forge_repair_boost.name'); }, icon: '🪨',
    get desc() { return t('forgeUp.forge_repair_boost.desc'); },
    get flavor() { return t('forgeUp.forge_repair_boost.flavor'); },
    maxLevel: 3, costPerLevel: [50, 85, 135], category: 'barrier',
  },
  {
    id: 'forge_last_bastion',
    get name() { return t('forgeUp.forge_last_bastion.name'); }, icon: '🚩',
    get desc() { return t('forgeUp.forge_last_bastion.desc'); },
    get flavor() { return t('forgeUp.forge_last_bastion.flavor'); },
    maxLevel: 3, costPerLevel: [70, 120, 180], category: 'barrier',
  },
  {
    id: 'forge_barrier_shockwave',
    get name() { return t('forgeUp.forge_barrier_shockwave.name'); }, icon: '🌀',
    get desc() { return t('forgeUp.forge_barrier_shockwave.desc'); },
    get flavor() { return t('forgeUp.forge_barrier_shockwave.flavor'); },
    maxLevel: 2, costPerLevel: [90, 160], category: 'barrier',
  },
  {
    id: 'forge_fortified_gate',
    get name() { return t('forgeUp.forge_fortified_gate.name'); }, icon: '💪',
    get desc() { return t('forgeUp.forge_fortified_gate.desc'); },
    get flavor() { return t('forgeUp.forge_fortified_gate.flavor'); },
    maxLevel: 3, costPerLevel: [75, 125, 190], category: 'barrier',
  },
  {
    id: 'forge_overheal_barrier',
    get name() { return t('forgeUp.forge_overheal_barrier.name'); }, icon: '🪙',
    get desc() { return t('forgeUp.forge_overheal_barrier.desc'); },
    get flavor() { return t('forgeUp.forge_overheal_barrier.flavor'); },
    maxLevel: 2, costPerLevel: [80, 140], category: 'barrier',
  },
  {
    id: 'forge_indomitable_wall',
    get name() { return t('forgeUp.forge_indomitable_wall.name'); }, icon: '⭐',
    get desc() { return t('forgeUp.forge_indomitable_wall.desc'); },
    get flavor() { return t('forgeUp.forge_indomitable_wall.flavor'); },
    maxLevel: 1, costPerLevel: [250], category: 'barrier',
  },

  // ── Economy (12) ──────────────────────────────────────────────────────────
  {
    id: 'forge_gold_start',
    get name() { return t('forgeUp.forge_gold_start.name'); }, icon: '💰',
    get desc() { return t('forgeUp.forge_gold_start.desc'); },
    get flavor() { return t('forgeUp.forge_gold_start.flavor'); },
    maxLevel: 4, costPerLevel: [30, 50, 80, 120], category: 'economy',
  },
  {
    id: 'forge_gold_wave',
    get name() { return t('forgeUp.forge_gold_wave.name'); }, icon: '🪙',
    get desc() { return t('forgeUp.forge_gold_wave.desc'); },
    get flavor() { return t('forgeUp.forge_gold_wave.flavor'); },
    maxLevel: 5, costPerLevel: [40, 65, 100, 140, 190], category: 'economy',
  },
  {
    id: 'forge_lucky_start',
    get name() { return t('forgeUp.forge_lucky_start.name'); }, icon: '🍀',
    get desc() { return t('forgeUp.forge_lucky_start.desc'); },
    get flavor() { return t('forgeUp.forge_lucky_start.flavor'); },
    maxLevel: 1, costPerLevel: [90], category: 'economy',
  },
  {
    id: 'forge_essence_gain',
    get name() { return t('forgeUp.forge_essence_gain.name'); }, icon: '💜',
    get desc() { return t('forgeUp.forge_essence_gain.desc'); },
    get flavor() { return t('forgeUp.forge_essence_gain.flavor'); },
    maxLevel: 4, costPerLevel: [50, 90, 140, 200], category: 'economy',
  },
  {
    id: 'forge_shop_discount',
    get name() { return t('forgeUp.forge_shop_discount.name'); }, icon: '🛒',
    get desc() { return t('forgeUp.forge_shop_discount.desc'); },
    get flavor() { return t('forgeUp.forge_shop_discount.flavor'); },
    maxLevel: 3, costPerLevel: [60, 100, 160], category: 'economy',
  },
  {
    id: 'forge_bounty_hunter',
    get name() { return t('forgeUp.forge_bounty_hunter.name'); }, icon: '🎯',
    get desc() { return t('forgeUp.forge_bounty_hunter.desc'); },
    get flavor() { return t('forgeUp.forge_bounty_hunter.flavor'); },
    maxLevel: 3, costPerLevel: [55, 95, 150], category: 'economy',
  },
  {
    id: 'forge_boss_treasure',
    get name() { return t('forgeUp.forge_boss_treasure.name'); }, icon: '👑',
    get desc() { return t('forgeUp.forge_boss_treasure.desc'); },
    get flavor() { return t('forgeUp.forge_boss_treasure.flavor'); },
    maxLevel: 3, costPerLevel: [70, 120, 190], category: 'economy',
  },
  {
    id: 'forge_interest',
    get name() { return t('forgeUp.forge_interest.name'); }, icon: '📖',
    get desc() { return t('forgeUp.forge_interest.desc'); },
    get flavor() { return t('forgeUp.forge_interest.flavor'); },
    maxLevel: 3, costPerLevel: [65, 110, 175], category: 'economy',
  },
  {
    id: 'forge_reroll_cost',
    get name() { return t('forgeUp.forge_reroll_cost.name'); }, icon: '🎲',
    get desc() { return t('forgeUp.forge_reroll_cost.desc'); },
    get flavor() { return t('forgeUp.forge_reroll_cost.flavor'); },
    maxLevel: 3, costPerLevel: [50, 85, 130], category: 'economy',
  },
  {
    id: 'forge_recycle_value',
    get name() { return t('forgeUp.forge_recycle_value.name'); }, icon: '⚖️',
    get desc() { return t('forgeUp.forge_recycle_value.desc'); },
    get flavor() { return t('forgeUp.forge_recycle_value.flavor'); },
    maxLevel: 3, costPerLevel: [40, 75, 120], category: 'economy',
  },
  {
    id: 'forge_free_lock',
    get name() { return t('forgeUp.forge_free_lock.name'); }, icon: '🔒',
    get desc() { return t('forgeUp.forge_free_lock.desc'); },
    get flavor() { return t('forgeUp.forge_free_lock.flavor'); },
    maxLevel: 2, costPerLevel: [60, 110], category: 'economy',
  },
  {
    id: 'forge_golden_age',
    get name() { return t('forgeUp.forge_golden_age.name'); }, icon: '🏆',
    get desc() { return t('forgeUp.forge_golden_age.desc'); },
    get flavor() { return t('forgeUp.forge_golden_age.flavor'); },
    maxLevel: 2, costPerLevel: [100, 180], category: 'economy',
  },

  // ── Allies (12) ───────────────────────────────────────────────────────────
  {
    id: 'forge_ally_level',
    get name() { return t('forgeUp.forge_ally_level.name'); }, icon: '⭐',
    get desc() { return t('forgeUp.forge_ally_level.desc'); },
    get flavor() { return t('forgeUp.forge_ally_level.flavor'); },
    maxLevel: 2, costPerLevel: [100, 200], category: 'allies',
  },
  {
    id: 'forge_ally_hp',
    get name() { return t('forgeUp.forge_ally_hp.name'); }, icon: '❤️',
    get desc() { return t('forgeUp.forge_ally_hp.desc'); },
    get flavor() { return t('forgeUp.forge_ally_hp.flavor'); },
    maxLevel: 4, costPerLevel: [50, 80, 120, 170], category: 'allies',
  },
  {
    id: 'forge_summon_discount',
    get name() { return t('forgeUp.forge_summon_discount.name'); }, icon: '📣',
    get desc() { return t('forgeUp.forge_summon_discount.desc'); },
    get flavor() { return t('forgeUp.forge_summon_discount.flavor'); },
    maxLevel: 3, costPerLevel: [60, 100, 150], category: 'allies',
  },
  {
    id: 'forge_fallen_legacy',
    get name() { return t('forgeUp.forge_fallen_legacy.name'); }, icon: '🪦',
    get desc() { return t('forgeUp.forge_fallen_legacy.desc'); },
    get flavor() { return t('forgeUp.forge_fallen_legacy.flavor'); },
    maxLevel: 3, costPerLevel: [70, 130, 200], category: 'allies',
  },
  {
    id: 'forge_hero_vitality',
    get name() { return t('forgeUp.forge_hero_vitality.name'); }, icon: '🛡️',
    get desc() { return t('forgeUp.forge_hero_vitality.desc'); },
    get flavor() { return t('forgeUp.forge_hero_vitality.flavor'); },
    maxLevel: 3, costPerLevel: [60, 100, 160], category: 'allies',
  },
  {
    id: 'forge_vanguard_armor',
    get name() { return t('forgeUp.forge_vanguard_armor.name'); }, icon: '🔰',
    get desc() { return t('forgeUp.forge_vanguard_armor.desc'); },
    get flavor() { return t('forgeUp.forge_vanguard_armor.flavor'); },
    maxLevel: 3, costPerLevel: [55, 95, 150], category: 'allies',
  },
  {
    id: 'forge_rear_range',
    get name() { return t('forgeUp.forge_rear_range.name'); }, icon: '🔭',
    get desc() { return t('forgeUp.forge_rear_range.desc'); },
    get flavor() { return t('forgeUp.forge_rear_range.flavor'); },
    maxLevel: 3, costPerLevel: [50, 90, 140], category: 'allies',
  },
  {
    id: 'forge_gacha_pity',
    get name() { return t('forgeUp.forge_gacha_pity.name'); }, icon: '📿',
    get desc() { return t('forgeUp.forge_gacha_pity.desc'); },
    get flavor() { return t('forgeUp.forge_gacha_pity.flavor'); },
    maxLevel: 3, costPerLevel: [70, 120, 180], category: 'allies',
  },
  {
    id: 'forge_ally_revive',
    get name() { return t('forgeUp.forge_ally_revive.name'); }, icon: '👻',
    get desc() { return t('forgeUp.forge_ally_revive.desc'); },
    get flavor() { return t('forgeUp.forge_ally_revive.flavor'); },
    maxLevel: 2, costPerLevel: [120, 220], category: 'allies',
  },
  {
    id: 'forge_squad_tactics',
    get name() { return t('forgeUp.forge_squad_tactics.name'); }, icon: '⚔️',
    get desc() { return t('forgeUp.forge_squad_tactics.desc'); },
    get flavor() { return t('forgeUp.forge_squad_tactics.flavor'); },
    maxLevel: 3, costPerLevel: [60, 105, 165], category: 'allies',
  },
  {
    id: 'forge_ally_regen',
    get name() { return t('forgeUp.forge_ally_regen.name'); }, icon: '🩹',
    get desc() { return t('forgeUp.forge_ally_regen.desc'); },
    get flavor() { return t('forgeUp.forge_ally_regen.flavor'); },
    maxLevel: 3, costPerLevel: [50, 85, 135], category: 'allies',
  },
  {
    id: 'forge_paragon_rank',
    get name() { return t('forgeUp.forge_paragon_rank.name'); }, icon: '🏅',
    get desc() { return t('forgeUp.forge_paragon_rank.desc'); },
    get flavor() { return t('forgeUp.forge_paragon_rank.flavor'); },
    maxLevel: 2, costPerLevel: [110, 200], category: 'allies',
  },

  // ── Combat (12) ───────────────────────────────────────────────────────────
  {
    id: 'forge_spell_cdr',
    get name() { return t('forgeUp.forge_spell_cdr.name'); }, icon: '✨',
    get desc() { return t('forgeUp.forge_spell_cdr.desc'); },
    get flavor() { return t('forgeUp.forge_spell_cdr.flavor'); },
    maxLevel: 3, costPerLevel: [60, 100, 160], category: 'combat',
  },
  {
    id: 'forge_crit_chance',
    get name() { return t('forgeUp.forge_crit_chance.name'); }, icon: '⚡',
    get desc() { return t('forgeUp.forge_crit_chance.desc'); },
    get flavor() { return t('forgeUp.forge_crit_chance.flavor'); },
    maxLevel: 4, costPerLevel: [50, 80, 120, 170], category: 'combat',
  },
  {
    id: 'forge_xp_gain',
    get name() { return t('forgeUp.forge_xp_gain.name'); }, icon: '📚',
    get desc() { return t('forgeUp.forge_xp_gain.desc'); },
    get flavor() { return t('forgeUp.forge_xp_gain.flavor'); },
    maxLevel: 3, costPerLevel: [40, 70, 110], category: 'combat',
  },
  {
    id: 'forge_blood_pact',
    get name() { return t('forgeUp.forge_blood_pact.name'); }, icon: '🩸',
    get desc() { return t('forgeUp.forge_blood_pact.desc'); },
    get flavor() { return t('forgeUp.forge_blood_pact.flavor'); },
    maxLevel: 1, costPerLevel: [75], category: 'combat',
  },
  {
    id: 'forge_crit_damage',
    get name() { return t('forgeUp.forge_crit_damage.name'); }, icon: '💥',
    get desc() { return t('forgeUp.forge_crit_damage.desc'); },
    get flavor() { return t('forgeUp.forge_crit_damage.flavor'); },
    maxLevel: 3, costPerLevel: [60, 105, 165], category: 'combat',
  },
  {
    id: 'forge_meteor_potency',
    get name() { return t('forgeUp.forge_meteor_potency.name'); }, icon: '☄️',
    get desc() { return t('forgeUp.forge_meteor_potency.desc'); },
    get flavor() { return t('forgeUp.forge_meteor_potency.flavor'); },
    maxLevel: 3, costPerLevel: [70, 120, 185], category: 'combat',
  },
  {
    id: 'forge_freeze_duration',
    get name() { return t('forgeUp.forge_freeze_duration.name'); }, icon: '❄️',
    get desc() { return t('forgeUp.forge_freeze_duration.desc'); },
    get flavor() { return t('forgeUp.forge_freeze_duration.flavor'); },
    maxLevel: 3, costPerLevel: [65, 115, 175], category: 'combat',
  },
  {
    id: 'forge_execute_threshold',
    get name() { return t('forgeUp.forge_execute_threshold.name'); }, icon: '💀',
    get desc() { return t('forgeUp.forge_execute_threshold.desc'); },
    get flavor() { return t('forgeUp.forge_execute_threshold.flavor'); },
    maxLevel: 3, costPerLevel: [75, 130, 200], category: 'combat',
  },
  {
    id: 'forge_proj_speed',
    get name() { return t('forgeUp.forge_proj_speed.name'); }, icon: '💨',
    get desc() { return t('forgeUp.forge_proj_speed.desc'); },
    get flavor() { return t('forgeUp.forge_proj_speed.flavor'); },
    maxLevel: 3, costPerLevel: [45, 80, 125], category: 'combat',
  },
  {
    id: 'forge_status_potency',
    get name() { return t('forgeUp.forge_status_potency.name'); }, icon: '🍂',
    get desc() { return t('forgeUp.forge_status_potency.desc'); },
    get flavor() { return t('forgeUp.forge_status_potency.flavor'); },
    maxLevel: 3, costPerLevel: [60, 100, 155], category: 'combat',
  },
  {
    id: 'forge_global_damage',
    get name() { return t('forgeUp.forge_global_damage.name'); }, icon: '🗡️',
    get desc() { return t('forgeUp.forge_global_damage.desc'); },
    get flavor() { return t('forgeUp.forge_global_damage.flavor'); },
    maxLevel: 4, costPerLevel: [55, 90, 135, 190], category: 'combat',
  },
  {
    id: 'forge_boss_slayer',
    get name() { return t('forgeUp.forge_boss_slayer.name'); }, icon: '🐉',
    get desc() { return t('forgeUp.forge_boss_slayer.desc'); },
    get flavor() { return t('forgeUp.forge_boss_slayer.flavor'); },
    maxLevel: 3, costPerLevel: [80, 140, 220], category: 'combat',
  },
];

export const forgeCost = (id: string, currentLevel: number): number | null => {
  const def = FORGE_UPGRADES.find(u => u.id === id);
  if (!def || currentLevel >= def.maxLevel) return null;
  return def.costPerLevel[currentLevel];
};

const FORGE_KEY = 'grimhold_forge';

export const loadForgeData = (): Record<string, number> => {
  try {
    const s = storage.get(FORGE_KEY);
    return s ? (JSON.parse(s) as Record<string, number>) : {};
  } catch { return {}; }
};

export const saveForgeData = (d: Record<string, number>): void => {
  try { storage.set(FORGE_KEY, JSON.stringify(d)); } catch {}
};
