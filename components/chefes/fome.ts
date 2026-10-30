// A Fome (Etapa 3b; docs/LORE.md §8, docs/ATOS_VI_X_ASSETS.md "A luta contra a Fome"). Luta final do
// Ato X: nao tem rosto, e a arena. Maquina de estados pura (testavel sem React): o GameCanvas chama
// iniciar() quando a ultima onda do X (31) termina, passo() uma vez por quadro e le estado() para desenhar.
// Nada de regra no GameCanvas.
//
// transicao (6 s) -> fase1 (4 Pontos Fracos) -> fase2 (restam 2) -> fase3 (resta 1: o Coracao) -> fim
// - Tudo o que nasce aqui e sem recompensa (util.semRecompensa): e fase, nao farm. Celulas por timer com
//   teto de 12 vivas. A luta tem fim garantido (o Coracao nao se cura).
// - Ponto fechado: imune por util.instalarReducao (fator 0) + _semAlvo — nunca repor vida depois do golpe.
// - Estado global do modulo: resetFome() no inicio de toda run (GameCanvas).
// - Escala: invocados a partir do chefe final, onda 31 (modelo: ja traz dificuldade, Infernal e nivel).
//   Coracao = 1,2x a vida do Malachar da ficha; os 4 Pontos somam 1x. Decisoes do Marcos (plano 3b).
import type { Ally, Enemy } from '../../types';
import type { CtxChefe } from './tipos';
import { invocar, semRecompensa, instalarReducao } from './util';
import { PONTOS_FRACOS_ACT10B } from '../data/arenaAct10b';
import { HABILIDADES_CORROMPIDAS, consumirEgide } from './corrompido';
import { efeitos } from '../efeitosMagias';

export type FaseFome = 'inativa' | 'transicao' | 'fase1' | 'fase2' | 'fase3' | 'fim';
export const FOME = {
  TRANSICAO: 6000, TROCA_ARENA: 3000, BATIDA1: 4000, BATIDA2: 2500, BATIDA3: 2500, DANO_BATIDA: 0.04,
  CELULA_CADA: 3000, TETO: 12, AGARRA_CADA: 7000, AGARRA_AVISO: 1000, AGARRA_PRESO: 2000,
  VERME_CADA: 9000, VERME_AVISO: 1500, VERME_DANO: 0.15, VERME_ATRAVESSA: 1200,
  FECHA_CADA: 8000, FECHA_DUR: 3000, CURA_BATIDA: 0.05, HABIL_CORROMPIDO: 20000, SILENCIO: 2000,
  PONTO_HP: 9, CORACAO_HP: 36 * 1.2, PONTO_RAIO: 36, CORACAO_RAIO: 90,
  CORACAO_X: 430, CORACAO_Y: 480,   // centro do Coracao no campo (x=0 na muralha), ao alcance (teste)
} as const;
export const CELULAS = ['celula', 'celula_b', 'celula_c', 'celula_d'];
export const TIPOS_FOME = ['fome_ponto', 'fome_coracao', 'mind_flayer_anciao'] as const;

// ── Devoradores de Mentes (pedido do Marcos, 29/9) ──────────────────────────────────────────────
// Comuns (tipo mind_flayer, o mesmo do Ato IV): 2 ao abrir a fase 1, +2 ao entrar na fase 2. Andam como
// inimigo corpo a corpo (sem alcance: vao ate a muralha). Explosao Mental a cada 8 s: atordoa 1 s os herois
// a ate RAIO px do centro do Devorador (colado na muralha pega as 2 colunas da frente em ~3 fileiras; longe
// da muralha nao pega ninguem — e o aviso para mata-lo antes). Na fase 3 o Anciao (mind_flayer_anciao, sprite
// do mind_flayer 1,5x): explosao mais forte, Dominar (heroi aleatorio 3 s sem agir) e, vivo, o Coracao toma
// metade do dano. A barra de chefe mostra o Anciao enquanto ele vive (o Coracao fica _semBarra), depois o
// Coracao. A batida da fase 3 nao cura o Anciao. Tudo sem recompensa; escala pelo modelo (como a Fome).
// Numeros em unidades da ficha (x vida/dano do Malachar da onda 31 / linha 44.5), como Pontos e celulas.
export const DEVORADOR = {
  FASE1: 2, FASE2: 2,
  HP: 20, DANO: 50, VEL: 0.7, RAIO: 30,                                  // celula: 12.5 / 44 / 0.85 / 32
  EXPLOSAO_CADA: 8000, EXPLOSAO_ATORDOA: 1000, EXPLOSAO_RAIO: 260,
  ANCIAO_HP: 24, ANCIAO_DANO: 70, ANCIAO_VEL: 0.5, ANCIAO_RAIO: 45,      // raio 45 = 1,5x o comum (sprite 1,5x)
  ANCIAO_EXPLOSAO_ATORDOA: 1500, ANCIAO_EXPLOSAO_RAIO: 380,
  DOMINAR_CADA: 12000, DOMINAR_MS: 3000,
  CORACAO_FICA: 0.5,                                                     // Anciao vivo: o Coracao toma 50%
} as const;
export const TIPO_ANCIAO = 'mind_flayer_anciao';

type Modelo = { maxHp: number; damage: number; speed: number };
export interface EstadoFome {
  fase: FaseFome;
  pontosVivos: number;
  tint: number;                                     // 0..1: quanto o vermelho da Fome cobre a tela
  tremor: boolean;
  batida: number;                                   // agora da ultima batida (pulso no desenho)
  agarra?: { x: number; y: number; avisoAte: number; ate: number };   // aviso ate avisoAte, preso ate 'ate'
  verme?: { row: number; y: number; avisoAte: number; ate: number }; // aviso na fileira; atravessa ate 'ate'
}

const S: any = {};
const MARCA = { fome: true };   // _invocadoPor das celulas (teto)
export function resetFome() {
  for (const k of Object.keys(S)) delete S[k];
  S.fase = 'inativa' as FaseFome;
}
resetFome();

const vivos = (ctx: CtxChefe, f: (e: any) => boolean) => ctx.inimigos.filter(e => e.hp > 0 && f(e));
const pontosVivos = (ctx: CtxChefe) => vivos(ctx, e => (e.type as string) === 'fome_ponto');
export const celulasVivas = (ctx: CtxChefe) => vivos(ctx, e => e._invocadoPor === MARCA).length;

// Modelo sem chefe (teste ou chefe nao visto): numeros crus do Malachar da ficha
function modelo(): Enemy {
  const m: Modelo = S.modelo ?? { maxHp: 44.5 * 300, damage: 93.6 * 1.5, speed: 0.8 };   // sem modelo: a linha 31 do Malachar na ficha
  return { type: 'malachar', maxHp: m.maxHp, hp: m.maxHp, damage: m.damage, speed: m.speed, color: '', enemyLevel: 0 } as any;
}

export function iniciar(ctx: CtxChefe, opts: { modelo?: Modelo | null; corrompido?: string | null; heroi?: string; nome?: string; pontos?: { x: number; y: number }[] } = {}) {
  if (S.fase !== 'inativa') return;
  S.fase = 'transicao';
  S.inicio = ctx.agora; S.ultimo = ctx.agora;
  S.modelo = opts.modelo ?? undefined;
  S.corrompido = opts.corrompido ?? undefined;
  S.heroi = opts.heroi;
  S.pontos = opts.pontos ?? PONTOS_FRACOS_ACT10B;
  S.batida = ctx.agora;
  S.fimChamado = false;
  // fala de joelhos (Malachar ou o corrompido) e um batimento
  S.nome = opts.nome ?? 'Malachar';
  ctx.dizer?.('fome.transicao', S.nome);
  for (const e of ctx.inimigos) if (e.hp > 0) sumir(e);   // o que sobrou some sem recompensa
}

function sumir(e: Enemy) {
  const x = e as any;
  x._liberar = true;   // ponto fechado: a reducao deixa a vida ir a 0
  semRecompensa(e);
  e.hp = 0;
}

function nascerPontos(ctx: CtxChefe) {
  const mod = modelo();
  const lista: Enemy[] = [];
  for (const p of S.pontos) {
    const e = semRecompensa(invocar(ctx, mod, 'fome_ponto', ctx.muralhaX + p.x, p.y,
      { hp: FOME.PONTO_HP, dano: 1, vel: 0, raio: FOME.PONTO_RAIO }));
    const x = e as any;
    x._fixo = { x: e.position.x, y: e.position.y };
    x._nomeBarraChave = 'ui.fome.barra';
    instalarReducao(e, q => ((q as any)._fechado && !(q as any)._liberar) ? 0 : consumirEgide(q));   // Egide Negra (corrompido)
    lista.push(e);
    ctx.adicionarInimigo(e);
  }
  // uma barra so ("A Fome"): a soma dos pontos vivos
  const barra = () => ({ hp: lista.reduce((s, q) => s + Math.max(0, q.hp), 0), max: lista.reduce((s, q) => s + q.maxHp, 0) });
  for (const e of lista) (e as any)._barra = barra;
}

function fechar(e: Enemy, sim: boolean) {
  const x = e as any;
  if (x._fechadoSempre) sim = true;
  x._fechado = sim; x._semAlvo = sim;
}

function nascerCoracao(ctx: CtxChefe) {
  const e = semRecompensa(invocar(ctx, modelo(), 'fome_coracao', ctx.muralhaX + FOME.CORACAO_X, FOME.CORACAO_Y,
    { hp: FOME.CORACAO_HP, dano: 1, vel: 0, raio: FOME.CORACAO_RAIO }));
  (e as any)._fixo = { x: e.position.x, y: e.position.y };
  // Egide Negra (corrompido paladino) e o Anciao vivo (metade); _liberar (sumir/depuracao) passa inteiro
  instalarReducao(e, q => (q as any)._liberar ? 1 : consumirEgide(q) * (anciaoVivo() ? DEVORADOR.CORACAO_FICA : 1));
  S.coracao = e;
  ctx.adicionarInimigo(e);
  ctx.dizer?.('fome.coracao', '');
}

const MARCA_DEV = { devorador: true };   // _invocadoPor dos Devoradores (fora do teto das celulas)
export const anciaoVivo = (): boolean => !!S.anciao && S.anciao.hp > 0 && !S.anciao._chefeMorto;
export const devoradoresVivos = (ctx: CtxChefe) => vivos(ctx, e => e._invocadoPor === MARCA_DEV);

function nascerDevorador(ctx: CtxChefe, y: number, anciao = false) {
  const D = DEVORADOR;
  const e = semRecompensa(invocar(ctx, modelo(), anciao ? TIPO_ANCIAO : 'mind_flayer', ctx.chegadaX + (anciao ? 60 : 110), y,
    anciao ? { hp: D.ANCIAO_HP, dano: D.ANCIAO_DANO, vel: D.ANCIAO_VEL, raio: D.ANCIAO_RAIO }
      : { hp: D.HP, dano: D.DANO, vel: D.VEL, raio: D.RAIO }));
  const x = e as any;
  x._invocadoPor = MARCA_DEV; x._tExplosao = 0; x._tDominar = 0;
  ctx.adicionarInimigo(e);
  if (anciao) S.anciao = e;
  return e;
}
function nascerDevoradores(ctx: CtxChefe, n: number) {
  for (let k = 0; k < n; k++) nascerDevorador(ctx, 260 + (k + 0.5) * (440 / n) + (Math.random() - 0.5) * 60);
}

// Explosao Mental: atordoa os herois vivos a ate 'raio' px do centro do Devorador
function explosaoMental(ctx: CtxChefe, e: Enemy, raio: number, ms: number) {
  const c = { x: e.position.x + e.width / 2, y: e.position.y + e.height / 2 };
  let n = 0;
  for (const a of ctx.aliados) {
    if (a.hp <= 0) continue;
    const p = ctx.posAliado(a);
    if ((p.x - c.x) ** 2 + (p.y - c.y) ** 2 > raio * raio) continue;
    ctx.atordoarAliado(a, ctx.agora + ms);
    efeitos.explosao(p.x, p.y, 'sombra');
    n++;
  }
  // acertou: anel do raio todo; ninguem perto: anel pequeno e curto (so um pulso, sem poluir a tela)
  if (n) efeitos.area(c.x, c.y, raio, 'sombra', 500); else efeitos.area(c.x, c.y, 70, 'sombra', 250);
  if (n) ctx.efeito(c.x, c.y - e.height / 2 - 10, '✺', '#b278e6', 40);
}

// Dominar (Anciao): um heroi aleatorio fica DOMINAR_MS sem agir, com brilho roxo
function dominar(ctx: CtxChefe) {
  const vs = ctx.aliados.filter(a => a.hp > 0);
  if (!vs.length) return;
  const a = vs[Math.floor(Math.random() * vs.length)];
  ctx.atordoarAliado(a, ctx.agora + DEVORADOR.DOMINAR_MS);
  const p = ctx.posAliado(a);
  efeitos.brilho(p.x, p.y, 'sombra');
  efeitos.area(p.x, p.y, 44, 'sombra', DEVORADOR.DOMINAR_MS);
  ctx.efeito(p.x, p.y - 30, '◉', '#b278e6', 40);
}

function passoDevoradores(ctx: CtxChefe, dt: number) {
  const D = DEVORADOR;
  for (const e of devoradoresVivos(ctx)) {
    const x = e as any, anc = (e.type as string) === TIPO_ANCIAO;
    x._tExplosao = (x._tExplosao ?? 0) + dt;
    if (x._tExplosao >= D.EXPLOSAO_CADA) {
      x._tExplosao -= D.EXPLOSAO_CADA;
      explosaoMental(ctx, e, anc ? D.ANCIAO_EXPLOSAO_RAIO : D.EXPLOSAO_RAIO, anc ? D.ANCIAO_EXPLOSAO_ATORDOA : D.EXPLOSAO_ATORDOA);
    }
    if (anc) {
      x._tDominar = (x._tDominar ?? 0) + dt;
      if (x._tDominar >= D.DOMINAR_CADA) { x._tDominar -= D.DOMINAR_CADA; dominar(ctx); }
    }
  }
  // barra de chefe: a do Anciao enquanto ele vive; depois volta a do Coracao
  if (S.coracao) S.coracao._semBarra = anciaoVivo();
}

function batida(ctx: CtxChefe) {
  S.batida = ctx.agora;
  for (const a of ctx.aliados) {
    if (a.hp <= 1) continue;
    const d = Math.min(Math.round(a.maxHp * FOME.DANO_BATIDA), a.hp - 1);   // nunca mata
    if (d > 0) ctx.ferirAliado(a, d, '#dc2626');
  }
  if (S.fase === 'fase3') {
    for (const e of ctx.inimigos) {
      if (e.hp <= 0 || (e.type as string) === 'fome_coracao' || (e.type as string) === 'fome_ponto' || (e.type as string) === TIPO_ANCIAO) continue;
      e.hp = Math.min(e.maxHp, e.hp + e.maxHp * FOME.CURA_BATIDA);
    }
  }
}

function celula(ctx: CtxChefe) {
  if (celulasVivas(ctx) >= FOME.TETO) return;
  const tipo = CELULAS[Math.floor(Math.random() * CELULAS.length)];
  const y = 180 + Math.random() * 520;
  const e = semRecompensa(invocar(ctx, modelo(), tipo, ctx.chegadaX + 110, y));
  (e as any)._invocadoPor = MARCA;
  ctx.adicionarInimigo(e);
}

const vivosAliados = (ctx: CtxChefe) => ctx.aliados.filter(a => a.hp > 0);
const celulaDaFileira = (row: number) => ({ gridPosition: { col: 0, row } } as Ally);

// relogio: acumula dt e dispara a cada 'cada' ms
function relogio(nome: string, dt: number, cada: number): boolean {
  S[nome] = (S[nome] ?? 0) + dt;
  if (S[nome] < cada) return false;
  S[nome] -= cada;
  return true;
}

export function passo(ctx: CtxChefe, dtIn?: number) {
  if (S.fase === 'inativa') return;
  const dt = dtIn ?? Math.max(0, ctx.agora - (S.ultimo ?? ctx.agora));
  S.ultimo = ctx.agora;
  // Pontos e Coracao nao saem do lugar (empurrao, confusao...)
  for (const e of ctx.inimigos) {
    const f = (e as any)._fixo;
    if (f && ((e.type as string) === 'fome_ponto' || (e.type as string) === 'fome_coracao')) { e.position.x = f.x; e.position.y = f.y; }
  }

  if (S.fase === 'transicao') {
    const t = ctx.agora - S.inicio;
    if (!S.trocou && t >= FOME.TROCA_ARENA) {
      S.trocou = true;
      ctx.trocarArena?.(true);
      S.batida = ctx.agora;
      for (const e of ctx.inimigos) if (e.hp > 0) sumir(e);
    }
    if (t >= FOME.TRANSICAO) {
      nascerPontos(ctx);
      nascerDevoradores(ctx, DEVORADOR.FASE1);
      S.fase = 'fase1';
      S.tBatida = 0; S.tCelula = 0; S.tAgarra = 0; S.tVerme = 0; S.tFecha = 0; S.tHabil = 0;
    }
    return;
  }

  if (S.fase === 'fim') {
    if (!S.fimChamado && ctx.agora >= S.fimEm) { S.fimChamado = true; ctx.fimDaCampanha?.(); }
    return;
  }

  // ── mudanca de fase pela contagem de Pontos vivos ──
  const pv = pontosVivos(ctx);
  S.pontosVivosCache = pv.length;
  if (S.fase === 'fase1' && pv.length <= 2) { S.fase = 'fase2'; S.tBatida = 0; S.tVerme = 0; S.tFecha = 0; nascerDevoradores(ctx, DEVORADOR.FASE2); }
  if (S.fase === 'fase2' && pv.length <= 1) {
    S.fase = 'fase3'; S.tBatida = 0; S.verme = undefined;
    for (const e of pv) { (e as any)._fechadoSempre = true; (e as any)._semBarra = true; fechar(e, true); }   // a barra passa a ser a do Coracao   // o ultimo se fecha para sempre
    nascerCoracao(ctx);
    nascerDevorador(ctx, FOME.CORACAO_Y, true);
  }

  // ── batida ──
  const cada = S.fase === 'fase1' ? FOME.BATIDA1 : S.fase === 'fase2' ? FOME.BATIDA2 : FOME.BATIDA3;
  if (relogio('tBatida', dt, cada)) batida(ctx);
  // ── celulas das paredes ──
  if (relogio('tCelula', dt, FOME.CELULA_CADA)) celula(ctx);

  // ── tentaculo que agarra (fase 1): aviso 1 s, depois prende 2 s (sem dano) ──
  if (S.agarra) {
    const g = S.agarra;
    if (!g.preso && ctx.agora >= g.avisoAte) {
      g.preso = true;
      if (g.alvo.hp > 0) ctx.atordoarAliado(g.alvo, g.ate);
    }
    if (ctx.agora >= g.ate) S.agarra = undefined;
  } else if (S.fase === 'fase1' && relogio('tAgarra', dt, FOME.AGARRA_CADA)) {
    const vs = vivosAliados(ctx);
    if (vs.length) {
      const alvo = vs[Math.floor(Math.random() * vs.length)];
      const p = ctx.posAliado(alvo);
      S.agarra = { alvo, x: p.x, y: p.y, avisoAte: ctx.agora + FOME.AGARRA_AVISO, ate: ctx.agora + FOME.AGARRA_AVISO + FOME.AGARRA_PRESO, preso: false };
    }
  }

  // ── fase 2: Verme numa fileira e Pontos que se fecham ──
  if (S.fase === 'fase2') {
    if (S.verme) {
      const v = S.verme;
      if (!v.golpeou && ctx.agora >= v.avisoAte) {
        v.golpeou = true;
        for (const a of ctx.aliados) if (a.hp > 0 && a.gridPosition.row === v.row) ctx.ferirAliado(a, a.maxHp * FOME.VERME_DANO, '#b91c1c');
      }
      if (ctx.agora >= v.ate) S.verme = undefined;
    } else if (relogio('tVerme', dt, FOME.VERME_CADA)) {
      const row = Math.floor(Math.random() * ctx.grade.rows);
      S.verme = { row, y: ctx.posAliado(celulaDaFileira(row)).y, avisoAte: ctx.agora + FOME.VERME_AVISO, ate: ctx.agora + FOME.VERME_AVISO + FOME.VERME_ATRAVESSA, golpeou: false };
    }
    if (S.fechadoAte !== undefined && ctx.agora >= S.fechadoAte) {
      S.fechadoAte = undefined;
      for (const e of pv) fechar(e, false);
    } else if (S.fechadoAte === undefined && relogio('tFecha', dt, FOME.FECHA_CADA)) {
      S.fechadoAte = ctx.agora + FOME.FECHA_DUR;
      for (const e of pv) fechar(e, true);
    }
  }

  passoDevoradores(ctx, dt);

  // ── Heroi Corrompido presente: a Fome usa a habilidade dele a cada 20 s ──
  if (S.corrompido && relogio('tHabil', dt, FOME.HABIL_CORROMPIDO)) {
    const fonte = S.coracao && S.coracao.hp > 0 ? S.coracao : pv[0];
    const h = HABILIDADES_CORROMPIDAS[S.corrompido];
    if (h && fonte) h.usar(ctx, fonte);
  }
}

// Coracao morto (aoMorrer do modulo fome_coracao): celulas e o ultimo Ponto somem sem recompensa,
// a Fome se cala; SILENCIO ms depois, fimDaCampanha (uma vez)
export function coracaoMorreu(ctx: CtxChefe) {
  if (S.fase === 'fim' || S.fase === 'inativa') return;
  S.fase = 'fim';
  S.fimEm = ctx.agora + FOME.SILENCIO;
  S.agarra = undefined; S.verme = undefined;
  for (const e of ctx.inimigos) if (e.hp > 0) sumir(e);
  // com corrompido: libertacao; se o vencedor e o proprio corrompido, ele "resistiu" (regra 3)
  if (S.corrompido) ctx.dizer?.(S.heroi === S.corrompido ? 'corrompido.resistiu' : 'corrompido.libertacao', S.nome);
  else ctx.dizer?.('fome.morte', '');
}

export function estado(): EstadoFome {
  const f: FaseFome = S.fase;
  const tint = f === 'fase1' ? 0.12 : f === 'fase2' ? 0.24 : f === 'fase3' ? 0.32 : f === 'transicao' ? 0.2 : 0;
  const ag = S.agarra ? { x: S.agarra.x, y: S.agarra.y, avisoAte: S.agarra.avisoAte, ate: S.agarra.ate } : undefined;
  const ve = S.verme ? { row: S.verme.row, y: S.verme.y, avisoAte: S.verme.avisoAte, ate: S.verme.ate } : undefined;
  return {
    fase: f, pontosVivos: S.pontosVivosCache ?? 0, tint, batida: S.batida ?? 0, agarra: ag, verme: ve,
    tremor: f === 'transicao' || (!!S.verme && S.verme.golpeou),
  };
}
// Sprite do Ponto Fraco: fechado = olho fechado (fase 2 e o ultimo na fase 3)
export const spriteFome = (e: Enemy): string => ((e.type as string) === 'fome_ponto' && (e as any)._fechado) ? 'fome_ponto_fechado' : e.type as string;
// So DEV (?fome=2/3, scripts/previa-fome.mjs): derruba Pontos ate sobrar 2 (fase 2) ou 1 (fase 3), sem recompensa
export function pularPara(ctx: CtxChefe, fase: 2 | 3) {
  const pv = pontosVivos(ctx);
  const sobra = fase === 2 ? 2 : 1;
  for (const e of pv.slice(0, Math.max(0, pv.length - sobra))) sumir(e);
}
