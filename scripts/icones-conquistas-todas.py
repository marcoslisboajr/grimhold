"""Refaz em pixel art os 75 icones de conquistas da Steam que ainda eram do visual antigo (vetor).
Mesmo estilo de scripts/icones-conquistas.py (atos VI-X): 256x256, moldura dourada, versao
desbloqueada (cor) e bloqueada (cinza escuro).

- boss_*        : sprite do chefe (public/sprites/enemies) sobre pedra tingida de vermelho
- conquest_*    : sprite do heroi (public/sprites/allies) sobre pedra tingida de dourado
- actN_complete : chao da arena do ato + icone pixel da conquista
- resto         : icone pixel do painel de conquistas (public/ui/pixel/icons, via pixelIcons.ts)
                  + pontinhos de nivel (wave_5 = 1 ... wave_50 = 5), como nos icones antigos
Uso: python scripts/icones-conquistas-todas.py
Saida: release-demo/steam-conquistas/todas/<api_name>.png e <api_name>_locked.png + preview.png
Somente sprites do jogo, escala NEAREST inteira, sem IA."""
import re
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
SPR = RAIZ / "public" / "sprites"
ICO = RAIZ / "public" / "ui" / "pixel" / "icons"
OUT = RAIZ / "release-demo" / "steam-conquistas" / "todas"
S = 256
BORDA = (24, 18, 14)
OURO = (214, 168, 74)
OURO_ESC = (120, 84, 34)
TINTA = {"boss": (110, 28, 24), "secret": (70, 40, 105), "conquest": (105, 80, 30), "progress": (40, 44, 52)}

# niveis: a posicao dentro do grupo vira o numero de pontinhos
GRUPOS = [
    ["wave_5", "wave_10", "wave_25", "wave_40", "wave_50"],
    ["kills_50", "kills_100", "kills_500", "kills_2000", "kills_5000"],
    ["gold_500", "gold_1000", "gold_2500"],
    ["score_5000", "score_20000"],
    ["levelup_5", "levelup_10"],
    ["shop_buy_5", "shop_buy_15"],
    ["endless_60", "endless_80", "endless_120"],
]
PIPS = {i: n + 1 for g in GRUPOS for n, i in enumerate(g)}

HEROI = {"malachar_human": "Malachar"}
CHEFE = {"half_brothers": ["half_brother_cyclops", "half_brother_ogre"]}


def conquistas():
    """(id, icone pixel, categoria) de components/data/achievements.ts + pixelIcons.ts."""
    s = (RAIZ / "components" / "data" / "achievements.ts").read_text(encoding="utf-8")
    pm = (RAIZ / "components" / "ui" / "pixelIcons.ts").read_text(encoding="utf-8")
    out = []
    for i, emo, cat in re.findall(r"\{ id: '([a-z0-9_]+)'.*?icon:\s*'([^']+)',\s*category:\s*'(\w+)'", s):
        m = re.search(r"'%s'\s*:\s*'(\w+)'" % re.escape(emo), pm) or re.search(r"'%s'\s*:\s*'(\w+)'" % re.escape(emo.replace("️", "")), pm)
        out.append((i, m.group(1) if m else None, cat))
    return out


def ampliar(im, alvo, kmax=2):
    """recorta o conteudo e amplia/reduz por fator inteiro ate caber em alvo."""
    im = im.crop(im.getchannel("A").point(lambda a: 255 if a > 96 else 0).getbbox())   # ignora pixels quase transparentes (aura, sombra)
    m = max(im.size)
    if m > alvo:
        d = -(-m // alvo)
        return im.resize((max(1, im.width // d), max(1, im.height // d)), Image.NEAREST)
    k = max(1, min(kmax, alvo // m))   # no maximo 2x: mesma densidade de pixel dos sprites dos atos VI-X
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def pedra(cor):
    """chao de pedra do patio do Ato I, escurecido e tingido pela categoria."""
    bg = Image.open(SPR / "arena" / "bg_act1_courtyard.png").convert("RGB")
    c = 128
    x, y = (bg.width - c) // 2, (bg.height - c) // 2
    bg = bg.crop((x, y, x + c, y + c)).resize((S, S), Image.NEAREST)
    g = ImageOps.grayscale(bg).point(lambda v: int(v * 0.45))
    return Image.blend(Image.merge("RGB", (g, g, g)), Image.new("RGB", (S, S), cor), 0.35)


def chao_ato(ato):
    """mesmo fundo dos atos VI-X: recorte 128x128 do campo do ato, 2x, escurecido 35%."""
    bg = Image.open(SPR / "arena" / f"bg_act{ato}_field.png").convert("RGB")
    c = 128
    x, y = (bg.width - c) // 2, (bg.height - c) // 2
    bg = bg.crop((x, y, x + c, y + c)).resize((S, S), Image.NEAREST)
    return Image.blend(bg, Image.new("RGB", (S, S), (0, 0, 0)), 0.35)


# arena de fundo por categoria (as conquistas de ato usam a arena do proprio ato)
ARENA = {"progress": 1, "boss": 5, "conquest": 2, "secret": 4}


def colar(base, fig, dy=0):
    sombra = Image.new("RGBA", fig.size, (0, 0, 0, 0))
    sombra.paste((0, 0, 0, 150), mask=fig.split()[3])
    x, y = (S - fig.width) // 2, (S - fig.height) // 2 + dy
    rgba = base.convert("RGBA")
    rgba.alpha_composite(sombra, (x + 4, y + 4))
    rgba.alpha_composite(fig, (x, y))
    return rgba.convert("RGB")


def moldura(img):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, S - 1, S - 1), outline=BORDA, width=8)
    d.rectangle((8, 8, S - 9, S - 9), outline=OURO, width=4)
    d.rectangle((12, 12, S - 13, S - 13), outline=OURO_ESC, width=4)
    for x, y in ((0, 0), (S - 16, 0), (0, S - 16), (S - 16, S - 16)):
        d.rectangle((x, y, x + 15, y + 15), fill=OURO)
        d.rectangle((x + 4, y + 4, x + 11, y + 11), fill=BORDA)


def pontinhos(img, n):
    d = ImageDraw.Draw(img)
    t, gap = 16, 10
    w = n * t + (n - 1) * gap
    x0, y = (S - w) // 2, S - 50
    for k in range(n):
        x = x0 + k * (t + gap)
        d.rectangle((x - 2, y - 2, x + t + 1, y + t + 1), fill=BORDA)
        d.rectangle((x, y, x + t - 1, y + t - 1), fill=OURO)
        d.rectangle((x, y, x + t - 1, y + 3), fill=(244, 214, 130))


def sprite_inimigo(nome):
    return Image.open(SPR / "enemies" / f"{nome}_1.png").convert("RGBA")


def gerar(i, ico, cat):
    if i.startswith("boss_"):
        nome = i[5:]
        if nome in CHEFE:
            a, b = (ampliar(sprite_inimigo(n), 120) for n in CHEFE[nome])
            fig = Image.new("RGBA", (a.width + b.width + 8, max(a.height, b.height)), (0, 0, 0, 0))
            fig.alpha_composite(a, (0, fig.height - a.height)); fig.alpha_composite(b, (a.width + 8, fig.height - b.height))
        else:
            fig = ampliar(sprite_inimigo(nome), 228)
        img = colar(chao_ato(ARENA["boss"]), fig)
    elif i.startswith("conquest_"):
        nome = i[9:]
        fig = ampliar(Image.open(SPR / "allies" / f"{HEROI.get(nome, nome)}.png").convert("RGBA"), 228)
        img = colar(chao_ato(ARENA["conquest"]), fig)
    else:
        m = re.match(r"act(\d+)_complete$", i)
        base = chao_ato(int(m.group(1)) if m else ARENA.get(cat, 1))
        fig = ampliar(Image.open(ICO / f"{ico}.png").convert("RGBA"), 120, kmax=4)
        img = colar(base, fig, dy=-14 if i in PIPS else 0)
        if i in PIPS:
            pontinhos(img, PIPS[i])
    moldura(img)
    return img


def travado(img):
    g = ImageOps.grayscale(img).point(lambda v: int(v * 0.55))
    return Image.merge("RGB", (g, g, g))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    lista = [c for c in conquistas() if not re.match(r"act(6|7|8|9|10)_complete$", c[0])]   # VI-X ja tem icone pixel (icones-conquistas.py)
    cols = 10
    linhas = -(-len(lista) // cols)
    pv = 128
    folha = Image.new("RGB", (cols * (pv + 8) + 8, linhas * (pv + 8) + 8), (40, 40, 44))
    for n, (i, ico, cat) in enumerate(lista):
        a = gerar(i, ico, cat)
        a.save(OUT / f"{i}.png")
        travado(a).save(OUT / f"{i}_locked.png")
        folha.paste(a.resize((pv, pv), Image.NEAREST), (8 + (n % cols) * (pv + 8), 8 + (n // cols) * (pv + 8)))
    folha.save(OUT / "preview.png")
    print("ok ->", OUT, len(lista), "conquistas")


if __name__ == "__main__":
    main()
