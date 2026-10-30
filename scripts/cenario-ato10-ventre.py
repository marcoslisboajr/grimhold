# ══════════════════════════════════════════════════════════════════════
# cenario-ato10-ventre.py — cenario da LUTA FINAL do Ato X: o interior da
# Fome. A arena e engolida depois do Malachar; muralha e herois ficam no
# mesmo lugar, o resto vira carne. Chao de carne e gordura, pocas de acido,
# parede de fibra com veias e costelas no topo, a garganta ao fundo, e os
# 4 Pontos Fracos (olhos no chao, ao alcance dos herois). Mesmo molde do
# cenario-ato10.py.
#
# Fontes (assets-pixel/personagens/monsterbelly/RMMVZ, grade de 48px,
# pecas testadas lado a lado antes de usar):
#   tileA5: piso de carne (0,48); gordura (192,384); parede de fibra
#           (48..96, 144..336); veia azul (192,144..336); costela (240..
#           336, 144..336); olho da parede (336,192/240/288 = 3 quadros);
#           arco da garganta (0..144, 336..528)
#   tileA1: acido verde (interior do bloco 0)
#   tileB:  pustulas, presas, colunas de osso, osso partido, anel de osso,
#           caroços, espinhos
#
# Toda peca alta vai em OBJETOS_ALTOS (profundidade): ninguem anda por cima.
# Saida: public/sprites/arena/bg_act10b_field.png, bg_act10b_courtyard.png,
#        act10b/<obj>.png, act10b/olho_1..3.png (Ponto Fraco, animado),
#        components/data/arenaAct10b.ts (objetos + posicoes dos 4 Pontos)
# Uso:   python scripts/cenario-ato10-ventre.py
# ══════════════════════════════════════════════════════════════════════
import random, os, glob
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
MB = 'assets-pixel/personagens/monsterbelly/RMMVZ/'
OUT = 'public/sprites/arena/'
random.seed(1030)

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
a5 = sheet(MB + 'tf_insidebelly_tileA5_3.png')
a1 = sheet(MB + 'tf_insidebelly_tileA1_3.png')
b  = sheet(MB + 'tf_insidebelly_tileB_3.png')

piso     = a5.crop((0, 48, 48, 96))
piso_b   = a5.crop((48, 48, 96, 96))
gordura  = a5.crop((192, 384, 240, 432))
acido    = a1.crop((24, 72, 72, 120))
parede   = a5.crop((48, 144, 96, 336))            # fibra (192 de altura, com franja embaixo)
veia     = a5.crop((192, 144, 240, 336))          # fibra com veia azul
costela  = a5.crop((240, 144, 336, 336))          # duas costelas
olho     = [a5.crop((336, y, 384, y + 48)) for y in (192, 240, 288)]   # Ponto Fraco: 3 quadros
garganta = a5.crop((0, 336, 144, 528))            # arco da garganta

pustula  = recortar(b.crop((240, 48, 288, 96)))
pustula_p = recortar(b.crop((192, 48, 240, 96)))
furo     = recortar(b.crop((0, 48, 48, 96)))
presa    = recortar(b.crop((288, 48, 336, 192)))
presa_b  = recortar(b.crop((336, 48, 384, 192)))
espinhos = recortar(b.crop((144, 96, 192, 144)))
olho_pod = recortar(b.crop((48, 144, 96, 192)))
osso     = recortar(b.crop((0, 288, 48, 432)))    # coluna de osso inteira
osso_p   = recortar(b.crop((48, 288, 96, 432)))   # osso partido
anel     = recortar(b.crop((144, 336, 192, 432))) # anel de osso
carocos  = [recortar(b.crop(c)) for c in [(48, 0, 96, 48), (192, 0, 240, 48), (240, 0, 288, 48), (96, 96, 144, 144), (192, 96, 240, 144)]]

# ── CAMPO: 1250 x 900 ──────────────────────────────────────────────────
W, H = 1250, 900
campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, piso, 0, 0, W, H)
for (cx, cy, rx, ry) in [(240, 420, 160, 90), (760, 300, 200, 80), (1000, 720, 180, 90), (520, 760, 150, 60)]:
    mancha(campo, piso_b, cx, cy, rx, ry, blur=24, alfa=200)
for (cx, cy, rx, ry) in [(420, 560, 130, 60), (900, 470, 110, 55), (160, 760, 90, 45), (1120, 260, 90, 50)]:
    mancha(campo, gordura, cx, cy, rx, ry, blur=18, alfa=230)

# pocas de acido (chao: pisa por cima) com borda escura
for (cx, cy, rx, ry) in [(640, 520, 110, 45), (300, 250, 80, 32), (1040, 560, 70, 30), (820, 800, 95, 35)]:
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((cx - rx - 8, cy - ry - 6, cx + rx + 8, cy + ry + 6), fill=(60, 10, 20, 170))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(6)))
    mancha(campo, acido, cx, cy, rx, ry, blur=5, alfa=240)

# caroços e furos no chao
for _ in range(34):
    e = random.choice(carocos + [furo])
    campo.alpha_composite(e, (random.randint(0, W - 48), random.randint(170, 860)))

# ── parede do topo: fibra com veias e costelas; a garganta no centro ───
TOPO = -40
x = 0; i = 0
while x < W:
    if 540 <= x < 540 + garganta.width:
        x += 48; continue
    pedaco = costela if i % 7 == 3 else (veia if i % 5 == 2 else parede)
    campo.alpha_composite(pedaco, (x, TOPO))
    x += pedaco.width; i += 1
campo.alpha_composite(garganta, (556, TOPO - 10))
sombra = Image.new('RGBA', (W, H), (0, 0, 0, 0))
ImageDraw.Draw(sombra).rectangle((0, TOPO + 186, W, TOPO + 200), fill=(30, 0, 10, 140))
campo.alpha_composite(sombra.filter(ImageFilter.GaussianBlur(6)))

# ── os 4 Pontos Fracos: olhos que brotam do chao, perto da muralha ─────
# (o jogo desenha os olhos animados por cima; aqui so a carne em volta)
# Etapa 3b: puxados da parede da direita (x 1170-1190, fora do alcance de
# todo heroi) para x ~400: o heroi de alcance mais curto (Yue, 420) na
# Vanguarda alcanca cada um da fileira dele (tests/chefes/fome.test.ts)
PONTOS = [(395, 210), (405, 400), (395, 560), (400, 680)]   # y <= 680: acima da barra da HUD (SPAWN_MAX_Y)
for (px, py) in PONTOS:
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((px - 44, py - 40, px + 44, py + 40), fill=(90, 10, 30, 200))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(8)))
# faixa de fibra na borda direita (onde os olhos ficam presos)
dir_ = parede.crop((0, 40, 48, 150)).rotate(90, expand=True)
for y in range(150, H, dir_.height):
    campo.alpha_composite(dir_, (W - dir_.width, y))

OBJETOS_ALTOS = [
    ('osso', 120, 170), ('osso_p', 980, 150), ('presa', 330, 380), ('presa_b', 720, 620),
    ('anel', 880, 330), ('pustula', 470, 190), ('pustula', 240, 640), ('pustula_p', 1010, 460),
    ('olho_pod', 610, 700), ('espinhos', 150, 480), ('presa', 860, 760), ('osso', 440, 780),
]
SPRITES = {'osso': osso, 'osso_p': osso_p, 'presa': presa, 'presa_b': presa_b, 'anel': anel,
           'pustula': pustula, 'pustula_p': pustula_p, 'olho_pod': olho_pod, 'espinhos': espinhos}

for nome, x, y in OBJETOS_ALTOS:
    im = SPRITES[nome]; w = im.width
    sx, sy = x + w / 2, y + im.height - 6
    s = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    ImageDraw.Draw(s).ellipse((sx - w * 0.45, sy - 8, sx + w * 0.45, sy + 8), fill=(30, 0, 10, 130))
    campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))

# ── luz de dentro da Fome: vermelho escuro, pulsando (o jogo pulsa) ───
def ventre(im, fator=0.72, tom=(90, 0, 20), peso=0.22):
    a = im.getchannel('A')
    im = ImageEnhance.Brightness(im).enhance(fator); im.putalpha(a)
    return tingir(im, tom, peso)

campo = ventre(campo)

def brilho(dst, cx, cy, r, cor, a):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - r, cy - r, cx + r, cy + r), fill=cor + (a,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(r * 0.45)))
for (cx, cy) in [(640, 520), (300, 250), (1040, 560), (820, 800)]:   # acido brilha
    brilho(campo, cx, cy, 70, (140, 255, 90), 40)
brilho(campo, 628, 120, 120, (255, 60, 60), 50)                      # garganta
for (px, py) in PONTOS:                                              # olhos
    brilho(campo, px, py, 60, (255, 200, 120), 45)
# vinheta
vin = Image.new('L', (W, H), 0); ImageDraw.Draw(vin).ellipse((-200, -150, W + 200, H + 150), fill=255)
esc = Image.new('RGBA', (W, H), (20, 0, 5, 200)); esc.putalpha(ImageChops.invert(vin.filter(ImageFilter.GaussianBlur(120))).point(lambda v: int(v * 0.8)))
campo.alpha_composite(esc)

campo.save(OUT + 'bg_act10b_field.png')
print('campo:', campo.size)

os.makedirs(OUT + 'act10b', exist_ok=True)
for f in glob.glob(OUT + 'act10b/*.png'): os.remove(f)
dims = {}
for nome, im in SPRITES.items():
    im = ventre(im); im.save(OUT + f'act10b/{nome}.png'); dims[nome] = im.size
def redondo(im):
    # o olho vem num quadrado de parede: recorta em circulo com borda suave
    m = Image.new('L', im.size, 0); ImageDraw.Draw(m).ellipse((3, 3, im.width - 3, im.height - 3), fill=255)
    im = im.copy(); im.putalpha(ImageChops.multiply(im.getchannel('A'), m.filter(ImageFilter.GaussianBlur(2))))
    return im
for i, q in enumerate(olho, 1):
    redondo(ventre(q, fator=0.95, peso=0.1).resize((72, 72), Image.NEAREST)).save(OUT + f'act10b/olho_{i}.png')
linhas = [f"  {{ src: './sprites/arena/act10b/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + dims[n][1]} }}," for n, x, y in OBJETOS_ALTOS]
pontos = [f"  {{ x: {x}, y: {y} }}," for x, y in PONTOS]
with open('components/data/arenaAct10b.ts', 'w', encoding='utf-8') as f:
    f.write("// GERADO por scripts/cenario-ato10-ventre.py — nao editar na mao.\n"
            "// Objetos altos do interior da Fome (luta final do Ato X). x,y do CAMPO\n"
            "// INIMIGO (x=0 na muralha); quem desenha soma BARRIER_X. Profundidade = y + h.\n"
            "import type { ArenaObject } from './arenaAct1';\n"
            "export const ARENA_ACT10B_OBJECTS: ArenaObject[] = [\n" + "\n".join(linhas) + "\n];\n"
            "// Centro dos 4 Pontos Fracos (olhos no chao, ao alcance dos herois); sprite act10b/olho_1..3.png (72x72).\n"
            "export const PONTOS_FRACOS_ACT10B: { x: number; y: number }[] = [\n" + "\n".join(pontos) + "\n];\n")
print('objetos altos:', len(OBJETOS_ALTOS))

# ── PATIO: carne escura (a muralha foi engolida junto) ─────────────────
patio = Image.new('RGBA', (350, H), (0, 0, 0, 255))
azulejar(patio, piso_b, 0, 0, 350 + 48, H)
for (cx, cy, rx, ry) in [(90, 260, 70, 40), (240, 640, 80, 45)]:
    mancha(patio, gordura, cx, cy, rx, ry, blur=18, alfa=180)
patio = ventre(patio, fator=0.55)
patio.save(OUT + 'bg_act10b_courtyard.png')
print('patio:', patio.size)

prev = Image.new('RGBA', (350 + W, H), (0, 0, 0, 255))
prev.alpha_composite(patio, (0, 0)); prev.alpha_composite(campo, (350, 0))
for nome, x, y in sorted(OBJETOS_ALTOS, key=lambda o: o[2] + dims[o[0]][1]):
    prev.alpha_composite(ventre(SPRITES[nome]), (350 + x, y))
o1 = Image.open(OUT + 'act10b/olho_1.png').convert('RGBA')
for (px, py) in PONTOS:
    prev.alpha_composite(o1, (350 + px - 36, py - 36))
prev.convert('RGB').save('release-demo/previa-ato10-ventre.png')
print('previa: release-demo/previa-ato10-ventre.png')
