# ══════════════════════════════════════════════════════════════════════
# sprites-corrompidos.py — Heroi Corrompido (Etapa 3b, docs/HEROI_CORROMPIDO.md):
# gera public/sprites/enemies/corrupted_<heroi>_1..4.png para TODOS os herois
# jogaveis, por recoloracao (Pillow) do sprite do heroi que ja esta no
# repositorio (public/sprites/allies). Nada gerado por IA; nada lido da pasta
# DLC do RPG Maker (os 10 sprites da DLC ja tem licenca any-engine e estao no
# repositorio).
#
# Recolor = o "Corrompido (chefe)" aprovado em docs/SKINS.html
# (scripts/skins/skins_doc.py): pele morta cinza-lilas, roupa puxada para
# roxo, brancos preservados, aura roxa. O chefe olha para a ESQUERDA (espelho)
# como os outros inimigos; 4 quadros: balanco 1-2-3-2 e a aura pulsando. A
# escala (x1,5) e do desenho (raio do chefe), nao do arquivo.
#
# Uso:   python scripts/sprites-corrompidos.py
#        (+ release-demo/previa-fome/corrompidos.png, todos lado a lado)
# ══════════════════════════════════════════════════════════════════════
import os, colorsys
from PIL import Image, ImageFilter, ImageDraw, ImageFont

ALLIES = 'public/sprites/allies/'
OUT = 'public/sprites/enemies/'
PREVIA = 'release-demo/previa-fome/corrompidos.png'
# tipo do heroi no jogo -> arquivo em public/sprites/allies (CharacterSprite.nameMap)
ARQUIVO = {'priest': 'hyo', 'malachar_human': 'Malachar'}
HEROIS = ['mage', 'archer', 'druid', 'cleric', 'paladin', 'warlock', 'priest', 'necromancer', 'bard', 'runesmith',
          'sylvanite', 'dreadlord', 'jester', 'vex', 'zylvara', 'morrigan', 'ixara', 'berserker', 'frost_warden',
          'inquisitor', 'yue', 'billy', 'malachar_human']

def mapa(im, fn):
    im = im.copy(); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            r, g, b, a = px[x, y]
            if a: px[x, y] = fn(r, g, b) + (a,)
    return im
def hsv(fn):
    def f(r, g, b):
        h, s, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255); h, s, v = fn(h, s, v)
        rr, gg, bb = colorsys.hsv_to_rgb(h % 1, max(0, min(1, s)), max(0, min(1, v))); return (int(rr * 255), int(gg * 255), int(bb * 255))
    return f
def pele(h, s, v): return 0.02 < h < 0.11 and 0.2 < s < 0.6 and v > 0.6
def rumo(h, alvo, t): d = ((alvo - h + 0.5) % 1) - 0.5; return h + d * t

def corpo(im):
    # mesma recoloracao do skins_doc.corrompido (sem a aura: ela pulsa por quadro)
    return mapa(im, hsv(lambda h, s, v: (0.75, 0.12, v * 0.85) if pele(h, s, v) else ((h if s < 0.15 else rumo(h, 0.78, 0.7)), min(1, s * 0.8 + 0.12), v * 0.78)))

def aura(im, alfa):
    a = im.split()[3]
    au = Image.new('RGBA', im.size, (170, 40, 220, 0))
    au.putalpha(a.filter(ImageFilter.MaxFilter(5)).point(lambda v: alfa if v else 0).filter(ImageFilter.GaussianBlur(1)))
    return au

def quadros(tipo):
    im = Image.open(ALLIES + ARQUIVO.get(tipo, tipo) + '.png').convert('RGBA')
    im = im.crop(im.getbbox()).transpose(Image.FLIP_LEFT_RIGHT)   # olha para a esquerda
    c = corpo(im)
    P = 6   # margem para a aura e o balanco
    out = []
    for dy, alfa in ((0, 90), (1, 120), (2, 150), (1, 120)):
        q = Image.new('RGBA', (c.width + 2 * P, c.height + 2 * P + 2))
        base = Image.new('RGBA', q.size)
        base.alpha_composite(c, (P, P + dy))
        q.alpha_composite(aura(base, alfa)); q.alpha_composite(base)
        out.append(q)
    return out

def gravar():
    os.makedirs(OUT, exist_ok=True)
    todos = {}
    for h in HEROIS:
        qs = quadros(h)
        for i, q in enumerate(qs, 1): q.save(OUT + f'corrupted_{h}_{i}.png')
        todos[h] = qs
        print(f'corrupted_{h:16s} {qs[0].width}x{qs[0].height}')
    return todos

def previa(todos):
    os.makedirs(os.path.dirname(PREVIA), exist_ok=True)
    fonte = ImageFont.load_default()
    cw, chh, cols = 120, 170, 8
    linhas = (len(todos) + cols - 1) // cols
    tela = Image.new('RGBA', (cols * cw, linhas * chh), (18, 4, 10, 255))
    d = ImageDraw.Draw(tela)
    for i, (h, qs) in enumerate(todos.items()):
        x, y = (i % cols) * cw, (i // cols) * chh
        orig = Image.open(ALLIES + ARQUIVO.get(h, h) + '.png').convert('RGBA'); orig = orig.crop(orig.getbbox())
        tela.alpha_composite(orig, (x + 4, y + 130 - orig.height))
        q = qs[0]
        tela.alpha_composite(q, (x + cw - q.width - 2, y + 136 - q.height))
        d.text((x + 4, y + 146), h, fill=(255, 220, 220), font=fonte)
    tela.convert('RGB').save(PREVIA)
    print('previa:', PREVIA)

if __name__ == '__main__':
    previa(gravar())
