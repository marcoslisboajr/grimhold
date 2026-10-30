# ══════════════════════════════════════════════════════════════════════
# carta-bestiario.py — a carta de MONSTRO ("lapide"): pedra escura no lugar
# do pergaminho, moldura de osso no lugar do metal, caveiras no lugar dos
# cristais. Mesmo esqueleto/janelas da carta de heroi (carta-pixel.py), entao
# o PixelCard veste as duas.
#
# O nivel de AMEACA e a "raridade" da carta e tem que se ver de longe:
#   low     — moldura de osso, filete cinza, 1 caveira pequena no topo
#   medium  — filete ouro, caveiras nos 2 cantos
#   high    — filete sangue, caveiras nos cantos + chamas ladeando o titulo
#   boss    — filete vermelho vivo, faixa vermelha atras da placa, COROA no
#             topo, caveiras nos 4 cantos, borda de osso mais grossa
#
# Pecas: laje = tileset catacumbas (assets-pixel/tilesets/catacombs_p_3x.png)
# caveira/osso/coroa/chamas/gemas = Time Fantasy Icons 16px.
#
# Uso:  python scripts/carta-bestiario.py
# ══════════════════════════════════════════════════════════════════════
import os, json, random
from PIL import Image, ImageDraw

ICONS = 'assets-pixel/icones/icons_8.13.20/fullcolor/icons_full_16.png'
LAJE_SRC = 'assets-pixel/tilesets/catacombs_p_3x.png'
OUT = 'public/ui/pixel/'
CAT = 'components/data/cardFrame.ts'
W, H = 150, 260   # mais alta que a de heroi: cabe lore + stats + habilidades

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (255,)

OSSO     = hexrgb('#a4988a'); OSSO_HI = hexrgb('#d2c6b4'); OSSO_LO = hexrgb('#5e5448'); CONTORNO = hexrgb('#0b0906')
PLACA    = hexrgb('#1d1a20'); JANELA  = hexrgb('#0f0d12')
TRANSP   = (0, 0, 0, 0)

icons = Image.open(ICONS).convert('RGBA')
def icone(col, row): return icons.crop((col * 16, row * 16, (col + 1) * 16, (row + 1) * 16))
CAVEIRA, OSSO_IC, COROA, CHAMA = (14, 55), (12, 55), (13, 45), (3, 9)

# ameaca -> (filete, gema pequena, faixa atras da placa)
AMEACAS = {
    'low':    ('#8a8a8a', (14, 57), None),
    'medium': ('#e0b040', (13, 57), None),
    'high':   ('#b8402c', (9, 57),  None),
    'boss':   ('#e0362a', (9, 57),  '#4a1410'),
}

LAYOUT = {
    'title': (14, 9, 122, 15),
    'art':   (20, 29, 110, 74),
    'tag':   (52, 104, 46, 10),
    'body':  (14, 122, 122, 116),
    'foot':  (14, 240, 122, 10),
}

laje_tile = Image.open(LAJE_SRC).convert('RGBA').crop((48, 192, 96, 240))
def laje(im):
    for y in range(0, H, 48):
        for x in range(0, W, 48):
            im.paste(laje_tile, (x, y))
    px = im.load(); random.seed(11)
    # escurece um pouco e lasca as bordas (pedra quebrada, nao rasgada)
    for y in range(H):
        for x in range(W):
            r, g, b, a = px[x, y]; px[x, y] = (int(r*0.8), int(g*0.8), int(b*0.82), 255)
    for x in range(W):
        for k in range(random.choice((0, 0, 0, 1, 2, 3))): px[x, k] = TRANSP
        for k in range(random.choice((0, 0, 0, 1, 2, 3))): px[x, H-1-k] = TRANSP
    for y in range(H):
        for k in range(random.choice((0, 0, 0, 1, 2, 3))): px[k, y] = TRANSP
        for k in range(random.choice((0, 0, 0, 1, 2, 3))): px[W-1-k, y] = TRANSP
    for (cx, cy) in [(0, 0), (W-1, 0), (0, H-1), (W-1, H-1)]:
        for dx in range(5):
            for dy in range(5 - dx): px[abs(cx-dx), abs(cy-dy)] = TRANSP

def moldura(d, x0, y0, x1, y1, filete, grossa):
    d.rectangle((x0, y0, x1, y1), outline=CONTORNO)
    d.rectangle((x0+1, y0+1, x1-1, y1-1), outline=OSSO)
    d.rectangle((x0+2, y0+2, x1-2, y1-2), outline=OSSO)
    if grossa: d.rectangle((x0+3, y0+3, x1-3, y1-3), outline=OSSO)
    d.line((x0+1, y0+1, x1-1, y0+1), fill=OSSO_HI); d.line((x0+1, y0+1, x0+1, y1-1), fill=OSSO_HI)
    d.line((x0+1, y1-1, x1-1, y1-1), fill=OSSO_LO); d.line((x1-1, y0+1, x1-1, y1-1), fill=OSSO_LO)
    k = 4 if grossa else 3
    d.rectangle((x0+k, y0+k, x1-k, y1-k), outline=hexrgb(filete))
    d.rectangle((x0+k+1, y0+k+1, x1-k-1, y1-k-1), outline=CONTORNO)
    # "vertebras" nas laterais: tracinhos de osso a cada 10 px
    for y in range(y0 + 26, y1 - 22, 10):
        for cx in (x0 + 2, x1 - 2):
            d.line((cx-1, y, cx+1, y), fill=OSSO_LO); d.point((cx, y-1), fill=OSSO_HI)

def carta(ameaca):
    filete, gema, faixa = AMEACAS[ameaca]
    boss = ameaca == 'boss'
    im = Image.new('RGBA', (W, H), TRANSP)
    laje(im)
    d = ImageDraw.Draw(im)
    moldura(d, 3, 3, W-4, H-4, filete, boss)
    # faixa vermelha atras da placa (so chefe)
    tx, ty, tw, th = LAYOUT['title']
    if faixa: d.rectangle((6, ty-4, W-7, ty+th+3), fill=hexrgb(faixa))
    # placa de titulo: pedra preta com contorno de osso
    d.rectangle((tx-2, ty-2, tx+tw+1, ty+th+1), fill=PLACA, outline=OSSO_LO)
    d.line((tx-1, ty-1, tx+tw, ty-1), fill=OSSO)
    # janela de arte
    ax, ay, aw, ah = LAYOUT['art']
    d.rectangle((ax-3, ay-3, ax+aw+2, ay+ah+2), fill=OSSO_LO, outline=CONTORNO)
    d.rectangle((ax-1, ay-1, ax+aw, ay+ah), fill=JANELA, outline=CONTORNO)
    # divisoria: osso com ossos cruzados nas pontas e gema no centro
    dy = ay + ah + 14
    d.rectangle((10, dy, W-11, dy+2), fill=OSSO, outline=CONTORNO); d.line((11, dy+1, W-12, dy+1), fill=OSSO_HI)
    ob = icone(*OSSO_IC)
    im.paste(ob, (6, dy-7), ob); im.paste(ob.transpose(Image.FLIP_LEFT_RIGHT), (W-22, dy-7), ob.transpose(Image.FLIP_LEFT_RIGHT))
    g = icone(*gema); im.paste(g, (W//2 - 8, dy-7), g)
    # aba de ameaca
    gx, gy, gw, gh = LAYOUT['tag']
    d.rectangle((gx, gy, gx+gw-1, gy+gh-1), fill=PLACA, outline=OSSO_LO)
    # ── sinais de ameaca ──
    cav = icone(*CAVEIRA)
    if ameaca == 'low':
        im.paste(cav, (W//2 - 8, 0), cav)
    if ameaca in ('medium', 'high', 'boss'):
        im.paste(cav, (2, 0), cav); im.paste(cav, (W-18, 0), cav)
    if ameaca in ('high', 'boss'):
        ch = icone(*CHAMA); im.paste(ch, (tx-6, ty-2), ch); im.paste(ch, (tx+tw-10, ty-2), ch)
    if boss:
        im.paste(cav, (2, H-18), cav); im.paste(cav, (W-18, H-18), cav)
        co = icone(*COROA); im.paste(co, (W//2 - 8, 0), co)
    # rodape
    fx, fy, fw, fh = LAYOUT['foot']
    d.line((fx, fy, fx+fw, fy), fill=OSSO_LO)
    return im.resize((W*2, H*2), Image.NEAREST)

os.makedirs(OUT, exist_ok=True)
for a in AMEACAS: carta(a).save(OUT + f'card_monster_{a}.png')
# escreve o bloco de monstro no catalogo (substitui o anterior, se houver)
s = open(CAT, encoding='utf-8').read()
i = s.find('// Carta de monstro')
if i >= 0: s = s[:i].rstrip() + chr(10)
s += chr(10) + '// Carta de monstro (scripts/carta-bestiario.py): card_monster_<ameaca>.png, %dx%d (2x)' % (W*2, H*2) + chr(10)
s += 'export const CARD_MONSTER_W = %d;' % (W*2) + chr(10) + 'export const CARD_MONSTER_H = %d;' % (H*2) + chr(10)
s += 'export const CARD_MONSTER_LAYOUT: Record<string, [number, number, number, number]> = '
s += json.dumps({k: [v[0]*2, v[1]*2, v[2]*2, v[3]*2] for k, v in LAYOUT.items()}, indent=2).replace('"', "'") + ';' + chr(10)
open(CAT, 'w', encoding='utf-8', newline=chr(10)).write(s)
print('ok:', list(AMEACAS))
