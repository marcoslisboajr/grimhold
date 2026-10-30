// Camada de efeitos de magia — PIXEL ART. So visual: nada aqui mexe em vida, dano, alvo ou recarga.
//
// Estilo (Marcos, 28/9): nada de vetor liso, gradiente, blur, glow ou fade de opacidade. Tudo e pixel:
//  - folhas de quadros em resolucao nativa (public/sprites/vfx, scripts/vfx-magias.py), desenhadas em
//    ESCALA inteira (ver ESCALA) com image-rendering: pixelated;
//  - quadros em degrau a FPS (10 q/s);
//  - aneis/linhas/manchas de tamanho livre sao RASTERIZADOS na resolucao nativa (raio/ESCALA) com paleta dura
//    (sem alfa parcial) e ampliados 2x em NEAREST; piscam entre 3 quadros.
//
// Uso (uma linha):
//   efeitos.area(x, y, raio, 'sagrado', 450)   circulo pixel no chao com o raio REAL (o que se ve e o que acerta)
//   efeitos.explosao(x, y, 'luz')              folha animada: 'luz' | 'sombra' | 'fogo' | 'gelo'
//   efeitos.brilho(x, y, 'sagrado')            clarao curto sobre uma unidade (folha 'luz'/'sombra' conforme a paleta)
//   efeitos.feixe(x1, y1, x2, y2, 'gelo', 250) raio pixel entre dois pontos
//   efeitos.chao(x, y, raio, 'veneno', 3000)   mancha pontilhada no chao
//   efeitos.tremor(4, 250)                     tremor da tela em degraus de 2px
//
// Relogio: o do jogo (virtualTimeRef), passado por `CamadaEfeitos agora=`. Pausa/loja/2x/5x valem sozinhas.
// Teto EFEITOS_MAX: o mais antigo sai quando estoura.
import React from 'react';

export const EFEITOS_MAX = 80;
// Pixel nativo -> pixel da cena: 2x (pedido do Marcos). Medido em 28/9: os PNGs 68x92 de heroi/inimigo sao
// desenhados em caixas de ~48 px (~0,7x), entao o pixel do efeito sai mais grosso que o do heroi; em 1x o anel
// ficava mais fino que 1 px de tela em janela menor e virava serrilhado "vetorial". Trocar aqui muda tudo.
export const ESCALA = 2;
export const FPS = 10;          // quadros em degrau
const PASSO = 1000 / FPS;

/** Folhas em public/sprites/vfx (tira horizontal, 1x). Numeros impressos por scripts/vfx-magias.py. */
export const VFX_FOLHAS = {
  luz:    { n: 5, w: 32, h: 32 },
  sombra: { n: 5, w: 32, h: 32 },
  fogo:   { n: 8, w: 32, h: 24 },
  gelo:   { n: 8, w: 32, h: 32 },
} as const;
export type FolhaVfx = keyof typeof VFX_FOLHAS;

/** Paletas duras (escuro, base, claro, brilho). 'sagrado' = cores do simple_death_effect (Time Fantasy). */
export const PALETAS = {
  sagrado: ['#8a5a00', '#fbc800', '#fff699', '#ffffff'],
  sombra:  ['#34124f', '#683490', '#b278e6', '#e6cdff'],
  gelo:    ['#1f4f73', '#5fa8d8', '#bfe6ff', '#ffffff'],
  fogo:    ['#7a1f08', '#e0561a', '#ffb02e', '#fff2a0'],
  veneno:  ['#1f4a1a', '#4e9a2a', '#a6e05a', '#e8ffb0'],
  eletrico:['#1a2a6b', '#3b82f6', '#a5f3fc', '#ffffff'],
} as const;
export type Paleta = keyof typeof PALETAS;

type Base = { id: number; inicio: number; dur: number };
export type Efeito = Base & (
  | { tipo: 'area'; x: number; y: number; raio: number; pal: Paleta }
  | { tipo: 'explosao'; x: number; y: number; folha: FolhaVfx; escala: number }
  | { tipo: 'feixe'; x: number; y: number; x2: number; y2: number; pal: Paleta }
  | { tipo: 'raio'; x: number; y: number; x2: number; y2: number; pal: Paleta }
  | { tipo: 'chao'; x: number; y: number; raio: number; pal: Paleta }
  | { tipo: 'tremor'; forca: number }
);

let relogio: () => number = () => (typeof performance !== 'undefined' ? performance.now() : Date.now());
let lista: Efeito[] = [];
let seq = 0;
const travas = new Map<string, number>();

type SemId<T> = T extends unknown ? Omit<T, 'id' | 'inicio'> : never;
function por(e: SemId<Efeito>) {
  const ef = { ...e, id: ++seq, inicio: relogio() } as Efeito;
  lista.push(ef);
  if (lista.length > EFEITOS_MAX) lista.splice(0, lista.length - EFEITOS_MAX);
  return ef;
}

export const efeitos = {
  area: (x: number, y: number, raio: number, pal: Paleta = 'sagrado', duracaoMs = 450) => por({ tipo: 'area', x, y, raio, pal, dur: duracaoMs }),
  /** Duracao padrao = todos os quadros a FPS. Escala inteira (padrao ESCALA). */
  explosao: (x: number, y: number, folha: FolhaVfx, escala: number = ESCALA, duracaoMs?: number) =>
    por({ tipo: 'explosao', x, y, folha, escala: Math.max(1, Math.round(escala)), dur: duracaoMs ?? VFX_FOLHAS[folha].n * PASSO }),
  brilho: (x: number, y: number, pal: Paleta = 'sagrado') =>
    efeitos.explosao(x, y, pal === 'sombra' ? 'sombra' : pal === 'gelo' ? 'gelo' : pal === 'fogo' ? 'fogo' : 'luz'),
  feixe: (x: number, y: number, x2: number, y2: number, pal: Paleta = 'sagrado', duracaoMs = 250) => por({ tipo: 'feixe', x, y, x2, y2, pal, dur: duracaoMs }),
  /** Raio em zigue-zague (estilo Statik): quebra em segmentos que mudam a cada quadro, com galhos curtos. */
  raio: (x: number, y: number, x2: number, y2: number, pal: Paleta = 'eletrico', duracaoMs = 300) => por({ tipo: 'raio', x, y, x2, y2, pal, dur: duracaoMs }),
  chao: (x: number, y: number, raio: number, pal: Paleta = 'veneno', duracaoMs = 3000) => por({ tipo: 'chao', x, y, raio, pal, dur: duracaoMs }),
  tremor: (forca = 4, duracaoMs = 250) => por({ tipo: 'tremor', forca, dur: duracaoMs }),
  /** Explosao no centro de um inimigo (qualquer objeto com position/width/height). */
  sobre: (alvo: { position: { x: number; y: number }; width?: number; height?: number }, folha: FolhaVfx, escala: number = ESCALA) =>
    efeitos.explosao(alvo.position.x + (alvo.width ?? 0) / 2, alvo.position.y + (alvo.height ?? 0) / 2, folha, escala),
  /** Trava por chave no relogio do jogo: true no maximo 1x a cada `ms` (efeito por acerto nao lota a tela a 5x). */
  pode: (chave: string, ms: number) => {
    const t = relogio(), u = travas.get(chave);
    if (u !== undefined && t - u < ms && t >= u) return false;
    travas.set(chave, t);
    if (travas.size > 400) travas.clear();
    return true;
  },
  /** Zera tudo (fim de run / volta ao menu). */
  limpar: () => { lista = []; travas.clear(); },
  /** Efeitos ainda vivos no instante `agora` (tambem descarta os vencidos). */
  vivos: (agora: number) => {
    if (lista.length) lista = lista.filter(e => agora - e.inicio < e.dur && agora >= e.inicio - 1000);
    return lista;
  },
  usarRelogio: (f: () => number) => { relogio = f; },
};

// So no `npm run dev`: scripts/previa-efeitos-todas.mjs usa para a vitrine encenada.
if (import.meta.env?.DEV && typeof window !== 'undefined') (window as any).__efeitos = efeitos;

/** Quadro em degrau (0,1,2,...) desde o inicio do efeito. */
export const quadroEm = (inicio: number, agora: number) => Math.max(0, Math.floor((agora - inicio) / PASSO));

// ── Rasterizacao nativa (canvas 1x, cores duras) + cache de dataURL ─────
const cacheImg = new Map<string, { src: string; w: number; h: number }>();
function rasterizar(chave: string, w: number, h: number, pinta: (put: (x: number, y: number, cor: string) => void) => void) {
  const c = cacheImg.get(chave);
  if (c) return c;
  if (typeof document === 'undefined') return null;
  const cv = document.createElement('canvas');
  cv.width = w; cv.height = h;
  const g = cv.getContext('2d');
  if (!g) return null;
  const dados = g.createImageData(w, h), buf = dados.data;
  pinta((x, y, cor) => {
    if (x < 0 || y < 0 || x >= w || y >= h) return;
    const i = (y * w + x) * 4, n = parseInt(cor.slice(1), 16);
    buf[i] = n >> 16; buf[i + 1] = (n >> 8) & 255; buf[i + 2] = n & 255; buf[i + 3] = 255;   // sempre opaco: sem alfa parcial
  });
  g.putImageData(dados, 0, 0);
  const r = { src: cv.toDataURL(), w, h };
  if (cacheImg.size > 120) cacheImg.delete(cacheImg.keys().next().value as string);
  cacheImg.set(chave, r);
  return r;
}

/** Circulo magico pixel: contorno escuro, anel base, brilho interno, anel interno tracejado que gira
 *  e 8 marcas (cruzes) que piscam; pontilhado esparso no chao. `q` = quadro 0..2. */
function anelPixel(rn: number, pal: Paleta, q: number) {
  const [esc, base, claro, brilho] = PALETAS[pal];
  const lado = rn * 2 + 5, c = rn + 2;
  return rasterizar(`anel|${rn}|${pal}|${q}`, lado, lado, put => {
    const ri = Math.max(2, rn - 4);
    for (let y = 0; y < lado; y++) for (let x = 0; x < lado; x++) {
      const dx = x - c, dy = y - c, d = Math.sqrt(dx * dx + dy * dy);
      const k = Math.round(d);
      if (k === rn + 1) put(x, y, esc);
      else if (k === rn) put(x, y, q === 1 ? claro : base);
      else if (k === rn - 1) put(x, y, q === 2 ? base : claro);
      else if (k === ri && rn >= 10) {
        const ang = Math.atan2(dy, dx) + q * 0.12;
        if (Math.floor(((ang + Math.PI) / (2 * Math.PI)) * 48) % 3 !== 2) put(x, y, base);
      } else if (d < ri - 1 && ((((x * 73856093) ^ (y * 19349663) ^ (q * 83492791)) >>> 0) % 131) === 0) put(x, y, q === 0 ? claro : base);   // brilhos soltos no chao (sem padrao em faixa)
    }
    if (rn >= 10) for (let i = 0; i < 8; i++) {   // marcas nas 8 direcoes, alternam por quadro
      if ((i + q) % 2) continue;
      const a = (i / 8) * Math.PI * 2;
      const mx = Math.round(c + Math.cos(a) * (ri - 3)), my = Math.round(c + Math.sin(a) * (ri - 3));
      put(mx, my, brilho); put(mx - 1, my, claro); put(mx + 1, my, claro); put(mx, my - 1, claro); put(mx, my + 1, claro);
    }
  });
}

function manchaPixel(rn: number, pal: Paleta, q: number) {
  const [esc, base, claro] = PALETAS[pal];
  const w = rn * 2 + 1, h = Math.max(3, Math.round(rn * 1.1)) , cx = rn, cy = h / 2;
  return rasterizar(`chao|${rn}|${pal}|${q}`, w, h, put => {
    for (let y = 0; y < h; y++) for (let x = 0; x < w; x++) {
      const nx = (x - cx) / rn, ny = (y - cy) / (h / 2), d = nx * nx + ny * ny;
      if (d > 1) continue;
      if (d > 0.82) put(x, y, esc);
      else if ((x + y + q) % 2 === 0) put(x, y, (x * 3 + y * 5 + q) % 7 === 0 ? claro : base);   // xadrez duro, sem alfa
    }
  });
}

function feixePixel(e: Extract<Efeito, { tipo: 'feixe' }>, q: number) {
  const [esc, base, claro, brilho] = PALETAS[e.pal];
  const x0 = Math.min(e.x, e.x2) - 6, y0 = Math.min(e.y, e.y2) - 6;
  const w = Math.ceil((Math.abs(e.x2 - e.x) + 12) / ESCALA), h = Math.ceil((Math.abs(e.y2 - e.y) + 12) / ESCALA);
  const ax = Math.round((e.x - x0) / ESCALA), ay = Math.round((e.y - y0) / ESCALA);
  const bx = Math.round((e.x2 - x0) / ESCALA), by = Math.round((e.y2 - y0) / ESCALA);
  const img = rasterizar(`feixe|${ax},${ay},${bx},${by}|${e.pal}|${q}`, w, h, put => {
    const n = Math.max(Math.abs(bx - ax), Math.abs(by - ay), 1);
    for (let i = 0; i <= n; i++) {   // linha nativa + borda, com zigue-zague de 1px que muda por quadro
      const x = Math.round(ax + (bx - ax) * i / n), y = Math.round(ay + (by - ay) * i / n) + (((i >> 2) + q) % 3 === 0 ? 1 : 0);
      put(x, y - 1, esc); put(x, y + 1, esc); put(x, y, (i + q) % 4 === 0 ? brilho : q === 1 ? claro : base);
    }
  });
  return img && { img, x0, y0 };
}

function raioPixel(e: Extract<Efeito, { tipo: 'raio' }>, q: number) {
  const [esc, base, claro, brilho] = PALETAS[e.pal];
  const M = 10;   // folga para o zigue-zague
  const x0 = Math.min(e.x, e.x2) - M * ESCALA, y0 = Math.min(e.y, e.y2) - M * ESCALA;
  const w = Math.ceil((Math.abs(e.x2 - e.x)) / ESCALA) + M * 2 + 1, h = Math.ceil((Math.abs(e.y2 - e.y)) / ESCALA) + M * 2 + 1;
  const ax = Math.round((e.x - x0) / ESCALA), ay = Math.round((e.y - y0) / ESCALA);
  const bx = Math.round((e.x2 - x0) / ESCALA), by = Math.round((e.y2 - y0) / ESCALA);
  const img = rasterizar(`raio|${e.id}|${q}`, w, h, put => {
    let sem = (e.id * 2654435761 + q * 97) >>> 0;
    const rnd = () => { sem = (sem * 1664525 + 1013904223) >>> 0; return sem / 4294967296; };
    const len = Math.hypot(bx - ax, by - ay) || 1, nx = -(by - ay) / len, ny = (bx - ax) / len;
    const segs = Math.max(3, Math.round(len / 7));
    const pts: [number, number][] = [[ax, ay]];
    for (let i = 1; i < segs; i++) { const t = i / segs, j = (rnd() - 0.5) * 8; pts.push([Math.round(ax + (bx - ax) * t + nx * j), Math.round(ay + (by - ay) * t + ny * j)]); }
    pts.push([bx, by]);
    const linha = (p: [number, number], r: [number, number], nucleo: string, borda: boolean) => {
      const n = Math.max(Math.abs(r[0] - p[0]), Math.abs(r[1] - p[1]), 1);
      for (let i = 0; i <= n; i++) {
        const x = Math.round(p[0] + (r[0] - p[0]) * i / n), y = Math.round(p[1] + (r[1] - p[1]) * i / n);
        if (borda) { put(x - 1, y, esc); put(x + 1, y, esc); put(x, y - 1, esc); put(x, y + 1, esc); }
      }
      for (let i = 0; i <= n; i++) put(Math.round(p[0] + (r[0] - p[0]) * i / n), Math.round(p[1] + (r[1] - p[1]) * i / n), nucleo);
    };
    for (let i = 0; i < pts.length - 1; i++) linha(pts[i], pts[i + 1], base, true);
    for (let i = 1; i < pts.length - 1; i++) if (rnd() < 0.35) {   // galhos curtos
      const [px, py] = pts[i], s2 = rnd() < 0.5 ? -1 : 1;
      linha([px, py], [Math.round(px + nx * s2 * 5 + (rnd() - 0.5) * 4), Math.round(py + ny * s2 * 5 + (rnd() - 0.5) * 4)], claro, false);
    }
    for (let i = 0; i < pts.length - 1; i++) if ((i + q) % 2 === 0) linha(pts[i], pts[i + 1], q === 0 ? brilho : claro, false);   // nucleo pisca
    for (const [px, py] of [pts[0], pts[pts.length - 1]]) { put(px, py, brilho); put(px - 1, py, claro); put(px + 1, py, claro); put(px, py - 1, claro); put(px, py + 1, claro); }
  });
  return img && { img, x0, y0 };
}


// ── Sigila do Runesmith (torreta arrastavel): folha pixel de 4 quadros, 40x40 nativo (80x80 na cena) ──
// Anel pontilhado com 4 nos que giram, hexagono que gira ao contrario e runa central que pulsa.
// Anima por CSS em degraus (steps), sem vetor nem alfa. `valido=false`: vermelho (fantasma ao arrastar fora).
export const SIGILO_LADO = 40, SIGILO_QUADROS = 4;
export function folhaSigilo(valido = true) {
  const [esc, base, claro, brilho] = valido ? ['#123f4d', '#0891b2', '#22d3ee', '#cffafe'] : ['#4c0d0d', '#b91c1c', '#f87171', '#fee2e2'];
  const L = SIGILO_LADO, N = SIGILO_QUADROS, c = L / 2;   // centro inteiro: sem .5 no arredondamento
  return rasterizar(`sigilo|${valido ? 1 : 0}`, L * N, L, put => {
    for (let q = 0; q < N; q++) {
      const ox = q * L;
      const p = (x: number, y: number, cor: string) => { if (x >= 0 && x < L && y >= 0 && y < L) put(ox + x, y, cor); };
      // anel pontilhado (gira: o tracejado anda 1 casa por quadro)
      for (let a = 0; a < 96; a++) {
        const ang = (a / 96) * Math.PI * 2;
        const x = Math.round(c + Math.cos(ang) * 17), y = Math.round(c + Math.sin(ang) * 17);
        if ((a + q * 3) % 6 < 3) p(x, y, base);
      }
      // 4 nos no anel
      for (let k = 0; k < 4; k++) {
        const ang = k * Math.PI / 2 + q * (Math.PI / 8);
        const x = Math.round(c + Math.cos(ang) * 17), y = Math.round(c + Math.sin(ang) * 17);
        p(x, y, brilho); p(x - 1, y, claro); p(x + 1, y, claro); p(x, y - 1, claro); p(x, y + 1, claro);
        p(x - 1, y - 1, esc); p(x + 1, y + 1, esc); p(x - 1, y + 1, esc); p(x + 1, y - 1, esc);
      }
      // hexagono (gira ao contrario, 15 graus por quadro)
      const vs: [number, number][] = [];
      for (let k = 0; k < 6; k++) { const ang = -Math.PI / 2 + k * Math.PI / 3 - q * (Math.PI / 12); vs.push([c + Math.cos(ang) * 11, c + Math.sin(ang) * 11]); }
      for (let k = 0; k < 6; k++) {
        const [x0, y0] = vs[k], [x1, y1] = vs[(k + 1) % 6];
        const n = Math.ceil(Math.max(Math.abs(x1 - x0), Math.abs(y1 - y0)));
        for (let i = 0; i <= n; i++) p(Math.round(x0 + (x1 - x0) * i / n), Math.round(y0 + (y1 - y0) * i / n), claro);
      }
      // nucleo: disco escuro com borda e runa em cruz (pulsa: quadros 1 e 2 mais claros)
      const forte = q === 1 || q === 2;
      for (let y = -5; y <= 5; y++) for (let x = -5; x <= 5; x++) {
        const d = Math.round(Math.sqrt(x * x + y * y));
        if (d === 5) p(Math.round(c + x), Math.round(c + y), claro);
        else if (d < 5) p(Math.round(c + x), Math.round(c + y), esc);
      }
      for (let i = -4; i <= 4; i++) { p(Math.round(c + i), Math.round(c), forte ? brilho : claro); p(Math.round(c), Math.round(c + i), forte ? brilho : claro); }
      for (let i = -2; i <= 2; i++) { p(Math.round(c + i), Math.round(c + i), base); p(Math.round(c + i), Math.round(c - i), base); }
      p(Math.round(c), Math.round(c), brilho);
    }
  });
}
/** Sigila pronta para a cena (80x80), animada em degraus. */
export function SigiloPixel({ valido = true }: { valido?: boolean }) {
  const img = folhaSigilo(valido);
  if (!img) return null;
  const L = SIGILO_LADO * ESCALA;
  return <div style={{ width: L, height: L, imageRendering: 'pixelated', backgroundImage: `url(${img.src})`, backgroundRepeat: 'no-repeat',
    backgroundSize: `${L * SIGILO_QUADROS}px ${L}px`, animation: `sigiloPixel ${SIGILO_QUADROS * 180}ms steps(${SIGILO_QUADROS}) infinite` }}>
    <style>{`@keyframes sigiloPixel { from { background-position: 0 0 } to { background-position: -${L * SIGILO_QUADROS}px 0 } }`}</style>
  </div>;
}

const pixelado: React.CSSProperties = { position: 'absolute', left: 0, top: 0, imageRendering: 'pixelated', pointerEvents: 'none' };
const alinhar = (v: number) => Math.round(v / ESCALA) * ESCALA;   // encaixa na grade de pixel

function desenhar(e: Efeito, agora: number): React.ReactNode {
  const q = quadroEm(e.inicio, agora);
  switch (e.tipo) {
    case 'explosao': {
      const f = VFX_FOLHAS[e.folha];
      const k = Math.min(f.n - 1, Math.floor(((agora - e.inicio) / e.dur) * f.n));
      const w = f.w * e.escala, h = f.h * e.escala;
      return <div key={e.id} style={{ ...pixelado, width: w, height: h,
        transform: `translate(${alinhar(e.x - w / 2)}px, ${alinhar(e.y - h / 2)}px)`,
        backgroundImage: `url(./sprites/vfx/${e.folha}.png)`, backgroundRepeat: 'no-repeat',
        backgroundSize: `${f.n * w}px ${h}px`, backgroundPosition: `${-k * w}px 0px` }} />;
    }
    case 'area': {
      const rn = Math.max(4, Math.round(e.raio / ESCALA));
      const img = anelPixel(rn, e.pal, q % 3);
      if (!img) return null;
      return <img key={e.id} src={img.src} alt="" draggable={false} style={{ ...pixelado, width: img.w * ESCALA, height: img.h * ESCALA,
        transform: `translate(${alinhar(e.x) - (rn + 2) * ESCALA}px, ${alinhar(e.y) - (rn + 2) * ESCALA}px)` }} />;
    }
    case 'chao': {
      const rn = Math.max(3, Math.round(e.raio / ESCALA));
      const img = manchaPixel(rn, e.pal, q % 2);
      if (!img) return null;
      return <img key={e.id} src={img.src} alt="" draggable={false} style={{ ...pixelado, width: img.w * ESCALA, height: img.h * ESCALA,
        transform: `translate(${alinhar(e.x) - rn * ESCALA}px, ${alinhar(e.y) - Math.round(img.h / 2) * ESCALA}px)` }} />;
    }
    case 'feixe': {
      const r = feixePixel(e, q % 3);
      if (!r) return null;
      return <img key={e.id} src={r.img.src} alt="" draggable={false} style={{ ...pixelado, width: r.img.w * ESCALA, height: r.img.h * ESCALA,
        transform: `translate(${alinhar(r.x0)}px, ${alinhar(r.y0)}px)` }} />;
    }
    case 'raio': {
      const r = raioPixel(e, q % 3);
      if (!r) return null;
      return <img key={e.id} src={r.img.src} alt="" draggable={false} style={{ ...pixelado, width: r.img.w * ESCALA, height: r.img.h * ESCALA,
        transform: `translate(${alinhar(r.x0)}px, ${alinhar(r.y0)}px)` }} />;
    }
    default: return null;
  }
}

interface Props { agora: () => number; tremerAlvo?: React.RefObject<HTMLElement | null> }

/** Monte dentro da cena (mesmo sistema de coordenadas dos inimigos). Redesenha so enquanto ha efeito,
 *  e so quando o quadro em degrau muda (10 q/s), nao a cada rAF. */
export function CamadaEfeitos({ agora, tremerAlvo }: Props) {
  const [, setTique] = React.useState(0);
  const agoraRef = React.useRef(agora);
  agoraRef.current = agora;
  React.useEffect(() => {
    efeitos.usarRelogio(() => agoraRef.current());
    let raf = 0, tremia = false, ultimoPasso = -1, ultimoN = -1;
    const passo = () => {
      const t = agoraRef.current();
      const vivos = efeitos.vivos(t);
      const p = Math.floor(t / PASSO);
      if ((vivos.length && p !== ultimoPasso) || vivos.length !== ultimoN) setTique(x => (x + 1) % 1e6);
      ultimoPasso = p; ultimoN = vivos.length;
      const el = tremerAlvo?.current;
      if (el) {
        let forca = 0;
        for (const e of vivos) if (e.tipo === 'tremor') forca = Math.max(forca, e.forca);
        if (forca > 0) {   // degraus de 2px, trocam no mesmo passo de quadro
          const s = (n: number) => (((p * 7 + n) % 3) - 1) * 2 * Math.max(1, Math.round(forca / 2));
          el.style.translate = `${s(1)}px ${s(2)}px`; tremia = true;
        } else if (tremia) { el.style.translate = ''; tremia = false; }
      }
      raf = requestAnimationFrame(passo);
    };
    raf = requestAnimationFrame(passo);
    return () => { cancelAnimationFrame(raf); if (tremia && tremerAlvo?.current) tremerAlvo.current.style.translate = ''; efeitos.limpar(); };
  }, [tremerAlvo]);

  const t = agora();
  const vivos = efeitos.vivos(t);
  if (!vivos.length) return null;
  // chao primeiro (fica por baixo), depois aneis, feixes e explosoes
  const ordem = { chao: 0, area: 1, feixe: 2, explosao: 3, tremor: 4 } as const;
  const itens = [...vivos].sort((a, b) => ordem[a.tipo] - ordem[b.tipo]).map(e => desenhar(e, t));
  return (
    <div className="absolute inset-0 z-20" style={{ pointerEvents: 'none' }} data-camada="efeitos-magias">
      {itens}
    </div>
  );
}
