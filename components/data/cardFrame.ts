// GERADO por scripts/carta-pixel.py — nao editar a mao.
// Carta-molde 300x420 (2x). Janelas em px do PNG final: [x, y, w, h].
export const CARD_W = 300;
export const CARD_H = 420;
export const CARD_LAYOUT: Record<string, [number, number, number, number]> = {
  'title': [
    28,
    18,
    244,
    30
  ],
  'art': [
    40,
    58,
    220,
    148
  ],
  'tag': [
    104,
    208,
    92,
    20
  ],
  'body': [
    28,
    244,
    244,
    132
  ],
  'foot': [
    28,
    380,
    244,
    20
  ]
};

// Carta de monstro (scripts/carta-bestiario.py): card_monster_<ameaca>.png, 300x520 (2x)
export const CARD_MONSTER_W = 300;
export const CARD_MONSTER_H = 520;
export const CARD_MONSTER_LAYOUT: Record<string, [number, number, number, number]> = {
  'title': [
    28,
    18,
    244,
    30
  ],
  'art': [
    40,
    58,
    220,
    148
  ],
  'tag': [
    104,
    208,
    92,
    20
  ],
  'body': [
    28,
    244,
    244,
    232
  ],
  'foot': [
    28,
    480,
    244,
    20
  ]
};
