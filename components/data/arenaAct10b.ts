// GERADO por scripts/cenario-ato10-ventre.py — nao editar na mao.
// Objetos altos do interior da Fome (luta final do Ato X). x,y do CAMPO
// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = y + h.
import type { ArenaObject } from './arenaAct1';
export const ARENA_ACT10B_OBJECTS: ArenaObject[] = [
  { src: './sprites/arena/act10b/osso.png', x: 120, y: 170, w: 48, h: 141, base: 311 },
  { src: './sprites/arena/act10b/osso_p.png', x: 980, y: 150, w: 48, h: 129, base: 279 },
  { src: './sprites/arena/act10b/presa.png', x: 330, y: 380, w: 36, h: 123, base: 503 },
  { src: './sprites/arena/act10b/presa_b.png', x: 720, y: 620, w: 36, h: 123, base: 743 },
  { src: './sprites/arena/act10b/anel.png', x: 880, y: 330, w: 48, h: 66, base: 396 },
  { src: './sprites/arena/act10b/pustula.png', x: 470, y: 190, w: 42, h: 33, base: 223 },
  { src: './sprites/arena/act10b/pustula.png', x: 240, y: 640, w: 42, h: 33, base: 673 },
  { src: './sprites/arena/act10b/pustula_p.png', x: 1010, y: 460, w: 30, h: 21, base: 481 },
  { src: './sprites/arena/act10b/olho_pod.png', x: 610, y: 700, w: 42, h: 48, base: 748 },
  { src: './sprites/arena/act10b/espinhos.png', x: 150, y: 480, w: 39, h: 42, base: 522 },
  { src: './sprites/arena/act10b/presa.png', x: 860, y: 760, w: 36, h: 123, base: 883 },
  { src: './sprites/arena/act10b/osso.png', x: 440, y: 780, w: 48, h: 141, base: 921 },
];
// Centro dos 4 Pontos Fracos (olhos no chao, ao alcance dos herois); sprite act10b/olho_1..3.png (72x72).
export const PONTOS_FRACOS_ACT10B: { x: number; y: number }[] = [
  { x: 395, y: 210 },
  { x: 405, y: 400 },
  { x: 395, y: 560 },
  { x: 400, y: 680 },
];
