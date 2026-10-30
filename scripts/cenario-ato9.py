# ══════════════════════════════════════════════════════════════════════
# cenario-ato9.py — cenario do ATO IX (Os Guardioes): o atrio antes do
# ventre, pedra e cinza. Chao de lajes de catacumba e piso das Ruinas,
# paredao de ossos no topo, sarcofagos, estatuas de guardioes (esfinges e
# chacais em pedra acinzentada), cranios gigantes, colunas; cinza caindo
# e brasas vermelhas fracas. Mesmo molde do cenario-ato8.py.
#
# Fontes (assets-pixel/tilesets): catacombs_p_3x (paredao de ossos, lajes,
# sarcofagos), tf_ruindungeons/48_RMMV tf_A2_ruins (piso cinza),
# tf_B_ruins1 (colunas, cranios, estatuas), tf_B_ruins2 (esfinges, chacais
# — dessaturados para pedra).
#
# Toda peca alta vai em OBJETOS_ALTOS (profundidade): ninguem anda por cima.
# Saida: public/sprites/arena/bg_act9_field.png, bg_act9_courtyard.png,
#        act9/<obj>.png, components/data/arenaAct9.ts
# Uso:   python scripts/cenario-ato9.py
# ══════════════════════════════════════════════════════════════════════
import random, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
TS = 'assets-pixel/tilesets/'
RU = TS + 'tf_ruindungeons/48_RMMV/'
OUT = 'public/sprites/arena/'
random.seed(99)

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
def pedra(im):   # ouro vira pedra: dessatura, mantendo o alfa
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(ImageEnhance.Color(im).enhance(0.12)).enhance(0.9); im.putalpha(a)
    return im

# ── fontes ──────────────────────────────────────────────────────────────
cat = sheet(TS + 'catacombs_p_3x.png')
a2r = sheet(RU + 'tf_A2_ruins.png')
b1 = sheet(RU + 'tf_B_ruins1.png')
b2 = sheet(RU + 'tf_B_ruins2.png')

piso     = a2r.crop((0, 0, 48, 48))                 # piso cinza das ruinas
laje     = cat.crop((0, 144, 96, 192))              # lajes da catacumba
paredao  = cat.crop((0, 0, 240, 144))               # parede de ossos e cranios
sarc     = recortar(cat.crop((0, 240, 96, 300)))    # sarcofago fechado
sarc_ab  = recortar(cat.crop((96, 240, 192, 300)))  # sarcofago aberto
sarc_oss = recortar(cat.crop((288, 240, 384, 300))) # sarcofago com ossos
coluna   = recortar(b1.crop((288, 0, 336, 144)))
coluna_q = recortar(b1.crop((336, 48, 384, 144)))
cranio   = recortar(b1.crop((0, 672, 96, 768)))
estatua  = recortar(b1.crop((30, 296, 112, 420)))     # guardiao sobre pedestal
esfinge  = pedra(recortar(b2.crop((396, 150, 560, 270))))
esfinge2 = pedra(recortar(b2.crop((594, 150, 760, 270))))
chacal   = pedra(recortar(b2.crop((336, 200, 384, 288))))
entulho  = [recortar(b1.crop(c)) for c in [(192, 192, 240, 240), (0, 240, 48, 288)]]

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, piso, 0, 0, W, H)
for (cx, cy, rx, ry) in [(300, 300, 220, 110), (900, 560, 260, 120), (560, 780, 200, 70), (1100, 220, 150, 80)]:
    mancha(campo, laje, cx, cy, rx, ry, blur=30, alfa=90)
# fissuras escuras de cinza
for (cx, cy, rx, ry) in [(620, 420, 150, 30), (200, 620, 120, 25), (1020, 380, 100, 22)]:
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=(30, 26, 24, 150))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(14)))
for _ in range(14):
    e = random.choice(entulho)
    campo.alpha_composite(e, (random.randint(0, W - 48), random.randint(130, 840)))

# paredao de ossos no topo
for x in range(0, W, paredao.width):
    campo.alpha_composite(paredao.crop((0, 40, paredao.width, paredao.height)), (x, -20))

OBJETOS_ALTOS = [
    ('esfinge', 120, 200), ('esfinge2', 980, 150), ('chacal', 560, 170), ('chacal', 760, 640),
    ('estatua', 400, 420), ('coluna', 260, 560), ('coluna', 1120, 480), ('coluna_q', 700, 330),
    ('sarc', 860, 420), ('sarc_ab', 120, 760), ('sarc_oss', 1020, 770), ('cranio', 480, 700),
]
SPRITES = {'esfinge': esfinge, 'esfinge2': esfinge2, 'chacal': chacal, 'estatua': estatua,
           'coluna': coluna, 'coluna_q': coluna_q, 'sarc': sarc, 'sarc_ab': sarc_ab,
           'sarc_oss': sarc_oss, 'cranio': cranio}

for nome, x, y in OBJETOS_ALTOS:
    im = SPRITES[nome]; w = im.width
    sx, sy = x + w / 2, y + im.height - 6
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((sx - w * 0.45, sy - 9, sx + w * 0.45, sy + 9), fill=(0, 0, 0, 120))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── luz de cinza: cinzento quente, sem cor ─────────────────────────────
def cinza(im, fator=0.5, tom=(60, 50, 45), peso=0.22):
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(im).enhance(fator); im.putalpha(a)
    im = ImageEnhance.Color(im).enhance(0.55)
    return tingir(im, tom, peso)

campo = cinza(campo)

def brilho(dst, cx, cy, r, cor, a):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - r, cy - r, cx + r, cy + r), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(r * 0.45)))
for (x, y) in [(620, 420), (200, 620), (1020, 380)]:        # brasas nas fissuras
    brilho(campo, x, y, 40, (255, 90, 40), 55)
# cinza caindo (flocos claros)
fl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(fl)
for _ in range(260):
    x, y = random.randint(0, W), random.randint(0, H)
    d.rectangle((x, y, x + 1, y + 1), fill=(210, 200, 190, random.randint(60, 140)))
campo.alpha_composite(fl)

campo.save(OUT + 'bg_act9_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act9', exist_ok=True)
dims = {}
for nome, im in SPRITES.items():
    im = cinza(im); im.save(OUT + f'act9/{nome}.png'); dims[nome] = im.size
linhas = [f"  {{ src: './sprites/arena/act9/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + dims[n][1]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct9.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato9.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato IX (Os Guardioes). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = y + h.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT9_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: lajes de catacumba ──────────────────────────────────────────
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, laje, 0, 0, 350 + 96, H)
patio = cinza(patio, fator=0.55)
patio.save(OUT + 'bg_act9_courtyard.png')
print('patio:', patio.size)

prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + dims[o[0]][1]):
    prev.alpha_composite(cinza(SPRITES[nome]), (350 + x, y))
prev.convert('RGB').save('release-demo/previa-ato9-cenario.png')
print('previa: release-demo/previa-ato9-cenario.png')
