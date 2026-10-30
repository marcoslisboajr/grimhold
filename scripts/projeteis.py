# ══════════════════════════════════════════════════════════════════════
# projeteis.py — gera os sprites de projetil do jogo a partir do pacote
# Elemental VFX (assets-pixel/cursores-efeitos/elemental_vfx/).
#
# O pacote tem 6 FORMAS (bola, adaga, orbe, disco, raio, gelo), todas em
# tom de fogo. Cada tipo de projetil do jogo = uma forma + um giro de matiz
# (+ saturacao/brilho). Assim 21 classes de heroi, 5 tipos de inimigo e os
# efeitos especiais saem de 6 folhas sem desenhar nada.
#
# Saida:
#   public/sprites/projectiles/<chave>.png   — TIRA horizontal com N quadros
#   components/data/projectileSprites.ts     — catalogo {chave: {w,h,n}}
#
# O ProjectileSprite (EntitySprites.tsx) anima a tira com CSS steps(), sem
# JS por projetil. Quadros voltados pra DIREITA (angulo 0); o wrapper do
# projetil ja gira pelo `angle`.
#
# Uso:  python scripts/projeteis.py
# ══════════════════════════════════════════════════════════════════════
import os, json
from PIL import Image

SRC = 'assets-pixel/cursores-efeitos/elemental_vfx/Elemental VFX (v100)/FX Elements/'
OUT = 'public/sprites/projectiles/'
CAT = 'components/data/projectileSprites.ts'
N = 6            # quadros por tira
FIRE_HUE = 32    # matiz medio do fogo original (graus)

# forma -> (arquivo, largura celula, altura celula, linha usada (ou None = todas), total quadros, escala)
FORMAS = {
    'bola':  ('Fire_Ball_f15.png',        64,  64,  2,    15, 0.50),
    'adaga': ('Fire_Dagger_f15.png',      70,  70,  2,    15, 0.75),
    'orbe':  ('Angel_FireBall.png',       56,  55,  None, 30, 0.50),
    'disco': ('Fire_Disc.png',            72,  53,  None, 30, 0.45),
    'raio':  ('Electric_Dash_Line.png',   75,  83,  None, 20, 0.40),
    'gelo':  ('Snowflake_Moving.png',    218, 240,  None, 45, 0.15),
}

# chave -> (forma, matiz alvo em graus (None = original), fator saturacao, fator brilho)
TIPOS = {
    # herois
    'mage':           ('orbe',  270, 1.0, 1.0),
    'archer':         ('adaga',  35, 0.25, 0.9),
    'warlock':        ('orbe',  285, 1.0, 0.75),
    'druid':          ('bola',  110, 0.9, 0.9),
    'necromancer':    ('orbe',   95, 0.8, 0.85),
    'bard':           ('orbe',  320, 0.9, 1.0),
    'cleric':         ('bola',   45, 0.7, 1.15),
    'paladin':        ('disco',  45, 0.9, 1.1),
    'priest':         ('bola',   45, 0.15, 1.25),
    'jester':         ('orbe',    0, 1.0, 1.0),
    'runesmith':      ('disco', 205, 0.7, 1.0),
    'sylvanite':      ('adaga', 110, 0.9, 0.9),
    'dreadlord':      ('orbe',  350, 1.0, 0.6),
    'inquisitor':     ('adaga',  45, 0.4, 1.2),
    'frost_warden':   ('gelo',  None, 1.0, 1.0),
    'berserker':      ('disco',   0, 1.0, 0.9),
    'vex':            ('adaga', 275, 0.9, 0.9),
    'ixara':          ('raio',  None, 1.0, 1.0),
    'morrigan':       ('orbe',  190, 0.7, 0.7),
    'zylvara':        ('bola',  175, 0.9, 1.0),
    'malachar_human': ('orbe',  355, 1.0, 0.55),
    'yue':            ('disco', 300, 0.8, 1.10),
    'billy':          ('adaga',  45, 0.05, 1.35),
    # inimigos
    'enemy':          ('bola',   20, 0.9, 0.9),
    'enemy_bone':     ('adaga',  40, 0.10, 1.1),
    'enemy_bone_big': ('bola',   40, 0.10, 1.1),
    'enemy_magic':    ('orbe',  275, 1.0, 0.9),
    'enemy_nature':   ('bola',  110, 0.9, 0.9),
    'boss':           ('bola',  None, 1.0, 1.0),
    # efeitos especiais (onHitEffect)
    'fx_fireball':        ('bola',  None, 1.0, 1.0),
    'fx_explosive-arrow': ('adaga', None, 1.0, 1.0),
    'fx_lightning':       ('raio',  None, 1.0, 1.0),
    'fx_poison-bolt':     ('orbe',  100, 1.0, 0.9),
    'fx_entangle':        ('bola',  120, 0.8, 0.7),
    'fx_jester-gold':     ('orbe',   45, 0.9, 1.1),
    'fx_jester-purple':   ('orbe',  275, 1.0, 1.0),
}

def quadros(forma):
    arq, cw, ch, linha, total, esc = FORMAS[forma]
    im = Image.open(SRC + arq).convert('RGBA')
    cols = im.width // cw
    # todos os quadros NAO vazios (o raio tem quadros em branco no comeco), depois amostra N
    todos = []
    for i in range(total):
        c, r = (i % cols, i // cols) if linha is None else (i, linha)
        q = im.crop((c * cw, r * ch, (c + 1) * cw, (r + 1) * ch))
        if q.getbbox() is not None: todos.append(q)
    idx = [round(i * (len(todos) - 1) / (N - 1)) for i in range(N)]
    out = [todos[i] for i in idx]
    # caixa comum, pra nao pular ao animar
    bb = [q.getbbox() for q in out if q.getbbox()]
    x0 = min(b[0] for b in bb); y0 = min(b[1] for b in bb); x1 = max(b[2] for b in bb); y1 = max(b[3] for b in bb)
    out = [q.crop((x0, y0, x1, y1)) for q in out]
    w = max(1, round((x1 - x0) * esc)); h = max(1, round((y1 - y0) * esc))
    return [q.resize((w, h), Image.NEAREST) for q in out], w, h

def recolorir(q, hue, sat, val):
    a = q.getchannel('A')
    hsv = q.convert('RGB').convert('HSV')
    H, S, V = hsv.split()
    if hue is not None:
        d = round((hue - FIRE_HUE) * 255 / 360)
        H = H.point(lambda p: (p + d) % 256)
    S = S.point(lambda p: min(255, round(p * sat)))
    V = V.point(lambda p: min(255, round(p * val)))
    rgb = Image.merge('HSV', (H, S, V)).convert('RGB')
    rgb.putalpha(a)
    return rgb

os.makedirs(OUT, exist_ok=True)
cache = {}
cat = {}
for chave, (forma, hue, sat, val) in TIPOS.items():
    if forma not in cache: cache[forma] = quadros(forma)
    qs, w, h = cache[forma]
    tira = Image.new('RGBA', (w * N, h), (0, 0, 0, 0))
    for i, q in enumerate(qs):
        tira.paste(recolorir(q, hue, sat, val), (i * w, 0))
    tira.save(OUT + f'{chave}.png')
    cat[chave] = {'w': w, 'h': h, 'n': N}
    print(f'{chave:22s} {forma:6s} {w}x{h} x{N}')

with open(CAT, 'w', encoding='utf-8', newline='\n') as f:
    f.write('// GERADO por scripts/projeteis.py — nao editar a mao.\n')
    f.write('// Tiras horizontais em public/sprites/projectiles/<chave>.png, n quadros de w x h.\n')
    f.write('export const PROJECTILE_SPRITES: Record<string, { w: number; h: number; n: number }> = ')
    f.write(json.dumps(cat, indent=2).replace('"', "'"))
    f.write(';\n')
print('catalogo:', CAT)
