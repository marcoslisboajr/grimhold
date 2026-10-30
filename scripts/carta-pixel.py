# ══════════════════════════════════════════════════════════════════════
# carta-pixel.py — fabrica a CARTA-MOLDE pixel do jogo (level-up, loja,
# diario, gacha...) a partir de pecas licenciadas + desenho geometrico:
#
#   pergaminho  : fabricado (cor de papel + salpico + borda rasgada)
#   moldura     : metal escuro desenhado (contorno, chanfro, rebite nos cantos)
#   cristais    : Time Fantasy Icons 16px (raridade: cinza/verde/azul/ouro/roxo)
#   caveiras    : Time Fantasy Icons 16px (nas pontas da divisoria)
#   gema pequena: Time Fantasy Icons 16px (centro da divisoria)
#
# Nativo 150x210, salvo em 2x (300x420, NEAREST). O PixelCard (React) poe
# arte, titulo, raridade e texto nas janelas descritas em cardFrame.ts.
#
# Uso:  python scripts/carta-pixel.py
# ══════════════════════════════════════════════════════════════════════
import os, json, random
from PIL import Image, ImageDraw

ICONS = 'assets-pixel/icones/icons_8.13.20/fullcolor/icons_full_16.png'
OUT = 'public/ui/pixel/'
CAT = 'components/data/cardFrame.ts'
W, H = 150, 210
random.seed(7)

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (255,)

# paleta
PAPEL      = hexrgb('#cdb98a'); PAPEL_ESC = hexrgb('#b9a377'); PAPEL_CLA = hexrgb('#dbc99e')
METAL      = hexrgb('#2b2a30'); METAL_HI  = hexrgb('#5a5866'); METAL_LO  = hexrgb('#141318'); CONTORNO = hexrgb('#0b0906')
JANELA     = hexrgb('#16131a')
TRANSP     = (0, 0, 0, 0)

# icones 16px: (coluna, linha) na folha de 16 colunas
icons = Image.open(ICONS).convert('RGBA')
def icone(col, row):
    return icons.crop((col * 16, row * 16, (col + 1) * 16, (row + 1) * 16))

# raridade -> (cristal grande, gema pequena, cor do filete)
RARIDADES = {
    'common':    ((3, 63), (14, 57), '#8a8a8a'),
    'uncommon':  ((3, 62), (8, 57),  '#4caf6a'),
    'rare':      ((7, 61), (10, 57), '#4d8de0'),
    'legendary': ((11, 61), (13, 57), '#e0b040'),
    'mythic':    ((15, 61), (12, 57), '#b07ae8'),
}
CAVEIRA = (14, 55)

# janelas (nativo): art = arte do heroi/icone; title = faixa de titulo; tag = raridade; body = texto
LAYOUT = {
    'title': (14, 9, 122, 15),
    'art':   (20, 29, 110, 74),
    'tag':   (52, 104, 46, 10),
    'body':  (14, 122, 122, 66),
    'foot':  (14, 190, 122, 10),
}

def pergaminho(im):
    px = im.load()
    for y in range(H):
        for x in range(W):
            r = random.random()
            px[x, y] = PAPEL_ESC if r < 0.06 else PAPEL_CLA if r < 0.10 else PAPEL
    # manchas de idade: 6 blotches ovais, tom mais escuro, transparentes no meio
    for _ in range(6):
        cx, cy = random.randint(10, W-10), random.randint(10, H-10); rx, ry = random.randint(8, 22), random.randint(5, 12)
        for y in range(max(0, cy-ry), min(H, cy+ry)):
            for x in range(max(0, cx-rx), min(W, cx+rx)):
                dd = ((x-cx)/rx)**2 + ((y-cy)/ry)**2
                if 0.55 < dd < 1.0 and random.random() < 0.55: px[x, y] = hexrgb('#b39c6e')
    # margem: 3 px mais escuros perto da beira (papel envelhecido)
    for y in range(H):
        for x in range(W):
            m = min(x, y, W-1-x, H-1-y)
            if m < 3 and random.random() < 0.6: px[x, y] = hexrgb('#a89060')
    # borda rasgada: come 0-2 px aleatorios nas 4 beiras
    for x in range(W):
        for k in range(random.choice((0, 0, 1, 1, 2))): px[x, k] = TRANSP
        for k in range(random.choice((0, 0, 1, 1, 2))): px[x, H - 1 - k] = TRANSP
    for y in range(H):
        for k in range(random.choice((0, 0, 1, 1, 2))): px[k, y] = TRANSP
        for k in range(random.choice((0, 0, 1, 1, 2))): px[W - 1 - k, y] = TRANSP
    # cantos arredondados "mordidos"
    for (cx, cy) in [(0, 0), (W-1, 0), (0, H-1), (W-1, H-1)]:
        for dx in range(4):
            for dy in range(4 - dx):
                px[abs(cx - dx), abs(cy - dy)] = TRANSP

def moldura(d, x0, y0, x1, y1, filete):
    # metal escuro: contorno, corpo, chanfro claro cima/esq, escuro baixo/dir, filete colorido dentro
    d.rectangle((x0, y0, x1, y1), outline=CONTORNO)
    d.rectangle((x0+1, y0+1, x1-1, y1-1), outline=METAL)
    d.rectangle((x0+2, y0+2, x1-2, y1-2), outline=METAL)
    d.line((x0+1, y0+1, x1-1, y0+1), fill=METAL_HI); d.line((x0+1, y0+1, x0+1, y1-1), fill=METAL_HI)
    d.line((x0+1, y1-1, x1-1, y1-1), fill=METAL_LO); d.line((x1-1, y0+1, x1-1, y1-1), fill=METAL_LO)
    d.rectangle((x0+3, y0+3, x1-3, y1-3), outline=METAL)
    d.rectangle((x0+4, y0+4, x1-4, y1-4), outline=hexrgb(filete))
    d.rectangle((x0+5, y0+5, x1-5, y1-5), outline=METAL_LO)
    # tachas em losango nas laterais (no lugar das runas): a cada 12 px, alternando cor
    fil = hexrgb(filete)
    for k, y in enumerate(range(y0 + 24, y1 - 20, 12)):
        for cx in (x0 + 3, x1 - 3):
            # losango de 5 px: luz em cima/esq, sombra embaixo/dir, centro colorido alternando
            d.point((cx, y-2), fill=METAL_HI); d.line((cx-1, y-1, cx+1, y-1), fill=METAL_HI); d.line((cx-2, y, cx+2, y), fill=fil if k % 2 == 0 else METAL_HI)
            d.line((cx-1, y+1, cx+1, y+1), fill=METAL_LO); d.point((cx, y+2), fill=METAL_LO)
    # rebites nos cantos
    for (rx, ry) in [(x0+2, y0+2), (x1-2, y0+2), (x0+2, y1-2), (x1-2, y1-2)]:
        d.point((rx, ry), fill=METAL_HI)

def carta(raridade):
    random.seed(7)   # mesmo papel/manchas em todas as raridades
    cristal, gema, filete = RARIDADES[raridade]
    im = Image.new('RGBA', (W, H), TRANSP)
    pergaminho(im)
    d = ImageDraw.Draw(im)
    # moldura externa
    moldura(d, 3, 3, W - 4, H - 4, filete)
    # placa de titulo (metal) no topo
    tx, ty, tw, th = LAYOUT['title']
    d.rectangle((tx-2, ty-2, tx+tw+1, ty+th+1), fill=METAL, outline=CONTORNO)
    d.line((tx-1, ty-1, tx+tw, ty-1), fill=METAL_HI)
    d.rectangle((tx, ty, tx+tw-1, ty+th-1), fill=hexrgb('#3a3944'))
    # janela de arte (escura, rebaixada)
    ax, ay, aw, ah = LAYOUT['art']
    d.rectangle((ax-3, ay-3, ax+aw+2, ay+ah+2), fill=METAL, outline=CONTORNO)
    d.rectangle((ax-1, ay-1, ax+aw, ay+ah), fill=JANELA, outline=METAL_LO)
    # divisoria: barra de metal com caveiras nas pontas e gema no centro
    dy = ay + ah + 14
    d.rectangle((10, dy, W-11, dy+2), fill=METAL, outline=CONTORNO)
    d.line((11, dy+1, W-12, dy+1), fill=METAL_HI)
    cav = icone(*CAVEIRA)
    im.paste(cav, (6, dy-7), cav); im.paste(cav.transpose(Image.FLIP_LEFT_RIGHT), (W-22, dy-7), cav.transpose(Image.FLIP_LEFT_RIGHT))
    g = icone(*gema); im.paste(g, (W//2 - 8, dy-7), g)
    # etiqueta de raridade (aba escura) logo abaixo da arte, em cima da divisoria
    gx, gy, gw, gh = LAYOUT['tag']
    d.rectangle((gx, gy, gx+gw-1, gy+gh-1), fill=METAL, outline=CONTORNO)
    d.line((gx+1, gy+1, gx+gw-2, gy+1), fill=METAL_HI)
    # cristais grandes nos cantos superiores (por cima da moldura)
    cr = icone(*cristal)
    im.paste(cr, (2, 0), cr); im.paste(cr.transpose(Image.FLIP_LEFT_RIGHT), (W-18, 0), cr.transpose(Image.FLIP_LEFT_RIGHT))
    # linha de rodape
    fx, fy, fw, fh = LAYOUT['foot']
    d.line((fx, fy, fx+fw, fy), fill=PAPEL_ESC)
    return im.resize((W*2, H*2), Image.NEAREST)

os.makedirs(OUT, exist_ok=True)
for r in RARIDADES:
    carta(r).save(OUT + f'card_{r}.png')
with open(CAT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// GERADO por scripts/carta-pixel.py — nao editar a mao.\n')
    f.write('// Carta-molde 300x420 (2x). Janelas em px do PNG final: [x, y, w, h].\n')
    f.write('export const CARD_W = %d;\nexport const CARD_H = %d;\n' % (W*2, H*2))
    f.write('export const CARD_LAYOUT: Record<string, [number, number, number, number]> = ')
    f.write(json.dumps({k: [v[0]*2, v[1]*2, v[2]*2, v[3]*2] for k, v in LAYOUT.items()}, indent=2).replace('"', "'"))
    f.write(';\n')
print('ok:', list(RARIDADES))
