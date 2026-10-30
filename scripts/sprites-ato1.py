# ══════════════════════════════════════════════════════════════════════
# sprites-ato1.py — recorta os inimigos novos do Ato I (deserto) das folhas
# Time Fantasy em assets-pixel/personagens/tf_mythicalbosses/100/ e grava
# no formato que o EnemySprite espera: public/sprites/enemies/<tipo>_1..4.png
#
# Folha RPG Maker: 3 colunas x 4 linhas (baixo, ESQUERDA, direita, cima).
# Inimigo anda pra esquerda, entao a linha 1. Os 3 quadros viram ciclo de 4:
# passo1, parado, passo2, parado — igual ao que os sprites atuais fazem.
#
# Fundo branco e OPACO nessas folhas. Removido por preenchimento a partir
# dos cantos (so o branco conectado ao fundo), nao por cor: olho e dente
# brancos ficam.
#
# Escala x2 (NEAREST): os sprites atuais sao Time Fantasy em 2x (goblin
# 68x92 = 34x46 x2). Mesmo artista (Final Boss Blues) — coesao garantida.
#
# Uso:  python scripts/sprites-ato1.py
# ══════════════════════════════════════════════════════════════════════
import os
from PIL import Image, ImageDraw

SRC = 'assets-pixel/personagens/tf_mythicalbosses/100/'
OUT = 'public/sprites/enemies/'
ESC = 2

# tipo no jogo -> (arquivo da folha, linha da direcao "esquerda")
INIMIGOS = {
    'centaur':        ('centaur_a_1.png', 1),
    'centaur_archer': ('centaur_c_1.png', 1),
    'harpy':          ('harpy_a_fly_1.png', 1),
    'stone_guardian': ('boss_statue_east_1.png', 1),
    'medusa':         ('medusa_1.png', 1),
    'fire_dragon':    ('dragon_red_reg.png', 1),
}

def sem_fundo(im, tol=18):
    """Preenche a partir dos 4 cantos: tudo que for branco-ish CONECTADO ao
    canto vira transparente. Branco no meio do sprite fica."""
    im = im.convert('RGBA')
    w, h = im.size
    for canto in [(0, 0), (w - 1, 0), (0, h - 1), (w - 1, h - 1)]:
        r, g, b, a = im.getpixel(canto)
        if a and r > 255 - tol and g > 255 - tol and b > 255 - tol:
            ImageDraw.floodfill(im, canto, (0, 0, 0, 0), thresh=tol)
    return im

os.makedirs(OUT, exist_ok=True)
for tipo, (arq, linha) in INIMIGOS.items():
    folha = sem_fundo(Image.open(SRC + arq))
    fw, fh = folha.width // 3, folha.height // 4
    quadros = [folha.crop((c * fw, linha * fh, (c + 1) * fw, (linha + 1) * fh)) for c in range(3)]
    ciclo = [quadros[0], quadros[1], quadros[2], quadros[1]]
    # caixa comum a todos os quadros, pra o sprite nao "pular" ao animar
    caixas = [q.getbbox() for q in ciclo if q.getbbox()]
    x0 = min(b[0] for b in caixas); y0 = min(b[1] for b in caixas)
    x1 = max(b[2] for b in caixas); y1 = max(b[3] for b in caixas)
    for i, q in enumerate(ciclo, 1):
        q = q.crop((x0, y0, x1, y1))
        q = q.resize((q.width * ESC, q.height * ESC), Image.NEAREST)
        q.save(OUT + f'{tipo}_{i}.png')
    print(f'{tipo:16s} {arq:24s} -> {tipo}_1..4.png  {(x1-x0)*ESC}x{(y1-y0)*ESC}')
