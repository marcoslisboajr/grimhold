"""Gera os icones de conquistas da Steam (atos VI-X), 256x256, desbloqueado e bloqueado.
Uso: python scripts/icones-conquistas.py
Saida: release-demo/steam-conquistas/actN_complete[_locked].png + preview.png
Somente sprites do jogo (public/sprites), escala NEAREST inteira, sem IA."""
from pathlib import Path
from PIL import Image, ImageDraw, ImageOps

RAIZ = Path(__file__).resolve().parent.parent
SPR = RAIZ / "public" / "sprites"
OUT = RAIZ / "release-demo" / "steam-conquistas"
S = 256
ATOS = {
    6: "fallen_seraph_1",
    7: "ossoth_1",
    8: "kraken_1",
    9: "quimera_1",
    10: "fome_coracao_1",
}
BORDA = (24, 18, 14)
OURO = (214, 168, 74)
OURO_ESC = (120, 84, 34)


def fundo(ato):
    bg = Image.open(SPR / "arena" / f"bg_act{ato}_field.png").convert("RGB")
    w, h = bg.size
    c = 128  # recorte central 128x128 ampliado 2x (inteiro)
    x, y = (w - c) // 2, (h - c) // 2
    return bg.crop((x, y, x + c, y + c)).resize((S, S), Image.NEAREST)


def chefe(nome):
    im = Image.open(SPR / "enemies" / f"{nome}.png").convert("RGBA")
    im = im.crop(im.getbbox())
    alvo = 176
    m = max(im.size)
    if m > alvo:  # reduz por divisor inteiro
        d = -(-m // alvo)
        im = im.resize((max(1, im.width // d), max(1, im.height // d)), Image.NEAREST)
    k = max(1, alvo // max(im.size))  # amplia por fator inteiro
    return im.resize((im.width * k, im.height * k), Image.NEAREST)


def moldura(img):
    d = ImageDraw.Draw(img)
    d.rectangle((0, 0, S - 1, S - 1), outline=BORDA, width=8)
    d.rectangle((8, 8, S - 9, S - 9), outline=OURO, width=4)
    d.rectangle((12, 12, S - 13, S - 13), outline=OURO_ESC, width=4)
    for x, y in ((0, 0), (S - 16, 0), (0, S - 16), (S - 16, S - 16)):
        d.rectangle((x, y, x + 15, y + 15), fill=OURO)
        d.rectangle((x + 4, y + 4, x + 11, y + 11), fill=BORDA)


def gerar(ato):
    img = Image.blend(fundo(ato), Image.new("RGB", (S, S), (0, 0, 0)), 0.35)
    b = chefe(ATOS[ato])
    sombra = Image.new("RGBA", b.size, (0, 0, 0, 0))
    sombra.paste((0, 0, 0, 150), mask=b.split()[3])
    x, y = (S - b.width) // 2, (S - b.height) // 2
    rgba = img.convert("RGBA")
    rgba.alpha_composite(sombra, (x + 4, y + 4))
    rgba.alpha_composite(b, (x, y))
    img = rgba.convert("RGB")
    moldura(img)
    return img


def travado(img):
    g = ImageOps.grayscale(img).point(lambda v: int(v * 0.55))
    return Image.merge("RGB", (g, g, g))


def main():
    OUT.mkdir(parents=True, exist_ok=True)
    folha = Image.new("RGB", (5 * (S + 16) + 16, 2 * (S + 16) + 16), (40, 40, 44))
    for i, ato in enumerate(ATOS):
        a = gerar(ato)
        b = travado(a)
        a.save(OUT / f"act{ato}_complete.png")
        b.save(OUT / f"act{ato}_complete_locked.png")
        folha.paste(a, (16 + i * (S + 16), 16))
        folha.paste(b, (16 + i * (S + 16), 16 + S + 16))
    folha.save(OUT / "preview.png")
    print("ok ->", OUT)


if __name__ == "__main__":
    main()
