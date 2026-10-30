# ======================================================================
# vfx-magias.py - exporta as folhas PIXEL ART da camada de efeitos de magia
# (components/efeitosMagias.tsx) para public/sprites/vfx/<nome>.png.
#
# Regra de estilo (Marcos, 28/9): tudo pixel art, na resolucao NATIVA (1x, igual
# aos PNGs de public/sprites/allies), sem alfa parcial (borda dura), paleta curta.
# O jogo desenha a folha em 2x com image-rendering: pixelated e quadros em degrau.
#
# Fontes (so pacotes comprados; nada de IA, nada da DLC do RPG Maker MV):
#  - luz/sombra: Time Fantasy "Action Monsters" extras/simple_death_effect.png
#    (5 quadros 32x32, 3 cores duras) - ja e pixel art nativo. sombra = luz com
#    as 3 cores trocadas por roxo (mesmo desenho).
#  - fogo/gelo: Elemental VFX (Sang Hendrix) reduzido para a resolucao nativa
#    (caixa), alfa cortado em 50% e paleta quantizada em poucas cores, para
#    casar com os projeteis (scripts/projeteis.py usa o mesmo pacote).
#
# Imprime n/w/h de cada folha: copiar para VFX_FOLHAS em efeitosMagias.tsx.
# Uso:  python scripts/vfx-magias.py   (ASSETS_PIXEL=<caminho> fora da raiz)
# ======================================================================
import os
from PIL import Image

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ASSETS = os.environ.get('ASSETS_PIXEL') or os.path.join(RAIZ, 'assets-pixel')
EVFX = os.path.join(ASSETS, 'cursores-efeitos', 'elemental_vfx', 'Elemental VFX (v100)', 'FX Elements')
TF_MORTE = os.path.join(ASSETS, 'personagens', 'action_monsters', 'extras', 'simple_death_effect.png')
OUT = os.path.join(RAIZ, 'public', 'sprites', 'vfx')

LUZ_PARA_SOMBRA = {(255, 255, 255): (230, 205, 255), (255, 246, 153): (178, 120, 230), (251, 200, 0): (104, 52, 160)}


def tira(quadros, nome):
    w, h = quadros[0].size
    t = Image.new('RGBA', (w * len(quadros), h), (0, 0, 0, 0))
    for i, q in enumerate(quadros):
        t.paste(q, (i * w, 0))
    t.save(os.path.join(OUT, nome + '.png'), optimize=True)
    print(f"{nome}: n={len(quadros)} w={w} h={h}")


def grade(arq, cols, lins):
    im = Image.open(arq).convert('RGBA')
    fw, fh = im.width // cols, im.height // lins
    qs = [im.crop((c * fw, r * fh, (c + 1) * fw, (r + 1) * fh)) for r in range(lins) for c in range(cols)]
    return [q for q in qs if sum(q.getchannel('A').histogram()[21:]) >= 4]


def pixelar(qs, n, lado, cores):
    """n quadros espalhados, caixa comum, reduz ate `lado` px (maior eixo), alfa duro, paleta curta."""
    idx = [round(i * (len(qs) - 1) / (n - 1)) for i in range(n)]
    qs = [qs[i] for i in idx]
    bb = [q.getbbox() for q in qs]
    box = (min(b[0] for b in bb), min(b[1] for b in bb), max(b[2] for b in bb), max(b[3] for b in bb))
    qs = [q.crop(box) for q in qs]
    k = lado / max(qs[0].size)
    w, h = max(1, round(qs[0].width * k)), max(1, round(qs[0].height * k))
    peq = [q.resize((w, h), Image.BOX) for q in qs]
    # paleta comum a todos os quadros (sem tremer de cor entre quadros)
    amostra = Image.new('RGB', (w * n, h))
    for i, q in enumerate(peq):
        amostra.paste(q.convert('RGB'), (i * w, 0), q.getchannel('A').point(lambda a: 255 if a >= 128 else 0))
    pal = amostra.quantize(cores + 1)
    out = []
    for q in peq:
        a = q.getchannel('A').point(lambda a: 255 if a >= 128 else 0)
        rgb = q.convert('RGB').quantize(palette=pal, dither=Image.Dither.NONE).convert('RGB')
        rgb.putalpha(a)
        out.append(rgb)
    return out


if __name__ == '__main__':
    os.makedirs(OUT, exist_ok=True)
    luz = [Image.open(TF_MORTE).convert('RGBA').crop((i * 32, 0, i * 32 + 32, 32)) for i in range(5)]
    tira(luz, 'luz')
    sombra = []
    for q in luz:
        s = q.copy(); px = s.load()
        for y in range(s.height):
            for x in range(s.width):
                r, g, b, a = px[x, y]
                if a: px[x, y] = LUZ_PARA_SOMBRA.get((r, g, b), (r, g, b)) + (255,)
        sombra.append(s)
    tira(sombra, 'sombra')
    tira(pixelar(grade(os.path.join(EVFX, 'Fire_Disc_Burst.png'), 6, 5), 8, 32, 5), 'fogo')
    tira(pixelar(grade(os.path.join(EVFX, 'Comet_Explode.png'), 8, 6), 8, 32, 4), 'gelo')
