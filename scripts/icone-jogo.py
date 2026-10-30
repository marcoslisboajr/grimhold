# ══════════════════════════════════════════════════════════════════════
# icone-jogo.py — ícone do jogo (exe, janela, barra de tarefas, atalho):
# retrato pixel do Ming (public/ui/pixel/avatars/jester.png, 80x80) num
# quadro de 64x64 com moldura cor de brasa. Só arte do projeto, sem IA.
# Grava build/grimhold_icon.png, build/icon.ico e build/icons/{png,win,mac}.
# Tamanhos >= 64 ampliam em NEAREST (pixel nítido); 48/32/24/16 reduzem
# em LANCZOS (NEAREST apagaria os olhos e a boca).
# Uso: python scripts/icone-jogo.py
# ══════════════════════════════════════════════════════════════════════
from PIL import Image, ImageDraw

N = 64
av = Image.open('public/ui/pixel/avatars/jester.png').convert('RGBA')
base = Image.new('RGBA', (N, N), (22, 14, 18, 255))
base.alpha_composite(av.resize((60, 60), Image.NEAREST), (2, 3))
d = ImageDraw.Draw(base)
d.rectangle([0, 0, N - 1, N - 1], outline=(40, 18, 10))
d.rectangle([1, 1, N - 2, N - 2], outline=(214, 120, 48))
d.rectangle([2, 2, N - 3, N - 3], outline=(40, 18, 10))
for x, y in [(0, 0), (N - 1, 0), (0, N - 1), (N - 1, N - 1)]:
    base.putpixel((x, y), (0, 0, 0, 0))

def tam(s):
    return base.resize((s, s), Image.NEAREST if s >= N else Image.LANCZOS)

grande = tam(1024)
grande.save('build/grimhold_icon.png')
for s in (16, 24, 32, 48, 64, 128, 256, 512, 1024):
    tam(s).save(f'build/icons/png/{s}x{s}.png')
# .ico com cada tamanho feito à mão (o Pillow reduziria o 256 sozinho, em LANCZOS)
ico = [tam(s) for s in (256, 128, 64, 48, 32, 24, 16)]
for dest in ('build/icon.ico', 'build/icons/win/icon.ico'):
    ico[0].save(dest, format='ICO', sizes=[(i.width, i.height) for i in ico], append_images=ico[1:])
grande.save('build/icons/mac/icon.icns', format='ICNS')
print('ok')
