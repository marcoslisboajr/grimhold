# ══════════════════════════════════════════════════════════════════════
# cenario-ato2.py — cenario do ATO II (Floresta Amaldicoada), versao 2.
#
# Refeito no molde dos cenarios recentes (cenario-ato9/10.py, ato1/5 v2):
# estruturas MONTADAS pela grade das folhas. Tema mantido: floresta de noite,
# verdete, com o PANTANO no canto de baixo (de onde saem deeplings e a
# Hidra). No topo, a PAREDE DE TRONCOS da mata fechada (recorte continuo do
# tileB_forest), com raizes e escuridao entre os troncos. No chao: mata
# escura com musgo, as duas trilhas de terra com margem ondulada e raizes
# atravessando, folhas caidas, pedrinhas, cogumelos; o pantano com borda de
# lodo, junco e reflexo; fogos-fatuos. Objetos altos (arvores mortas,
# troncos com rosto e ocos, pedras musgosas, lapides amaldicoadas, um
# obelisco, cogumelos gigantes, tronco caido) vao em OBJETOS_ALTOS.
#
# Fontes: Time Fantasy "Fairy Forest" (tf_fairyforest/.../3x_MV: tileA2,
# tileB_trees, tileB_forest, tileB_stone, tileB_mushroomvillage) e
# tileA2_dungeon (laje do patio).
#
# Geometria do jogo intacta: campo 1250x900, patio 350x900, inimigos em
# y 150-670; a parede de troncos fica acima de y=150.
#
# Saida: public/sprites/arena/bg_act2_field.png, bg_act2_courtyard.png,
#        act2/<obj>.png, components/data/arenaAct2.ts
# Uso:   python scripts/cenario-ato2.py   (ASSETS=<pasta>, PREVIA=<png>)
# ══════════════════════════════════════════════════════════════════════
import random, math, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
AS = os.environ.get('ASSETS', 'assets-pixel')
FF = AS + '/tilesets/tf_fairyforest/tf_fairyforest_12.28.20/3x_MV/'
TILES = AS + '/tilesets/'
OUT = 'public/sprites/arena/'
PREVIA = os.environ.get('PREVIA')
random.seed(11)

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
def brilho(dst, cx, cy, rx, ry, cor, a, blur):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(blur)))
FUNDO_TEAL = (41, 60, 66)   # fundo opaco que o Fairy Forest usa atras de objetos
def sem_fundo(im, tol=10):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and abs(r - FUNDO_TEAL[0]) + abs(g - FUNDO_TEAL[1]) + abs(b - FUNDO_TEAL[2]) <= tol:
                px[x, y] = (0, 0, 0, 0)
    return im

# ── fontes ──────────────────────────────────────────────────────────────
a2      = sheet(FF + 'tf_ff_tileA2.png')
arvores = sheet(FF + 'tf_ff_tileB_trees.png')
mata    = sheet(FF + 'tf_ff_tileB_forest.png')
pedras  = sheet(FF + 'tf_ff_tileB_stone.png')
cogu    = sheet(FF + 'tf_ff_tileB_mushroomvillage.png')
dung    = sheet(TILES + 'tileA2_dungeon.png')

chao    = interior(a2, 2, 0)   # chao de mata escuro
chao2   = interior(a2, 0, 0)   # grama escura
musgo   = interior(a2, 1, 1)   # grama mais clara (clareiras)
lama    = interior(a2, 3, 1)   # terra avermelhada (trilhas)
agua    = interior(a2, 4, 0)   # agua escura parada (pantano)
lodo    = interior(a2, 5, 1)   # verde-oliva (borda do pantano)

# objetos altos
arvore_morta = recortar(sem_fundo(recorte(arvores, 0, 0, 4, 6)))
tronco_cara  = recortar(sem_fundo(recorte(arvores, 14, 10, 16, 13)))
tronco_oco   = recortar(sem_fundo(recorte(arvores, 4, 7, 6, 10)))
arvore_seca  = recortar(sem_fundo(recorte(arvores, 0, 12, 3, 16)))       # arvore seca de galhos abertos
pedra_musgo  = recortar(recorte(pedras, 10, 1, 12, 3))
pedra_musgo2 = recortar(recorte(pedras, 12, 1, 14, 3))
lapide_g     = recortar(recorte(pedras, 5, 10, 8, 12))                    # lapide grande amaldicoada
lapides      = recortar(recorte(pedras, 0, 9, 3, 11))
obelisco     = recortar(pedras.crop((384, 144, 480, 330)))   # sem o chevron solto de baixo
cogumelo_g   = recortar(recorte(cogu, 6, 6, 8, 8))                        # cogumelo vermelho gigante
cogumelo_m   = recortar(recorte(cogu, 4, 6, 6, 8))
tronco_caido = recortar(recorte(cogu, 0, 11, 3, 12))
# miudos de chao (decalque: pisa por cima)
seixos  = [recortar(recorte(pedras, c, r, c + 1, r + 1)) for r in (0, 1) for c in range(8)]
seixos  = [s for s in seixos if s.width > 4]
folhas  = [recortar(recorte(pedras, c, r, c + 1, r + 1)) for c in (0, 1) for r in (6, 7, 8)]
fungos  = [recortar(recorte(cogu, c, r, c + 1, r + 1)) for r, cs in [(3, range(0, 7)), (4, range(0, 3)), (5, (0, 1, 2, 3, 7))] for c in cs]
fungos  = [f for f in fungos if f.width > 4]
galhos  = [recortar(sem_fundo(recorte(arvores, 0, 0, 1, 2))), recortar(sem_fundo(recorte(arvores, 1, 0, 2, 2)))]
galhos  = [g.rotate(90, expand=True) for g in galhos]
# parede de troncos (tileB_forest cols 9-14 x rows 0-2) e copa da borda de baixo
troncos = mata.crop((432, 0, 720, 144))
copa    = sem_fundo(recorte(mata, 3, 0, 8, 4))

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
MURO = 140
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, chao, 0, 0, W, H)
for (cx, cy, rx, ry) in [(260, 660, 150, 80), (700, 380, 170, 60), (1000, 420, 130, 70), (480, 430, 120, 50), (150, 330, 90, 40)]:
    mancha(campo, chao2, cx, cy, rx, ry, blur=24, alfa=220)
for (cx, cy, rx, ry) in [(620, 700, 140, 60), (330, 400, 90, 36), (1150, 330, 80, 40)]:
    mancha(campo, musgo, cx, cy, rx, ry, blur=26, alfa=110)

# trilhas de terra (mesmas alturas: 18% e 54%) com margem ondulada
TRILHAS = [(int(H * .18), 110), (int(H * .54), 120)]
for y0, alt in TRILHAS:
    m = Image.new('L', (W, H), 0)
    topo = [(x, y0 + 12 * math.sin(x / 130.0 + y0) + random.randint(-4, 4)) for x in range(-20, W + 40, 20)]
    base = [(x, y0 + alt + 12 * math.sin(x / 160.0 + y0 * .7) + random.randint(-4, 4)) for x in range(W + 40, -40, -20)]
    ImageDraw.Draw(m).polygon(topo + base, fill=255)
    com_mascara(campo, lama, m, blur=10)
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(s)   # sulco central pisado
    ds.line([(x, y0 + alt / 2 + 6 * math.sin(x / 110.0)) for x in range(-10, W + 20, 10)], fill=(30, 14, 12, 70), width=18)
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(8)))

# raizes atravessando as trilhas (linhas marrons com luz em cima)
def raiz(x, y, passos, ang):
    pts = [(x, y)]
    for _ in range(passos):
        ang += random.uniform(-.4, .4); x += math.cos(ang) * 16; y += math.sin(ang) * 16; pts.append((x, y))
    d = ImageDraw.Draw(campo)
    d.line([(px, py + 3) for px, py in pts], fill=(14, 10, 8, 200), width=8)
    d.line(pts, fill=(96, 62, 48, 255), width=6); d.line([(px, py - 1) for px, py in pts], fill=(150, 102, 72, 255), width=1)
for y0, alt in TRILHAS:
    for _ in range(4):
        x = random.randint(40, W - 80)
        raiz(x, y0 - 6 + random.choice((0, alt + 6)), random.randint(2, 4), math.pi / 2 * random.choice((1, -1)) + random.uniform(-.6, .6))

# pantano: contorno irregular, lodo na margem, agua escura, reflexo da lua
PX, PY, PRX, PRY = 1030, 810, 300, 120
pts = [(PX + math.cos(t) * PRX * random.uniform(.92, 1.08), PY + math.sin(t) * PRY * random.uniform(.88, 1.1)) for t in [i * math.pi / 18 for i in range(36)]]
m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon([(x + (x - PX) * .12, y + (y - PY) * .2) for x, y in pts], fill=255)
com_mascara(campo, lodo, m, blur=10)
m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(pts, fill=255)
com_mascara(campo, agua, m, blur=3)
ImageDraw.Draw(campo).line([p for p in pts if p[1] < PY] , fill=(20, 30, 28, 220), width=3)   # beirada sombreada
for k in range(5):   # reflexo da lua: tracos claros horizontais
    y = PY - 20 + k * 12; x = PX + 60 + random.randint(-20, 20)
    ImageDraw.Draw(campo).line((x, y, x + random.randint(20, 60), y), fill=(170, 210, 190, 110), width=2)
for _ in range(14):   # junco na margem (galhinhos verdes)
    a = random.uniform(math.pi, 2 * math.pi); x, y = PX + math.cos(a) * PRX * 1.02, PY + math.sin(a) * PRY * 1.02
    for j in range(3):
        ImageDraw.Draw(campo).line((x + j * 3, y, x + j * 3 + random.randint(-3, 3), y - random.randint(10, 20)), fill=(70, 110, 60, 255), width=2)

OBJETOS_ALTOS = [
    # base fora das trilhas (162-272 e 486-606) e do pantano
    ('arvore_morta', 420, 170), ('arvore_morta', 900, 170), ('arvore_seca', 620, 610),
    ('tronco_cara', 250, 320), ('tronco_cara', 1140, 320), ('tronco_oco', 780, 640), ('tronco_oco', 130, 650),
    ('pedra_musgo', 560, 380), ('pedra_musgo2', 1010, 380), ('pedra_musgo', 40, 280), ('pedra_musgo2', 470, 780),
    ('lapide_g', 330, 740), ('lapides', 760, 330), ('obelisco', 20, 650 - 20),
    ('cogumelo_g', 1180, 620), ('cogumelo_m', 380, 380), ('cogumelo_m', 1060, 290),
    ('tronco_caido', 820, 800 - 30),
]
SPRITES = {'arvore_morta': arvore_morta, 'arvore_seca': arvore_seca, 'tronco_cara': tronco_cara, 'tronco_oco': tronco_oco,
           'pedra_musgo': pedra_musgo, 'pedra_musgo2': pedra_musgo2, 'lapide_g': lapide_g, 'lapides': lapides,
           'obelisco': obelisco, 'cogumelo_g': cogumelo_g, 'cogumelo_m': cogumelo_m, 'tronco_caido': tronco_caido}

def ocupado(cx, cy, folga=6):
    for nome, ox, oy in OBJETOS_ALTOS:
        im = SPRITES[nome]
        if ox - folga < cx < ox + im.width + folga and oy - folga < cy < oy + im.height + folga:
            return True
    return (cx - PX) ** 2 / (PRX * 1.1) ** 2 + (cy - PY) ** 2 / (PRY * 1.2) ** 2 < 1
def em_trilha(y): return any(y0 - 14 < y < y0 + alt + 14 for y0, alt in TRILHAS)
for _ in range(90):
    e = random.choice(folhas + seixos); x, y = random.randint(0, W - e.width), random.randint(MURO, H - e.height)
    if not ocupado(x + e.width / 2, y + e.height / 2): campo.alpha_composite(e, (x, y))
for _ in range(45):
    e = random.choice(fungos + galhos); x, y = random.randint(0, W - e.width), random.randint(MURO, H - e.height)
    if not em_trilha(y + e.height) and not ocupado(x + e.width / 2, y + e.height / 2): campo.alpha_composite(e, (x, y))

# ── a PAREDE DE TRONCOS no topo, com a escuridao da mata por cima ──────
for x in range(-60, W, troncos.width):
    campo.alpha_composite(troncos, (x, MURO - troncos.height))
esc = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(esc)
for y in range(0, 70):
    d.line((0, y, W, y), fill=(6, 12, 10, int(230 * (1 - y / 70))))
campo.alpha_composite(esc)
for x in range(0, W, 36):   # raizes e moitas no pe dos troncos
    if random.random() < .5:
        e = random.choice(fungos + folhas); campo.alpha_composite(e, (x, MURO - e.height // 2 + 6))
sp = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sp).rectangle((0, MURO - 4, W, MURO + 20), fill=(0, 0, 0, 140))
campo.alpha_composite(sp.filter(ImageFilter.GaussianBlur(8)))
for x in range(-80, W, copa.width - 30):   # copas saindo pela borda de baixo
    campo.alpha_composite(copa, (x, H - 70 + random.randint(-10, 10)))

for nome, x, y in OBJETOS_ALTOS:   # sombras (noite: fracas)
    im = SPRITES[nome]; w, h = im.size
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((x + w * .1, y + h - 12, x + w * .9, y + h + 4), fill=(0, 0, 0, 120))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── noite verdete ───────────────────────────────────────────────────────
def anoitecer(im, fator=0.62, tom=(90, 170, 130), peso=0.14):
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(im).enhance(fator); im.putalpha(a)
    im = ImageEnhance.Color(im).enhance(0.8)
    return tingir(im, tom, peso)
campo = anoitecer(campo)
# nevoa verde rasteira (mais densa perto do pantano) e fogos-fatuos
nv = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(nv)
for _ in range(16):
    x, y = random.randint(-100, W), random.randint(MURO, H)
    d.ellipse((x, y, x + random.randint(180, 380), y + random.randint(30, 60)), fill=(140, 200, 160, random.randint(14, 28)))
d.ellipse((PX - 380, PY - 170, PX + 380, PY + 170), fill=(140, 200, 160, 40))
campo.alpha_composite(nv.filter(ImageFilter.GaussianBlur(30)))
for _ in range(22):
    x, y = random.randint(20, W - 20), random.randint(MURO + 20, H - 40)
    brilho(campo, x, y, 14, 14, (150, 255, 170), 70, 6)
    ImageDraw.Draw(campo).point((x, y), fill=(230, 255, 230, 255))
vin = Image.new('L', (W, H), 0); ImageDraw.Draw(vin).rectangle((0, 0, W, H), fill=110)
ImageDraw.Draw(vin).ellipse((-180, -40, W + 180, H + 200), fill=0)
v = Image.new('RGBA', (W, H), (2, 8, 6, 255)); v.putalpha(vin.filter(ImageFilter.GaussianBlur(90)))
campo.alpha_composite(v)
campo.save(OUT + 'bg_act2_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act2', exist_ok=True)
for f in os.listdir(OUT + 'act2'):
    if f.endswith('.png') and f[:-4] not in SPRITES:
        os.remove(OUT + 'act2/' + f)
dims = {}
for nome, im in SPRITES.items():
    im = anoitecer(im); im.save(OUT + f'act2/{nome}.png'); dims[nome] = im.size
fundo = {nome: (im.getbbox() or (0, 0, 0, im.height))[3] for nome, im in SPRITES.items()}
linhas = [f"  {{ src: './sprites/arena/act2/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + fundo[n]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct2.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato2.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato II (Floresta Amaldicoada). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = base.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT2_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: laje de pedra tomada de musgo, folhas caidas ────────────────
laje = interior(dung, 3, 0)
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, laje, 0, 0, 350 + T, H)
for (cx, cy, rx, ry) in [(60, 120, 90, 60), (300, 500, 70, 60), (120, 820, 100, 50), (340, 200, 40, 80)]:
    mancha(patio, chao2, cx, cy, rx, ry, blur=18, alfa=190)
for _ in range(30):
    e = random.choice(folhas); patio.alpha_composite(e, (random.randint(0, 350 - e.width), random.randint(0, H - e.height)))
patio = anoitecer(patio, fator=0.55)
patio.save(OUT + 'bg_act2_courtyard.png')
print('patio:', patio.size)

if PREVIA:
    prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
    prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
    for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + fundo[o[0]]):
        prev.alpha_composite(anoitecer(SPRITES[nome]), (350 + x, y))
    prev.convert('RGB').save(PREVIA)
