// ══════════════════════════════════════════════════════════════════════
// data/battlePass.ts
// Season 1: The Grimhold Awakening — passe de batalha gratuito.
// Sem React/canvas — dados puros + persistência.
//
// i18n PARCIAL: 'name'/'subtitle' da season e o 'label' de cada nível vêm
// do i18n ('season.season1.*' e 'battlepass.level.<n>.label').
// As recompensas de titulo guardam um ID ('bp_3'), nao o texto — o
// registro esta em data/titles.ts e o texto vem de 'title.<id>.name'.
// ══════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

import { storage } from '../systems/storage';
import { t } from '../../i18n';
import { MATERIAL, INK } from './materials';
export type BPRewardType = 'essence' | 'title' | 'avatar' | 'card' | 'hero';

export interface BPReward {
  type:     BPRewardType;
  /** Essence amount (type === 'essence') */
  amount?:  number;
  /** ID do titulo concedido (ver data/titles.ts) — NAO e texto de tela */
  titleId?: string;
  /** Avatar id (type === 'avatar') */
  avatarId?: string;
  /** Shop card id (type === 'card') */
  cardId?:  string;
  /** Hero type to unlock (type === 'hero') */
  heroId?:  string;
  /** Display label */
  label:    string;
  /** Icon shown in the track */
  icon:     string;
  /** Rarity color hint for cards/avatars */
  rarity?:  'common' | 'rare' | 'epic' | 'legendary';
}

export interface BPLevel {
  level:   number;
  xpNeeded: number; // XP needed to reach THIS level from the previous one
  reward:  BPReward;
}

export interface BattlePassProgress {
  season:        string;     // e.g. 'season1'
  currentLevel:  number;     // 0 = not started
  currentXP:     number;     // XP accumulated toward next level
  claimedLevels: number[];   // which level rewards have been collected
}

// ---------------------------------------------------------------------------
// Season metadata
// ---------------------------------------------------------------------------

export const CURRENT_SEASON = 'season1';

export const SEASON_META = {
  season1: {
    get name() { return t('season.season1.name'); },
    get subtitle() { return t('season.season1.subtitle'); },
    color:     MATERIAL.amethyst.base,
    accent:    INK.base,
    icon:      '⚔️',
    maxLevel:  30,
  },
} as const;

// ---------------------------------------------------------------------------
// XP curve — returns XP needed to advance FROM level to level+1
// ---------------------------------------------------------------------------

export const BP_XP_FOR_LEVEL = (level: number): number => {
  if (level <= 5)  return 500;
  if (level <= 10) return 800;
  if (level <= 15) return 1200;
  if (level <= 20) return 1800;
  if (level <= 25) return 2500;
  return 3500; // 26-30
};

// ---------------------------------------------------------------------------
// XP rewards per run
// ---------------------------------------------------------------------------

export const BP_XP_PER_RUN = {
  base:         150,  // just finishing a run
  perWave:       15,  // per wave reached
  perKill:        2,  // per enemy killed
  victoryBonus: 100,  // completing an act
} as const;

/**
 * Calculate total XP earned at the end of a run.
 */
export const calcRunXP = (waves: number, kills: number, won: boolean): number =>
  BP_XP_PER_RUN.base +
  waves * BP_XP_PER_RUN.perWave +
  kills * BP_XP_PER_RUN.perKill +
  (won ? BP_XP_PER_RUN.victoryBonus : 0);

// ---------------------------------------------------------------------------
// Season 1 track — 30 levels
// ---------------------------------------------------------------------------

export const BATTLE_PASS_LEVELS: BPLevel[] = [
  { level: 1,  xpNeeded: 500,  reward: { type: 'essence', amount: 50,   get label() { return t('battlepass.level.1.label'); },                     icon: '💎' } },
  { level: 2,  xpNeeded: 500,  reward: { type: 'essence', amount: 75,   get label() { return t('battlepass.level.2.label'); },                     icon: '💎' } },
  { level: 3,  xpNeeded: 500,  reward: { type: 'title',   titleId: 'bp_3',              get label() { return t('battlepass.level.3.label'); },             icon: '📜', rarity: 'common' } },
  { level: 4,  xpNeeded: 500,  reward: { type: 'essence', amount: 100,  get label() { return t('battlepass.level.4.label'); },                    icon: '💎' } },
  { level: 5,  xpNeeded: 500,  reward: { type: 'card',    cardId: 'bp_awakened_blade',  get label() { return t('battlepass.level.5.label'); },        icon: '⚔️', rarity: 'rare' } },
  { level: 6,  xpNeeded: 800,  reward: { type: 'essence', amount: 125,  get label() { return t('battlepass.level.6.label'); },                    icon: '💎' } },
  { level: 7,  xpNeeded: 800,  reward: { type: 'avatar',  avatarId: 'bp_s1_crest',      get label() { return t('battlepass.level.7.label'); },      icon: '🛡️', rarity: 'rare' } },
  { level: 8,  xpNeeded: 800,  reward: { type: 'essence', amount: 150,  get label() { return t('battlepass.level.8.label'); },                    icon: '💎' } },
  { level: 9,  xpNeeded: 800,  reward: { type: 'title',   titleId: 'bp_9',              get label() { return t('battlepass.level.9.label'); },             icon: '📜', rarity: 'common' } },
  { level: 10, xpNeeded: 800,  reward: { type: 'card',    cardId: 'bp_gold_rush',       get label() { return t('battlepass.level.10.label'); },             icon: '💰', rarity: 'rare' } },
  { level: 11, xpNeeded: 1200, reward: { type: 'essence', amount: 175,  get label() { return t('battlepass.level.11.label'); },                    icon: '💎' } },
  { level: 12, xpNeeded: 1200, reward: { type: 'essence', amount: 200,  get label() { return t('battlepass.level.12.label'); },                    icon: '💎' } },
  { level: 13, xpNeeded: 1200, reward: { type: 'avatar',  avatarId: 'bp_s1_badge',      get label() { return t('battlepass.level.13.label'); },      icon: '🏅', rarity: 'rare' } },
  { level: 14, xpNeeded: 1200, reward: { type: 'essence', amount: 225,  get label() { return t('battlepass.level.14.label'); },                    icon: '💎' } },
  { level: 15, xpNeeded: 1200, reward: { type: 'card',    cardId: 'bp_grimhold_pact',   get label() { return t('battlepass.level.15.label'); },       icon: '📖', rarity: 'epic' } },
  { level: 16, xpNeeded: 1800, reward: { type: 'essence', amount: 250,  get label() { return t('battlepass.level.16.label'); },                    icon: '💎' } },
  { level: 17, xpNeeded: 1800, reward: { type: 'title',   titleId: 'bp_17',             get label() { return t('battlepass.level.17.label'); },    icon: '📜', rarity: 'rare' } },
  { level: 18, xpNeeded: 1800, reward: { type: 'avatar',  avatarId: 'bp_s1_frame',      get label() { return t('battlepass.level.18.label'); },      icon: '✨', rarity: 'epic' } },
  { level: 19, xpNeeded: 1800, reward: { type: 'essence', amount: 300,  get label() { return t('battlepass.level.19.label'); },                    icon: '💎' } },
  { level: 20, xpNeeded: 1800, reward: { type: 'card',    cardId: 'bp_soul_surge',      get label() { return t('battlepass.level.20.label'); },            icon: '💜', rarity: 'epic' } },
  { level: 21, xpNeeded: 2500, reward: { type: 'essence', amount: 350,  get label() { return t('battlepass.level.21.label'); },                    icon: '💎' } },
  { level: 22, xpNeeded: 2500, reward: { type: 'title',   titleId: 'bp_22',             get label() { return t('battlepass.level.22.label'); },   icon: '📜', rarity: 'rare' } },
  { level: 23, xpNeeded: 2500, reward: { type: 'avatar',  avatarId: 'bp_s1_gold',       get label() { return t('battlepass.level.23.label'); },        icon: '👑', rarity: 'epic' } },
  { level: 24, xpNeeded: 2500, reward: { type: 'essence', amount: 400,  get label() { return t('battlepass.level.24.label'); },                    icon: '💎' } },
  { level: 25, xpNeeded: 2500, reward: { type: 'card',    cardId: 'bp_last_stand',      get label() { return t('battlepass.level.25.label'); },        icon: '🔥', rarity: 'legendary' } },
  { level: 26, xpNeeded: 3500, reward: { type: 'essence', amount: 500,  get label() { return t('battlepass.level.26.label'); },                    icon: '💎' } },
  { level: 27, xpNeeded: 3500, reward: { type: 'title',   titleId: 'bp_27',                   get label() { return t('battlepass.level.27.label'); }, icon: '📜', rarity: 'epic' } },
  { level: 28, xpNeeded: 3500, reward: { type: 'avatar',  avatarId: 'bp_s1_gold_frame', get label() { return t('battlepass.level.28.label'); }, icon: '🌟', rarity: 'legendary' } },
  { level: 29, xpNeeded: 3500, reward: { type: 'essence', amount: 750,  get label() { return t('battlepass.level.29.label'); },                    icon: '💎' } },
  { level: 30, xpNeeded: 3500, reward: { type: 'hero',    heroId: 'jester',             get label() { return t('battlepass.level.30.label'); }, icon: '🃏', rarity: 'legendary' } },
];

// As cartas exclusivas da Season 1 (id, título, desc, custo, raridade,
// efeito) vivem em data/shopPools.ts → POOL_SEASON1_CARDS, já com i18n
// (chaves 'shop.bp_*'). Isso é o que o jogo de fato usa.

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const BP_STORAGE_KEY = 'grimhold_battlepass_s1';

export const loadBattlePass = (): BattlePassProgress => {
  try {
    const s = storage.get(BP_STORAGE_KEY);
    if (s) return JSON.parse(s) as BattlePassProgress;
  } catch { /* silent */ }
  return { season: CURRENT_SEASON, currentLevel: 0, currentXP: 0, claimedLevels: [] };
};

export const saveBattlePass = (p: BattlePassProgress): void => {
  try { storage.set(BP_STORAGE_KEY, JSON.stringify(p)); } catch { /* silent */ }
};

/**
 * Add XP to the battle pass, level up if needed.
 * Returns the updated progress AND an array of newly unlocked levels.
 */
export const addBattlePassXP = (
  current: BattlePassProgress,
  xp: number,
): { progress: BattlePassProgress; newLevels: number[] } => {
  const MAX = SEASON_META.season1.maxLevel;
  let { currentLevel, currentXP } = current;
  const newLevels: number[] = [];

  currentXP += xp;

  while (currentLevel < MAX) {
    const needed = BP_XP_FOR_LEVEL(currentLevel + 1);
    if (currentXP >= needed) {
      currentXP -= needed;
      currentLevel++;
      newLevels.push(currentLevel);
    } else {
      break;
    }
  }

  // At max level, cap XP
  if (currentLevel >= MAX) currentXP = 0;

  const progress: BattlePassProgress = { ...current, currentLevel, currentXP };
  saveBattlePass(progress);
  return { progress, newLevels };
};

/**
 * Mark a level as claimed.
 */
export const claimBPLevel = (current: BattlePassProgress, level: number): BattlePassProgress => {
  if (current.claimedLevels.includes(level)) return current;
  const updated = { ...current, claimedLevels: [...current.claimedLevels, level].sort((a, b) => a - b) };
  saveBattlePass(updated);
  return updated;
};

/**
 * Returns all card IDs unlocked by the current battle pass level.
 */
export const getUnlockedBPCards = (level: number): string[] =>
  BATTLE_PASS_LEVELS
    .filter(l => l.level <= level && l.reward.type === 'card' && l.reward.cardId)
    .map(l => l.reward.cardId!);

/**
 * Returns all avatar IDs unlocked by the current battle pass level.
 */
export const getUnlockedBPAvatars = (level: number): string[] =>
  BATTLE_PASS_LEVELS
    .filter(l => l.level <= level && l.reward.type === 'avatar' && l.reward.avatarId)
    .map(l => l.reward.avatarId!);

/**
 * IDs dos titulos desbloqueados ate o nivel atual do passe.
 * (Antes devolvia o texto em ingles; agora devolve id — ver data/titles.ts.)
 */
export const getUnlockedBPTitles = (level: number): string[] =>
  BATTLE_PASS_LEVELS
    .filter(l => l.level <= level && l.reward.type === 'title' && l.reward.titleId)
    .map(l => l.reward.titleId!);
