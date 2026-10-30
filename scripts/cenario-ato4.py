# ══════════════════════════════════════════════════════════════════════
# cenario-ato4.py — cenario do ATO IV (O Abismo), versao 2.
#
# Refeito no molde dos cenarios recentes (cenario-ato9/10.py, ato1/5 v2).
# Tema mantido: laje de pedra rachada suspensa no vazio, muralha gotica no
# topo com gargulas, cristais do vazio e plantas corrompidas. Diferente do
# Ato X (mesma folha, outro lugar): aqui a muralha e uma ARCADA — tijolo e
# arcos abertos que mostram o vazio estrelado atras —, a luz e ciano-fria,
# e embaixo o chao ACABA: uma beirada de rocha (face de penhasco montada
# pela folha) caindo no campo de estrelas, com ilhotas soltas flutuando.
# No chao: laje em mosaico, trilhas de pedra azulada, fendas abertas para
# o vazio, pocas, entulho e plantas. Objetos altos (gargulas, estatua da
# lua, cristais, rochas e cristais flutuantes, pedregulhos) em
# OBJETOS_ALTOS, com profundidade.
#
# Fontes: Time Fantasy "Dark Dimension" (assets-pixel/tilesets/
# tf_darkdimension/RMMV: tf_dd_A5_3, tf_dd_B_3, !$floatingrocks_3) e
# tileA2_dungeon (laje do patio).
#
# Geometria do jogo intacta: campo 1250x900, patio 350x900, inimigos em
# y 150-670; a arcada fica acima de y=150 e a beirada abaixo de y=740.
#
# Saida: public/sprites/arena/bg_act4_field.png, bg_act4_courtyard.png,
#        act4/<obj>.png, components/data/arenaAct4.ts
# Uso:   python scripts/cenario-ato4.py   (ASSETS=<pasta>, PREVIA=<png>)
# ══════════════════════════════════════════════════════════════════════
import random, math, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
AS = os.environ.get('ASSETS', 'assets-pixel')
DD = AS + '/tilesets/tf_darkdimension/RMMV/'
TILES = AS + '/tilesets/'
OUT = 'public/sprites/arena/'
PREVIA = os.environ.get('PREVIA')
random.seed(41)

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
def recortar(im): return im.crop(im.getbbox())
def tingir(im, tom, peso):
    tinta = Image.new('RGBA', im.size, tom + (0,))
    tinta.putalpha(ImageChops.multiply(im.getchannel('A'), Image.new('L', im.size, int(255 * peso))))
    return Image.alpha_composite(im, tinta)
def escurecer(im, f):
    a = im.getchannel('A'); im = ImageEnhance.Brightness(im).enhance(f); im.putalpha(a)
    return im
def brilho(dst, cx, cy, rx, ry, cor, a, blur):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(blur)))

# ── fontes ──────────────────────────────────────────────────────────────
a5 = sheet(DD + 'tf_dd_A5_3.png')
b  = sheet(DD + 'tf_dd_B_3.png')
fr = sheet(DD + '!$floatingrocks_3.png')
dung = sheet(TILES + 'tileA2_dungeon.png')

laje       = recorte(a5, 1, 2, 2, 3)            # laje cinza rachada
laje2      = recorte(a5, 1, 4, 2, 5)
pedra_azul = recorte(a5, 4, 2, 5, 3)            # pedra azulada (trilhas)
estrelas   = a5.crop((0, 432, 384, 624))        # 384x192 o vazio estrelado
face       = a5.crop((192, 240, 240, 336))      # 48x96 face de rocha do penhasco (coluna do meio)
agua       = a5.crop((48, 0, 96, 48))

# arcada: pano de tijolo e o arco grande (o vao escuro vira janela pro vazio)
tijolo = b.crop((48, 624, 96, 768))              # 48x144
arco   = b.crop((384, 624, 528, 768))            # 144x144
def vao_estrelado(im):
    """o preto-azulado de dentro do arco vira transparente: por tras fica o vazio"""
    im = im.copy(); px = im.load(); ref = px[im.width // 2, im.height // 2]
    for y in range(im.height):
        for x in range(im.width):
            r, g, bb, a = px[x, y]
            if a and abs(r - ref[0]) + abs(g - ref[1]) + abs(bb - ref[2]) <= 12 and 20 < x < im.width - 20 and y > 20:
                px[x, y] = (0, 0, 0, 0)
    return im
arco = vao_estrelado(arco)

gargula   = recortar(b.crop((384, 480, 528, 624)))
gargula_b = recortar(b.crop((528, 480, 672, 624)))
lua       = recortar(b.crop((672, 480, 768, 624)))
cristal   = recortar(b.crop((144, 144, 192, 240)))
cristais  = recortar(b.crop((288, 144, 384, 240)))
cristal_d = recortar(b.crop((192, 144, 288, 240)))
cristal_g = recortar(b.crop((48, 240, 96, 336)))
pedrao    = recortar(b.crop((144, 288, 240, 384)))
flut      = recortar(fr.crop((0, 0, 48, 144)))
flut_p    = recortar(fr.crop((0, 192, 48, 288)))
rocha_f   = recortar(fr.crop((0, 432, 48, 576)))
miudos = [recortar(b.crop((x, y, x + T, y + T))) for x, y in
          [(0, 48), (48, 48), (96, 48), (144, 48), (0, 96), (48, 96), (96, 96), (144, 96), (192, 96), (240, 96),
           (0, 192), (48, 192), (96, 192), (0, 240), (0, 288), (144, 240), (192, 240), (240, 240)]]
plantas = [recortar(b.crop(c)) for c in [(288, 48, 384, 96), (240, 96, 288, 144), (144, 96, 192, 144)]]

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
MURO = 140
BORDA = 770                                          # onde o chao acaba (fora de y 150-670)
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, estrelas, 0, 0, W, H)               # o vazio por baixo de tudo
chao = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for y in range(0, H, T):
    for x in range(0, W, T):
        chao.paste(laje if random.random() < .8 else laje2, (x, y))
for (cx, cy, rx, ry) in [(560, 640, 130, 55), (160, 330, 100, 40), (1150, 320, 90, 50)]:
    mancha(chao, agua, cx, cy, rx, ry, blur=10, alfa=150)
TRILHAS = [(int(H * .18), 110), (int(H * .54), 120)]
for y0, alt in TRILHAS:
    m = Image.new('L', (W, H), 0)
    topo = [(x, y0 + 10 * math.sin(x / 140.0 + y0) + random.randint(-3, 3)) for x in range(-20, W + 40, 20)]
    base = [(x, y0 + alt + 12 * math.sin(x / 170.0 + y0) + random.randint(-3, 3)) for x in range(W + 40, -40, -20)]
    ImageDraw.Draw(m).polygon(topo + base, fill=200)
    com_mascara(chao, pedra_azul, m, blur=10)
# a borda de baixo: contorno irregular; o que fica abaixo e vazio
contorno = [(x, BORDA + 26 * math.sin(x / 90.0) + random.randint(-14, 14)) for x in range(-20, W + 40, 30)]
m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(-20, MURO - 12), (W + 40, MURO - 12)] + contorno[::-1], fill=255)   # acima do pe da arcada e vazio: aparece pelos arcos
chao.putalpha(ImageChops.multiply(chao.getchannel('A'), m))
# face do penhasco: coluna de rocha abaixo da beirada, sumindo no escuro
faceim = Image.new('RGBA', (W, H), (0, 0, 0, 0))
for x, y in contorno:
    for dx in range(0, 30, 48):
        faceim.alpha_composite(face, (int(x), int(y) - 4))
fm = Image.new('L', (W, H), 0); d = ImageDraw.Draw(fm)
for yy in range(0, 110):
    d.line([(x, y + yy) for x, y in contorno], fill=int(255 * (1 - yy / 110) ** 1.3), width=1)
faceim.putalpha(ImageChops.multiply(faceim.getchannel('A'), fm))
campo.alpha_composite(faceim)
campo.alpha_composite(chao)
ImageDraw.Draw(campo).line(contorno, fill=(150, 170, 190, 200), width=2)   # beirada pega luz
# ilhotas soltas flutuando no vazio
for (cx, cy, rx) in [(160, 860, 50), (560, 875, 36), (980, 850, 60), (1200, 880, 30)]:
    pts = [(cx + math.cos(t) * rx * random.uniform(.8, 1.1), cy + math.sin(t) * rx * .35 * random.uniform(.8, 1.1)) for t in [i * math.pi / 8 for i in range(16)]]
    ImageDraw.Draw(campo).polygon([(x, y + 14) for x, y in pts], fill=(40, 34, 44, 255))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(pts, fill=255); com_mascara(campo, laje, m)

# fendas que mostram o vazio (borda lascada, sombra)
FENDAS = []
def fenda(x, y, passos, larg, ang):
    esq, dir_ = [], []
    for k in range(passos):
        ang += random.uniform(-0.5, 0.5)
        x += math.cos(ang) * random.randint(14, 26); y += math.sin(ang) * random.randint(8, 16)
        l = larg * math.sin(math.pi * (k + 0.5) / passos) + 1.5
        nx, ny = -math.sin(ang), math.cos(ang)
        esq.append((x + nx * l, y + ny * l)); dir_.append((x - nx * l, y - ny * l))
    poly = esq + dir_[::-1]
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).polygon([(px, py + 3) for px, py in poly], fill=(4, 4, 12, 220))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(3)))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(poly, fill=255); com_mascara(campo, estrelas, m)
    ImageDraw.Draw(campo).line(esq, fill=(150, 170, 190, 170), width=1)
    FENDAS.append(poly)
for (x, y, n, l, a) in [(260, 400, 10, 11, 0.1), (700, 360, 8, 9, -0.3), (960, 700, 10, 10, 0.2), (480, 720, 8, 8, -0.1),
                        (1080, 450, 6, 7, 1.0), (60, 640, 6, 6, 0.4), (820, 200, 5, 5, 0.2), (380, 170, 5, 5, 0.3)]:
    fenda(x, y, n, l, a)

OBJETOS_ALTOS = [
    ('gargula', 150, 290), ('gargula_b', 1060, 620), ('lua', 880, 280),
    ('cristal', 420, 300), ('cristal', 1180, 620), ('cristal_g', 620, 620), ('cristais', 40, 320),
    ('cristais', 760, 630), ('cristal_d', 250, 640), ('pedrao', 520, 360),
    ('flut', 1000, 330), ('flut_p', 650, 290), ('rocha_f', 340, 610), ('flut', 120, 180), ('rocha_f', 1180, 170),
]
SPRITES = {'gargula': gargula, 'gargula_b': gargula_b, 'lua': lua, 'cristal': cristal, 'cristal_g': cristal_g,
           'cristais': cristais, 'cristal_d': cristal_d, 'pedrao': pedrao, 'flut': flut, 'flut_p': flut_p, 'rocha_f': rocha_f}
FLUTUA = {'flut', 'flut_p', 'rocha_f'}

def ocupado(cx, cy, folga=6):
    for nome, ox, oy in OBJETOS_ALTOS:
        im = SPRITES[nome]
        if ox - folga < cx < ox + im.width + folga and oy - folga < cy < oy + im.height + folga:
            return True
    return cy > BORDA - 30
for _ in range(80):
    e = random.choice(miudos); x, y = random.randint(0, W - e.width), random.randint(MURO + 10, H - e.height)
    if not ocupado(x + e.width / 2, y + e.height): campo.alpha_composite(e, (x, y))
for _ in range(12):
    e = random.choice(plantas); x, y = random.randint(0, W - e.width), random.randint(MURO + 10, H - e.height)
    if not ocupado(x + e.width / 2, y + e.height) and not any(y0 - 20 < y + e.height < y0 + alt + 20 for y0, alt in TRILHAS):
        campo.alpha_composite(e, (x, y))

# ── a ARCADA no topo: tijolo e arcos abertos para o vazio ──────────────
mur = Image.new('RGBA', (W, 200), (0, 0, 0, 0))
x, k = -30, 0
ARCOS = []
while x < W:
    if k % 3 == 1:
        mur.alpha_composite(arco, (x, MURO - arco.height)); ARCOS.append(x); x += arco.width
    else:
        for _ in range(2):
            mur.alpha_composite(tijolo, (x, MURO - tijolo.height)); x += T
    k += 1
mur = escurecer(mur, 0.8)
campo.alpha_composite(mur, (0, 0))
sp = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sp).rectangle((0, MURO - 4, W, MURO + 20), fill=(0, 0, 8, 150))
campo.alpha_composite(sp.filter(ImageFilter.GaussianBlur(8)))
for x in range(0, W, 50):   # entulho no pe da arcada
    e = random.choice(miudos[:10]); campo.alpha_composite(e, (x + random.randint(-10, 10), MURO - e.height // 2 + 6))

for nome, x, y in OBJETOS_ALTOS:
    if nome in FLUTUA: continue
    im = SPRITES[nome]; w, h = im.size
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((x + w * .08, y + h - 12, x + w * .92, y + h + 5), fill=(0, 0, 10, 130))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── luz do Abismo: ciano-fria ──────────────────────────────────────────
def abismo(im, fator=0.62, tom=(40, 80, 130), peso=0.26):
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(im).enhance(fator); im.putalpha(a)
    im = ImageEnhance.Color(im).enhance(0.7)
    return tingir(im, tom, peso)
campo = abismo(campo)
for x in ARCOS:   # o vazio por tras dos arcos brilha
    brilho(campo, x + 72, MURO - 50, 50, 60, (90, 200, 255), 50, 18)
for poly in FENDAS:
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(g).line(poly + [poly[0]], fill=(90, 200, 255, 110), width=5)
    campo.alpha_composite(g.filter(ImageFilter.GaussianBlur(4)))
g = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(g).line(contorno, fill=(90, 190, 255, 120), width=10)
campo.alpha_composite(g.filter(ImageFilter.GaussianBlur(10)))
for nome, x, y in OBJETOS_ALTOS:
    w, h = SPRITES[nome].size
    if nome.startswith(('cristal', 'flut')):
        brilho(campo, x + w // 2, y + h - 10, 50, 24, (90, 220, 255), 70, 14)
    if nome == 'lua':
        brilho(campo, x + w // 2, y + 50, 60, 60, (200, 220, 255), 45, 20)
nv = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(nv)
for _ in range(14):
    x, y = random.randint(-100, W), random.randint(MURO + 40, H)
    d.ellipse((x, y, x + random.randint(180, 380), y + random.randint(30, 60)), fill=(80, 160, 220, random.randint(16, 30)))
campo.alpha_composite(nv.filter(ImageFilter.GaussianBlur(26)))
pe = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(pe)
for _ in range(300):
    d.point((random.randint(0, W), random.randint(0, H)), fill=random.choice([(200, 230, 255), (150, 230, 255)]) + (random.randint(90, 200),))
campo.alpha_composite(pe)
vin = Image.new('L', (W, H), 0); ImageDraw.Draw(vin).rectangle((0, 0, W, H), fill=110)
ImageDraw.Draw(vin).ellipse((-180, -40, W + 180, H + 160), fill=0)
v = Image.new('RGBA', (W, H), (2, 4, 14, 255)); v.putalpha(vin.filter(ImageFilter.GaussianBlur(90)))
campo.alpha_composite(v)
campo.save(OUT + 'bg_act4_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act4', exist_ok=True)
for f in os.listdir(OUT + 'act4'):
    if f.endswith('.png') and f[:-4] not in SPRITES:
        os.remove(OUT + 'act4/' + f)
dims = {}
for nome, im in SPRITES.items():
    im = abismo(im); im.save(OUT + f'act4/{nome}.png'); dims[nome] = im.size
fundo = {nome: (im.getbbox() or (0, 0, 0, im.height))[3] for nome, im in SPRITES.items()}
linhas = [f"  {{ src: './sprites/arena/act4/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + fundo[n]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct4.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato4.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato IV (O Abismo). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = base.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT4_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: laje escura com fissuras de luz fria ────────────────────────
lj = interior(dung, 3, 0)
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, lj, 0, 0, 350 + T, H)
for (cx, cy, rx, ry) in [(80, 240, 70, 26), (260, 640, 80, 28)]:
    mancha(patio, agua, cx, cy, rx, ry, blur=10, alfa=140)
for _ in range(14):
    e = random.choice(miudos[:10]); patio.alpha_composite(e, (random.randint(0, 350 - e.width), random.randint(0, H - e.height)))
RACHAS = []
for _ in range(5):
    x, y = random.randint(30, 320), random.randint(40, H - 60); pts = [(x, y)]
    for _ in range(5): pts.append((pts[-1][0] + random.randint(-16, 16), pts[-1][1] + random.randint(8, 18)))
    ImageDraw.Draw(patio).line(pts, fill=(6, 8, 16, 230), width=2); RACHAS.append(pts)
patio = abismo(patio, fator=0.5)
for pts in RACHAS:
    g = Image.new('RGBA', patio.size, (0, 0, 0, 0)); ImageDraw.Draw(g).line(pts, fill=(90, 200, 255, 120), width=4)
    patio.alpha_composite(g.filter(ImageFilter.GaussianBlur(3)))
patio.save(OUT + 'bg_act4_courtyard.png')
print('patio:', patio.size)

if PREVIA:
    prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
    prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
    for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + fundo[o[0]]):
        prev.alpha_composite(abismo(SPRITES[nome]), (350 + x, y))
    prev.convert('RGB').save(PREVIA)
