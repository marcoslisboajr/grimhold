// ══════════════════════════════════════════════════════════════════════
// data/starterChars.ts
// Extracted from GameCanvas.tsx — playable character configurations.
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import { AllyType } from '../types';
import { t } from '../../i18n';
import { Zap, Shield, Wind, Flame, Eye, Leaf, Skull as SkullIcon,
  Combine, Cross, Swords, Crown, Coins, Hammer, Snowflake, Music,
  Check, Book, ArrowLeft, Sun, Crosshair, Heart, Lock, Gem,
  CloudRain, LogOut, ScrollText, Star } from 'lucide-react';

export interface CharacterConfig {
  type: AllyType;
  name: string;
  description: string;
  lore?: string;
  damage?: number;
  attackSpeed?: number;
  range?: number;
  projectileSpeed?: number;
  hp?: number;
  maxHp?: number;
  color?: string;
  icon: React.ReactNode;
}

export const STARTER_CHARS: CharacterConfig[] = [
  {
    // Common — DPS ~18 | balanced starter, unchanged (already well-tuned)
    type: 'mage',
    get name() { return t('hero.mage.name'); },
    get description() { return t('hero.mage.description'); },
    get lore() { return t('hero.mage.lore'); },
    damage: 25, attackSpeed: 1000, range: 650, projectileSpeed: 8, color: 'text-[#6d8894]', hp: 95, maxHp: 95,
    icon: <Flame size={20} className="text-[#a0978d]" />
  },
  {
    // Common — DPS ~14 | bleed identity preserved; dmg raised 4→14, hp 55→70
    // Old: dmg 4 / hp 55 (hero: 12 dmg, 165 hp) — unplayable as starter
    // New: dmg 14 / hp 70 (hero: 42 dmg, 210 hp) — still weakest common but fair
    // Range stays 950 as the defining trait; bleed still differentiates
    type: 'archer',
    get name() { return t('hero.archer.name'); },
    get description() { return t('hero.archer.description'); },
    get lore() { return t('hero.archer.lore'); },
    damage: 21, attackSpeed: 1000, range: 920, projectileSpeed: 13, color: 'text-[#936149]', hp: 75, maxHp: 75,
    icon: <Wind size={20} className="text-[#ac7357]" />
  },
  {
    // Common — DPS ~17 | unchanged, crit chance makes effective DPS higher
    type: 'druid',
    get name() { return t('hero.druid.name'); },
    get description() { return t('hero.druid.description'); },
    get lore() { return t('hero.druid.lore'); },
    damage: 20, attackSpeed: 800, range: 600, projectileSpeed: 10, color: 'text-[#544c44]', hp: 85, maxHp: 85,
    icon: <Leaf size={20} className="text-[#80776c]" />
  },
  {
    // Common — DPS ~17 | unchanged, divine blessing upside justifies the kit
    type: 'cleric',
    get name() { return t('hero.cleric.name'); },
    get description() { return t('hero.cleric.description'); },
    get lore() { return t('hero.cleric.lore'); },
    damage: 24, attackSpeed: 950, range: 570, projectileSpeed: 9, color: 'text-[#cca998]', hp: 110, maxHp: 110,
    icon: <Sun size={20} className="text-[#ac7357]" />
  },
  {
    // Uncommon — DPS ~24 | dmg 28→22, hp 150→120; was competing with Rare tier
    // Old: 32.9 DPS, 150 HP — basically Rare-level, made Runesmith feel redundant
    // New: 25.9 DPS, 120 HP — tanky generalist that earns its Uncommon slot
    type: 'paladin',
    get name() { return t('hero.paladin.name'); },
    get description() { return t('hero.paladin.description'); },
    get lore() { return t('hero.paladin.lore'); },
    damage: 30, attackSpeed: 900, range: 620, projectileSpeed: 9, color: 'text-[#cca998]', hp: 140, maxHp: 140,
    icon: <Shield size={20} className="text-[#ac7357]" />
  },
  {
    // Uncommon — DPS ~28 | range 500→560; high burst identity preserved
    // Short range was the stated tradeoff, but 500 was punishing as hero start
    // 560 keeps the glass-cannon feel without making it unplayable on wave 1
    type: 'warlock',
    get name() { return t('hero.warlock.name'); },
    get description() { return t('hero.warlock.description'); },
    get lore() { return t('hero.warlock.lore'); },
    damage: 55, attackSpeed: 1800, range: 550, projectileSpeed: 6, color: 'text-[#80776c]', hp: 125, maxHp: 125,
    icon: <Eye size={20} className="text-[#a0978d]" />
  },
  {
    // Uncommon — support | dmg 10→14, hp 80→100, range 500→560
    // Priest is pure support so raw DPS will always be low — that's fine
    // But as a hero starter, 30 hero-dmg / 240 hero-hp was too frail to survive early waves
    // New: 42 hero-dmg / 300 hero-hp — still weakest dmg but the heals pay it back
    type: 'priest',
    get name() { return t('hero.priest.name'); },
    get description() { return t('hero.priest.description'); },
    get lore() { return t('hero.priest.lore'); },
    damage: 20, attackSpeed: 1400, range: 520, projectileSpeed: 7, color: 'text-[#bfb8ae]', hp: 100, maxHp: 100,
    icon: <Cross size={20} className="text-[#a0978d]" />
  },
  {
    // SemiRare — DPS ~23 | dmg 26→28, hp 65→85, range 580→600
    // HP 65 (195 hero) was too fragile for a SemiRare pick — skeleton needs its master alive
    type: 'necromancer',
    get name() { return t('hero.necromancer.name'); },
    get description() { return t('hero.necromancer.description'); },
    get lore() { return t('hero.necromancer.lore'); },
    damage: 35, attackSpeed: 1100, range: 600, projectileSpeed: 7, color: 'text-[#80776c]', hp: 90, maxHp: 90,
    icon: <SkullIcon size={20} className="text-[#80776c]" />
  },
  {
    // SemiRare — support aura | dmg 5→10, range 320→480, hp 70→85
    // Old range 320 meant the hero couldn't hit anything while the aura barely reached allies
    // Aura radius is derived from range, so 480 makes the buff actually functional as hero
    // Dmg raised to 10 so hero bard isn't completely useless in combat
    type: 'bard',
    get name() { return t('hero.bard.name'); },
    get description() { return t('hero.bard.description'); },
    get lore() { return t('hero.bard.lore'); },
    damage: 9, attackSpeed: 600, range: 500, projectileSpeed: 7, color: 'text-[#81483f]', hp: 90, maxHp: 90,
    icon: <Music size={20} className="text-[#9f584e]" />
  },
  {
    // Rare — DPS ~32 | unchanged — chain lightning every 5th shot is the identity
    type: 'runesmith',
    get name() { return t('hero.runesmith.name'); },
    get description() { return t('hero.runesmith.description'); },
    get lore() { return t('hero.runesmith.lore'); },
    damage: 40, attackSpeed: 950, range: 650, projectileSpeed: 9, color: 'text-[#a0978d]', hp: 115, maxHp: 115,
    icon: <Crosshair size={20} className="text-[#a0978d]" />
  },
  {
    // Rare — DPS ~31 | dmg 25→28, hp 90→100; passive heals + poison justified bump
    // Sylvanite's real value is off-sheet (heals + DoT), but base stats felt underpowered for Rare
    type: 'sylvanite',
    get name() { return t('hero.sylvanite.name'); },
    get description() { return t('hero.sylvanite.description'); },
    get lore() { return t('hero.sylvanite.lore'); },
    damage: 30, attackSpeed: 800, range: 680, projectileSpeed: 9, color: 'text-[#80776c]', hp: 110, maxHp: 110,
    icon: <Leaf size={20} className="text-[#a0978d]" />
  },
  {
    // Legendary — DPS ~57 base but self-damages; hp 130→150 to survive long enough for ramp
    // The self-damage mechanic means effective HP is lower than the number suggests
    // Slight HP buff lets him actually reach the low-HP berserker threshold mid-fight
    type: 'dreadlord',
    get name() { return t('hero.dreadlord.name'); },
    get description() { return t('hero.dreadlord.description'); },
    get lore() { return t('hero.dreadlord.lore'); },
    damage: 75, attackSpeed: 1300, range: 600, projectileSpeed: 7, color: 'text-[#81483f]', hp: 170, maxHp: 170,
    icon: <SkullIcon size={20} className="text-[#9f584e]" />
  },
  {
    // Legendary — chaos hybrid | Cycling 3-ball attack + Chaos Aura + Roulette on death
    type: 'jester',
    get name() { return t('hero.jester.name'); },
    get description() { return t('hero.jester.description'); },
    get lore() { return t('hero.jester.lore'); },
    damage: 60, attackSpeed: 950, range: 620, projectileSpeed: 10, color: 'text-[#a0978d]', hp: 155, maxHp: 155,
    icon: <Gem size={20} className="text-[#a0978d]" />
  },
  {
    // SemiRare — melee dash assassin | every 5th attack = Sai Rush (teleport + AoE)
    // Short range, high burst, lifesteal on dash kills
    type: 'vex' as any,
    get name() { return t('hero.vex.name'); },
    get description() { return t('hero.vex.description'); },
    get lore() { return t('hero.vex.lore'); },
    damage: 34, attackSpeed: 750, range: 700, projectileSpeed: 16, color: 'text-[#a0978d]', hp: 95, maxHp: 95,
    icon: <Swords size={20} className="text-[#a0978d]" />
  },
  {
    // Rare — Shadow Elf / Umbral Archer — poison arrows + Shadow Step every 6 attacks
    type: 'zylvara' as any,
    get name() { return t('hero.zylvara.name'); },
    get description() { return t('hero.zylvara.description'); },
    get lore() { return t('hero.zylvara.lore'); },
    damage: 28, attackSpeed: 700, range: 850, projectileSpeed: 13, color: 'text-[#a0978d]', hp: 120, maxHp: 120,
    icon: <Crosshair size={20} className="text-[#a0978d]" />
  },
  {
    // Legendary — Hexblade Witch — ash stacks + curse explosions + barrier sacrifice passive
    type: 'morrigan' as any,
    get name() { return t('hero.morrigan.name'); },
    get description() { return t('hero.morrigan.description'); },
    get lore() { return t('hero.morrigan.lore'); },
    damage: 55, attackSpeed: 1300, range: 520, projectileSpeed: 9, color: 'text-[#a0978d]', hp: 160, maxHp: 160,
    icon: <SkullIcon size={20} className="text-[#a0978d]" />
  },
  {
    // SemiRare — Chaos Demoness — fury stacks on taking damage, chaos nova every 5 attacks
    type: 'ixara' as any,
    get name() { return t('hero.ixara.name'); },
    get description() { return t('hero.ixara.description'); },
    get lore() { return t('hero.ixara.lore'); },
    damage: 35, attackSpeed: 950, range: 530, projectileSpeed: 10, color: 'text-[#a0978d]', hp: 115, maxHp: 115,
    icon: <Flame size={20} className="text-[#a0978d]" />
  },
  {
    // Rare — Physical berserker | Blood Rage: damage scales with barrier damage taken
    type: 'berserker' as any,
    get name() { return t('hero.berserker.name'); },
    get description() { return t('hero.berserker.description'); },
    get lore() { return t('hero.berserker.lore'); },
    damage: 48, attackSpeed: 950, range: 570, projectileSpeed: 10, color: 'text-[#81483f]', hp: 140, maxHp: 140,
    icon: <Hammer size={20} className="text-[#9f584e]" />
  },
  {
    // SemiRare — Frost damage, zone control | Permafrost patches + Glacial Wall
    type: 'frost_warden' as any,
    get name() { return t('hero.frost_warden.name'); },
    get description() { return t('hero.frost_warden.description'); },
    get lore() { return t('hero.frost_warden.lore'); },
    damage: 32, attackSpeed: 900, range: 620, projectileSpeed: 9, color: 'text-[#a0978d]', hp: 120, maxHp: 120,
    icon: <Snowflake size={20} className="text-[#a0978d]" />
  },
  {
    // Legendary — Holy+Shadow hybrid | Verdict stacks per enemy type + Sentence active
    type: 'inquisitor' as any,
    get name() { return t('hero.inquisitor.name'); },
    get description() { return t('hero.inquisitor.description'); },
    get lore() { return t('hero.inquisitor.lore'); },
    damage: 62, attackSpeed: 1200, range: 590, projectileSpeed: 9, color: 'text-[#cca998]', hp: 155, maxHp: 155,
    icon: <Star size={20} className="text-[#bc8e78]" />
  },
  {
    // Rare — vanguarda de controle | Plateia (+dano por inimigo perto) + Encanto a cada 5 ataques
    type: 'yue',
    get name() { return t('hero.yue.name'); },
    get description() { return t('hero.yue.description'); },
    get lore() { return t('hero.yue.lore'); },
    damage: 16, attackSpeed: 850, range: 420, projectileSpeed: 10, color: 'text-[#f0d9e8]', hp: 140, maxHp: 140,
    icon: <Music size={20} className="text-[#e8a0c8]" />
  },
  {
    // Rare — precisao | Quatro Balas: o 4o tiro crita e executa; Cortina a cada 4 recargas
    type: 'billy',
    get name() { return t('hero.billy.name'); },
    get description() { return t('hero.billy.description'); },
    get lore() { return t('hero.billy.lore'); },
    damage: 34, attackSpeed: 1400, range: 720, projectileSpeed: 16, color: 'text-[#d9c1b6]', hp: 85, maxHp: 85,
    icon: <Crosshair size={20} className="text-[#e8b04a]" />
  },
  {
    // Special Legendary - Unlock by killing Malachar in Act 5
    type: 'malachar_human' as any,
    get name() { return t('hero.malachar_human.name'); },
    get description() { return t('hero.malachar_human.description'); },
    get lore() { return t('hero.malachar_human.lore'); },
    damage: 80, attackSpeed: 1400, range: 680, projectileSpeed: 11, color: 'text-[#a0978d]', hp: 200, maxHp: 200,
    icon: <Zap size={20} className="text-[#a0978d]" />,
  },
];
