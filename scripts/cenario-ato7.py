# ══════════════════════════════════════════════════════════════════════
# cenario-ato7.py — cenario do ATO VII (A Ravina dos Xamas): o fundo de uma
# ravina de selva do outro lado da Fenda. Chao de grama e terra batida,
# paredoes de raizes e madeira no topo, riacho embaixo, arvores, moitas,
# pedras e flores; brilho verde dos totens dos xamas. Mesmo molde do
# cenario-ato6.py.
#
# Fontes (assets-pixel/tilesets/tf_jungle/rpgmaker/RMMV): tf_jungle_a2
# (grama/terra), tf_jungle_a5 (paredao), tf_jungle_b (arvores, moitas,
# pedras, flores), tf_jungle_a1 (agua).
#
# Elenco (docs/ATOS_VI_X_ASSETS.md): sapos, ratos, insetos, vespas,
# homens-lagarto, lobos, javalis, raptores, guerreiros bestiais; chefes
# Sapo-Rei / Kwa'Zul / Alfa da Matilha / Xiphra / Chefe Tribal / Ossoth.
#
# Saida: public/sprites/arena/bg_act7_field.png, bg_act7_courtyard.png,
#        act7/<obj>.png, components/data/arenaAct7.ts
# Uso:   python scripts/cenario-ato7.py
# ══════════════════════════════════════════════════════════════════════
import random, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
JG = 'assets-pixel/tilesets/tf_jungle/rpgmaker/RMMV/'
OUT = 'public/sprites/arena/'
random.seed(77)

def sheet(p): return Image.open(p).convert('RGBA')
def interior(sh, bx, by):
    x, y = bx * 96 + 24, by * 144 + 72
    return sh.crop((x, y, x + T, y + T))
def recorte(sh, c0, r0, c1, r1): return sh.crop((c0 * T, r0 * T, c1 * T, r1 * T))
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
def faixa_suave(dst, tile, y0, y1, borda=22, alfa=255):
    m = Image.new('L', dst.size, 0); ImageDraw.Draw(m).rectangle((0, y0, dst.width, y1), fill=alfa)
    com_mascara(dst, tile, m, borda)
def tingir(im, tom, peso):
    tinta = Image.new('RGBA', im.size, tom + (0,))
    tinta.putalpha(ImageChops.multiply(im.getchannel('A'), Image.new('L', im.size, int(255 * peso))))
    return Image.alpha_composite(im, tinta)

# ── fontes ──────────────────────────────────────────────────────────────
a1 = sheet(JG + 'tf_jungle_a1.png')
a2 = sheet(JG + 'tf_jungle_a2.png')
a5 = sheet(JG + 'tf_jungle_a5.png')
b  = sheet(JG + 'tf_jungle_b.png')

grama    = interior(a2, 0, 0)              # grama de selva
terra    = interior(a2, 2, 0)              # terra batida (trilhas)
folhas   = recorte(a5, 0, 0, 1, 1)         # folhagem densa (manchas escuras)
paredao  = recorte(a5, 0, 5, 3, 9)         # 144x192 paredao de raizes/madeira
agua     = interior(a1, 0, 0)              # agua do riacho

arvore   = recorte(b, 8, 0, 13, 6)         # 240x288 arvore de copa larga
moita_g  = recorte(b, 5, 5, 7, 7)          # 96x96 moita grande
moita_p  = recorte(b, 5, 7, 7, 9)          # 96x96 moitas pequenas
pedras   = recorte(b, 0, 4, 2, 6)          # 96x96 pedras com musgo
pedra_g  = recorte(b, 3, 4, 5, 6)          # 96x96 pedra grande
flores   = [recorte(b, c, r, c + 1, r + 1) for c, r in [(0, 1), (1, 1), (3, 1), (0, 2), (1, 2), (3, 3), (4, 3), (6, 3)]]

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, grama, 0, 0, W, H)
for (cx, cy, rx, ry) in [(260, 400, 160, 80), (820, 130, 200, 60), (1050, 420, 140, 90), (560, 690, 180, 60)]:
    mancha(campo, folhas, cx, cy, rx, ry, alfa=160)
trilha = ImageEnhance.Brightness(terra).enhance(0.8)
faixa_suave(campo, trilha, int(H * .18), int(H * .18) + 110, borda=16, alfa=255)
faixa_suave(campo, trilha, int(H * .54), int(H * .54) + 120, borda=16, alfa=255)

# flores espalhadas (chao: pisa por cima)
for _ in range(38):
    f = random.choice(flores)
    x, y = random.randint(0, W - T), random.randint(90, 820)
    if int(H * .18) - 20 < y < int(H * .18) + 110 or int(H * .54) - 20 < y < int(H * .54) + 120:
        continue
    campo.alpha_composite(f, (x, y))

# riacho na borda de baixo (fino: a ultima fileira continua jogavel)
m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
pts = [(0, 872)] + [(x, 870 + random.randint(-6, 6)) for x in range(60, W, 60)] + [(W, 872), (W, H), (0, H)]
d.polygon(pts, fill=255)
com_mascara(campo, agua, m, blur=3)

# paredao da ravina no topo
for x in range(-20, W, paredao.width - 12):
    p = ImageEnhance.Brightness(paredao).enhance(0.75)
    campo.alpha_composite(p.crop((0, 60, p.width, p.height)), (x, -40 + random.randint(-8, 8)))

OBJETOS_ALTOS = [
    # base fora das trilhas (162-272 e 486-606)
    ('arvore', 330, 190), ('arvore', 1000, 200), ('arvore', 120, 580),
    ('moita_g', 620, 360), ('moita_g', 880, 650), ('moita_p', 240, 380), ('moita_p', 1140, 380),
    ('pedras', 470, 690), ('pedra_g', 760, 330), ('pedras', 1060, 690),
]
SPRITES = {'arvore': arvore, 'moita_g': moita_g, 'moita_p': moita_p, 'pedras': pedras, 'pedra_g': pedra_g}

for nome, x, y in OBJETOS_ALTOS:
    im = SPRITES[nome]; bb = im.getbbox() or (0, 0, im.width, im.height)
    w = bb[2] - bb[0]
    sx, sy = x + (bb[0] + bb[2]) / 2, y + bb[3] - 6
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((sx - w * 0.38, sy - 9, sx + w * 0.38, sy + 9), fill=(0, 0, 0, 110))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── luz de selva funda: sombra verde, luz filtrada ─────────────────────
def ravina(im, fator=0.62, tom=(10, 50, 35), peso=0.24):
    im = ImageEnhance.Brightness(im).enhance(fator)
    im = ImageEnhance.Color(im).enhance(0.9)
    return tingir(im, tom, peso)

campo = ravina(campo)

def brilho(dst, cx, cy, r, cor, a):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - r, cy - r, cx + r, cy + r), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(r * 0.45)))
# fachos de luz entrando pela copa
for (x, y) in [(200, 330), (700, 120), (980, 470), (450, 640)]:
    brilho(campo, x, y, 70, (255, 240, 170), 45)
# brasas verdes dos totens dos xamas
for (x, y) in [(90, 120), (560, 440), (1180, 150), (300, 800), (960, 800)]:
    brilho(campo, x, y, 30, (120, 255, 140), 80)

campo.save(OUT + 'bg_act7_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act7', exist_ok=True)
dims = {}
for nome, im in SPRITES.items():
    im = ravina(im); im.save(OUT + f'act7/{nome}.png'); dims[nome] = im.size
fundo = {nome: (im.getbbox() or (0, 0, 0, im.height))[3] for nome, im in SPRITES.items()}
linhas = [f"  {{ src: './sprites/arena/act7/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + fundo[n]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct7.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato7.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato VII (A Ravina dos Xamas). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = y + h.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT7_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: terra batida com folhagem ────────────────────────────────────
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, terra, 0, 0, 350 + T, H)
for (cx, cy, rx, ry) in [(80, 200, 90, 60), (280, 600, 80, 70), (150, 820, 120, 50)]:
    mancha(patio, grama, cx, cy, rx, ry, blur=20)
patio = ravina(patio, fator=0.7)
patio.save(OUT + 'bg_act7_courtyard.png')
print('patio:', patio.size)
