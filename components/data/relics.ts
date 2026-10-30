// ══════════════════════════════════════════════════════════════════════
// data/relics.ts
// Relíquias de run, extraídas do GameCanvas.tsx.
// Depende de: uid (systems/combat), ACCOUNT_RELICS (data/allies)
// O texto (name/desc/flavor/tag) vem do i18n, por GETTERS. Para mexer no
// texto, edite i18n/locales/en.json na chave 'relic.<id>.*'.
// ══════════════════════════════════════════════════════════════════════

import { uid } from '../systems/combat';
import { ACCOUNT_RELICS } from './allies';
import { t } from '../../i18n';

// ---------------------------------------------------------------------------
// Base relic type
// ---------------------------------------------------------------------------

export interface RelicDef {
  id:     string;
  name:   string;
  icon:   string;
  desc:   string;
  flavor: string;
  color:  string;
  border: string;
  glow:   string;
  tag:    string;
  apply:  (p: any, starterChars?: any[], findEmptySlot?: (allies: any[]) => any) => any;
}

// ---------------------------------------------------------------------------
// Full definitions
// ---------------------------------------------------------------------------

export const RELIC_DEFS: RelicDef[] = [

  // ── Ofensivas ─────────────────────────────────────────────────────────────
  {
    id: 'relic_bloodpact', get name() { return t('relic.relic_bloodpact.name'); }, icon: '🩸',
    get desc() { return t('relic.relic_bloodpact.desc'); },
    get flavor() { return t('relic.relic_bloodpact.flavor'); },
    color: '#c59993', border: '#6b3b34', glow: 'rgba(206,162,155,0.25)',
    get tag() { return t('relic.relic_bloodpact.tag'); },
    apply: (p: any) => ({
      ...p,
      allies: p.allies.map((a: any) => ({
        ...a,
        damage: Math.round(a.damage * 1.25),
        maxHp:  Math.round(a.maxHp  * 0.80),
        hp:     Math.round(a.hp     * 0.80),
      })),
    }),
  },
  {
    id: 'relic_warcry', get name() { return t('relic.relic_warcry.name'); }, icon: '📯',
    get desc() { return t('relic.relic_warcry.desc'); },
    get flavor() { return t('relic.relic_warcry.flavor'); },
    color: '#bc8e78', border: '#603f2f', glow: 'rgba(189,144,122,0.25)',
    get tag() { return t('relic.relic_warcry.tag'); },
    apply: (p: any) => ({ ...p, relicWarcry: true }),
  },
  {
    id: 'relic_overkill', get name() { return t('relic.relic_overkill.name'); }, icon: '💥',
    get desc() { return t('relic.relic_overkill.desc'); },
    get flavor() { return t('relic.relic_overkill.flavor'); },
    color: '#a8745a', border: '#603f2f', glow: 'rgba(176,148,95,0.25)',
    get tag() { return t('relic.relic_overkill.tag'); },
    apply: (p: any) => ({ ...p, overkillEnabled: true }),
  },
  {
    id: 'relic_critchain', get name() { return t('relic.relic_critchain.name'); }, icon: '⚡',
    get desc() { return t('relic.relic_critchain.desc'); },
    get flavor() { return t('relic.relic_critchain.flavor'); },
    color: '#c3b3bf', border: '#5a4860', glow: 'rgba(198,185,204,0.25)',
    get tag() { return t('relic.relic_critchain.tag'); },
    apply: (p: any) => ({ ...p, relicCritChain: true }),
  },

  // ── Defensivas ────────────────────────────────────────────────────────────
  {
    id: 'relic_ironwall', get name() { return t('relic.relic_ironwall.name'); }, icon: '🏰',
    get desc() { return t('relic.relic_ironwall.desc'); },
    get flavor() { return t('relic.relic_ironwall.flavor'); },
    color: '#9cabaf', border: '#344045', glow: 'rgba(160,178,186,0.25)',
    get tag() { return t('relic.relic_ironwall.tag'); },
    apply: (p: any) => ({ ...p, relicIronWall: true }),
  },
  {
    id: 'relic_phoenix', get name() { return t('relic.relic_phoenix.name'); }, icon: '🔥',
    get desc() { return t('relic.relic_phoenix.desc'); },
    get flavor() { return t('relic.relic_phoenix.flavor'); },
    color: '#bc8e78', border: '#603f2f', glow: 'rgba(189,144,122,0.25)',
    get tag() { return t('relic.relic_phoenix.tag'); },
    apply: (p: any) => ({ ...p, relicPhoenix: true }),
  },
  {
    id: 'relic_guardian', get name() { return t('relic.relic_guardian.name'); }, icon: '🛡️',
    get desc() { return t('relic.relic_guardian.desc'); },
    get flavor() { return t('relic.relic_guardian.flavor'); },
    color: '#959e87', border: '#30392a', glow: 'rgba(145,164,132,0.25)',
    get tag() { return t('relic.relic_guardian.tag'); },
    apply: (p: any, starterChars: any[] = [], findEmptySlot: (allies: any[]) => any = () => ({ col: 1, row: 1 })) => {
      const base = starterChars.find(c => c.type === 'paladin');
      if (!base || p.allies.length >= p.maxAllies) return p;
      const slot = findEmptySlot(p.allies);
      const guardian: any = {
        id: `relic-guardian-${Date.now()}`,
        type: 'paladin', level: 5, isHero: false,
        damage:         Math.round((base.damage  || 12) * (1 + 4 * 0.10)),
        attackSpeed:    base.attackSpeed || 900,
        range:          Math.round((base.range   || 480) * (1 + 4 * 0.02)),
        projectileSpeed:base.projectileSpeed || 8,
        color:          base.color || 'text-[#bc8e78]',
        hp:             Math.round((base.maxHp   || 60) * (1 + 4 * 0.08)),
        maxHp:          Math.round((base.maxHp   || 60) * (1 + 4 * 0.08)),
        perks: {}, gridPosition: slot, lastShotTime: 0, attackCooldown: 0, isAttacking: false,
      };
      return { ...p, allies: [...p.allies, guardian] };
    },
  },

  // ── Economic ────────────────────────────────────────────────────────────
  {
    id: 'relic_goldvein', get name() { return t('relic.relic_goldvein.name'); }, icon: '💰',
    get desc() { return t('relic.relic_goldvein.desc'); },
    get flavor() { return t('relic.relic_goldvein.flavor'); },
    color: '#bc8e78', border: '#603f2f', glow: 'rgba(181,130,106,0.25)',
    get tag() { return t('relic.relic_goldvein.tag'); },
    apply: (p: any) => ({ ...p, gold: (p.gold || 0) + 50, relicGoldVein: true }),
  },
  {
    id: 'relic_merchant', get name() { return t('relic.relic_merchant.name'); }, icon: '🪙',
    get desc() { return t('relic.relic_merchant.desc'); },
    get flavor() { return t('relic.relic_merchant.flavor'); },
    color: '#78866c', border: '#23291f', glow: 'rgba(128,150,113,0.25)',
    get tag() { return t('relic.relic_merchant.tag'); },
    apply: (p: any) => ({ ...p, relicMerchant: true }),
  },
  {
    id: 'relic_hoarder', get name() { return t('relic.relic_hoarder.name'); }, icon: '🏦',
    get desc() { return t('relic.relic_hoarder.desc'); },
    get flavor() { return t('relic.relic_hoarder.flavor'); },
    color: '#c3b3bf', border: '#5a4860', glow: 'rgba(196,182,202,0.25)',
    get tag() { return t('relic.relic_hoarder.tag'); },
    apply: (p: any) => ({ ...p, relicHoarder: true }),
  },

  // ── Especiais / Únicas ────────────────────────────────────────────────────
  {
    id: 'relic_twins', get name() { return t('relic.relic_twins.name'); }, icon: '👥',
    get desc() { return t('relic.relic_twins.desc'); },
    get flavor() { return t('relic.relic_twins.flavor'); },
    color: '#c3b3bf', border: '#423446', glow: 'rgba(189,174,196,0.25)',
    get tag() { return t('relic.relic_twins.tag'); },
    apply: (p: any, starterChars: any[] = [], findEmptySlot: (allies: any[]) => any = () => ({ col: 1, row: 1 })) => {
      const hero = p.allies[0];
      if (!hero || p.allies.length >= p.maxAllies) return p;
      const base = starterChars.find(c => c.type === hero.type);
      if (!base) return p;
      const slot = findEmptySlot(p.allies);
      const twin: any = {
        id: `relic-twin-${uid()}`,
        type: hero.type, level: 5, isHero: false,
        damage:         Math.round((base.damage  || 10) * (1 + 4 * 0.10)),
        attackSpeed:    base.attackSpeed || 1000,
        range:          Math.round((base.range   || 500) * (1 + 4 * 0.02)),
        projectileSpeed:base.projectileSpeed || 8,
        color:          base.color || 'text-white',
        hp:             Math.round((base.maxHp   || 50) * (1 + 4 * 0.08)),
        maxHp:          Math.round((base.maxHp   || 50) * (1 + 4 * 0.08)),
        perks: {}, gridPosition: slot, lastShotTime: 0, attackCooldown: 0, isAttacking: false,
      };
      return { ...p, allies: [...p.allies, twin] };
    },
  },

  // ── Account Relics (unlocked by level) ──────────────────────────────────
  ...ACCOUNT_RELICS,

  // ── Surpresa ──────────────────────────────────────────────────────────────
  {
    id: 'relic_gamble', get name() { return t('relic.relic_gamble.name'); }, icon: '🎲',
    get desc() { return t('relic.relic_gamble.desc'); },
    get flavor() { return t('relic.relic_gamble.flavor'); },
    color: '#9cabaf', border: '#344045', glow: 'rgba(152,171,180,0.25)',
    get tag() { return t('relic.relic_gamble.tag'); },
    apply: (p: any) => p, // handled specially at game start
  },
];
