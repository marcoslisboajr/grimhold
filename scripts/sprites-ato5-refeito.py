# ══════════════════════════════════════════════════════════════════════
# sprites-ato5-refeito.py — recorta os inimigos NOVOS do Ato V refeito (A
# Queda de Grimhold: a traicao humana) e as variantes, no formato do
# EnemySprite: public/sprites/enemies/<tipo>_1..4.png (passo1, parado,
# passo2, parado).
#
# Mesmo molde do sprites-ato9.py. Os demonios do Ato V antigo (que vao
# para o Ato X) e os tipos `corrupt_paladin`/`death_knight` (que o Ato V
# refeito reaproveita como estao) NAO entram aqui — ja existem prontos.
#
# Elenco novo (docs/LORE.md §9, docs/ATOS_VI_X_ASSETS.md): cavaleiros
# negros (monster_dknight1/2, ja em 2x), soldados de Ashfen (folha de 8
# personagens do knight_factions, cada slot uma cor de armadura); chefes
# O Tesoureiro (paperdoll de nobre, sem arma), o Capitao de Ashfen
# (cavaleiro maior e mais escuro), o Reitor (mago encapuzado, corrompido).
#
# Uso:   python scripts/sprites-ato5-refeito.py            (grava)
#        python scripts/sprites-ato5-refeito.py previa     (+ GIF)
# ══════════════════════════════════════════════════════════════════════
import os, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageChops, ImageFont

P = 'assets-pixel/personagens/'
OUT = 'public/sprites/enemies/'
ESC = 2
ESC_MAIOR = {'capitao_ashfen': 2.7, 'runa_hostil': 3, 'runa_hostil_b': 3}   # chefe: cavaleiro maior que os soldados comuns

def folha8(arq, k):
    im = Image.open(P + arq).convert('RGBA')
    cw, ch = im.width // 4, im.height // 2
    fw, fh = cw // 3, ch // 4
    cx, cy = (k % 4) * cw, (k // 4) * ch
    q = [im.crop((cx + c * fw, cy + fh, cx + (c + 1) * fw, cy + 2 * fh)) for c in range(3)]
    return [q[0], q[1], q[2], q[1]]

def folha1(arq, linhas=4):
    im = Image.open(P + arq).convert('RGBA')
    fw, fh = im.width // 3, im.height // linhas
    y0 = fh  # linha 1 = esquerda (padrao RPG Maker)
    q = [im.crop((c * fw, y0, (c + 1) * fw, y0 + fh)) for c in range(3)]
    return [q[0], q[1], q[2], q[1]]

def runa(k):
    # 8crystal1: 4 colunas de tamanho, linhas = quadros do balanco. Pega o
    # cristal grande (coluna 3), 4 quadros da cor k (0 rosa, 1 dourado).
    im = Image.open(P + '2017patronbundle/2017/1x/8crystal1_1.png').convert('RGBA')
    return [im.crop((234, (k * 4 + r) * 36, 312, (k * 4 + r + 1) * 36)) for r in range(4)]

def tingir(q, tom, peso, brilho=1.0, cor=1.0):
    out = []
    for x in q:
        a = x.getchannel('A')
        x = ImageEnhance.Color(ImageEnhance.Brightness(x).enhance(brilho)).enhance(cor); x.putalpha(a)
        t = Image.new('RGBA', x.size, tom + (0,))
        t.putalpha(ImageChops.multiply(x.getchannel('A'), Image.new('L', x.size, int(255 * peso))))
        out.append(Image.alpha_composite(x, t))
    return out

MO = 'tf_monsters_assetpack/TimeFantasy_Monsters/2x/$monster_dknight'
KF = '2017patronbundle/2017/1x/knight_factions_1.png'
TES = 'quirky_npcs/fullcolor/conductor.png'
REI = "rmac_wizard_expansion/RMAC Wizard Expansion/img/characters/Wizard/$Wizard.png"

# folhas ja em 2x (nao ampliar de novo)
JA_2X = {'cavaleiro_negro', 'cavaleiro_negro_b', 'lich5', 'lich5_b'}

MA = 'action_monsters/monsters/marauders/rm/marauders_rm_idlewalk.png'
RC = '2017patronbundle/2017/1x/runechars_reg.png'
LI = 'tf_monsters_assetpack/TimeFantasy_Monsters/2x/$monster_lich.png'

INIMIGOS = {
    # ondas 1-9 — Ashfen e os capangas do Tesoureiro
    'soldado_ashfen':     folha8(KF, 0),
    'soldado_ashfen_b':   folha8(KF, 1),
    'soldado_ashfen_c':   folha8(KF, 4),
    'soldado_ashfen_d':   folha8(KF, 5),
    'capanga':            folha8(RC, 0),
    'capanga_b':          folha8(RC, 1),
    'capanga_c':          folha8(RC, 4),
    # ondas 11-19 — cavaleiros negros e saqueadores (+ corrupt_paladin, ja existe)
    'cavaleiro_negro':    folha1(MO + '1.png'),
    'cavaleiro_negro_b':  folha1(MO + '2.png'),
    'saqueador':          folha8(MA, 0),
    'saqueador_lanca':    folha8(MA, 1),
    'saqueador_martelo':  folha8(MA, 2),
    'saqueador_espada':   folha8(MA, 3),
    # ondas 21-29 — o Colegiado vendido (+ death_knight, ja existe)
    'lich5':              folha1(LI),
    'lich5_b':            tingir(folha1(LI), (120, 30, 160), 0.35),
    'mago_colegiado':     folha8(RC, 3),
    'mago_colegiado_b':   folha8(RC, 7),
    'runa_hostil':        tingir(runa(0), (110, 40, 200), 0.45),
    'runa_hostil_b':      tingir(runa(1), (200, 60, 30), 0.35),
}

# Chefes novos do Ato V refeito (Etapa 3): sprite proprio, x2.
INIMIGOS.update({
    'tesoureiro':         tingir(folha1(TES, linhas=4), (180, 150, 40), 0.30, brilho=1.05),   # colete dourado
    'capitao_ashfen':     tingir(folha8(KF, 6), (60, 10, 10), 0.55, brilho=0.7, cor=0.7),        # cavaleiro maior, mais escuro
    'reitor':             tingir(folha1(REI, linhas=4), (90, 30, 120), 0.40, brilho=0.85),     # mago corrompido
})

def gravar():
    os.makedirs(OUT, exist_ok=True)
    finais = {}
    for tipo, ciclo in INIMIGOS.items():
        caixas = [q.getbbox() for q in ciclo if q.getbbox()]
        x0 = min(b[0] for b in caixas); y0 = min(b[1] for b in caixas)
        x1 = max(b[2] for b in caixas); y1 = max(b[3] for b in caixas)
        e = 1 if tipo in JA_2X else ESC_MAIOR.get(tipo, ESC)
        fs = []
        for i, q in enumerate(ciclo, 1):
            q = q.crop((x0, y0, x1, y1)).resize((int((x1 - x0) * e), int((y1 - y0) * e)), Image.NEAREST)
            q.save(OUT + f'{tipo}_{i}.png'); fs.append(q)
        finais[tipo] = fs
        print(f'{tipo:18s} {fs[0].width}x{fs[0].height}')
    return finais

def previa(finais, saida):
    fonte = ImageFont.load_default()
    cols, cw, chh = 8, 150, 190
    linhas = (len(finais) + cols - 1) // cols
    fundo = Image.open('public/sprites/arena/bg_act5_field.png').convert('RGBA') if os.path.exists('public/sprites/arena/bg_act5_field.png') else Image.new('RGBA', (cols * cw, linhas * chh), (40, 30, 30, 255))
    chao = Image.new('RGBA', (cols * cw, linhas * chh))
    for y in range(0, chao.height, 600):
        chao.alpha_composite(fundo.crop((0, 200, cols * cw, 200 + min(600, chao.height - y))), (0, y))
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
    if len(sys.argv) > 1 and sys.argv[1] == 'previa':
        previa(fs, sys.argv[2] if len(sys.argv) > 2 else 'release-demo/previa-ato5refeito-inimigos.gif')
