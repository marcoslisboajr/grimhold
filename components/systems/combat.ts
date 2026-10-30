// ══════════════════════════════════════════════════════════════════════
// systems/combat.ts
// Extracted from GameCanvas.tsx — game constants, grid utilities,
// unique ID generator and status effect constants.
// No React or canvas dependency.
// ══════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Global unique ID (monotonic)
// Guarantees unique IDs for projectiles, damage numbers and floating text.
// Never repeats, even if multiple effects fire in the same millisecond.
// ---------------------------------------------------------------------------

let _uidCounter = 0;
export const uid = (): string => `u${++_uidCounter}`;

// ---------------------------------------------------------------------------
// Canvas and world dimensions
// ---------------------------------------------------------------------------

export const CANVAS_WIDTH  = 1600;
export const CANVAS_HEIGHT = 900;

// X position of the barrier (allies on the left, enemies on the right)
export const BARRIER_X = 350;

// X spawn position for enemies (off-canvas to the right)
export const SPAWN_X = CANVAS_WIDTH + 50;

// Menor Y (topo do sprite) em que um inimigo pode nascer: a faixa de cima de
// todo cenario e muro/arvore (ate y~140), e ninguem deve andar por dentro dela
export const SPAWN_MIN_Y = 150;
// Maior Y (topo do sprite) em que um inimigo pode nascer: a barra inferior da HUD
// ocupa y~746..886 (bottom 14, 140 de altura) e nenhum sprite (ate ~70px) deve
// ficar escondido atras dela
export const SPAWN_MAX_Y = CANVAS_HEIGHT - 230;

// ---------------------------------------------------------------------------
// Ally placement grid
// ---------------------------------------------------------------------------

export const GRID_COLS = 4;

// ── Postos: cada COLUNA da grade e um posto com modificadores (drag & posicao) ──
// col 3 = Vanguarda (colada na muralha) ... col 0 = Fundo. Linhas (rows) so
// importam pra adjacencia (Lacos, auras). Nomes em i18n ui.posto.<chave>.
export interface Posto { chave: 'vanguarda' | 'linha' | 'retaguarda' | 'fundo'; dano: number; alcance: number; tomado: number; imune: boolean; cura?: number }
export const POSTOS: Record<number, Posto> = {
  3: { chave: 'vanguarda',  dano: 0.15,  alcance: 0,    tomado: 0.20, imune: false, cura: 0 },
  2: { chave: 'linha',      dano: 0,     alcance: 0.10, tomado: 0,    imune: false, cura: 0.10 },
  1: { chave: 'retaguarda', dano: -0.10, alcance: 0.10, tomado: 0,    imune: false, cura: 0 },
  0: { chave: 'fundo',      dano: -0.20, alcance: 0.20, tomado: 0,    imune: true,  cura: 0 },
};
// Posto preferido de cada heroi: +10% dano e +10% alcance quando esta nele (leva 1;
// os bonus mecanicos especificos por heroi vem na leva 2)
export const POSTO_PREFERIDO_BONUS = 0.10;
export const POSTO_PREFERIDO: Record<string, number> = {
  berserker: 3, paladin: 3, cleric: 3, dreadlord: 3, ixara: 3,
  vex: 2, mage: 2, jester: 2, bard: 2, priest: 2, druid: 2,
  archer: 1, zylvara: 1, warlock: 1, runesmith: 1, necromancer: 1, morrigan: 1,
  inquisitor: 0, frost_warden: 0, sylvanite: 0, malachar_human: 0,
  yue: 3, billy: 1,
};
export const GRID_ROWS = 8;

// Size of each cell in pixels (derived from canvas dimensions)
export const GRID_CELL_WIDTH  = BARRIER_X / GRID_COLS;  // 87.5px
export const GRID_CELL_HEIGHT = CANVAS_HEIGHT / GRID_ROWS; // 112.5px

// ---------------------------------------------------------------------------
// Limites de stats do jogo
// ---------------------------------------------------------------------------

export const TOWER_HP_MAX      = 100;
export const MAX_PLAYER_LEVEL  = 50; // Maximum player level per run

// ---------------------------------------------------------------------------
// Raios de AoE (em pixels no canvas)
// ---------------------------------------------------------------------------

export const AOE_RADIUS              = 150;
export const NECRO_EXPLOSION_RADIUS  = 180;
export const ARCHER_EXPLOSION_RADIUS = 100;
export const METEOR_RADIUS           = 150;

// ---------------------------------------------------------------------------
// Spells — damage and cooldowns (ms)
// ---------------------------------------------------------------------------

export const METEOR_BASE_DAMAGE       = 800;
export const METEOR_DAMAGE_PER_LEVEL  = 100;
export const getMeteorDamage = (level: number = 1): number => {
  return METEOR_BASE_DAMAGE + Math.max(0, level - 1) * METEOR_DAMAGE_PER_LEVEL;
};
export const METEOR_DAMAGE    = METEOR_BASE_DAMAGE;
export const METEOR_COOLDOWN  = 30_000;
export const FREEZE_COOLDOWN  = 45_000;

// ---------------------------------------------------------------------------
// Status effect durations (ms)
// ---------------------------------------------------------------------------

export const FREEZE_DURATION = 4_000;
export const ROOT_DURATION   = 2_500;

// ---------------------------------------------------------------------------
// Custos e valores de reparo da barreira
// ---------------------------------------------------------------------------

export const REPAIR_COST     = 100;
export const REPAIR_AMOUNT   = 25;
export const REPAIR_COOLDOWN = 5_000;

// ---------------------------------------------------------------------------
// Custo de desbloqueio legado (fallback)
// ---------------------------------------------------------------------------

export const UNLOCK_COST = 40;

// ---------------------------------------------------------------------------
// Grid utilities — no external dependencies
// ---------------------------------------------------------------------------

/**
 * Returns true if the cell is blocked for ally placement.
 * Row 0 is reserved (top border of the field).
 */
export const isCellBlocked = (col: number, row: number): boolean => {
  if (row === 0) return true;
  return false;
};

/**
 * Encontra o primeiro slot vazio na grade para um novo aliado.
 * Varre coluna por coluna, linha por linha.
 * Returns { col: 1, row: 1 } as fallback if all cells are occupied.
 */
export const findEmptySlot = (
  allies: Array<{ gridPosition: { col: number; row: number } }>
): { col: number; row: number } => {
  const occupied = new Set(
    allies.map(a => `${a.gridPosition.col},${a.gridPosition.row}`)
  );
  for (let c = 0; c < GRID_COLS; c++) {
    for (let r = 0; r < GRID_ROWS; r++) {
      if (isCellBlocked(c, r)) continue;
      if (!occupied.has(`${c},${r}`)) return { col: c, row: r };
    }
  }
  return { col: 1, row: 1 };
};

// ---------------------------------------------------------------------------
// Conversion between grid coordinates and canvas position
// ---------------------------------------------------------------------------

/**
 * Converts a grid position (col, row) to the center of the cell
 * em coordenadas de canvas (pixels).
 */
export const getScreenPosFromGrid = (
  gridPos: { col: number; row: number }
): { x: number; y: number } => ({
  x: gridPos.col * GRID_CELL_WIDTH  + GRID_CELL_WIDTH  / 2,
  y: gridPos.row * GRID_CELL_HEIGHT + GRID_CELL_HEIGHT / 2,
});

/**
 * Converts a canvas position (pixels) to the corresponding grid cell.
 */
export const getGridPosFromScreen = (
  x: number,
  y: number
): { col: number; row: number } => ({
  col: Math.floor(x / GRID_CELL_WIDTH),
  row: Math.floor(y / GRID_CELL_HEIGHT),
});

// ---------------------------------------------------------------------------
// Combat math utilities
// ---------------------------------------------------------------------------

/** Squared Euclidean distance between two points (faster than with sqrt). */
export const distSq = (
  ax: number, ay: number,
  bx: number, by: number
): number => (ax - bx) ** 2 + (ay - by) ** 2;

/** Euclidean distance between two points. */
export const dist = (
  ax: number, ay: number,
  bx: number, by: number
): number => Math.sqrt(distSq(ax, ay, bx, by));

/**
 * Clamp: limita `value` entre `min` e `max`.
 * Útil para barras de HP, multiplicadores de dano, etc.
 */
export const clamp = (value: number, min: number, max: number): number =>
  Math.max(min, Math.min(max, value));

/**
 * Interpola linearmente entre `a` e `b` com fator `t` (0–1).
 */
export const lerp = (a: number, b: number, t: number): number =>
  a + (b - a) * t;

/**
 * Returns true with probability `chance` (0–1).
 * Ex: rollChance(0.25) → true ~25% do tempo.
 */
export const rollChance = (chance: number): boolean =>
  Math.random() < chance;

/**
 * Picks a random element from an array.
 */
export const pickRandom = <T>(arr: T[]): T =>
  arr[Math.floor(Math.random() * arr.length)];
