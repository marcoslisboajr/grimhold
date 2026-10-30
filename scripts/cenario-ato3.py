# ══════════════════════════════════════════════════════════════════════
# cenario-ato3.py — cenario do ATO III (Terras dos Gigantes), versao 2.
#
# Refeito no molde dos cenarios recentes (cenario-ato9/10.py, ato1/5 v2).
# Tema mantido: passagem de montanha fria — pedra cinza, neve, rochedos,
# cristais de gelo, a muralha de pedra no topo (pedido do Marcos: uma
# muralha, nao uma cadeia de rochedos) e a torre sombria dos dhampirs.
# A muralha agora e MONTADA como peca so (pano com janelas, torres
# redondas, portao, a torre alta a direita), com neve no pe e janelas
# acesas de luz fria. No chao: cascalho cinza em mosaico, neve acumulada
# em montes de contorno irregular, as duas trilhas de terra pisada com
# lama e pegadas GIGANTES, rachaduras de gelo. Objetos altos (pedregulhos
# arremessados, cristais de gelo, cranios e ossos de gigante, colunas
# partidas, a estatua de um guardiao) vao em OBJETOS_ALTOS.
#
# Fontes (assets-pixel/tilesets): tileA5_outsideb (cascalho cinza),
# tileA5_outsidea (terra), remastercliffs_B_3x
# (pedregulhos), rockcrystals_tf_3 (cristais), tileD_castle (muralha,
# torres, portao), tf_ruindungeons/48_RMMV tf_B_ruins1 (cranio, colunas,
# estatua, entulho), tf_fairyforest tileB_stone (seixos), tileA2_dungeon
# (laje do patio).
#
# Geometria do jogo intacta: campo 1250x900, patio 350x900, inimigos em
# y 150-670; a muralha fica acima de y=150.
#
# Saida: public/sprites/arena/bg_act3_field.png, bg_act3_courtyard.png,
#        act3/<obj>.png, components/data/arenaAct3.ts
# Uso:   python scripts/cenario-ato3.py   (ASSETS=<pasta>, PREVIA=<png>)
# ══════════════════════════════════════════════════════════════════════
import random, math, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
AS = os.environ.get('ASSETS', 'assets-pixel')
TILES = AS + '/tilesets/'
RU = TILES + 'tf_ruindungeons/48_RMMV/'
FF = TILES + 'tf_fairyforest/tf_fairyforest_12.28.20/3x_MV/'
OUT = 'public/sprites/arena/'
PREVIA = os.environ.get('PREVIA')
random.seed(31)

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
def recortar(im): return im.crop(im.getbbox())
def tingir(im, tom, peso):
    tinta = Image.new('RGBA', im.size, tom + (0,))
    tinta.putalpha(ImageChops.multiply(im.getchannel('A'), Image.new('L', im.size, int(255 * peso))))
    return Image.alpha_composite(im, tinta)
def escurecer(im, f, cor=0.6):
    a = im.getchannel('A'); im = ImageEnhance.Brightness(im).enhance(f); im = ImageEnhance.Color(im).enhance(cor); im.putalpha(a)
    return im
def pedra(im):   # peca colorida vira pedra fria
    return tingir(escurecer(im, 0.95, 0.15), (120, 140, 170), 0.12)
def brilho(dst, cx, cy, rx, ry, cor, a, blur):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(blur)))
def contorno(cx, cy, rx, ry, k=.15, n=30):
    return [(cx + math.cos(t) * rx * (1 + random.uniform(-k, k)), cy + math.sin(t) * ry * (1 + random.uniform(-k, k)))
            for t in [i * 2 * math.pi / n for i in range(n)]]

# ── fontes ──────────────────────────────────────────────────────────────
outb    = sheet(TILES + 'tileA5_outsideb.png')
outa    = sheet(TILES + 'tileA5_outsidea.png')
cliffB  = sheet(TILES + 'remastercliffs_B_3x.png')
cry     = sheet(TILES + 'rockcrystals_tf_3.png')
dung    = sheet(TILES + 'tileA2_dungeon.png')
castelo = sheet(TILES + 'tileD_castle.png')
rb1     = sheet(RU + 'tf_B_ruins1.png')
ffst    = sheet(FF + 'tf_ff_tileB_stone.png')

cascalho = [outb.crop((c * T, 6 * T, c * T + T, 7 * T)) for c in range(4)]   # 4 variacoes de cascalho cinza
terra    = outa.crop((0, 6 * T, T, 7 * T))                                  # terra batida
# neve: o gelo do tileA2_outside traz a grade do mapa e fica quadriculado;
# a neve e so um tom liso com granulado de pixel (claro e sombra)
neve = Image.new('RGBA', (T, T), (216, 226, 240, 255))
for _ in range(90):
    neve.putpixel((random.randrange(T), random.randrange(T)), random.choice([(240, 246, 255, 255), (196, 208, 228, 255)]))

pedregulho = recorte(cliffB, 8, 1, 11, 4)       # 144x144 pedregulho cinza (arremessado pelos gigantes)
cristal_az = recorte(cry, 4, 1, 6, 4)           # 96x144 cristais de gelo grandes
cristal_p  = recorte(cry, 1, 2, 3, 4)           # 96x96
cristal_c  = recorte(cry, 7, 5, 9, 7)           # 96x96 cristais cinza
cranio     = pedra(recortar(rb1.crop((0, 672, 96, 768))))     # cranio de gigante
coluna_q   = pedra(recortar(rb1.crop((336, 48, 384, 144))))   # coluna partida
estatua    = pedra(recortar(rb1.crop((30, 296, 112, 420))))   # guardiao de pedra
entulho    = [pedra(recortar(rb1.crop(c))) for c in [(192, 192, 240, 240), (0, 240, 48, 288)]]
seixos     = [recortar(recorte(ffst, c, r, c + 1, r + 1)) for r in (0, 1) for c in range(8)]
seixos     = [s for s in seixos if s.width > 4]

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
MURO = 140
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
for y in range(0, H, T):          # mosaico de cascalho (4 variacoes da mesma folha, sem costura)
    for x in range(0, W, T):
        campo.paste(random.choices(cascalho, weights=(5, 2, 2, 1))[0], (x, y))

TRILHAS = [(int(H * .18), 110), (int(H * .54), 120)]
for y0, alt in TRILHAS:           # trilhas de terra pisada, margem ondulada, lama escura no meio
    m = Image.new('L', (W, H), 0)
    topo = [(x, y0 + 10 * math.sin(x / 140.0 + y0) + random.randint(-3, 3)) for x in range(-20, W + 40, 20)]
    base = [(x, y0 + alt + 12 * math.sin(x / 170.0 + y0) + random.randint(-3, 3)) for x in range(W + 40, -40, -20)]
    ImageDraw.Draw(m).polygon(topo + base, fill=220)
    com_mascara(campo, terra, m, blur=10)
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(s)
    ds.line([(x, y0 + alt / 2 + 6 * math.sin(x / 100.0)) for x in range(-10, W + 20, 10)], fill=(40, 30, 26, 80), width=26)
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(10)))
    for k, x in enumerate(range(random.randint(0, 80), W, 150)):   # pegadas de gigante (pe de 3 dedos)
        py = y0 + alt * (.3 if k % 2 else .65)
        p = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dp = ImageDraw.Draw(p)
        dp.ellipse((x, py - 9, x + 30, py + 9), fill=(30, 22, 20, 120))
        for dy in (-10, 0, 10): dp.ellipse((x - 12, py + dy - 4, x + 2, py + dy + 4), fill=(30, 22, 20, 120))
        campo.alpha_composite(p.filter(ImageFilter.GaussianBlur(1.5)))

# montes de neve: contorno irregular, borda de baixo sombreada
MONTES = [(200, 390, 150, 50), (620, 730, 190, 60), (1020, 410, 130, 50), (860, 330, 90, 30), (1100, 800, 190, 70),
          (120, 800, 160, 60), (430, 620, 80, 22), (1200, 150, 120, 50), (60, 150, 100, 40)]
for cx, cy, rx, ry in MONTES:
    pts = contorno(cx, cy, rx, ry)
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(s).polygon([(x, y + 5) for x, y in pts], fill=(40, 50, 70, 120))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(4)))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(pts, fill=255)
    com_mascara(campo, neve, m, blur=3)
    ImageDraw.Draw(campo).line([p for p in pts if p[1] < cy], fill=(255, 255, 255, 120), width=1)
# rachaduras de gelo finas
for _ in range(12):
    x, y = random.randint(0, W), random.randint(MURO + 20, H - 40); pts = [(x, y)]
    for _ in range(5): pts.append((pts[-1][0] + random.randint(8, 24), pts[-1][1] + random.randint(-10, 10)))
    ImageDraw.Draw(campo).line(pts, fill=(30, 36, 50, 200), width=1)
    ImageDraw.Draw(campo).line([(a, b + 1) for a, b in pts], fill=(200, 220, 240, 90), width=1)

OBJETOS_ALTOS = [
    # base fora das trilhas (162-272 e 486-606)
    ('pedregulho', 380, 320), ('pedregulho', 1000, 620), ('cranio', 180, 650),
    ('cristal_az', 560, 320), ('cristal_az', 1180, 280), ('cristal_az', 820, 610),
    ('cristal_p', 240, 360), ('cristal_p', 1050, 330), ('cristal_c', 640, 680), ('cristal_c', 40, 290),
    ('cranio', 420, 690), ('cranio', 900, 300), ('coluna_q', 120, 170), ('coluna_q', 1120, 700),
    ('estatua', 760, 150),
]
SPRITES = {'pedregulho': pedregulho, 'cristal_az': cristal_az, 'cristal_p': cristal_p,
           'cristal_c': cristal_c, 'cranio': cranio, 'coluna_q': coluna_q, 'estatua': estatua}

def ocupado(cx, cy, folga=6):
    for nome, ox, oy in OBJETOS_ALTOS:
        im = SPRITES[nome]
        if ox - folga < cx < ox + im.width + folga and oy - folga < cy < oy + im.height + folga:
            return True
    return False
for _ in range(110):
    e = random.choice(seixos + entulho); x, y = random.randint(0, W - e.width), random.randint(MURO, H - e.height)
    if not ocupado(x + e.width / 2, y + e.height / 2): campo.alpha_composite(e, (x, y))

# ── a MURALHA no topo: uma peca so (tileD_castle) ──────────────────────
PE = MURO + 4
mur = Image.new('RGBA', (W, 300), (0, 0, 0, 0))
pano_j = castelo.crop((0, 384, 240, 528))              # 240x144 pano com janelas
portao = castelo.crop((240, 384, 384, 576))            # 144x192 portao
torre  = castelo.crop((0, 144, 96, 348))               # 96x204 duas torres redondas
torre_alta = castelo.crop((0, 0, 192, 348))            # a torre sombria dos dhampirs (com ameias)
for x in range(-60, W, pano_j.width):
    mur.alpha_composite(pano_j, (x, PE - pano_j.height))
GX = 300
TORRES = [GX - 96, GX + 144, 700]
mur.alpha_composite(portao, (GX, PE + 30 - portao.height))
for tx in TORRES:
    mur.alpha_composite(torre, (tx, PE + 8 - torre.height))
TX = W - 250
mur.alpha_composite(torre_alta, (TX, PE + 10 - torre_alta.height))
# neve nos frisos e escorrida de gelo
nv = Image.new('RGBA', mur.size, (0, 0, 0, 0)); dn = ImageDraw.Draw(nv)
for x in range(0, W, 3):
    for yf in (PE - 144 + 4, PE - 96 + 2, PE - 46):
        dn.line((x, yf, x, yf + random.randint(1, 4)), fill=(235, 242, 255, 230))
for _ in range(40):   # pingentes de gelo
    x = random.randint(0, W); y = PE - random.choice((140, 92, 42))
    dn.line((x, y, x, y + random.randint(4, 12)), fill=(200, 225, 255, 220), width=1)
nv.putalpha(ImageChops.multiply(nv.getchannel('A'), mur.getchannel('A')))
mur.alpha_composite(nv)
mur = escurecer(mur, 0.7, 0.5)
sp = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ImageDraw.Draw(sp).rectangle((0, MURO - 6, W, MURO + 24), fill=(10, 14, 26, 170))
campo.alpha_composite(sp.filter(ImageFilter.GaussianBlur(10)))
campo.alpha_composite(mur, (0, 0))
for x in range(-40, W, 70):   # neve acumulada no pe da muralha
    if GX - 10 < x < GX + 140: continue
    pts = contorno(x + 35, MURO + 4, random.randint(30, 50), random.randint(8, 14), .2, 14)
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(pts, fill=255)
    com_mascara(campo, neve, m, blur=2)

for nome, x, y in OBJETOS_ALTOS:   # sombras frias e longas, sol baixo vindo da esquerda
    im = SPRITES[nome]; w, h = im.size
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((x + w * .3, y + h - 12, x + w * 1.2, y + h + 6), fill=(10, 16, 40, 130))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── frio: escuro, azulado ───────────────────────────────────────────────
def anoitecer(im, fator=0.62, tom=(120, 150, 210), peso=0.18):
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(im).enhance(fator); im.putalpha(a)
    im = ImageEnhance.Color(im).enhance(0.6)
    return tingir(im, tom, peso)
campo = anoitecer(campo)
for x in range(-60, W, pano_j.width):   # janelas acesas de luz fria (algumas)
    for dx in (24, 72, 120, 168, 216):
        wx = x + dx
        if any(tx - 4 < wx < tx + 100 for tx in TORRES) or GX - 4 < wx < GX + 148 or wx > TX - 10: continue
        if random.random() < .45:
            brilho(campo, wx, PE - 144 + 84, 9, 14, (170, 210, 255), 150, 4)
brilho(campo, TX + 96, 60, 40, 60, (140, 90, 220), 60, 20)       # a torre dos dhampirs: luz violeta
for nome, x, y in OBJETOS_ALTOS:
    if nome.startswith('cristal'):
        w, h = SPRITES[nome].size; brilho(campo, x + w // 2, y + h - 14, 50, 22, (120, 190, 255), 60, 14)
nb = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(nb)   # nevoa fria
for _ in range(14):
    x, y = random.randint(-100, W), random.randint(MURO, H)
    d.ellipse((x, y, x + random.randint(200, 420), y + random.randint(30, 60)), fill=(200, 220, 255, random.randint(16, 30)))
campo.alpha_composite(nb.filter(ImageFilter.GaussianBlur(28)))
fl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(fl)   # neve caindo
for _ in range(420):
    x, y = random.randint(0, W), random.randint(0, H); r = random.choice((0, 0, 1))
    d.rectangle((x, y, x + r, y + r), fill=(240, 245, 255, random.randint(90, 200)))
campo.alpha_composite(fl)
vin = Image.new('L', (W, H), 0); ImageDraw.Draw(vin).rectangle((0, 0, W, H), fill=100)
ImageDraw.Draw(vin).ellipse((-180, -40, W + 180, H + 200), fill=0)
v = Image.new('RGBA', (W, H), (6, 10, 24, 255)); v.putalpha(vin.filter(ImageFilter.GaussianBlur(90)))
campo.alpha_composite(v)
campo.save(OUT + 'bg_act3_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act3', exist_ok=True)
for f in os.listdir(OUT + 'act3'):
    if f.endswith('.png') and f[:-4] not in SPRITES:
        os.remove(OUT + 'act3/' + f)
dims = {}
for nome, im in SPRITES.items():
    im = anoitecer(im); im.save(OUT + f'act3/{nome}.png'); dims[nome] = im.size
fundo = {nome: (im.getbbox() or (0, 0, 0, im.height))[3] for nome, im in SPRITES.items()}
linhas = [f"  {{ src: './sprites/arena/act3/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + fundo[n]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct3.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato3.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato III (Terras dos Gigantes). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = base.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT3_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: laje de pedra, neve nos cantos, gelo nas juntas ─────────────
laje = interior(dung, 3, 0)
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, laje, 0, 0, 350 + T, H)
for cx, cy, rx, ry in [(30, 60, 110, 60), (330, 860, 110, 50), (10, 520, 50, 90), (340, 330, 40, 70)]:
    m = Image.new('L', patio.size, 0); ImageDraw.Draw(m).polygon(contorno(cx, cy, rx, ry), fill=255)
    com_mascara(patio, neve, m, blur=3)
for _ in range(14):
    e = random.choice(seixos); patio.alpha_composite(e, (random.randint(0, 350 - e.width), random.randint(0, H - e.height)))
patio = anoitecer(patio, fator=0.55)
fl = Image.new('RGBA', patio.size, (0, 0, 0, 0)); d = ImageDraw.Draw(fl)
for _ in range(110):
    x, y = random.randint(0, 350), random.randint(0, H); d.point((x, y), fill=(240, 245, 255, random.randint(90, 200)))
patio.alpha_composite(fl)
patio.save(OUT + 'bg_act3_courtyard.png')
print('patio:', patio.size)

if PREVIA:
    prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
    prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
    for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + fundo[o[0]]):
        prev.alpha_composite(anoitecer(SPRITES[nome]), (350 + x, y))
    prev.convert('RGB').save(PREVIA)
