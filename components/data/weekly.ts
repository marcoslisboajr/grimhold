// ══════════════════════════════════════════════════════════════════════
// data/weekly.ts  (now: Daily Challenge system)
// Deterministic seed — same day = same challenge for all players.
// No backend required.
// ══════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Types
// ---------------------------------------------------------------------------

import { storage } from '../systems/storage';
import { t } from '../../i18n';
export type WeeklyStat =
  | 'enemiesKilled'
  | 'totalDamage'
  | 'totalHealed'
  | 'critHits'
  | 'shotsFired'
  | 'goldEarned'
  | 'highestWave'
  | 'victory'
  | 'runCount';

export interface WeeklyObjective {
  id:                 string;
  label:              string;
  description:        string;
  icon:               string;
  target:             number;
  stat:               WeeklyStat;
  requireDifficulty?: string;
  requireMode?:       string;
  requireWave?:       number;
}

export interface WeeklyChallenge {
  weekKey:       string; // now "YYYY-MM-DD" — kept as weekKey for GameCanvas compat
  objectives:    WeeklyObjective[];
  essenceReward: number;
}

export interface WeeklyProgress {
  weekKey:    string;  // "YYYY-MM-DD" — kept as weekKey for GameCanvas compat
  progress:   Record<string, number>;
  completed:  boolean;
  claimedAt?: number;
}

// ---------------------------------------------------------------------------
// Objective pool
// ---------------------------------------------------------------------------

export const ALL_WEEKLY_OBJECTIVES: WeeklyObjective[] = [
  // Kills
  { id: 'wk_kills_200', get label() { return t('weekly.wk_kills_200.label'); },    get description() { return t('weekly.wk_kills_200.description'); },  icon: '💀', target: 200,    stat: 'enemiesKilled' },
  { id: 'wk_kills_400', get label() { return t('weekly.wk_kills_400.label'); },    get description() { return t('weekly.wk_kills_400.description'); },  icon: '💀', target: 400,    stat: 'enemiesKilled' },
  { id: 'wk_kills_600', get label() { return t('weekly.wk_kills_600.label'); },    get description() { return t('weekly.wk_kills_600.description'); },  icon: '☠️', target: 600,    stat: 'enemiesKilled' },

  // Damage
  { id: 'wk_damage_50k',  get label() { return t('weekly.wk_damage_50k.label'); },  get description() { return t('weekly.wk_damage_50k.description'); },   icon: '⚔️', target: 50000,  stat: 'totalDamage' },
  { id: 'wk_damage_150k', get label() { return t('weekly.wk_damage_150k.label'); }, get description() { return t('weekly.wk_damage_150k.description'); },  icon: '🗡️', target: 150000, stat: 'totalDamage' },

  // Healing
  { id: 'wk_healed_5k', get label() { return t('weekly.wk_healed_5k.label'); }, get description() { return t('weekly.wk_healed_5k.description'); }, icon: '💚', target: 5000, stat: 'totalHealed' },

  // Crits
  { id: 'wk_crits_100', get label() { return t('weekly.wk_crits_100.label'); }, get description() { return t('weekly.wk_crits_100.description'); }, icon: '⚡', target: 100, stat: 'critHits' },
  { id: 'wk_crits_300', get label() { return t('weekly.wk_crits_300.label'); }, get description() { return t('weekly.wk_crits_300.description'); }, icon: '⚡', target: 300, stat: 'critHits' },

  // Gold
  { id: 'wk_gold_2000', get label() { return t('weekly.wk_gold_2000.label'); }, get description() { return t('weekly.wk_gold_2000.description'); }, icon: '🪙', target: 2000, stat: 'goldEarned' },
  { id: 'wk_gold_5000', get label() { return t('weekly.wk_gold_5000.label'); }, get description() { return t('weekly.wk_gold_5000.description'); }, icon: '💰', target: 5000, stat: 'goldEarned' },

  // Waves
  { id: 'wk_wave15', get label() { return t('weekly.wk_wave15.label'); }, get description() { return t('weekly.wk_wave15.description'); }, icon: '🌊', target: 15, stat: 'highestWave' },
  { id: 'wk_wave25', get label() { return t('weekly.wk_wave25.label'); }, get description() { return t('weekly.wk_wave25.description'); }, icon: '🌊', target: 25, stat: 'highestWave' },
  { id: 'wk_wave40', get label() { return t('weekly.wk_wave40.label'); }, get description() { return t('weekly.wk_wave40.description'); },  icon: '🔱', target: 40, stat: 'highestWave' },

  // Victory
  { id: 'wk_victory',      get label() { return t('weekly.wk_victory.label'); },              get description() { return t('weekly.wk_victory.description'); },            icon: '🏆', target: 1, stat: 'victory' },
  { id: 'wk_victory_hard', get label() { return t('weekly.wk_victory_hard.label'); },              get description() { return t('weekly.wk_victory_hard.description'); },          icon: '🔥', target: 1, stat: 'victory', requireDifficulty: 'hard' },
  { id: 'wk_victory_act2', get label() { return t('weekly.wk_victory_act2.label'); },  get description() { return t('weekly.wk_victory_act2.description'); },        icon: '🌿', target: 1, stat: 'victory', requireMode: 'act2' },
  { id: 'wk_victory_act3', get label() { return t('weekly.wk_victory_act3.label'); },       get description() { return t('weekly.wk_victory_act3.description'); },     icon: '🗿', target: 1, stat: 'victory', requireMode: 'act3' },
  { id: 'wk_victory_act4', get label() { return t('weekly.wk_victory_act4.label'); },         get description() { return t('weekly.wk_victory_act4.description'); },                icon: '👁️', target: 1, stat: 'victory', requireMode: 'act4' },
  { id: 'wk_victory_act5', get label() { return t('weekly.wk_victory_act5.label'); },          get description() { return t('weekly.wk_victory_act5.description'); },       icon: '💀', target: 1, stat: 'victory', requireMode: 'act5' },

  // Runs
  { id: 'wk_runs_3', get label() { return t('weekly.wk_runs_3.label'); }, get description() { return t('weekly.wk_runs_3.description'); }, icon: '🎮', target: 3, stat: 'runCount' },
  { id: 'wk_runs_5', get label() { return t('weekly.wk_runs_5.label'); }, get description() { return t('weekly.wk_runs_5.description'); }, icon: '🎮', target: 5, stat: 'runCount' },

  // Endless
  { id: 'wk_endless_60', get label() { return t('weekly.wk_endless_60.label'); }, get description() { return t('weekly.wk_endless_60.description'); }, icon: '♾️', target: 60, stat: 'highestWave', requireMode: 'endless' },
  { id: 'wk_endless_90', get label() { return t('weekly.wk_endless_90.label'); }, get description() { return t('weekly.wk_endless_90.description'); }, icon: '♾️', target: 90, stat: 'highestWave', requireMode: 'endless' },

  // Shots
  { id: 'wk_shots_500', get label() { return t('weekly.wk_shots_500.label'); }, get description() { return t('weekly.wk_shots_500.description'); }, icon: '🏹', target: 500, stat: 'shotsFired' },

  // Cursed
  { id: 'wk_cursed_win', get label() { return t('weekly.wk_cursed_win.label'); }, get description() { return t('weekly.wk_cursed_win.description'); }, icon: '☠️', target: 1, stat: 'victory', requireMode: 'cursed' },
];

// ---------------------------------------------------------------------------
// Key helpers
// ---------------------------------------------------------------------------

/**
 * Returns today's date key as "YYYY-MM-DD" (UTC).
 * Stored in weekKey field for GameCanvas backward compatibility.
 * Same day = same challenge for every player worldwide.
 */
export const getDayKey = (): string => {
  const now = new Date();
  const y = now.getUTCFullYear();
  const m = String(now.getUTCMonth() + 1).padStart(2, '0');
  const d = String(now.getUTCDate()).padStart(2, '0');
  return `${y}-${m}-${d}`;
};

/**
 * Kept for GameCanvas import compatibility.
 * Now returns the daily key instead of the weekly ISO key.
 */
export const getWeekKey = getDayKey;

// ---------------------------------------------------------------------------
// Seeded RNG — same seed always produces same sequence
// ---------------------------------------------------------------------------

const seededRand = (seed: string): (() => number) => {
  let h = 0;
  for (let i = 0; i < seed.length; i++) {
    h = (Math.imul(31, h) + seed.charCodeAt(i)) | 0;
  }
  return () => {
    h = (Math.imul(2654435761, h ^ (h >>> 16))) | 0;
    return (h >>> 0) / 4294967296;
  };
};

// ---------------------------------------------------------------------------
// Challenge generation
// ---------------------------------------------------------------------------

/**
 * Generates 3 unique objectives for the given day key.
 * The same key always produces the same objectives — no backend needed.
 * Kept as generateWeeklyChallenge for GameCanvas import compatibility.
 */
export const generateWeeklyChallenge = (weekKey: string): WeeklyChallenge => {
  const rand = seededRand(weekKey);
  const pool = [...ALL_WEEKLY_OBJECTIVES];

  // Fisher-Yates shuffle with seed
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(rand() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  return {
    weekKey,
    objectives:    pool.slice(0, 3),
    essenceReward: 40,
  };
};

/** Alias — use this going forward */
export const generateDailyChallenge = generateWeeklyChallenge;

// ---------------------------------------------------------------------------
// Persistence
// ---------------------------------------------------------------------------

const WEEKLY_KEY = 'grimhold_daily'; // new key — clears old weekly data

/** Reads saved daily progress. Returns null if none exists. */
export const loadWeeklyProgress = (): WeeklyProgress | null => {
  try {
    const s = storage.get(WEEKLY_KEY);
    return s ? (JSON.parse(s) as WeeklyProgress) : null;
  } catch {
    return null;
  }
};

/** Saves daily progress (localStorage + Steam Cloud mirror). */
export const saveWeeklyProgress = (p: WeeklyProgress): void => {
  try {
    storage.set(WEEKLY_KEY, JSON.stringify(p));
  } catch { /* silent fail */ }
};
