// GERADO por scripts/extrair-legado.py (Etapa 0, 26/09/2026) a partir de createEnemy.
// Sorteio de inimigos dos Atos I-V exatamente como estava no GameCanvas — nao editar
// os numeros aqui sem atualizar tests/atos/legado.hashes.json (GRIM_GERAR=1 npm test -- legado).
import type { EnemyType } from '../../types';

export interface StatsInimigo { type: EnemyType; hp: number; damage: number; speed: number; radius: number; attackRange: number; attackSpeed: number }
export interface FlagsSpawn { isBossSpawn: boolean; isSecondBossSpawn: boolean; isEscort: boolean }

export function sortearLegado(numero: number, baseWave: number, roll: number, f: FlagsSpawn, base: StatsInimigo): StatsInimigo {
  let { type, hp, damage, speed, radius, attackRange, attackSpeed } = base;
  const { isBossSpawn, isSecondBossSpawn, isEscort } = f;
  const isAct1 = numero === 1, isAct2 = numero === 2, isAct3 = numero === 3, isAct4 = numero === 4, isAct5 = numero === 5;
  if (isAct1) {
    // ── ACT 1: The Siege of Grimhold (DESERTO — cenario do A3) ──────
    // W1-4:   Goblins                  |  W5:  mini-boss Goblin King
    // W6-9:   Orcs                     |  W10: boss Orc Warlord
    // W11-14: Undead (mummy!)          |  W15: boss Grim Reaper
    // W16-19: Undead + orc/goblin mix  |  W20: boss Grim Reaper + Vel'Shade
    // W21-24: Children of the Ruins    |  W25: boss Medusa
    //         (centaur, harpy, stone guardian — minotauros voltaram pro Ato II)
    // W26-29: Dragons (fire, no frost) |  W30: boss Dragon Lord (FINAL)
    if (baseWave <= 4 || (isEscort && baseWave === 5)) {
      if (roll < 0.30) { type = 'goblin' as EnemyType; hp *= 1.2; damage = 5; speed *= 1.1; radius = 22; }
      else if (roll < 0.55) { type = 'goblin_archer' as EnemyType; hp *= 1.0; damage = 7; speed *= 1.0; radius = 22; attackRange = 600; attackSpeed = 2200; }
      else if (roll < 0.72) { type = 'goblin_assassin' as EnemyType; hp *= 0.9; damage = 8; speed *= 1.5; radius = 20; }
      else if (roll < 0.88) { type = 'goblin_mage' as EnemyType; hp *= 1.1; damage = 9; speed *= 0.85; radius = 22; attackRange = 550; attackSpeed = 2500; }
      else { type = 'goblin_shaman' as EnemyType; hp *= 1.3; damage = 7; speed *= 0.8; radius = 24; attackRange = 500; attackSpeed = 2800; }
    } else if (baseWave === 5 && isBossSpawn) {
      type = 'goblin_king' as EnemyType; hp *= 10; damage = 22; speed = 0.55; radius = 28; attackRange = 200; attackSpeed = 2000;
    } else if ((baseWave >= 6 && baseWave <= 9) || (isEscort && baseWave === 10)) {
      if (roll < 0.30) { type = 'orc' as EnemyType; hp *= 1.8; damage = 6; speed *= 0.7; radius = 28; }
      else if (roll < 0.55) { type = 'orc_spearman' as EnemyType; hp *= 1.4; damage = 7; attackRange = 500; attackSpeed = 2500; radius = 26; }
      else if (roll < 0.75) { type = 'orc_warrior' as EnemyType; hp *= 2.0; damage = 8; speed *= 0.6; radius = 30; }
      else if (roll < 0.90) { type = 'orc_berserker' as EnemyType; hp *= 1.6; damage = 12; speed *= 1.3; radius = 28; }
      else { type = 'orc_leader' as EnemyType; hp *= 3.5; damage = 10; speed *= 0.8; radius = 32; }
    } else if (baseWave === 10 && isBossSpawn) {
      type = 'orc_warlord' as EnemyType; hp *= 18; damage = 25; speed = 0.35; radius = 30; attackRange = 150; attackSpeed = 2000;
    } else if ((baseWave >= 11 && baseWave <= 14) || (isEscort && baseWave === 15)) {
      if (roll < 0.22) { type = 'skeleton' as EnemyType; hp *= 1.2; damage = 5; speed *= 1.1; radius = 22; }
      else if (roll < 0.40) { type = 'ghoul' as EnemyType; hp *= 1.5; damage = 8; speed *= 1.2; radius = 26; }
      else if (roll < 0.55) { type = 'mummy' as EnemyType; hp *= 2.0; damage = 10; speed *= 0.5; radius = 28; }
      else if (roll < 0.70) { type = 'skeleton_warrior' as EnemyType; hp *= 1.8; damage = 12; speed *= 0.9; radius = 28; }
      else if (roll < 0.83) { type = 'ghost' as EnemyType; hp *= 1.0; damage = 9; speed *= 1.3; radius = 22; }
      else if (roll < 0.93) { type = 'banshee' as EnemyType; hp *= 1.1; damage = 11; speed *= 1.2; radius = 22; attackRange = 480; attackSpeed = 2200; }
      else { type = 'lich' as EnemyType; hp *= 1.4; damage = 15; speed *= 0.8; radius = 26; attackRange = 550; attackSpeed = 2000; }
    } else if (baseWave === 15 && isBossSpawn) {
      type = 'grim_reaper' as EnemyType; hp *= 18; damage = 35; speed = 0.50; radius = 30; attackRange = 180; attackSpeed = 1500;
    } else if ((baseWave >= 16 && baseWave <= 19) || (isEscort && baseWave === 20)) {
      if (roll < 0.22) { type = 'goblin_mage' as EnemyType; hp *= 1.5; damage = 12; speed *= 0.85; radius = 22; attackRange = 550; attackSpeed = 2200; }
      else if (roll < 0.42) { type = 'orc_berserker' as EnemyType; hp *= 2.0; damage = 15; speed *= 1.1; radius = 28; }
      else if (roll < 0.58) { type = 'skeleton_warrior' as EnemyType; hp *= 2.2; damage = 14; speed *= 0.9; radius = 28; }
      else if (roll < 0.72) { type = 'lich' as EnemyType; hp *= 1.8; damage = 18; speed *= 0.8; radius = 26; attackRange = 550; attackSpeed = 1900; }
      else if (roll < 0.84) { type = 'wraith' as EnemyType; hp *= 1.5; damage = 16; speed *= 1.4; radius = 22; }
      else if (roll < 0.94) { type = 'wight' as EnemyType; hp *= 2.2; damage = 15; speed *= 1.0; radius = 26; }
      else { type = 'ghoul' as EnemyType; hp *= 1.8; damage = 12; speed *= 1.3; radius = 24; }
    } else if (baseWave === 20 && isSecondBossSpawn) {
      type = 'velshade' as EnemyType; hp *= 22; damage = 38; speed = 0.55; radius = 30; attackRange = 200; attackSpeed = 1500;
    } else if (baseWave === 20 && isBossSpawn) {
      type = 'grim_reaper' as EnemyType; hp *= 26; damage = 45; speed = 0.50; radius = 32; attackRange = 180; attackSpeed = 1400;
    } else if ((baseWave >= 21 && baseWave <= 24) || (isEscort && baseWave === 25)) {
      // Filhos das Ruinas: mesma distribuicao de papeis dos minotauros que
      // sairam (corpo a corpo / a distancia / rapido / tanque), numeros
      // proximos pra nao mudar o balanceamento junto com o elenco.
      if (roll < 0.30) { type = 'centaur' as EnemyType; hp *= 2.0; damage = 14; speed *= 1.10; radius = 28; }
      else if (roll < 0.55) { type = 'centaur_archer' as EnemyType; hp *= 1.5; damage = 12; speed *= 0.90; radius = 28; attackRange = 600; attackSpeed = 2000; }
      else if (roll < 0.78) { type = 'harpy' as EnemyType; hp *= 1.3; damage = 12; speed *= 1.55; radius = 24; }
      else { type = 'stone_guardian' as EnemyType; hp *= 2.5; damage = 18; radius = 34; }   // anda em saltos de ritmo fixo (ver STONE_GUARDIAN_*); `speed` nao conta
    } else if (baseWave === 25 && isBossSpawn) {
      // Medusa: a distancia (olhar), mais lenta e um pouco mais fragil que o Rei Minotauro que substitui
      type = 'medusa' as EnemyType; hp *= 26; damage = 60; speed = 0.40; radius = 34; attackRange = 300; attackSpeed = 1700;
    } else if ((baseWave >= 26 && baseWave <= 29) || (isEscort && baseWave === 30)) {
      if (roll < 0.35) { type = 'dragon' as EnemyType; hp *= 1.6; damage = 14; speed *= 1.10; radius = 26; }
      else if (roll < 0.60) { type = 'wyvern' as EnemyType; hp *= 2.8; damage = 20; speed *= 0.95; radius = 30; }
      else if (roll < 0.80) { type = 'mini_dragon' as EnemyType; hp *= 3.2; damage = 24; speed *= 0.80; radius = 30; }
      else { type = 'fire_dragon' as EnemyType; hp *= 3.0; damage = 22; speed *= 0.88; radius = 30; }   // era frost_dragon — no deserto, nao
    } else if (baseWave === 30 && isBossSpawn) {
      type = 'dragon_lord' as EnemyType; hp *= 36; damage = 80; speed = 0.36; radius = 48; attackRange = 350; attackSpeed = 1700;
    }

  } else if (isAct2) {
    // ── ACT 2: The Cursed Forest ──────────────────────────────────
    // W1-9:   Elves + Trolls  |  W10: boss Elf Champion
    // W11-19: Minotaurs       |  W20: boss Minotaur King
    // W21-29: Dragons+Giants  |  W30: boss Dragon Lord
    if (baseWave <= 9 || (isEscort && baseWave === 10)) {
      if (baseWave <= 4 || (isEscort && baseWave === 5)) {
        if (roll < 0.22) { type = 'elf' as EnemyType; hp *= 1.4; damage = 10; speed *= 1.1; radius = 24; }
        else if (roll < 0.42) { type = 'elf_scout' as EnemyType; hp *= 1.2; damage = 12; speed *= 1.2; radius = 24; attackRange = 600; attackSpeed = 1800; }
        else if (roll < 0.57) { type = 'pixie' as EnemyType; hp *= 0.7; damage = 8; speed *= 1.8; radius = 18; }
        else if (roll < 0.70) { type = 'fire_elemental' as EnemyType; hp *= 1.5; damage = 14; speed *= 1.0; radius = 24; }
        else if (roll < 0.82) { type = 'earth_elemental' as EnemyType; hp *= 3.0; damage = 12; speed *= 0.45; radius = 30; }
        else if (roll < 0.92) { type = 'ice_witch' as EnemyType; hp *= 1.2; damage = 18; speed *= 0.85; radius = 22; attackRange = 560; attackSpeed = 2200; }
        else { type = 'elf_arcanist' as EnemyType; hp *= 1.3; damage = 20; speed *= 0.9; radius = 24; attackRange = 550; attackSpeed = 2500; }
      } else if (baseWave === 5 && isBossSpawn) {
        type = 'elf_arcanist' as EnemyType; hp *= 5; damage = 28; speed = 0.85; radius = 32; attackRange = 600; attackSpeed = 1800;
      } else {
        if (roll < 0.40) { type = 'elf_arcanist' as EnemyType; hp *= 1.6; damage = 22; speed *= 0.9; radius = 24; attackRange = 550; attackSpeed = 2200; }
        else if (roll < 0.68) { type = 'troll' as EnemyType; hp *= 2.5; damage = 18; speed *= 0.65; radius = 30; }
        else { type = 'elf_scout' as EnemyType; hp *= 1.6; damage = 15; speed *= 1.1; radius = 24; attackRange = 600; attackSpeed = 1800; }
      }
    } else if (baseWave === 10 && isBossSpawn) {
      type = 'elf_champion' as EnemyType; hp *= 12; damage = 32; speed = 0.9; radius = 30; attackRange = 100; attackSpeed = 1300;
    } else if (baseWave <= 19 || (isEscort && baseWave === 20)) {
      if (baseWave <= 14 || (isEscort && baseWave === 15)) {
        if (roll < 0.35) { type = 'minotaur' as EnemyType; hp *= 2.2; damage = 14; speed *= 0.70; radius = 28; }
        else if (roll < 0.65) { type = 'minotaur_archer' as EnemyType; hp *= 1.5; damage = 12; speed *= 0.85; radius = 26; attackRange = 580; attackSpeed = 2000; }
        else { type = 'minotaur_warrior' as EnemyType; hp *= 3.0; damage = 18; speed *= 0.60; radius = 30; }
      } else if (baseWave === 15 && isBossSpawn) {
        type = 'minotaur_warrior' as EnemyType; hp *= 7; damage = 32; speed = 0.70; radius = 34; attackRange = 100; attackSpeed = 1400;
      } else {
        if (roll < 0.28) { type = 'minotaur_warrior' as EnemyType; hp *= 3.5; damage = 22; speed *= 0.62; radius = 30; }
        else if (roll < 0.52) { type = 'minotaur_guard' as EnemyType; hp *= 4.0; damage = 20; speed *= 0.55; radius = 30; }
        else if (roll < 0.72) { type = 'deepling_scout' as EnemyType; hp *= 1.8; damage = 18; speed *= 1.5; radius = 20; }
        else if (roll < 0.88) { type = 'deepling_warrior' as EnemyType; hp *= 3.5; damage = 22; speed *= 0.65; radius = 26; }
        else { type = 'minotaur_archer' as EnemyType; hp *= 2.0; damage = 16; speed *= 0.88; radius = 26; attackRange = 580; attackSpeed = 1800; }
      }
    } else if (baseWave === 20 && isBossSpawn) {
      type = 'minotaur_king' as EnemyType; hp *= 14; damage = 42; speed = 0.80; radius = 36; attackRange = 200; attackSpeed = 1600;
    } else if (baseWave <= 29 || (isEscort && baseWave === 30)) {
      if (baseWave <= 24 || (isEscort && baseWave === 25)) {
        if (roll < 0.28) { type = 'dragon' as EnemyType; hp *= 2.0; damage = 17; speed *= 1.10; radius = 26; }
        else if (roll < 0.50) { type = 'frost_dragon' as EnemyType; hp *= 3.0; damage = 22; speed *= 0.88; radius = 30; }
        else if (roll < 0.68) { type = 'wyvern' as EnemyType; hp *= 2.8; damage = 20; speed *= 0.95; radius = 30; }
        else if (roll < 0.83) { type = 'bonelord' as EnemyType; hp *= 2.2; damage = 20; speed *= 0.40; radius = 26; attackRange = 540; attackSpeed = 2000; }
        else { type = 'shadow_beast' as EnemyType; hp *= 1.8; damage = 24; speed *= 1.40; radius = 22; }
      } else if (baseWave === 25 && isBossSpawn) {
        type = 'frost_dragon' as EnemyType; hp *= 8; damage = 45; speed = 0.80; radius = 36; attackRange = 300; attackSpeed = 1600;
      } else {
        if (roll < 0.22) { type = 'dragon' as EnemyType; hp *= 2.5; damage = 20; speed *= 1.05; radius = 28; }
        else if (roll < 0.40) { type = 'cyclops' as EnemyType; hp *= 3.8; damage = 28; speed *= 0.62; radius = 38; }
        else if (roll < 0.55) { type = 'ogre' as EnemyType; hp *= 5.0; damage = 34; speed *= 0.52; radius = 40; }
        else if (roll < 0.68) { type = 'wyvern' as EnemyType; hp *= 3.2; damage = 24; speed *= 0.90; radius = 30; }
        else if (roll < 0.82) { type = 'nightmare' as EnemyType; hp *= 2.8; damage = 28; speed *= 1.35; radius = 26; }
        else { type = 'nightstalker' as EnemyType; hp *= 2.0; damage = 26; speed *= 1.50; radius = 22; }
      }
    } else if (baseWave === 30 && isBossSpawn) {
      type = 'hydra' as EnemyType; hp *= 26; damage = 65; speed = 0.70; radius = 46; attackRange = 320; attackSpeed = 1500;
    }

  } else if (isAct3) {
    // ── ACT 3: Lands of the Giants ────────────────────────────────
    // W1-9:   Cyclops/Ogres  |  W10: DOUBLE boss Half-Brothers
    // W11-19: Dhampirs       |  W20: boss Vampire Lord
    // W21-29: Demons         |  W30: boss Demon
    if (baseWave <= 9 || (isEscort && baseWave === 10)) {
      if (baseWave <= 4 || (isEscort && baseWave === 5)) {
        if (roll < 0.24) { type = 'cyclops' as EnemyType; hp *= 3.8; damage = 28; speed *= 0.62; radius = 38; }
        else if (roll < 0.44) { type = 'ogre' as EnemyType; hp *= 5.0; damage = 34; speed *= 0.52; radius = 40; }
        else if (roll < 0.62) { type = 'cyclops_stonehurler' as EnemyType; hp *= 3.0; damage = 32; speed *= 0.68; radius = 34; attackRange = 600; attackSpeed = 2100; }
        else if (roll < 0.80) { type = 'slime' as EnemyType; hp *= 2.0; damage = 10; speed *= 0.55; radius = 26; }
        else { type = 'golem' as EnemyType; hp *= 6.0; damage = 20; speed *= 0.30; radius = 36; }
      } else if (baseWave === 5 && isBossSpawn) {
        type = 'ogre_berserker' as EnemyType; hp *= 6; damage = 45; speed = 0.90; radius = 40;
      } else {
        if (roll < 0.40) { type = 'cyclops_stonehurler' as EnemyType; hp *= 3.5; damage = 36; speed *= 0.65; radius = 36; attackRange = 600; attackSpeed = 1900; }
        else if (roll < 0.70) { type = 'ogre_berserker' as EnemyType; hp *= 3.5; damage = 46; speed *= 1.00; radius = 36; }
        else { type = 'ogre' as EnemyType; hp *= 5.5; damage = 38; speed *= 0.55; radius = 40; }
      }
    } else if (baseWave === 10 && isSecondBossSpawn) {
      type = 'half_brother_ogre' as EnemyType; hp *= 22; damage = 70; speed = 0.75; radius = 45; attackRange = 260; attackSpeed = 1500;
    } else if (baseWave === 10 && isBossSpawn) {
      type = 'half_brother_cyclops' as EnemyType; hp *= 20; damage = 65; speed = 0.80; radius = 45; attackRange = 350; attackSpeed = 1600;
    } else if (baseWave <= 19 || (isEscort && baseWave === 20)) {
      if (baseWave <= 14 || (isEscort && baseWave === 15)) {
        if (roll < 0.35) { type = 'dhampir' as EnemyType; hp *= 2.4; damage = 18; speed *= 1.2; radius = 24; }
        else if (roll < 0.65) { type = 'dhampir_ballister' as EnemyType; hp *= 2.2; damage = 20; speed *= 0.85; radius = 24; attackRange = 600; attackSpeed = 2000; }
        else { type = 'vampire' as EnemyType; hp *= 3.2; damage = 28; speed *= 0.95; radius = 26; }
      } else if (baseWave === 15 && isBossSpawn) {
        type = 'vampire' as EnemyType; hp *= 10; damage = 45; speed = 0.95; radius = 30;
      } else {
        if (roll < 0.40) { type = 'vampire' as EnemyType; hp *= 3.8; damage = 32; speed *= 0.92; radius = 26; }
        else if (roll < 0.70) { type = 'dhampir_mage' as EnemyType; hp *= 2.5; damage = 24; speed *= 0.80; radius = 24; attackRange = 520; attackSpeed = 1800; }
        else { type = 'dhampir_ballister' as EnemyType; hp *= 2.8; damage = 24; speed *= 0.85; radius = 24; attackRange = 600; attackSpeed = 1800; }
      }
    } else if (baseWave === 20 && isBossSpawn) {
      type = 'vampire_lord' as EnemyType; hp *= 26; damage = 80; speed = 0.85; radius = 34; attackRange = 280; attackSpeed = 1200;
    } else if (baseWave <= 29 || (isEscort && baseWave === 30)) {
      if (baseWave <= 24 || (isEscort && baseWave === 25)) {
        if (roll < 0.35) { type = 'imp' as EnemyType; hp *= 1.8; damage = 16; speed *= 1.4; radius = 20; }
        else if (roll < 0.65) { type = 'fire_devil' as EnemyType; hp *= 3.2; damage = 26; speed *= 1.05; radius = 26; }
        else { type = 'devil' as EnemyType; hp *= 3.5; damage = 30; speed *= 0.95; radius = 26; }
      } else if (baseWave === 25 && isBossSpawn) {
        type = 'fire_devil' as EnemyType; hp *= 7; damage = 45; speed = 1.00; radius = 32;
      } else {
        if (roll < 0.35) { type = 'fire_devil' as EnemyType; hp *= 3.4; damage = 26; speed *= 1.1; radius = 28; }
        else if (roll < 0.65) { type = 'devil' as EnemyType; hp *= 3.8; damage = 28; speed *= 0.95; radius = 28; }
        else { type = 'demon_skeleton' as EnemyType; hp *= 2.4; damage = 17; speed *= 0.90; radius = 24; attackRange = 500; attackSpeed = 1900; }
      }
    } else if (baseWave === 30 && isBossSpawn) {
      type = 'demon' as EnemyType; hp *= 28; damage = 75; speed = 0.90; radius = 38; attackRange = 300; attackSpeed = 1100;
    }

  } else if (isAct4) {
    // ── ACT 4: The Abyss ──────────────────────────────────────────
    // W1-9:   Demons maiores   |  W10: boss Elder Orc Warlord
    // W11-19: Void+Demons      |  W20: boss Elder Vampire Lord
    // W21-29: Caos puro        |  W30: boss Dread Grim Reaper
    if (baseWave <= 9 || (isEscort && baseWave === 10)) {
      if (baseWave <= 4 || (isEscort && baseWave === 5)) {
        if (roll < 0.25) { type = 'lesser_demon' as EnemyType; hp *= 2.4; damage = 10; speed *= 1.15; radius = 20; }
        else if (roll < 0.48) { type = 'demon_eyes' as EnemyType; hp *= 3.2; damage = 11; speed *= 0.65; radius = 32; attackRange = 620; attackSpeed = 1800; }
        else if (roll < 0.68) { type = 'void_stalker' as EnemyType; hp *= 2.8; damage = 16; speed *= 1.25; radius = 24; }
        else if (roll < 0.82) { type = 'void_herald' as EnemyType; hp *= 2.5; damage = 10; speed *= 0.90; radius = 24; attackRange = 580; attackSpeed = 1900; }
        else { type = 'warlock_shade' as EnemyType; hp *= 2.2; damage = 12; speed *= 1.00; radius = 22; attackRange = 520; attackSpeed = 2000; }
      } else if (baseWave === 5 && isBossSpawn) {
        type = 'lord_demon' as EnemyType; hp *= 6; damage = 24; speed = 0.80; radius = 32; attackRange = 200; attackSpeed = 1400;
      } else {
        if (roll < 0.28) { type = 'void_stalker' as EnemyType; hp *= 2.2; damage = 15; speed *= 1.20; radius = 26; }
        else if (roll < 0.52) { type = 'lord_demon' as EnemyType; hp *= 2.6; damage = 14; speed *= 0.75; radius = 30; }
        else if (roll < 0.72) { type = 'demon_eyes' as EnemyType; hp *= 2.6; damage = 11; speed *= 0.60; radius = 34; attackRange = 620; attackSpeed = 1700; }
        else if (roll < 0.86) { type = 'flux_anomaly' as EnemyType; hp *= 1.8; damage = 11; speed *= 1.10; radius = 22; attackRange = 560; attackSpeed = 1800; }
        else { type = 'fallen_seraph' as EnemyType; hp *= 3.0; damage = 18; speed *= 0.95; radius = 26; }
      }
    } else if (baseWave === 10 && isBossSpawn) {
      type = 'orc_warlord' as EnemyType; hp *= 22; damage = 50; speed = 0.85; radius = 36; attackRange = 200; attackSpeed = 1000;
    } else if (baseWave <= 19 || (isEscort && baseWave === 20)) {
      if (baseWave <= 14 || (isEscort && baseWave === 15)) {
        if (roll < 0.25) { type = 'void_stalker' as EnemyType; hp *= 2.8; damage = 18; speed *= 1.15; radius = 26; }
        else if (roll < 0.48) { type = 'demon_eyes' as EnemyType; hp *= 4.5; damage = 16; speed *= 0.62; radius = 34; attackRange = 620; attackSpeed = 1600; }
        else if (roll < 0.68) { type = 'lord_demon' as EnemyType; hp *= 5.0; damage = 23; speed *= 0.72; radius = 32; }
        else if (roll < 0.83) { type = 'corrupt_paladin' as EnemyType; hp *= 4.2; damage = 16; speed *= 0.80; radius = 30; }
        else { type = 'death_knight' as EnemyType; hp *= 5.5; damage = 19; speed *= 0.75; radius = 32; }
      } else if (baseWave === 15 && isBossSpawn) {
        type = 'dragon_lord' as EnemyType; hp *= 11; damage = 45; speed = 0.85; radius = 50; attackRange = 400; attackSpeed = 1500;
      } else {
        if (roll < 0.35) { type = 'demon_eyes' as EnemyType; hp *= 5.2; damage = 18; speed *= 0.60; radius = 36; attackRange = 620; attackSpeed = 1500; }
        else if (roll < 0.65) { type = 'void_stalker' as EnemyType; hp *= 4.2; damage = 24; speed *= 1.10; radius = 28; }
        else { type = 'lord_demon' as EnemyType; hp *= 5.8; damage = 26; speed *= 0.70; radius = 34; }
      }
    } else if (baseWave === 20 && isBossSpawn) {
      type = 'hydra' as EnemyType; hp *= 24; damage = 48; speed = 0.55; radius = 42; attackRange = 300; attackSpeed = 1200;
    } else if (baseWave <= 29 || (isEscort && baseWave === 30)) {
      if (baseWave <= 24 || (isEscort && baseWave === 25)) {
        if (roll < 0.28) { type = 'void_stalker' as EnemyType; hp *= 4.5; damage = 27; speed *= 1.05; radius = 28; }
        else if (roll < 0.52) { type = 'demon_eyes' as EnemyType; hp *= 5.6; damage = 21; speed *= 0.58; radius = 36; attackRange = 650; attackSpeed = 1400; }
        else if (roll < 0.72) { type = 'lord_demon' as EnemyType; hp *= 6.0; damage = 28; speed *= 0.68; radius = 34; }
        else { type = 'mind_flayer' as EnemyType; hp *= 4.0; damage = 24; speed *= 0.85; radius = 26; attackRange = 580; attackSpeed = 1700; }
      } else if (baseWave === 25 && isBossSpawn) {
        type = 'beholder' as EnemyType; hp *= 20; damage = 58; speed = 0.55; radius = 38; attackRange = 650; attackSpeed = 1100;
      } else {
        if (roll < 0.35) { type = 'void_stalker' as EnemyType; hp *= 4.8; damage = 30; speed *= 1.00; radius = 30; }
        else if (roll < 0.65) { type = 'demon_eyes' as EnemyType; hp *= 6.2; damage = 22; speed *= 0.55; radius = 38; attackRange = 650; attackSpeed = 1300; }
        else { type = 'lord_demon' as EnemyType; hp *= 6.8; damage = 31; speed *= 0.65; radius = 36; }
      }
    } else if (baseWave === 30 && isBossSpawn) {
      type = 'grim_reaper' as EnemyType; hp *= 28; damage = 54; speed = 0.85; radius = 36; attackRange = 200; attackSpeed = 900;
    }

  } else if (isAct5) {
    // ── ACT 5: The End of Grimhold ─────────────────────────────────
    // W1-9:   Void legion    |  W10: boss Elder Demon
    // W11-19: Convergence   |  W20: boss Elder Minotaur King
    // W21-29: Apocalipse     |  W30: TRUE FINAL — Malachar
    if (baseWave <= 9 || (isEscort && baseWave === 10)) {
      if (baseWave <= 4 || (isEscort && baseWave === 5)) {
        if (roll < 0.30) { type = 'void_stalker' as EnemyType; hp *= 4.0; damage = 30; speed *= 1.05; radius = 30; }
        else if (roll < 0.58) { type = 'lord_demon' as EnemyType; hp *= 5.5; damage = 30; speed *= 0.68; radius = 36; }
        else if (roll < 0.80) { type = 'demon_eyes' as EnemyType; hp *= 8.5; damage = 36; speed *= 0.55; radius = 38; attackRange = 650; attackSpeed = 1400; }
        else { type = 'lesser_demon' as EnemyType; hp *= 5.0; damage = 28; speed *= 1.10; radius = 22; }
      } else if (baseWave === 5 && isBossSpawn) {
        type = 'infernatil' as EnemyType; hp *= 24; damage = 55; speed = 0.70; radius = 48; attackRange = 420; attackSpeed = 1500;
      } else {
        if (roll < 0.35) { type = 'void_stalker' as EnemyType; hp *= 5.6; damage = 34; speed *= 1.00; radius = 30; }
        else if (roll < 0.65) { type = 'lord_demon' as EnemyType; hp *= 7.2; damage = 32; speed *= 0.65; radius = 38; }
        else { type = 'demon_eyes' as EnemyType; hp *= 7.5; damage = 32; speed *= 0.52; radius = 40; attackRange = 680; attackSpeed = 1300; }
      }
    } else if (baseWave === 10 && isBossSpawn) {
      type = 'demon' as EnemyType; hp *= 34; damage = 72; speed = 0.90; radius = 42; attackRange = 320; attackSpeed = 1200;
    } else if (baseWave <= 19 || (isEscort && baseWave === 20)) {
      if (baseWave <= 14 || (isEscort && baseWave === 15)) {
        if (roll < 0.35) { type = 'void_stalker' as EnemyType; hp *= 8.0; damage = 44; speed *= 0.95; radius = 32; }
        else if (roll < 0.65) { type = 'demon_eyes' as EnemyType; hp *= 10.0; damage = 42; speed *= 0.50; radius = 40; attackRange = 700; attackSpeed = 1200; }
        else { type = 'lord_demon' as EnemyType; hp *= 10.0; damage = 44; speed *= 0.62; radius = 38; }
      } else if (baseWave === 15 && isBossSpawn) {
        type = 'ghazbaran' as EnemyType; hp *= 17; damage = 62; speed = 0.85; radius = 44; attackRange = 360; attackSpeed = 1200;
      } else {
        if (roll < 0.35) { type = 'void_stalker' as EnemyType; hp *= 7.2; damage = 38; speed *= 0.90; radius = 32; }
        else if (roll < 0.65) { type = 'lord_demon' as EnemyType; hp *= 8.8; damage = 36; speed *= 0.60; radius = 40; }
        else { type = 'demon_eyes' as EnemyType; hp *= 8.8; damage = 36; speed *= 0.48; radius = 42; attackRange = 700; attackSpeed = 1100; }
      }
    } else if (baseWave === 20 && isBossSpawn) {
      type = 'minotaur_king' as EnemyType; hp *= 36; damage = 78; speed = 0.88; radius = 44; attackRange = 220; attackSpeed = 1400;
    } else if (baseWave <= 29 || (isEscort && baseWave === 30)) {
      if (baseWave <= 24 || (isEscort && baseWave === 25)) {
        if (roll < 0.33) { type = 'void_stalker' as EnemyType; hp *= 10.0; damage = 50; speed *= 0.85; radius = 34; }
        else if (roll < 0.66) { type = 'demon_eyes' as EnemyType; hp *= 9.5; damage = 40; speed *= 0.45; radius = 44; attackRange = 720; attackSpeed = 1100; }
        else { type = 'lord_demon' as EnemyType; hp *= 12.0; damage = 48; speed *= 0.58; radius = 40; }
      } else if (baseWave === 25 && isBossSpawn) {
        type = 'zathroth' as EnemyType; hp *= 22; damage = 68; speed = 0.75; radius = 42; attackRange = 500; attackSpeed = 1300;
      } else {
        if (roll < 0.33) { type = 'void_stalker' as EnemyType; hp *= 8.8; damage = 42; speed *= 0.82; radius = 34; }
        else if (roll < 0.66) { type = 'lord_demon' as EnemyType; hp *= 10.4; damage = 40; speed *= 0.55; radius = 42; }
        else { type = 'demon_eyes' as EnemyType; hp *= 13.0; damage = 52; speed *= 0.42; radius = 46; attackRange = 740; attackSpeed = 1000; }
      }
    } else if (baseWave === 30 && isBossSpawn) {
      type = 'malachar' as EnemyType; hp *= 36; damage = 72; speed = 0.80; radius = 42; attackRange = 700; attackSpeed = 1200;
    }
  }
  return { type, hp, damage, speed, radius, attackRange, attackSpeed };
}
