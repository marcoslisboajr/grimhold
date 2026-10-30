// ══════════════════════════════════════════════════════════════════════
// data/shopPools.ts
// Pools de itens dos 3 mercadores, extraídos do GameCanvas.tsx.
// As funções apply() recebem só o PlayerState — sem dependência de React.
//
// O texto (title/desc dos itens, name/desc dos mercadores) vem do i18n,
// por GETTERS. Chaves: 'shop.<id>.*' e 'merchant.<key>.*'.
// stackKey / rarity / iconType continuam em inglês: são identificadores
// de lógica, não texto de tela.
// ══════════════════════════════════════════════════════════════════════

import { AllyPerks } from '../types';
import { t } from '../../i18n';

// ---------------------------------------------------------------------------
// Tipo de item da loja
// ---------------------------------------------------------------------------

export interface ShopItem {
  id:         string;
  title:      string;
  desc:       string;
  cost:       number;
  weight:     number;
  icon:       string;
  stackable:  boolean;
  maxStacks?: number;
  stackKey?:  string;
  rarity?:    string;
  iconType?:  string;
  apply:      (p: any) => any;
  onBuy?:     (ctx: { setTowerHp: (v: any) => void; towerMaxHpRef: { current: number } }) => void;
}

// Shared roll state for Chaos Orb (apply → onBuy coordination)
let _chaosOrbRoll = 0;

export const MERCHANT_META = {
  blacksmith: { get name() { return t('merchant.blacksmith.name'); },    icon: '⚒️', color: '#ac7357', get desc() { return t('merchant.blacksmith.desc'); } },
  healer:     { get name() { return t('merchant.healer.name'); },    icon: '💚', color: '#78866c', get desc() { return t('merchant.healer.desc'); } },
  mage:       { get name() { return t('merchant.mage.name'); },      icon: '📜', color: '#af9bb1', get desc() { return t('merchant.mage.desc'); } },
} as const;

export const BIG_SHOP_META = {
  get name() { return t('ui.merchant.grandSaleName'); },
  icon: '⭐',
  color: '#f59e0b',
  get desc() { return t('ui.merchant.grandSaleDesc'); }
};

export const getMerchantSlotMeta = (type: 'blacksmith' | 'healer' | 'mage' | 'bigShop') => {
  if (type === 'bigShop') return BIG_SHOP_META;
  return MERCHANT_META[type];
};

export interface ShopScheduleSlot {
  wave: number;
  type: 'blacksmith' | 'healer' | 'mage' | 'bigShop';
}

export const createRandomShopSchedule = (seedRng: () => number = Math.random): ShopScheduleSlot[] => {
  const normalTypes: ('blacksmith' | 'healer' | 'mage')[] = ['blacksmith', 'healer', 'mage'];
  const pick = (avoid?: string) => {
    const list = avoid ? normalTypes.filter(t => t !== avoid) : normalTypes;
    return list[Math.floor(seedRng() * list.length)];
  };
  const w5 = pick();
  const w10 = pick(w5);
  const w15 = pick(w10);
  const w22 = pick();
  const w26 = pick(w22);
  return [
    { wave: 5,  type: w5 },
    { wave: 10, type: w10 },
    { wave: 15, type: w15 },
    { wave: 20, type: 'bigShop' }, // Super Loja / Grande Bazar sempre fixo!
    { wave: 22, type: w22 },
    { wave: 26, type: w26 },
  ];
};

export const SHOP_SCHEDULE: ShopScheduleSlot[] = createRandomShopSchedule();

export const getNextShopSlot = (currentWave: number, schedule: ShopScheduleSlot[] = SHOP_SCHEDULE): ShopScheduleSlot => {
  const next = schedule.find(s => s.wave > currentWave);
  if (next) return next;
  const baseWave = Math.floor((currentWave - 20) / 5) * 5 + 25;
  const isSuper = (baseWave - 20) % 20 === 0;
  if (isSuper) return { wave: baseWave, type: 'bigShop' };
  const normalTypes: ('blacksmith' | 'healer' | 'mage')[] = ['blacksmith', 'healer', 'mage'];
  // deterministico: sortear aqui fazia a aba da HUD trocar de loja a cada quadro
  return { wave: baseWave, type: normalTypes[(baseWave / 5) % normalTypes.length] };
};

// ── ⚒️ FERREIRO — ofensa, dano, velocidade de ataque ──────────────────────
export const POOL_BLACKSMITH: ShopItem[] = [
  // ── Common (weight 8) — affordable, reliable upgrades ──────────────────
  { id: 'shop-war-drum',       get title() { return t('shop.shop-war-drum.title'); },        get desc() { return t('shop.shop-war-drum.desc'); },                   cost: 120, weight: 8, icon: '🥁', stackable: true, maxStacks: 3, stackKey: 'warDrumStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage * 1.10) })) }) },
  { id: 'shop-steady-aim',     get title() { return t('shop.shop-steady-aim.title'); },      get desc() { return t('shop.shop-steady-aim.desc'); },               cost: 90,  weight: 8, icon: '🏹', stackable: true, maxStacks: 4, stackKey: 'steadyAimStacks', apply: (p: any) => { const s = (p as any).steadyAimStacks ?? 0; if (s >= 4) return p; return { ...p, steadyAimStacks: s+1, allies: p.allies.map((a: any) => ({ ...a, range: Math.round((a.range||400)*1.04) })) }; } },
  { id: 'shop-speed-rune',     get title() { return t('shop.shop-speed-rune.title'); },      get desc() { return t('shop.shop-speed-rune.desc'); },        cost: 120, weight: 8, icon: '⚙️', stackable: true, maxStacks: 4, stackKey: 'speedRuneStacks', apply: (p: any) => { const s = (p as any).speedRuneStacks ?? 0; if (s >= 4) return p; return { ...p, speedRuneStacks: s+1, allies: p.allies.map((a: any) => ({ ...a, attackSpeed: Math.round(a.attackSpeed*0.94) })) }; } },
  { id: 'shop-whetstone',      get title() { return t('shop.shop-whetstone.title'); },       get desc() { return t('shop.shop-whetstone.desc'); }, cost: 130, weight: 8, icon: '🗡️', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, perks: { ...(a.perks||{}), jaggedEdge: true } })) }) },
  { id: 'shop-fury-scroll',    get title() { return t('shop.shop-fury-scroll.title'); },  get desc() { return t('shop.shop-fury-scroll.desc'); },         cost: 110, weight: 8, icon: '📜', stackable: false, apply: (p: any) => ({ ...p, furyScrollActive: true }) },
  { id: 'shop-sharpening-stone',get title() { return t('shop.shop-sharpening-stone.title'); }, get desc() { return t('shop.shop-sharpening-stone.desc'); },   cost: 140, weight: 8, icon: '🪨', stackable: true, maxStacks: 3, stackKey: 'sharpeningStoneStacks', apply: (p: any) => ({ ...p, globalCritBonus: ((p as any).globalCritBonus ?? 0) + 0.04 }) },
  // ── Uncommon (weight 4) — situational, strong ──────────────────────────
  { id: 'shop-berserker-ring', get title() { return t('shop.shop-berserker-ring.title'); },  get desc() { return t('shop.shop-berserker-ring.desc'); }, cost: 200, weight: 4, icon: '💢', stackable: true, maxStacks: 2, stackKey: 'berserkerRingStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, perks: { ...(a.perks||{}), berserkerStacks: (a.perks?.berserkerStacks||0)+1 } })) }) },
  { id: 'shop-armor-pierce',   get title() { return t('shop.shop-armor-pierce.title'); },   get desc() { return t('shop.shop-armor-pierce.desc'); }, cost: 220, weight: 4, icon: '🔩', stackable: false, apply: (p: any) => ({ ...p, armorPierceActive: true }) },
  { id: 'shop-executioner',    get title() { return t('shop.shop-executioner.title'); }, get desc() { return t('shop.shop-executioner.desc'); },               cost: 300, weight: 4, icon: '⚔️', stackable: false, apply: (p: any) => ({ ...p, deathMarkStacks: Math.min(4, ((p as any).deathMarkStacks??0)+3) }) },
  { id: 'shop-twin-strike',    get title() { return t('shop.shop-twin-strike.title'); },     get desc() { return t('shop.shop-twin-strike.desc'); },       cost: 380, weight: 4, icon: '✨', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, perks: { ...(a.perks||{}), twinStrike: true } })) }) },
  { id: 'shop-void-pact',      get title() { return t('shop.shop-void-pact.title'); },       get desc() { return t('shop.shop-void-pact.desc'); },           cost: 300, weight: 4, icon: '🔯', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage*1.25), maxHp: Math.round(a.maxHp*0.85), hp: Math.min(a.hp, Math.round(a.maxHp*0.85)) })) }) },
  { id: 'shop-battle-std',     get title() { return t('shop.shop-battle-std.title'); }, get desc() { return t('shop.shop-battle-std.desc'); },                      cost: 260, weight: 4, icon: '🏴', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage*1.06), maxHp: Math.round(a.maxHp*1.06), hp: Math.round(a.hp*1.06), attackSpeed: Math.round(a.attackSpeed*0.94), range: Math.round((a.range||400)*1.06) })) }) },
  // ── Rare (weight 2) — expensive, game-changing ─────────────────────────
  { id: 'shop-echo-strike',    get title() { return t('shop.shop-echo-strike.title'); },     get desc() { return t('shop.shop-echo-strike.desc'); },     cost: 540, weight: 2, icon: '🔁', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, perks: { ...(a.perks||{}), echoStrike: true } })) }) },
  { id: 'shop-gold-dmg',       get title() { return t('shop.shop-gold-dmg.title'); }, get desc() { return t('shop.shop-gold-dmg.desc'); },                 cost: 300, weight: 2, icon: '⚡', stackable: true, maxStacks: 2, stackKey: 'arcaneInfusionStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage*1.18) })) }) },
  { id: 'shop-cataclysm',      get title() { return t('shop.shop-cataclysm.title'); },  get desc() { return t('shop.shop-cataclysm.desc'); },      cost: 600, weight: 2, icon: '☄️', stackable: true, maxStacks: 3, stackKey: 'shopCataclysmStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage*1.25), attackSpeed: Math.round(a.attackSpeed*0.85) })) }) },
  { id: 'shop-overclock',      get title() { return t('shop.shop-overclock.title'); },       get desc() { return t('shop.shop-overclock.desc'); },         cost: 450, weight: 2, icon: '🔋', stackable: true, maxStacks: 3, stackKey: 'shopOverclockStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, attackSpeed: Math.round(a.attackSpeed*0.80) })) }) },
  { id: 'shop-war-banner',     get title() { return t('shop.shop-war-banner.title'); },      get desc() { return t('shop.shop-war-banner.desc'); },              cost: 260, weight: 4, icon: '🚩', stackable: false, apply: (p: any) => ({ ...p, warBannerActive: true, warBannerWaves: 2 }) },
  { id: 'shop-command-crest',  get title() { return t('shop.shop-command-crest.title'); },   get desc() { return t('shop.shop-command-crest.desc'); },     cost: 480, weight: 2, icon: '👑', stackable: true, maxStacks: 2, stackKey: 'commandCrestStacks', apply: (p: any) => ({ ...p, commandCrestStacks: ((p as any).commandCrestStacks ?? 0) + 1, maxAllies: p.maxAllies + 1 }) },
  { id: 'shop-giant-slayer',   get title() { return t('shop.shop-giant-slayer.title'); },    get desc() { return t('shop.shop-giant-slayer.desc'); },      cost: 260, weight: 4, icon: '🗡️', stackable: false, apply: (p: any) => ({ ...p, giantSlayerActive: true }) },
];

// ── 💚 APOTHECARY — healing, barrier, defense, sustain ──────────────────
export const POOL_HEALER: ShopItem[] = [
  // ── Common (weight 8) ──────────────────────────────────────────────────
  { id: 'shop-field-ration',   get title() { return t('shop.shop-field-ration.title'); },    get desc() { return t('shop.shop-field-ration.desc'); },                cost: 80,  weight: 8, icon: '🍖', stackable: false, apply: (p: any) => { let i=0, low=0; p.allies.forEach((a: any, j: number) => { const m=a.maxHp-a.hp; if(m>low){low=m;i=j;} }); return { ...p, allies: p.allies.map((a: any, j: number) => j===i ? { ...a, hp: Math.min(a.maxHp, a.hp+50) } : a) }; } },
  { id: 'shop-barrier-rep',    get title() { return t('shop.shop-barrier-rep.title'); },  get desc() { return t('shop.shop-barrier-rep.desc'); },                        cost: 100, weight: 8, icon: '🛡', stackable: false, apply: (p: any) => p, onBuy: (ctx) => ctx.setTowerHp((prev: number) => Math.min(ctx.towerMaxHpRef.current, prev+25)) },
  { id: 'shop-warding-rune',   get title() { return t('shop.shop-warding-rune.title'); },  get desc() { return t('shop.shop-warding-rune.desc'); },     cost: 120, weight: 8, icon: '🔵', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, maxHp: Math.round(a.maxHp*1.12), hp: Math.min(a.hp+Math.round(a.maxHp*0.12), Math.round(a.maxHp*1.12)), statusEffect: 'none', frozenUntil: undefined, bleedStacks: 0 })) }) },
  { id: 'shop-quick-repair',   get title() { return t('shop.shop-quick-repair.title'); },    get desc() { return t('shop.shop-quick-repair.desc'); },cost: 110, weight: 8, icon: '🩺', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, hp: Math.min(a.maxHp, a.hp+15) })) }), onBuy: (ctx) => ctx.setTowerHp((prev: number) => Math.min(ctx.towerMaxHpRef.current, prev+20)) },
  { id: 'shop-caltrops',       get title() { return t('shop.shop-caltrops.title'); },        get desc() { return t('shop.shop-caltrops.desc'); },           cost: 120,  weight: 8, icon: '🪤', stackable: false, apply: (p: any) => ({ ...p, pendingCaltrops: true }) },
  { id: 'shop-regen-tonic',    get title() { return t('shop.shop-regen-tonic.title'); },     get desc() { return t('shop.shop-regen-tonic.desc'); }, cost: 130, weight: 8, icon: '🧪', stackable: false, apply: (p: any) => ({ ...p, regenTonicWaves: ((p as any).regenTonicWaves ?? 0) + 3 }) },
  { id: 'shop-minor-shield',   get title() { return t('shop.shop-minor-shield.title'); },      get desc() { return t('shop.shop-minor-shield.desc'); },                           cost: 100, weight: 8, icon: '🩹', stackable: true, maxStacks: 3, stackKey: 'ironSalveStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, maxHp: Math.round(a.maxHp*1.12), hp: Math.min(a.hp+Math.round(a.maxHp*0.12), Math.round(a.maxHp*1.12)) })) }) },
  // ── Uncommon (weight 4) ────────────────────────────────────────────────
  { id: 'shop-vampiric-edge',  get title() { return t('shop.shop-vampiric-edge.title'); },   get desc() { return t('shop.shop-vampiric-edge.desc'); },       cost: 190, weight: 4, icon: '🩸', stackable: true, maxStacks: 2, stackKey: 'vampiricEdgeStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, perks: { ...(a.perks||{}), vampiricStacks: (a.perks?.vampiricStacks||0)+1 } })) }) },
  { id: 'shop-shadow-cloak',   get title() { return t('shop.shop-shadow-cloak.title'); },    get desc() { return t('shop.shop-shadow-cloak.desc'); },      cost: 280, weight: 4, icon: '🌑', stackable: true, maxStacks: 2, stackKey: 'shadowCloakStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, perks: { ...(a.perks||{}), dodgeStacks: (a.perks?.dodgeStacks||0)+1 } })) }) },
  { id: 'shop-stone-skin',     get title() { return t('shop.shop-stone-skin.title'); },      get desc() { return t('shop.shop-stone-skin.desc'); }, cost: 150, weight: 4, icon: '🪨', stackable: true, maxStacks: 3, stackKey: 'stoneSkinStacks', apply: (p: any) => ({ ...p, stoneSkinStacks: ((p as any).stoneSkinStacks ?? 0) + 1 }) },
  { id: 'shop-revive-charm',   get title() { return t('shop.shop-revive-charm.title'); },    get desc() { return t('shop.shop-revive-charm.desc'); },    cost: 260, weight: 4, icon: '💎', stackable: true, maxStacks: 3, stackKey: 'reviveCharmStacks', apply: (p: any) => ({ ...p, reviveCharmStacks: ((p as any).reviveCharmStacks ?? 0) + 1 }) },
  { id: 'shop-ward-of-fortune',get title() { return t('shop.shop-ward-of-fortune.title'); }, get desc() { return t('shop.shop-ward-of-fortune.desc'); },   cost: 200, weight: 4, icon: '🪬', stackable: true, apply: (p: any) => ({ ...p, wardOfFortuneCharges: ((p as any).wardOfFortuneCharges??0)+4 }) },
  { id: 'shop-soulbind',       get title() { return t('shop.shop-soulbind.title'); },        get desc() { return t('shop.shop-soulbind.desc'); },        cost: 200, weight: 4, icon: '💠', stackable: true, apply: (p: any) => ({ ...p, soulbindStacks: ((p as any).soulbindStacks??0)+1 }) },
  { id: 'shop-hp-up',          get title() { return t('shop.shop-hp-up.title'); },  get desc() { return t('shop.shop-hp-up.desc'); },                           cost: 230, weight: 4, icon: '❤️', stackable: true, maxStacks: 2, stackKey: 'temperedSteelStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, maxHp: Math.round(a.maxHp*1.25), hp: Math.round(a.hp*1.25) })) }) },
  // ── Rare (weight 2) ────────────────────────────────────────────────────
  { id: 'shop-fortify',        get title() { return t('shop.shop-fortify.title'); }, get desc() { return t('shop.shop-fortify.desc'); },           cost: 350, weight: 2, icon: '🏰', stackable: true, maxStacks: 3, stackKey: 'fortifyStacks', apply: (p: any) => ({ ...p, fortifyStacks: Math.min(3, ((p as any).fortifyStacks??0)+1) }) },
  { id: 'shop-recall-scroll',  get title() { return t('shop.shop-recall-scroll.title'); },   get desc() { return t('shop.shop-recall-scroll.desc'); },             cost: 260, weight: 2, icon: '🌀', stackable: false, apply: (p: any) => ({ ...p, pendingRecallScroll: true }) },
  { id: 'shop-titan-core',     get title() { return t('shop.shop-titan-core.title'); },      get desc() { return t('shop.shop-titan-core.desc'); },                           cost: 550, weight: 2, icon: '🗿', stackable: true, maxStacks: 2, stackKey: 'shopTitanCoreStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, maxHp: Math.round(a.maxHp*1.50), hp: Math.round(a.hp*1.50) })) }) },
  { id: 'shop-soul-harvest',   get title() { return t('shop.shop-soul-harvest.title'); },    get desc() { return t('shop.shop-soul-harvest.desc'); }, cost: 200, weight: 2, icon: '👻', stackable: true, maxStacks: 3, stackKey: 'shopSoulHarvestStacks', apply: (p: any) => ({ ...p, soulHarvestStacks: ((p as any).soulHarvestStacks??0)+1 }) },
  { id: 'shop-barrier-reinforce',get title() { return t('shop.shop-barrier-reinforce.title'); },get desc() { return t('shop.shop-barrier-reinforce.desc'); }, cost: 520, weight: 2, icon: '✨', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, hp: a.maxHp })) }), onBuy: (ctx) => ctx.setTowerHp(ctx.towerMaxHpRef.current) },
  // ── Permanent stat items ─────────────────────────────────────────────
  { id: 'shop-vital-surge',   get title() { return t('shop.shop-vital-surge.title'); },      get desc() { return t('shop.shop-vital-surge.desc'); }, cost: 220, weight: 4, icon: '💪', stackable: true, maxStacks: 2, stackKey: 'shopVitalSurgeStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, maxHp: Math.round(a.maxHp*1.08), hp: Math.min(Math.round(a.hp*1.08), Math.round(a.maxHp*1.08)), damage: Math.round(a.damage*1.05) })) }) },
  { id: 'shop-tempered-will', get title() { return t('shop.shop-tempered-will.title'); },    get desc() { return t('shop.shop-tempered-will.desc'); },        cost: 320, weight: 2, icon: '🔰', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, maxHp: Math.round(a.maxHp*1.20), hp: Math.min(Math.round(a.hp*1.20), Math.round(a.maxHp*1.20)), attackSpeed: Math.round(a.attackSpeed*0.85) })) }) },
  { id: 'shop-barrier-core',   get title() { return t('shop.shop-barrier-core.title'); },    get desc() { return t('shop.shop-barrier-core.desc'); },      cost: 320, weight: 4, icon: '🛡️', stackable: true, maxStacks: 2, stackKey: 'barrierCoreStacks', apply: (p: any) => ({ ...p, barrierCoreStacks: ((p as any).barrierCoreStacks ?? 0) + 1 }), onBuy: (ctx) => { ctx.towerMaxHpRef.current += 50; ctx.setTowerHp((prev: number) => Math.min(ctx.towerMaxHpRef.current, prev + 50)); } },
  { id: 'shop-purifying-flask',get title() { return t('shop.shop-purifying-flask.title'); }, get desc() { return t('shop.shop-purifying-flask.desc'); },  cost: 180, weight: 4, icon: '🧪', stackable: false, apply: (p: any) => ({ ...p, purifyingWaves: ((p as any).purifyingWaves ?? 0) + 3, allies: p.allies.map((a: any) => ({ ...a, statusEffect: 'none', frozenUntil: undefined, bleedStacks: 0 })) }) },
];

// ── 📜 WANDERING MAGE — utility, gold, spells, elemental ────────────────
export const POOL_MAGE: ShopItem[] = [
  // ── Common (weight 8) ──────────────────────────────────────────────────
  { id: 'shop-gold-finder',    get title() { return t('shop.shop-gold-finder.title'); },     get desc() { return t('shop.shop-gold-finder.desc'); },                    cost: 80,  weight: 8, icon: '🔶', stackable: true, maxStacks: 3, stackKey: 'goldFinderStacks', apply: (p: any) => ({ ...p, goldFinderStacks: ((p as any).goldFinderStacks??0)+1 }) },
  { id: 'shop-mana-shard',     get title() { return t('shop.shop-mana-shard.title'); },      get desc() { return t('shop.shop-mana-shard.desc'); },         cost: 110, weight: 8, icon: '🔷', stackable: false, apply: (p: any) => ({ ...p, guaranteedRare: true }) },
  { id: 'shop-cursed-relic',   get title() { return t('shop.shop-cursed-relic.title'); },    get desc() { return t('shop.shop-cursed-relic.desc'); },            cost: 90,  weight: 8, icon: '📿', stackable: true, apply: (p: any) => ({ ...p, cursedRelicCharges: ((p as any).cursedRelicCharges ?? 0) + 8 }) },
  { id: 'shop-tome-knowledge', get title() { return t('shop.shop-tome-knowledge.title'); },get desc() { return t('shop.shop-tome-knowledge.desc'); },  cost: 140, weight: 8, icon: '📚', stackable: true, maxStacks: 3, stackKey: 'tomeKnowledgeStacks', apply: (p: any) => ({ ...p, tomeKnowledgeBonus: ((p as any).tomeKnowledgeBonus ?? 0) + 0.08 }) },
  { id: 'shop-mana-font',      get title() { return t('shop.shop-mana-font.title'); },       get desc() { return t('shop.shop-mana-font.desc'); },          cost: 200, weight: 8, icon: '🌀', stackable: true, maxStacks: 2, stackKey: 'manaFontStacks', apply: (p: any) => ({ ...p, manaFontStacks: ((p as any).manaFontStacks ?? 0) + 1 }) },
  // ── Uncommon (weight 4) ────────────────────────────────────────────────
  { id: 'shop-gold-hoard',     get title() { return t('shop.shop-gold-hoard.title'); },      get desc() { return t('shop.shop-gold-hoard.desc'); },                   cost: 240, weight: 4, icon: '👑', stackable: true, maxStacks: 2, stackKey: 'goldHoardStacks', apply: (p: any) => ({ ...p, goldHoardStacks: Math.min(2, ((p as any).goldHoardStacks??0)+1) }) },
  { id: 'shop-arcane-codex',   get title() { return t('shop.shop-arcane-codex.title'); },    get desc() { return t('shop.shop-arcane-codex.desc'); }, cost: 220, weight: 4, icon: '📖', stackable: true, maxStacks: 2, stackKey: 'arcaneCodexStacks', apply: (p: any) => ({ ...p, arcaneCodexStacks: ((p as any).arcaneCodexStacks ?? 0) + 1 }) },
  { id: 'shop-soul-compass',   get title() { return t('shop.shop-soul-compass.title'); },    get desc() { return t('shop.shop-soul-compass.desc'); }, cost: 200, weight: 4, icon: '🧭', stackable: true, maxStacks: 2, stackKey: 'soulCompassStacks', apply: (p: any) => ({ ...p, soulCompassStacks: Math.min(2, ((p as any).soulCompassStacks??0)+1) }) },
  { id: 'shop-chaos-orb',      get title() { return t('shop.shop-chaos-orb.title'); },       get desc() { return t('shop.shop-chaos-orb.desc'); }, cost: 230, weight: 4, icon: '🎲', stackable: true, apply: (p: any) => { _chaosOrbRoll = Math.random(); if (_chaosOrbRoll < 0.25) return { ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage*1.30) })) }; if (_chaosOrbRoll < 0.50) return { ...p, allies: p.allies.map((a: any) => ({ ...a, hp: a.maxHp })) }; if (_chaosOrbRoll < 0.75) return p; // barrier HP handled in onBuy
    return { ...p, chaosOrbCards: ((p as any).chaosOrbCards ?? 0) + 3 }; }, onBuy: (ctx) => { if (_chaosOrbRoll >= 0.50 && _chaosOrbRoll < 0.75) ctx.setTowerHp((prev: number) => Math.min(ctx.towerMaxHpRef.current, prev+50)); } },
  { id: 'shop-lodestone',      get title() { return t('shop.shop-lodestone.title'); },       get desc() { return t('shop.shop-lodestone.desc'); },           cost: 90, weight: 4, icon: '🧲', stackable: false, apply: (p: any) => ({ ...p, pendingLodestone: true }) },
  // ── Rare (weight 2) ────────────────────────────────────────────────────
  { id: 'shop-ancient-tome',   get title() { return t('shop.shop-ancient-tome.title'); },    get desc() { return t('shop.shop-ancient-tome.desc'); },         cost: 280, weight: 2, icon: '🌟', stackable: false, apply: (p: any) => ({ ...p, guaranteedLegendary: true }) },
  { id: 'shop-blood-moon',     get title() { return t('shop.shop-blood-moon.title'); },      get desc() { return t('shop.shop-blood-moon.desc'); },        cost: 280, weight: 2, icon: '🌙', stackable: false, apply: (p: any) => ({ ...p, bloodMoonWavesLeft: 2, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage*1.70), maxHp: Math.round(a.maxHp*0.70), hp: Math.min(a.hp, Math.round(a.maxHp*0.70)) })) }) },
  { id: 'shop-trident',        get title() { return t('shop.shop-trident.title'); },get desc() { return t('shop.shop-trident.desc'); },  cost: 340, weight: 2, icon: '🔱', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage*1.12), maxHp: Math.round(a.maxHp*1.12), hp: Math.round(a.hp*1.12), range: Math.round((a.range||400)*1.12) })) }) },
  { id: 'shop-rift-mirror',    get title() { return t('shop.shop-rift-mirror.title'); },     get desc() { return t('shop.shop-rift-mirror.desc'); },    cost: 350, weight: 2, icon: '🪞', stackable: false, apply: (p: any) => ({ ...p, riftMirrorActive: true }) },
  // ── Permanent stat items ─────────────────────────────────────────────
  { id: 'shop-arcane-lens',    get title() { return t('shop.shop-arcane-lens.title'); },      get desc() { return t('shop.shop-arcane-lens.desc'); }, cost: 160, weight: 8, icon: '🔭', stackable: true, maxStacks: 3, stackKey: 'shopArcaneLensStacks', apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, range: Math.round((a.range||400)*1.06), damage: Math.round(a.damage*1.04) })) }) },
  { id: 'shop-starfall-shard', get title() { return t('shop.shop-starfall-shard.title'); },   get desc() { return t('shop.shop-starfall-shard.desc'); },            cost: 240, weight: 4, icon: '⭐', stackable: true, maxStacks: 2, stackKey: 'shopStarfallStacks', apply: (p: any) => ({ ...p, globalCritBonus: ((p as any).globalCritBonus ?? 0) + 0.12 }) },
  { id: 'shop-elixir-mastery', get title() { return t('shop.shop-elixir-mastery.title'); },get desc() { return t('shop.shop-elixir-mastery.desc'); }, cost: 280, weight: 2, icon: '🧬', stackable: false, apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage*1.08), attackSpeed: Math.round(a.attackSpeed*0.92), range: Math.round((a.range||400)*1.08) })) }) },
  { id: 'shop-chronos-hourglass', get title() { return t('shop.shop-chronos-hourglass.title'); }, get desc() { return t('shop.shop-chronos-hourglass.desc'); }, cost: 250, weight: 4, icon: '⏳', stackable: false, apply: (p: any) => ({ ...p, chronosHourglassActive: true }) },
  { id: 'shop-alchemist-stone',   get title() { return t('shop.shop-alchemist-stone.title'); },   get desc() { return t('shop.shop-alchemist-stone.desc'); },   cost: 300, weight: 2, icon: '💎', stackable: false, apply: (p: any) => ({ ...p, alchemistStoneActive: true }) },
];


// Backwards-compat: SHOP_POOL still used in a few legacy references
export const SHOP_POOL: ShopItem[] = [...POOL_BLACKSMITH, ...POOL_HEALER, ...POOL_MAGE];

// ── 🃏 SEASON 1 BATTLE PASS EXCLUSIVE CARDS ─────────────────────────────
// These are injected into the active shop pool only if the player has
// unlocked them via the battle pass. See GameCanvas getActiveMerchantPool().
export const POOL_SEASON1_CARDS: ShopItem[] = [
  {
    id: 'bp_awakened_blade', get title() { return t('shop.bp_awakened_blade.title'); },
    get desc() { return t('shop.bp_awakened_blade.desc'); },
    cost: 280, weight: 2, icon: '⚔️', stackable: false, rarity: 'rare',
    apply: (p: any) => ({ ...p, allies: p.allies.map((a: any, i: number) => i === 0 ? { ...a, perks: { ...(a.perks || {}), awakenedBlade: true } } : a) }),
  },
  {
    id: 'bp_gold_rush', get title() { return t('shop.bp_gold_rush.title'); },
    get desc() { return t('shop.bp_gold_rush.desc'); },
    cost: 220, weight: 2, icon: '💰', stackable: false, rarity: 'rare',
    apply: (p: any) => ({ ...p, goldRushWaves: ((p as any).goldRushWaves ?? 0) + 4 }),
  },
  {
    id: 'bp_grimhold_pact', get title() { return t('shop.bp_grimhold_pact.title'); },
    get desc() { return t('shop.bp_grimhold_pact.desc'); },
    cost: 480, weight: 1, icon: '📖', stackable: false, rarity: 'epic',
    apply: (p: any) => ({ ...p, allies: p.allies.map((a: any) => ({ ...a, damage: Math.round(a.damage * 1.20), attackSpeed: Math.round(a.attackSpeed * 0.85) })) }),
  },
  {
    id: 'bp_soul_surge', get title() { return t('shop.bp_soul_surge.title'); },
    get desc() { return t('shop.bp_soul_surge.desc'); },
    cost: 300, weight: 1, icon: '💜', stackable: false, rarity: 'epic',
    apply: (p: any) => ({ ...p, soulSurgeActive: true }),
  },
  {
    id: 'bp_last_stand', get title() { return t('shop.bp_last_stand.title'); },
    get desc() { return t('shop.bp_last_stand.desc'); },
    cost: 650, weight: 1, icon: '🔥', stackable: false, rarity: 'legendary',
    apply: (p: any) => ({ ...p, lastStandAvailable: true }),
  },
];
