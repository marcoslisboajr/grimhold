// GERADO por scripts/cenario-ato1.py — nao editar na mao.
// Objetos altos do cenario do Ato I. x,y sao do CAMPO INIMIGO (x=0 na
// muralha); quem desenha soma BARRIER_X. A profundidade e a base (ou y + h).
export interface ArenaObject { src: string; x: number; y: number; w: number; h: number; base?: number }
export const ARENA_ACT1_OBJECTS: ArenaObject[] = [
  { src: './sprites/arena/act1/barricada.png', x: 30, y: 300, w: 192, h: 48, base: 348 },
  { src: './sprites/arena/act1/cerca_c.png', x: 20, y: 470, w: 144, h: 48, base: 518 },
  { src: './sprites/arena/act1/barricada.png', x: 40, y: 700, w: 192, h: 48, base: 748 },
  { src: './sprites/arena/act1/arvore_g.png', x: 470, y: 150, w: 156, h: 168, base: 318 },
  { src: './sprites/arena/act1/arvore_g.png', x: 1070, y: 520, w: 156, h: 168, base: 688 },
  { src: './sprites/arena/act1/arvore_p.png', x: 850, y: 300, w: 90, h: 153, base: 453 },
  { src: './sprites/arena/act1/arvore_p.png', x: 700, y: 690, w: 90, h: 153, base: 843 },
  { src: './sprites/arena/act1/cacto.png', x: 1180, y: 300, w: 48, h: 84, base: 384 },
  { src: './sprites/arena/act1/cacto2.png', x: 380, y: 610, w: 48, h: 84, base: 694 },
  { src: './sprites/arena/act1/cacto.png', x: 1000, y: 170, w: 48, h: 84, base: 254 },
  { src: './sprites/arena/act1/suprimentos.png', x: 200, y: 330, w: 120, h: 66, base: 396 },
  { src: './sprites/arena/act1/viveres.png', x: 1040, y: 400, w: 128, h: 93, base: 493 },
  { src: './sprites/arena/act1/suprimentos.png', x: 880, y: 760, w: 120, h: 66, base: 826 },
  { src: './sprites/arena/act1/pedra_g.png', x: 560, y: 300, w: 72, h: 42, base: 342 },
  { src: './sprites/arena/act1/pedra_g.png', x: 180, y: 560, w: 72, h: 42, base: 602 },
  { src: './sprites/arena/act1/pedra_m.png', x: 1130, y: 700, w: 39, h: 39, base: 739 },
  { src: './sprites/arena/act1/pedra_p.png', x: 820, y: 620, w: 39, h: 39, base: 659 },
  { src: './sprites/arena/act1/pedra_m.png', x: 260, y: 770, w: 39, h: 39, base: 809 },
  { src: './sprites/arena/act1/tumulos.png', x: 470, y: 760, w: 143, h: 72, base: 832 },
  { src: './sprites/arena/act1/lenha.png', x: 330, y: 180, w: 39, h: 45, base: 225 },
];
