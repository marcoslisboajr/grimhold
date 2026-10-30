// ══════════════════════════════════════════════════════════════════════
// data/titles.ts
// Registro único dos títulos do jogador (nível de conta + passe).
//
// POR QUE ESTE ARQUIVO EXISTE
// Antes, o save guardava o TEXTO do título ('Novice Guardian') e o jogo
// comparava por texto (`unlockedTitles.includes(reward.title)`). Isso
// impedia traduzir: em português o texto não bateria com o que estava
// salvo — o título seria concedido de novo e o equipado deixaria de
// casar. Agora o save guarda um ID estável ('acc_1') e o texto vem do
// i18n na hora de exibir.
//
// `legacy` é o texto em inglês que existe nos saves ANTIGOS. Serve só
// para migrar perfis uma vez (ver migrateTitleIds). NÃO mexa nesses
// valores — eles são o formato de save antigo, não texto de tela.
// Para mudar o que aparece na tela, edite i18n/locales/en.json na chave
// 'title.<id>.name'.
// ══════════════════════════════════════════════════════════════════════

import { t } from '../../i18n';

export type TitleSource = 'account' | 'pass' | 'hero';

export interface TitleDef {
  /** ID estável — é isto que vai pro save. Nunca traduzir. */
  id:     string;
  /** De onde vem: nível de conta ou passe de batalha. */
  source: TitleSource;
  /** Nível que concede o título. */
  level:  number;
  /** Texto em inglês dos saves antigos — só para migração. */
  legacy: string;
  /** Títulos de herói: de qual herói é a coleção e o preço em essência (0 = só por conquista). */
  heroi?: string;
  preco?: number;
}

export const TITLES: TitleDef[] = [
  // ── Níveis de conta ──────────────────────────────────────────────
  { id: 'acc_1',  source: 'account', level: 1,  legacy: 'Novice Guardian'   },
  { id: 'acc_5',  source: 'account', level: 5,  legacy: 'Iron Sentinel'     },
  { id: 'acc_10', source: 'account', level: 10, legacy: 'Stone Warden'      },
  { id: 'acc_15', source: 'account', level: 15, legacy: 'Veteran Defender'  },
  { id: 'acc_20', source: 'account', level: 20, legacy: 'Elite Bulwark'     },
  { id: 'acc_25', source: 'account', level: 25, legacy: 'Shadow Keeper'     },
  { id: 'acc_30', source: 'account', level: 30, legacy: 'Arcane Protector'  },
  { id: 'acc_35', source: 'account', level: 35, legacy: 'Undying Rampart'   },
  { id: 'acc_40', source: 'account', level: 40, legacy: 'Eternal Bastion'   },
  { id: 'acc_45', source: 'account', level: 45, legacy: 'Mythic Guardian'   },
  { id: 'acc_50', source: 'account', level: 50, legacy: 'The Last Guardian' },
  // ── Passe de batalha (Season 1) ──────────────────────────────────
  { id: 'bp_3',   source: 'pass',    level: 3,  legacy: 'Awakened'                  },
  { id: 'bp_9',   source: 'pass',    level: 9,  legacy: 'Sentinel'                  },
  { id: 'bp_17',  source: 'pass',    level: 17, legacy: "Grimhold's Chosen"         },
  { id: 'bp_22',  source: 'pass',    level: 22, legacy: 'Keeper of the Gate'        },
  { id: 'bp_27',  source: 'pass',    level: 27, legacy: 'Sentinel of the Awakening' },
  { id: 'bp_30',  source: 'pass',    level: 30, legacy: 'The Last Grimhold'         },
  // ── Coleção de heróis (loja do perfil, essência) — 24/09/2026 ─────
  { id: 'h_mage_1', source: 'hero', level: 0, legacy: 'Singed', heroi: 'mage', preco: 150 },
  { id: 'h_mage_2', source: 'hero', level: 0, legacy: 'Ember Heart', heroi: 'mage', preco: 150 },
  { id: 'h_archer_1', source: 'hero', level: 0, legacy: 'Hawkeye', heroi: 'archer', preco: 150 },
  { id: 'h_archer_2', source: 'hero', level: 0, legacy: 'Patient Arrow', heroi: 'archer', preco: 150 },
  { id: 'h_paladin_1', source: 'hero', level: 0, legacy: 'Dawnshield', heroi: 'paladin', preco: 150 },
  { id: 'h_paladin_2', source: 'hero', level: 0, legacy: 'Iron Vow', heroi: 'paladin', preco: 150 },
  { id: 'h_cleric_1', source: 'hero', level: 0, legacy: 'Mending Hand', heroi: 'cleric', preco: 150 },
  { id: 'h_cleric_2', source: 'hero', level: 0, legacy: 'Vigil Light', heroi: 'cleric', preco: 150 },
  { id: 'h_druid_1', source: 'hero', level: 0, legacy: 'Ancient Root', heroi: 'druid', preco: 150 },
  { id: 'h_druid_2', source: 'hero', level: 0, legacy: 'Child of Seasons', heroi: 'druid', preco: 150 },
  { id: 'h_priest_1', source: 'hero', level: 0, legacy: 'Voice of the Temple', heroi: 'priest', preco: 150 },
  { id: 'h_priest_2', source: 'hero', level: 0, legacy: 'Silent Prayer', heroi: 'priest', preco: 150 },
  { id: 'h_warlock_1', source: 'hero', level: 0, legacy: 'Dark Pact', heroi: 'warlock', preco: 150 },
  { id: 'h_warlock_2', source: 'hero', level: 0, legacy: 'Void Gaze', heroi: 'warlock', preco: 150 },
  { id: 'h_necromancer_1', source: 'hero', level: 0, legacy: 'Gravekeeper', heroi: 'necromancer', preco: 150 },
  { id: 'h_necromancer_2', source: 'hero', level: 0, legacy: 'Caller of the Dead', heroi: 'necromancer', preco: 150 },
  { id: 'h_bard_1', source: 'hero', level: 0, legacy: 'Last Song', heroi: 'bard', preco: 150 },
  { id: 'h_bard_2', source: 'hero', level: 0, legacy: 'Chest of Melodies', heroi: 'bard', preco: 150 },
  { id: 'h_runesmith_1', source: 'hero', level: 0, legacy: 'Runehand', heroi: 'runesmith', preco: 150 },
  { id: 'h_runesmith_2', source: 'hero', level: 0, legacy: 'Silent Forge', heroi: 'runesmith', preco: 150 },
  { id: 'h_sylvanite_1', source: 'hero', level: 0, legacy: 'Child of the Wild', heroi: 'sylvanite', preco: 150 },
  { id: 'h_sylvanite_2', source: 'hero', level: 0, legacy: 'Gentle Thorn', heroi: 'sylvanite', preco: 150 },
  { id: 'h_dreadlord_1', source: 'hero', level: 0, legacy: 'Lord of Dread', heroi: 'dreadlord', preco: 150 },
  { id: 'h_dreadlord_2', source: 'hero', level: 0, legacy: 'Hollow Armor', heroi: 'dreadlord', preco: 150 },
  { id: 'h_jester_1', source: 'hero', level: 0, legacy: 'Court\'s Laughter', heroi: 'jester', preco: 150 },
  { id: 'h_jester_2', source: 'hero', level: 0, legacy: 'Last to Laugh', heroi: 'jester', preco: 150 },
  { id: 'h_vex_1', source: 'hero', level: 0, legacy: 'Pink Blade', heroi: 'vex', preco: 150 },
  { id: 'h_vex_2', source: 'hero', level: 0, legacy: 'Unseen Step', heroi: 'vex', preco: 150 },
  { id: 'h_zylvara_1', source: 'hero', level: 0, legacy: 'Serene Venom', heroi: 'zylvara', preco: 150 },
  { id: 'h_zylvara_2', source: 'hero', level: 0, legacy: 'Leaping Shadow', heroi: 'zylvara', preco: 150 },
  { id: 'h_morrigan_1', source: 'hero', level: 0, legacy: 'Ash Witch', heroi: 'morrigan', preco: 150 },
  { id: 'h_morrigan_2', source: 'hero', level: 0, legacy: 'Price of the Wall', heroi: 'morrigan', preco: 150 },
  { id: 'h_ixara_1', source: 'hero', level: 0, legacy: 'Sweet Fury', heroi: 'ixara', preco: 150 },
  { id: 'h_ixara_2', source: 'hero', level: 0, legacy: 'Abyssal Flame', heroi: 'ixara', preco: 150 },
  { id: 'h_berserker_1', source: 'hero', level: 0, legacy: 'Hot Blood', heroi: 'berserker', preco: 150 },
  { id: 'h_berserker_2', source: 'hero', level: 0, legacy: 'The Unyielding', heroi: 'berserker', preco: 150 },
  { id: 'h_frost_warden_1', source: 'hero', level: 0, legacy: 'Frozen Wall', heroi: 'frost_warden', preco: 150 },
  { id: 'h_frost_warden_2', source: 'hero', level: 0, legacy: 'Endless Winter', heroi: 'frost_warden', preco: 150 },
  { id: 'h_inquisitor_1', source: 'hero', level: 0, legacy: 'Steel Judge', heroi: 'inquisitor', preco: 150 },
  { id: 'h_inquisitor_2', source: 'hero', level: 0, legacy: 'Final Sentence', heroi: 'inquisitor', preco: 150 },
  { id: 'h_yue_1', source: 'hero', level: 0, legacy: 'Star of the Stage', heroi: 'yue', preco: 150 },
  { id: 'h_yue_2', source: 'hero', level: 0, legacy: 'Full House', heroi: 'yue', preco: 150 },
  { id: 'h_billy_1', source: 'hero', level: 0, legacy: 'The Fifth Shot', heroi: 'billy', preco: 150 },
  { id: 'h_billy_2', source: 'hero', level: 0, legacy: 'Steady Hand', heroi: 'billy', preco: 150 },
  { id: 'h_malachar_human_1', source: 'hero', level: 0, legacy: 'Keeper of the Door', heroi: 'malachar_human', preco: 0 },
  { id: 'h_malachar_human_2', source: 'hero', level: 0, legacy: 'Four Hundred Years', heroi: 'malachar_human', preco: 0 },
];

const BY_ID     = new Map(TITLES.map(t => [t.id, t]));
const BY_LEGACY = new Map(TITLES.map(t => [t.legacy, t.id]));

export const getTitle = (id: string): TitleDef | undefined => BY_ID.get(id);

/** Títulos de um tipo, na ordem de nível. */
export const titlesBySource = (source: TitleSource): TitleDef[] =>
  TITLES.filter(t => t.source === source);

/**
 * Texto do título para exibir. Resolve no momento da chamada, então
 * trocar de idioma vale na hora.
 * Um id desconhecido (save de uma versão futura, por exemplo) volta como
 * está — a tela mostra algo em vez de sumir com o título do jogador.
 */
export const titleText = (id: string): string =>
  id ? t(`title.${id}.name`, BY_ID.get(id)?.legacy ?? id) : '';

/**
 * Migra UM valor salvo: se for texto antigo em inglês, vira id; se já for
 * id (ou for desconhecido), passa direto.
 */
export const migrateTitleId = (saved: string): string =>
  BY_LEGACY.get(saved) ?? saved;

/** Migra a lista de títulos desbloqueados, sem duplicar. */
export const migrateTitleIds = (saved: string[] | undefined): string[] =>
  [...new Set((saved ?? []).map(migrateTitleId))];
