// ══════════════════════════════════════════════════════════════════════
// data/achievements.ts
// Conquistas, mapa indexado para lookup O(1) e persistência em
// localStorage. Extraído do GameCanvas.tsx.
// O texto (title/description) vem do i18n, por GETTERS. Para mexer no
// texto, edite i18n/locales/en.json na chave 'achievement.<id>.*'.
// ══════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

import { storage } from '../systems/storage';
import { t } from '../../i18n';
export type AchievementCategory = 'progress' | 'boss' | 'secret';

export interface AchievementDef {
  id:            string;
  title:         string;
  description:   string;
  icon:          string;
  category:      AchievementCategory;
  essenceReward: number;
  maxProgress?:  number; // if > 1, it's a progress-based achievement
  secret?:       boolean; // hidden until unlocked
}

export interface AchievementState {
  unlockedAt?: number; // timestamp ms
  progress?:   number; // para conquistas baseadas em progresso
}

// ---------------------------------------------------------------------------
// Full achievement definitions
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_DEFS: AchievementDef[] = [

  // ── Progresso ─────────────────────────────────────────────────────────────
  { id: 'wave_5',       get title() { return t('achievement.wave_5.title'); },        get description() { return t('achievement.wave_5.description'); },                           icon: '🩸', category: 'progress', essenceReward: 10  },
  { id: 'wave_10',      get title() { return t('achievement.wave_10.title'); },         get description() { return t('achievement.wave_10.description'); },                                       icon: '🌊', category: 'progress', essenceReward: 18  },
  { id: 'wave_25',      get title() { return t('achievement.wave_25.title'); },             get description() { return t('achievement.wave_25.description'); },                                       icon: '⚔️', category: 'progress', essenceReward: 35  },
  { id: 'wave_40',      get title() { return t('achievement.wave_40.title'); },           get description() { return t('achievement.wave_40.description'); },         icon: '🔩', category: 'progress', essenceReward: 50  },
  { id: 'wave_50',      get title() { return t('achievement.wave_50.title'); },    get description() { return t('achievement.wave_50.description'); },         icon: '🏆', category: 'progress', essenceReward: 80  },

  { id: 'kills_50',     get title() { return t('achievement.kills_50.title'); },       get description() { return t('achievement.kills_50.description'); },                            icon: '🗡️', category: 'progress', essenceReward: 12  },
  { id: 'kills_100',    get title() { return t('achievement.kills_100.title'); },       get description() { return t('achievement.kills_100.description'); },                           icon: '💀', category: 'progress', essenceReward: 20  },
  { id: 'kills_500',    get title() { return t('achievement.kills_500.title'); },      get description() { return t('achievement.kills_500.description'); },                           icon: '☠️', category: 'progress', essenceReward: 45  },
  { id: 'kills_2000',   get title() { return t('achievement.kills_2000.title'); },    get description() { return t('achievement.kills_2000.description'); },                          icon: '💫', category: 'progress', essenceReward: 80  },
  { id: 'kills_5000',   get title() { return t('achievement.kills_5000.title'); },    get description() { return t('achievement.kills_5000.description'); },                   icon: '🌀', category: 'progress', essenceReward: 120 },

  { id: 'gold_500',     get title() { return t('achievement.gold_500.title'); },      get description() { return t('achievement.gold_500.description'); },                       icon: '🪙', category: 'progress', essenceReward: 15  },
  { id: 'gold_1000',    get title() { return t('achievement.gold_1000.title'); },     get description() { return t('achievement.gold_1000.description'); },                      icon: '💰', category: 'progress', essenceReward: 30  },
  { id: 'gold_2500',    get title() { return t('achievement.gold_2500.title'); },           get description() { return t('achievement.gold_2500.description'); },                      icon: '💎', category: 'progress', essenceReward: 50  },

  { id: 'score_5000',   get title() { return t('achievement.score_5000.title'); },     get description() { return t('achievement.score_5000.description'); },                                   icon: '⭐', category: 'progress', essenceReward: 25  },
  { id: 'score_20000',  get title() { return t('achievement.score_20000.title'); },     get description() { return t('achievement.score_20000.description'); },                                  icon: '🌠', category: 'progress', essenceReward: 60  },

  { id: 'allies_max',   get title() { return t('achievement.allies_max.title'); },           get description() { return t('achievement.allies_max.description'); },                        icon: '👥', category: 'progress', essenceReward: 20  },
  { id: 'levelup_5',    get title() { return t('achievement.levelup_5.title'); },         get description() { return t('achievement.levelup_5.description'); },                                icon: '✨', category: 'progress', essenceReward: 20  },
  { id: 'levelup_10',   get title() { return t('achievement.levelup_10.title'); },            get description() { return t('achievement.levelup_10.description'); },                               icon: '🌟', category: 'progress', essenceReward: 40  },

  { id: 'shop_buy_5',   get title() { return t('achievement.shop_buy_5.title'); },      get description() { return t('achievement.shop_buy_5.description'); },  icon: '🛒', category: 'progress', essenceReward: 18, maxProgress: 5  },
  { id: 'shop_buy_15',  get title() { return t('achievement.shop_buy_15.title'); },             get description() { return t('achievement.shop_buy_15.description'); }, icon: '🏪', category: 'progress', essenceReward: 40, maxProgress: 15 },

  { id: 'first_run',    get title() { return t('achievement.first_run.title'); },        get description() { return t('achievement.first_run.description'); },                                icon: '🚀', category: 'progress', essenceReward: 10  },
  { id: 'sell_ally',    get title() { return t('achievement.sell_ally.title'); }, get description() { return t('achievement.sell_ally.description'); },                                        icon: '💸', category: 'progress', essenceReward: 8   },
  { id: 'use_spell',    get title() { return t('achievement.use_spell.title'); },        get description() { return t('achievement.use_spell.description'); },                         icon: '🔮', category: 'progress', essenceReward: 8   },
  { id: 'summon_10',    get title() { return t('achievement.summon_10.title'); },           get description() { return t('achievement.summon_10.description'); }, icon: '🎰', category: 'progress', essenceReward: 15, maxProgress: 10 },

  { id: 'hard_win',     get title() { return t('achievement.hard_win.title'); },            get description() { return t('achievement.hard_win.description'); },                  icon: '🗿', category: 'progress', essenceReward: 80  },
  { id: 'cursed_win',   get title() { return t('achievement.cursed_win.title'); }, get description() { return t('achievement.cursed_win.description'); },                     icon: '🌀', category: 'progress', essenceReward: 90  },
  { id: 'endless_60',   get title() { return t('achievement.endless_60.title'); },      get description() { return t('achievement.endless_60.description'); },                       icon: '♾️', category: 'progress', essenceReward: 70  },
  { id: 'endless_80',   get title() { return t('achievement.endless_80.title'); },         get description() { return t('achievement.endless_80.description'); },                       icon: '🔱', category: 'progress', essenceReward: 100 },
  { id: 'endless_120',  get title() { return t('achievement.endless_120.title'); },      get description() { return t('achievement.endless_120.description'); },      icon: '🌀', category: 'progress', essenceReward: 130 },
  { id: 'randomizer_win',get title() { return t('achievement.randomizer_win.title'); },      get description() { return t('achievement.randomizer_win.description'); },                        icon: '🎲', category: 'progress', essenceReward: 70  },

  // ── Bosses ────────────────────────────────────────────────────────────────
  { id: 'boss_goblin_king',    get title() { return t('achievement.boss_goblin_king.title'); },          get description() { return t('achievement.boss_goblin_king.description'); },                               icon: '👑', category: 'boss', essenceReward: 25  },
  { id: 'boss_orc_warlord',    get title() { return t('achievement.boss_orc_warlord.title'); },         get description() { return t('achievement.boss_orc_warlord.description'); },                                           icon: '🪓', category: 'boss', essenceReward: 25  },
  { id: 'boss_grim_reaper',    get title() { return t('achievement.boss_grim_reaper.title'); },           get description() { return t('achievement.boss_grim_reaper.description'); },                                               icon: '🌑', category: 'boss', essenceReward: 25  },
  { id: 'boss_elf_arcanist',   get title() { return t('achievement.boss_elf_arcanist.title'); },         get description() { return t('achievement.boss_elf_arcanist.description'); },                               icon: '🌿', category: 'boss', essenceReward: 20  },
  { id: 'boss_elf',            get title() { return t('achievement.boss_elf.title'); },             get description() { return t('achievement.boss_elf.description'); },                                         icon: '🌅', category: 'boss', essenceReward: 25  },
  { id: 'boss_minotaur_king',  get title() { return t('achievement.boss_minotaur_king.title'); },          get description() { return t('achievement.boss_minotaur_king.description'); },                                       icon: '🐂', category: 'boss', essenceReward: 40  },
  { id: 'boss_dragon_lord',    get title() { return t('achievement.boss_dragon_lord.title'); },           get description() { return t('achievement.boss_dragon_lord.description'); },                                               icon: '🐉', category: 'boss', essenceReward: 40  },
  { id: 'boss_half_brothers',  get title() { return t('achievement.boss_half_brothers.title'); },             get description() { return t('achievement.boss_half_brothers.description'); },                           icon: '👊', category: 'boss', essenceReward: 50  },
  { id: 'boss_vampire_lord',   get title() { return t('achievement.boss_vampire_lord.title'); }, get description() { return t('achievement.boss_vampire_lord.description'); },                                        icon: '🧛', category: 'boss', essenceReward: 40  },
  { id: 'boss_demon',          get title() { return t('achievement.boss_demon.title'); },                get description() { return t('achievement.boss_demon.description'); },                                     icon: '😈', category: 'boss', essenceReward: 40  },
  { id: 'boss_malachar',       get title() { return t('achievement.boss_malachar.title'); },      get description() { return t('achievement.boss_malachar.description'); },                           icon: '🔥', category: 'boss', essenceReward: 120 },
  { id: 'act2_complete',       get title() { return t('achievement.act2_complete.title'); },           get description() { return t('achievement.act2_complete.description'); },                            icon: '🌿', category: 'boss', essenceReward: 80  },
  { id: 'act3_complete',       get title() { return t('achievement.act3_complete.title'); },            get description() { return t('achievement.act3_complete.description'); },                     icon: '🗿', category: 'boss', essenceReward: 100 },
  { id: 'act4_complete',       get title() { return t('achievement.act4_complete.title'); },          get description() { return t('achievement.act4_complete.description'); },                    icon: '👁️', category: 'boss', essenceReward: 130 },
  { id: 'act5_complete',       get title() { return t('achievement.act5_complete.title'); },          get description() { return t('achievement.act5_complete.description'); },        icon: '💀', category: 'boss', essenceReward: 200 },
  { id: 'act6_complete',       get title() { return t('achievement.act6_complete.title'); },          get description() { return t('achievement.act6_complete.description'); },        icon: '🌙', category: 'boss', essenceReward: 200 },
  { id: 'act7_complete',       get title() { return t('achievement.act7_complete.title'); },          get description() { return t('achievement.act7_complete.description'); },        icon: '🐸', category: 'boss', essenceReward: 220 },
  { id: 'act8_complete',       get title() { return t('achievement.act8_complete.title'); },          get description() { return t('achievement.act8_complete.description'); },        icon: '🌊', category: 'boss', essenceReward: 240 },
  { id: 'act9_complete',       get title() { return t('achievement.act9_complete.title'); },          get description() { return t('achievement.act9_complete.description'); },        icon: '🗿', category: 'boss', essenceReward: 260 },
  { id: 'act10_complete',      get title() { return t('achievement.act10_complete.title'); },         get description() { return t('achievement.act10_complete.description'); },       icon: '🌀', category: 'boss', essenceReward: 280 },
  { id: 'all_acts_complete',   get title() { return t('achievement.all_acts_complete.title'); },           get description() { return t('achievement.all_acts_complete.description'); },                                            icon: '🏆', category: 'boss', essenceReward: 300 },

  // ── Secretas ──────────────────────────────────────────────────────────────
  { id: 'secret_no_damage_wave',  get title() { return t('achievement.secret_no_damage_wave.title'); }, get description() { return t('achievement.secret_no_damage_wave.description'); },                          icon: '🛡️', category: 'secret', essenceReward: 35,  secret: true },
  { id: 'secret_all_bosses',      get title() { return t('achievement.secret_all_bosses.title'); },      get description() { return t('achievement.secret_all_bosses.description'); },                                          icon: '🌟', category: 'secret', essenceReward: 100, secret: true },
  { id: 'secret_infernal_win',    get title() { return t('achievement.secret_infernal_win.title'); }, get description() { return t('achievement.secret_infernal_win.description'); },                                                  icon: '💥', category: 'secret', essenceReward: 200, secret: true },
  { id: 'secret_crit_kill_boss',  get title() { return t('achievement.secret_crit_kill_boss.title'); },       get description() { return t('achievement.secret_crit_kill_boss.description'); },                                             icon: '⚡', category: 'secret', essenceReward: 45,  secret: true },
  { id: 'secret_full_hp_wave20',  get title() { return t('achievement.secret_full_hp_wave20.title'); },    get description() { return t('achievement.secret_full_hp_wave20.description'); },                                   icon: '🏰', category: 'secret', essenceReward: 55,  secret: true },
  { id: 'secret_3_necros',        get title() { return t('achievement.secret_3_necros.title'); },   get description() { return t('achievement.secret_3_necros.description'); },                                        icon: '💀', category: 'secret', essenceReward: 45,  secret: true },
  { id: 'secret_speed2_win',      get title() { return t('achievement.secret_speed2_win.title'); },     get description() { return t('achievement.secret_speed2_win.description'); },                                                 icon: '⏩', category: 'secret', essenceReward: 25,  secret: true },
  { id: 'secret_barrier_10hp',    get title() { return t('achievement.secret_barrier_10hp.title'); },        get description() { return t('achievement.secret_barrier_10hp.description'); },                            icon: '💔', category: 'secret', essenceReward: 45,  secret: true },
  { id: 'secret_lv10_ally',       get title() { return t('achievement.secret_lv10_ally.title'); },     get description() { return t('achievement.secret_lv10_ally.description'); },                                                icon: '🏅', category: 'secret', essenceReward: 55,  secret: true },
  { id: 'secret_rare_summon',     get title() { return t('achievement.secret_rare_summon.title'); },     get description() { return t('achievement.secret_rare_summon.description'); },                              icon: '🎲', category: 'secret', essenceReward: 35,  secret: true },
  { id: 'secret_no_shop',         get title() { return t('achievement.secret_no_shop.title'); },          get description() { return t('achievement.secret_no_shop.description'); },                         icon: '🧘', category: 'secret', essenceReward: 65,  secret: true },
  { id: 'secret_all_synergies',   get title() { return t('achievement.secret_all_synergies.title'); },    get description() { return t('achievement.secret_all_synergies.description'); },                           icon: '🔧', category: 'secret', essenceReward: 50,  secret: true },
  { id: 'secret_win_first',       get title() { return t('achievement.secret_win_first.title'); },      get description() { return t('achievement.secret_win_first.description'); },                                         icon: '🎉', category: 'secret', essenceReward: 50,  secret: true },
  { id: 'secret_giant_killer',    get title() { return t('achievement.secret_giant_killer.title'); },       get description() { return t('achievement.secret_giant_killer.description'); },                  icon: '🗿', category: 'secret', essenceReward: 75,  secret: true },
  { id: 'secret_void_walker',     get title() { return t('achievement.secret_void_walker.title'); },        get description() { return t('achievement.secret_void_walker.description'); },                                         icon: '🌑', category: 'secret', essenceReward: 65,  secret: true },
  { id: 'secret_true_ending',     get title() { return t('achievement.secret_true_ending.title'); },        get description() { return t('achievement.secret_true_ending.description'); },                                             icon: '⭐', category: 'secret', essenceReward: 500, secret: true },
  { id: 'secret_troll_slayer',    get title() { return t('achievement.secret_troll_slayer.title'); },       get description() { return t('achievement.secret_troll_slayer.description'); },                                              icon: '🌿', category: 'secret', essenceReward: 35,  secret: true },
  { id: 'secret_dragon_hoard',    get title() { return t('achievement.secret_dragon_hoard.title'); },   get description() { return t('achievement.secret_dragon_hoard.description'); },                  icon: '🐉', category: 'secret', essenceReward: 45,  secret: true },
  { id: 'secret_bloodless_act',   get title() { return t('achievement.secret_bloodless_act.title'); },          get description() { return t('achievement.secret_bloodless_act.description'); },                icon: '🏰', category: 'secret', essenceReward: 120, secret: true },
  { id: 'secret_cheap_victory',   get title() { return t('achievement.secret_cheap_victory.title'); },      get description() { return t('achievement.secret_cheap_victory.description'); },                             icon: '🪙', category: 'secret', essenceReward: 90,  secret: true },

  // ── Hero unlocks (Conquest) — condition visible on purpose ────────────────
  { id: 'conquest_dreadlord',     get title() { return t('achievement.conquest_dreadlord.title'); },    get description() { return t('achievement.conquest_dreadlord.description'); }, icon: '👑', category: 'secret', essenceReward: 150 },
  { id: 'conquest_morrigan',      get title() { return t('achievement.conquest_morrigan.title'); },  get description() { return t('achievement.conquest_morrigan.description'); },            icon: '🦅', category: 'secret', essenceReward: 100 },
  { id: 'conquest_necromancer',   get title() { return t('achievement.conquest_necromancer.title'); }, get description() { return t('achievement.conquest_necromancer.description'); },              icon: '💀', category: 'secret', essenceReward: 120 },
  { id: 'conquest_berserker',     get title() { return t('achievement.conquest_berserker.title'); },       get description() { return t('achievement.conquest_berserker.description'); },                icon: '🩸', category: 'secret', essenceReward: 130 },
  { id: 'conquest_inquisitor',    get title() { return t('achievement.conquest_inquisitor.title'); },     get description() { return t('achievement.conquest_inquisitor.description'); },      icon: '⚖️', category: 'secret', essenceReward: 110 },
  { id: 'conquest_frost_warden',  get title() { return t('achievement.conquest_frost_warden.title'); },      get description() { return t('achievement.conquest_frost_warden.description'); },      icon: '❄️', category: 'secret', essenceReward: 110 },
  { id: 'conquest_zylvara',       get title() { return t('achievement.conquest_zylvara.title'); },      get description() { return t('achievement.conquest_zylvara.description'); },                   icon: '🗡️', category: 'secret', essenceReward: 120 },
  { id: 'conquest_bard',          get title() { return t('achievement.conquest_bard.title'); },     get description() { return t('achievement.conquest_bard.description'); },          icon: '🎵', category: 'secret', essenceReward: 100 },
  { id: 'conquest_malachar_human', get title() { return t('achievement.conquest_malachar_human.title'); },      get description() { return t('achievement.conquest_malachar_human.description'); },                icon: '🌟', category: 'secret', essenceReward: 500 },
];

// ---------------------------------------------------------------------------
// Mapa indexado para lookups O(1) por id (evita .find() em cada kill)
// ---------------------------------------------------------------------------

export const ACHIEVEMENT_MAP = new Map<string, AchievementDef>(
  ACHIEVEMENT_DEFS.map(d => [d.id, d])
);

// ---------------------------------------------------------------------------
// localStorage persistence
// ---------------------------------------------------------------------------

const ACH_KEY = 'grimhold_achievements';

/** Reads the saved achievement state. Returns empty object if no data. */
export const loadAchievements = (): Record<string, AchievementState> => {
  try {
    const s = storage.get(ACH_KEY);
    return s ? (JSON.parse(s) as Record<string, AchievementState>) : {};
  } catch {
    return {};
  }
};

/** Salva o estado de conquistas (localStorage + Steam Cloud mirror). */
export const saveAchievements = (state: Record<string, AchievementState>): void => {
  try {
    storage.set(ACH_KEY, JSON.stringify(state));
  } catch { /* silent fail */ }
};
