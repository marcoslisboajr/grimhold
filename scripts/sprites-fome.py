# ══════════════════════════════════════════════════════════════════════
# sprites-fome.py — recorta os sprites da luta final do Ato X (A Fome) do
# pack monsterbelly (pasta RMMVZ/, escala 3) e grava em public/sprites/enemies/.
#
#   fome_verme_1..9   O Verme (fase 2). O pack NAO tem pose de lado: a folha e
#                     vista de cima (monte que brota -> boca que abre). Quadros
#                     1-4 = emergir, 5-8 = abrir a boca, 9 = boca aberta.
#                     Afundar = mesma lista de tras para frente (no desenho).
#   fome_coracao_1..4 O Coracao (fase 3), pulso 1-2-3-2 (ampliar x2 no desenho).
#   fome_agarra_1..4  Tentaculo que brota do chao e prende (fase 1).
#   fome_ponto_1..4   Ponto Fraco aberto (olho do cenario act10b/olho_1-2-1-2) e
#   fome_ponto_fechado  o olho fechado (olho_3), gerados por cenario-ato10-ventre.py.
#
# Sem fome_buraco: o giantworm_terrain e o mesmo verme com chao de areia/grama
# pintado atras (nao ha buraco solto). Sem fome_aviso: o pack nao tem circulo/
# rachadura; o aviso e desenhado por codigo.
#
# Uso:   python scripts/sprites-fome.py     (grava os sprites e a previa
#        release-demo/previa-fome/folhas.png)
# ══════════════════════════════════════════════════════════════════════
import os
from PIL import Image, ImageDraw, ImageChops, ImageFont

P = 'assets-pixel/personagens/monsterbelly/RMMVZ/'
OUT = 'public/sprites/enemies/'
PREVIA = 'release-demo/previa-fome/folhas.png'

def abrir(arq):
    return Image.open(P + arq).convert('RGBA')

def verme():
    # 12x4 celulas de 144x144 (4 personagens de 3 colunas); so a coluna do
    # meio de cada personagem tem desenho, as 4 linhas sao a sequencia.
    im = abrir('giantworm_1_3x.png')
    cel = lambda col, lin: im.crop((col * 144, lin * 144, (col + 1) * 144, (lin + 1) * 144))
    mapa = [(1, l) for l in range(4)] + [(7, l) for l in range(4)] + [(10, 0)]
    return mapa, [cel(c, l) for c, l in mapa]

def coracao():
    # 3x4 de 144x192; linha 0 (sem sombra), colunas 0-1-2 = batida
    im = abrir('$heartbeat_3.png')
    q = [im.crop((c * 144, 0, (c + 1) * 144, 192)) for c in range(3)]
    return [(c, 0) for c in (0, 1, 2, 1)], [q[0], q[1], q[2], q[1]]

def agarra():
    # evento "!" (4x2 personagens de 3x4 quadros 48x96); personagem 1 (verde),
    # coluna do meio, linhas 0..3 = brotar -> tentaculo inteiro
    im = abrir('!tf_insidebelly_tentacle_3.png')
    mapa = [(4, l) for l in range(4)]
    return mapa, [im.crop((c * 48, l * 96, (c + 1) * 48, (l + 1) * 96)) for c, l in mapa]

def recortar(qs):
    caixas = [q.getbbox() for q in qs if q.getbbox()]
    x0 = min(b[0] for b in caixas); y0 = min(b[1] for b in caixas)
    x1 = max(b[2] for b in caixas); y1 = max(b[3] for b in caixas)
    return [q.crop((x0, y0, x1, y1)) for q in qs]

def mudanca(a, b):
    d = ImageChops.difference(a, b).convert('L').point(lambda v: 255 if v > 20 else 0)
    return d.histogram()[255]

def gravar():
    os.makedirs(OUT, exist_ok=True)
    finais = {}
    for nome, fn in (('fome_verme', verme), ('fome_coracao', coracao), ('fome_agarra', agarra)):
        mapa, qs = fn()
        qs = recortar(qs)
        for i, q in enumerate(qs, 1):
            q.save(OUT + f'{nome}_{i}.png')
        muda = [mudanca(qs[i], qs[(i + 1) % len(qs)]) for i in range(len(qs))]
        print(f'{nome:14s} {qs[0].width}x{qs[0].height}  quadros (coluna, linha): {mapa}')
        print(f'{"":14s} pixels que mudam entre quadros seguidos: {muda}')
        finais[nome] = qs
    return finais

def previa(finais):
    os.makedirs(os.path.dirname(PREVIA), exist_ok=True)
    fonte = ImageFont.load_default()
    fundo = Image.open('public/sprites/arena/bg_act10b_field.png').convert('RGBA')
    larg = max(sum(q.width + 12 for q in qs) for qs in finais.values()) + 24
    alt = sum(max(q.height for q in qs) + 40 for qs in finais.values()) + 12
    tela = Image.new('RGBA', (larg, alt), (18, 4, 10, 255))
    for y in range(0, alt, fundo.height):
        for x in range(0, larg, fundo.width):
            tela.alpha_composite(fundo, (x, y))
    d = ImageDraw.Draw(tela)
    y = 12
    for nome, qs in finais.items():
        h = max(q.height for q in qs)
        d.text((12, y), nome + f'  ({len(qs)} quadros, {qs[0].width}x{qs[0].height})', fill=(255, 240, 210), font=fonte)
        x = 12
        for i, q in enumerate(qs, 1):
            tela.alpha_composite(q, (x, y + 16 + h - q.height))
            d.text((x, y + 18 + h), str(i), fill=(255, 200, 200), font=fonte)
            x += q.width + 12
        y += h + 40
    tela.convert('RGB').save(PREVIA)
    print('previa:', PREVIA)

def pontos():
    # o Ponto Fraco usa o olho do cenario do ventre (mesmo desenho, formato do EnemySprite)
    olho = [Image.open(f'public/sprites/arena/act10b/olho_{i}.png').convert('RGBA') for i in (1, 2, 3)]
    for i, q in enumerate([olho[0], olho[1], olho[0], olho[1]], 1):
        q.save(OUT + f'fome_ponto_{i}.png')
    olho[2].save(OUT + 'fome_ponto_fechado.png')
    print('fome_ponto     72x72  olho_1-2-1-2 (aberto), olho_3 (fechado)')

if __name__ == '__main__':
    pontos()
    previa(gravar())
