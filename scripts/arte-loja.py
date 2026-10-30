# ══════════════════════════════════════════════════════════════════════
# arte-loja.py — todas as artes da pagina Steam, montadas so com o que ja
# e do jogo: a muralha do menu (menu_bg.png), sprites de heroi/inimigo
# (public/sprites) e as fontes Jersey (woff2 do jogo convertidas pra TTF
# em %TEMP%/jersey, ver fim do arquivo). Nada de arte gerada por IA.
#
# Cada peca e composta na escala 1 do pixel e ampliada N vezes (nearest),
# pra o pixel ficar do mesmo tamanho em cenario, sprites e letras.
#
# Saida em release-demo/loja/:
#   library_hero.png   3840x1240  biblioteca (SEM logo — a Steam sobrepoe)
#   logo.png           1280x720 transparente, logo centrado (biblioteca)
#   capsule_main.png   1232x706   capsula principal (logo pintado)
#   capsule_header.png  920x430   capsula do cabecalho
#   capsule_small.png   462x174   capsula pequena (logo enche)
#   capsule_vertical.png 748x896  capsula vertical
#   library_capsule.png  600x900  capsula da biblioteca (retrato)
#   (cabecalho da biblioteca 920x430 = capsule_header.png)
#   page_background.png 1438x810  fundo da pagina (sem texto, baixo contraste)
# Uso:   python scripts/arte-loja.py
# ══════════════════════════════════════════════════════════════════════
import os, random
from PIL import Image, ImageDraw, ImageFilter, ImageFont, ImageEnhance, ImageChops

OUT = 'release-demo/loja/'
os.makedirs(OUT, exist_ok=True)
JERSEY10 = os.path.join(os.environ['TEMP'], 'jersey', 'Jersey_10_Regular.ttf')
JERSEY15 = os.path.join(os.environ['TEMP'], 'jersey', 'Jersey_15_Regular.ttf')
MENU = Image.open('public/ui/pixel/menu_bg.png').convert('RGBA')   # 1600x900

def sprite(p): return Image.open(p).convert('RGBA')
def tingir(im, tom, peso, brilho=1.0):
    im = ImageEnhance.Brightness(im).enhance(brilho)
    tinta = Image.new('RGBA', im.size, tom + (0,))
    tinta.putalpha(ImageChops.multiply(im.getchannel('A'), Image.new('L', im.size, int(255 * peso))))
    return Image.alpha_composite(im, tinta)
def brilho(dst, cx, cy, rx, ry, cor, alfa, blur):
    g = Image.new('RGBA', dst.size, (0, 0, 0, 0))
    ImageDraw.Draw(g).ellipse((cx - rx, cy - ry, cx + rx, cy + ry), fill=cor + (alfa,))
    dst.alpha_composite(g.filter(ImageFilter.GaussianBlur(blur)))
def ampliar(im, n): return im.resize((im.width * n, im.height * n), Image.NEAREST)

# ── a cena: ceu carmesim, lua de sangue, muralha, herois nas ameias, horda ──
def cena(W, H, herois, lua=None, dragao=None, voadores=(), muro_h=195, vinheta_esq=0, brasas=150, semente=7):
    """W,H em escala 1. lua=(x,y,r). dragao=(x,y,escala). voadores=[(nome,x,y)]. herois=[(nome,x)] com pe na linha das ameias."""
    random.seed(semente)
    im = Image.new('RGBA', (W, H), (0, 0, 0, 255))
    d = ImageDraw.Draw(im)
    # ceu em bandas: negro -> carmesim -> escuro perto do muro
    topo, meio, fundo = (9, 5, 12), (92, 16, 26), (28, 8, 14)
    bandas = max(10, H // 23)
    for i in range(bandas):
        t = i / (bandas - 1)
        if t < 0.62: k = t / 0.62; cor = tuple(int(topo[c] + (meio[c] - topo[c]) * k) for c in range(3))
        else:        k = (t - 0.62) / 0.38; cor = tuple(int(meio[c] + (fundo[c] - meio[c]) * k) for c in range(3))
        d.rectangle((0, int(H * i / bandas), W, int(H * (i + 1) / bandas)), fill=cor + (255,))
    for _ in range(int(W * H / 3800)):
        x, y = random.randint(0, W - 1), random.randint(0, int(H * 0.45))
        d.point((x, y), fill=random.choice([(200, 190, 200), (150, 130, 150), (230, 200, 190)]) + (255,))
    if lua:
        mx, my, mr = lua
        brilho(im, mx, my, mr * 1.9, mr * 1.9, (160, 30, 30), 110, mr * 0.4)
        d = ImageDraw.Draw(im)
        d.ellipse((mx - mr, my - mr, mx + mr, my + mr), fill=(178, 52, 46, 255))
        d.ellipse((mx - mr + 4, my - mr + 4, mx + mr - 4, my + mr - 4), fill=(196, 66, 54, 255))
        for (ox, oy, r, c) in [(-.31, -.21, .23, (170, 48, 44)), (.26, .19, .31, (168, 46, 42)), (-.08, .44, .15, (172, 50, 44)), (.42, -.4, .12, (172, 50, 44)), (-.54, .31, .09, (166, 44, 40))]:
            r = r * mr; d.ellipse((mx + ox * mr - r, my + oy * mr - r, mx + ox * mr + r, my + oy * mr + r), fill=c + (255,))
    # muralha: fatia centrada da cena do menu, tingida de noite, luz vermelha da lua pelo lado da lua
    x0 = max(0, min(1600 - W, 800 - W // 2))
    muro = MENU.crop((x0, 405, x0 + W, 405 + muro_h))
    muro = tingir(muro, (40, 30, 70), 0.22, brilho=0.72)
    if lua:
        luz = Image.new('RGBA', muro.size, (0, 0, 0, 0)); ld = ImageDraw.Draw(luz)
        for x in range(muro.width):
            a = int(90 * max(0, 1 - abs(x - lua[0]) / (W * 0.6)))
            ld.line((x, 0, x, muro.height), fill=(140, 40, 30, a))
        luz.putalpha(ImageChops.multiply(luz.getchannel('A'), muro.getchannel('A'))); muro.alpha_composite(luz)
    MURO_Y = H - muro.height
    im.alpha_composite(muro, (0, MURO_Y))
    sombra = Image.new('RGBA', (W, 70), (0, 0, 0, 0)); sd = ImageDraw.Draw(sombra)
    for y in range(70): sd.line((0, y, W, y), fill=(0, 0, 0, int(200 * y / 69)))
    im.alpha_composite(sombra, (0, H - 70))
    # tochas nas torres do menu (x=150,700,915,1465 no menu)
    for tx in [150 - x0, 700 - x0, 915 - x0, 1465 - x0]:
        if 8 <= tx < W - 8:
            ty = MURO_Y + 18
            brilho(im, tx, ty, 34, 26, (255, 120, 30), 120, 10)
            d = ImageDraw.Draw(im)
            d.rectangle((tx - 2, ty - 2, tx + 1, ty + 4), fill=(255, 200, 90, 255))
            d.rectangle((tx - 1, ty - 5, tx, ty - 3), fill=(255, 240, 160, 255))
    # voadores em contraluz, depois o dragao de fogo
    for (nome, px, py) in voadores:
        sp = sprite(f'public/sprites/enemies/{nome}.png').transpose(Image.FLIP_LEFT_RIGHT)
        im.alpha_composite(tingir(sp, (20, 5, 15), 0.45, brilho=0.6), (px, py))
    if dragao:
        dx, dy, esc = dragao
        drag = ampliar(sprite('public/sprites/enemies/fire_dragon_1.png'), esc).transpose(Image.FLIP_LEFT_RIGHT)
        brilho(im, dx + drag.width // 2, dy + drag.height // 2, drag.width * 0.7, drag.height * 0.45, (255, 90, 20), 70, 30)
        im.alpha_composite(tingir(drag, (255, 120, 40), 0.08), (dx, dy))
    # herois: pe no topo das ameias
    PE = MURO_Y + 80
    for (nome, hx) in herois:
        sp = tingir(sprite(f'public/sprites/allies/{nome}.png'), (120, 30, 30), 0.10, brilho=0.92)
        im.alpha_composite(sp, (hx, PE - sp.height))
    # brasas so no ceu
    d = ImageDraw.Draw(im)
    for _ in range(brasas):
        x, y = random.randint(0, W - 1), random.randint(min(int(H * 0.25), MURO_Y), MURO_Y + 10)
        c = random.choice([(255, 150, 40), (255, 90, 30), (230, 60, 30), (255, 200, 90)])
        if random.random() < 0.25: d.rectangle((x, y, x + 1, y + 1), fill=c + (255,))
        else: d.point((x, y), fill=c + (random.randint(150, 255),))
    if vinheta_esq:
        vin = Image.new('RGBA', (W, H), (0, 0, 0, 0)); vd = ImageDraw.Draw(vin)
        for x in range(vinheta_esq): vd.line((x, 0, x, H), fill=(0, 0, 0, int(150 * (1 - x / vinheta_esq) ** 1.6)))
        im.alpha_composite(vin)
    return im

# ── o logo: GRIMHOLD em Jersey 10, ouro chanfrado, contorno, sombra, gema ──
def texto_pixel(txt, fonte, tam):
    f = ImageFont.truetype(fonte, tam)
    x0, y0, x1, y1 = f.getbbox(txt)
    im = Image.new('L', (x1 - x0 + 8, y1 - y0 + 8), 0)
    ImageDraw.Draw(im).text((4 - x0, 4 - y0), txt, font=f, fill=255)
    return im.point(lambda v: 255 if v > 110 else 0)   # sem antialias: pixel puro

def logo(tam=96, subtitulo=False):   # regra da Steam: nenhum texto alem do logotipo
    mask = texto_pixel('GRIMHOLD', JERSEY10, tam)
    esp = max(1, tam // 48)                                  # espessura do contorno cresce com o tamanho
    sub = texto_pixel('DEFEND THE LAST WALL', JERSEY15, max(12, int(tam * 0.23))) if subtitulo else None
    LW = mask.width + 8 * esp + 8
    LH = mask.height + int(tam * 0.36) + (sub.height + 4 if sub else 0) + 8 * esp
    im = Image.new('RGBA', (LW, LH), (0, 0, 0, 0))
    ox, oy = 4 * esp + 4, int(tam * 0.32) + 2 * esp
    def carimbar(m, dx, dy, cor):
        cam = Image.new('RGBA', im.size, cor + (255,)); a = Image.new('L', im.size, 0); a.paste(m, (ox + dx, oy + dy)); cam.putalpha(a); im.alpha_composite(cam)
    for dx in range(-esp, esp + 1):
        for dy in range(-esp, esp + 1):
            carimbar(mask, dx + 2 * esp, dy + 2 * esp, (12, 6, 4))    # sombra dura
    for dx in range(-esp, esp + 1):
        for dy in range(-esp, esp + 1):
            carimbar(mask, dx, dy, (38, 18, 8))                      # contorno
    ouro = [(255, 240, 190), (246, 214, 120), (232, 180, 70), (206, 140, 46), (170, 104, 30), (128, 72, 20)]
    fill = Image.new('RGBA', mask.size, (0, 0, 0, 0)); fd = ImageDraw.Draw(fill)
    for i, c in enumerate(ouro):
        fd.rectangle((0, int(mask.height * i / len(ouro)), mask.width, int(mask.height * (i + 1) / len(ouro))), fill=c + (255,))
    fill.putalpha(mask); im.alpha_composite(fill, (ox, oy))
    carimbar(ImageChops.subtract(mask, ImageChops.offset(mask, 0, -esp)), 0, 0, (110, 60, 16))   # rebaixo na base das letras
    # gema de brasa sobre o I
    f = ImageFont.truetype(JERSEY10, tam)
    gx = int(ox + f.getlength('GR') + f.getlength('I') / 2 - f.getbbox('GRIMHOLD')[0]); gy = oy - int(tam * 0.13)
    g = max(4, tam // 11); gd = ImageDraw.Draw(im)
    gd.polygon([(gx, gy - g - 2), (gx + g * 2 // 3 + 2, gy), (gx, gy + g + 2), (gx - g * 2 // 3 - 2, gy)], fill=(60, 20, 10, 255))
    gd.polygon([(gx, gy - g), (gx + g * 2 // 3, gy), (gx, gy + g), (gx - g * 2 // 3, gy)], fill=(255, 120, 40, 255))
    gd.polygon([(gx, gy - g // 2), (gx + g // 3, gy), (gx, gy + g // 2), (gx - g // 3, gy)], fill=(255, 220, 140, 255))
    if sub:
        subc = Image.new('RGBA', sub.size, (214, 196, 160, 255)); subc.putalpha(sub)
        subo = Image.new('RGBA', sub.size, (20, 10, 8, 255)); subo.putalpha(sub.filter(ImageFilter.MaxFilter(3)))
        sx = ox + (mask.width - sub.width) // 2; sy = oy + mask.height + 2
        im.alpha_composite(subo, (sx, sy)); im.alpha_composite(subc, (sx, sy))
    return im

def salvar(im, nome, n, alvo):
    big = ampliar(im, n)
    if big.size != alvo:   # sobra de arredondamento: corta centrado
        cx, cy = (big.width - alvo[0]) // 2, (big.height - alvo[1]) // 2
        big = big.crop((cx, cy, cx + alvo[0], cy + alvo[1]))
    big.convert('RGB').save(OUT + nome); print(nome, big.size)

def fila(nomes, x_ini, gap=12):
    xs = []; x = x_ini
    for n in nomes:
        xs.append((n, x)); x += sprite(f'public/sprites/allies/{n}.png').width + gap
    return xs
def fila_centrada(nomes, W, gap=12):
    """fila centrada na largura W — ninguem sai pela borda e o miolo (o que a Steam nunca corta) fica ocupado"""
    larg = sum(sprite(f'public/sprites/allies/{n}.png').width for n in nomes) + gap * (len(nomes) - 1)
    return fila(nomes, (W - larg) // 2, gap)

# ── 1. biblioteca: hero 3840x1240 (x3 de 1280x413) + logo separado ────────
NOVE = ['dreadlord', 'archer', 'paladin', 'mage', 'jester', 'morrigan', 'vex', 'frost_warden', 'berserker']
h = cena(1280, 413, fila_centrada(NOVE, 1280), lua=(960, 118, 96), dragao=None,
         voadores=[('wyvern_1', 1080, 40), ('wyvern_2', 300, 60), ('harpy_1', 200, 130), ('harpy_2', 1180, 190)], vinheta_esq=0)
salvar(h, 'library_hero.png', 3, (3840, 1240))
# logo da biblioteca: a Steam so aceita 1280x720 transparente, com o logo dentro
lg = ampliar(logo(96), 3)
tela = Image.new('RGBA', (1280, 720), (0, 0, 0, 0))
tela.alpha_composite(lg, ((1280 - lg.width) // 2, (720 - lg.height) // 2))
tela.save(OUT + 'logo.png'); print('logo.png', tela.size)

# ── 2. capsula principal 1232x706 (x2 de 616x353): logo em cima, fila embaixo ──
SEIS = ['archer', 'paladin', 'mage', 'jester', 'morrigan', 'dreadlord']
c = cena(616, 353, fila_centrada(SEIS, 616, 10), lua=(480, 130, 70), dragao=None, voadores=[('wyvern_1', 30, 30), ('harpy_1', 96, 40)], brasas=90)
lg = logo(84); c.alpha_composite(lg, ((616 - lg.width) // 2, 14))
salvar(c, 'capsule_main.png', 2, (1232, 706))

# ── 3. capsula do cabecalho 920x430 (x2 de 460x215) ────────────────────────
QUATRO = ['paladin', 'mage', 'jester', 'archer']
c = cena(460, 215, fila_centrada(QUATRO, 460, 10), lua=(370, 62, 44), dragao=None, voadores=[('wyvern_1', 14, 14)], muro_h=120, brasas=60)
lg = logo(64); c.alpha_composite(lg, ((460 - lg.width) // 2, 2))
salvar(c, 'capsule_header.png', 2, (920, 430))

# ── 4. capsula pequena 462x174 (x2 de 231x87): o logo enche ──────────────
c = cena(231, 87, [], lua=(190, 26, 24), dragao=None, muro_h=44, brasas=25)   # so ameias no pe: o logo e a capsula
lg = logo(66); c.alpha_composite(lg, ((231 - lg.width) // 2, (87 - lg.height) // 2 + 6))
salvar(c, 'capsule_small.png', 2, (462, 174))

# ── 5. capsula vertical 748x896 (x2 de 374x448) ─────────────────────────
c = cena(374, 448, fila_centrada(['mage', 'jester', 'morrigan', 'paladin'], 374, 10), lua=(280, 150, 62), dragao=None,
         voadores=[('wyvern_1', 20, 120)], muro_h=195, brasas=80)
lg = logo(62); c.alpha_composite(lg, ((374 - lg.width) // 2, 14))
salvar(c, 'capsule_vertical.png', 2, (748, 896))

# ── 5b. capsula da biblioteca 600x900 (x2 de 300x450): retrato, logo grande ──
c = cena(300, 450, fila_centrada(['mage', 'jester', 'morrigan'], 300, 10), lua=(150, 215, 70), dragao=None,
         voadores=[('wyvern_1', 10, 110), ('harpy_1', 236, 120)], muro_h=195, brasas=70)
lg = logo(70); c.alpha_composite(lg, ((300 - lg.width) // 2, 40))
salvar(c, 'library_capsule.png', 2, (600, 900))
# cabecalho da biblioteca 920x430 = a mesma capsula do cabecalho (capsule_header.png)

# ── 6. fundo da pagina 1438x810: sem texto, escurecido (a Steam tinge de azul) ──
b = cena(719, 405, fila_centrada(SEIS, 719), lua=(560, 110, 80), dragao=None, voadores=[('wyvern_1', 380, 40)], brasas=60)
b = ImageEnhance.Brightness(b).enhance(0.55)
salvar(b, 'page_background.png', 2, (1438, 810))

# Fontes: as TTF vem dos woff2 do jogo (public/fonts/pixel), convertidas com
# fonttools+brotli: TTFont(woff2).flavor=None; save(ttf).
