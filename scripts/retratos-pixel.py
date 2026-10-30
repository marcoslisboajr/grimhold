# ══════════════════════════════════════════════════════════════════════
# retratos-pixel.py — retratos de avatar (perfil) a partir dos sprites dos
# herois (public/sprites/allies/<id>.png): recorta cabeca + ombros num
# quadrado, sobre fundo escuro, e salva em 2x (NEAREST) em
# public/ui/pixel/avatars/<id>.png. Usado por AvatarFaceSprite.
#
# Avatares do Passe de Batalha (bp_s1_*) nao tem sprite: usam um icone
# pixel (public/ui/pixel/icons/) centralizado no mesmo quadrado.
#
# Uso:  python scripts/retratos-pixel.py
# ══════════════════════════════════════════════════════════════════════
import os
from PIL import Image

SRC  = 'public/sprites/allies/'
ICOS = 'public/ui/pixel/icons/'
OUT  = 'public/ui/pixel/avatars/'
LADO = 40          # quadrado nativo do retrato (px)
FUNDO = (11, 9, 6, 255)

# id do avatar -> arquivo do sprite (mesmas excecoes do CharacterSprite)
HEROIS = {
    'mage': 'mage', 'archer': 'archer', 'warlock': 'warlock', 'druid': 'druid', 'necromancer': 'necromancer',
    'bard': 'bard', 'jester': 'jester', 'cleric': 'cleric', 'priest': 'hyo', 'paladin': 'paladin',
    'runesmith': 'runesmith', 'sylvanite': 'sylvanite', 'dreadlord': 'dreadlord', 'vex': 'vex',
    'zylvara': 'zylvara', 'morrigan': 'morrigan', 'ixara': 'ixara', 'berserker': 'berserker',
    'frost_warden': 'frost_warden', 'inquisitor': 'inquisitor', 'malachar_human': 'Malachar',
    'yue': 'yue', 'billy': 'billy',
}
PASSE = { 'bp_s1_crest': 'banner', 'bp_s1_badge': 'star_gold', 'bp_s1_frame': 'shield_gold',
          'bp_s1_gold': 'crown', 'bp_s1_gold_frame': 'trophy' }

os.makedirs(OUT, exist_ok=True)

def retrato(sprite):
    bb = sprite.getbbox()                     # caixa do que nao e transparente
    x0, y0, x1, y1 = bb
    w = x1 - x0
    # cabeca + ombros: quadrado de lado ~ largura do corpo, encostado no topo
    lado = max(w, int((y1 - y0) * 0.45))
    cx = (x0 + x1) // 2
    caixa = (cx - lado // 2, y0 - 2, cx - lado // 2 + lado, y0 - 2 + lado)
    rec = sprite.crop(caixa)
    rec = rec.resize((LADO, LADO), Image.NEAREST)
    fundo = Image.new('RGBA', (LADO, LADO), FUNDO)
    fundo.paste(rec, (0, 0), rec)
    return fundo

n = 0
for aid, arq in HEROIS.items():
    im = Image.open(SRC + arq + '.png').convert('RGBA')
    retrato(im).resize((LADO * 2, LADO * 2), Image.NEAREST).save(OUT + aid + '.png'); n += 1
for aid, ico in PASSE.items():
    ic = Image.open(ICOS + ico + '.png').convert('RGBA').resize((32, 32), Image.NEAREST)
    fundo = Image.new('RGBA', (LADO, LADO), FUNDO)
    fundo.paste(ic, ((LADO - 32) // 2, (LADO - 32) // 2), ic)
    fundo.resize((LADO * 2, LADO * 2), Image.NEAREST).save(OUT + aid + '.png'); n += 1
print('ok:', n, 'retratos em', OUT)
