# ══════════════════════════════════════════════════════════════════════
# cenario-menu.py — cena de fundo do MENU PRINCIPAL em pixel:
#   ceu noturno em faixas, estrelas, lua e serra roxa ao fundo; muralha
#   montada peca por peca com tiles 48px de assets-pixel/tilesets/tileD_castle.png
#   (ameias, 4 torres redondas, janelas acesas em ambar, portao com brilho).
#   Tudo escurecido e dessaturado pra nao brigar com os paineis do menu.
# Tambem exporta o braseiro animado (assets-pixel/tilesets/!$torch.png,
# coluna 1, 4 quadros de 48x60) como TIRA horizontal pra animar por CSS.
#
# Saida: public/ui/pixel/menu_bg.png (1600x900, 2x)  e  public/ui/pixel/brazier.png
# Uso:   python scripts/cenario-menu.py
# ══════════════════════════════════════════════════════════════════════
import random
from PIL import Image, ImageDraw

CASTLE = 'assets-pixel/tilesets/tileD_castle.png'
TORCH  = 'assets-pixel/tilesets/!$torch.png'
OUT    = 'public/ui/pixel/'
W, H   = 800, 450          # nativo; salvo em 2x
random.seed(3)

def hexrgb(h): h = h.lstrip('#'); return tuple(int(h[i:i+2], 16) for i in (0, 2, 4)) + (255,)

from PIL import ImageDraw
T=48; W,H=800,450
C=Image.open('assets-pixel/tilesets/tileD_castle.png').convert('RGBA')
def t(c,r,w=1,h=1): return C.crop((c*T,r*T,(c+w)*T,(r+h)*T))
def hx(h): h=h.lstrip('#'); return tuple(int(h[i:i+2],16) for i in (0,2,4))+(255,)
im=Image.new('RGBA',(W,H)); px=im.load()
F=['#06050b','#08070e','#0b0912','#0f0b17','#140e1c','#1a1121','#211424']
for y in range(H):
  c=hx(F[min(len(F)-1,y*len(F)//int(H*0.8))])
  for x in range(W): px[x,y]=c
for _ in range(240):
  x,y=random.randint(0,W-1),random.randint(0,int(H*0.5)); c=hx(random.choice(['#d8d2c4','#a89e8c','#6a6258'])); px[x,y]=c
# lua
d=ImageDraw.Draw(im); mx,my=640,70
d.ellipse([mx-22,my-22,mx+22,my+22],fill=hx('#cfc6ae')); d.ellipse([mx-12,my-26,mx+30,my+16],fill=hx(F[1]))
# montanhas distantes (2 camadas)
for cor,base,amp,seed in (('#1a1224',250,90,1),('#221830',285,60,2)):
  random.seed(seed); y=base
  for x in range(0,W,4):
    y=max(base-amp,min(base,y+random.choice([-4,-4,0,4,4,8]) ))
    d.rectangle([x,y,x+3,H],fill=hx(cor))
# muralha
chao=H-10; topo=chao-3*T
def acesa(tl,lim=48):
  tl=tl.copy(); q=tl.load()
  for yy in range(min(lim,tl.height)):
    for xx in range(tl.width):
      if q[xx,yy][:3]==(53,64,72): q[xx,yy]=(255,1,1,255)
  return tl
seg={'liso':[t(6,8),t(2,5),t(2,6)],'janela':[t(6,8),acesa(t(2,9)),acesa(t(2,10),30)],'grade':[t(6,8),t(3,9),t(3,10)]}
padrao=['liso','janela','janela','liso','grade','liso','janela','liso']
x=0;i=0
while x<W:
  for r,tile in enumerate(seg[padrao[i%len(padrao)]]): im.alpha_composite(tile,(x,topo+r*T))
  x+=T;i+=1
# ameias em cima
for x in range(0,W,24):
  d.rectangle([x+4,topo-12,x+16,topo],fill=hx('#8b8d7c')); d.rectangle([x+4,topo-12,x+16,topo-11],fill=hx('#b3b5a2'))
  d.rectangle([x+4,topo-12,x+4,topo],fill=hx('#3a3f45')); d.rectangle([x+16,topo-12,x+16,topo],fill=hx('#3a3f45'))
# torres
torre=t(0,3,1,5)
# a cabeca da torre em (0,3) vem com um quadrado de pedra atras; troca as 36 linhas de cima
# pela cabeca solta do tile (1,0), que tem fundo transparente (alinhada: dx 6, dy 12)
q=torre.load()
for y in range(36):
  for x in range(T): q[x,y]=(0,0,0,0)
torre.alpha_composite(C.crop((T,12,T+42,48)),(6,0))
for tx in (40,224,528,712):
  im.alpha_composite(torre,(tx,topo-40))   # torre baixa: so o topo passa das ameias
# portao
portao=t(5,9,3,3)
im.alpha_composite(portao,(W//2-72,chao-portao.height+24))
# escurece e dessatura, janelas acesas
p=im.load()
for y in range(H):
  for x in range(W):
    r,g,b,a=p[x,y]
    if y<topo-14 and (r,g,b)==hx(F[min(len(F)-1,y*len(F)//int(H*0.8))])[:3]: continue
    if (r,g,b)==(255,1,1):
      k=(y%96)/96; p[x,y]=hx('#a8662a') if k<0.5 else hx('#7a4018'); continue
    if (r,g,b,a) in (hx('#1a1224'),hx('#221830')): continue
    if y>=150:
      if (r,g,b)==(0x33,0x3a,0x42) or (r,g,b)==(0x2f,0x36,0x3f):  # vazio da janela
        pass
      l=r*.3+g*.59+b*.11; r,g,b=r*.4+l*.6,g*.4+l*.6,b*.4+l*.6; f=0.45
      p[x,y]=(int(r*f),int(g*f*.95),int(b*f*1.1),255)
d=ImageDraw.Draw(im)
for k,c in enumerate(['#3a1c10','#2a150d']):
  d.rectangle([W//2-24+k*6,chao-70+k*14,W//2+23-k*6,chao],fill=hx(c))
d.rectangle([0,chao,W,H],fill=hx('#0b090d'))
im.resize((W*2,H*2),Image.NEAREST).save(OUT+'menu_bg.png')

# braseiro: coluna 1 (48..96), 4 linhas de 60 -> tira 4x(48x60), 2x
t = Image.open(TORCH).convert('RGBA')
tira = Image.new('RGBA', (48*4, 60), (0, 0, 0, 0))
for i in range(4):
    tira.paste(t.crop((48, i*60, 96, (i+1)*60)), (i*48, 0))
tira.resize((48*4*2, 120), Image.NEAREST).save(OUT + 'brazier.png')
print('ok: menu_bg.png', (W*2, H*2), '+ brazier.png 4 quadros')
