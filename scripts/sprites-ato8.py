# ══════════════════════════════════════════════════════════════════════
# sprites-ato8.py — recorta os inimigos do Ato VIII (O Mar Sem Fundo) e as
# variantes, no formato do EnemySprite:
# public/sprites/enemies/<tipo>_1..4.png (passo1, parado, passo2, parado).
#
# Mesmo molde do sprites-ato7.py. Folhas de 8 personagens do 2017patron
# (piratas, peixes) e do action_monsters (aguas-vivas, tartarugas) em x2;
# folhas de acao 32x32 (caranguejo, serpente) em x2; chefes do
# tf_mythicalbosses (Kraken, Garuda) em x2.
#
# Elenco (docs/ATOS_VI_X_ASSETS.md): Afogados (piratas recoloridos verde-
# agua), cardumes, aguas-vivas (4 cores), caranguejos, tartarugas,
# serpentes do mar; chefes Capitao Afogado / Garuda / Kraken.
#
# Uso:   python scripts/sprites-ato8.py            (grava os sprites)
#        python scripts/sprites-ato8.py previa     (+ GIF de todos andando)
# ══════════════════════════════════════════════════════════════════════
import os, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageChops, ImageFont

P = 'assets-pixel/personagens/'
OUT = 'public/sprites/enemies/'
ESC = 2
ESC_3X = {'cardume', 'cardume_b', 'cardume_c', 'serpente_mar', 'serpente_mar_b', 'serpente_mar_c', 'serpente_mar_d'}   # folhas pequenas

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

def sem_sombra(q, corte=8):
    # a folha da agua-viva ja traz sombra no pe; o jogo desenha a propria
    return [x.crop((0, 0, x.width, x.height - corte)) for x in q]

def tartaruga(cor):
    # turtle_rmsheet nao e folha de 8: colunas = direcao x cor (blocos de 3:
    # baixo, esquerda, direita, cima; dentro do bloco vermelho/amarelo/azul),
    # linhas = quadros. Esquerda = coluna 3 + cor; linhas 2-5 andam.
    im = Image.open(P + TA).convert('RGBA')
    return [im.crop(((3 + cor) * 80, r * 48, (4 + cor) * 80, (r + 1) * 48)) for r in (2, 3, 4, 5)]

def espelhar(q): return [x.transpose(Image.FLIP_LEFT_RIGHT) for x in q]   # folha olha p/ direita

def tingir(q, tom, peso, brilho=1.0, cor=1.0):
    out = []
    for x in q:
        a = x.getchannel('A')   # Brightness tambem escurece o alfa: guarda e devolve
        x = ImageEnhance.Color(ImageEnhance.Brightness(x).enhance(brilho)).enhance(cor); x.putalpha(a)
        t = Image.new('RGBA', x.size, tom + (0,))
        t.putalpha(ImageChops.multiply(x.getchannel('A'), Image.new('L', x.size, int(255 * peso))))
        out.append(Image.alpha_composite(x, t))
    return out

PI = '2017patronbundle/2017/1x/pirates_100.png'
PX = '2017patronbundle/2017/1x/fish_8char_100.png'
AM = 'action_monsters/monsters/'
JE = AM + 'jelsquid/rpgmaker/jelsquid_8sheet.png'
TA = AM + 'turtle/rpgmaker/turtle_rmsheet.png'
MB = 'tf_mythicalbosses_v2/100/'   # v2: tem vista de lado (a v1 so tem frente)

def afogado(k): return tingir(folha8(PI, k), (40, 170, 150), 0.22, brilho=1.15, cor=0.7)

INIMIGOS = {
    # ondas 1-9 — o que sobe do raso
    'afogado':          afogado(0),
    'afogado_b':        afogado(1),
    'afogado_c':        afogado(2),
    'afogado_d':        afogado(3),
    'cardume':          folha8(PX, 0),
    'cardume_b':        folha8(PX, 2),
    'cardume_c':        folha8(PX, 3),
    'agua_viva':        sem_sombra(folha8(JE, 0)),
    'agua_viva_b':      sem_sombra(folha8(JE, 1)),
    'agua_viva_c':      sem_sombra(folha8(JE, 2)),
    'agua_viva_d':      sem_sombra(folha8(JE, 3)),
    # ondas 11-19 — couraca e pinca
    'caranguejo':       acao32(AM + 'crab/crab_sheet.png', 1, [0, 1, 2, 3]),
    'caranguejo_b':     acao32(AM + 'crab/crabB_sheet.png', 1, [0, 1, 2, 3]),
    'caranguejo_c':     acao32(AM + 'crab/crabC_sheet.png', 1, [0, 1, 2, 3]),
    'tartaruga':        tartaruga(0),
    'tartaruga_b':      tartaruga(1),
    'tartaruga_c':      tartaruga(2),
    # ondas 21-29 — o fundo
    'serpente_mar':     tingir(espelhar(acao32(AM + 'snake/snake_sheet.png', 0, [0, 1, 2])), (30, 90, 200), 0.45, cor=0.5),
    'serpente_mar_b':   espelhar(acao32(AM + 'snake/snakeB_sheet.png', 0, [0, 1, 2])),
    'serpente_mar_c':   espelhar(acao32(AM + 'snake/snakeC_sheet.png', 0, [0, 1, 2])),
    'serpente_mar_d':   espelhar(acao32(AM + 'snake/snakeD_sheet.png', 0, [0, 1, 2])),
    'afogado_veterano': tingir(folha8(PI, 0), (20, 110, 100), 0.35, brilho=1.0, cor=0.5),
}

# Chefes do Ato VIII com sprite proprio: o Capitao Afogado e o pirata de chapeu
# (k=0) mais escuro; Garuda e Kraken vem do tf_mythicalbosses (3x4, x2).
INIMIGOS.update({
    'capitao_afogado':  tingir(folha8(PI, 0), (10, 140, 110), 0.3, brilho=1.05, cor=0.6),
    'garuda':           folha1(MB + 'boss_garuda_1.png'),
    'kraken':           folha1(MB + 'boss_kraken_1.png'),
})

def gravar():
    os.makedirs(OUT, exist_ok=True)
    finais = {}
    for tipo, ciclo in INIMIGOS.items():
        caixas = [q.getbbox() for q in ciclo if q.getbbox()]
        x0 = min(b[0] for b in caixas); y0 = min(b[1] for b in caixas)
        x1 = max(b[2] for b in caixas); y1 = max(b[3] for b in caixas)
        e = 3 if tipo in ESC_3X else ESC
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
    grande = {'garuda', 'kraken'}
    n = len(finais) - len(grande)
    linhas = (n + cols - 1) // cols
    fundo = Image.open('public/sprites/arena/bg_act8_field.png').convert('RGBA')
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
                gx_g += 400
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
        previa(fs, sys.argv[2] if len(sys.argv) > 2 else 'release-demo/previa-ato8-inimigos.gif')
