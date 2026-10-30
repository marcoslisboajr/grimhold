"""Versões verticais (1080x1920, Shorts/TikTok/Reels) dos clipes de post.

Uso: python scripts/verticais.py
Lê release-demo/posts/wishlist/*.mp4 e grava em release-demo/posts/verticais/:
  <clipe>-meio.mp4  jogo inteiro no meio, fundo desfocado, gancho em cima, chamada embaixo
  <clipe>-zoom.mp4  recorte 9:16 na ação (pixel art ampliado sem borrar)
Textos ficam longe das bordas de baixo/direita (botões do TikTok).
"""
import os, subprocess, imageio_ffmpeg
from fontTools.ttLib import TTFont
from PIL import Image, ImageDraw, ImageFont

RAIZ = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
ORIG = os.path.join(RAIZ, 'release-demo', 'posts', 'wishlist')
SAIDA = os.path.join(RAIZ, 'release-demo', 'posts', 'verticais')
FFMPEG = imageio_ffmpeg.get_ffmpeg_exe()
W, H = 1080, 1920

# clipe: (gancho, x do centro do recorte zoom em 0..1 ou None = sem zoom)
CLIPES = {
    'wasd':     ('WAIT... YOU CAN WALK\nIN THIS TOWER DEFENSE?', None),  # a ação fica espalhada: recorte perde a Yue ou os inimigos
    'arrastar': ('DRAG YOUR HEROES.\nSAVE THE WALL.', None),
    'chefe':    ('WAVE 10.\nTHE GRIM REAPER ARRIVES.', 0.9),               # o Ceifador entra pela direita
    'meteoro':  ('ONE SPELL.\nWHOLE SCREEN GONE.', None),
}
# cenas longas (20-40 s) de release-demo/posts/shorts (node scripts/clipes-posts.mjs shorts)
SHORTS = {
    's-guardiao': ('NO TOWERS.\nJUST HER AND THE HORDE.', None),
    's-horda':    ('WAVE 24.\nEVERYTHING IS COMING.', None),
    's-chefe':    ('CAN MY SQUAD KILL\nTHE GRIM REAPER?', None),
    's-derrota':  ('I WAS SO CLOSE...', None),
    's-time':     ('BUILDING MY SQUAD\nFROM ZERO', None),
    's-5x':       ('THIS IS WHAT\n5X SPEED LOOKS LIKE', None),
    's-atos':     ('ONE WALL.\nFIVE WORLDS.', None),
}
ORIG_S = os.path.join(RAIZ, 'release-demo', 'posts', 'shorts')
CHAMADA = 'WISHLIST GRIMHOLD\nON STEAM'


def fonte():
    ttf = os.path.join(SAIDA, 'jersey10.ttf')
    if not os.path.exists(ttf):  # Jersey 10, a fonte pixel do próprio jogo
        f = TTFont(os.path.join(RAIZ, 'public', 'fonts', 'pixel', 'f-001.woff2'))
        f.flavor = None
        f.save(ttf)
    return ttf


FG_TOPO = 520      # o jogo começa logo abaixo do gancho
FG_MAX_H = 900     # clipes altos (antes/depois) não invadem os textos


def tamanho_fg(src):
    w, h = next(imageio_ffmpeg.read_frames(src))['size']
    fw, fh = W, round(h * W / w)
    if fh > FG_MAX_H:
        fw, fh = round(w * FG_MAX_H / h), FG_MAX_H
    return fw - fw % 2, fh - fh % 2


def camada_texto(caminho, gancho, ttf, y_chamada):
    img = Image.new('RGBA', (W, H), (0, 0, 0, 0))
    d = ImageDraw.Draw(img)
    def bloco(txt, y, tam, cor):
        f = ImageFont.truetype(ttf, tam)
        d.multiline_text((W // 2 - 40, y), txt, font=f, fill=cor, anchor='ma', align='center',
                         stroke_width=max(4, tam // 14), stroke_fill=(10, 6, 16), spacing=tam // 6)
    bloco(gancho, 230, 104, (255, 244, 214))
    bloco(CHAMADA, y_chamada, 92, (255, 196, 70))
    img.save(caminho)


def rodar(args):
    subprocess.run([FFMPEG, '-y', '-loglevel', 'error', *args], check=True)


def main():
    os.makedirs(SAIDA, exist_ok=True)
    ttf = fonte()
    todos = [(ORIG, n, v) for n, v in CLIPES.items()] + [(ORIG_S, n, v) for n, v in SHORTS.items()]
    for pasta, nome, (gancho, zoom_x) in todos:
        src = os.path.join(pasta, nome + '.mp4')
        if not os.path.exists(src):
            print('falta', src); continue
        fw, fh = tamanho_fg(src)
        txt = os.path.join(SAIDA, f'_{nome}-texto.png')
        camada_texto(txt, gancho, ttf, FG_TOPO + fh + 60)
        saida_cod = ['-r', '60', '-c:v', 'libx264', '-crf', '16', '-preset', 'slow',
                     '-pix_fmt', 'yuv420p', '-movflags', '+faststart', '-an']

        # jogo inteiro no meio, fundo = o próprio clipe ampliado, borrado e escurecido
        rodar(['-i', src, '-i', txt, '-filter_complex',
               f'[0:v]scale={W}:{H}:force_original_aspect_ratio=increase,crop={W}:{H},'
               f'boxblur=30:2,eq=brightness=-0.25[bg];'
               f'[0:v]scale={fw}:{fh}:flags=neighbor[fg];'
               f'[bg][fg]overlay=(W-w)/2:{FG_TOPO}[v];[v][1:v]overlay=0:0',
               *saida_cod, os.path.join(SAIDA, f'{nome}-meio.mp4')])

        if zoom_x is not None:  # recorte 9:16 da altura toda, ampliado sem borrar
            camada_texto(txt, gancho, ttf, 1400)
            rodar(['-i', src, '-i', txt, '-filter_complex',
                   f"[0:v]crop=ih*9/16:ih:(iw-ih*9/16)*{zoom_x}:0,"
                   f'scale={W}:{H}:flags=neighbor[v];[v][1:v]overlay=0:0',
                   *saida_cod, os.path.join(SAIDA, f'{nome}-zoom.mp4')])
        os.remove(txt)
        print('ok', nome)


if __name__ == '__main__':
    main()
