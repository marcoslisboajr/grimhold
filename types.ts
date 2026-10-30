import React from 'react';

export enum GameStatus {
  MENU = 'MENU',
  CHARACTER_SELECT = 'CHARACTER_SELECT',
  PLAYING = 'PLAYING',
  LEVEL_UP = 'LEVEL_UP',
  ENCOUNTER = 'ENCOUNTER',   // encontro entre ondas (data/encontros.ts) — pausa o loop como LEVEL_UP
  GAME_OVER = 'GAME_OVER',
  COLLECTION = 'COLLECTION',
}

export type Difficulty = 'easy' | 'normal' | 'hard';

export interface GridPosition {
  col: number;
  row: number;
}

export interface Entity {
  id: string;
  position?: { x: number; y: number };
  x?: number;
  y?: number;
  width?: number;
  height?: number;
}

export type EnemyType = 'goblin' | 'goblin_archer' | 'goblin_king' | 'goblin_assassin' | 'goblin_mage' | 'goblin_shaman' | 'orc' | 'orc_spearman' | 'orc_warrior' | 'orc_berserker' | 'orc_leader' | 'orc_warlord' | 'skeleton' | 'ghoul' | 'skeleton_warrior' | 'mummy' | 'lich' | 'grim_reaper' | 'slime' | 'boss' | 'troll' | 'mini_dragon' | 'wyvern' | 'ghost' | 'golem' | 'dwarf' | 'dwarf_soldier' | 'dwarf_guard' | 'dwarf_geomancer' | 'elf' | 'elf_scout' | 'elf_arcanist' | 'elf_champion' | 'centaur' | 'centaur_archer' | 'harpy' | 'stone_guardian' | 'medusa' | 'fire_dragon' | 'enemy_bone' | 'enemy_bone_big' | 'enemy_magic' | 'enemy_nature'
  // Ato 6 — A Outra Margem
  | 'cultista_vermelho' | 'cultista_vermelho_b' | 'cultista_branco' | 'cultista_branco_b' | 'cultista_verde' | 'cultista_verde_b' | 'cultista_negro' | 'cultista_azul' | 'lanterna' | 'lanterna_b' | 'anjo' | 'anjo_rubro' | 'anjo_sombrio' | 'anjo_sem_asas' | 'anjo_sem_asas_rubro' | 'anjo_sem_asas_sombrio' | 'morcego' | 'morcego_rubro' | 'acaro_azul' | 'acaro_vermelho' | 'acaro_prata' | 'acaro_amarelo' | 'lich6' | 'lich6_rubro' | 'lich6_dourado' | 'cavaleiro_caido' | 'cavaleiro_caido_b' | 'esqueleto6' | 'esqueleto6_lanca' | 'esqueleto6_escudo' | 'fenix' | 'fenix_do_caos'
  | 'cultista_mor' | 'coro' | 'coro_cultista' | 'anjo_caido' | 'irma_de_cassiel' | 'fenix_ancia' | 'serafim_caido'
  // Ato 7 — A Ravina dos Xamas
  | 'sapo' | 'sapo_b' | 'sapo_c' | 'sapo_xama' | 'sapo_xama_b' | 'rato' | 'rato_b' | 'rato_c' | 'rato_d' | 'inseto' | 'inseto_b' | 'inseto_c' | 'vespa' | 'vespa_b' | 'vespa_c' | 'lagarto' | 'lagarto_b' | 'lagarto_tribo' | 'lagarto_tribo_b' | 'lobo' | 'lobo_b' | 'javali' | 'javali_b' | 'raptor' | 'raptor_b' | 'tribo_lobo' | 'tribo_lobo_b' | 'tribo_lobo_c' | 'tribo_raposa' | 'tribo_raposa_b' | 'tribo_raposa_c' | 'tribo_ave' | 'tribo_ave_b' | 'tribo_ave_c' | 'tribo_peixe' | 'tribo_peixe_b' | 'tribo_peixe_c'
  | 'sapo_rei' | 'kwazul' | 'alfa_matilha' | 'xiphra' | 'chefe_tribal' | 'ossoth' | 'totem_xama'
  // Ato 8 — O Mar Sem Fundo
  | 'afogado' | 'afogado_b' | 'afogado_c' | 'afogado_d' | 'cardume' | 'cardume_b' | 'cardume_c' | 'agua_viva' | 'agua_viva_b' | 'agua_viva_c' | 'agua_viva_d' | 'caranguejo' | 'caranguejo_b' | 'caranguejo_c' | 'tartaruga' | 'tartaruga_b' | 'tartaruga_c' | 'serpente_mar' | 'serpente_mar_b' | 'serpente_mar_c' | 'serpente_mar_d' | 'afogado_veterano'
  | 'capitao_afogado' | 'mae_das_aguas' | 'garuda' | 'rei_caranguejo' | 'serpente_ancia' | 'kraken'
  // Ato 9 — Os Guardioes
  | 'legiao' | 'legiao_b' | 'legiao_c' | 'legiao_d' | 'legiao_e' | 'cranio' | 'cranio_b' | 'cranio_c' | 'cranio_d' | 'mumia' | 'mumia_b' | 'estatua_lamina' | 'estatua_lamina_b' | 'estatua_lamina_c' | 'beholder9' | 'beholder9_b' | 'cerbero' | 'cerbero_b' | 'aranha' | 'aranha_b'
  | 'general_ossos' | 'cranio_ancestral' | 'drider' | 'estatua_leste' | 'estatua_oeste' | 'cerbero_alfa' | 'quimera'
  // Ato 5 refeito — A Queda de Grimhold (so DEV ate o fechamento: ATO5_REFEITO)
  | 'soldado_ashfen' | 'soldado_ashfen_b' | 'soldado_ashfen_c' | 'soldado_ashfen_d' | 'capanga' | 'capanga_b' | 'capanga_c' | 'cavaleiro_negro' | 'cavaleiro_negro_b' | 'saqueador' | 'saqueador_lanca' | 'saqueador_martelo' | 'saqueador_espada' | 'lich5' | 'lich5_b' | 'mago_colegiado' | 'mago_colegiado_b' | 'runa_hostil' | 'runa_hostil_b'
  | 'sargento_ashfen' | 'tesoureiro' | 'chefe_saqueador' | 'capitao_ashfen' | 'lich_colegiado' | 'reitor'
  // Ato 10 — O Ventre
  | 'celula' | 'celula_b' | 'celula_c' | 'celula_d' | 'tentaculo' | 'tentaculo_b' | 'slime_grande' | 'slime_grande_b' | 'bolha' | 'bolha_b';

export interface Enemy extends Entity {
  position: { x: number; y: number };
  hp: number;
  maxHp: number;
  speed: number;
  damage: number;
  type: EnemyType;
  variation: number; // 0, 1, or 2 for visual variations
  statusEffect?: 'freeze' | 'root' | 'bleed' | 'charm' | 'none'; // Visual indicator
  statusDuration: number;
  isAttacking: boolean;
  attackCooldown: number;
  reward: number;
  lane: number;
  frozenUntil?: number;
  bleedStacks?: number;
  lastBleedTick?: number;
  attackRange?: number;
  attackSpeed?: number;
  lastAttackTime?: number;
  lastBarrierAttackTime?: number;
  color?: string;
}

export interface Projectile extends Entity {
  position: { x: number; y: number };
  damage: number;
  speed: number;
  targetId: string | null;
  type: AllyType | 'enemy' | 'boss' | 'enemy_bone' | 'enemy_bone_big' | 'enemy_magic' | 'enemy_nature'; 
  isCritical?: boolean;
  isExplosive?: boolean;
  isPiercing?: boolean;
  isFireball?: boolean;
  isLightning?: boolean;
  isNecroExplosion?: boolean;
  isRoot?: boolean;
  isEnemy?: boolean;
  isHeal?: boolean;
  vx?: number;
  vy?: number;
  angle?: number;
  pierces?: number | boolean;
  hitIds?: string[];
  causesRoot?: boolean;
  causesBleed?: boolean;
  isCrit?: boolean;
  isArea?: boolean;
  onHitEffect?: string;
  causesExplosionOnKill?: boolean;
  color?: string;
  isProc?: boolean;
}

export interface DamageText {
  id: string;
  x: number;
  y: number;
  value: number;
  life: number;
  maxLife?: number;
  isCrit?: boolean;
  color?: string;
}

export type AllyType = 'mage' | 'archer' | 'warlock' | 'druid' | 'necromancer' | 'bard' | 'cleric' | 'paladin' | 'priest' | 'yue' | 'billy';

// ---------------------------------------------------------------------------
// Perks de aliados — todas as propriedades possíveis tipadas explicitamente.
// Substitui o uso de (ally.perks as any)?.prop em todo o game loop.
// ---------------------------------------------------------------------------
export interface AllyPerks {
  // ── Archer ────────────────────────────────────────────────────────────────
  archerExplosiveStacks?:  number;
  archerThousandCuts?:     number;
  archerRain?:             boolean;
  archerSniperProtocol?:   boolean;
  archerStormOfArrows?:    boolean;

  // ── Mage ──────────────────────────────────────────────────────────────────
  fireChanceStacks?:  number;
  mageEchoStacks?:    number;
  mageSingularity?:   boolean;

  // ── Warlock ───────────────────────────────────────────────────────────────
  lightningStacks?:      number;
  warlockDrainStacks?:   number;
  warlockHex?:           boolean;
  warlockVoidAscension?: boolean;
  voidPactStacks?:       number;
  voidPactLifesteal?:    boolean;

  // ── Druid ─────────────────────────────────────────────────────────────────
  druidCycleStacks?:      number;
  druidAncestralRoots?:   boolean;
  druidSeasonEclipse?:    boolean;
  druidSporeStacks?:      number;
  druidAncientWill?:      boolean;

  // ── Necromancer ───────────────────────────────────────────────────────────
  necroDarkPactStacks?:   number;
  necroRaiseStacks?:      number;
  necroExplosionStacks?:  number;
  necroPlagueUnlocked?:   boolean;
  isDeathLord?:           boolean;

  // ── Cleric ────────────────────────────────────────────────────────────────
  clericSelfStacks?:         number;
  clericRetributionStacks?:  number;
  clericDivineShield?:       boolean;
  clericSanctifiedWrath?:    boolean;
  divineBlessingStacks?:     number;
  divineCalderaStacks?:      number;

  // ── Paladin ───────────────────────────────────────────────────────────────
  paladinMartyrStacks?:    number;
  paladinHolyGround?:      boolean;
  paladinEternalCrusade?:  boolean;

  // ── Priest ────────────────────────────────────────────────────────────────
  priestMendingStacks?:    number;  // alias usado no AllyTooltip
  priestGuardStacks?:      number;
  priestResStacks?:        number;
  priestMassMending?:      boolean;
  priestDivineCovenant?:   boolean;

  // ── Bard ──────────────────────────────────────────────────────────────────
  bardHymn?:           boolean;
  bardHymnStacks?:     number;
  bardAnthem?:         boolean;
  bardAnthemDmgBonus?: boolean;
  bardDirgeUnlocked?:  boolean;
  bardGrandFinale?:    boolean;

  // ── Runesmith ─────────────────────────────────────────────────────────────
  runeVolleyStacks?:   number;
  runeOverloadStacks?: number;
  runeChainBonus?:     number;
  runeSigilUnlocked?:  boolean;
  runeSigilStacks?:    number;
  runeGrandRune?:      boolean;

  // ── Sylvanite ─────────────────────────────────────────────────────────────
  sylvaToxinStacks?:     number;
  sylvaBloomStacks?:     number;
  sylvaRootStacks?:      number;
  sylvaRebirthUnlocked?: boolean;
  sylvaRebirthStacks?:   number;
  sylvaWorldTree?:       boolean;

  // ── Dreadlord ─────────────────────────────────────────────────────────────
  dreadDoubleHit?:         boolean;
  dreadVoidStacks?:        number;
  dreadDeathWishStacks?:   number;
  dreadEclipseUnlocked?:   boolean;
  dreadEternalHunger?:     boolean;
  dreadVoidHarvestMax?:    number;
  dreadVoidHarvestPower?:  number;
  dreadCursedEdgeStacks?:  number;
  dreadVoidApotheosis?:    boolean;

  // ── Jester ────────────────────────────────────────────────────────────────
  jesterChaosAura?:       boolean;
  jesterPratfall?:        boolean;
  jesterRouletteUnlocked?:boolean;
  jesterTrickStacks?:     number;
  jesterDeadMansHand?:    boolean;

  // ── Vex ───────────────────────────────────────────────────────────────────
  vexBlinkStrike?:   boolean;
  vexHunger?:        boolean;
  vexVeil?:          boolean;
  vexShadowDeath?:   boolean;

  // ── Zylvara ───────────────────────────────────────────────────────────────
  zylvaraPoison?:        boolean;
  zylvaraCloak?:         boolean;
  zylvaraExtinct?:       boolean;
  zylvaraEternalEclipse?:boolean;

  // ── Morrigan ──────────────────────────────────────────────────────────────
  morriganHexCascade?:  boolean;
  morriganCinderPact?:  boolean;
  morriganAshenStorm?:  boolean;
  morriganPlague?:      boolean;
  morriganVeilOfRuin?:  boolean;

  // ── Ixara ─────────────────────────────────────────────────────────────────
  ixaraRage?:        boolean;
  ixaraPrimalRage?:  boolean;
  ixaraRicochet?:    boolean;
  ixaraCollapse?:    boolean;

  // ── Global (itens de loja / cartas globais) ───────────────────────────────
  berserkerStacks?:  number;  // Berserker Ring
  vampiricStacks?:   number;  // Vampiric Edge
  dodgeStacks?:      number;  // Shadow Cloak
  twinStrike?:       boolean;
  echoStrike?:       boolean;
  jaggedEdge?:       boolean;
  bulwarkHpApplied?: number;
}

export interface Ally extends Entity {
  type: AllyType;
  level: number;
  damage: number;
  range: number;
  attackSpeed: number; // Cooldown in ms
  projectileSpeed: number;
  attackCooldown: number;
  isAttacking: boolean;
  gridIndex?: number;
  gridPosition: GridPosition;
  isHero?: boolean; // Identifies the starter hero (Lv 10, 3x dmg)
  lastShotTime?: number;
  hp: number;
  maxHp: number;
  perks?: AllyPerks;
  color?: string;
}

export interface PlayerState {
  level: number;
  xp: number;
  xpToNextLevel: number;
  allies: Ally[];
  maxAllies: number;
  gold: number;
}

export interface UpgradeOption {
  id: string;
  title: string;
  description: string;
  rarity: 'common' | 'rare' | 'legendary' | 'mythic';
  iconType?: string;
  iconSpecial?: React.ReactNode;
  flavorText?: string;   // frase curta no pe da carta (opcional)
  apply?: (state: PlayerState, towerHp?: number, setTowerHp?: any) => PlayerState;
}
