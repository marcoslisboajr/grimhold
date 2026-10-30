# ══════════════════════════════════════════════════════════════════════
# cenario-ato8.py — cenario do ATO VIII (O Mar Sem Fundo): ruinas afundadas
# num mar escuro. Chao de pedra alagada (cais das Ruinas) com pocas, mar
# fundo aparecendo pelas rachaduras, cachoeiras caindo do paredao no topo,
# colunas quebradas, estatuas e cranios afundados; brilho verde-agua das
# aguas-vivas. Mesmo molde do cenario-ato7.py.
#
# Fontes (assets-pixel/tilesets): tf_newworld_RMA1_3x (mar), newworld_
# waterfalls_3x (cachoeiras), tf_ruindungeons/48_RMMV tf_A2_ruins (pedra),
# tf_B_ruins1 (colunas, estatuas, cranios, entulho).
#
# Saida: public/sprites/arena/bg_act8_field.png, bg_act8_courtyard.png,
#        act8/<obj>.png, components/data/arenaAct8.ts
# Uso:   python scripts/cenario-ato8.py
# ══════════════════════════════════════════════════════════════════════
import random, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
TS = 'assets-pixel/tilesets/'
RU = TS + 'tf_ruindungeons/48_RMMV/'
OUT = 'public/sprites/arena/'
random.seed(88)

def sheet(p): return Image.open(p).convert('RGBA')
def azulejar(dst, tile, x0, y0, x1, y1):
    for y in range(y0, y1, tile.height):
        for x in range(x0, x1, tile.width):
            dst.paste(tile, (x, y), tile)
def com_mascara(dst, tile, mask, blur=0):
    W, H = dst.size
    cam = Image.new('RGBA', (W, H), (0, 0, 0, 0)); azulejar(cam, tile, 0, 0, W, H)
    cam.putalpha(mask.filter(ImageFilter.GaussianBlur(blur)) if blur else mask); dst.alpha_composite(cam)
def mancha(dst, tile, cx, cy, rx, ry, blur=26, alfa=255):
    m = Image.new('L', dst.size, 0); ImageDraw.Draw(m).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=alfa)
    com_mascara(dst, tile, m, blur)
def tingir(im, tom, peso):
    tinta = Image.new('RGBA', im.size, tom + (0,))
    tinta.putalpha(ImageChops.multiply(im.getchannel('A'), Image.new('L', im.size, int(255 * peso))))
    return Image.alpha_composite(im, tinta)
def recortar(im): return im.crop(im.getbbox())

# ── fontes ──────────────────────────────────────────────────────────────
a1n = sheet(TS + 'tf_newworld_RMA1_3x.png')
cach = sheet(TS + 'newworld_waterfalls_3x.png')
a2r = sheet(RU + 'tf_A2_ruins.png')
b1 = sheet(RU + 'tf_B_ruins1.png')

mar      = a1n.crop((0, 0, 96, 96))                 # mar fundo
pedra    = a2r.crop((0, 0, 48, 48))                 # piso de pedra cinza das ruinas
laje     = a2r.crop((96, 0, 144, 48))               # lajes azuladas (grade)
queda    = cach.crop((0, 0, 576, 36))               # faixa de cachoeira

coluna   = recortar(b1.crop((288, 0, 336, 144)))    # coluna inteira
coluna_q = recortar(b1.crop((336, 48, 384, 144)))   # coluna quebrada
estatua  = recortar(b1.crop((192, 288, 240, 432)))  # estatua sobre pedestal
estatua2 = recortar(b1.crop((288, 288, 336, 432)))  # estatua de pe
cranio   = recortar(b1.crop((0, 672, 96, 768)))     # cranio gigante
cranio_m = recortar(b1.crop((192, 672, 288, 768)))  # cranio com musgo
tronco   = recortar(b1.crop((576, 96, 720, 144)))   # coluna caida
entulho  = [recortar(b1.crop(c)) for c in [(192, 192, 240, 240), (0, 240, 48, 288)]]

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, mar, 0, 0, W, H)                    # o mar esta embaixo de tudo

# plataforma de pedra alagada com rachaduras onde o mar aparece
m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
d.rectangle((0, 70, W, 850), fill=255)
for (cx, cy, rx, ry) in [(300, 250, 70, 40), (880, 440, 90, 45), (560, 700, 80, 35), (1120, 230, 60, 35), (140, 560, 55, 30)]:
    for _ in range(5):
        ox, oy = random.randint(-rx // 2, rx // 2), random.randint(-ry // 2, ry // 2)
        d.ellipse((cx + ox - rx * .7, cy + oy - ry * .7, cx + ox + rx * .7, cy + oy + ry * .7), fill=0)
chao = Image.new('RGBA', (W, H), (0, 0, 0, 0)); azulejar(chao, pedra, 0, 0, W, H)
for (cx, cy, rx, ry) in [(620, 300, 200, 90), (220, 760, 160, 60), (1000, 650, 170, 70)]:
    mancha(chao, laje, cx, cy, rx, ry, blur=18, alfa=200)
chao.putalpha(ImageChops.multiply(m.filter(ImageFilter.GaussianBlur(4)), chao.getchannel('A')))
campo.alpha_composite(chao)

# lamina d'agua rasa sobre a pedra
for (cx, cy, rx, ry) in [(480, 460, 140, 50), (1000, 160, 120, 40), (200, 380, 90, 35), (760, 800, 150, 30)]:
    mancha(campo, mar, cx, cy, rx, ry, blur=22, alfa=170)

# entulho no chao (pisa por cima)
for _ in range(14):
    e = random.choice(entulho)
    campo.alpha_composite(e, (random.randint(0, W - 48), random.randint(100, 800)))

# paredao com cachoeiras no topo
for y in range(0, 60, 12):
    for x in range(-96, W, queda.width):
        campo.alpha_composite(queda, (x + (y * 7) % 96, y))
espuma = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(espuma).rectangle((0, 62, W, 78), fill=(200, 240, 255, 110))
campo.alpha_composite(espuma.filter(ImageFilter.GaussianBlur(5)))

OBJETOS_ALTOS = [
    ('coluna', 150, 120), ('coluna_q', 420, 560), ('coluna', 1090, 460),
    ('estatua', 700, 90), ('estatua2', 980, 700), ('cranio', 330, 700),
    ('cranio_m', 820, 300), ('tronco', 520, 150), ('coluna_q', 250, 330),
]
SPRITES = {'coluna': coluna, 'coluna_q': coluna_q, 'estatua': estatua, 'estatua2': estatua2,
           'cranio': cranio, 'cranio_m': cranio_m, 'tronco': tronco}

for nome, x, y in OBJETOS_ALTOS:
    im = SPRITES[nome]; w = im.width
    sx, sy = x + w / 2, y + im.height - 6
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((sx - w * 0.45, sy - 9, sx + w * 0.45, sy + 9), fill=(0, 0, 0, 110))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── luz de fundo do mar: azul-esverdeado frio ──────────────────────────
def abismo(im, fator=0.5, tom=(10, 60, 80), peso=0.30):
    im = ImageEnhance.Brightness(im).enhance(fator)
    im = ImageEnhance.Color(im).enhance(0.85)
    return tingir(im, tom, peso)

campo = abismo(campo)

def brilho(dst, cx, cy, r, cor, a):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - r, cy - r, cx + r, cy + r), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(r * 0.45)))
for (x, y) in [(260, 300), (760, 520), (1100, 330)]:        # luz da superficie
    brilho(campo, x, y, 80, (170, 230, 255), 22)
for (x, y) in [(300, 250), (880, 440), (560, 700), (1120, 230), (140, 560)]:   # aguas-vivas
    brilho(campo, x, y, 28, (90, 255, 220), 90)

campo.save(OUT + 'bg_act8_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act8', exist_ok=True)
dims = {}
for nome, im in SPRITES.items():
    im = abismo(im); im.save(OUT + f'act8/{nome}.png'); dims[nome] = im.size
linhas = [f"  {{ src: './sprites/arena/act8/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + dims[n][1]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct8.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato8.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato VIII (O Mar Sem Fundo). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = y + h.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT8_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: o cais de pedra ─────────────────────────────────────────────
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, pedra, 0, 0, 350 + T, H)
for (cx, cy, rx, ry) in [(80, 220, 80, 40), (260, 620, 70, 50)]:
    mancha(patio, mar, cx, cy, rx, ry, blur=18, alfa=110)
patio = abismo(patio, fator=0.7)
patio.save(OUT + 'bg_act8_courtyard.png')
print('patio:', patio.size)

# previa composta (patio + campo + objetos) para aprovacao
prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + dims[o[0]][1]):
    prev.alpha_composite(abismo(SPRITES[nome]), (350 + x, y))
prev.convert('RGB').save('release-demo/previa-ato8-cenario.png')
print('previa: release-demo/previa-ato8-cenario.png')
