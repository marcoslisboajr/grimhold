# Folha de contato: uma imagem com miniaturas rotuladas de todos os PNG de
# uma pasta. Serve pra escolher tileset olhando, nao pelo nome do arquivo.
#
# Uso:  python scripts/contato.py <pasta> <saida.png> [largura_thumb] [colunas]
import sys, os
from PIL import Image, ImageDraw, ImageFont

pasta = sys.argv[1]
saida = sys.argv[2]
LARG = int(sys.argv[3]) if len(sys.argv) > 3 else 200
COLS = int(sys.argv[4]) if len(sys.argv) > 4 else 6
ROTULO = 16

arquivos = sorted(f for f in os.listdir(pasta) if f.lower().endswith('.png'))
thumbs = []
for f in arquivos:
    im = Image.open(os.path.join(pasta, f)).convert('RGBA')
    esc = LARG / im.width
    alt = max(1, int(im.height * esc))
    alt = min(alt, LARG)                      # tiles altos: corta, nao esmaga
    th = im.resize((LARG, int(im.height * esc)), Image.NEAREST).crop((0, 0, LARG, alt))
    thumbs.append((f, th))

ALT_MAX = max(t.height for _, t in thumbs) + ROTULO
linhas = (len(thumbs) + COLS - 1) // COLS
folha = Image.new('RGBA', (COLS * LARG, linhas * ALT_MAX), (24, 22, 20, 255))
dr = ImageDraw.Draw(folha)
try:
    fonte = ImageFont.truetype('arial.ttf', 11)
except Exception:
    fonte = ImageFont.load_default()

for i, (nome, th) in enumerate(thumbs):
    x = (i % COLS) * LARG
    y = (i // COLS) * ALT_MAX
    folha.paste(th, (x, y + ROTULO), th)
    dr.rectangle([x, y, x + LARG, y + ROTULO], fill=(0, 0, 0, 255))
    dr.text((x + 3, y + 2), nome[:34], fill=(230, 220, 200), font=fonte)

folha.save(saida)
print(f'{len(thumbs)} imagens -> {saida} ({folha.width}x{folha.height})')
