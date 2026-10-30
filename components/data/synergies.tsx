// ══════════════════════════════════════════════════════════════════════
// data/synergies.tsx
// Sinergias, temas de ato e combos cross-class, extraídos do GameCanvas.
// O texto (name/desc) vem do i18n, por GETTERS. Para mexer no texto, edite
// i18n/locales/en.json nas chaves 'synergy.<key>.*' e 'combo.<id>.*'.
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import { t, tList } from '../../i18n';
import {
  Zap, Shield, Wind, Flame, Eye, Leaf, Skull as SkullIcon,
  Combine, Cross, Swords, Crown, Coins, Hammer, Snowflake, Music,
  Check, Book, ArrowLeft, Sun, Crosshair, Heart, Lock, Gem,
  CloudRain, LogOut, ScrollText, Star, Users
} from 'lucide-react';

export interface SynergyLevel {
  count: number;
  desc: string;
}

export interface SynergyDef {
  name: string;
  icon: React.ReactNode;
  color: string;
  levels: SynergyLevel[];
}

// ══════════════════════════════════════════════════════════════════
// ACT THEME SYSTEM — HUD colors per act
// ══════════════════════════════════════════════════════════════════
export interface ActTheme {
  bg: string;          // panel background
  border: string;      // outer border
  borderInner: string; // inner accent border
  accent: string;      // main accent color (text highlight, bar fill end)
  accentDim: string;   // dimmed accent (labels, secondary text)
  accentFaint: string; // very faint (bar background, slot empty)
  barFill: string;     // main bar fill — cor chapada (era gradiente)
  barBg: string;       // bar track background
  btnBg: string;       // button background
  corner: string;      // corner bracket color
  text: string;        // primary text
  textMuted: string;   // muted text
}

// ── DIREÇÃO "ESTELA": paleta de material, não de neon ──────────────
// Cada ato mantém a sua identidade cromática (2 verde, 3 brasa,
// 4 gelo, 5 abismo), mas saiu do neon Tailwind e virou pedra tingida,
// metal oxidado, pigmento. `barFill` deixou de ser gradiente.
export const ACT_THEMES: Record<string, ActTheme> = {
  standard: { // Act 1 — Deserto / Pedra / Ouro velho
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#9a7b3f', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#9a7b3f', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act2: { // Act 2 — Floresta Amaldiçoada / Verdete
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#617355', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#617355', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act3: { // Act 3 — Vulcão / Ferro / Brasa sob cinza
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#a85a34', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#a85a34', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act4: { // Act 4 — Tundra / Cristal / Aço-gelo
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#6d8894', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#6d8894', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act5: { // Act 5 — Abismo Arcano / Ametista bruta
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#8a6e96', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#8a6e96', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act6: { // Act 6 — A Outra Margem / Violeta frio (material slate na selecao)
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#7c6f9e', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#7c6f9e', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act7: { // Act 7 — A Ravina dos Xamas / Verde de selva (material verdigris na selecao)
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#5f9a6a', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#5f9a6a', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act8: { // Act 8 — O Mar Sem Fundo / Ciano de mar fundo (material frost na selecao)
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#4f97a3', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#4f97a3', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act9: { // Act 9 — Os Guardioes / Pedra e cinza com brasa (material ember na selecao)
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#c2703a', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#c2703a', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  act10: { // Act 10 — O Ventre / Violeta de carne (material amethyst na selecao)
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#8b5cf6', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#8b5cf6', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  randomizer: { // Randomizer — Pedra de masmorra / tocha
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#8a7048', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#5f7079', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  endless: { // Endless — Pedra de masmorra: ardósia fria + tocha
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#8a7048', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#5f7079', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
  cursed: { // Cursed — Púrpura de tumba
    bg: '#1a1513', border: '#322118', borderInner: '#241711',
    accent: '#96688f', accentDim: '#80776c', accentFaint: '#322118',
    barFill: '#96688f', barBg: '#322118',
    btnBg: '#221b18', corner: '#544c44',
    text: '#e4d1c8', textMuted: '#80776c',
  },
};

export const getActTheme = (gameMode: string): ActTheme =>
  ACT_THEMES[gameMode] ?? ACT_THEMES.standard;

export const SYNERGIES: Record<string, SynergyDef> = {
  // ── Same-class synergies ──────────────────────────────────────────────
  archer: {
    get name() { return t('synergy.archer.name'); },
    icon: <Wind size={16} />,
    color: 'text-green-400',
    levels: [
      { count: 1, get desc() { return t('synergy.archer.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.archer.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.archer.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.archer.level.3.desc'); } }
    ]
  },
  mage: {
    get name() { return t('synergy.mage.name'); },
    icon: <Flame size={16} />,
    color: 'text-blue-400',
    levels: [
      { count: 1, get desc() { return t('synergy.mage.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.mage.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.mage.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.mage.level.3.desc'); } }
    ]
  },
  warlock: {
    get name() { return t('synergy.warlock.name'); },
    icon: <Zap size={16} />,
    color: 'text-purple-400',
    levels: [
      { count: 1, get desc() { return t('synergy.warlock.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.warlock.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.warlock.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.warlock.level.3.desc'); } }
    ]
  },
  druid: {
    get name() { return t('synergy.druid.name'); },
    icon: <Leaf size={16} />,
    color: 'text-emerald-400',
    levels: [
      { count: 1, get desc() { return t('synergy.druid.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.druid.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.druid.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.druid.level.3.desc'); } }
    ]
  },
  necromancer: {
    get name() { return t('synergy.necromancer.name'); },
    icon: <SkullIcon size={16} />,
    color: 'text-stone-400',
    levels: [
      { count: 1, get desc() { return t('synergy.necromancer.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.necromancer.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.necromancer.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.necromancer.level.3.desc'); } }
    ]
  },
  bard: {
    get name() { return t('synergy.bard.name'); },
    icon: <Music size={16} />,
    color: 'text-rose-400',
    levels: [
      { count: 1, get desc() { return t('synergy.bard.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.bard.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.bard.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.bard.level.3.desc'); } }
    ]
  },
  cleric: {
    get name() { return t('synergy.cleric.name'); },
    icon: <Sun size={16} />,
    color: 'text-yellow-200',
    levels: [
      { count: 1, get desc() { return t('synergy.cleric.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.cleric.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.cleric.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.cleric.level.3.desc'); } }
    ]
  },
  paladin: {
    get name() { return t('synergy.paladin.name'); },
    icon: <Shield size={16} />,
    color: 'text-amber-200',
    levels: [
      { count: 1, get desc() { return t('synergy.paladin.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.paladin.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.paladin.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.paladin.level.3.desc'); } }
    ]
  },
  priest: {
    get name() { return t('synergy.priest.name'); },
    icon: <Cross size={16} />,
    color: 'text-white',
    levels: [
      { count: 1, get desc() { return t('synergy.priest.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.priest.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.priest.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.priest.level.3.desc'); } }
    ]
  },
  runesmith: {
    get name() { return t('synergy.runesmith.name'); },
    icon: <Crosshair size={16} />,
    color: 'text-cyan-400',
    levels: [
      { count: 1, get desc() { return t('synergy.runesmith.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.runesmith.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.runesmith.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.runesmith.level.3.desc'); } }
    ]
  },
  sylvanite: {
    get name() { return t('synergy.sylvanite.name'); },
    icon: <Leaf size={16} />,
    color: 'text-emerald-300',
    levels: [
      { count: 1, get desc() { return t('synergy.sylvanite.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.sylvanite.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.sylvanite.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.sylvanite.level.3.desc'); } }
    ]
  },
  dreadlord: {
    get name() { return t('synergy.dreadlord.name'); },
    icon: <SkullIcon size={16} />,
    color: 'text-red-400',
    levels: [
      // com 1 Senhor do Pavor o codigo nao da bonus de sinergia (bloodPactTier comeca em 2 copias)
      { count: 2, get desc() { return t('synergy.dreadlord.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.dreadlord.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.dreadlord.level.3.desc'); } }
    ]
  },
  vex: {
    get name() { return t('synergy.vex.name'); },
    icon: <Swords size={16} />,
    color: 'text-purple-400',
    // numeros em components/systems/sinergias.ts (vexDashInterval/vexDashDmgMult/vexBlinkMs/vexIntocavel)
    levels: [
      { count: 1, get desc() { return t('synergy.vex.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.vex.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.vex.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.vex.level.3.desc'); } }
    ]
  },
  // Corte do Bobo (components/systems/sinergias.ts: jesterBallCooldown/jesterDmgMult/jesterTriploIntervalo)
  jester: {
    get name() { return t('synergy.jester.name'); },
    icon: <Crown size={16} />,
    color: 'text-pink-400',
    levels: [
      { count: 1, get desc() { return t('synergy.jester.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.jester.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.jester.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.jester.level.3.desc'); } }
    ]
  },
  // Coven de Almas — kit de Colheita de Almas da Morrigan (sinergias.ts: morrigan*)
  morrigan: {
    get name() { return t('synergy.morrigan.name'); },
    icon: <SkullIcon size={16} />,
    color: 'text-violet-400',
    levels: [
      { count: 1, get desc() { return t('synergy.morrigan.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.morrigan.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.morrigan.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.morrigan.level.3.desc'); } }
    ]
  },
  yue: {
    get name() { return t('synergy.yue.name'); },
    icon: <Music size={16} />,
    color: 'text-pink-300',
    levels: [
      { count: 1, get desc() { return t('synergy.yue.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.yue.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.yue.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.yue.level.3.desc'); } }
    ]
  },
  billy: {
    get name() { return t('synergy.billy.name'); },
    icon: <Crosshair size={16} />,
    color: 'text-amber-200',
    levels: [
      { count: 1, get desc() { return t('synergy.billy.level.0.desc'); } },
      { count: 2, get desc() { return t('synergy.billy.level.1.desc'); } },
      { count: 3, get desc() { return t('synergy.billy.level.2.desc'); } },
      { count: 4, get desc() { return t('synergy.billy.level.3.desc'); } }
    ]
  },
};

// ── Cross-class combo definitions ────────────────────────────────────────────
// Each combo has a required set of unit types (by count threshold) and tier buffs
export interface ComboDef {
  id: string;
  types: AllyType[];        // which types count toward this combo
  thresholds: number[];     // e.g. [3, 6] — tier1 at 3 units, tier2 at 6
  name: string;
  descs: string[];          // description per threshold tier
  icon: React.ReactNode;
  color: string;
}

export const COMBOS: ComboDef[] = [
  // ── Sacred Trinity: Paladin + Priest + Cleric ────────────────────────────
  {
    id: 'sacred-trinity',
    types: ['paladin', 'priest', 'cleric'],
    thresholds: [3, 6],
    get name() { return t('combo.sacred-trinity.name'); },
    get descs() { return tList('combo.sacred-trinity.desc'); },
    icon: <Sun size={16} />,
    color: 'text-yellow-300'
  },
  // ── Nature's Wrath: Druid + Archer ──────────────────────────────────────
  {
    id: 'natures-wrath',
    types: ['druid', 'archer'],
    thresholds: [2, 4],
    get name() { return t('combo.natures-wrath.name'); },
    get descs() { return tList('combo.natures-wrath.desc'); },
    icon: <Leaf size={16} />,
    color: 'text-lime-400'
  },
  // ── Arcane Storm: Mage + Warlock ─────────────────────────────────────────
  {
    id: 'arcane-storm',
    types: ['mage', 'warlock'],
    thresholds: [2, 4],
    get name() { return t('combo.arcane-storm.name'); },
    get descs() { return tList('combo.arcane-storm.desc'); },
    icon: <Zap size={16} />,
    color: 'text-fuchsia-400'
  },
  // ── Iron Bulwark: Paladin + Frost Warden (era Paladin + Cleric, subconjunto da Trindade) ──
  {
    id: 'iron-bulwark',
    types: ['paladin', 'frost_warden'],
    thresholds: [2, 4],
    get name() { return t('combo.iron-bulwark.name'); },
    get descs() { return tList('combo.iron-bulwark.desc'); },
    icon: <Shield size={16} />,
    color: 'text-amber-400'
  },
  // (Balada de Sangue fundida na Caçada Selvagem — mesmos tipos; id 'ballad-of-blood' livre)
  // ── Death Choir: Necromancer + Bard ─────────────────────────────────────
  {
    id: 'death-choir',
    types: ['necromancer', 'bard'],
    thresholds: [2, 3],
    get name() { return t('combo.death-choir.name'); },
    get descs() { return tList('combo.death-choir.desc'); },
    icon: <SkullIcon size={16} />,
    color: 'text-indigo-400'
  },
  // ── Arcane Barrage: Mage + Archer ────────────────────────────────────────
  {
    id: 'arcane-barrage',
    types: ['mage', 'archer'],
    thresholds: [2, 4],
    get name() { return t('combo.arcane-barrage.name'); },
    get descs() { return tList('combo.arcane-barrage.desc'); },
    icon: <Crosshair size={16} />,
    color: 'text-cyan-400'
  },
  // ── Soul Mending: Priest + Bard ──────────────────────────────────────────
  {
    id: 'soul-mending',
    types: ['priest', 'bard'],
    thresholds: [2, 3],
    get name() { return t('combo.soul-mending.name'); },
    get descs() { return tList('combo.soul-mending.desc'); },
    icon: <Heart size={16} />,
    color: 'text-pink-400'
  },
  // ── Wild Hunt: Archer + Druid + Bard ─────────────────────────────────────
  {
    id: 'wild-hunt',
    types: ['archer', 'druid', 'bard'],
    thresholds: [3, 5],
    get name() { return t('combo.wild-hunt.name'); },
    get descs() { return tList('combo.wild-hunt.desc'); },
    icon: <Wind size={16} />,
    color: 'text-green-300'
  },
  // ── Storm Forge: Runesmith + Mage ────────────────────────────────────────
  {
    id: 'storm-forge',
    types: ['runesmith', 'mage'],
    thresholds: [2, 4],
    get name() { return t('combo.storm-forge.name'); },
    get descs() { return tList('combo.storm-forge.desc'); },
    icon: <Zap size={16} />,
    color: 'text-cyan-300'
  },
  // ── Verdant Pact: Sylvanite + Druid ──────────────────────────────────────
  {
    id: 'verdant-pact',
    types: ['sylvanite', 'druid'],
    thresholds: [2, 4],
    get name() { return t('combo.verdant-pact.name'); },
    get descs() { return tList('combo.verdant-pact.desc'); },
    icon: <Leaf size={16} />,
    color: 'text-lime-300'
  },
  // ── Dark Hunger: Dreadlord + Warlock ─────────────────────────────────────
  {
    id: 'dark-hunger',
    types: ['dreadlord', 'warlock'],
    thresholds: [2, 4],
    get name() { return t('combo.dark-hunger.name'); },
    get descs() { return tList('combo.dark-hunger.desc'); },
    icon: <Eye size={16} />,
    color: 'text-red-400'
  },
  // ── Life Forge: Sylvanite + Hyo ──────────────────────────────────────────
  {
    id: 'life-forge',
    types: ['sylvanite', 'priest'],
    thresholds: [2, 3],
    get name() { return t('combo.life-forge.name'); },
    get descs() { return tList('combo.life-forge.desc'); },
    icon: <Heart size={16} />,
    color: 'text-emerald-400'
  },
  // ── Arcane Ruin: Runesmith + Warlock + Mage ──────────────────────────────
  {
    id: 'arcane-ruin',
    types: ['runesmith', 'warlock', 'mage'],
    thresholds: [3, 5],
    get name() { return t('combo.arcane-ruin.name'); },
    get descs() { return tList('combo.arcane-ruin.desc'); },
    icon: <Crosshair size={16} />,
    color: 'text-violet-300'
  },
  // ── Fool's Carnival: Jester + Bard ───────────────────────────────────────
  {
    id: 'fools-carnival',
    types: ['jester', 'bard'],
    thresholds: [2, 3],
    get name() { return t('combo.fools-carnival.name'); },
    get descs() { return tList('combo.fools-carnival.desc'); },
    icon: <Music size={16} />,
    color: 'text-fuchsia-300'
  },
  // ── Sacred Grove: Sylvanite + Cleric ─────────────────────────────────────
  {
    id: 'sacred-grove',
    types: ['sylvanite', 'cleric'],
    thresholds: [2, 3],
    get name() { return t('combo.sacred-grove.name'); },
    get descs() { return tList('combo.sacred-grove.desc'); },
    icon: <Leaf size={16} />,
    color: 'text-teal-300'
  },
  // ── Fallen Crusade: Paladin + Warlock ────────────────────────────────────
  {
    id: 'fallen-crusade',
    types: ['paladin', 'warlock'],
    thresholds: [2, 3],
    get name() { return t('combo.fallen-crusade.name'); },
    get descs() { return tList('combo.fallen-crusade.desc'); },
    icon: <Swords size={16} />,
    color: 'text-orange-300'
  },
  // ── Blood Rush: Vex + Warlock ─────────────────────────────────────────────
  {
    id: 'blood-rush',
    types: ['vex', 'warlock'],
    thresholds: [2, 4, 6],
    get name() { return t('combo.blood-rush.name'); },
    get descs() { return tList('combo.blood-rush.desc'); },
    icon: <Swords size={16} />,
    color: 'text-red-300'
  },
  // ── Shadow Step: Vex + Necromancer ───────────────────────────────────────
  {
    id: 'shadow-step',
    types: ['vex', 'necromancer'],
    thresholds: [2, 4, 6],
    get name() { return t('combo.shadow-step.name'); },
    get descs() { return tList('combo.shadow-step.desc'); },
    icon: <SkullIcon size={16} />,
    color: 'text-purple-300'
  },
  // ── Ghost Hunt: Vex + Archer ──────────────────────────────────────────────
  {
    id: 'ghost-hunt',
    types: ['vex', 'archer'],
    thresholds: [2, 4, 6],
    get name() { return t('combo.ghost-hunt.name'); },
    get descs() { return tList('combo.ghost-hunt.desc'); },
    icon: <Crosshair size={16} />,
    color: 'text-emerald-300'
  },

  // ── CUSTOM SAME-CLASS SYNERGIES ──────────────────────────────────────────
  {
    id: 'umbral-brood',
    types: ['zylvara'],
    thresholds: [1, 2, 4],
    get name() { return t('combo.umbral-brood.name'); },
    get descs() { return tList('combo.umbral-brood.desc'); },
    icon: <Crosshair size={16} />,
    color: 'text-indigo-300'
  },
  {
    id: 'coven-pyre',
    types: ['morrigan'],
    thresholds: [1, 2, 4],
    get name() { return t('combo.coven-pyre.name'); },
    get descs() { return tList('combo.coven-pyre.desc'); },
    icon: <Flame size={16} />,
    color: 'text-amber-300'
  },
  {
    id: 'riot-engine',
    types: ['ixara'],
    thresholds: [1, 2, 4],
    get name() { return t('combo.riot-engine.name'); },
    get descs() { return tList('combo.riot-engine.desc'); },
    icon: <Flame size={16} />,
    color: 'text-pink-300'
  },
  {
    id: 'grave-contagion',
    types: ['morrigan', 'necromancer'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.grave-contagion.name'); },
    get descs() { return tList('combo.grave-contagion.desc'); },
    icon: <SkullIcon size={16} />,
    color: 'text-stone-300'
  },
  {
    id: 'shadow-execution',
    types: ['zylvara', 'vex'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.shadow-execution.name'); },
    get descs() { return tList('combo.shadow-execution.desc'); },
    icon: <Swords size={16} />,
    color: 'text-indigo-300'
  },
  {
    id: 'hunters-sigil',
    types: ['zylvara', 'archer'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.hunters-sigil.name'); },
    get descs() { return tList('combo.hunters-sigil.desc'); },
    icon: <Crosshair size={16} />,
    color: 'text-green-300'
  },
  {
    id: 'berserker-core',
    types: ['ixara', 'paladin'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.berserker-core.name'); },
    get descs() { return tList('combo.berserker-core.desc'); },
    icon: <Shield size={16} />,
    color: 'text-rose-300'
  },
  {
    id: 'war-anthem',
    types: ['ixara', 'bard'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.war-anthem.name'); },
    get descs() { return tList('combo.war-anthem.desc'); },
    icon: <Music size={16} />,
    color: 'text-pink-300'
  },
  {
    id: 'blood-and-ice',
    types: ['berserker', 'frost_warden'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.blood-and-ice.name'); },
    get descs() { return tList('combo.blood-and-ice.desc'); },
    icon: <Snowflake size={16} />,
    color: 'text-sky-300'
  },
  {
    id: 'divine-verdict',
    types: ['inquisitor', 'paladin'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.divine-verdict.name'); },
    get descs() { return tList('combo.divine-verdict.desc'); },
    icon: <Crown size={16} />,
    color: 'text-amber-300'
  },
  {
    id: 'iron-conviction',
    types: ['berserker', 'inquisitor'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.iron-conviction.name'); },
    get descs() { return tList('combo.iron-conviction.desc'); },
    icon: <Swords size={16} />,
    color: 'text-red-300'
  },
  {
    id: 'permafrost-ward',
    types: ['frost_warden', 'cleric'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.permafrost-ward.name'); },
    get descs() { return tList('combo.permafrost-ward.desc'); },
    icon: <Shield size={16} />,
    color: 'text-sky-200'
  },
  {
    id: 'stage-and-aim',
    types: ['yue', 'billy'],
    thresholds: [2, 4],
    get name() { return t('combo.stage-and-aim.name'); },
    get descs() { return tList('combo.stage-and-aim.desc'); },
    icon: <Swords size={16} />,
    color: 'text-rose-300'
  },
  {
    id: 'ballad-and-dance',
    types: ['yue', 'bard'],
    thresholds: [2, 4],
    get name() { return t('combo.ballad-and-dance.name'); },
    get descs() { return tList('combo.ballad-and-dance.desc'); },
    icon: <Music size={16} />,
    color: 'text-fuchsia-300'
  },
  {
    id: 'law-and-trigger',
    types: ['billy', 'inquisitor'],
    thresholds: [2, 4],
    get name() { return t('combo.law-and-trigger.name'); },
    get descs() { return tList('combo.law-and-trigger.desc'); },
    icon: <Crosshair size={16} />,
    color: 'text-amber-400'
  },

  // ── Combos que ja existiam no codigo mas nao apareciam para o jogador ──────
  {
    id: 'shadow-council',
    types: ['warlock', 'necromancer'],
    thresholds: [2, 4],
    get name() { return t('combo.shadow-council.name'); },
    get descs() { return tList('combo.shadow-council.desc'); },
    icon: <SkullIcon size={16} />,
    color: 'text-purple-300'
  },
  {
    id: 'hexbound-pact',
    types: ['morrigan', 'warlock'],
    thresholds: [2, 4, 5],
    get name() { return t('combo.hexbound-pact.name'); },
    get descs() { return tList('combo.hexbound-pact.desc'); },
    icon: <Eye size={16} />,
    color: 'text-violet-300'
  },
  {
    id: 'danse-macabre',
    types: ['jester', 'necromancer'],
    thresholds: [2],   // o codigo tem 2 niveis, mas o 2o nao acrescenta nada
    get name() { return t('combo.danse-macabre.name'); },
    get descs() { return tList('combo.danse-macabre.desc'); },
    icon: <SkullIcon size={16} />,
    color: 'text-fuchsia-300'
  },
  {
    id: 'chaos-pact',
    types: ['jester', 'warlock'],
    thresholds: [2, 3],
    get name() { return t('combo.chaos-pact.name'); },
    get descs() { return tList('combo.chaos-pact.desc'); },
    icon: <Zap size={16} />,
    color: 'text-fuchsia-400'
  },
  {
    id: 'pact-of-ruin',
    types: ['dreadlord', 'necromancer'],
    thresholds: [2, 3],
    get name() { return t('combo.pact-of-ruin.name'); },
    get descs() { return tList('combo.pact-of-ruin.desc'); },
    icon: <SkullIcon size={16} />,
    color: 'text-red-300'
  },
  {
    id: 'void-forge',
    types: ['dreadlord', 'runesmith'],
    thresholds: [3],   // no codigo o nivel de 2 unidades nao faz nada (voidSigilDebuff nunca e lido)
    get name() { return t('combo.void-forge.name'); },
    get descs() { return tList('combo.void-forge.desc'); },
    icon: <Hammer size={16} />,
    color: 'text-red-400'
  },
];
