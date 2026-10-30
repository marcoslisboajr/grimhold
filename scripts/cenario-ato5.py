# ══════════════════════════════════════════════════════════════════════
# cenario-ato5.py — cenario do ATO V (O Fim de Grimhold), versao 2.
#
# Refeito no molde dos cenarios recentes (cenario-ato9/10.py). Tema mantido:
# apocalipse de magma nas portas da propria fortaleza. No topo, a MURALHA
# DE GRIMHOLD montada como uma peca so (pano com janelas, torres redondas,
# o portao no meio), chamuscada, com fogo nas janelas e duas brechas em
# chamas. No chao: basalto e cinza, fendas abertas mostrando a lava (borda
# lascada e brilho), o lago de lava embaixo com crosta, pocas de lava,
# entulho, brasas e fumaca. Objetos altos (rochedos, cristais vermelhos,
# arvores carbonizadas em chamas, colunas partidas, braseiros) vao em
# OBJETOS_ALTOS, com profundidade.
#
# Fontes (assets-pixel/tilesets): tileD_castle (muralha, torres, portao,
# janelas), remastercliffs_A2_3x / _B_3x (rocha, rochedos), bonus_lava_anim
# (lava), rockcrystals_tf_3 (cristais), tileA5_cave (basalto), tileB_desert
# (arvores mortas, carbonizadas aqui), !$torch (braseiro e chama),
# tileA2_dungeon (laje do patio).
#
# A geometria do jogo nao muda: campo 1250x900, patio 350x900, muralha dos
# herois em x=350, inimigos em y 150-670. A muralha do topo fica acima de 150.
#
# Saida: public/sprites/arena/bg_act5_field.png, bg_act5_courtyard.png,
#        act5/<obj>.png, components/data/arenaAct5.ts
# Uso:   python scripts/cenario-ato5.py   (ASSETS=<pasta> se assets-pixel
#        nao estiver na raiz; PREVIA=<png> grava a previa composta)
# ══════════════════════════════════════════════════════════════════════
import random, math, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
TS = os.environ.get('ASSETS', 'assets-pixel') + '/tilesets/'
OUT = 'public/sprites/arena/'
PREVIA = os.environ.get('PREVIA')
random.seed(23)

def sheet(p): return Image.open(TS + p).convert('RGBA')
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
def escurecer(im, f, cor=0.6):
    a = im.getchannel('A'); im = ImageEnhance.Brightness(im).enhance(f); im = ImageEnhance.Color(im).enhance(cor); im.putalpha(a)
    return im
def carbonizar(im):   # madeira/pedra queimada: quase preta, com um resto de brasa
    return tingir(escurecer(im, 0.35, 0.3), (120, 30, 10), 0.18)
def brilho(dst, cx, cy, rx, ry, cor, a, blur=None):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(blur if blur is not None else min(rx, ry) * 0.45)))

# ── fontes ──────────────────────────────────────────────────────────────
cliffA  = sheet('remastercliffs_A2_3x.png')
cliffB  = sheet('remastercliffs_B_3x.png')
lava_sh = sheet('bonus_lava_anim.png')
cry     = sheet('rockcrystals_tf_3.png')
dung    = sheet('tileA2_dungeon.png')
castelo = sheet('tileD_castle.png')
cave    = sheet('tileA5_cave.png')
deserto = sheet('tileB_desert.png')
tocha   = sheet('!$torch.png')

basalto   = recorte(cave, 1, 3, 2, 4)      # chao de caverna (vira cinza queimado na luz)
basalto2  = recorte(cave, 0, 3, 1, 4)
rocha_ver = recorte(cave, 1, 4, 2, 5)      # chao com pedrisco (manchas)
cinza     = interior(cliffA, 6, 1)         # rocha cinza (trilhas de marcha)
# a folha de lava NAO esta na grade de 48: tiles comecam em x=12 com 3 px de folga
lava      = lava_sh.crop((12, 48, 60, 96))     # lava lisa
lava_viva = lava_sh.crop((219, 81, 267, 129))  # lava com veios claros
# miudos de chao: lascas de cristal e pedrinhas (folhas com transparencia)
pedrisco  = [recortar(cry.crop(c)) for c in [(48, 192, 96, 240), (288, 192, 336, 240), (336, 192, 384, 240), (96, 192, 144, 240)]]

# objetos altos
rochedo   = recorte(cliffB, 0, 1, 3, 4)    # 144x144 pedregulho vermelho
rochedo_c = recorte(cliffB, 8, 1, 11, 4)   # 144x144 pedregulho cinza
cristal_g = recorte(cry, 4, 4, 6, 7)       # 96x144 cristais vermelhos grandes
cristal_p = recorte(cry, 1, 5, 3, 7)       # 96x96 cristais vermelhos pequenos
cristal_c = recorte(cry, 7, 5, 9, 7)       # 96x96 cristais cinza
chama     = recortar(tocha.crop((0, 0, 48, 60)))    # quadro parado da chama
braseiro  = recortar(tocha.crop((48, 0, 96, 60)))   # chama no braseiro de ferro
def sem_areia(im):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and any(abs(r - c[0]) + abs(g - c[1]) + abs(b - c[2]) <= t for c, t in
                         [((236, 219, 142), 28), ((206, 191, 124), 14), ((198, 170, 13), 40), ((245, 228, 24), 40)]):
                px[x, y] = (0, 0, 0, 0)
    return im
def em_chamas(im, pontos):   # arvore carbonizada com chamas nos galhos
    im = carbonizar(im)
    for (x, y) in pontos:
        im.alpha_composite(chama, (x - chama.width // 2, y - chama.height + 6))
    return im
def sem_moita(im):   # a folha poe um tufo de capim (bloco 6-7 x 9) colado no pe da arvore grande
    im = im.copy(); im.paste((0, 0, 0, 0), (96, 144, 192, 192)); return im
arvore_q  = em_chamas(recortar(sem_moita(sem_areia(deserto.crop((192, 288, 384, 480))))), [(60, 40), (130, 70)])
arvore_q2 = em_chamas(recortar(sem_areia(deserto.crop((0, 288, 96, 480)))), [(40, 30)])
# coluna partida: uma torre redonda da muralha, cortada com o topo em serra
def coluna_partida(alt):
    c = castelo.crop((0, 144, 48, 348)).copy()
    c = c.crop((0, c.height - alt, 48, c.height))
    m = Image.new('L', c.size, 255); d = ImageDraw.Draw(m)
    serra = [(0, 0)] + [(x, random.randint(4, 22)) for x in range(0, 49, 8)] + [(48, 0)]
    d.polygon(serra, fill=0)
    c.putalpha(ImageChops.multiply(c.getchannel('A'), m))
    return recortar(carbonizar(c))
coluna_q  = coluna_partida(120)
coluna_q2 = coluna_partida(84)

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
MURO = 140                                          # pe da muralha de Grimhold (SPAWN_MIN_Y = 150)
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, basalto, 0, 0, W, H)
for (cx, cy, rx, ry) in [(300, 400, 170, 90), (760, 300, 190, 70), (1050, 420, 140, 100), (520, 640, 160, 60), (160, 700, 120, 50)]:
    mancha(campo, rocha_ver, cx, cy, rx, ry)
for (cx, cy, rx, ry) in [(620, 200, 200, 50), (1100, 620, 120, 60), (240, 250, 120, 50)]:
    mancha(campo, basalto2, cx, cy, rx, ry, blur=22, alfa=180)

# trilhas de marcha (mesmas alturas de antes: 18% e 54%), pedra pisada
def trilha(y0, alt):
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    topo = [(x, y0 + 9 * math.sin(x / 150.0 + y0) + random.randint(-3, 3)) for x in range(-20, W + 40, 20)]
    base = [(x, y0 + alt + 11 * math.sin(x / 180.0 + y0 * 1.3) + random.randint(-3, 3)) for x in range(W + 40, -40, -20)]
    d.polygon(topo + base, fill=110)
    com_mascara(campo, cinza, m, blur=16)
trilha(int(H * .18), 110)
trilha(int(H * .54), 120)

# manchas de cinza (fuligem clara) e queimado (preto)
fu = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(fu)
for _ in range(34):
    x, y, r = random.randint(0, W), random.randint(MURO, H - 120), random.randint(30, 110)
    d.ellipse((x - r, y - r * .5, x + r, y + r * .5), fill=random.choice([(8, 4, 2, 110), (150, 140, 130, 40)]))
campo.alpha_composite(fu.filter(ImageFilter.GaussianBlur(22)))

# fendas de lava: poligono irregular com lava dentro, sombra embaixo e a
# borda de cima lascada (mesma tecnica das fendas do Vazio no Ato X)
FENDAS = []
def fenda(x, y, passos, larg, ang):
    esq, dir_ = [], []
    for k in range(passos):
        ang += random.uniform(-0.5, 0.5)
        x += math.cos(ang) * random.randint(14, 26); y += math.sin(ang) * random.randint(8, 16)
        l = larg * 0.45 * math.sin(math.pi * (k + 0.5) / passos) + 1   # finas (pedido: as de antes pareciam tracos grossos)
        nx, ny = -math.sin(ang), math.cos(ang)
        esq.append((x + nx * l, y + ny * l)); dir_.append((x - nx * l, y - ny * l))
    poly = esq + dir_[::-1]
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).polygon([(px, py + 3) for px, py in poly], fill=(10, 2, 0, 220))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(3)))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(poly, fill=255)
    com_mascara(campo, lava_viva, m)
    l2 = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(l2).line(esq, fill=(20, 8, 4, 230), width=2)
    ImageDraw.Draw(l2).line(dir_, fill=(120, 60, 40, 140), width=1)
    campo.alpha_composite(l2)
    FENDAS.append(poly)
for (x, y, n, l, a) in [(80, 320, 10, 7, 0.2), (430, 430, 12, 9, -0.1), (880, 210, 8, 6, 0.5),
                        (300, 600, 9, 7, 0.3), (760, 420, 8, 8, -0.5), (1000, 560, 9, 7, 0.1),
                        (560, 250, 6, 5, 0.0), (1130, 360, 6, 6, 1.4), (40, 560, 6, 5, -0.3), (650, 700, 7, 6, 0.2)]:
    fenda(x, y, n, l, a)

# lago de lava embaixo: contorno irregular, crosta escura na margem, lava,
# veios claros no meio; pocas menores
def lago(cx, cy, rx, ry, n=44):
    pts = [(cx + math.cos(t) * rx * (1 + random.uniform(-.05, .05)), cy + math.sin(t) * ry * (1 + random.uniform(-.08, .08)))
           for t in [i * 2 * math.pi / n for i in range(n)]]
    crosta = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(crosta).polygon([(x + (x - cx) * .06, y + (y - cy) * .12) for x, y in pts], fill=(18, 8, 4, 235))
    campo.alpha_composite(crosta.filter(ImageFilter.GaussianBlur(4)))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(pts, fill=255)
    com_mascara(campo, lava, m, blur=2)
    m3 = Image.new('L', (W, H), 0); ImageDraw.Draw(m3).ellipse((cx - rx * .6, cy - ry * .5, cx + rx * .6, cy + ry * .5), fill=255)
    com_mascara(campo, lava_viva, m3, blur=12)
    borda = Image.new('RGBA', (W, H), (0, 0, 0, 0))         # a margem de cima pega a luz da lava
    ImageDraw.Draw(borda).line([p for p in pts if p[1] < cy] , fill=(255, 170, 70, 150), width=2)
    campo.alpha_composite(borda.filter(ImageFilter.GaussianBlur(1)))
    # ilhas de crosta boiando
    for _ in range(int(rx / 70)):
        a = random.uniform(0, 2 * math.pi); r = random.uniform(.2, .75)
        ix, iy = cx + math.cos(a) * rx * r, cy + math.sin(a) * ry * r
        if iy > H - 10: continue
        ImageDraw.Draw(campo).polygon(contornar(ix, iy, random.randint(10, 22), random.randint(5, 9)), fill=(40, 16, 8, 255))
    return pts
def contornar(cx, cy, rx, ry, n=9):
    return [(cx + math.cos(t) * rx * random.uniform(.7, 1.2), cy + math.sin(t) * ry * random.uniform(.7, 1.2))
            for t in [i * 2 * math.pi / n for i in range(n)]]
LAGOS = [(640, 905, 520, 140), (1190, 470, 110, 60), (130, 470, 70, 30), (900, 640, 60, 24)]
for c in LAGOS: lago(*c)

OBJETOS_ALTOS = [
    # base fora das trilhas (162-272 e 486-606) e fora dos lagos
    ('rochedo', 380, 300), ('rochedo_c', 980, 300), ('rochedo', 150, 630), ('rochedo_c', 1120, 620),
    ('cristal_g', 250, 320), ('cristal_g', 1130, 300), ('cristal_g', 640, 590),
    ('cristal_p', 560, 380), ('cristal_p', 820, 300), ('cristal_p', 20, 660),
    ('cristal_c', 870, 620), ('cristal_c', 700, 150),
    ('arvore_q', 60, 170), ('arvore_q2', 430, 600), ('arvore_q', 1000, 700),
    ('coluna_q', 300, 350), ('coluna_q2', 690, 350), ('coluna_q', 1060, 170),
    ('braseiro', 520, 150), ('braseiro', 960, 160),
]
SPRITES = {'rochedo': rochedo, 'rochedo_c': rochedo_c, 'cristal_g': cristal_g, 'cristal_p': cristal_p,
           'cristal_c': cristal_c, 'arvore_q': arvore_q, 'arvore_q2': arvore_q2, 'coluna_q': coluna_q,
           'coluna_q2': coluna_q2, 'braseiro': braseiro}

def ocupado(cx, cy, folga=6):
    for nome, ox, oy in OBJETOS_ALTOS:
        im = SPRITES[nome]
        if ox - folga < cx < ox + im.width + folga and oy - folga < cy < oy + im.height + folga:
            return True
    return any((cx - x) ** 2 / rx ** 2 + (cy - y) ** 2 / ry ** 2 < 1.1 for x, y, rx, ry in LAGOS)

# entulho e pedrisco (chao: pisa por cima)
cacos = [recortar(escurecer(deserto.crop(c), 0.6)) for c in [(144, 240, 192, 288), (192, 240, 240, 288), (240, 240, 288, 288)]]
for _ in range(110):
    e = random.choice(pedrisco + cacos); x, y = random.randint(0, W - e.width), random.randint(MURO + 8, H - e.height)
    if not ocupado(x + e.width / 2, y + e.height / 2): campo.alpha_composite(e, (x, y))

# ── a MURALHA DE GRIMHOLD no topo: uma peca so ─────────────────────────
# tileD_castle: pano com janelas (0-240 x 384-528), pano liso (240-384 x
# 384-480), portao (240-384 x 384-576), torres redondas (0-96 x 144-348).
PE = MURO + 4
mur = Image.new('RGBA', (W, 300), (0, 0, 0, 0))
pano_j = castelo.crop((0, 384, 240, 528))              # 240x144, janelas
pano_l = castelo.crop((240, 384, 384, 528))            # 144x144 (a parte de baixo ja traz o arco do portao: so ate 480)
pano_l = castelo.crop((240, 384, 288, 528))            # 48x144 pano liso sem o arco
portao = castelo.crop((240, 384, 384, 576))            # 144x192
torre  = castelo.crop((0, 144, 96, 348))               # 96x204 duas torres redondas
x = -20
while x < W:
    mur.alpha_composite(pano_j, (x, PE - pano_j.height)); x += pano_j.width
GX = W // 2 - 72
TORRES = [100, GX - 96, GX + 144, 1020]
BRECHAS = [(330, 120), (820, 110)]                      # (x, largura): o fogo ja abriu a muralha
mur.alpha_composite(portao, (GX, PE + 30 - portao.height))
for tx in TORRES:
    mur.alpha_composite(torre, (tx, PE + 8 - torre.height))
# brechas: recorta o pano com contorno serrilhado, sobra o buraco escuro
for bx, bw in BRECHAS:
    m = Image.new('L', mur.size, 0); d = ImageDraw.Draw(m)
    serra = [(bx, PE + 2)] + [(bx + i * bw / 8, PE - random.randint(60, 120)) for i in range(1, 8)] + [(bx + bw, PE + 2)]
    d.polygon(serra, fill=255)
    a = mur.getchannel('A'); mur.putalpha(ImageChops.subtract(a, m))
# fuligem subindo das janelas e rachaduras (manchas escuras verticais)
esc = Image.new('RGBA', mur.size, (0, 0, 0, 0)); de = ImageDraw.Draw(esc)
for _ in range(40):
    x = random.randint(0, W); y = random.randint(PE - 140, PE - 30)
    de.line((x, y, x + random.randint(-4, 4), y - random.randint(20, 60)), fill=(10, 4, 2, 150), width=random.randint(3, 8))
esc = esc.filter(ImageFilter.GaussianBlur(3)); esc.putalpha(ImageChops.multiply(esc.getchannel('A'), mur.getchannel('A')))
mur.alpha_composite(esc)
mur = escurecer(mur, 0.62, 0.55)

# sombra da muralha, fundo das brechas (o fogo atras) e colagem
sp = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sp)
ds.rectangle((0, MURO - 6, W, MURO + 22), fill=(0, 0, 0, 170))
campo.alpha_composite(sp.filter(ImageFilter.GaussianBlur(10)))
for bx, bw in BRECHAS:
    brilho(campo, bx + bw // 2, MURO - 50, bw * .6, 70, (255, 90, 20), 200, 18)
    brilho(campo, bx + bw // 2, MURO - 30, bw * .35, 30, (255, 200, 90), 220, 8)
campo.alpha_composite(mur, (0, 0))
for bx, bw in BRECHAS:   # entulho da brecha espalhado no chao, chamas no alto do rombo
    for _ in range(8):
        e = random.choice(pedrisco + cacos); campo.alpha_composite(e, (bx + random.randint(-20, bw), MURO - 10 + random.randint(-6, 14)))
    for dx in (bw * .25, bw * .6, bw * .85):
        campo.alpha_composite(chama, (int(bx + dx) - chama.width // 2, MURO - chama.height - random.randint(0, 20)))

# sombras dos objetos (a luz vem da lava, de baixo: sombra curta)
for nome, x, y in OBJETOS_ALTOS:
    im = SPRITES[nome]; w = im.width; bb = im.getbbox()[3]
    sx, sy = x + w * 0.5, y + bb - 6
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((sx - w * 0.42, sy - 8, sx + w * 0.42, sy + 8), fill=(0, 0, 0, 140))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── ar de cinza: escuro, quente ─────────────────────────────────────────
def anoitecer(im, fator=0.55, tom=(255, 110, 50), peso=0.16):
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(im).enhance(fator); im.putalpha(a)
    im = ImageEnhance.Color(im).enhance(0.85)
    return tingir(im, tom, peso)
campo = anoitecer(campo)

# luz depois do escurecimento: lava, fendas, janelas em chamas, portao
for (cx, cy, rx, ry) in LAGOS:
    brilho(campo, cx, cy, rx * 1.15, ry * 1.4, (255, 100, 20), 70, 40)
    brilho(campo, cx, cy, rx * .7, ry * .6, (255, 180, 60), 50, 30)
for poly in FENDAS:
    g = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(g).line(poly + [poly[0]], fill=(255, 110, 30, 100), width=4)
    campo.alpha_composite(g.filter(ImageFilter.GaussianBlur(4)))
for i, x in enumerate(range(-20, W, 240)):   # janelas do pano: 5 aberturas por pano, fogo dentro
    for dx, dy in [(24, 34), (72, 34), (120, 30), (168, 34), (216, 34)]:
        wx, wy = x + dx, PE - 144 + dy + 50
        if any(bx - 10 < wx < bx + bw + 10 for bx, bw in BRECHAS) or any(tx < wx < tx + 96 for tx in TORRES) or GX < wx < GX + 144:
            continue
        if random.random() < 0.6:
            brilho(campo, wx, wy, 10, 16, (255, 120, 30), 170, 5)
brilho(campo, GX + 72, MURO + 10, 120, 40, (255, 90, 20), 110, 20)   # o portao arde por baixo
brilho(campo, GX + 72, MURO - 40, 36, 44, (255, 150, 50), 120, 12)
for nome, x, y in OBJETOS_ALTOS:
    w, h = SPRITES[nome].size
    if nome.startswith('cristal'):
        brilho(campo, x + w // 2, y + h - 12, 46, 22, (255, 60, 40), 70, 14)
    if nome in ('braseiro', 'arvore_q', 'arvore_q2'):
        brilho(campo, x + w // 2, y + h * .3, 60, 50, (255, 120, 30), 80, 20)
# fumaca escura rolando e brasas no ar
fm = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(fm)
for _ in range(18):
    x, y = random.randint(-100, W), random.randint(MURO - 40, H - 150)
    d.ellipse((x, y, x + random.randint(200, 400), y + random.randint(30, 70)), fill=(20, 10, 8, random.randint(40, 70)))
campo.alpha_composite(fm.filter(ImageFilter.GaussianBlur(26)))
br = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(br)
for _ in range(300):
    x, y = random.randint(0, W), random.randint(0, H)
    d.point((x, y), fill=random.choice([(255, 160, 60), (255, 90, 30), (255, 220, 120)]) + (random.randint(120, 230),))
campo.alpha_composite(br)
vin = Image.new('L', (W, H), 0); ImageDraw.Draw(vin).rectangle((0, 0, W, H), fill=110)
ImageDraw.Draw(vin).ellipse((-180, -40, W + 180, H + 240), fill=0)
v = Image.new('RGBA', (W, H), (10, 2, 0, 255)); v.putalpha(vin.filter(ImageFilter.GaussianBlur(90)))
campo.alpha_composite(v)

campo.save(OUT + 'bg_act5_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act5', exist_ok=True)
for f in os.listdir(OUT + 'act5'):
    if f.endswith('.png') and f[:-4] not in SPRITES:
        os.remove(OUT + 'act5/' + f)
dims = {}
for nome, im in SPRITES.items():
    im = anoitecer(im); im.save(OUT + f'act5/{nome}.png'); dims[nome] = im.size
# base = y + ultima linha OPACA do sprite (nao a caixa): e onde o objeto toca o chao
fundo = {nome: (im.getbbox() or (0, 0, 0, im.height))[3] for nome, im in SPRITES.items()}
linhas = [f"  {{ src: './sprites/arena/act5/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + fundo[n]} }}," for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct5.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato5.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato V (O Fim de Grimhold). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = base.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT5_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: laje escura, chamuscada, rachaduras com brasa ───────────────
laje = interior(dung, 3, 0)
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, laje, 0, 0, 350 + T, H)
for (cx, cy, rx, ry) in [(80, 200, 90, 60), (280, 600, 80, 70), (150, 820, 90, 40)]:
    mancha(patio, rocha_ver, cx, cy, rx, ry, blur=20, alfa=160)
fu = Image.new('RGBA', patio.size, (0, 0, 0, 0)); d = ImageDraw.Draw(fu)
for _ in range(10):
    x, y, r = random.randint(0, 350), random.randint(0, H), random.randint(30, 70)
    d.ellipse((x - r, y - r * .6, x + r, y + r * .6), fill=(6, 2, 0, 110))
patio.alpha_composite(fu.filter(ImageFilter.GaussianBlur(18)))
RACHAS = []
for _ in range(6):
    x, y = random.randint(30, 320), random.randint(40, H - 60); pts = [(x, y)]
    for _ in range(5): pts.append((pts[-1][0] + random.randint(-16, 16), pts[-1][1] + random.randint(8, 18)))
    ImageDraw.Draw(patio).line(pts, fill=(12, 4, 2, 230), width=2); RACHAS.append(pts)
patio = anoitecer(patio, fator=0.55)
for pts in RACHAS:
    g = Image.new('RGBA', patio.size, (0, 0, 0, 0)); ImageDraw.Draw(g).line(pts, fill=(255, 90, 20, 150), width=4)
    patio.alpha_composite(g.filter(ImageFilter.GaussianBlur(3)))
    ImageDraw.Draw(patio).line(pts, fill=(255, 150, 60, 200), width=1)
pb = Image.new('RGBA', patio.size, (0, 0, 0, 0)); d = ImageDraw.Draw(pb)
for _ in range(60):
    d.point((random.randint(0, 350), random.randint(0, H)), fill=(255, 140, 60, random.randint(100, 200)))
patio.alpha_composite(pb)
patio.save(OUT + 'bg_act5_courtyard.png')
print('patio:', patio.size)

if PREVIA:
    prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
    prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
    for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + fundo[o[0]]):
        prev.alpha_composite(anoitecer(SPRITES[nome]), (350 + x, y))
    prev.convert('RGB').save(PREVIA)
    print('previa:', PREVIA)
