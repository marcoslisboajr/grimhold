# Monta a prova visual da camada de efeitos (depois de node scripts/previa-efeitos.mjs):
#  - lado-a-lado.png: recorte da cena em volta do Paladino (heroi) com o circulo sagrado e as faiscas, ampliado 2x
#    em NEAREST (da pra comparar o pixel do efeito com o do sprite do heroi), + folhas cruas em 4x ao lado do
#    sprite do Paladino em 4x.
#  - caldeira.gif: os quadros gravados, recortados no mesmo lugar.
# Uso: python scripts/previa-efeitos-montar.py
import glob, os
from PIL import Image, ImageDraw

D = 'release-demo/previa-efeitos'
CORTE = (0, 150, 460, 800)   # regiao do Paladino + muralha na janela 1400x860

def zoom(im, k): return im.resize((im.width * k, im.height * k), Image.NEAREST)

cena = Image.open(os.path.join(D, 'caldeira-360-cruzada.png')).convert('RGBA').crop(CORTE)
cena = zoom(cena, 2)
# painel de referencia: heroi e folhas na mesma escala (4x)
pal = Image.open('public/sprites/allies/paladin.png').convert('RGBA')
folhas = [Image.open(f'public/sprites/vfx/{n}.png').convert('RGBA') for n in ('luz', 'sombra', 'fogo', 'gelo')]
larg = max(pal.width, *(f.width for f in folhas)) * 4
alt = pal.height * 4 + sum(f.height * 4 + 12 for f in folhas) + 12
ref = Image.new('RGBA', (larg + 24, alt), (24, 20, 28, 255))
ref.alpha_composite(zoom(pal, 4), (12, 6)); y = pal.height * 4 + 18
for f in folhas: ref.alpha_composite(zoom(f, 4), (12, y)); y += f.height * 4 + 12
H = max(cena.height, ref.height)
out = Image.new('RGBA', (cena.width + ref.width + 16, H), (12, 10, 14, 255))
out.alpha_composite(cena, (0, 0)); out.alpha_composite(ref, (cena.width + 16, 0))
ImageDraw.Draw(out).text((8, 8), 'cena (2x NEAREST)', fill=(255, 246, 153, 255))
ImageDraw.Draw(out).text((cena.width + 24, H - 16), 'Paladino + folhas vfx (4x)', fill=(255, 246, 153, 255))
out.convert('RGB').save(os.path.join(D, 'lado-a-lado.png'))

qs = [Image.open(f).convert('RGB').crop(CORTE) for f in sorted(glob.glob(os.path.join(D, 'quadros', 'q*.png')))]
if qs:
    qs = [q.quantize(64, dither=Image.Dither.NONE) for q in qs]
    qs[0].save(os.path.join(D, 'caldeira.gif'), save_all=True, append_images=qs[1:], duration=100, loop=0)
print('ok', out.size, len(qs))
