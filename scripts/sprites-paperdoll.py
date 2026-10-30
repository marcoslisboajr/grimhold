# ══════════════════════════════════════════════════════════════════════
# sprites-paperdoll.py — monta herois novos a partir do pacote de paperdolls
# do Time Fantasy (assets-pixel/personagens/TF_guest_paperdolls/paperdolls/)
# e grava em public/sprites/allies/<tipo>.png, no formato dos outros herois
# (um quadro, DE FRENTE, ~84 px de altura).
#
# Cada peca e uma folha 208x288 = 4 colunas x 4 linhas (baixo, esquerda,
# DIREITA, cima) de 52x72, ja em 2x. A montagem e so sobrepor as camadas
# (base -> pernas -> tronco -> cabelo/chapeu), voltar pra 1x (26x36) e
# ampliar x3 (NEAREST) — os herois atuais tem ~28 px nativos x3.
#
# Recolor (Yue): troca de paleta no cabelo, pixel a pixel — sem IA.
#
# Uso:  python scripts/sprites-paperdoll.py
#       depois: python scripts/retratos-pixel.py  (retratos)
# ══════════════════════════════════════════════════════════════════════
import os, colorsys
from PIL import Image

R = 'assets-pixel/personagens/TF_guest_paperdolls/paperdolls/'
OUT = 'public/sprites/allies/'
CANVAS = (68, 92)               # tamanho dos herois atuais (public/sprites/allies/mage.png)
QUADRO = (0, 0, 52, 72)         # coluna 0, linha 0 = parado, DE FRENTE (como os outros herois)

# loiro do pacote -> platinado (claro, quase branco, sombra fria)
PLATINADO = {
    (237, 205, 107): (250, 247, 236),   # luz
    (209, 164, 84):  (228, 222, 206),   # base
    (179, 114, 66):  (176, 168, 156),   # sombra
    (153, 76, 61):   (98, 88, 92),      # contorno (marrom-vermelho -> cinza frio)
}

HEROIS = {
    'yue': {
        # quimono vinho (peças femininas do tier leve): roupa andrógina, pedido do Marcos em 24/09
        'camadas': ['_Bases/base_human_m_1.png',
                    '2 Explorer Tier/paperdolls/ar_f_lt_lg_2.png',
                    '2 Explorer Tier/paperdolls/ar_f_lt_bd_2.png',
                    'B Hairs Blonde/hair_f_14_blonde.png'],
        'recolor': {'B Hairs Blonde/hair_f_14_blonde.png': PLATINADO},
        'tingir': {'2 Explorer Tier/paperdolls/ar_f_lt_lg_2.png': (340, 0.45, 0.95),
                   '2 Explorer Tier/paperdolls/ar_f_lt_bd_2.png': (340, 0.45, 0.95)},
    },
    'billy': {
        'camadas': ['_Bases/base_human_m_4.png',
                    '2 Explorer Tier/paperdolls/ar_m_lt_lg_1.png',
                    '2 Explorer Tier/paperdolls/ar_m_lt_bd_1.png',
                    '3 NPC/head_tophat.png'],
        'recolor': {},
    },
}

def paleta_do(im):
    """cores (sem alfa) mais usadas, pra descobrir a paleta de uma peca"""
    cont = {}
    for px in im.getdata():
        if px[3]: cont[px[:3]] = cont.get(px[:3], 0) + 1
    return sorted(cont.items(), key=lambda kv: -kv[1])

def recolorir(im, mapa):
    """troca exata de cores; cores fora do mapa ficam (contorno etc.)"""
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a and (r, g, b) in mapa:
                px[x, y] = mapa[(r, g, b)] + (a,)
    return im

def tingir(im, matiz, sat, brilho):
    """pinta a peça inteira num tom (matiz em graus), mantendo o claro/escuro de cada pixel"""
    im = im.copy(); px = im.load(); w, h = im.size
    for y in range(h):
        for x in range(w):
            r, g, b, a = px[x, y]
            if a:
                _, _, v = colorsys.rgb_to_hsv(r / 255, g / 255, b / 255)
                rr, gg, bb = colorsys.hsv_to_rgb(matiz / 360, sat, min(1, v * brilho))
                px[x, y] = (int(rr * 255), int(gg * 255), int(bb * 255), a)
    return im

os.makedirs(OUT, exist_ok=True)
for tipo, cfg in HEROIS.items():
    canvas = Image.new('RGBA', (52, 72), (0, 0, 0, 0))
    for camada in cfg['camadas']:
        peca = Image.open(R + camada).convert('RGBA').crop(QUADRO)
        if camada in cfg['recolor']:
            peca = recolorir(peca, cfg['recolor'][camada])
        if camada in cfg.get('tingir', {}):
            peca = tingir(peca, *cfg['tingir'][camada])
        canvas.alpha_composite(peca)
    bb = canvas.getbbox()
    canvas = canvas.crop(bb)
    um_x = canvas.resize((canvas.width // 2, canvas.height // 2), Image.NEAREST)   # volta pro 1x
    grande = um_x.resize((um_x.width * 3, um_x.height * 3), Image.NEAREST)
    # Mesmo canvas dos outros herois (68x92, com margem transparente): a UI
    # encaixa o <img> num quadrado, entao proporcao diferente = sprite esticada.
    final = Image.new('RGBA', CANVAS, (0, 0, 0, 0))
    ox = (CANVAS[0] - grande.width) // 2
    oy = CANVAS[1] - grande.height          # pes no chao; se sobrar 1 px, corta no topo
    final.alpha_composite(grande.crop((0, max(0, -oy), grande.width, grande.height)), (ox, max(0, oy)))
    final.save(OUT + tipo + '.png')
    print(f'{tipo:8s} {final.width}x{final.height}  camadas={len(cfg["camadas"])}')
