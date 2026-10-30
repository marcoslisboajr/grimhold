# ══════════════════════════════════════════════════════════════════════
# sprites-ato10.py — recorta os inimigos NOVOS das ondas 1-29 do Ato X (a
# porta da Fome), no formato do EnemySprite: <tipo>_1..4.png.
#
# Os outros papeis ja existem e entram na ficha como estao: a legiao do
# Ato V antigo (void_stalker, lord_demon, demon_eyes, lesser_demon), os
# acaros do VI (acaro_*), as vespas do VII (vespa*), void_herald e
# warlock_shade. Aqui so: monstros-celula, tentaculos, slimes grandes e
# bolhas do ventre (monsterbelly e action_monsters/slime).
#
# Uso:   python scripts/sprites-ato10.py            (grava os sprites)
#        python scripts/sprites-ato10.py previa     (+ GIF)
# ══════════════════════════════════════════════════════════════════════
import os, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageChops, ImageFont

P = 'assets-pixel/personagens/'
OUT = 'public/sprites/enemies/'
ESC = 2
ESC_3X = {'tentaculo', 'tentaculo_b', 'bolha', 'bolha_b', 'slime_grande', 'slime_grande_b'}   # folhas pequenas

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

def acao32(arq, linha, cols):
    # folhas de acao do action_monsters: celulas 32x32; pega uma linha
    im = Image.open(P + arq).convert('RGBA')
    q = [im.crop((c * 32, linha * 32, (c + 1) * 32, (linha + 1) * 32)) for c in cols]
    return q if len(q) == 4 else [q[0], q[1], q[2], q[1]]

def tingir(q, tom, peso, brilho=1.0, cor=1.0):
    out = []
    for x in q:
        a = x.getchannel('A')   # Brightness tambem escurece o alfa: guarda e devolve
        x = ImageEnhance.Color(ImageEnhance.Brightness(x).enhance(brilho)).enhance(cor); x.putalpha(a)
        t = Image.new('RGBA', x.size, tom + (0,))
        t.putalpha(ImageChops.multiply(x.getchannel('A'), Image.new('L', x.size, int(255 * peso))))
        out.append(Image.alpha_composite(x, t))
    return out

MB = 'monsterbelly/100/'
SL = 'action_monsters/monsters/slime/'

def celula(r):
    # cellmonsters: 3 colunas x 4 linhas; cada linha e uma cor (e redondo, sem lado)
    im = Image.open(P + MB + 'cellmonsters_1.png').convert('RGBA')
    q = [im.crop((c * 48, r * 48, (c + 1) * 48, (r + 1) * 48 - 9)) for c in range(3)]   # sem a sombra da folha
    return [q[0], q[1], q[2], q[1]]

def tentaculo(k):
    # evento "!" de 8 personagens (16x32); as linhas sao estagios do crescimento:
    # a ultima (linha 3) e o tentaculo inteiro balancando
    im = Image.open(P + MB + '!tf_insidebelly_tentacle_1.png').convert('RGBA')
    cx, cy = (k % 4) * 48, (k // 4) * 128 + 3 * 32
    q = [im.crop((cx + c * 16, cy, cx + (c + 1) * 16, cy + 32)) for c in range(3)]
    return [q[0], q[1], q[2], q[1]]

def slime(arq):
    im = Image.open(P + SL + arq).convert('RGBA')
    return [im.crop((c * 32, 0, (c + 1) * 32, 32)) for c in (0, 1, 2, 3)]

INIMIGOS = {
    # ondas 11-19 — o que vive dentro da Fome (ja existem: acaro_*, vespa*)
    'celula':           celula(0),
    'celula_b':         celula(1),
    'celula_c':         celula(2),
    'celula_d':         celula(3),
    'tentaculo':        tentaculo(1),
    'tentaculo_b':      tentaculo(5),
    # ondas 21-29 (ja existem: void_herald, warlock_shade)
    'slime_grande':     slime('bigslime_sheet.png'),
    'slime_grande_b':   slime('bigslimeB_sheet.png'),
    'bolha':            folha8(MB + '!tf_insidebelly_tentacle_1.png', 3),
    'bolha_b':          folha8(MB + '!tf_insidebelly_tentacle_1.png', 7),
}

def gravar():
    os.makedirs(OUT, exist_ok=True)
    finais = {}
    for tipo, ciclo in INIMIGOS.items():
        caixas = [q.getbbox() for q in ciclo if q.getbbox()]
        x0 = min(b[0] for b in caixas); y0 = min(b[1] for b in caixas)
        x1 = max(b[2] for b in caixas); y1 = max(b[3] for b in caixas)
        e = 3 if tipo in ESC_3X else (1 if tipo.startswith('aranha') else ESC)
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
    grande = set()
    n = len(finais) - len(grande)
    linhas = (n + cols - 1) // cols
    fundo = Image.open('public/sprites/arena/bg_act10_field.png').convert('RGBA')
    chao = Image.new('RGBA', (cols * cw, linhas * chh + 260))
    for y in range(0, chao.height, 600):
        chao.alpha_composite(fundo.crop((0, 200, cols * cw, 200 + min(600, chao.height - y))), (0, y))
    quadros = []
    for f in range(8):
        c = chao.copy(); d = ImageDraw.Draw(c)
        i = 0; gx_g = 0
        for tipo, fs in finais.items():
            q = fs[f % 4]
            if tipo in grande:
                gy = linhas * chh
                c.alpha_composite(q, (gx_g + 40, gy + 240 - q.height))
                d.text((gx_g + 44, gy + 244), tipo, fill=(255, 240, 210), font=fonte)
                gx_g += 300
                continue
            gx, gy = (i % cols) * cw, (i // cols) * chh; i += 1
            dx = gx + (cw - q.width) // 2 - (f * 3)
            c.alpha_composite(q, (max(gx, dx), gy + chh - 30 - q.height))
            d.text((gx + 4, gy + chh - 16), tipo, fill=(255, 240, 210), font=fonte)
        quadros.append(c.convert('RGB'))
    quadros[0].save(saida, save_all=True, append_images=quadros[1:], duration=160, loop=0)
    print('previa:', saida)

if __name__ == '__main__':
    fs = gravar()
    # papeis que ja existem no jogo, so para o GIF mostrar o elenco inteiro
    import glob
    for t in ['void_stalker', 'lord_demon', 'demon_eyes', 'lesser_demon', 'acaro_vermelho', 'vespa', 'void_herald', 'warlock_shade']:
        arqs = sorted(glob.glob(OUT + t + '_[1-4].png'))
        if arqs: fs[t + ' (ja existe)'] = [Image.open(a).convert('RGBA') for a in arqs] * (4 // len(arqs) or 1)
        elif os.path.exists(OUT + t + '.png'): fs[t + ' (ja existe)'] = [Image.open(OUT + t + '.png').convert('RGBA')] * 4
        else: print('sem sprite:', t)
    if len(sys.argv) > 1 and sys.argv[1] == 'previa':
        previa(fs, sys.argv[2] if len(sys.argv) > 2 else 'release-demo/previa-ato10-inimigos.gif')
