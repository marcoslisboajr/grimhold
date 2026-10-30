// ══════════════════════════════════════════════════════════════════════
// data/account.ts
// Nível de conta, títulos, avatares, recompensas e persistência do
// perfil. Extraído do GameCanvas.tsx.
//
// i18n: 'label' das recompensas e 'name' dos avatares vêm do i18n
// (chaves 'account.reward.<n>.label' e 'avatar.<id>.name').
//
// Títulos: o perfil guarda o ID do título ('acc_1'), não o texto — o
// registro está em data/titles.ts e o texto vem de 'title.<id>.name'.
// loadProfile() converte sozinho os perfis antigos, que guardavam o
// texto em inglês.
//
// AvatarDef.rarity continua em inglês cravado de propósito: é chave de
// RARITY_COLOR, identificador e não texto de tela.
// ══════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

import { storage } from '../systems/storage';
import { t } from '../../i18n';
import { TITLES, migrateTitleId, migrateTitleIds } from './titles';
export interface AccountReward {
  essence?: number;
  /** ID do título concedido (ver data/titles.ts). NÃO é texto de tela. */
  titleId?: string;
  relic?:   string; // id of the unlocked relic
  label:    string; // texto exibido na UI
}

export interface AccountProfile {
  name:                   string;
  accountLevel:           number;
  accountXP:              number;
  /** ID do título equipado (ver data/titles.ts), '' se nenhum. */
  equippedTitle:          string;
  /** IDs dos títulos desbloqueados. */
  unlockedTitles:         string[];
  unlockedAccountRelics:  string[];
  equippedAvatar?:        string;
  characterMastery?:      Record<string, { level: number; xp: number }>;
  /** Battle pass season avatars unlocked via the pass */
  unlockedPassAvatars?:   string[];
  /** Battle pass season titles unlocked via the pass */
  unlockedPassTitles?:    string[];
  /** Ícones comprados na loja do perfil */
  unlockedShopAvatars?:   string[];
  /** Characters unlocked for selection */
  unlockedCharacters:     string[];
}

export interface AvatarDef {
  id:     string;
  name:   string;
  rarity: string;
  border: string;
  glow:   string;
  bg:     string;
  /** Ícones da loja do perfil: preço em essência (sem preço = liberado). */
  preco?: number;
  /** herói da coleção (loja) */
  heroi?: string;
}

// ---------------------------------------------------------------------------
// XP required per account level
// Smooth curve: early levels fast, late levels slower
// ---------------------------------------------------------------------------

export const ACCOUNT_XP_PER_LEVEL = (level: number): number => {
  if (level <= 10) return 200 + level * 50;
  if (level <= 25) return 700 + level * 80;
  if (level <= 40) return 2700 + level * 120;
  return 7500 + level * 200;
};

// ---------------------------------------------------------------------------
// Titles unlocked at level milestones
// ---------------------------------------------------------------------------

/**
 * @deprecated Ficou aqui só pra não quebrar quem importar. A fonte única
 * dos títulos agora é `data/titles.ts` (TITLES) — use `titlesBySource`
 * e `titleText` em vez deste Record. Os valores continuam sendo o texto
 * em inglês dos saves antigos, NÃO o texto traduzido.
 */
export const ACCOUNT_TITLES: Record<number, string> = Object.fromEntries(
  TITLES.filter(t => t.source === 'account').map(t => [t.level, t.legacy]),
);

// ---------------------------------------------------------------------------
// Level rewards (essence, titles, relics)
// ---------------------------------------------------------------------------

export const ACCOUNT_LEVEL_REWARDS: Record<number, AccountReward> = {
  1:  { titleId: 'acc_1',           get label() { return t('account.reward.1.label'); },       essence: 20   },
  2:  {                              get label() { return t('account.reward.2.label'); },                  essence: 30   },
  3:  {                              get label() { return t('account.reward.3.label'); },                  essence: 40   },
  4:  {                              get label() { return t('account.reward.4.label'); },                  essence: 50   },
  5:  { titleId: 'acc_5',           get label() { return t('account.reward.5.label'); },         essence: 60   },
  6:  {                              get label() { return t('account.reward.6.label'); },                  essence: 50   },
  7:  { relic: 'relic_acc_barrier', get label() { return t('account.reward.7.label'); }, essence: 40   },
  8:  {                              get label() { return t('account.reward.8.label'); },                  essence: 60   },
  9:  {                              get label() { return t('account.reward.9.label'); },                  essence: 70   },
  10: { titleId: 'acc_10',          get label() { return t('account.reward.10.label'); },          essence: 100  },
  11: {                              get label() { return t('account.reward.11.label'); },                  essence: 60   },
  12: {                              get label() { return t('account.reward.12.label'); },                  essence: 80   },
  13: { relic: 'relic_acc_predator',get label() { return t('account.reward.13.label'); }, essence: 60   },
  14: {                              get label() { return t('account.reward.14.label'); },                  essence: 80   },
  15: { titleId: 'acc_15',          get label() { return t('account.reward.15.label'); },      essence: 120  },
  16: {                              get label() { return t('account.reward.16.label'); },                  essence: 80   },
  17: {                              get label() { return t('account.reward.17.label'); },                 essence: 100  },
  18: {                              get label() { return t('account.reward.18.label'); },                 essence: 100  },
  19: { relic: 'relic_acc_ancient', get label() { return t('account.reward.19.label'); },      essence: 80   },
  20: { titleId: 'acc_20',          get label() { return t('account.reward.20.label'); },         essence: 150  },
  21: {                              get label() { return t('account.reward.21.label'); },                 essence: 100  },
  22: {                              get label() { return t('account.reward.22.label'); },                 essence: 120  },
  23: {                              get label() { return t('account.reward.23.label'); },                 essence: 120  },
  24: {                              get label() { return t('account.reward.24.label'); },                 essence: 150  },
  25: { titleId: 'acc_25',          get label() { return t('account.reward.25.label'); },         essence: 200  },
  26: {                              get label() { return t('account.reward.26.label'); },                 essence: 120  },
  27: {                              get label() { return t('account.reward.27.label'); },                 essence: 150  },
  28: {                              get label() { return t('account.reward.28.label'); },                 essence: 150  },
  29: {                              get label() { return t('account.reward.29.label'); },                 essence: 180  },
  30: { titleId: 'acc_30',          get label() { return t('account.reward.30.label'); },      essence: 250, relic: 'relic_acc_warlord' },
  31: {                              get label() { return t('account.reward.31.label'); },                 essence: 150  },
  32: {                              get label() { return t('account.reward.32.label'); },                 essence: 180  },
  33: {                              get label() { return t('account.reward.33.label'); },                 essence: 200  },
  34: {                              get label() { return t('account.reward.34.label'); },                 essence: 200  },
  35: { titleId: 'acc_35',          get label() { return t('account.reward.35.label'); },       essence: 300  },
  36: {                              get label() { return t('account.reward.36.label'); },                 essence: 200  },
  37: {                              get label() { return t('account.reward.37.label'); },                 essence: 250  },
  38: {                              get label() { return t('account.reward.38.label'); },                 essence: 250  },
  39: {                              get label() { return t('account.reward.39.label'); },                 essence: 300  },
  40: { titleId: 'acc_40',          get label() { return t('account.reward.40.label'); },       essence: 400  },
  41: {                              get label() { return t('account.reward.41.label'); },                 essence: 250  },
  42: {                              get label() { return t('account.reward.42.label'); },                 essence: 300  },
  43: {                              get label() { return t('account.reward.43.label'); },                 essence: 300  },
  44: {                              get label() { return t('account.reward.44.label'); },                 essence: 350  },
  45: { titleId: 'acc_45',          get label() { return t('account.reward.45.label'); },       essence: 500  },
  46: {                              get label() { return t('account.reward.46.label'); },                 essence: 300  },
  47: {                              get label() { return t('account.reward.47.label'); },                 essence: 400  },
  48: {                              get label() { return t('account.reward.48.label'); },                 essence: 400  },
  49: {                              get label() { return t('account.reward.49.label'); },                 essence: 500  },
  50: { titleId: 'acc_50',          get label() { return t('account.reward.50.label'); },     essence: 1000 },
};

// ---------------------------------------------------------------------------
// Profile avatars — all allies available as avatar
// ---------------------------------------------------------------------------

export const AVATAR_DEFS: AvatarDef[] = [
  { id: 'mage',        get name() { return t('avatar.mage.name'); },        rarity: 'Common',    border: '#9cabaf', glow: 'rgba(160,178,186,0.45)',  bg: '#181e21' },
  { id: 'archer',      get name() { return t('avatar.archer.name'); },      rarity: 'Common',    border: '#959e87', glow: 'rgba(145,164,132,0.45)',  bg: '#11150f' },
  { id: 'warlock',     get name() { return t('avatar.warlock.name'); },     rarity: 'Uncommon',  border: '#af9bb1', glow: 'rgba(172,152,180,0.45)',  bg: '#0b080c' },
  { id: 'druid',       get name() { return t('avatar.druid.name'); },       rarity: 'Common',    border: '#cbcabc', glow: 'rgba(184,197,176,0.45)', bg: '#0c0e0b' },
  { id: 'necromancer', get name() { return t('avatar.necromancer.name'); }, rarity: 'Semi-Rare', border: '#78866c', glow: 'rgba(110,130,96,0.45)',  bg: '#050505' },
  { id: 'bard',        get name() { return t('avatar.bard.name'); },        rarity: 'Semi-Rare', border: '#bc8e78', glow: 'rgba(181,130,106,0.45)',  bg: '#0a0705' },
  { id: 'jester',      get name() { return t('avatar.jester.name'); },      rarity: 'Legendary', border: '#b98e79', glow: 'rgba(194,172,130,0.45)',  bg: '#0b080c' },
  { id: 'cleric',      get name() { return t('avatar.cleric.name'); },      rarity: 'Common',    border: '#bc8e78', glow: 'rgba(181,130,106,0.45)',  bg: '#0a0705' },
  { id: 'priest',      get name() { return t('avatar.priest.name'); },      rarity: 'Uncommon',  border: '#8398a0', glow: 'rgba(136,158,168,0.45)',  bg: '#0d1012' },
  { id: 'paladin',     get name() { return t('avatar.paladin.name'); },     rarity: 'Common',    border: '#bc8e78', glow: 'rgba(181,130,106,0.35)',  bg: '#0c0f10' },
  { id: 'runesmith',   get name() { return t('avatar.runesmith.name'); },   rarity: 'Rare',      border: '#6d8894', glow: 'rgba(118,143,154,0.45)',  bg: '#0b0d0e' },
  { id: 'sylvanite',   get name() { return t('avatar.sylvanite.name'); },   rarity: 'Rare',      border: '#959e87', glow: 'rgba(145,164,132,0.45)',  bg: '#060706' },
  { id: 'dreadlord',   get name() { return t('avatar.dreadlord.name'); },   rarity: 'Legendary', border: '#9f584e', glow: 'rgba(172,97,86,0.55)',   bg: '#0a0605' },
  { id: 'vex',         get name() { return t('avatar.vex.name'); },         rarity: 'Semi-Rare', border: '#c3b3bf', glow: 'rgba(196,182,202,0.55)', bg: '#110d13' },
  { id: 'zylvara',     get name() { return t('avatar.zylvara.name'); },     rarity: 'Rare',      border: '#b6bebe', glow: 'rgba(178,192,199,0.50)', bg: '#080b0c' },
  { id: 'morrigan',    get name() { return t('avatar.morrigan.name'); },    rarity: 'Legendary', border: '#ac7357', glow: 'rgba(171,113,85,0.55)',  bg: '#0a0705' },
  { id: 'ixara',       get name() { return t('avatar.ixara.name'); },       rarity: 'Semi-Rare', border: '#c3b3bf', glow: 'rgba(184,167,191,0.55)', bg: '#0e0b0f' },
  // ── Season 1 Battle Pass avatars ──────────────────────────────────────
  { id: 'bp_s1_crest',      get name() { return t('avatar.bp_s1_crest.name'); },       rarity: 'Rare',      border: '#9b82a2', glow: 'rgba(154,130,165,0.55)',  bg: '#141015', isBattlePass: true, bpLevel: 7  } as any,
  { id: 'bp_s1_badge',      get name() { return t('avatar.bp_s1_badge.name'); },       rarity: 'Rare',      border: '#8398a0', glow: 'rgba(137,159,168,0.55)',  bg: '#0d1012', isBattlePass: true, bpLevel: 13 } as any,
  { id: 'bp_s1_frame',      get name() { return t('avatar.bp_s1_frame.name'); },       rarity: 'Epic',      border: '#af9bb1', glow: 'rgba(172,152,180,0.65)',  bg: '#101415', isBattlePass: true, bpLevel: 18 } as any,
  { id: 'bp_s1_gold',       get name() { return t('avatar.bp_s1_gold.name'); },         rarity: 'Epic',      border: '#ac7357', glow: 'rgba(171,113,85,0.65)',  bg: '#0a0705', isBattlePass: true, bpLevel: 23 } as any,
  { id: 'bp_s1_gold_frame', get name() { return t('avatar.bp_s1_gold_frame.name'); },  rarity: 'Legendary', border: '#b98e79', glow: 'rgba(194,172,130,0.75)',  bg: '#070603', isBattlePass: true, bpLevel: 28 } as any,
  // ── Loja do perfil (essência) e retratos que faltavam — 24/09/2026 ──
  { id: 'berserker', get name() { return t('avatar.berserker.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e' },
  { id: 'frost_warden', get name() { return t('avatar.frost_warden.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e' },
  { id: 'inquisitor', get name() { return t('avatar.inquisitor.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e' },
  { id: 'yue', get name() { return t('avatar.yue.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e' },
  { id: 'billy', get name() { return t('avatar.billy.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e' },
  { id: 'skin_archer__cacadora', get name() { return t('avatar.skin_archer__cacadora.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'archer' },
  { id: 'skin_bard__menestrel', get name() { return t('avatar.skin_bard__menestrel.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'bard' },
  { id: 'skin_bard__mercador_de_cancoes', get name() { return t('avatar.skin_bard__mercador_de_cancoes.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'bard' },
  { id: 'skin_berserker__brigao', get name() { return t('avatar.skin_berserker__brigao.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'berserker' },
  { id: 'skin_berserker__saqueador', get name() { return t('avatar.skin_berserker__saqueador.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'berserker' },
  { id: 'skin_billy__capitao', get name() { return t('avatar.skin_billy__capitao.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'billy' },
  { id: 'skin_billy__mercador', get name() { return t('avatar.skin_billy__mercador.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'billy' },
  { id: 'skin_cleric__voto_branco', get name() { return t('avatar.skin_cleric__voto_branco.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'cleric' },
  { id: 'skin_dreadlord__sentinela_negro', get name() { return t('avatar.skin_dreadlord__sentinela_negro.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'dreadlord' },
  { id: 'skin_druid__andarilha', get name() { return t('avatar.skin_druid__andarilha.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'druid' },
  { id: 'skin_frost_warden__cavaleiro_de_gelo', get name() { return t('avatar.skin_frost_warden__cavaleiro_de_gelo.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'frost_warden' },
  { id: 'skin_frost_warden__guarda_do_inverno', get name() { return t('avatar.skin_frost_warden__guarda_do_inverno.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'frost_warden' },
  { id: 'skin_hyo__peregrina', get name() { return t('avatar.skin_hyo__peregrina.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'hyo' },
  { id: 'skin_inquisitor__juiz_de_aco', get name() { return t('avatar.skin_inquisitor__juiz_de_aco.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'inquisitor' },
  { id: 'skin_jester__saltimbanco', get name() { return t('avatar.skin_jester__saltimbanco.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'jester' },
  { id: 'skin_mage__aprendiz_rubro', get name() { return t('avatar.skin_mage__aprendiz_rubro.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'mage' },
  { id: 'skin_morrigan__viuva_palida', get name() { return t('avatar.skin_morrigan__viuva_palida.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'morrigan' },
  { id: 'skin_necromancer__capuz_negro', get name() { return t('avatar.skin_necromancer__capuz_negro.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'necromancer' },
  { id: 'skin_paladin__cavaleiro_azul', get name() { return t('avatar.skin_paladin__cavaleiro_azul.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'paladin' },
  { id: 'skin_paladin__cruzado_dourado', get name() { return t('avatar.skin_paladin__cruzado_dourado.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'paladin' },
  { id: 'skin_runesmith__andarilho_runico', get name() { return t('avatar.skin_runesmith__andarilho_runico.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'runesmith' },
  { id: 'skin_sylvanite__batedora_do_bosque', get name() { return t('avatar.skin_sylvanite__batedora_do_bosque.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'sylvanite' },
  { id: 'skin_sylvanite__folha_nova', get name() { return t('avatar.skin_sylvanite__folha_nova.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'sylvanite' },
  { id: 'skin_vex__assassina', get name() { return t('avatar.skin_vex__assassina.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'vex' },
  { id: 'skin_warlock__capuz_do_vazio', get name() { return t('avatar.skin_warlock__capuz_do_vazio.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'warlock' },
  { id: 'skin_warlock__manto_violeta', get name() { return t('avatar.skin_warlock__manto_violeta.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'warlock' },
  { id: 'skin_yue__ensaio', get name() { return t('avatar.skin_yue__ensaio.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'yue' },
  { id: 'skin_yue__tunica_de_palco', get name() { return t('avatar.skin_yue__tunica_de_palco.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'yue' },
  { id: 'skin_zylvara__oraculo_azul', get name() { return t('avatar.skin_zylvara__oraculo_azul.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'zylvara' },
  { id: 'skin_zylvara__vidente', get name() { return t('avatar.skin_zylvara__vidente.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'zylvara' },
  { id: 'skin_mage__erudito_de_jade', get name() { return t('avatar.skin_mage__erudito_de_jade.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'mage' },
  { id: 'skin_mage__chama_de_papel', get name() { return t('avatar.skin_mage__chama_de_papel.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'mage' },
  { id: 'skin_paladin__vigilia_de_luto', get name() { return t('avatar.skin_paladin__vigilia_de_luto.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'paladin' },
  { id: 'skin_berserker__furia_da_savana', get name() { return t('avatar.skin_berserker__furia_da_savana.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'berserker' },
  { id: 'skin_necromancer__coveiro', get name() { return t('avatar.skin_necromancer__coveiro.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'necromancer' },
  { id: 'skin_necromancer__embalsamador_de_neferu', get name() { return t('avatar.skin_necromancer__embalsamador_de_neferu.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'necromancer' },
  { id: 'skin_cleric__voto_das_lanternas', get name() { return t('avatar.skin_cleric__voto_das_lanternas.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'cleric' },
  { id: 'skin_cleric__mestra_do_voto', get name() { return t('avatar.skin_cleric__mestra_do_voto.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'cleric' },
  { id: 'skin_dreadlord__couraca_da_savana', get name() { return t('avatar.skin_dreadlord__couraca_da_savana.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'dreadlord' },
  { id: 'skin_dreadlord__senhor_mestre', get name() { return t('avatar.skin_dreadlord__senhor_mestre.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'dreadlord' },
  { id: 'skin_druid__druida_da_savana', get name() { return t('avatar.skin_druid__druida_da_savana.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'druid' },
  { id: 'skin_druid__guardia_de_jade', get name() { return t('avatar.skin_druid__guardia_de_jade.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'druid' },
  { id: 'skin_frost_warden__guardiao_mestre', get name() { return t('avatar.skin_frost_warden__guardiao_mestre.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'frost_warden' },
  { id: 'skin_hyo__sacerdotisa_de_jade', get name() { return t('avatar.skin_hyo__sacerdotisa_de_jade.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'hyo' },
  { id: 'skin_hyo__noite_das_lanternas', get name() { return t('avatar.skin_hyo__noite_das_lanternas.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'hyo' },
  { id: 'skin_inquisitor__inquisidor_desonrado', get name() { return t('avatar.skin_inquisitor__inquisidor_desonrado.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'inquisitor' },
  { id: 'skin_inquisitor__juiz_dourado', get name() { return t('avatar.skin_inquisitor__juiz_dourado.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'inquisitor' },
  { id: 'skin_runesmith__forjador_da_savana', get name() { return t('avatar.skin_runesmith__forjador_da_savana.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'runesmith' },
  { id: 'skin_runesmith__gravador_de_neferu', get name() { return t('avatar.skin_runesmith__gravador_de_neferu.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'runesmith' },
  { id: 'skin_warlock__capuz_de_luto', get name() { return t('avatar.skin_warlock__capuz_de_luto.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'warlock' },
  { id: 'skin_vex__lamina_de_jade', get name() { return t('avatar.skin_vex__lamina_de_jade.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'vex' },
  { id: 'skin_vex__mascara_de_papel', get name() { return t('avatar.skin_vex__mascara_de_papel.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'vex' },
  { id: 'skin_sylvanite__folha_dourada', get name() { return t('avatar.skin_sylvanite__folha_dourada.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'sylvanite' },
  { id: 'skin_jester__bobo_de_luto', get name() { return t('avatar.skin_jester__bobo_de_luto.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'jester' },
  { id: 'skin_jester__arlequim_de_jade', get name() { return t('avatar.skin_jester__arlequim_de_jade.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'jester' },
  { id: 'skin_bard__cantor_das_lanternas', get name() { return t('avatar.skin_bard__cantor_das_lanternas.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'bard' },
  { id: 'skin_morrigan__bruxa_mestra', get name() { return t('avatar.skin_morrigan__bruxa_mestra.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'morrigan' },
  { id: 'skin_morrigan__viuva_de_neferu', get name() { return t('avatar.skin_morrigan__viuva_de_neferu.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'morrigan' },
  { id: 'skin_zylvara__oraculo_de_neferu', get name() { return t('avatar.skin_zylvara__oraculo_de_neferu.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'zylvara' },
  { id: 'skin_yue__noite_das_lanternas', get name() { return t('avatar.skin_yue__noite_das_lanternas.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'yue' },
  { id: 'skin_billy__noite_de_estreia', get name() { return t('avatar.skin_billy__noite_de_estreia.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'billy' },
  { id: 'skin_ixara__chama_de_gelo', get name() { return t('avatar.skin_ixara__chama_de_gelo.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'ixara' },
  { id: 'skin_ixara__furia_dourada', get name() { return t('avatar.skin_ixara__furia_dourada.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'ixara' },
  { id: 'skin_ixara__furia_sombria', get name() { return t('avatar.skin_ixara__furia_sombria.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'ixara' },
  { id: 'skin_ixara__tentadora_infernal', get name() { return t('avatar.skin_ixara__tentadora_infernal.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'ixara' },
  { id: 'skin_archer__cavaleira_da_estepe', get name() { return t('avatar.skin_archer__cavaleira_da_estepe.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'archer' },
  { id: 'skin_archer__arqueira_de_luto', get name() { return t('avatar.skin_archer__arqueira_de_luto.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'archer' },
  { id: 'skin_frost_warden__sombra_da_nevasca', get name() { return t('avatar.skin_frost_warden__sombra_da_nevasca.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'frost_warden' },
  { id: 'skin_paladin__cavaleiro_do_lago', get name() { return t('avatar.skin_paladin__cavaleiro_do_lago.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'paladin' },
  { id: 'skin_cleric__donzela_do_cerco', get name() { return t('avatar.skin_cleric__donzela_do_cerco.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'cleric' },
  { id: 'skin_necromancer__rei_do_tumulo_gelado', get name() { return t('avatar.skin_necromancer__rei_do_tumulo_gelado.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'necromancer' },
  { id: 'skin_billy__andarilho_do_poente', get name() { return t('avatar.skin_billy__andarilho_do_poente.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'billy' },
  { id: 'skin_berserker__barbaro_das_terras_frias', get name() { return t('avatar.skin_berserker__barbaro_das_terras_frias.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'berserker' },
  { id: 'skin_mage__mago_errante', get name() { return t('avatar.skin_mage__mago_errante.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'mage' },
  { id: 'skin_inquisitor__cacador_do_crepusculo', get name() { return t('avatar.skin_inquisitor__cacador_do_crepusculo.name'); }, rarity: 'Rare', border: '#6d8894', glow: 'rgba(118,143,154,0.45)', bg: '#0b0d0e', preco: 250, heroi: 'inquisitor' },
  { id: 'maestria_mage', get name() { return t('avatar.maestria.name', { nome: t('avatar.mage.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'mage' },
  { id: 'maestria_archer', get name() { return t('avatar.maestria.name', { nome: t('avatar.archer.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'archer' },
  { id: 'maestria_warlock', get name() { return t('avatar.maestria.name', { nome: t('avatar.warlock.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'warlock' },
  { id: 'maestria_druid', get name() { return t('avatar.maestria.name', { nome: t('avatar.druid.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'druid' },
  { id: 'maestria_necromancer', get name() { return t('avatar.maestria.name', { nome: t('avatar.necromancer.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'necromancer' },
  { id: 'maestria_bard', get name() { return t('avatar.maestria.name', { nome: t('avatar.bard.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'bard' },
  { id: 'maestria_jester', get name() { return t('avatar.maestria.name', { nome: t('avatar.jester.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'jester' },
  { id: 'maestria_cleric', get name() { return t('avatar.maestria.name', { nome: t('avatar.cleric.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'cleric' },
  { id: 'maestria_priest', get name() { return t('avatar.maestria.name', { nome: t('avatar.priest.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'priest' },
  { id: 'maestria_paladin', get name() { return t('avatar.maestria.name', { nome: t('avatar.paladin.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'paladin' },
  { id: 'maestria_runesmith', get name() { return t('avatar.maestria.name', { nome: t('avatar.runesmith.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'runesmith' },
  { id: 'maestria_sylvanite', get name() { return t('avatar.maestria.name', { nome: t('avatar.sylvanite.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'sylvanite' },
  { id: 'maestria_dreadlord', get name() { return t('avatar.maestria.name', { nome: t('avatar.dreadlord.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'dreadlord' },
  { id: 'maestria_vex', get name() { return t('avatar.maestria.name', { nome: t('avatar.vex.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'vex' },
  { id: 'maestria_zylvara', get name() { return t('avatar.maestria.name', { nome: t('avatar.zylvara.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'zylvara' },
  { id: 'maestria_morrigan', get name() { return t('avatar.maestria.name', { nome: t('avatar.morrigan.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'morrigan' },
  { id: 'maestria_ixara', get name() { return t('avatar.maestria.name', { nome: t('avatar.ixara.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'ixara' },
  { id: 'maestria_berserker', get name() { return t('avatar.maestria.name', { nome: t('avatar.berserker.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'berserker' },
  { id: 'maestria_frost_warden', get name() { return t('avatar.maestria.name', { nome: t('avatar.frost_warden.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'frost_warden' },
  { id: 'maestria_inquisitor', get name() { return t('avatar.maestria.name', { nome: t('avatar.inquisitor.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'inquisitor' },
  { id: 'maestria_yue', get name() { return t('avatar.maestria.name', { nome: t('avatar.yue.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'yue' },
  { id: 'maestria_billy', get name() { return t('avatar.maestria.name', { nome: t('avatar.billy.name') }); }, rarity: 'Legendary', border: '#e8b04a', glow: 'rgba(232,176,74,0.55)', bg: '#140e06', preco: 250, heroi: 'billy' },
];

// ---------------------------------------------------------------------------
// Colors by rarity — used in avatar and ally cards
// ---------------------------------------------------------------------------

export const RARITY_COLOR: Record<string, string> = {
  'Common':    '#80776c',
  'Uncommon':  '#78866c',
  'Semi-Rare': '#8398a0',
  'Rare':      '#af9bb1',
  'Legendary': '#ac7357',
};

// ---------------------------------------------------------------------------
// Profile persistence in localStorage
// ---------------------------------------------------------------------------

const STORAGE_KEY = 'grimhold_profile';

/**
 * Reads the saved profile. Returns null if it doesn't exist or errors.
 *
 * MIGRAÇÃO DE TÍTULOS: perfis salvos antes da i18n guardam o TEXTO em
 * inglês ('Novice Guardian'); agora guardamos o ID ('acc_1'). Como este
 * é o único ponto de leitura do perfil, converter aqui cobre o jogo
 * inteiro. Valor que já é id passa direto, então rodar de novo é
 * inofensivo. A gravação em ID acontece no próximo saveProfile.
 */
export const loadProfile = (): AccountProfile | null => {
  try {
    const s = storage.get(STORAGE_KEY);
    if (!s) return null;
    const p = JSON.parse(s) as AccountProfile;
    return {
      ...p,
      unlockedTitles: migrateTitleIds(p.unlockedTitles),
      equippedTitle:  migrateTitleId(p.equippedTitle ?? ''),
    };
  } catch {
    return null;
  }
};

/** Salva o perfil (localStorage + Steam Cloud mirror). */
export const saveProfile = (p: AccountProfile): void => {
  try {
    storage.set(STORAGE_KEY, JSON.stringify(p));
  } catch { /* silent fail */ }
};

/**
 * Faz merge seguro do perfil: nunca sobrescreve progresso existente.
 * Use whenever partially updating the profile (e.g. grant XP, title).
 *
 * - characterMastery, unlockedTitles and unlockedAccountRelics are always
 *   merged (never replaced).
 * - Other fields only change if explicitly passed in `partial`.
 */
export const mergeAndSaveProfile = (partial: Partial<AccountProfile>): AccountProfile => {
  const existing = loadProfile() ?? {};

  const merged: AccountProfile = {
    name:                  '',
    accountLevel:          0,
    accountXP:             0,
    equippedTitle:         '',
    ...(existing as Partial<AccountProfile>),
    ...(partial as Partial<AccountProfile>),
    // Arrays que nunca podem encolher:
    characterMastery: {
      ...((existing as AccountProfile).characterMastery ?? {}),
      ...(partial.characterMastery ?? {}),
    },
    unlockedTitles: [
      ...new Set([
        ...((existing as AccountProfile).unlockedTitles ?? []),
        ...(partial.unlockedTitles ?? []),
      ]),
    ],
    unlockedAccountRelics: [
      ...new Set([
        ...((existing as AccountProfile).unlockedAccountRelics ?? []),
        ...(partial.unlockedAccountRelics ?? []),
      ]),
    ],
    unlockedCharacters: [
      ...new Set([
        ...((existing as AccountProfile).unlockedCharacters ?? ['mage', 'archer', 'paladin']),
        ...(partial.unlockedCharacters ?? []),
      ]),
    ],
  };

  saveProfile(merged);
  return merged;
};
