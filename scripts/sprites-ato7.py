# ══════════════════════════════════════════════════════════════════════
# sprites-ato7.py — recorta os 12 inimigos comuns do Ato VII (A Ravina dos
# Xamas) e as variantes, no formato do EnemySprite:
# public/sprites/enemies/<tipo>_1..4.png (passo1, parado, passo2, parado).
#
# Mesmo molde do sprites-ato6.py. Folhas de 8 personagens (beast_tribes,
# beast_tribes_2) em x2; monstros grandes do tf_monsters_assetpack ja vem
# em 2x (x1); vespas do action_monsters (folha RPG Maker de 1, x2).
#
# Elenco (docs/ATOS_VI_X_ASSETS.md): ondas 1-9 sapos, ratos, insetos,
# vespas; 11-19 homens-lagarto, lobos, javalis, raptores; 21-29 guerreiros
# bestiais de 4 tribos.
#
# Uso:   python scripts/sprites-ato7.py            (grava os sprites)
#        python scripts/sprites-ato7.py previa     (+ GIF de todos andando)
# ══════════════════════════════════════════════════════════════════════
import os, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageChops, ImageFont

P = 'assets-pixel/personagens/'
OUT = 'public/sprites/enemies/'
ESC = 2

def folha8(arq, k):
    im = Image.open(P + arq).convert('RGBA')
    cw, ch = im.width // 4, im.height // 2
    fw, fh = cw // 3, ch // 4
    cx, cy = (k % 4) * cw, (k // 4) * ch
    q = [im.crop((cx + c * fw, cy + fh, cx + (c + 1) * fw, cy + 2 * fh)) for c in range(3)]
    return [q[0], q[1], q[2], q[1]]

def folha1(arq):
    im = Image.open(P + arq).convert('RGBA')
    fw, fh = im.width // 3, im.height // 4
    q = [im.crop((c * fw, fh, (c + 1) * fw, 2 * fh)) for c in range(3)]
    return [q[0], q[1], q[2], q[1]]

def tingir(q, tom, peso, brilho=1.0, cor=1.0):
    out = []
    for x in q:
        x = ImageEnhance.Color(ImageEnhance.Brightness(x).enhance(brilho)).enhance(cor)
        t = Image.new('RGBA', x.size, tom + (0,))
        t.putalpha(ImageChops.multiply(x.getchannel('A'), Image.new('L', x.size, int(255 * peso))))
        out.append(Image.alpha_composite(x, t))
    return out

B2 = 'beast_tribes_2/100/'
BT = 'beast_tribes/100/beast_tribe_'
MO = 'tf_monsters_assetpack/TimeFantasy_Monsters/2x/$monster_'
VE = 'action_monsters/monsters/wasp/rpgmaker/wasps_'

# tipos cuja folha ja vem em 2x (nao ampliar)
JA_2X = {'lagarto', 'lagarto_b', 'lobo', 'lobo_b', 'javali', 'javali_b', 'raptor', 'raptor_b'}

INIMIGOS = {
    # ondas 1-9 — o que vive no fundo da ravina
    'sapo':            folha8(B2 + 'frogs.png', 0),
    'sapo_b':          folha8(B2 + 'frogs.png', 2),
    'sapo_c':          folha8(B2 + 'frogs.png', 5),
    'sapo_xama':       folha8(B2 + 'frogs.png', 3),    # chapeu de folha
    'sapo_xama_b':     folha8(B2 + 'frogs.png', 4),    # chapeu de cogumelo
    'rato':            folha8(B2 + 'rats.png', 0),
    'rato_b':          folha8(B2 + 'rats.png', 1),
    'rato_c':          folha8(B2 + 'rats.png', 4),
    'rato_d':          folha8(B2 + 'rats.png', 6),
    'inseto':          folha8(B2 + 'insects.png', 0),
    'inseto_b':        folha8(B2 + 'insects.png', 4),
    'inseto_c':        folha8(B2 + 'insects.png', 5),
    'vespa':           folha1(VE + '1.png'),
    'vespa_b':         tingir(folha1(VE + '1.png'), (200, 40, 30), 0.40),   # wasps_2/3 sao a mesma vespa em 2x/3x
    'vespa_c':         tingir(folha1(VE + '1.png'), (40, 160, 60), 0.40),
    # ondas 11-19 — os cacadores
    'lagarto':         folha1(MO + 'lizardman1.png'),
    'lagarto_b':       folha1(MO + 'lizardman2.png'),
    'lagarto_tribo':   folha8(BT + '3.png', 0),
    'lagarto_tribo_b': folha8(BT + '3.png', 4),
    'lobo':            folha1(MO + 'wolf1.png'),
    'lobo_b':          folha1(MO + 'wolf2.png'),
    'javali':          folha1(MO + 'boar.png'),
    'javali_b':        tingir(folha1(MO + 'boar.png'), (40, 20, 10), 0.35, brilho=0.75),
    'raptor':          folha1(MO + 'raptor1.png'),
    'raptor_b':        folha1(MO + 'raptor2.png'),
    # ondas 21-29 — guerreiros das tribos
    'tribo_lobo':      folha8(BT + '1.png', 0),
    'tribo_lobo_b':    folha8(BT + '1.png', 2),
    'tribo_lobo_c':    folha8(BT + '1.png', 4),
    'tribo_raposa':    folha8(BT + '2.png', 0),
    'tribo_raposa_b':  folha8(BT + '2.png', 2),
    'tribo_raposa_c':  folha8(BT + '2.png', 5),
    'tribo_ave':       folha8(BT + '4.png', 0),
    'tribo_ave_b':     folha8(BT + '4.png', 2),
    'tribo_ave_c':     folha8(BT + '4.png', 7),
    'tribo_peixe':     folha8(BT + '5.png', 0),
    'tribo_peixe_b':   folha8(BT + '5.png', 1),
    'tribo_peixe_c':   folha8(BT + '5.png', 5),
}

# Chefes do Ato VII com sprite proprio (Etapa 1c): folhas de 1 personagem 3x4 do beast_tribes_2
# (x2). Os outros tres chefes reaproveitam sprite (components/chefes/lista.ts SPRITE_ATO7).
INIMIGOS.update({
    'kwazul':          folha1(B2 + 'frog_champ.png'),
    'xiphra':          folha1(B2 + 'insect_champ.png'),
    'ossoth':          tingir(folha1(B2 + 'rat_champ.png'), (200, 200, 200), 0.15, brilho=1.25, cor=0.15),   # cinzas
})

# Totem do Sapo-Xama (inimigo parado, sem animacao): nao ha totem nos pacotes de assets-pixel;
# o idolo de pedra em forma de fera do tf_ruindungeons (tf_B_ruins2, coluna 7, linhas 4-5) serve.
# Ja vem em 48 px (3x): grava x1 como totem_xama.png (arquivo unico, fora do ANIMATED_ENEMIES).
def gravar_totem():
    im = Image.open('assets-pixel/tilesets/tf_ruindungeons/48_RMMV/tf_B_ruins2.png').convert('RGBA')
    q = im.crop((336, 192, 384, 288)); q = q.crop(q.getbbox())
    q = tingir([q], (60, 200, 90), 0.18)[0]   # brilho verde dos totens (como no cenario)
    q.save(OUT + 'totem_xama.png')
    print(f'{"totem_xama":18s} {q.width}x{q.height}')

def gravar():
    os.makedirs(OUT, exist_ok=True)
    finais = {}
    for tipo, ciclo in INIMIGOS.items():
        caixas = [q.getbbox() for q in ciclo if q.getbbox()]
        x0 = min(b[0] for b in caixas); y0 = min(b[1] for b in caixas)
        x1 = max(b[2] for b in caixas); y1 = max(b[3] for b in caixas)
        e = 1 if tipo in JA_2X else ESC
        fs = []
        for i, q in enumerate(ciclo, 1):
            q = q.crop((x0, y0, x1, y1)).resize(((x1 - x0) * e, (y1 - y0) * e), Image.NEAREST)
            q.save(OUT + f'{tipo}_{i}.png'); fs.append(q)
        finais[tipo] = fs
        print(f'{tipo:18s} {fs[0].width}x{fs[0].height}')
    return finais

def previa(finais, saida):
    fonte = ImageFont.load_default()
    cols, cw, chh = 8, 150, 170
    linhas = (len(finais) + cols - 1) // cols
    fundo = Image.open('public/sprites/arena/bg_act7_field.png').convert('RGBA')
    chao = Image.new('RGBA', (cols * cw, linhas * chh))
    for y in range(0, chao.height, 600):
        chao.alpha_composite(fundo.crop((0, 280, cols * cw, 280 + min(600, chao.height - y))), (0, y))
    quadros = []
    for f in range(8):
        c = chao.copy(); d = ImageDraw.Draw(c)
        for i, (tipo, fs) in enumerate(finais.items()):
            gx, gy = (i % cols) * cw, (i // cols) * chh
            q = fs[f % 4]
            dx = gx + (cw - q.width) // 2 - (f * 3)
            c.alpha_composite(q, (max(gx, dx), gy + chh - 30 - q.height))
            d.text((gx + 4, gy + chh - 16), tipo, fill=(255, 240, 210), font=fonte)
        quadros.append(c.convert('RGB'))
    quadros[0].save(saida, save_all=True, append_images=quadros[1:], duration=160, loop=0)
    print('previa:', saida)

if __name__ == '__main__':
    fs = gravar()
    gravar_totem()
    if len(sys.argv) > 1 and sys.argv[1] == 'previa':
        previa(fs, sys.argv[2] if len(sys.argv) > 2 else 'release-demo/previa-ato7-inimigos.gif')
