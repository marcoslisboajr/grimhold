# ══════════════════════════════════════════════════════════════════════
# icones-cartas-alma.py — icones das cartas "Mão do Morto" do Bobo (dmh-*),
# as cartas roubadas da alma dos monstros.
#
# Cada icone = icone pixel do efeito (mesma folha Time Fantasy Icons de
# scripts/icones-pixel.py, ja exportado em public/ui/pixel/icons/) com um
# contorno roxo-Bobo e o fantasminha (ghost) tingido de roxo no canto
# inferior direito = "alma roubada". So assets do repo, NEAREST, 64 px.
#
# Saida: public/ui/pixel/icons/alma_<id>.png  (+ previa opcional)
# Uso:   python scripts/icones-cartas-alma.py [--previa]
# ══════════════════════════════════════════════════════════════════════
import json, os, sys
from PIL import Image, ImageDraw, ImageFont

ICONS = 'public/ui/pixel/icons/'
# folha Time Fantasy (mesma de icones-pixel.py); assets-pixel/ nao vai pro git,
# entao em worktree passe o caminho: SRC=<repo>/assets-pixel/... python ...
SRC = os.environ.get('SRC', 'assets-pixel/icones/icons_8.13.20/fullcolor/icons_full_32.png')
FANTASMA = (4, 12)   # fantasminha pequeno (coluna, linha) na folha de 32 px
ROXO = (200, 90, 255)        # contorno/tinta (fuchsia/violeta do Bobo)
ROXO_ESC = (60, 10, 90)      # contorno escuro do fantasma

# id da carta -> icone base (o que a carta faz)
CARTAS = {
    'dmh-goblin-spd': 'boots',        # velocidade de ataque
    'dmh-orc-dmg': 'axe',             # dano
    'dmh-undead-hp': 'skull_bone',    # vida (morto-vivo)
    'dmh-lich-range': 'wand',         # alcance (lich)
    'dmh-dragon': 'flame',            # dano (dragão)
    'dmh-elf-spd': 'bow',             # velocidade + dano (elfo)
    'dmh-dwarf-hp': 'shield_iron',    # vida (anão)
    'dmh-demon': 'sword',             # dano (demônio) — 'sword' e a espada em chamas
    'dmh-vampire': 'blood',           # roubo de vida
    'dmh-brute': 'gauntlet',          # vida + dano (bruto)
    'dmh-gen-dmg': 'sword_fire',      # espada lisa
    'dmh-gen-spd': 'wind',
    'dmh-gen-hp': 'heart',
}


def contorno(img, cor, alvo_alpha=128):
    """Contorno de 2 px (1 px da arte 32) em volta dos pixels opacos."""
    w, h = img.size
    src = img.load()
    out = Image.new('RGBA', (w, h), (0, 0, 0, 0))
    o = out.load()
    for y in range(h):
        for x in range(w):
            if src[x, y][3] >= alvo_alpha:
                continue
            for dx, dy in ((-2, 0), (2, 0), (0, -2), (0, 2)):
                nx, ny = x + dx, y + dy
                if 0 <= nx < w and 0 <= ny < h and src[nx, ny][3] >= alvo_alpha:
                    o[x, y] = cor + (255,)
                    break
    out.alpha_composite(img)
    return out


def fantasma():
    c, r = FANTASMA
    g = Image.open(SRC).convert('RGBA').crop((c * 32, r * 32, c * 32 + 32, r * 32 + 32))
    g = g.crop(g.getbbox())
    px = g.load()
    for y in range(g.size[1]):
        for x in range(g.size[0]):
            rr, gg, b, a = px[x, y]
            if a:  # tinge de roxo mantendo a luminosidade
                lum = (rr + gg + b) / 765
                px[x, y] = (min(255, int(ROXO[0] * lum * 1.25)), min(255, int(ROXO[1] * lum * 1.1)),
                            min(255, int(ROXO[2] * lum * 1.15)), a)
    # tamanho nativo (1x): fica ~metade do icone, como selo no canto
    pad = Image.new('RGBA', (g.size[0] + 4, g.size[1] + 4), (0, 0, 0, 0))
    pad.alpha_composite(g, (2, 2))
    return contorno(pad, ROXO_ESC)


def compor(base_nome, ghost):
    base = Image.open(ICONS + base_nome + '.png').convert('RGBA')
    icon = contorno(base, ROXO)
    icon.alpha_composite(ghost, (64 - ghost.size[0], 64 - ghost.size[1]))
    return icon


def previa(icons):
    pt = json.load(open('i18n/locales/pt-BR.json', encoding='utf-8'))
    def tr(k):
        cur = pt
        for p in k.split('.'):
            cur = cur.get(p, {}) if isinstance(cur, dict) else {}
        return cur if isinstance(cur, str) else k
    fonte = ImageFont.truetype('C:/Windows/Fonts/arialbd.ttf', 13)
    fpeq = ImageFont.truetype('C:/Windows/Fonts/arial.ttf', 11)
    itens = [(pt.get(f'ui.dmh.{cid}.title', cid), icons[cid], (170, 60, 230)) for cid in CARTAS]
    comp = [('dmg-boost (normal)', 'sword_fire'), ('soul-link (normal)', 'chain'), ('jester-roulette (normal)', 'dice')]
    itens += [(n, Image.open(ICONS + i + '.png').convert('RGBA'), (90, 90, 90)) for n, i in comp]
    CW, CH, COLS = 180, 190, 6
    rows = (len(itens) + COLS - 1) // COLS
    sheet = Image.new('RGB', (CW * COLS + 20, CH * rows + 50), (18, 14, 24))
    d = ImageDraw.Draw(sheet)
    d.text((10, 12), 'Previa: cartas "Mao do Morto" (alma roubada, Bobo) — ultimas 3 = cartas normais p/ comparar', font=fonte, fill=(230, 220, 240))
    for i, (titulo, ic, borda) in enumerate(itens):
        x, y = 10 + (i % COLS) * CW, 40 + (i // COLS) * CH
        d.rectangle([x + 4, y + 4, x + CW - 8, y + CH - 8], fill=(24, 22, 34), outline=borda, width=4)
        d.rectangle([x + 20, y + 16, x + CW - 24, y + 126], fill=(0, 0, 0), outline=(70, 70, 80))
        big = ic.resize((96, 96), Image.NEAREST)
        sheet.paste(big, (x + (CW - 96) // 2 - 2, y + 23), big)
        palavras, linha, linhas = titulo.split(), '', []
        for p in palavras:
            t = (linha + ' ' + p).strip()
            if d.textlength(t, font=fpeq) > CW - 30:
                linhas.append(linha); linha = p
            else:
                linha = t
        linhas.append(linha)
        for j, l in enumerate(linhas[:3]):
            d.text((x + 14, y + 134 + j * 14), l, font=fpeq, fill=(235, 225, 245))
    os.makedirs('release-demo', exist_ok=True)
    sheet.save('release-demo/previa-cartas-alma.png')
    print('previa: release-demo/previa-cartas-alma.png')


if __name__ == '__main__':
    g = fantasma()
    feitos = {}
    for cid, base in CARTAS.items():
        ic = compor(base, g)
        ic.save(f'{ICONS}alma_{cid[4:].replace("-", "_")}.png')
        feitos[cid] = ic
    print(len(feitos), 'icones gerados')
    if '--previa' in sys.argv:
        previa(feitos)
