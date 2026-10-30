# ══════════════════════════════════════════════════════════════════════
# ui-pixel.py — fabrica as molduras pixel da HUD (B1b) a partir do painel
# chanfrado das catacumbas (assets-pixel/tilesets/catacombs_p_3x.png) e da
# madeira (assets-pixel/ui/woodtexture.png), RECOLORIDOS pra paleta "estela"
# de components/systems/materials.ts. Assim a HUD pixel continua com a
# mesma pedra escura e os mesmos acentos de material do jogo.
#
# O painel original tem 4 cores: fundo, sombra, chanfro claro, acento azul.
# Cada uma vira um token da paleta; o acento vira a cor do material.
#
# Saida (2x, NEAREST — pixel "gordo" na tela):
#   public/ui/pixel/panel_<material>.png   48x48 nativo -> 96x96, 9-slice corte 8 (4 px nativos)
#   public/ui/pixel/button_<material>.png  madeira com chanfro, 9-slice corte 12
#   public/ui/pixel/bar.png                trilho de barra, 9-slice corte 8
#
# Uso:  python scripts/ui-pixel.py
# ══════════════════════════════════════════════════════════════════════
import os
from PIL import Image

OUT = 'public/ui/pixel/'
os.makedirs(OUT, exist_ok=True)

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (255,)

# paleta "estela" (copiada de materials.ts — manter em sincronia)
STONE = {'s0': '#131110', 's1': '#1a1613', 's2': '#221d18', 's3': '#2a241e'}
GROOVE_LO = '#0b0906'
LINE = {'base': '#322b24', 'soft': '#241f1a', 'hover': '#4a3f34'}
MATERIAL = {
    'neutral':   ('#4a3f34', '#241f1a'),
    'ember':     ('#a85a34', '#4a2413'),
    'amethyst':  ('#8a6e96', '#3a2d40'),
    'slate':     ('#5f7079', '#2b343a'),
    'gold':      ('#9a7b3f', '#463617'),
    'verdigris': ('#617355', '#2c3826'),
    'oxblood':   ('#8f3d31', '#421a14'),
    'bone':      ('#a4988a', '#3a342d'),
    'frost':     ('#6d8894', '#2a3840'),
}

# cores do painel original -> papel
FUNDO, SOMBRA, CHANFRO, ACENTO = (44, 51, 54, 255), (38, 41, 51, 255), (51, 60, 65, 255), (45, 63, 121, 255)

def remap(im, tabela):
    im = im.convert('RGBA'); px = im.load()
    for y in range(im.height):
        for x in range(im.width):
            p = px[x, y]
            if p in tabela: px[x, y] = tabela[p]
    return im

def x2(im): return im.resize((im.width * 2, im.height * 2), Image.NEAREST)

# Painel: moldura GEOMETRICA desenhada do zero (18/9: a moldura decorativa das
# catacumbas virava "pontilhado quebrado" quando esticada no 9-slice).
# Nativo 48x48, borda de 4 px: linha externa escura, chanfro claro em
# cima/esquerda e escuro embaixo/direita, filete do material por dentro,
# canto chanfrado (pixel do canto cortado). Miolo chapado.
def painel_geo(fundo, linha, hi, lo, acento):
    n = 48; im = Image.new('RGBA', (n, n), fundo); px = im.load()
    def anel(k, topo_esq, baixo_dir):
        a, b = k, n - 1 - k
        for i in range(a, b + 1):
            px[i, b] = baixo_dir; px[b, i] = baixo_dir     # baixo e direita primeiro
        for i in range(a, b + 1):
            px[i, a] = topo_esq; px[a, i] = topo_esq       # topo e esquerda por cima
        px[a, b] = baixo_dir                               # canto baixo-esq: o escuro vence
    anel(0, linha, linha)        # contorno
    anel(1, hi, lo)              # chanfro: luz em cima/esq, sombra embaixo/dir
    anel(2, acento, acento)      # filete do material
    anel(3, lo, hi)              # sulco interno (gravado: invertido)
    for (x, y) in [(0, 0), (n-1, 0), (0, n-1), (n-1, n-1)]: px[x, y] = (0, 0, 0, 0)   # canto chanfrado
    return im

for nome, (base, dim) in MATERIAL.items():
    x2(painel_geo(hexrgb(STONE['s1']), hexrgb(GROOVE_LO), hexrgb(LINE['hover']), hexrgb(LINE['soft']), hexrgb(dim))).save(OUT + f'panel_{nome}.png')
    # elevada (hover/selecao): fundo s2 e filete na cor base do material
    x2(painel_geo(hexrgb(STONE['s2']), hexrgb(GROOVE_LO), hexrgb('#6a5a4a'), hexrgb(LINE['base']), hexrgb(base))).save(OUT + f'panel_{nome}_hi.png')

# Botao: bloco de madeira 72x32 com chanfro de 2px desenhado (claro em cima/esq, escuro embaixo/dir)
madeira_src = Image.open('assets-pixel/ui/woodtexture.png').convert('RGBA')
# A textura original sao DUAS tabuas com uma tira de metal no meio (x≈31..40);
# num botao a tira vira uma "fita" — usamos so a tabua da esquerda, repetida.
_tabua = madeira_src.crop((3, 0, 29, 32))
madeira = Image.new('RGBA', (72, 32))
for _x in range(0, 72, _tabua.width): madeira.paste(_tabua, (_x, 0))
madeira = madeira.crop((0, 0, 72, 32))
def botao(fill_tint, borda_clara, borda_escura, acento):
    b = madeira.copy(); px = b.load()
    # tinge a madeira pra pedra quente: media com o tom do material (mantem o veio)
    for y in range(b.height):
        for x in range(b.width):
            r, g, bb, a = px[x, y]
            t = fill_tint
            px[x, y] = ((r + t[0]) // 2, (g + t[1]) // 2, (bb + t[2]) // 2, 255)
    w, h = b.size
    for i in range(2):
        for x in range(w): px[x, i] = borda_clara; px[x, h - 1 - i] = borda_escura
        for y in range(h): px[i, y] = borda_clara; px[w - 1 - i, y] = borda_escura
    # linha de acento no rodape interno
    for x in range(3, w - 3): px[x, h - 4] = acento
    # cantos cortados (pixel de canto some) — leitura de "bloco" e nao de "retangulo CSS"
    for (x, y) in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]: px[x, y] = (0, 0, 0, 0)
    return b

for nome, (base, dim) in MATERIAL.items():
    x2(botao(hexrgb(dim), hexrgb(LINE['hover']), hexrgb(GROOVE_LO), hexrgb(base))).save(OUT + f'button_{nome}.png')
    x2(botao(hexrgb(base), hexrgb('#6a5a4a'), hexrgb(GROOVE_LO), hexrgb('#dcd2c4'))).save(OUT + f'button_{nome}_hi.png')

# Trilho de barra: 24x12, sulco s3 com sombra em cima/esq e luz embaixo/dir (gravado)
tr = Image.new('RGBA', (24, 12), hexrgb(STONE['s3'])); px = tr.load()
for x in range(24): px[x, 0] = hexrgb(GROOVE_LO); px[x, 11] = hexrgb(LINE['hover'])
for y in range(12): px[0, y] = hexrgb(GROOVE_LO); px[23, y] = hexrgb(LINE['hover'])
x2(tr).save(OUT + 'bar.png')
print('ok:', sorted(os.listdir(OUT)))
