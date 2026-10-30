# ══════════════════════════════════════════════════════════════════════
# cenario-ato6.py — cenario do ATO VI (A Outra Margem): o outro lado da
# Fenda. Chao de Caos (ladrilho da Torre Final, tingido de violeta), a
# muralha de Grimhold REFLETIDA e fantasma no topo, o chao acabando num
# abismo estrelado embaixo (penhascos flutuantes) e estatuas de anjos
# caidos. Mesmo molde do cenario-ato5.py.
#
# Fontes (assets-pixel/tilesets): tf_final_tower (chao, estatuas, ossos,
# pedras), floatingclifftiles_addon_e1_3x (beira do abismo), tileD_castle
# (a muralha refletida).
#
# Elenco (LORE §8, ATOS_VI_X_ASSETS): cultistas, Hoste Caida (anjos),
# lanterna-fantasma, Lich; chefes O Coro / Irma de Cassiel / Serafim Caido.
#
# Saida: public/sprites/arena/bg_act6_field.png, bg_act6_courtyard.png,
#        act6/<obj>.png, components/data/arenaAct6.ts
# Uso:   python scripts/cenario-ato6.py
# ══════════════════════════════════════════════════════════════════════
import random, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops, ImageOps

T = 48
TILES = 'assets-pixel/tilesets/'
FT = TILES + 'tf_final_tower/RPGMaker_MVZ/Full_color/'
OUT = 'public/sprites/arena/'
random.seed(66)

def sheet(p): return Image.open(p).convert('RGBA')
def recorte(sh, c0, r0, c1, r1): return sh.crop((c0 * T, r0 * T, c1 * T, r1 * T))
def azulejar(dst, tile, x0, y0, x1, y1):
    for y in range(y0, y1, tile.height):
        for x in range(x0, x1, tile.width):
            dst.paste(tile, (x, y), tile)
def mancha(dst, tile, cx, cy, rx, ry, blur=26, alfa=255):
    W, H = dst.size
    cam = Image.new('RGBA', (W, H), (0, 0, 0, 0)); azulejar(cam, tile, 0, 0, W, H)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=alfa)
    cam.putalpha(m.filter(ImageFilter.GaussianBlur(blur))); dst.alpha_composite(cam)
def faixa_suave(dst, tile, y0, y1, borda=22, alfa=255):
    W, H = dst.size
    cam = Image.new('RGBA', (W, H), (0, 0, 0, 0)); azulejar(cam, tile, 0, 0, W, H)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).rectangle((0, y0, W, y1), fill=alfa)
    cam.putalpha(m.filter(ImageFilter.GaussianBlur(borda))); dst.alpha_composite(cam)
def tingir(im, tom, peso):
    tinta = Image.new('RGBA', im.size, tom + (0,))
    tinta.putalpha(ImageChops.multiply(im.getchannel('A'), Image.new('L', im.size, int(255 * peso))))
    return Image.alpha_composite(im, tinta)

# ── fontes ──────────────────────────────────────────────────────────────
a5a     = sheet(FT + 'tileA5a.png')
tb      = sheet(FT + 'tileB.png')
flut    = sheet(TILES + 'floatingclifftiles_addon_e1_3x.png')
castelo = sheet(TILES + 'tileD_castle.png')

chao      = recorte(a5a, 3, 0, 4, 1)     # placa lisa da Torre (chao do outro lado)
chao_var  = recorte(a5a, 2, 0, 3, 1)     # placa rebitada (manchas)
laje      = recorte(a5a, 1, 1, 2, 2)     # trama do Caos (trilhas de marcha)
laje_patio = recorte(a5a, 2, 0, 3, 1)    # placa rebitada (patio)
beira     = recorte(flut, 1, 5, 4, 8)    # 144x144: penhasco flutuante (a beira do chao sobre o abismo)

estatua   = recorte(tb, 12, 0, 14, 3)    # 96x144 anjo de asas abertas
estatua_b = recorte(tb, 14, 0, 16, 3)    # 96x144 anjo (variante)
vulto     = recorte(tb, 10, 0, 11, 3)    # 48x144 figura escura (sentinela)
ossos     = recorte(tb, 3, 9, 6, 10)     # 144x48 cranios e ossos
pedras    = recorte(tb, 0, 11, 3, 13)    # 144x96 pedras escuras

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, chao, 0, 0, W, H)
for (cx, cy, rx, ry) in [(260, 380, 180, 90), (780, 120, 200, 70), (1040, 420, 150, 100), (520, 660, 160, 60)]:
    mancha(campo, chao_var, cx, cy, rx, ry)
# trilhas mais escuras que o chao: contraste pra ler o caminho da marcha
trilha = ImageEnhance.Brightness(laje).enhance(0.7)
faixa_suave(campo, trilha, int(H * .18), int(H * .18) + 110, alfa=225)
faixa_suave(campo, trilha, int(H * .54), int(H * .54) + 120, alfa=225)

# abismo embaixo: o chao acaba numa beira de penhasco e abaixo so ha o vazio estrelado
ABISMO = 872   # so uma lasca na borda de baixo: a ultima fileira continua jogavel
vazio = Image.new('RGBA', (W, H - ABISMO + 40), (14, 6, 26, 255))
dv = ImageDraw.Draw(vazio)
for _ in range(160):
    x, y = random.randint(0, W), random.randint(0, vazio.height)
    c = random.choice([(200, 170, 255), (255, 255, 255), (150, 110, 220)])
    dv.point((x, y), fill=c + (random.randint(120, 255),))
campo.alpha_composite(vazio, (0, ABISMO - 40))
beira_esc = ImageEnhance.Brightness(beira).enhance(0.8)
for x in range(-40, W, beira.width - 24):
    campo.alpha_composite(beira_esc.crop((0, 0, beira.width, 60)), (x, ABISMO - 40 + random.randint(-4, 4)))

# a muralha de Grimhold refletida no topo: de cabeca pra baixo, violeta, meio transparente
muro = Image.new('RGBA', (96, 144), (0, 0, 0, 0))
muro.paste(castelo.crop((96, 288, 192, 384)), (0, 48))
muro.paste(castelo.crop((96, 0, 192, 48)), (0, 0))
reflexo = ImageOps.flip(muro)
reflexo = ImageEnhance.Brightness(reflexo).enhance(0.85)
reflexo = tingir(reflexo, (150, 80, 220), 0.45)
reflexo.putalpha(ImageChops.multiply(reflexo.getchannel('A'), Image.new('L', reflexo.size, 200)))
for x in range(0, W, muro.width):
    campo.alpha_composite(reflexo, (x, -20))

# ossos sao chao (decalque): se anda por cima, nao e objeto alto
for (x, y) in [(560, 440), (860, 700), (330, 780)]:
    campo.alpha_composite(ossos, (x, y))

# fendas de Caos no chao (linhas violeta com brilho)
for _ in range(7):
    x, y = random.randint(150, W - 200), random.randint(290, 470)
    pts = [(x, y)]
    for k in range(5):
        pts.append((pts[-1][0] + random.randint(20, 60), pts[-1][1] + random.randint(-18, 18)))
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(g).line(pts, fill=(170, 90, 255, 150), width=9)
    campo.alpha_composite(g.filter(ImageFilter.GaussianBlur(5)))
    l = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(l).line(pts, fill=(235, 210, 255, 255), width=2)
    campo.alpha_composite(l)

OBJETOS_ALTOS = [
    # base fora das trilhas (162-272 e 486-606)
    ('estatua', 380, 330), ('estatua_b', 980, 330), ('estatua', 150, 640),
    ('vulto', 260, 330), ('vulto', 1170, 640), ('vulto', 700, 650),
    ('pedras', 820, 330), ('pedras', 1060, 40), ('pedras', 430, 660),
]
SPRITES = {'estatua': estatua, 'estatua_b': estatua_b, 'vulto': vulto, 'pedras': pedras}

for nome, x, y in OBJETOS_ALTOS:
    w, h = SPRITES[nome].size
    sx, sy = x + w * 0.5, y + h - 8
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((sx - w * 0.42, sy - max(7, h * 0.07), sx + w * 0.42, sy + max(7, h * 0.07)), fill=(0, 0, 0, 120))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── luz do outro lado: fria, violeta ────────────────────────────────────
def outra_margem(im, fator=0.62, tom=(120, 60, 200), peso=0.22):
    im = ImageEnhance.Brightness(im).enhance(fator)
    im = ImageEnhance.Color(im).enhance(0.55)
    return tingir(im, tom, peso)

campo = outra_margem(campo)

# ── luz propria (depois do filtro: brilha por cima da penumbra) ─────────
def brilho(dst, cx, cy, r, cor, a):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - r, cy - r, cx + r, cy + r), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(r * 0.45)))

# o rasgo da Fenda no fundo a direita, de onde a Hoste sai
RX, RY0, RY1 = 1150, 150, 520
brilho(campo, RX, (RY0 + RY1) // 2, 230, (140, 60, 255), 110)
pts_e, pts_d = [], []
for i, y in enumerate(range(RY0, RY1 + 1, 18)):
    t = (y - RY0) / (RY1 - RY0)
    larg = 34 * (1 - abs(t - 0.5) * 2) ** 0.7 + 3
    zz = random.randint(-9, 9)
    pts_e.append((RX - larg + zz, y)); pts_d.append((RX + larg + zz, y))
rasgo = Image.new('RGBA', campo.size, (0, 0, 0, 0))
dr = ImageDraw.Draw(rasgo)
dr.polygon(pts_e + pts_d[::-1], fill=(190, 120, 255, 255))
campo.alpha_composite(rasgo.filter(ImageFilter.GaussianBlur(6)))
miolo = Image.new('RGBA', campo.size, (0, 0, 0, 0))
ImageDraw.Draw(miolo).polygon([(x + (RX - x) * 0.55, y) for x, y in pts_e] + [(x - (x - RX) * 0.55, y) for x, y in pts_d[::-1]], fill=(250, 240, 255, 255))
campo.alpha_composite(miolo.filter(ImageFilter.GaussianBlur(2)))
for _ in range(40):   # fagulhas saindo do rasgo
    x, y = RX + random.randint(-120, 40), random.randint(RY0 - 40, RY1 + 40)
    ImageDraw.Draw(campo).point((x, y), fill=(230, 200, 255, random.randint(140, 255)))

# velas dos cultistas: pontos de luz quente no chao frio
for (x, y) in [(120, 90), (470, 300), (300, 520), (690, 360), (900, 150), (560, 800), (1010, 620), (220, 830)]:
    brilho(campo, x, y, 34, (255, 170, 90), 70)
    ImageDraw.Draw(campo).rectangle((x - 1, y - 4, x + 1, y + 2), fill=(240, 230, 210, 255))
    ImageDraw.Draw(campo).point((x, y - 6), fill=(255, 220, 120, 255))
campo.save(OUT + 'bg_act6_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act6', exist_ok=True)
dims = {}
for nome, im in SPRITES.items():
    im = outra_margem(im); im.save(OUT + f'act6/{nome}.png'); dims[nome] = im.size
fundo = {nome: (im.getbbox() or (0, 0, 0, im.height))[3] for nome, im in SPRITES.items()}
linhas = [f"  {{ src: './sprites/arena/act6/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + fundo[n]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct6.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato6.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato VI (A Outra Margem). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = y + h.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT6_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: laje metalica escura ────────────────────────────────────────
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, laje_patio, 0, 0, 350 + T, H)
for (cx, cy, rx, ry) in [(80, 200, 90, 60), (280, 600, 80, 70)]:
    mancha(patio, chao_var, cx, cy, rx, ry, blur=20)
patio = outra_margem(patio, fator=0.55)
patio.save(OUT + 'bg_act6_courtyard.png')
print('patio:', patio.size)
