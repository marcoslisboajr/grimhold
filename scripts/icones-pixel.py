# ══════════════════════════════════════════════════════════════════════
# icones-pixel.py — exporta os icones pixel usados na UI (menu, HUD) do
# Time Fantasy Icons (assets-pixel/icones/icons_8.13.20/fullcolor/icons_full_32.png)
# para public/ui/pixel/icons/<nome>.png, ja em 2x (64 px, NEAREST).
#
# Cada nome aponta pra (coluna, linha) na folha de 16 colunas x 32 px.
# Usado por components/ui/PixelIcon.tsx. Substitui os Sigil (SVG de linha)
# onde a UI e pixel. Para achar novos icones: scripts/.tmp com folhas de
# contato (ver conversas de 18/9) ou quick_guide.png do pacote.
#
# Uso:  python scripts/icones-pixel.py
# ══════════════════════════════════════════════════════════════════════
import os
from PIL import Image

SRC = 'assets-pixel/icones/icons_8.13.20/fullcolor/icons_full_32.png'
OUT = 'public/ui/pixel/icons/'

ICONES = {
    # ── UI / menu ──
    'swords':   (3, 25),  'trophy':   (13, 51), 'tome':     (2, 1),   'skull':    (6, 0),
    'gem':      (12, 57), 'crown':    (13, 45), 'hammer':   (12, 58), 'star':     (13, 14),
    'scroll':   (2, 24),  'book':     (3, 1),   'mail':     (10, 1),  'gear':     (8, 2),
    'coin':     (10, 0),  'shield':   (8, 0),   'heart':    (1, 0),   'tomb':     (14, 24),
    'candle':   (12, 24), 'bag':      (0, 16),  'potion':   (10, 16), 'flame':    (3, 9),
    'ice':      (8, 9),   'bolt':     (12, 9),  'leaf':     (3, 10),  'hourglass':(7, 14),
    'sparkle':  (2, 13),  'lock':     (6, 2),   'check':    (9, 4),   'cross':    (10, 4),
    # ── cartas / loja (mapa emoji -> pixel em components/ui/pixelIcons.ts) ──
    'blood':    (12, 34),   # vidro de sangue  'moon':     (2, 7),   'sword':    (13, 27), 'axe':      (5, 28),
    'dagger':   (1, 27),  'bow':      (5, 33),  'arrow':    (10, 33), 'rock':     (11, 10),
    'mirror':   (7, 0),   'gold_pile':(11, 0),  'crystal':  (7, 61),  'orb':      (11, 57),
    'diamond':  (2, 63),  'emerald':  (3, 62),  'ruby':     (3, 61),  'amethyst': (15, 61),
    'anvil':    (12, 58), 'flag':     (11, 52), 'banner':   (1, 52),  'castle':   (0, 2),
    'ghost':    (7, 4),   'drum':     (12, 25), 'note':     (14, 25), 'dice':     (2, 13),
    'target':   (4, 4),   'meat':     (2, 20),  'tree':     (6, 10),  'wave':     (7, 9),
    'compass':  (13, 4),  'clock':    (10, 14), 'chain':    (1, 49),  'tornado':  (0, 10),
    'comet':    (11, 9),  'rune':     (5, 53),  'staff':    (12, 30), 'wand':     (5, 31),
    'helm':     (5, 44),  'armor':    (9, 38),  'cloak':    (14, 43), 'boots':    (5, 47),
    'ring':     (6, 50),  'amulet':   (13, 49), 'key':      (2, 22),  'chest':    (13, 35),
    'herb':     (0, 21),  'mushroom': (2, 21),  'elixir':   (5, 16),  'skull_red':(15, 50),
    'stone_face': (9, 53), 'lantern': (13, 24), 'feather': (12, 54), 'fish':     (6, 54),
    'spiral':   (14, 13), 'burst':    (8, 8),   'nova':     (1, 8),   'shield_gold': (10, 37),
    'shield_red': (12, 37), 'shield_blue': (11, 37), 'shield_purple': (13, 37),
    'sword_fire': (12, 27), 'sword_ice': (10, 27), 'sword_dark': (14, 27), 'bow_fire': (3, 32),
    'heart_dark': (2, 0), 'star_blue': (3, 0), 'scales': (2, 53), 'tent': (9, 9),
    # ── extras pra cartas ──
    'claw':     (9, 13),  'eye':      (3, 13),  'ice_shard':(0, 13),  'poison':   (4, 21),
    'scythe':   (13, 28), 'spear':    (11, 29), 'axe_big':  (4, 28),  'bow_ice':  (2, 32),
    'sun':      (3, 7),   'wind':     (2, 10),  'cloud':    (11, 7),  'rain':     (9, 7),
    'book_red': (6, 24),  'horn':     (1, 24),  'wing':     (12, 54), 'feather_red': (15, 54),
    'shield_wood': (0, 36), 'shield_iron': (14, 36), 'helm_red': (4, 44), 'gauntlet': (7, 46),
    'vial_green': (13, 34), 'vial_blue': (9, 34), 'coins': (11, 0), 'crystal_ball': (12, 0),
    'moon_dark': (1, 7), 'star_gold': (14, 14), 'sparks': (0, 8), 'explosion': (9, 8),
    'skull_bone': (13, 55), 'bones': (12, 55), 'gravestone': (15, 24), 'candle_lit': (13, 24),
    'lyre': (10, 25), 'flute': (11, 25), 'bell': (9, 25), 'pouch': (1, 16), 'gift': (6, 16),
    'chest_gold': (12, 35), 'key_gold': (4, 22), 'map': (2, 1), 'dice2': (5, 34),
    'tornado2': (0, 10), 'leaf_red': (5, 10), 'tree_pine': (7, 10), 'volcano': (9, 10),
}

os.makedirs(OUT, exist_ok=True)
folha = Image.open(SRC).convert('RGBA')
for nome, (c, r) in ICONES.items():
    ic = folha.crop((c * 32, r * 32, (c + 1) * 32, (r + 1) * 32))
    ic.resize((64, 64), Image.NEAREST).save(OUT + f'{nome}.png')
print('ok:', len(ICONES), 'icones')
