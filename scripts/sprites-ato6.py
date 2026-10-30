# ══════════════════════════════════════════════════════════════════════
# sprites-ato6.py — recorta os 12 inimigos comuns do Ato VI (A Outra
# Margem) e as variantes deles, no formato do EnemySprite:
# public/sprites/enemies/<tipo>_1..4.png (ciclo passo1, parado, passo2, parado).
#
# Folhas RPG Maker de 8 personagens (4 x 2), cada um 3 quadros x 4 linhas
# (baixo, ESQUERDA, direita, cima): usa a linha 1. Monstros de acao
# (morcego, acaro, lanterna) sao tiras de lado: usa a tira toda.
# Escala x2 (NEAREST), igual aos outros Time Fantasy do jogo.
#
# Elenco (docs/ATOS_VI_X_ASSETS.md): ondas 1-9 cultistas vermelho/branco/
# verde + lanterna-fantasma; 11-19 anjo, anjo sem asas, morcego, acaro;
# 21-29 Lich, cavaleiro caido, esqueleto, fenix menor.
#
# Uso:   python scripts/sprites-ato6.py            (grava os sprites)
#        python scripts/sprites-ato6.py previa     (+ GIF de todos andando)
# ══════════════════════════════════════════════════════════════════════
import os, sys
from PIL import Image, ImageDraw, ImageEnhance, ImageChops, ImageFont

P = 'assets-pixel/personagens/'
OUT = 'public/sprites/enemies/'
ESC = 2

def folha8(arq, k):
    """Personagem k (0-7) de uma folha de 8; devolve os 3 quadros andando pra esquerda."""
    im = Image.open(P + arq).convert('RGBA')
    cw, ch = im.width // 4, im.height // 2
    fw, fh = cw // 3, ch // 4
    cx, cy = (k % 4) * cw, (k // 4) * ch
    q = [im.crop((cx + c * fw, cy + fh, cx + (c + 1) * fw, cy + 2 * fh)) for c in range(3)]
    return [q[0], q[1], q[2], q[1]]

def folha1(arq):
    """Folha de um personagem so (3 x 4), linha da esquerda."""
    im = Image.open(P + arq).convert('RGBA')
    fw, fh = im.width // 3, im.height // 4
    q = [im.crop((c * fw, fh, (c + 1) * fw, 2 * fh)) for c in range(3)]
    return [q[0], q[1], q[2], q[1]]

def tira(arq, n, tam, linha=0):
    """Tira de monstro de acao: n quadros de tam x tam na linha dada."""
    im = Image.open(P + arq).convert('RGBA')
    q = [im.crop((c * tam, linha * tam, (c + 1) * tam, (linha + 1) * tam)) for c in range(n)]
    return (q * 4)[:4] if n < 4 else q[:4]

def espelhar(q): return [x.transpose(Image.FLIP_LEFT_RIGHT) for x in q]

def tingir(q, tom, peso, brilho=1.0, cor=1.0):
    out = []
    for x in q:
        x = ImageEnhance.Color(ImageEnhance.Brightness(x).enhance(brilho)).enhance(cor)
        t = Image.new('RGBA', x.size, tom + (0,))
        t.putalpha(ImageChops.multiply(x.getchannel('A'), Image.new('L', x.size, int(255 * peso))))
        out.append(Image.alpha_composite(x, t))
    return out

CULT = 'elements_cultists/100/e_cultists'
LICH = 'tf_lichcrusades_v2/100/'
ACAO = 'action_monsters/monsters/'
VIOLETA = (130, 60, 210)

# tipo -> quadros (4). Variantes: mesmo papel no jogo, outra cor/roupa.
INIMIGOS = {
    # ondas 1-9 — os cultistas que abriram as primeiras Rupturas
    'cultista_vermelho':    folha8(CULT + 'B.png', 2),   # canaliza: dobra o dano dos demonios
    'cultista_vermelho_b':  folha8(CULT + 'B.png', 7),
    'cultista_branco':      folha8(CULT + 'B.png', 0),   # cura
    'cultista_branco_b':    folha8(CULT + 'B.png', 5),
    'cultista_verde':       folha8(CULT + 'C.png', 2),   # se explode
    'cultista_verde_b':     folha8(CULT + 'C.png', 7),
    'cultista_negro':       folha8(CULT + 'A.png', 0),   # variante escura (qualquer papel)
    'cultista_azul':        folha8(CULT + 'A.png', 2),
    'lanterna':             espelhar(tira(ACAO + 'lantphant/lanternphantom_sheet.png', 4, 32)),
    'lanterna_b':           espelhar(tira(ACAO + 'lantphant/lanternphantomB_sheet.png', 4, 32)),
    # ondas 11-19 — a Hoste Caida e o que vive nas frestas
    'anjo':                 folha8(LICH + 'angel.png', 0),
    'anjo_rubro':           folha8(LICH + 'angel.png', 2),
    'anjo_sombrio':         folha8(LICH + 'angel.png', 5),
    'anjo_sem_asas':        folha8(LICH + 'angel_wingless.png', 0),
    'anjo_sem_asas_rubro':  folha8(LICH + 'angel_wingless.png', 2),
    'anjo_sem_asas_sombrio': folha8(LICH + 'angel_wingless.png', 5),
    'morcego':              tira(ACAO + 'bat/bat_sheet.png', 4, 32),
    'morcego_rubro':        tingir(tira(ACAO + 'bat/bat_sheet.png', 4, 32), (200, 30, 60), 0.35),
    'acaro_azul':           tira(ACAO + 'mite/mite_blue.png', 2, 16),
    'acaro_vermelho':       tira(ACAO + 'mite/mite_red.png', 2, 16),
    'acaro_prata':          tira(ACAO + 'mite/mite_silver.png', 2, 16),
    'acaro_amarelo':        tira(ACAO + 'mite/mite_yellow.png', 2, 16),
    # ondas 21-29 — os mortos do outro lado
    'lich6':                folha8(LICH + 'lich.png', 0),
    'lich6_rubro':          folha8(LICH + 'lich.png', 2),
    'lich6_dourado':        folha8(LICH + 'lich.png', 3),
    'cavaleiro_caido':      tingir(folha8(LICH + 'paladin.png', 1), VIOLETA, 0.30, brilho=0.7, cor=0.5),
    'cavaleiro_caido_b':    tingir(folha8(LICH + 'paladin.png', 5), VIOLETA, 0.30, brilho=0.7, cor=0.5),
    'esqueleto6':           folha8(LICH + 'skeletonarmy.png', 0),
    'esqueleto6_lanca':     folha8(LICH + 'skeletonarmy.png', 2),
    'esqueleto6_escudo':    folha8(LICH + 'skeletonarmy.png', 4),
    'fenix':                folha1('tf_monsters_assetpack/TimeFantasy_Monsters/2x/$monster_phoenix.png'),
    'fenix_do_caos':        tingir(folha1('tf_monsters_assetpack/TimeFantasy_Monsters/2x/$monster_phoenix.png'), VIOLETA, 0.55, cor=0.4),
}

def gravar():
    os.makedirs(OUT, exist_ok=True)
    finais = {}
    for tipo, ciclo in INIMIGOS.items():
        caixas = [q.getbbox() for q in ciclo if q.getbbox()]
        x0 = min(b[0] for b in caixas); y0 = min(b[1] for b in caixas)
        x1 = max(b[2] for b in caixas); y1 = max(b[3] for b in caixas)
        fs = []
        for i, q in enumerate(ciclo, 1):
            e = 1 if tipo.startswith('fenix') else ESC   # fenix vem da folha 2x
            q = q.crop((x0, y0, x1, y1)).resize(((x1 - x0) * e, (y1 - y0) * e), Image.NEAREST)
            q.save(OUT + f'{tipo}_{i}.png'); fs.append(q)
        finais[tipo] = fs
        print(f'{tipo:22s} {fs[0].width}x{fs[0].height}')
    return finais

def previa(finais, saida):
    """GIF com todos andando, em grade, sobre o chao do Ato VI."""
    fonte = ImageFont.load_default()
    cols, cw, chh = 8, 150, 170
    linhas = (len(finais) + cols - 1) // cols
    chao = Image.open('public/sprites/arena/bg_act6_field.png').convert('RGBA').crop((0, 300, cols * cw, 300 + linhas * chh))
    quadros = []
    for f in range(8):
        c = chao.copy(); d = ImageDraw.Draw(c)
        for i, (tipo, fs) in enumerate(finais.items()):
            gx, gy = (i % cols) * cw, (i // cols) * chh
            q = fs[f % 4]
            dx = gx + (cw - q.width) // 2 - (f * 3)  # anda pra esquerda devagar
            c.alpha_composite(q, (max(gx, dx), gy + chh - 30 - q.height))
            d.text((gx + 4, gy + chh - 16), tipo, fill=(255, 240, 210), font=fonte)
        quadros.append(c.convert('RGB'))
    quadros[0].save(saida, save_all=True, append_images=quadros[1:], duration=160, loop=0)
    print('previa:', saida)

if __name__ == '__main__':
    fs = gravar()
    if len(sys.argv) > 1 and sys.argv[1] == 'previa':
        previa(fs, sys.argv[2] if len(sys.argv) > 2 else 'release-demo/previa-ato6-inimigos.gif')
