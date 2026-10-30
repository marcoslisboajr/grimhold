# ══════════════════════════════════════════════════════════════════════
# sprites-ato9.py — recorta os inimigos do Ato IX (Os Guardioes) e as
# variantes, no formato do EnemySprite:
# public/sprites/enemies/<tipo>_1..4.png (passo1, parado, passo2, parado).
#
# Mesmo molde do sprites-ato8.py. Exercito de Esqueletos (skeletonarmy,
# personagens que o Ato VI nao usou), cranios grandes, mumias, estatuas-
# lamina (slicer), beholders B, cerbero; chefes Drider, Estatuas Leste e
# Oeste e Quimera do tf_mythicalbosses (x2).
#
# Uso:   python scripts/sprites-ato9.py            (grava os sprites)
#        python scripts/sprites-ato9.py previa     (+ GIF de todos andando)
# ══════════════════════════════════════════════════════════════════════
import os, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageChops, ImageFont

P = 'assets-pixel/personagens/'
OUT = 'public/sprites/enemies/'
ESC = 2
ESC_3X = {'estatua_lamina', 'estatua_lamina_b', 'estatua_lamina_c'}   # folha pequena

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

def sem_sombra(q, corte=10):
    # os cranios ja trazem sombra no pe; o jogo desenha a propria
    return [x.crop((0, 0, x.width, x.height - corte)) for x in q]

def tingir(q, tom, peso, brilho=1.0, cor=1.0):
    out = []
    for x in q:
        a = x.getchannel('A')   # Brightness tambem escurece o alfa: guarda e devolve
        x = ImageEnhance.Color(ImageEnhance.Brightness(x).enhance(brilho)).enhance(cor); x.putalpha(a)
        t = Image.new('RGBA', x.size, tom + (0,))
        t.putalpha(ImageChops.multiply(x.getchannel('A'), Image.new('L', x.size, int(255 * peso))))
        out.append(Image.alpha_composite(x, t))
    return out

LI = 'tf_lichcrusades_v2/100/skeletonarmy.png'
AM = 'action_monsters/monsters/'
SK = AM + 'skulls/rpgmaker/bigskull'
MB = 'tf_mythicalbosses_v2/100/'   # v2: tem vista de lado (a v1 so tem frente)

def pedra(q): return tingir(q, (150, 150, 160), 0.15, cor=0.25)

INIMIGOS = {
    # ondas 1-9 — a guarda de ossos (o Exercito em formacao; Ato VI usou k=0,2,4)
    'legiao':           folha8(LI, 1),
    'legiao_b':         folha8(LI, 3),
    'legiao_c':         folha8(LI, 5),
    'legiao_d':         folha8(LI, 6),
    'legiao_e':         folha8(LI, 7),
    'cranio':           sem_sombra(folha1(SK + 'A_1.png')),
    'cranio_b':         sem_sombra(folha1(SK + 'B_1.png')),
    'cranio_c':         sem_sombra(folha1(SK + 'C_1.png')),
    'cranio_d':         sem_sombra(folha1(SK + 'D_1.png')),
    'mumia':            folha1('2017patronbundle/2017/1x/mummy_1.png'),
    'mumia_b':          tingir(folha1('2017patronbundle/2017/1x/mummy_1.png'), (90, 80, 70), 0.35, brilho=0.8),
    # ondas 11-19 — o que vigia
    'estatua_lamina':   acao32(AM + 'slicer/slicer_statues.png', 0, [1, 2, 3, 4]),
    'estatua_lamina_b': acao32(AM + 'slicer/slicer_statues.png', 0, [6, 7, 8, 9]),
    'beholder9':        folha1(MB + 'beholder_b_1.png'),
    'beholder9_b':      tingir(folha1(MB + 'beholder_b_1.png'), (170, 40, 40), 0.35),
    # ondas 21-29 — as feras do portao
    # filhotes da Drider (monster1 do tf_monsters_assetpack, ja em 2x: x1) (so ela chama; nao entram nas faixas)
    'aranha':           folha8('tf_monsters_assetpack/TimeFantasy_Monsters/2x/monster1.png', 2),
    'aranha_b':         tingir(folha8('tf_monsters_assetpack/TimeFantasy_Monsters/2x/monster1.png', 2), (120, 40, 160), 0.35),
    'cerbero':          folha1(MB + 'cerberus_1.png'),
    'cerbero_b':        tingir(folha1(MB + 'cerberus_1.png'), (40, 40, 60), 0.4, brilho=0.8),
    'estatua_lamina_c': pedra(acao32(AM + 'slicer/slicer_statues.png', 0, [1, 2, 3, 4])),
}

# Chefes do Ato IX: Drider, Estatuas Leste e Oeste (luta dupla), Quimera.
INIMIGOS.update({
    'drider':           folha1(MB + 'boss_drider_1.png'),
    'estatua_leste':    folha1(MB + 'boss_statue_east_1.png'),
    'estatua_oeste':    folha1(MB + 'boss_statue_west_1.png'),
    'quimera':          folha1(MB + 'boss_chimera_1.png'),
})

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
    grande = {'drider', 'estatua_leste', 'estatua_oeste', 'quimera'}
    n = len(finais) - len(grande)
    linhas = (n + cols - 1) // cols
    fundo = Image.open('public/sprites/arena/bg_act9_field.png').convert('RGBA')
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
    if len(sys.argv) > 1 and sys.argv[1] == 'previa':
        previa(fs, sys.argv[2] if len(sys.argv) > 2 else 'release-demo/previa-ato9-inimigos.gif')
