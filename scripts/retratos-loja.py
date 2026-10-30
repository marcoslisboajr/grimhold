# ══════════════════════════════════════════════════════════════════════
# retratos-loja.py — ícones de perfil vendidos com essência (loja do perfil)
#   skin_<heroi>__<skin>.png  retrato de cada skin (public/sprites/skins/,
#                             montadas em paperdoll — docs/SKINS.html)
#   maestria_<heroi>.png      retrato do herói em dourado com contorno
# Mesmo recorte de scripts/retratos-pixel.py. Saída: public/ui/pixel/avatars/
# Nada gerado por IA: recorte + troca de cor (Pillow).
# Uso:  python scripts/retratos-loja.py
# ══════════════════════════════════════════════════════════════════════
import os, colorsys
from PIL import Image, ImageFilter

SKINS = 'public/sprites/skins/'
HEROIS = 'public/sprites/allies/'
OUT = 'public/ui/pixel/avatars/'
LADO = 40
FUNDO = (11, 9, 6, 255)
# heróis com ícone de Maestria (id do avatar -> arquivo do sprite)
MAESTRIA = {
    'mage': 'mage', 'archer': 'archer', 'warlock': 'warlock', 'druid': 'druid', 'necromancer': 'necromancer',
    'bard': 'bard', 'jester': 'jester', 'cleric': 'cleric', 'priest': 'hyo', 'paladin': 'paladin',
    'runesmith': 'runesmith', 'sylvanite': 'sylvanite', 'dreadlord': 'dreadlord', 'vex': 'vex',
    'zylvara': 'zylvara', 'morrigan': 'morrigan', 'ixara': 'ixara', 'berserker': 'berserker',
    'frost_warden': 'frost_warden', 'inquisitor': 'inquisitor', 'yue': 'yue', 'billy': 'billy',
}

def retrato(sprite, fundo=FUNDO):
    x0, y0, x1, y1 = sprite.getbbox()
    lado = max(x1 - x0, int((y1 - y0) * 0.45))
    cx = (x0 + x1) // 2
    rec = sprite.crop((cx - lado // 2, y0 - 2, cx - lado // 2 + lado, y0 - 2 + lado)).resize((LADO, LADO), Image.NEAREST)
    base = Image.new('RGBA', (LADO, LADO), fundo)
    base.paste(rec, (0, 0), rec)
    return base.resize((LADO * 2, LADO * 2), Image.NEAREST)

def pele(h, s, v): return 0.02 < h < 0.11 and 0.2 < s < 0.6 and v > 0.6

def dourado(im):
    """cores originais um pouco mais vivas + contorno dourado de 1 px (sem trocar matiz: o gelo ficava verde)"""
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if not a: continue
            h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
            if pele(h, s, v) or s < 0.15: continue
            rr, gg, bb = colorsys.hsv_to_rgb(h, min(1, s * 1.1), min(1, v * 1.08))
            px[x, y] = (int(rr * 255), int(gg * 255), int(bb * 255), a)
    cont = Image.new('RGBA', im.size, (245, 196, 60, 0)); cont.putalpha(im.split()[3].filter(ImageFilter.MaxFilter(3)))
    cv = Image.new('RGBA', im.size); cv.alpha_composite(cont); cv.alpha_composite(im)
    return cv

n = 0
for f in sorted(os.listdir(SKINS)):
    if f.endswith('.png'):
        retrato(Image.open(SKINS + f).convert('RGBA')).save(OUT + 'skin_' + f); n += 1
for aid, arq in MAESTRIA.items():
    im = Image.open(HEROIS + arq + '.png').convert('RGBA')
    retrato(dourado(im), (20, 14, 6, 255)).save(OUT + 'maestria_' + aid + '.png'); n += 1
print('ok:', n, 'ícones da loja em', OUT)
