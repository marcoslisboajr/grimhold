// ══════════════════════════════════════════════════════════════════════
// data/compendium.tsx
// Itens do compêndio (grimório), extraídos do GameCanvas.tsx.
// O texto (title/description/flavorText) vem do i18n, por GETTERS. Para
// mexer no texto, edite i18n/locales/en.json na chave 'compendium.<id>.*'.
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import { Sigil } from '../Sigil';
import { Zap, Shield, Wind, Flame, Eye, Leaf, Skull as SkullIcon,
  Combine, Cross, Swords, Crown, Coins, Hammer, Snowflake, Music,
  Check, Book, ArrowLeft, Sun, Crosshair, Heart, Lock, Gem,
  CloudRain, LogOut, ScrollText, Star, Users } from 'lucide-react';
import { t } from '../../i18n';

export interface CompendiumItem {
  id:           string;
  title:        string;
  description:  string;
  rarity:       'common' | 'rare' | 'legendary' | 'mythic';
  iconType?:    string;
  iconSpecial?: React.ReactNode;
  flavorText:   string;
}

export const COMPENDIUM_ITEMS: CompendiumItem[] = [
  {
    id: 'new-mage', get title() { return t('compendium.new-mage.title'); }, get description() { return t('compendium.new-mage.description'); }, rarity: 'common', iconType: 'mage',
    get flavorText() { return t('compendium.new-mage.flavorText'); }
  },
  {
    id: 'new-archer', get title() { return t('compendium.new-archer.title'); }, get description() { return t('compendium.new-archer.description'); }, rarity: 'common', iconType: 'archer',
    get flavorText() { return t('compendium.new-archer.flavorText'); }
  },
  {
    id: 'new-warlock', get title() { return t('compendium.new-warlock.title'); }, get description() { return t('compendium.new-warlock.description'); }, rarity: 'uncommon', iconType: 'warlock',
    get flavorText() { return t('compendium.new-warlock.flavorText'); }
  },
  {
    id: 'new-druid', get title() { return t('compendium.new-druid.title'); }, get description() { return t('compendium.new-druid.description'); }, rarity: 'common', iconType: 'druid',
    get flavorText() { return t('compendium.new-druid.flavorText'); }
  },
  {
    id: 'new-necro', get title() { return t('compendium.new-necro.title'); }, get description() { return t('compendium.new-necro.description'); }, rarity: 'rare', iconType: 'necromancer',
    get flavorText() { return t('compendium.new-necro.flavorText'); }
  },
  {
    id: 'new-bard', get title() { return t('compendium.new-bard.title'); }, get description() { return t('compendium.new-bard.description'); }, rarity: 'rare', iconType: 'bard',
    get flavorText() { return t('compendium.new-bard.flavorText'); }
  },
  {
    id: 'new-cleric', get title() { return t('compendium.new-cleric.title'); }, get description() { return t('compendium.new-cleric.description'); }, rarity: 'common', iconType: 'cleric',
    get flavorText() { return t('compendium.new-cleric.flavorText'); }
  },
  {
    id: 'new-priest', get title() { return t('compendium.new-priest.title'); }, get description() { return t('compendium.new-priest.description'); }, rarity: 'uncommon', iconType: 'priest',
    get flavorText() { return t('compendium.new-priest.flavorText'); }
  },
  {
    id: 'expand-slots', get title() { return t('compendium.expand-slots.title'); }, get description() { return t('compendium.expand-slots.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="crown" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.expand-slots.flavorText'); }
  },
  {
    id: 'archer-thousandcuts', get title() { return t('compendium.archer-thousandcuts.title'); }, get description() { return t('compendium.archer-thousandcuts.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.archer-thousandcuts.flavorText'); }
  },
  {
    id: 'archer-explosive', get title() { return t('compendium.archer-explosive.title'); }, get description() { return t('compendium.archer-explosive.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="bow" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.archer-explosive.flavorText'); }
  },
  {
    id: 'archer-rain', get title() { return t('compendium.archer-rain.title'); }, get description() { return t('compendium.archer-rain.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="bow" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.archer-rain.flavorText'); }
  },
  {
    id: 'warlock-lightning', get title() { return t('compendium.warlock-lightning.title'); }, get description() { return t('compendium.warlock-lightning.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="bolt" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.warlock-lightning.flavorText'); }
  },
  {
    id: 'necro-explosion', get title() { return t('compendium.necro-explosion.title'); }, get description() { return t('compendium.necro-explosion.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="flask" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.necro-explosion.flavorText'); }
  },
  {
    id: 'druid-roots', get title() { return t('compendium.druid-roots.title'); }, get description() { return t('compendium.druid-roots.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="leaf" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.druid-roots.flavorText'); }
  },
  {
    id: 'cleric-blessing', get title() { return t('compendium.cleric-blessing.title'); }, get description() { return t('compendium.cleric-blessing.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="sun" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.cleric-blessing.flavorText'); }
  },
  {
    id: 'dmg-boost', get title() { return t('compendium.dmg-boost.title'); }, get description() { return t('compendium.dmg-boost.description'); }, rarity: 'common', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.dmg-boost.flavorText'); }
  },
  {
    id: 'gold-cache', get title() { return t('compendium.gold-cache.title'); }, get description() { return t('compendium.gold-cache.description'); }, rarity: 'common', iconType: 'special', iconSpecial: <Sigil name="coin" size={52} style={{ color: '#bc8e78' }} />,
    get flavorText() { return t('compendium.gold-cache.flavorText'); }
  },
  { id: 'mage-surge', get title() { return t('compendium.mage-surge.title'); }, get description() { return t('compendium.mage-surge.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.mage-surge.flavorText'); } },
  { id: 'mage-fireball-base', get title() { return t('compendium.mage-fireball-base.title'); }, get description() { return t('compendium.mage-fireball-base.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="flame" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.mage-fireball-base.flavorText'); } },
  { id: 'mage-blink', get title() { return t('compendium.mage-blink.title'); }, get description() { return t('compendium.mage-blink.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.mage-blink.flavorText'); } },
  { id: 'warlock-drain', get title() { return t('compendium.warlock-drain.title'); }, get description() { return t('compendium.warlock-drain.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="blood" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.warlock-drain.flavorText'); } },
  { id: 'warlock-void', get title() { return t('compendium.warlock-void.title'); }, get description() { return t('compendium.warlock-void.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.warlock-void.flavorText'); } },
  { id: 'druid-cycle', get title() { return t('compendium.druid-cycle.title'); }, get description() { return t('compendium.druid-cycle.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="leaf" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.druid-cycle.flavorText'); } },
  { id: 'druid-eclipse', get title() { return t('compendium.druid-eclipse.title'); }, get description() { return t('compendium.druid-eclipse.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="eye" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.druid-eclipse.flavorText'); } },
  { id: 'necro-power', get title() { return t('compendium.necro-power.title'); }, get description() { return t('compendium.necro-power.description'); }, rarity: 'common', iconType: 'special', iconSpecial: <Sigil name="moon" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.necro-power.flavorText'); } },
  { id: 'necro-raise', get title() { return t('compendium.necro-raise.title'); }, get description() { return t('compendium.necro-raise.description'); }, rarity: 'uncommon', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.necro-raise.flavorText'); } },
  { id: 'necro-plague-mastery', get title() { return t('compendium.necro-plague-mastery.title'); }, get description() { return t('compendium.necro-plague-mastery.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="flask" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.necro-plague-mastery.flavorText'); } },
  { id: 'necro-death-lord', get title() { return t('compendium.necro-death-lord.title'); }, get description() { return t('compendium.necro-death-lord.description'); }, rarity: 'mythic', iconType: 'necromancer', get flavorText() { return t('compendium.necro-death-lord.flavorText'); } },
  { id: 'bard-radius', get title() { return t('compendium.bard-radius.title'); }, get description() { return t('compendium.bard-radius.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="note" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.bard-radius.flavorText'); } },
  { id: 'bard-hymn', get title() { return t('compendium.bard-hymn.title'); }, get description() { return t('compendium.bard-hymn.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.bard-hymn.flavorText'); } },
  { id: 'bard-anthem', get title() { return t('compendium.bard-anthem.title'); }, get description() { return t('compendium.bard-anthem.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="note" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.bard-anthem.flavorText'); } },
  { id: 'cleric-sacred', get title() { return t('compendium.cleric-sacred.title'); }, get description() { return t('compendium.cleric-sacred.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="monolith" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.cleric-sacred.flavorText'); } },
  { id: 'paladin-will', get title() { return t('compendium.paladin-will.title'); }, get description() { return t('compendium.paladin-will.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.paladin-will.flavorText'); } },
  { id: 'paladin-caldera', get title() { return t('compendium.paladin-caldera.title'); }, get description() { return t('compendium.paladin-caldera.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="flame" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.paladin-caldera.flavorText'); } },
  { id: 'paladin-martyr', get title() { return t('compendium.paladin-martyr.title'); }, get description() { return t('compendium.paladin-martyr.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="beads" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.paladin-martyr.flavorText'); } },
  { id: 'priest-mending', get title() { return t('compendium.priest-mending.title'); }, get description() { return t('compendium.priest-mending.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="heart" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.priest-mending.flavorText'); } },
  { id: 'priest-guard', get title() { return t('compendium.priest-guard.title'); }, get description() { return t('compendium.priest-guard.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.priest-guard.flavorText'); } },
  { id: 'priest-res', get title() { return t('compendium.priest-res.title'); }, get description() { return t('compendium.priest-res.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="heart" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.priest-res.flavorText'); } },
  { id: 'cleric-battle-prayer', get title() { return t('compendium.cleric-battle-prayer.title'); }, get description() { return t('compendium.cleric-battle-prayer.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="beads" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.cleric-battle-prayer.flavorText'); } },

  // ── ✦ MYTHIC SUMMONS ──────────────────────────────────────────────────────
  {
    id: 'new-runesmith', get title() { return t('compendium.new-runesmith.title'); }, get description() { return t('compendium.new-runesmith.description'); },
    rarity: 'mythic', iconType: 'runesmith',
    get flavorText() { return t('compendium.new-runesmith.flavorText'); }
  },
  {
    id: 'new-sylvanite', get title() { return t('compendium.new-sylvanite.title'); }, get description() { return t('compendium.new-sylvanite.description'); },
    rarity: 'mythic', iconType: 'sylvanite',
    get flavorText() { return t('compendium.new-sylvanite.flavorText'); }
  },
  {
    id: 'new-dreadlord', get title() { return t('compendium.new-dreadlord.title'); }, get description() { return t('compendium.new-dreadlord.description'); },
    rarity: 'mythic', iconType: 'dreadlord',
    get flavorText() { return t('compendium.new-dreadlord.flavorText'); }
  },
  {
    id: 'new-vex', get title() { return t('compendium.new-vex.title'); }, get description() { return t('compendium.new-vex.description'); },
    rarity: 'rare', iconType: 'vex',
    get flavorText() { return t('compendium.new-vex.flavorText'); },
  },
  // ── 🩸 VEX SKILL CARDS ───────────────────────────────────────────────────
  { id: 'vex-hunger', get title() { return t('compendium.vex-hunger.title'); }, get description() { return t('compendium.vex-hunger.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="fang" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.vex-hunger.flavorText'); } },
  { id: 'vex-blink', get title() { return t('compendium.vex-blink.title'); }, get description() { return t('compendium.vex-blink.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.vex-blink.flavorText'); } },
  { id: 'vex-veil', get title() { return t('compendium.vex-veil.title'); }, get description() { return t('compendium.vex-veil.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="moon" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.vex-veil.flavorText'); } },

  // ── 🌑 ZYLVARA SUMMON ────────────────────────────────────────────────────
  {
    id: 'new-zylvara', get title() { return t('compendium.new-zylvara.title'); }, get description() { return t('compendium.new-zylvara.description'); },
    rarity: 'mythic', iconType: 'zylvara',
    get flavorText() { return t('compendium.new-zylvara.flavorText'); }
  },
  // ── 🌑 ZYLVARA SKILL CARDS ───────────────────────────────────────────────
  { id: 'zylvara-poison', get title() { return t('compendium.zylvara-poison.title'); }, get description() { return t('compendium.zylvara-poison.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="flask" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.zylvara-poison.flavorText'); } },
  { id: 'zylvara-cloak', get title() { return t('compendium.zylvara-cloak.title'); }, get description() { return t('compendium.zylvara-cloak.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="moon" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.zylvara-cloak.flavorText'); } },
  { id: 'zylvara-extinct', get title() { return t('compendium.zylvara-extinct.title'); }, get description() { return t('compendium.zylvara-extinct.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.zylvara-extinct.flavorText'); } },

  // ── 🔥 MORRIGAN SUMMON ───────────────────────────────────────────────────
  {
    id: 'new-morrigan', get title() { return t('compendium.new-morrigan.title'); },
    get description() { return t('compendium.new-morrigan.description'); },
    rarity: 'mythic', iconType: 'morrigan',
    get flavorText() { return t('compendium.new-morrigan.flavorText'); },
  },
  // ── 💜 MORRIGAN SKILL CARDS ──────────────────────────────────────────────
  { id: 'morrigan-ravenous', get title() { return t('compendium.morrigan-ravenous.title'); }, get description() { return t('compendium.morrigan-ravenous.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="fang" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.morrigan-ravenous.flavorText'); } },
  { id: 'morrigan-bitterharvest', get title() { return t('compendium.morrigan-bitterharvest.title'); }, get description() { return t('compendium.morrigan-bitterharvest.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="leaf" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.morrigan-bitterharvest.flavorText'); } },
  { id: 'morrigan-devourstorm', get title() { return t('compendium.morrigan-devourstorm.title'); }, get description() { return t('compendium.morrigan-devourstorm.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="fang" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.morrigan-devourstorm.flavorText'); } },
  { id: 'morrigan-plague', get title() { return t('compendium.morrigan-plague.title'); }, get description() { return t('compendium.morrigan-plague.description'); }, rarity: 'mythic', iconType: 'morrigan', get flavorText() { return t('compendium.morrigan-plague.flavorText'); } },

  // ── 💥 IXARA SUMMON ──────────────────────────────────────────────────────
  {
    id: 'new-ixara', get title() { return t('compendium.new-ixara.title'); }, get description() { return t('compendium.new-ixara.description'); },
    rarity: 'rare', iconType: 'ixara',
    get flavorText() { return t('compendium.new-ixara.flavorText'); }
  },
  // ── 💥 IXARA SKILL CARDS ─────────────────────────────────────────────────
  { id: 'ixara-rage', get title() { return t('compendium.ixara-rage.title'); }, get description() { return t('compendium.ixara-rage.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.ixara-rage.flavorText'); } },
  { id: 'ixara-ricochet', get title() { return t('compendium.ixara-ricochet.title'); }, get description() { return t('compendium.ixara-ricochet.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.ixara-ricochet.flavorText'); } },
  { id: 'ixara-collapse', get title() { return t('compendium.ixara-collapse.title'); }, get description() { return t('compendium.ixara-collapse.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.ixara-collapse.flavorText'); } },

  {
    id: 'new-jester', get title() { return t('compendium.new-jester.title'); }, get description() { return t('compendium.new-jester.description'); },
    rarity: 'mythic', iconType: 'jester',
    get flavorText() { return t('compendium.new-jester.flavorText'); }
  },
  {
    id: 'jester-dead-mans-hand', get title() { return t('compendium.jester-dead-mans-hand.title'); }, get description() { return t('compendium.jester-dead-mans-hand.description'); },
    rarity: 'mythic', iconType: 'jester',
    get flavorText() { return t('compendium.jester-dead-mans-hand.flavorText'); }
  },
  { id: 'jester-chaos', get title() { return t('compendium.jester-chaos.title'); }, get description() { return t('compendium.jester-chaos.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.jester-chaos.flavorText'); } },
  { id: 'jester-pratfall', get title() { return t('compendium.jester-pratfall.title'); }, get description() { return t('compendium.jester-pratfall.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="dice" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.jester-pratfall.flavorText'); } },
  { id: 'jester-roulette', get title() { return t('compendium.jester-roulette.title'); }, get description() { return t('compendium.jester-roulette.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="dice" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.jester-roulette.flavorText'); } },
  { id: 'jester-tricks', get title() { return t('compendium.jester-tricks.title'); }, get description() { return t('compendium.jester-tricks.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="dice" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.jester-tricks.flavorText'); } },

  // ── ⚡ RUNESMITH SKILL CARDS ──────────────────────────────────────────────
  { id: 'runesmith-resonance', get title() { return t('compendium.runesmith-resonance.title'); }, get description() { return t('compendium.runesmith-resonance.description'); }, rarity: 'uncommon', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.runesmith-resonance.flavorText'); } },
  { id: 'runesmith-volley', get title() { return t('compendium.runesmith-volley.title'); }, get description() { return t('compendium.runesmith-volley.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.runesmith-volley.flavorText'); } },
  { id: 'runesmith-overload', get title() { return t('compendium.runesmith-overload.title'); }, get description() { return t('compendium.runesmith-overload.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.runesmith-overload.flavorText'); } },
  { id: 'runesmith-reach', get title() { return t('compendium.runesmith-reach.title'); }, get description() { return t('compendium.runesmith-reach.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="scroll" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.runesmith-reach.flavorText'); } },

  // ── 🌿 SYLVANITE SKILL CARDS ─────────────────────────────────────────────
  { id: 'sylvanite-spore-burst', get title() { return t('compendium.sylvanite-spore-burst.title'); }, get description() { return t('compendium.sylvanite-spore-burst.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="flask" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.sylvanite-spore-burst.flavorText'); } },
  { id: 'sylvanite-toxin', get title() { return t('compendium.sylvanite-toxin.title'); }, get description() { return t('compendium.sylvanite-toxin.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="flask" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.sylvanite-toxin.flavorText'); } },
  { id: 'sylvanite-bloom', get title() { return t('compendium.sylvanite-bloom.title'); }, get description() { return t('compendium.sylvanite-bloom.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="leaf" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.sylvanite-bloom.flavorText'); } },
  { id: 'sylvanite-roots', get title() { return t('compendium.sylvanite-roots.title'); }, get description() { return t('compendium.sylvanite-roots.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="leaf" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.sylvanite-roots.flavorText'); } },

  // ── 💀 DREADLORD SKILL CARDS ─────────────────────────────────────────────
  { id: 'dreadlord-hunger', get title() { return t('compendium.dreadlord-hunger.title'); }, get description() { return t('compendium.dreadlord-hunger.description'); }, rarity: 'uncommon', iconType: 'dreadlord', get flavorText() { return t('compendium.dreadlord-hunger.flavorText'); } },
  { id: 'dreadlord-edge', get title() { return t('compendium.dreadlord-edge.title'); }, get description() { return t('compendium.dreadlord-edge.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.dreadlord-edge.flavorText'); } },
  { id: 'dreadlord-rupture', get title() { return t('compendium.dreadlord-rupture.title'); }, get description() { return t('compendium.dreadlord-rupture.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.dreadlord-rupture.flavorText'); } },
  { id: 'dreadlord-harvest', get title() { return t('compendium.dreadlord-harvest.title'); }, get description() { return t('compendium.dreadlord-harvest.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.dreadlord-harvest.flavorText'); } },

  // ── 🌐 GLOBAL CARDS (previously missing) ────────────────────────────────
  { id: 'iron-discipline', get title() { return t('compendium.iron-discipline.title'); }, get description() { return t('compendium.iron-discipline.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.iron-discipline.flavorText'); } },
  { id: 'blood-price', get title() { return t('compendium.blood-price.title'); }, get description() { return t('compendium.blood-price.description'); }, rarity: 'uncommon', iconType: 'special', iconSpecial: <Sigil name="blood" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.blood-price.flavorText'); } },
  { id: 'arcane-efficiency', get title() { return t('compendium.arcane-efficiency.title'); }, get description() { return t('compendium.arcane-efficiency.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.arcane-efficiency.flavorText'); } },

  // ── 🌐 NEW GLOBAL CARDS ──────────────────────────────────────────────────
  { id: 'eagle-eye', get title() { return t('compendium.eagle-eye.title'); }, get description() { return t('compendium.eagle-eye.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="eye" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.eagle-eye.flavorText'); } },
  { id: 'last-stand', get title() { return t('compendium.last-stand.title'); }, get description() { return t('compendium.last-stand.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="star" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.last-stand.flavorText'); } },
  { id: 'overkill', get title() { return t('compendium.overkill.title'); }, get description() { return t('compendium.overkill.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.overkill.flavorText'); } },
  { id: 'momentum', get title() { return t('compendium.momentum.title'); }, get description() { return t('compendium.momentum.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="fast" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.momentum.flavorText'); } },
  { id: 'glass-cannon', get title() { return t('compendium.glass-cannon.title'); }, get description() { return t('compendium.glass-cannon.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="bolt" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.glass-cannon.flavorText'); } },
  { id: 'fortitude', get title() { return t('compendium.fortitude.title'); }, get description() { return t('compendium.fortitude.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.fortitude.flavorText'); } },
  { id: 'shield-wall', get title() { return t('compendium.shield-wall.title'); }, get description() { return t('compendium.shield-wall.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.shield-wall.flavorText'); } },
  { id: 'second-wind', get title() { return t('compendium.second-wind.title'); }, get description() { return t('compendium.second-wind.description'); }, rarity: 'uncommon', iconType: 'special', iconSpecial: <Sigil name="fast" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.second-wind.flavorText'); } },
  { id: 'gamblers-coin', get title() { return t('compendium.gamblers-coin.title'); }, get description() { return t('compendium.gamblers-coin.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="dice" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.gamblers-coin.flavorText'); } },
  { id: 'sacrifice', get title() { return t('compendium.sacrifice.title'); }, get description() { return t('compendium.sacrifice.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="blood" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.sacrifice.flavorText'); } },
  { id: 'cursed-strength', get title() { return t('compendium.cursed-strength.title'); }, get description() { return t('compendium.cursed-strength.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.cursed-strength.flavorText'); } },
  { id: 'dark-bargain', get title() { return t('compendium.dark-bargain.title'); }, get description() { return t('compendium.dark-bargain.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="moon" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.dark-bargain.flavorText'); } },
  { id: 'war-council', get title() { return t('compendium.war-council.title'); }, get description() { return t('compendium.war-council.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.war-council.flavorText'); } },
  { id: 'tactical-retreat', get title() { return t('compendium.tactical-retreat.title'); }, get description() { return t('compendium.tactical-retreat.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="star" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.tactical-retreat.flavorText'); } },
  { id: 'bulwark-formation', get title() { return t('compendium.bulwark-formation.title'); }, get description() { return t('compendium.bulwark-formation.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.bulwark-formation.flavorText'); } },
  { id: 'transmutation', get title() { return t('compendium.transmutation.title'); }, get description() { return t('compendium.transmutation.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.transmutation.flavorText'); } },
  { id: 'soul-link', get title() { return t('compendium.soul-link.title'); }, get description() { return t('compendium.soul-link.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="ghost" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.soul-link.flavorText'); } },

  // ── PER-CLASS MISSING CARDS ───────────────────────────────────────────────
  { id: 'archer-sniper', get title() { return t('compendium.archer-sniper.title'); }, get description() { return t('compendium.archer-sniper.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="eye" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.archer-sniper.flavorText'); } },
  { id: 'warlock-hex', get title() { return t('compendium.warlock-hex.title'); }, get description() { return t('compendium.warlock-hex.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.warlock-hex.flavorText'); } },
  { id: 'druid-spore', get title() { return t('compendium.druid-spore.title'); }, get description() { return t('compendium.druid-spore.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="flask" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.druid-spore.flavorText'); } },
  { id: 'cleric-divine-shield', get title() { return t('compendium.cleric-divine-shield.title'); }, get description() { return t('compendium.cleric-divine-shield.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.cleric-divine-shield.flavorText'); } },
  { id: 'paladin-holy-ground', get title() { return t('compendium.paladin-holy-ground.title'); }, get description() { return t('compendium.paladin-holy-ground.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="monolith" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.paladin-holy-ground.flavorText'); } },
  { id: 'priest-mass-mending', get title() { return t('compendium.priest-mass-mending.title'); }, get description() { return t('compendium.priest-mass-mending.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="heart" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.priest-mass-mending.flavorText'); } },
  { id: 'bard-dirge', get title() { return t('compendium.bard-dirge.title'); }, get description() { return t('compendium.bard-dirge.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.bard-dirge.flavorText'); } },

  // ── ✦ MYTHIC SKILL CARDS (ultimates) ────────────────────────────────────
  { id: 'archer-storm', get title() { return t('compendium.archer-storm.title'); }, get description() { return t('compendium.archer-storm.description'); }, rarity: 'mythic', iconType: 'archer', get flavorText() { return t('compendium.archer-storm.flavorText'); } },
  { id: 'mage-overload', get title() { return t('compendium.mage-overload.title'); }, get description() { return t('compendium.mage-overload.description'); }, rarity: 'legendary', iconType: 'mage', get flavorText() { return t('compendium.mage-overload.flavorText'); } },
  { id: 'mage-singularity', get title() { return t('compendium.mage-singularity.title'); }, get description() { return t('compendium.mage-singularity.description'); }, rarity: 'mythic', iconType: 'mage', get flavorText() { return t('compendium.mage-singularity.flavorText'); } },
  { id: 'warlock-ascension', get title() { return t('compendium.warlock-ascension.title'); }, get description() { return t('compendium.warlock-ascension.description'); }, rarity: 'mythic', iconType: 'warlock', get flavorText() { return t('compendium.warlock-ascension.flavorText'); } },
  { id: 'druid-ancientwill', get title() { return t('compendium.druid-ancientwill.title'); }, get description() { return t('compendium.druid-ancientwill.description'); }, rarity: 'mythic', iconType: 'druid', get flavorText() { return t('compendium.druid-ancientwill.flavorText'); } },
  { id: 'bard-grandfinale', get title() { return t('compendium.bard-grandfinale.title'); }, get description() { return t('compendium.bard-grandfinale.description'); }, rarity: 'mythic', iconType: 'bard', get flavorText() { return t('compendium.bard-grandfinale.flavorText'); } },
  { id: 'cleric-sanctifiedwrath', get title() { return t('compendium.cleric-sanctifiedwrath.title'); }, get description() { return t('compendium.cleric-sanctifiedwrath.description'); }, rarity: 'mythic', iconType: 'cleric', get flavorText() { return t('compendium.cleric-sanctifiedwrath.flavorText'); } },
  { id: 'paladin-eternalcrusade', get title() { return t('compendium.paladin-eternalcrusade.title'); }, get description() { return t('compendium.paladin-eternalcrusade.description'); }, rarity: 'mythic', iconType: 'paladin', get flavorText() { return t('compendium.paladin-eternalcrusade.flavorText'); } },
  { id: 'priest-divinecovenant', get title() { return t('compendium.priest-divinecovenant.title'); }, get description() { return t('compendium.priest-divinecovenant.description'); }, rarity: 'mythic', iconType: 'priest', get flavorText() { return t('compendium.priest-divinecovenant.flavorText'); } },
  { id: 'runesmith-grandrune', get title() { return t('compendium.runesmith-grandrune.title'); }, get description() { return t('compendium.runesmith-grandrune.description'); }, rarity: 'mythic', iconType: 'runesmith', get flavorText() { return t('compendium.runesmith-grandrune.flavorText'); } },
  { id: 'sylvanite-worldtree', get title() { return t('compendium.sylvanite-worldtree.title'); }, get description() { return t('compendium.sylvanite-worldtree.description'); }, rarity: 'mythic', iconType: 'sylvanite', get flavorText() { return t('compendium.sylvanite-worldtree.flavorText'); } },
  { id: 'vex-shadowdeath', get title() { return t('compendium.vex-shadowdeath.title'); }, get description() { return t('compendium.vex-shadowdeath.description'); }, rarity: 'mythic', iconType: 'vex', get flavorText() { return t('compendium.vex-shadowdeath.flavorText'); } },
  { id: 'dreadlord-apotheosis', get title() { return t('compendium.dreadlord-apotheosis.title'); }, get description() { return t('compendium.dreadlord-apotheosis.description'); }, rarity: 'mythic', iconType: 'dreadlord', get flavorText() { return t('compendium.dreadlord-apotheosis.flavorText'); } },
  { id: 'zylvara-eternaleclipse', get title() { return t('compendium.zylvara-eternaleclipse.title'); }, get description() { return t('compendium.zylvara-eternaleclipse.description'); }, rarity: 'mythic', iconType: 'zylvara', get flavorText() { return t('compendium.zylvara-eternaleclipse.flavorText'); } },
  { id: 'ixara-primalrage', get title() { return t('compendium.ixara-primalrage.title'); }, get description() { return t('compendium.ixara-primalrage.description'); }, rarity: 'mythic', iconType: 'ixara', get flavorText() { return t('compendium.ixara-primalrage.flavorText'); } },

  // ── SYNERGY CARDS (shown in grimoire) ────────────────────────────────────
  { id: 'sacred-trinity', get title() { return t('compendium.sacred-trinity.title'); }, get description() { return t('compendium.sacred-trinity.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="sun" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.sacred-trinity.flavorText'); } },
  { id: 'shadow-council', get title() { return t('compendium.shadow-council.title'); }, get description() { return t('compendium.shadow-council.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="moon" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.shadow-council.flavorText'); } },
  { id: 'natures-wrath', get title() { return t('compendium.natures-wrath.title'); }, get description() { return t('compendium.natures-wrath.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="leaf" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.natures-wrath.flavorText'); } },
  { id: 'arcane-storm', get title() { return t('compendium.arcane-storm.title'); }, get description() { return t('compendium.arcane-storm.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.arcane-storm.flavorText'); } },
  { id: 'iron-bulwark', get title() { return t('compendium.iron-bulwark.title'); }, get description() { return t('compendium.iron-bulwark.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.iron-bulwark.flavorText'); } },
  { id: 'death-choir', get title() { return t('compendium.death-choir.title'); }, get description() { return t('compendium.death-choir.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.death-choir.flavorText'); } },
  { id: 'arcane-barrage', get title() { return t('compendium.arcane-barrage.title'); }, get description() { return t('compendium.arcane-barrage.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.arcane-barrage.flavorText'); } },
  { id: 'soul-mending', get title() { return t('compendium.soul-mending.title'); }, get description() { return t('compendium.soul-mending.description'); }, rarity: 'uncommon', iconType: 'special', iconSpecial: <Sigil name="heart" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.soul-mending.flavorText'); } },
  { id: 'wild-hunt', get title() { return t('compendium.wild-hunt.title'); }, get description() { return t('compendium.wild-hunt.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="star" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.wild-hunt.flavorText'); } },
  { id: 'storm-forge', get title() { return t('compendium.storm-forge.title'); }, get description() { return t('compendium.storm-forge.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="bolt" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.storm-forge.flavorText'); } },
  { id: 'verdant-pact', get title() { return t('compendium.verdant-pact.title'); }, get description() { return t('compendium.verdant-pact.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="leaf" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.verdant-pact.flavorText'); } },
  { id: 'dark-hunger', get title() { return t('compendium.dark-hunger.title'); }, get description() { return t('compendium.dark-hunger.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="fang" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.dark-hunger.flavorText'); } },
  { id: 'life-forge', get title() { return t('compendium.life-forge.title'); }, get description() { return t('compendium.life-forge.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="star" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.life-forge.flavorText'); } },
  { id: 'arcane-ruin', get title() { return t('compendium.arcane-ruin.title'); }, get description() { return t('compendium.arcane-ruin.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.arcane-ruin.flavorText'); } },
  { id: 'umbral-brood', get title() { return t('compendium.umbral-brood.title'); }, get description() { return t('compendium.umbral-brood.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="moon" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.umbral-brood.flavorText'); } },
  { id: 'coven-pyre', get title() { return t('compendium.coven-pyre.title'); }, get description() { return t('compendium.coven-pyre.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="flame" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.coven-pyre.flavorText'); } },
  { id: 'riot-engine', get title() { return t('compendium.riot-engine.title'); }, get description() { return t('compendium.riot-engine.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="gear" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.riot-engine.flavorText'); } },
  { id: 'hexbound-pact', get title() { return t('compendium.hexbound-pact.title'); }, get description() { return t('compendium.hexbound-pact.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.hexbound-pact.flavorText'); } },
  { id: 'grave-contagion', get title() { return t('compendium.grave-contagion.title'); }, get description() { return t('compendium.grave-contagion.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.grave-contagion.flavorText'); } },
  { id: 'shadow-execution', get title() { return t('compendium.shadow-execution.title'); }, get description() { return t('compendium.shadow-execution.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="moon" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.shadow-execution.flavorText'); } },
  { id: 'hunters-sigil', get title() { return t('compendium.hunters-sigil.title'); }, get description() { return t('compendium.hunters-sigil.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="eye" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.hunters-sigil.flavorText'); } },
  { id: 'berserker-core', get title() { return t('compendium.berserker-core.title'); }, get description() { return t('compendium.berserker-core.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.berserker-core.flavorText'); } },
  { id: 'war-anthem', get title() { return t('compendium.war-anthem.title'); }, get description() { return t('compendium.war-anthem.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.war-anthem.flavorText'); } },

  // ── BERSERKER ──────────────────────────────────────────────────────────────
  {
    id: 'new-berserker', get title() { return t('compendium.new-berserker.title'); },
    get description() { return t('compendium.new-berserker.description'); },
    rarity: 'mythic', iconType: 'berserker',
    get flavorText() { return t('compendium.new-berserker.flavorText'); },
  },
  { id: 'berserker-iron-skin', get title() { return t('compendium.berserker-iron-skin.title'); }, get description() { return t('compendium.berserker-iron-skin.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.berserker-iron-skin.flavorText'); } },
  { id: 'berserker-bloodrage', get title() { return t('compendium.berserker-bloodrage.title'); }, get description() { return t('compendium.berserker-bloodrage.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="blood" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.berserker-bloodrage.flavorText'); } },
  { id: 'berserker-warchief', get title() { return t('compendium.berserker-warchief.title'); }, get description() { return t('compendium.berserker-warchief.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.berserker-warchief.flavorText'); } },
  { id: 'berserker-eternity', get title() { return t('compendium.berserker-eternity.title'); }, get description() { return t('compendium.berserker-eternity.description'); }, rarity: 'mythic', iconType: 'berserker', get flavorText() { return t('compendium.berserker-eternity.flavorText'); } },

  // ── FROST WARDEN ────────────────────────────────────────────────────────────
  {
    id: 'new-frost_warden', get title() { return t('compendium.new-frost_warden.title'); },
    get description() { return t('compendium.new-frost_warden.description'); },
    rarity: 'mythic', iconType: 'frost_warden',
    get flavorText() { return t('compendium.new-frost_warden.flavorText'); },
  },
  { id: 'frost_warden-deep-freeze', get title() { return t('compendium.frost_warden-deep-freeze.title'); }, get description() { return t('compendium.frost_warden-deep-freeze.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="frost" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.frost_warden-deep-freeze.flavorText'); } },
  { id: 'frost_warden-shatter', get title() { return t('compendium.frost_warden-shatter.title'); }, get description() { return t('compendium.frost_warden-shatter.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="frost" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.frost_warden-shatter.flavorText'); } },
  { id: 'frost_warden-wall-mastery', get title() { return t('compendium.frost_warden-wall-mastery.title'); }, get description() { return t('compendium.frost_warden-wall-mastery.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.frost_warden-wall-mastery.flavorText'); } },
  { id: 'frost_warden-absolute', get title() { return t('compendium.frost_warden-absolute.title'); }, get description() { return t('compendium.frost_warden-absolute.description'); }, rarity: 'mythic', iconType: 'frost_warden', get flavorText() { return t('compendium.frost_warden-absolute.flavorText'); } },

  // ── INQUISITOR ───────────────────────────────────────────────────────────────
  {
    id: 'new-inquisitor', get title() { return t('compendium.new-inquisitor.title'); },
    get description() { return t('compendium.new-inquisitor.description'); },
    rarity: 'mythic', iconType: 'inquisitor',
    get flavorText() { return t('compendium.new-inquisitor.flavorText'); },
  },
  { id: 'inquisitor-death-warrant', get title() { return t('compendium.inquisitor-death-warrant.title'); }, get description() { return t('compendium.inquisitor-death-warrant.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.inquisitor-death-warrant.flavorText'); } },
  { id: 'inquisitor-interrogation', get title() { return t('compendium.inquisitor-interrogation.title'); }, get description() { return t('compendium.inquisitor-interrogation.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="eye" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.inquisitor-interrogation.flavorText'); } },
  { id: 'inquisitor-crusade', get title() { return t('compendium.inquisitor-crusade.title'); }, get description() { return t('compendium.inquisitor-crusade.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.inquisitor-crusade.flavorText'); } },
  { id: 'inquisitor-judgment', get title() { return t('compendium.inquisitor-judgment.title'); }, get description() { return t('compendium.inquisitor-judgment.description'); }, rarity: 'mythic', iconType: 'inquisitor', get flavorText() { return t('compendium.inquisitor-judgment.flavorText'); } },

  // ── YUE ───────────────────────────────────────────────────────────────────────
  {
    id: 'new-yue', get title() { return t('compendium.new-yue.title'); },
    get description() { return t('compendium.new-yue.description'); },
    rarity: 'rare', iconType: 'yue',
    get flavorText() { return t('compendium.new-yue.flavorText'); },
  },
  { id: 'yue-holofote', get title() { return t('compendium.yue-holofote.title'); }, get description() { return t('compendium.yue-holofote.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="star" size={52} style={{ color: '#e8a0c8' }} />, get flavorText() { return t('compendium.yue-holofote.flavorText'); } },
  { id: 'yue-passo-duplo', get title() { return t('compendium.yue-passo-duplo.title'); }, get description() { return t('compendium.yue-passo-duplo.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="fast" size={52} style={{ color: '#e8a0c8' }} />, get flavorText() { return t('compendium.yue-passo-duplo.flavorText'); } },
  { id: 'yue-camarim', get title() { return t('compendium.yue-camarim.title'); }, get description() { return t('compendium.yue-camarim.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#e8a0c8' }} />, get flavorText() { return t('compendium.yue-camarim.flavorText'); } },
  { id: 'yue-ritmo-vibrante', get title() { return t('compendium.yue-ritmo-vibrante.title'); }, get description() { return t('compendium.yue-ritmo-vibrante.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="note" size={52} style={{ color: '#e8a0c8' }} />, get flavorText() { return t('compendium.yue-ritmo-vibrante.flavorText'); } },
  { id: 'yue-bis', get title() { return t('compendium.yue-bis.title'); }, get description() { return t('compendium.yue-bis.description'); }, rarity: 'mythic', iconType: 'yue', get flavorText() { return t('compendium.yue-bis.flavorText'); } },

  // ── BILLY ─────────────────────────────────────────────────────────────────────
  {
    id: 'new-billy', get title() { return t('compendium.new-billy.title'); },
    get description() { return t('compendium.new-billy.description'); },
    rarity: 'rare', iconType: 'billy',
    get flavorText() { return t('compendium.new-billy.flavorText'); },
  },
  { id: 'billy-balas-marcadas', get title() { return t('compendium.billy-balas-marcadas.title'); }, get description() { return t('compendium.billy-balas-marcadas.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="eye" size={52} style={{ color: '#e8b04a' }} />, get flavorText() { return t('compendium.billy-balas-marcadas.flavorText'); } },
  { id: 'billy-recarga-rapida', get title() { return t('compendium.billy-recarga-rapida.title'); }, get description() { return t('compendium.billy-recarga-rapida.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="fast" size={52} style={{ color: '#e8b04a' }} />, get flavorText() { return t('compendium.billy-recarga-rapida.flavorText'); } },
  { id: 'billy-cortina-final', get title() { return t('compendium.billy-cortina-final.title'); }, get description() { return t('compendium.billy-cortina-final.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#e8b04a' }} />, get flavorText() { return t('compendium.billy-cortina-final.flavorText'); } },
  { id: 'billy-tiro-certeiro', get title() { return t('compendium.billy-tiro-certeiro.title'); }, get description() { return t('compendium.billy-tiro-certeiro.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="bow" size={52} style={{ color: '#e8b04a' }} />, get flavorText() { return t('compendium.billy-tiro-certeiro.flavorText'); } },
  { id: 'billy-obra-prima', get title() { return t('compendium.billy-obra-prima.title'); }, get description() { return t('compendium.billy-obra-prima.description'); }, rarity: 'mythic', iconType: 'billy', get flavorText() { return t('compendium.billy-obra-prima.flavorText'); } },

  // ── NEW SYNERGIES ────────────────────────────────────────────────────────────
  { id: 'blood-and-ice', get title() { return t('compendium.blood-and-ice.title'); }, get description() { return t('compendium.blood-and-ice.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="frost" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.blood-and-ice.flavorText'); } },
  { id: 'divine-verdict', get title() { return t('compendium.divine-verdict.title'); }, get description() { return t('compendium.divine-verdict.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="leaf" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.divine-verdict.flavorText'); } },
  { id: 'iron-conviction', get title() { return t('compendium.iron-conviction.title'); }, get description() { return t('compendium.iron-conviction.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.iron-conviction.flavorText'); } },
  { id: 'permafrost-ward', get title() { return t('compendium.permafrost-ward.title'); }, get description() { return t('compendium.permafrost-ward.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="shield" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.permafrost-ward.flavorText'); } },

  // ── MALACHAR O REDIMIDO ──────────────────────────────────────────────────
  {
    id: 'new-malachar_human', get title() { return t('compendium.new-malachar_human.title'); },
    get description() { return t('compendium.new-malachar_human.description'); },
    rarity: 'mythic', iconType: 'malachar_human',
    get flavorText() { return t('compendium.new-malachar_human.flavorText'); },
  },
  { id: 'malachar-soulpact', get title() { return t('compendium.malachar-soulpact.title'); }, get description() { return t('compendium.malachar-soulpact.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="ghost" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.malachar-soulpact.flavorText'); } },
  { id: 'malachar-voidstorm', get title() { return t('compendium.malachar-voidstorm.title'); }, get description() { return t('compendium.malachar-voidstorm.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.malachar-voidstorm.flavorText'); } },
  { id: 'malachar-ascension', get title() { return t('compendium.malachar-ascension.title'); }, get description() { return t('compendium.malachar-ascension.description'); }, rarity: 'mythic', iconType: 'malachar_human', get flavorText() { return t('compendium.malachar-ascension.flavorText'); } },
  { id: 'malachar-solitude', get title() { return t('compendium.malachar-solitude.title'); }, get description() { return t('compendium.malachar-solitude.description'); }, rarity: 'legendary', iconType: 'special', iconSpecial: <Sigil name="moon" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.malachar-solitude.flavorText'); } },

  // ── Extra cards to reach 5 per hero ─────────────────────────────────────
  { id: 'vex-deathmark', get title() { return t('compendium.vex-deathmark.title'); }, get description() { return t('compendium.vex-deathmark.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="eye" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.vex-deathmark.flavorText'); } },
  { id: 'zylvara-widow', get title() { return t('compendium.zylvara-widow.title'); }, get description() { return t('compendium.zylvara-widow.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="skull" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.zylvara-widow.flavorText'); } },
  { id: 'morrigan-soulecho', get title() { return t('compendium.morrigan-soulecho.title'); }, get description() { return t('compendium.morrigan-soulecho.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="ghost" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.morrigan-soulecho.flavorText'); } },
  { id: 'ixara-furysurge', get title() { return t('compendium.ixara-furysurge.title'); }, get description() { return t('compendium.ixara-furysurge.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.ixara-furysurge.flavorText'); } },
  { id: 'berserker-battlecry', get title() { return t('compendium.berserker-battlecry.title'); }, get description() { return t('compendium.berserker-battlecry.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="swords" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.berserker-battlecry.flavorText'); } },
  { id: 'frost_warden-coldsnap', get title() { return t('compendium.frost_warden-coldsnap.title'); }, get description() { return t('compendium.frost_warden-coldsnap.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="frost" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.frost_warden-coldsnap.flavorText'); } },
  { id: 'inquisitor-holybrand', get title() { return t('compendium.inquisitor-holybrand.title'); }, get description() { return t('compendium.inquisitor-holybrand.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="sun" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.inquisitor-holybrand.flavorText'); } },
  { id: 'malachar-voidrift', get title() { return t('compendium.malachar-voidrift.title'); }, get description() { return t('compendium.malachar-voidrift.description'); }, rarity: 'rare', iconType: 'special', iconSpecial: <Sigil name="arcane" size={52} style={{ color: '#bc8e78' }} />, get flavorText() { return t('compendium.malachar-voidrift.flavorText'); } },
];
