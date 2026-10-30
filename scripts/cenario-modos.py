# ══════════════════════════════════════════════════════════════════════
# cenario-modos.py — cenarios dos MODOS extras, no mesmo molde dos atos:
#   endless    → Catacumbas (Infinito): laje palida de ruina, parede de
#                caveiras no topo, lapides e caixoes
#   pacifist   → Vila em ruinas (Pacifista): grama, estrada de terra,
#                paredes de casa arruinadas no topo, cercas, caixotes, barris
#   randomizer → Selva (Randomizador): chao de mata, arvores enormes,
#                moitas e flores
#
# Fontes (assets-pixel/tilesets): catacombs_p_3x, tf_ruindungeons,
# tileC_HOUSE_RUINED, tileB_outside, tileA2_outside, tileA2_world,
# tf_jungle, tileA2_dungeon (patio).
#
# Saida: public/sprites/arena/bg_<modo>_field.png, bg_<modo>_courtyard.png,
#        <modo>/<obj>.png e components/data/arenaModos.ts
# Uso:   python scripts/cenario-modos.py
# ══════════════════════════════════════════════════════════════════════
import random, os
from PIL import Image, ImageEnhance, ImageDraw, ImageFilter, ImageChops

T = 48
TILES = 'assets-pixel/tilesets/'
OUT = 'public/sprites/arena/'
W, H = 1250, 900

def sheet(p): return Image.open(TILES + p).convert('RGBA')
def interior(sh, bx, by):
    x, y = bx * 96 + 24, by * 144 + 72
    return sh.crop((x, y, x + T, y + T))
def recorte(sh, c0, r0, c1, r1): return sh.crop((c0 * T, r0 * T, c1 * T, r1 * T))
def azulejar(dst, tile, x0, y0, x1, y1):
    for y in range(y0, y1, T):
        for x in range(x0, x1, T):
            dst.paste(tile, (x, y), tile)
def com_mascara(dst, tile, mask, blur=0):
    cam = Image.new('RGBA', dst.size, (0, 0, 0, 0)); azulejar(cam, tile, 0, 0, dst.width, dst.height)
    cam.putalpha(mask.filter(ImageFilter.GaussianBlur(blur)) if blur else mask); dst.alpha_composite(cam)
def mancha(dst, tile, cx, cy, rx, ry, blur=26, alfa=255):
    m = Image.new('L', dst.size, 0); ImageDraw.Draw(m).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=alfa)
    com_mascara(dst, tile, m, blur)
def faixa_suave(dst, tile, y0, y1, borda=22, alfa=255):
    m = Image.new('L', dst.size, 0); ImageDraw.Draw(m).rectangle((0, y0, dst.width, y1), fill=alfa)
    com_mascara(dst, tile, m, borda)
def escurecer(im, f):
    im = ImageEnhance.Brightness(im).enhance(f); return ImageEnhance.Color(im).enhance(0.7)
def tingir(im, fator, tom, peso, cor=0.8):
    im = ImageEnhance.Brightness(im).enhance(fator)
    im = ImageEnhance.Color(im).enhance(cor)
    tinta = Image.new('RGBA', im.size, tom + (0,))
    tinta.putalpha(ImageChops.multiply(im.getchannel('A'), Image.new('L', im.size, int(255 * peso))))
    return Image.alpha_composite(im, tinta)
def sombras(campo, objetos, sprites, dx=10, cor=(0, 0, 0, 115)):
    for nome, x, y in objetos:
        w, h = sprites[nome].size
        sx, sy = x + w * 0.5 + dx, y + h - 6
        s = Image.new('RGBA', campo.size, (0, 0, 0, 0))
        ImageDraw.Draw(s).ellipse((sx - w * 0.42, sy - max(7, h * 0.07), sx + w * 0.42, sy + max(7, h * 0.07)), fill=cor)
        campo.alpha_composite(s.filter(ImageFilter.GaussianBlur(5)))
def trilhas(campo, tile, alfa=255):
    faixa_suave(campo, tile, int(H * .18), int(H * .18) + 110, alfa=alfa)
    faixa_suave(campo, tile, int(H * .54), int(H * .54) + 120, alfa=alfa)

dung = sheet('tileA2_dungeon.png')
laje_patio = interior(dung, 3, 0)

def salvar(modo, campo, objetos, sprites, tinta, patio_extra=None, patio_fator=0.55):
    campo = tinta(campo); campo.save(OUT + f'bg_{modo}_field.png')
    os.makedirs(OUT + modo, exist_ok=True)
    dims, fundo = {}, {}
    for nome, im in sprites.items():
        im2 = tinta(im); im2.save(OUT + f'{modo}/{nome}.png'); dims[nome] = im2.size
        fundo[nome] = (im2.getbbox() or (0, 0, 0, im2.height))[3]
    linhas = [f"  {{ src: './sprites/arena/{modo}/{n}.png', x: {x}, y: {y}, w: {dims[n][0]}, h: {dims[n][1]}, base: {y + fundo[n]} }}," for n, x, y in objetos]
    patio = Image.new('RGBA', (350, H), (0, 0, 0, 255)); azulejar(patio, laje_patio, 0, 0, 350 + T, H)
    if patio_extra: patio_extra(patio)
    tinta(patio).save(OUT + f'bg_{modo}_courtyard.png')
    print(modo, 'ok:', len(objetos), 'objetos')
    return linhas

TS = ["// GERADO por scripts/cenario-modos.py — nao editar na mao.",
      "// Objetos altos dos modos extras. x,y do CAMPO INIMIGO (x=0 na muralha);",
      "// quem desenha soma BARRIER_X. Profundidade = base.",
      "import type { ArenaObject } from './arenaAct1';"]

# ══════════════════════════════════════════════════════════════════════
# INFINITO — Catacumbas
# ══════════════════════════════════════════════════════════════════════
random.seed(51)
cat   = sheet('catacombs_p_3x.png')
ruins = sheet('tf_ruindungeons/48_RMMV/tf_A5_ruins1.png')
outb  = sheet('tileB_outside.png')

laje   = recorte(ruins, 2, 2, 3, 3)          # pedra palida de ruina
laje2  = recorte(ruins, 0, 1, 1, 2)          # variante
terra  = interior(dung, 0, 0)                # marrom queimado (trilhas)
parede_caveiras = recorte(cat, 0, 0, 5, 3)   # 240x144, parede de caveiras
caixao  = recorte(cat, 0, 5, 2, 7)           # 96x96, laje/caixao
caixao2 = recorte(cat, 4, 5, 6, 7)           # 96x96, laje tombada
lapide  = recorte(outb, 4, 5, 6, 7)          # 96x96, lapides
cruz    = recorte(outb, 6, 5, 7, 7)          # 48x96, cruz
ossos   = recorte(cat, 6, 6, 8, 7)           # 96x48, ossos (baixo)

campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, laje, 0, 0, W, H)
for (cx, cy, rx, ry) in [(300, 380, 160, 80), (800, 700, 170, 70), (1050, 400, 120, 90)]:
    mancha(campo, laje2, cx, cy, rx, ry)
trilhas(campo, terra, alfa=170)
for _ in range(8):
    x, y = random.randint(150, W - 200), random.choice([random.randint(290, 470), random.randint(620, 800)])
    campo.paste(ossos, (x, y), ossos)
pc = escurecer(parede_caveiras, 0.75)
for x in range(-60, W, parede_caveiras.width):
    campo.paste(pc, (x, -40), pc)
OBJ = [('caixao', 300, 330), ('caixao2', 900, 340), ('caixao', 640, 640), ('lapide', 480, 360), ('lapide', 1100, 360),
       ('lapide', 200, 660), ('cruz', 780, 330), ('cruz', 1000, 660), ('caixao2', 1150, 700)]
SPR = {'caixao': caixao, 'caixao2': caixao2, 'lapide': lapide, 'cruz': cruz}
sombras(campo, OBJ, SPR)
tinta_cat = lambda im: tingir(im, 0.5, (110, 130, 170), 0.14, cor=0.6)
TS.append("export const ARENA_ENDLESS_OBJECTS: ArenaObject[] = [\n" + "\n".join(salvar('endless', campo, OBJ, SPR, tinta_cat)) + "\n];")

# ══════════════════════════════════════════════════════════════════════
# PACIFISTA — Vila em ruinas
# ══════════════════════════════════════════════════════════════════════
random.seed(52)
outside = sheet('tileA2_outside.png')
world   = sheet('tileA2_world.png')
casa    = sheet('tileC_HOUSE_RUINED.png')

grama  = interior(outside, 0, 0)
grama2 = interior(outside, 1, 0)
estrada = interior(world, 1, 0)
parede_casa  = recorte(casa, 0, 5, 4, 9)     # 192x192, parede de reboco arruinada com janelas
parede_pedra = recorte(casa, 8, 0, 12, 4)    # 192x192, parede de pedra com janela tapada
cerca_h = recorte(outb, 0, 5, 3, 6)          # 144x48, cerca (baixo, pintado)
caixote = recorte(outb, 1, 1, 3, 3)          # 96x96, caixotes
barril  = recorte(outb, 0, 3, 2, 4)          # 96x48, barris
tronco  = recorte(outb, 4, 8, 8, 10)         # 192x96, tronco caido
arvore  = recorte(outb, 8, 0, 12, 4)         # 192x192, arvore pequena inteira (copa + tronco + raiz)
feno    = recorte(outb, 4, 3, 5, 5)          # 48x96, feno
lapide  = recorte(outb, 4, 5, 6, 7)

campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, grama, 0, 0, W, H)
for (cx, cy, rx, ry) in [(250, 400, 150, 70), (700, 720, 170, 60), (1000, 380, 130, 90)]:
    mancha(campo, grama2, cx, cy, rx, ry)
trilhas(campo, estrada)
for x in range(160, 1100, 400):
    campo.paste(cerca_h, (x, 300), cerca_h)
for x in range(300, 1200, 420):
    campo.paste(cerca_h, (x, 640), cerca_h)
for i, x in enumerate(range(-40, W, 192)):
    p = escurecer(parede_casa if i % 2 == 0 else parede_pedra, 0.85)
    campo.paste(p, (x, -60), p)
OBJ = [('arvore', 380, 290), ('arvore', 1050, 290), ('arvore', 700, 620),
       ('caixote', 560, 360), ('caixote', 220, 680), ('barril', 900, 400), ('barril', 1150, 700),
       ('tronco', 240, 380), ('feno', 1000, 640), ('lapide', 480, 700)]
SPR = {'arvore': arvore, 'caixote': caixote, 'barril': barril, 'tronco': tronco, 'feno': feno, 'lapide': lapide}
sombras(campo, OBJ, SPR)
tinta_vila = lambda im: tingir(im, 0.7, (255, 210, 150), 0.12, cor=0.85)
TS.append("export const ARENA_PACIFIST_OBJECTS: ArenaObject[] = [\n" + "\n".join(salvar('pacifist', campo, OBJ, SPR, tinta_vila)) + "\n];")

# ══════════════════════════════════════════════════════════════════════
# RANDOMIZADOR — Selva
# ══════════════════════════════════════════════════════════════════════
random.seed(53)
ja2 = sheet('tf_jungle/rpgmaker/RMMV/tf_jungle_a2.png')
jb  = sheet('tf_jungle/rpgmaker/RMMV/tf_jungle_b.png')

chao_selva = interior(ja2, 0, 0)
chao_selva2 = interior(ja2, 1, 0)
lama = interior(ja2, 2, 0)
arvore_g = recorte(jb, 0, 6, 5, 12)          # 240x288, arvore media
arvore_topo = recorte(jb, 8, 1, 14, 6)       # 288x240, arvore grande (borda de cima)
moita = recorte(jb, 5, 6, 7, 7)              # 96x48, moita redonda (a de (5,4) vinha com canteiro de terra — parecia caixa)
moita_p = recorte(jb, 5, 7, 7, 8)            # 96x48, moita menor
flores = recorte(jb, 0, 1, 3, 2)             # 144x48, flores brancas (baixo) — sem a coluna 3, que vinha cortada
flores2 = recorte(jb, 0, 2, 3, 3)            # 144x48, flores amarelas
pedra = recorte(jb, 0, 4, 2, 6)              # 96x96, pedras com musgo

campo = Image.new('RGBA', (W, H), (0, 0, 0, 255))
azulejar(campo, chao_selva, 0, 0, W, H)
for (cx, cy, rx, ry) in [(300, 420, 160, 80), (800, 720, 170, 60), (1000, 360, 140, 90)]:
    mancha(campo, chao_selva2, cx, cy, rx, ry)
trilhas(campo, lama, alfa=220)
for (x, y) in [(200, 300), (900, 330), (500, 700), (1050, 760)]:
    f = flores if x % 2 == 0 else flores2; campo.paste(f, (x, y), f)
for i, x in enumerate(range(-100, W, arvore_topo.width - 70)):
    campo.paste(arvore_topo, (x, -150 + (14 if i % 2 else 0)), arvore_topo)
OBJ = [('arvore_g', 360, 190), ('arvore_g', 960, 190), ('arvore_g', 620, 606),
       ('moita', 240, 360), ('moita', 1100, 380), ('moita_p', 800, 380), ('moita_p', 200, 680), ('moita', 1000, 660),
       ('pedra', 560, 380), ('pedra', 1150, 700)]
SPR = {'arvore_g': arvore_g, 'moita': moita, 'moita_p': moita_p, 'pedra': pedra}
sombras(campo, OBJ, SPR)
tinta_selva = lambda im: tingir(im, 0.66, (120, 200, 110), 0.12, cor=0.9)
TS.append("export const ARENA_RANDOMIZER_OBJECTS: ArenaObject[] = [\n" + "\n".join(salvar('randomizer', campo, OBJ, SPR, tinta_selva)) + "\n];")

with open('components/data/arenaModos.ts', 'w', encoding='utf-8') as f:
    f.write("\n".join(TS) + "\n")
print('components/data/arenaModos.ts')
