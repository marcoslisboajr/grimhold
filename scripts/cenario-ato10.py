# ══════════════════════════════════════════════════════════════════════
# cenario-ato10.py — cenario das ondas 1-29 do ATO X (O Ventre): "a porta
# da Fome". Dimensao Sombria: calcamento frio diante da fortaleza. No topo,
# a MURALHA montada como uma peca so: passadico continuo em cima, cortina
# de tijolo com janelas, olho e rachaduras, dois bastioes octogonais
# salientes (com gargulas empoleiradas) e, no meio, a guarita saliente com
# o portao de runas. O chao racha e mostra o Vazio estrelado; um rasgo
# maior (o Ventre) com rochas flutuando; cristais, gargulas, a estatua da
# lua, o poco do Vazio; nevoa violeta, poeira de estrelas e brilho frio dos
# cristais. Mesmo molde do cenario-ato9.py.
#
# Fontes (assets-pixel/tilesets): tf_darkdimension/RMMV (versao 3x, grade
# de 48px, mesma escala dos outros atos; o tf_darkdimension_sheet.png e a
# folha-amostra 1x de 16px): tf_dd_A5_3 (calcamento, agua, o Vazio
# estrelado), tf_dd_B_3 (passadico, tijolo, janelas, olho, rachadura,
# bastiao, portao, gargulas, lua, cristais, corais, pedras, poco),
# !$floatingrocks_3 (cristal e rocha flutuantes); tf_ruindungeons/48_RMMV
# tf_A2_ruins (lajes gastas, tingidas) e tf_B_ruins1 (pontas de pedra,
# tingidas de violeta).
#
# Toda peca alta vai em OBJETOS_ALTOS (profundidade): ninguem anda por cima.
# Saida: public/sprites/arena/bg_act10_field.png, bg_act10_courtyard.png,
#        act10/<obj>.png, components/data/arenaAct10.ts
# Uso:   python scripts/cenario-ato10.py
# ══════════════════════════════════════════════════════════════════════
import random, os, math
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
TS = 'assets-pixel/tilesets/'
DD = TS + 'tf_darkdimension/RMMV/'
RU = TS + 'tf_ruindungeons/48_RMMV/'
OUT = 'public/sprites/arena/'
random.seed(1010)

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
def escurecer(im, f):
    a = im.getchannel('A'); im = ImageEnhance.Brightness(im).enhance(f); im.putalpha(a)
    return im
def violeta(im, f=0.8):   # peca das Ruinas (branca/azul) passada pra pedra fria da Dimensao
    a = im.getchannel('A')
    im = ImageEnhance.Color(im).enhance(0.15); im = ImageEnhance.Brightness(im).enhance(f); im.putalpha(a)
    return tingir(im, (70, 50, 110), 0.28)
def empilhar(*partes):     # empilha recortes de mesma largura, de cima pra baixo
    im = Image.new('RGBA', (partes[0].width, sum(p.height for p in partes)), (0, 0, 0, 0))
    y = 0
    for p in partes:
        im.paste(p, (0, y)); y += p.height
    return im

# ── fontes ──────────────────────────────────────────────────────────────
a5 = sheet(DD + 'tf_dd_A5_3.png')
b  = sheet(DD + 'tf_dd_B_3.png')
fr = sheet(DD + '!$floatingrocks_3.png')
a2r = sheet(RU + 'tf_A2_ruins.png')
rb1 = sheet(RU + 'tf_B_ruins1.png')

# chao: o calcamento do A5 e o unico ladrilho que repete sem costura (testado);
# os outros recortes do A5 trazem borda de agua (sao plataforma, nao chao)
piso      = a5.crop((48, 96, 96, 144))              # calcamento
piso_umid = a5.crop((48, 192, 96, 240))             # calcamento com respingos da agua
agua      = a5.crop((48, 0, 96, 48))                # agua da Dimensao (pocas)
estrelas  = a5.crop((0, 432, 384, 624))             # 384x192: o Vazio estrelado
laje_ru   = violeta(a2r.crop((384, 48, 432, 96)), 0.75)   # lajes gastas das Ruinas (manchas)
laje_ru2  = violeta(a2r.crop((240, 48, 288, 96)), 0.7)

# muralha (tf_dd_B_3): o passadico e a coluna do meio da laje emoldurada;
# a cortina e o tijolo liso; janelas/olho/rachadura sao paineis da mesma parede
passadico = b.crop((48, 480, 96, 624))              # 48x144: borda de cima, laje, borda de baixo + friso
tijolo    = b.crop((48, 624, 96, 768))              # 48x144 tijolo liso (fiadas de 16px)
tijolo_b  = b.crop((144, 624, 192, 768))            # tijolo com pedras mais escuras
janelas   = b.crop((288, 480, 336, 576))            # tijolo com duas janelas escuras
grades    = b.crop((336, 480, 384, 576))            # tijolo com duas janelas gradeadas
olho      = b.crop((192, 576, 240, 624))            # janela redonda (o "olho")
racha     = b.crop((192, 624, 240, 768))            # tijolo rachado de alto a baixo
alcapao   = b.crop((192, 480, 288, 576))            # alcapao no passadico
bastiao   = b.crop((480, 240, 672, 480))            # 192x240 bastiao octogonal (laje + frente + lados)
portao    = b.crop((528, 624, 672, 768))            # 144x144 portao de runas azuis
lado_e    = b.crop((0, 480, 48, 768))               # coluna esquerda da laje+tijolo (quina)
lado_d    = b.crop((96, 480, 144, 768))             # coluna direita
busto     = recortar(b.crop((528, 0, 624, 96)))     # gargula pequena empoleirada

# objetos altos
gargula_a = recortar(b.crop((384, 480, 528, 624)))  # gargula alada, de pe
gargula_b = recortar(b.crop((528, 480, 672, 624)))  # gargula sobre pedestal
lua       = recortar(b.crop((672, 480, 768, 624)))  # estatua da lua minguante
cristal   = recortar(b.crop((144, 144, 192, 240)))  # cristal alto cravado na pedra
cristais  = recortar(b.crop((288, 144, 384, 240)))  # touceira de cristais
cristal_d = recortar(b.crop((192, 144, 288, 240)))  # cristal tombado
coral     = recortar(b.crop((288, 48, 384, 144)))   # corais rosados sobre rocha
poco      = recortar(b.crop((240, 288, 384, 384)))  # poco de pedra com agua do Vazio
flut      = recortar(fr.crop((0, 0, 48, 144)))      # cristal grande flutuante (sombra ja desenhada)
flut_p    = recortar(fr.crop((0, 192, 48, 288)))    # cristal pequeno flutuante
rocha_f   = recortar(fr.crop((0, 432, 48, 576)))    # rocha flutuante
pedrao    = recortar(b.crop((192, 48, 288, 96)))    # rochedo

# miudos de chao (decalque: pisa por cima)
miudos = [recortar(b.crop((x, y, x + T, y + T))) for x, y in
          [(0, 48), (48, 48), (96, 48), (144, 48), (0, 96), (48, 96), (96, 96), (144, 96), (192, 96), (240, 96),
           (0, 144), (48, 144), (96, 144), (0, 192), (48, 192), (96, 192), (0, 240), (0, 288),
           (144, 240), (192, 240), (240, 240), (144, 288), (192, 288), (144, 336), (192, 336)]]
miudos_g = [recortar(b.crop(c)) for c in [(288, 240, 384, 288), (192, 48, 288, 96)]]
pontas = [violeta(recortar(rb1.crop(c)), 0.6) for c in [(384, 288, 432, 336), (480, 288, 528, 336)]]

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
MURO = 140                                          # pe da cortina (SPAWN_MIN_Y = 150)
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, piso, 0, 0, W, H)

# lajes gastas das Ruinas e calcamento umido: quebram a grade do ladrilho
for (cx, cy, rx, ry) in [(250, 460, 150, 70), (760, 330, 170, 60), (1060, 560, 140, 80), (420, 800, 180, 60), (980, 820, 120, 45)]:
    mancha(campo, laje_ru, cx, cy, rx, ry, blur=22, alfa=150)
for (cx, cy, rx, ry) in [(560, 620, 130, 55), (160, 290, 100, 40), (1150, 300, 90, 50)]:
    mancha(campo, laje_ru2, cx, cy, rx, ry, blur=18, alfa=120)
for (cx, cy, rx, ry) in [(620, 230, 200, 50), (300, 640, 140, 60), (880, 700, 160, 50), (80, 820, 100, 50)]:
    mancha(campo, piso_umid, cx, cy, rx, ry, blur=18, alfa=200)
# pocas da agua da Dimensao
for (cx, cy, rx, ry) in [(470, 280, 80, 26), (1000, 250, 60, 22), (200, 760, 70, 24), (700, 560, 56, 18), (1180, 700, 50, 18)]:
    mancha(campo, agua, cx, cy, rx, ry, blur=8, alfa=170)
# variacao larga de luz (lajes afundadas, sujeira)
nv = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(nv)
for _ in range(40):
    x, y, r = random.randint(0, W), random.randint(MURO, H), random.randint(40, 130)
    d.ellipse((x - r, y - r * .6, x + r, y + r * .6), fill=(10, 4, 20, random.randint(40, 100)))
campo.alpha_composite(nv.filter(ImageFilter.GaussianBlur(26)))

# rachaduras que mostram o Vazio estrelado por baixo (borda de pedra lascada)
def fenda(dst, x, y, passos, larg, ang):
    esq, dir_ = [], []
    for k in range(passos):
        ang += random.uniform(-0.5, 0.5)
        x += math.cos(ang) * random.randint(14, 26); y += math.sin(ang) * random.randint(8, 16)
        l = larg * math.sin(math.pi * (k + 0.5) / passos) + 1.5
        nx, ny = -math.sin(ang), math.cos(ang)
        esq.append((x + nx * l, y + ny * l)); dir_.append((x - nx * l, y - ny * l))
    poly = esq + dir_[::-1]
    sombra = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(sombra).polygon([(px, py + 3) for px, py in poly], fill=(6, 2, 12, 220))
    dst.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(3)))
    m = Image.new('L', dst.size, 0); ImageDraw.Draw(m).polygon(poly, fill=255)
    com_mascara(dst, estrelas, m)
    lasca = Image.new('RGBA', dst.size, (0, 0, 0, 0))            # a borda de cima pega luz
    ImageDraw.Draw(lasca).line(esq, fill=(150, 140, 170, 170), width=1)
    ImageDraw.Draw(lasca).line(dir_, fill=(20, 12, 30, 220), width=2)
    dst.alpha_composite(lasca)
    return poly
FENDAS = []
for (x, y, n, l, a) in [(120, 250, 9, 8, 0.3), (520, 430, 11, 10, -0.2), (940, 230, 7, 7, 0.6),
                        (330, 660, 10, 9, 0.1), (1000, 700, 9, 9, -0.4), (700, 820, 7, 6, 0.2),
                        (40, 560, 6, 6, 0.5), (1170, 440, 6, 7, 1.2), (620, 190, 6, 5, 0.1),
                        (860, 560, 5, 5, 2.4), (240, 380, 5, 5, -0.6)]:
    FENDAS.append(fenda(campo, x, y, n, l, a))

# o Ventre: um rasgo maior no chao, com a pedra desmoronando pra dentro
VX, VY = 790, 470
m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
pts = [(VX + math.cos(t) * (105 + random.randint(-14, 14)), VY + math.sin(t) * (44 + random.randint(-8, 8)))
       for t in [i * math.pi / 12 for i in range(24)]]
borda = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(borda).polygon([(x, y + 6) for x, y in pts], fill=(4, 2, 10, 240))
campo.alpha_composite(borda.filter(ImageFilter.GaussianBlur(5)))
d.polygon(pts, fill=255)
com_mascara(campo, estrelas, m.filter(ImageFilter.GaussianBlur(1)))
parede = Image.new('RGBA', (W, H), (0, 0, 0, 0))   # parede interna (a pedra caindo pra dentro)
ImageDraw.Draw(parede).chord((VX - 110, VY - 50, VX + 110, VY + 44), 180, 360, fill=(34, 24, 46, 215))
parede.putalpha(ImageChops.multiply(parede.getchannel('A'), m))
campo.alpha_composite(parede.filter(ImageFilter.GaussianBlur(2)))
ImageDraw.Draw(campo).line(pts[12:] + pts[:1], fill=(140, 130, 165, 150), width=1)   # borda de cima lascada

OBJETOS_ALTOS = [
    ('gargula_a', 50, 190), ('gargula_a', 1050, 610), ('gargula_b', 470, 560), ('lua', 1150, 210),
    ('cristal', 300, 330), ('cristal', 640, 250), ('cristal', 1180, 760), ('cristal', 90, 690),
    ('cristais', 60, 430), ('cristais', 600, 780), ('cristais', 960, 180), ('cristal_d', 250, 770),
    ('flut', 940, 400), ('flut_p', 660, 450), ('flut', 400, 190), ('flut_p', 1170, 480),
    ('coral', 1060, 250), ('coral', 820, 650), ('poco', 170, 580), ('rocha_f', 850, 170),
    ('rocha_f', 720, 380), ('pedrao', 390, 690),
]
SPRITES = {'gargula_a': gargula_a, 'gargula_b': gargula_b, 'lua': lua, 'cristal': cristal,
           'cristais': cristais, 'cristal_d': cristal_d, 'flut': flut, 'flut_p': flut_p,
           'coral': coral, 'poco': poco, 'rocha_f': rocha_f, 'pedrao': pedrao}
FLUTUA = {'flut', 'flut_p', 'rocha_f'}   # ja trazem a sombra no chao desenhada

def livre(x, y, w, h):   # fora do Ventre e da boca do portao
    cx, cy = x + w / 2, y + h / 2
    for nome, ox, oy in OBJETOS_ALTOS:                # nada de miudo aparecendo atras de objeto alto
        im = SPRITES[nome]
        if ox - 6 < cx < ox + im.width + 6 and oy - 6 < cy < oy + im.height + 6:
            return False
    return not ((VX - 140 < cx < VX + 140 and VY - 70 < cy < VY + 70) or (W // 2 - 90 < cx < W // 2 + 90 and cy < MURO + 60))

# pontas das Ruinas, cacos, corais, pedrinhas (chao: pisa por cima)
for _ in range(95):
    e = random.choice(miudos)
    x, y = random.randint(0, W - e.width), random.randint(MURO + 16, H - e.height)
    if livre(x, y, e.width, e.height): campo.alpha_composite(e, (x, y))
for _ in range(6):
    e = random.choice(pontas)
    x, y = random.randint(0, W - e.width), random.randint(MURO + 40, H - e.height)
    if livre(x, y, e.width, e.height): campo.alpha_composite(e, (x, y))
for (x, y) in [(30, 340), (590, 720), (1090, 830), (360, 190), (1120, 180), (220, 860), (930, 380)]:
    campo.alpha_composite(random.choice(miudos_g), (x, y))
for (x, y) in [(VX - 96, VY - 30), (VX + 60, VY - 38), (VX - 20, VY + 20), (VX + 80, VY + 8), (VX - 60, VY + 12)]:
    campo.alpha_composite(random.choice(miudos[16:]), (x, y))   # pedras escorregando pro rasgo

# ── a MURALHA no topo: uma peca so ─────────────────────────────────────
# Tudo e montado numa camada `mur` e colado de uma vez. Cortina: passadico
# (so a metade de baixo aparece, o resto passa da borda) + 80px de tijolo.
# Os paineis entram alinhados as fiadas (periodo de 32px do aparelho).
FACE = 80
TOPO_FACE = MURO - FACE                              # 60: onde o friso encontra o tijolo
mur = Image.new('RGBA', (W, 260), (0, 0, 0, 0))

def fiada(y_folha):   # linha da cortina onde um recorte da folha (a partir de y_folha) casa com o aparelho
    return TOPO_FACE + ((y_folha - (768 - FACE)) % 32)

# 1) passadico continuo (a laje some na borda de cima; aparece o friso)
for x in range(0, W, T):
    mur.alpha_composite(passadico, (x, TOPO_FACE - passadico.height))
# 2) cortina de tijolo (dois aparelhos alternados sem padrao fixo)
for x in range(0, W, T):
    t = tijolo_b if random.random() < 0.3 else tijolo
    mur.alpha_composite(t.crop((0, 144 - FACE, T, 144)), (x, TOPO_FACE))
# 3) paineis da cortina: janelas, grades, olhos e rachaduras, espacados sem ritmo
# (vaos visiveis: 0-150, 342-505, 745-900, 1092-1250; o resto e bastiao/guarita)
for x, p in [(96, janelas), (384, grades), (768, janelas), (864, grades), (1104, grades)]:
    mur.alpha_composite(p.crop((0, 42, T, 90)), (x, fiada(480 + 42)))     # uma janela so
for x in [432, 1200]:
    mur.alpha_composite(olho, (x, fiada(576)))
for x in [0, 816, 1152]:
    mur.alpha_composite(racha.crop((0, 144 - FACE, T, 144)), (x, TOPO_FACE))
# 4) escorridos do Vazio: manchas escuras descendo do friso
esc = Image.new('RGBA', mur.size, (0, 0, 0, 0)); de = ImageDraw.Draw(esc)
for _ in range(26):
    x = random.randint(0, W); c = random.randint(18, 64)
    de.line((x, TOPO_FACE, x + random.randint(-3, 3), TOPO_FACE + c), fill=(30, 10, 50, 150), width=random.randint(2, 5))
mur.alpha_composite(esc.filter(ImageFilter.GaussianBlur(1)))
sm = Image.new('RGBA', mur.size, (0, 0, 0, 0))       # sombra do friso sobre o tijolo
ImageDraw.Draw(sm).rectangle((0, TOPO_FACE, W, TOPO_FACE + 6), fill=(10, 6, 18, 150))
mur.alpha_composite(sm.filter(ImageFilter.GaussianBlur(2)))

# 5) bastioes octogonais salientes: a laje de cima sobe e some na borda,
#    a frente desce 96px (fiadas 336-384 + 432-480 do recorte, mesmo aparelho)
bast = empilhar(bastiao.crop((0, 0, 192, 144)), bastiao.crop((0, 192, 192, 240)))   # 192x192
BASTIOES = [150, 900]
BPE = MURO + 30
for bx in BASTIOES:
    mur.alpha_composite(bast, (bx, BPE - bast.height))
    mur.alpha_composite(busto, (bx + 96 - busto.width // 2, BPE - 96 - busto.height + 4))    # gargula no parapeito

# 6) guarita do portao, no meio: mais alta e saliente. 5 colunas da laje
#    emoldurada (quina, meio x3, quina) + 144 de tijolo; portao no meio,
#    janelas gradeadas nas laterais; gargulas nas quinas
GX, GW = W // 2 - 120, 240
GPE = MURO + 34
gua = Image.new('RGBA', (GW, 288), (0, 0, 0, 0))
for k, c in enumerate([lado_e, b.crop((48, 480, 96, 768)), b.crop((48, 480, 96, 768)), b.crop((48, 480, 96, 768)), lado_d]):
    gua.alpha_composite(c, (k * T, 0))
gua.alpha_composite(portao, (T, 144))
for x in (0, 4 * T):
    gua.alpha_composite(grades.crop((6, 42, 42, 90)), (x + 6, 144 + ((522 - 624) % 32)))
mur.alpha_composite(gua, (GX, GPE - gua.height))
for x in (GX - busto.width - 14, GX + GW + 14):      # gargulas no passadico, guardando o portao
    mur.alpha_composite(busto, (x, TOPO_FACE - busto.height + 6))

# 7) sombra da muralha no chao e colagem
sp = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sp)
ds.rectangle((0, MURO - 6, W, MURO + 26), fill=(4, 2, 10, 170))
for bx in BASTIOES:
    ds.rectangle((bx + 10, MURO + 20, bx + 182, MURO + 52), fill=(4, 2, 10, 150))
ds.rectangle((GX, GPE - 10, GX + GW, GPE + 24), fill=(4, 2, 10, 150))
campo.alpha_composite(sp.filter(ImageFilter.GaussianBlur(12)))
campo.alpha_composite(mur, (0, 0))

# pe da muralha: entulho caido, cristais brotando e corais nas frestas
for x in range(10, W, 60):
    x2 = x + random.randint(-14, 14)
    if GX - 20 < x2 < GX + GW + 20: continue
    e = random.choice(miudos)
    campo.alpha_composite(e, (x2, MURO - e.height // 2 + random.randint(0, 14)))
for x in [70, 420, 1080, 1210, 700 + 190]:
    e = random.choice(miudos[10:16])
    campo.alpha_composite(e, (x, MURO - 10))


for nome, x, y in OBJETOS_ALTOS:
    if nome in FLUTUA:
        continue
    im = SPRITES[nome]; w = im.width
    sx, sy = x + w / 2, y + im.height - 6
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((sx - w * 0.45, sy - 9, sx + w * 0.45, sy + 9), fill=(0, 0, 0, 130))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── luz da Dimensao Sombria: roxo-frio, quase sem luz propria ──────────
def sombrio(im, fator=0.64, tom=(50, 22, 96), peso=0.30):
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(im).enhance(fator); im.putalpha(a)
    im = ImageEnhance.Color(im).enhance(0.75)
    return tingir(im, tom, peso)

campo = sombrio(campo)

# o campo mergulha no escuro: degrade roxo-preto de cima pra baixo e vinheta nas bordas
dg = Image.new('L', (W, H), 0); d = ImageDraw.Draw(dg)
for y in range(H):
    d.line((0, y, W, y), fill=int(max(0, (y - MURO) / (H - MURO)) ** 1.6 * 90))
vin = Image.new('L', (W, H), 0); ImageDraw.Draw(vin).rectangle((0, 0, W, H), fill=120)
ImageDraw.Draw(vin).ellipse((-160, -60, W + 160, H + 200), fill=0)
esc = Image.new('RGBA', (W, H), (8, 2, 18, 255))
esc.putalpha(ImageChops.lighter(dg, vin.filter(ImageFilter.GaussianBlur(90))))
campo.alpha_composite(esc)

# nevoa violeta rasteira (faixas largas e desfocadas)
nev = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(nev)
for _ in range(16):
    x, y = random.randint(-100, W), random.randint(MURO + 40, H)
    d.ellipse((x, y, x + random.randint(180, 380), y + random.randint(30, 60)), fill=(110, 60, 190, random.randint(18, 34)))
campo.alpha_composite(nev.filter(ImageFilter.GaussianBlur(24)))

def brilho(dst, cx, cy, r, cor, a):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - r, cy - r, cx + r, cy + r), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(r * 0.45)))

# o portao da Fome: luz doente vazando por baixo e pelas runas
PX = GX + GW // 2
brilho(campo, PX, GPE + 10, 150, (130, 60, 230), 60)
brilho(campo, PX, GPE - 20, 60, (190, 120, 255), 80)
for dx in (-22, 22):
    brilho(campo, PX + dx, GPE - 50, 10, (90, 220, 255), 220)
# braseiros de fogo-frio na cortina e nos bastioes
TOCHAS = [(60, TOPO_FACE + 26), (360, TOPO_FACE + 26), (480, TOPO_FACE + 26), (GX + 24, GPE - 110),
          (GX + GW - 24, GPE - 110), (770, TOPO_FACE + 26), (880, TOPO_FACE + 26), (1170, TOPO_FACE + 26)]
for (x, y) in TOCHAS:
    dd = ImageDraw.Draw(campo)
    dd.rectangle((x - 5, y + 6, x + 5, y + 9), fill=(22, 18, 30, 255))     # suporte
    dd.rectangle((x - 1, y + 9, x + 1, y + 16), fill=(22, 18, 30, 255))
    brilho(campo, x, y + 2, 34, (150, 90, 255), 90)
    brilho(campo, x, y, 8, (200, 170, 255), 230)
    dd.point((x, y - 3), fill=(240, 230, 255, 255))
# o Ventre respira: brilho violeta subindo do rasgo
brilho(campo, VX, VY, 150, (120, 50, 220), 70)
brilho(campo, VX, VY, 70, (170, 110, 255), 60)
# rachaduras: fio de luz violeta nas bordas
for poly in FENDAS:
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(g).line(poly + [poly[0]], fill=(150, 80, 255, 120), width=5)
    campo.alpha_composite(g.filter(ImageFilter.GaussianBlur(4)))
# cristais e pocas: brilho ciano frio
for nome, x, y in OBJETOS_ALTOS:
    w, h = SPRITES[nome].size
    if nome.startswith(('cristal', 'flut')):
        brilho(campo, x + w // 2, y + h - 10, 50, (90, 220, 255), 70)
    if nome == 'lua':
        brilho(campo, x + w // 2, y + 50, 60, (200, 190, 255), 45)
    if nome == 'poco':
        brilho(campo, x + w // 2, y + 40, 70, (90, 140, 255), 60)
for (cx, cy) in [(470, 280), (1000, 250), (200, 760), (700, 560), (1180, 700)]:
    brilho(campo, cx, cy, 40, (90, 150, 255), 40)

# poeira de estrelas no ar: pontos frios, alguns com halo e brilho em cruz
pe = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(pe)
for _ in range(360):
    x, y = random.randint(0, W), random.randint(0, H)
    c = random.choice([(220, 210, 255), (170, 150, 255), (150, 230, 255), (255, 200, 240)])
    d.point((x, y), fill=c + (random.randint(90, 200),))
for _ in range(46):
    x, y = random.randint(0, W), random.randint(MURO, H)
    c = random.choice([(200, 180, 255), (150, 230, 255)])
    brilho(campo, x, y, 9, c, 90)
    d.point((x, y), fill=(255, 255, 255, 255))
    if random.random() < 0.5:
        d.line((x - 2, y, x + 2, y), fill=c + (200,)); d.line((x, y - 2, x, y + 2), fill=c + (200,))
campo.alpha_composite(pe)

campo.save(OUT + 'bg_act10_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act10', exist_ok=True)
for f in os.listdir(OUT + 'act10'):   # limpa sobras da tentativa anterior
    if f.endswith('.png') and f[:-4] not in SPRITES:
        os.remove(OUT + 'act10/' + f)
dims = {}
for nome, im in SPRITES.items():
    im = sombrio(im); im.save(OUT + f'act10/{nome}.png'); dims[nome] = im.size
linhas = [f"  {{ src: './sprites/arena/act10/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + dims[n][1]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct10.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato10.py — nao editar na mao.\n"
            "// Objetos altos do cenario das ondas 1-29 do Ato X (O Ventre). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = y + h.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT10_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: calcamento escuro atras da muralha dos herois ───────────────
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, piso, 0, 0, 350 + T, H)
for (cx, cy, rx, ry) in [(240, 420, 90, 50), (80, 600, 70, 40), (200, 120, 100, 40)]:
    mancha(patio, laje_ru, cx, cy, rx, ry, blur=18, alfa=140)
for (cx, cy, rx, ry) in [(90, 240, 70, 26), (250, 640, 80, 28), (120, 820, 60, 20)]:
    mancha(patio, agua, cx, cy, rx, ry, blur=10, alfa=140)
for _ in range(22):
    e = random.choice(miudos)
    patio.alpha_composite(e, (random.randint(0, 350 - e.width), random.randint(20, H - e.height)))
for (x, y) in [(40, 360), (270, 130), (210, 500)]:
    patio.alpha_composite(random.choice(miudos[10:16]), (x, y))
patio = sombrio(patio, fator=0.45)
for (cx, cy) in [(90, 240), (250, 640), (120, 820)]:
    brilho(patio, cx, cy, 36, (90, 150, 255), 40)
for (cx, cy) in [(60, 380), (290, 150), (230, 520)]:   # cacos de cristal no patio
    brilho(patio, cx, cy, 30, (90, 220, 255), 45)
pp = Image.new('RGBA', patio.size, (0, 0, 0, 0)); d = ImageDraw.Draw(pp)
for _ in range(100):
    d.point((random.randint(0, 350), random.randint(0, H)), fill=(200, 190, 255, random.randint(80, 180)))
patio.alpha_composite(pp)
patio.save(OUT + 'bg_act10_courtyard.png')
print('patio:', patio.size)

# previa composta (patio + campo + objetos) para aprovacao
prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + dims[o[0]][1]):
    prev.alpha_composite(sombrio(SPRITES[nome]), (350 + x, y))
prev.convert('RGB').save('release-demo/previa-ato10-cenario.png')
print('previa: release-demo/previa-ato10-cenario.png')
