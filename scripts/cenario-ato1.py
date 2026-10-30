# ══════════════════════════════════════════════════════════════════════
# cenario-ato1.py — cenario do ATO I (O Cerco de Grimhold), versao 2.
#
# Refeito no molde dos cenarios recentes (cenario-ato9/10.py): estruturas
# MONTADAS a partir da grade das folhas, nada de ladrilho solto jogado.
# Tema mantido: o deserto a pino diante de Grimhold, sitiada. No topo, a
# MURALHA EXTERNA de arenito da cidade baixa, com contrafortes e o portao,
# rompida em dois pontos (entulho e paliçada remendando a brecha). No chao:
# areia, barro pisado das duas trilhas de marcha com sulcos de carroca,
# crateras de catapulta com borda revirada e entulho, tufos secos, pedras.
# Objetos altos (arvores mortas, cactos, suprimentos do cerco, pedregulhos,
# tumulos dos caidos, paliçadas) vao em OBJETOS_ALTOS, com profundidade.
#
# Fontes (assets-pixel/tilesets): tileB_desert (muralha de arenito, portao,
# paliçada, arvores mortas, cactos, barris, caixotes, pedras), tileA5_desert
# (areia, pedrisco, tufos), tileA5_cave (terra, pedrisco, pedra cinza),
# tileA2_dungeon (barro queimado das trilhas, laje do patio), tileB_outside
# (sacos, tumulos, cruz de madeira, lenha).
#
# A geometria do jogo nao muda: campo 1250x900, patio 350x900, muralha dos
# herois em x=350, inimigos andam em y 150-670 (SPAWN_MIN_Y/MAX_Y). A
# muralha de arenito fica toda acima de y=150.
#
# Saida: public/sprites/arena/bg_act1_field.png, bg_act1_courtyard.png,
#        act1/<obj>.png, components/data/arenaAct1.ts
# Uso:   python scripts/cenario-ato1.py   (ASSETS=<pasta> se assets-pixel
#        nao estiver na raiz)
# ══════════════════════════════════════════════════════════════════════
import random, math, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
TS = os.environ.get('ASSETS', 'assets-pixel') + '/tilesets/'
OUT = 'public/sprites/arena/'
PREVIA = os.environ.get('PREVIA')          # se definido, grava a previa composta ali
random.seed(7)

def sheet(p): return Image.open(TS + p).convert('RGBA')
def interior(sh, bx, by):
    x, y = bx * 96 + 24, by * 144 + 72
    return sh.crop((x, y, x + T, y + T))
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

# o tileB_desert nao tem transparencia sob os objetos: vem sobre areia bege
# (e alguns com capim amarelo na base). Vira transparente o que estiver perto
# dessas cores. O mesmo vale para os decalques do A5 (areia opaca).
AREIA = [((236, 219, 142), 28), ((206, 191, 124), 14), ((198, 170, 13), 40), ((245, 228, 24), 40)]
def sem_areia(im, cores=AREIA):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and any(abs(r - c[0]) + abs(g - c[1]) + abs(b - c[2]) <= tol for c, tol in cores):
                px[x, y] = (0, 0, 0, 0)
    return im
def sem_verde(im):   # capim verde na base de pecas do tileB_outside (o deserto nao tem grama)
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a and g > r + 8 and g > b + 8:
                px[x, y] = (0, 0, 0, 0)
    return im
def lado_a_lado(*pecas, junta=0):   # monta varias pecas numa so, alinhadas pela base
    w = sum(p.width for p in pecas) + junta * (len(pecas) - 1); h = max(p.height for p in pecas)
    im = Image.new('RGBA', (w, h), (0, 0, 0, 0)); x = 0
    for p in pecas:
        im.alpha_composite(p, (x, h - p.height)); x += p.width + junta
    return im

# ── fontes ──────────────────────────────────────────────────────────────
D   = sheet('tileB_desert.png')
A5  = sheet('tileA5_desert.png')
dun = sheet('tileA2_dungeon.png')
fora = sheet('tileB_outside.png')

areia     = A5.crop((48, 0, 96, 48))            # areia com marcas de vento
areia_l   = A5.crop((192, 0, 240, 48))          # areia lisa clara
cave      = sheet('tileA5_cave.png')
barro     = cave.crop((0, 144, 48, 192))        # terra marrom lisa (manchas; o A2 world tem grade de mapa-mundi)
cascalho  = cave.crop((48, 192, 96, 240))        # terra com pedrisco
revirada  = areia_l                             # borda das crateras: areia clara revirada
trilha    = interior(dun, 0, 0)                 # barro escuro pisado

# decalques de chao (pisa por cima): pedrisco e tufos secos do A5 desert
pedrisco = [recortar(sem_areia(A5.crop((c * T, T, c * T + T, 2 * T)))) for c in range(5)]   # 5-7 sao pedrinhas azuladas: destoam
tufos    = [recortar(sem_areia(A5.crop((c * T, 2 * T, c * T + T, 3 * T)), AREIA[:2])) for c in (0, 1, 2)]
cacos    = [recortar(sem_areia(D.crop(c))) for c in [(144, 240, 192, 288), (192, 240, 240, 288), (240, 240, 288, 288)]]

# ── muralha externa de arenito (tileB_desert, bloco 8-14 x 0-4) ─────────
# contraforte + pano: coluna redonda (432-467) e o pano liso ate a proxima
# coluna (541) — repetido de 109 em 109 da o ritmo coluna/pano sem costura
pano    = D.crop((432, 48, 541, 252))            # 109x204
coluna  = D.crop((541, 48, 576, 252))            # 35x204: fecha o ultimo pano
portao  = D.crop((576, 48, 720, 252))            # 144x204: portao em arco
janelas = D.crop((384, 288, 528, 432))           # 144x144: pano com janelas gradeadas
cerca   = D.crop((48, 624, 96, 672))             # paliçada horizontal (periodo de 24px)

# objetos altos
def sem_moita(im):   # a folha poe um tufo de capim (bloco 6-7 x 9) colado no pe da arvore grande
    im = im.copy(); im.paste((0, 0, 0, 0), (96, 144, 192, 192)); return im
arvore_g = sem_moita(sem_areia(D.crop((192, 288, 384, 480))))                   # arvore morta grande
arvore_p = sem_areia(D.crop((0, 288, 96, 480)))                                 # arvore morta pequena
cacto    = recortar(sem_areia(D.crop((288, 192, 336, 288))))
cacto2   = recortar(sem_areia(D.crop((336, 192, 384, 288))))
pedra_g  = recortar(sem_areia(D.crop((144, 48, 240, 96))))                      # pedregulho grande
pedra_p  = recortar(sem_areia(D.crop((48, 48, 96, 96))))
pedra_m  = recortar(sem_areia(D.crop((96, 48, 144, 96))))
barril   = recortar(D.crop((240, 96, 288, 192)))
barril_a = recortar(D.crop((288, 96, 336, 192)))
barril_c = recortar(D.crop((336, 96, 384, 192)))
caixa    = recortar(D.crop((48, 144, 96, 240)))
caixas   = recortar(D.crop((144, 144, 192, 240)))
caixa_f  = recortar(D.crop((192, 144, 240, 240)))
sacos    = recortar(fora.crop((240, 192, 336, 240)))
lenha    = recortar(sem_verde(fora.crop((336, 288, 384, 336))))
tumulo   = recortar(fora.crop((192, 264, 240, 336)))
tumulo2  = recortar(sem_verde(fora.crop((240, 264, 288, 336))))
cruz     = recortar(sem_verde(fora.crop((288, 264, 336, 336))))

# pecas montadas (estruturas, nao ladrilho solto)
suprimentos = lado_a_lado(caixas, barril, barril_c, junta=-6)                   # pilha do cerco
viveres     = lado_a_lado(sacos, caixa, junta=-4)
tumulos     = lado_a_lado(tumulo, cruz, tumulo2, junta=4)                        # caidos do cerco
barricada   = recortar(D.crop((0, 624, 192, 672)))                                # paliçada com a placa do cerco
cerca_c     = recortar(D.crop((0, 624, 144, 672)))
arvore_g, arvore_p = recortar(arvore_g), recortar(arvore_p)

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
MURO = 138                                         # pe da muralha de arenito (SPAWN_MIN_Y = 150)
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, areia, 0, 0, W, H)
for (cx, cy, rx, ry) in [(160, 780, 150, 60), (700, 360, 130, 50), (1150, 220, 110, 50), (400, 420, 110, 40)]:
    mancha(campo, areia_l, cx, cy, rx, ry, blur=24, alfa=200)
for (cx, cy, rx, ry) in [(260, 700, 180, 80), (620, 150, 220, 60), (1000, 430, 150, 90), (1120, 820, 140, 60), (480, 800, 120, 40)]:
    mancha(campo, barro, cx, cy, rx, ry, blur=30, alfa=210)
for (cx, cy, rx, ry) in [(840, 760, 120, 40), (150, 420, 80, 30), (1180, 560, 70, 40)]:
    mancha(campo, cascalho, cx, cy, rx, ry, blur=20, alfa=150)

# trilhas de marcha (mesmas alturas de antes: 18% e 54%), com margem ondulada
def trilha_marcha(y0, alt):
    m = Image.new('L', (W, H), 0); d = ImageDraw.Draw(m)
    topo = [(x, y0 + 10 * math.sin(x / 140.0 + y0) + random.randint(-3, 3)) for x in range(-20, W + 40, 20)]
    base = [(x, y0 + alt + 12 * math.sin(x / 170.0 + 1.7 * y0) + random.randint(-3, 3)) for x in range(W + 40, -40, -20)]
    d.polygon(topo + base, fill=235)
    com_mascara(campo, trilha, m, blur=14)
    # sulcos de roda: dois pares de linhas finas ao longo da trilha
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(s)
    for off in (alt * 0.3, alt * 0.3 + 26, alt * 0.66, alt * 0.66 + 26):
        pts = [(x, y0 + off + 5 * math.sin(x / 90.0 + off)) for x in range(-10, W + 20, 10)]
        ds.line(pts, fill=(40, 20, 12, 120), width=3)
        ds.line([(x, y + 3) for x, y in pts], fill=(200, 160, 120, 60), width=1)   # borda de luz do sulco
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(0.8)))
    # pegadas / marcas de casco (pontinhos escuros em fileira)
    p = ImageDraw.Draw(campo)
    for _ in range(60):
        x = random.randint(0, W); y = y0 + random.randint(12, alt - 8)
        p.rectangle((x, y, x + 2, y + 1), fill=(90, 56, 34, 70))
trilha_marcha(int(H * .18), 110)
trilha_marcha(int(H * .54), 120)

# crateras de catapulta: contorno irregular, anel de terra revirada (luz em
# cima, sombra embaixo), centro escuro, riscos de impacto, entulho na borda
CRATERAS = [(300, 250, 120, 44), (660, 520, 140, 52), (1020, 690, 110, 40), (930, 250, 70, 26)]
def contorno(cx, cy, rx, ry, k=0.18, n=28):
    return [(cx + math.cos(t) * rx * (1 + random.uniform(-k, k)), cy + math.sin(t) * ry * (1 + random.uniform(-k, k)))
            for t in [i * 2 * math.pi / n for i in range(n)]]
def cratera(cx, cy, rx, ry):
    risc = Image.new('RGBA', (W, H), (0, 0, 0, 0)); dr = ImageDraw.Draw(risc)
    for _ in range(14):   # riscos de impacto (terra escura espirrada)
        a = random.uniform(0, 2 * math.pi); r0, r1 = 1.0, random.uniform(1.5, 2.2)
        dr.line((cx + math.cos(a) * rx * r0, cy + math.sin(a) * ry * r0, cx + math.cos(a) * rx * r1, cy + math.sin(a) * ry * r1),
                fill=(70, 40, 22, 110), width=random.randint(2, 5))
    campo.alpha_composite(risc.filter(ImageFilter.GaussianBlur(2)))
    m = Image.new('L', (W, H), 0); ImageDraw.Draw(m).polygon(contorno(cx, cy, rx * 1.3, ry * 1.3), fill=255)
    ImageDraw.Draw(m).polygon(contorno(cx, cy, rx * 0.72, ry * 0.72, 0.1), fill=0)
    com_mascara(campo, revirada, m, blur=3)
    miolo = contorno(cx, cy + 3, rx * 0.78, ry * 0.76, 0.1)
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(s)
    ds.polygon(miolo, fill=(44, 24, 12, 235))
    ds.chord((cx - rx * 0.78, cy - ry * 0.7, cx + rx * 0.78, cy + ry * 0.5), 180, 360, fill=(22, 12, 6, 200))   # parede sombreada
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(2)))
    ImageDraw.Draw(campo).line(miolo[len(miolo) // 2 - 1:] + miolo[:2], fill=(255, 226, 170, 110), width=1)   # beirada de baixo pega sol
    for _ in range(7):   # entulho na borda
        a = random.uniform(0, 2 * math.pi); e = random.choice(cacos + pedrisco[:3])
        campo.alpha_composite(e, (int(cx + math.cos(a) * rx * 1.15) - e.width // 2, int(cy + math.sin(a) * ry * 1.15) - e.height // 2))
for c in CRATERAS: cratera(*c)

OBJETOS_ALTOS = [
    # (nome, x, y) — coordenadas do CAMPO (x=0 na muralha dos herois)
    ('barricada', 30, 300), ('cerca_c', 20, 470), ('barricada', 40, 700),
    ('arvore_g', 470, 150), ('arvore_g', 1070, 520), ('arvore_p', 850, 300), ('arvore_p', 700, 690),
    ('cacto', 1180, 300), ('cacto2', 380, 610), ('cacto', 1000, 170),
    ('suprimentos', 200, 330), ('viveres', 1040, 400), ('suprimentos', 880, 760),
    ('pedra_g', 560, 300), ('pedra_g', 180, 560), ('pedra_m', 1130, 700), ('pedra_p', 820, 620), ('pedra_m', 260, 770),
    ('tumulos', 470, 760), ('lenha', 330, 180),
]
SPRITES = {'barricada': barricada, 'cerca_c': cerca_c, 'arvore_g': arvore_g, 'arvore_p': arvore_p, 'cacto': cacto, 'cacto2': cacto2,
           'suprimentos': suprimentos, 'viveres': viveres, 'pedra_g': pedra_g, 'pedra_m': pedra_m,
           'pedra_p': pedra_p, 'tumulos': tumulos, 'lenha': lenha}

def ocupado(cx, cy, folga=8):
    for nome, ox, oy in OBJETOS_ALTOS:
        im = SPRITES[nome]
        if ox - folga < cx < ox + im.width + folga and oy - folga < cy < oy + im.height + folga:
            return True
    return any((cx - x) ** 2 / (rx * 1.4) ** 2 + (cy - y) ** 2 / (ry * 1.4) ** 2 < 1 for x, y, rx, ry in CRATERAS)

# miudos de chao: pedrisco em todo lado, tufos secos so fora das trilhas
def em_trilha(y): return int(H * .18) - 10 < y < int(H * .18) + 120 or int(H * .54) - 10 < y < int(H * .54) + 130
for _ in range(120):
    e = random.choice(pedrisco); x, y = random.randint(0, W - e.width), random.randint(MURO + 10, H - e.height)
    if not ocupado(x + e.width / 2, y + e.height / 2): campo.alpha_composite(e, (x, y))
for _ in range(70):
    e = random.choice(tufos); x, y = random.randint(0, W - e.width), random.randint(MURO + 10, H - e.height)
    if not em_trilha(y + e.height) and not ocupado(x + e.width / 2, y + e.height / 2): campo.alpha_composite(e, (x, y))
for _ in range(10):
    e = random.choice(cacos); x, y = random.randint(0, W - e.width), random.randint(MURO + 20, H - e.height)
    if not ocupado(x + e.width / 2, y + e.height / 2): campo.alpha_composite(e, (x, y))

# ── a MURALHA EXTERNA no topo: uma peca so ─────────────────────────────
# panos com contraforte de 109 em 109; o portao no meio; dois panos com
# janelas; duas BRECHAS (o cerco ja abriu a muralha): o pano some, fica o
# entulho e a paliçada remendando.
mur = Image.new('RGBA', (W, 260), (0, 0, 0, 0))
PE = MURO + 6                                       # pe da muralha na camada (a coluna tem 6px de pe abaixo do pano)
GX = 560                                            # portao
BRECHAS = [2, 9]
x, k, pecas = -40, 0, []
while x < W:
    if GX - 109 < x + 109 and x < GX + portao.width and x >= GX - 109 and not any(p[0] == 'portao' for p in pecas):
        pecas.append(('portao', GX)); x = GX + portao.width; continue
    pecas.append(('brecha' if k in BRECHAS else ('janelas' if k in (5, 11) else 'pano'), x)); x += 109; k += 1
for tipo, x in pecas:
    if tipo == 'pano':
        mur.alpha_composite(pano, (x, PE - pano.height))
    elif tipo == 'janelas':
        mur.alpha_composite(pano, (x, PE - pano.height))
        mur.alpha_composite(janelas.crop((0, 0, 72, 144)), (x + 35, PE - pano.height + 60))
    elif tipo == 'portao':
        mur.alpha_composite(coluna, (x - coluna.width, PE - coluna.height))
        mur.alpha_composite(portao, (x, PE - portao.height))
    else:   # brecha: so a coluna da esquerda fica, com o topo quebrado
        c = pano.crop((0, 0, 36, pano.height)); corte = random.randint(70, 100)
        c = c.crop((0, corte, 36, c.height))
        mur.alpha_composite(c, (x, PE - c.height))
# sombra da muralha no chao e colagem (a do portao fica escura: e um vao)
sp = Image.new('RGBA', (W, H), (0, 0, 0, 0)); ds = ImageDraw.Draw(sp)
for tipo, x in pecas:
    if tipo != 'brecha':
        ds.rectangle((x, MURO - 4, x + (portao.width if tipo == 'portao' else 109), MURO + 22), fill=(40, 20, 8, 120))
campo.alpha_composite(sp.filter(ImageFilter.GaussianBlur(8)))
campo.alpha_composite(mur, (0, 0))
# entulho das brechas + paliçada remendando
for tipo, x in pecas:
    if tipo != 'brecha': continue
    for dx in range(36, 109, 24):
        campo.alpha_composite(cerca.crop((0, 0, 24, 48)), (x + dx, MURO - 44))
    for (dx, dy, e) in [(10, -24, pedra_g), (60, -14, pedra_m), (-6, -4, pedra_p), (84, -2, random.choice(cacos))]:
        campo.alpha_composite(e, (x + dx, MURO - e.height + dy + 18))
# pe da muralha: areia acumulada e pedrisco
for x in range(0, W, 38):
    if GX - 10 < x < GX + portao.width + 10: continue
    e = random.choice(pedrisco + tufos); campo.alpha_composite(e, (x + random.randint(-8, 8), MURO - e.height // 2 + random.randint(2, 10)))

# sombras dos objetos altos (sol a pino do alto-esquerda: deslocada p/ direita)
for nome, x, y in OBJETOS_ALTOS:
    im = SPRITES[nome]; w, h = im.size
    sx, sy = x + w * 0.5 + 12, y + h - 5
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((sx - w * 0.45, sy - max(7, h * 0.07), sx + w * 0.45, sy + max(7, h * 0.07)), fill=(40, 18, 4, 130))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(4)))

# ── luz: sol forte de deserto (decisao do Marcos, 17/9) ────────────────
def sol(im, fator=0.9, tom=(255, 232, 180), peso=0.12):
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(im).enhance(fator); im.putalpha(a)
    im = ImageEnhance.Color(im).enhance(0.8)
    return tingir(im, tom, peso)
campo = sol(campo)

def brilho(dst, cx, cy, rx, ry, cor, a, blur):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(blur)))
brilho(campo, 100, -100, 700, 560, (255, 240, 200), 60, 150)        # clarao do alto-esquerda
brilho(campo, GX + 72, MURO + 30, 110, 40, (20, 8, 2), 90, 20)      # o vao do portao escurece o chao
# poeira em suspensao no ar, bem leve
fl = Image.new('RGBA', (W, H), (0, 0, 0, 0)); d = ImageDraw.Draw(fl)
for _ in range(20):
    x, y = random.randint(-100, W), random.randint(MURO, H)
    d.ellipse((x, y, x + random.randint(200, 420), y + random.randint(30, 60)), fill=(255, 230, 180, random.randint(14, 26)))
campo.alpha_composite(fl.filter(ImageFilter.GaussianBlur(26)))
# as bordas do campo escurecem um pouco (o JSX ainda poe vinheta por cima)
vin = Image.new('L', (W, H), 0); ImageDraw.Draw(vin).rectangle((0, 0, W, H), fill=70)
ImageDraw.Draw(vin).ellipse((-200, -100, W + 200, H + 160), fill=0)
esc = Image.new('RGBA', (W, H), (30, 14, 4, 255)); esc.putalpha(vin.filter(ImageFilter.GaussianBlur(80)))
campo.alpha_composite(esc)

campo.save(OUT + 'bg_act1_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act1', exist_ok=True)
for f in os.listdir(OUT + 'act1'):   # limpa sprites que nao existem mais
    if f.endswith('.png') and f[:-4] not in SPRITES:
        os.remove(OUT + 'act1/' + f)
dims, fundo = {}, {}
for nome, im in SPRITES.items():
    im = sol(im); im.save(OUT + f'act1/{nome}.png'); dims[nome] = im.size
    fundo[nome] = (im.getbbox() or (0, 0, 0, im.height))[3]
linhas = [f"  {{ src: './sprites/arena/act1/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + fundo[n]} }},"
          for n, x, y in OBJETOS_ALTOS]
with open('components/data/arenaAct1.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato1.py — nao editar na mao.\n"
            "// Objetos altos do cenario do Ato I. x,y sao do CAMPO INIMIGO (x=0 na\n"
            "// muralha); quem desenha soma BARRIER_X. A profundidade e a base (ou y + h).\n"
            "export interface ArenaObject { src: string; x: number; y: number; w: number; h: number; base?: number }\n"
            "export const ARENA_ACT1_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO DO JOGADOR: 350 x 900 ─────────────────────────────────────────
# laje de pedra cinza da fortaleza, gasta: lajes mais claras e mais escuras,
# areia que o vento traz pela muralha, rachaduras e pedrisco. So chao — a
# grade de posicionamento e desenhada por cima durante o arraste.
laje   = interior(dun, 3, 0)
laje_b = cave.crop((240, 0, 288, 48))           # pedra cinza da caverna (lajes mais gastas)
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, laje, 0, 0, 350 + T, H)
for (cx, cy, rx, ry) in [(80, 180, 90, 60), (260, 520, 90, 80), (120, 760, 100, 50)]:
    mancha(patio, laje_b, cx, cy, rx, ry, blur=20, alfa=120)
for (cx, cy, rx, ry) in [(360, 300, 40, 110), (360, 700, 36, 100)]:   # areia soprada pela muralha
    mancha(patio, areia, cx, cy, rx, ry, blur=26, alfa=170)
dp = ImageDraw.Draw(patio)
for _ in range(7):   # rachaduras nas lajes
    x, y = random.randint(20, 330), random.randint(20, H - 40); pts = [(x, y)]
    for _ in range(4): pts.append((pts[-1][0] + random.randint(-14, 14), pts[-1][1] + random.randint(8, 20)))
    dp.line(pts, fill=(30, 28, 26, 170), width=1)
for _ in range(9):
    e = random.choice(pedrisco[:3]); patio.alpha_composite(e, (random.randint(0, 350 - e.width), random.randint(10, H - e.height)))
patio = sol(patio, fator=0.78)
patio.save(OUT + 'bg_act1_courtyard.png')
print('patio:', patio.size)

if PREVIA:
    prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
    prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
    for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + fundo[o[0]]):
        prev.alpha_composite(sol(SPRITES[nome]), (350 + x, y))
    prev.convert('RGB').save(PREVIA)
    print('previa:', PREVIA)
