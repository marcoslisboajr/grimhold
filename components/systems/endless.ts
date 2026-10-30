// ══════════════════════════════════════════════════════════════════════
// endless.ts — Infinito com os 10 atos, pools do Randomizador e escolha de mapa.
// Logica pura (sem React): GameCanvas le daqui; tests/endless.test.ts trava.
//
// Infinito (e Pacifista, e o Guardiao Solitario, que roda sobre o Infinito):
//   ciclo de ENDLESS_CICLO ondas = blocos de 30, bloco b = Ato b+1 (ATOS[b]).
//   Build completa: 10 blocos (300 ondas). Demo: 5 blocos (150) como antes —
//   a demo nem abre o Infinito (DEMO_MODES), entao ali nada muda.
//   Blocos I-IV (e o V na demo): numeros proprios do Infinito (GameCanvas, historico).
//   Blocos V (refeito)..X: comuns e chefes da ficha do ato (atos.ts).
// ══════════════════════════════════════════════════════════════════════
import type { EnemyType } from '../../types';
import { ATOS, ATO5_REFEITO, type Ato, type Chefe, type MobFaixa, type StatsInimigo } from '../data/atos';
import { IS_DEMO } from './build';

export const ENDLESS_BLOCO = 30;
export const ENDLESS_NBLOCOS = IS_DEMO ? 5 : 10;
export const ENDLESS_CICLO = ENDLESS_BLOCO * ENDLESS_NBLOCOS;   // 300 (demo: 150)

// Multiplicador base por bloco (cresce suave: +0.20 ate o V, +0.15 depois)
export const ENDLESS_BLOCK_SCALES = [1.30, 1.50, 1.70, 1.90, 2.10, 2.25, 2.40, 2.55, 2.70, 2.85];

export const ehModoEndless = (gm: string): boolean => gm === 'endless' || gm === 'pacifist';

export interface PosEndless { ciclo: number; rawBase: number; bloco: number; local: number }
/** Onda (1..) -> ciclo (0..), posicao no ciclo (1..CICLO), bloco (0..N-1) e onda local no bloco (1..30). */
export const posEndless = (wave: number): PosEndless => {
  const w = Math.max(1, Math.floor(wave));
  const rawBase = ((w - 1) % ENDLESS_CICLO) + 1;
  return { ciclo: Math.floor((w - 1) / ENDLESS_CICLO), rawBase, bloco: Math.floor((rawBase - 1) / ENDLESS_BLOCO), local: ((rawBase - 1) % ENDLESS_BLOCO) + 1 };
};
export const atoDoBlocoEndless = (bloco: number): Ato => ATOS[Math.max(0, Math.min(ENDLESS_NBLOCOS - 1, bloco))];
export const ehChefeEndless = (wave: number): boolean => posEndless(wave).rawBase % 10 === 0;
/** Blocos que sorteiam pela ficha do ato (V refeito e VI-X). I-IV e o V antigo usam o codigo do Infinito. */
export const blocoUsaFicha = (bloco: number): boolean => bloco >= 5 || (bloco === 4 && ATO5_REFEITO && !IS_DEMO);

/**
 * Escala por onda e por ciclo do Infinito — aplicada UMA vez, no fim do createEnemy (29/09: antes o
 * bloco do Infinito tambem multiplicava 1.028^w e 2.2^ciclo, e a vida levava os dois ao quadrado).
 * A vida ja cresce pela base (30+6w) e pela evolucao (+35% a cada 5 ondas), entao:
 *   vida: sem exponencial ate a 150; depois 1.008^(w-150) (W200 x1.49, W300 x3.3) — passar da 300 e muito dificil
 *   dano: 1.0075^w ate a 150, meia velocidade depois (W150 x3.1, W300 x5.4)
 *   velocidade: 1.003^w, para na 150 (x1.57)
 *   por ciclo completo: vida x6, dano x3, velocidade x1.15 (a 301 volta ao Ato I, mas mais forte que a 300)
 */
export const ESCALA_ENDLESS = { hpOnda: 1.008, hpDesde: 150, dmgOnda: 1.0075, velOnda: 1.003, hpCiclo: 6, dmgCiclo: 3, velCiclo: 1.15 } as const;
export const multEndless = (wave: number): { hp: number; dmg: number; vel: number } => {
  const { ciclo, rawBase } = posEndless(wave);
  const w0 = rawBase - 1, E = ESCALA_ENDLESS;
  return {
    hp: Math.pow(E.hpOnda, Math.max(0, w0 - E.hpDesde)) * Math.pow(E.hpCiclo, ciclo),
    dmg: Math.pow(E.dmgOnda, Math.min(w0, 150) + 0.5 * Math.max(0, w0 - 150)) * Math.pow(E.dmgCiclo, ciclo),
    vel: Math.pow(E.velOnda, Math.min(w0, 150)) * Math.pow(E.velCiclo, ciclo),
  };
};

// ── Exclusoes (Infinito e Randomizador) ────────────────────────────────
// Fome, Coracao, Pontos Fracos, estatuas, herois corrompidos e o Malachar final (com escolta).
export const inimigoExcluido = (tipo: string): boolean =>
  tipo.startsWith('fome') || tipo.startsWith('corrupted_') || tipo.startsWith('estatua') || tipo.startsWith('devorador')
  || tipo.includes('coracao') || tipo.includes('ponto_fraco') || tipo === 'malachar';

const semSegundo = (c: Chefe): Chefe => ({ ...c, segundo: undefined });
/** Chefe do bloco na onda local 10/20/30: o chefe do ato na mesma onda; se nao houver ou for excluido, o mais proximo antes. */
export const chefeEndless = (ato: Pick<Ato, 'chefes'>, local: number): Chefe | undefined => {
  const cs = ato.chefes ?? {};
  for (const o of [local, local - 5, local - 10, local + 5, local - 15, local - 20, local - 25]) {
    const c = cs[o];
    if (c && !inimigoExcluido(c.tipo as string)) return semSegundo(c);
  }
  return undefined;
};

/** Comum do bloco (ficha): usa o sorteio do ato na onda local (5/15/25 -> faixa da anterior); re-sorteia se cair em excluido. */
export const sortearComumEndless = (ato: Ato, local: number, roll: number, base: StatsInimigo): StatsInimigo => {
  const o = local % 5 === 0 ? local - 1 : local;
  const f = { isBossSpawn: false, isSecondBossSpawn: false, isEscort: false };
  for (let i = 0; i < 6; i++) {
    const r = ato.sortear(o, (roll + i * 0.382) % 1, f, base);
    if (!inimigoExcluido(r.type as string)) return r;
  }
  // tudo excluido nessa faixa: o primeiro comum permitido da ficha
  const m = (ato.faixas ?? []).flatMap(fx => fx.pool).find(p => !inimigoExcluido(p.tipo as string));
  if (!m) return { ...base };
  return { ...base, type: m.tipo, hp: base.hp * m.hp, damage: m.dano, speed: base.speed * m.vel, radius: m.raio,
    attackRange: m.alcance ?? base.attackRange, attackSpeed: m.cadencia ?? base.attackSpeed };
};

// ── Randomizador: extras dos Atos V refeito e VI-X ─────────────────────
export interface MobRandom { type: EnemyType; hpMult: number; dmg: number; spdMult: number; radius: number; ranged?: boolean }
export interface ChefeRandom { type: EnemyType; hpMult: number; dmg: number; spdMult: number; radius: number; attackRange?: number; attackSpeed?: number }
const r2 = (n: number) => Math.round(n * 100) / 100;
/** Fichas novas (V refeito na build completa, VI-X). Demo: nenhuma. */
const fichasNovas = (): Ato[] => IS_DEMO ? [] : ATOS.filter(a => (a.numero >= 6 || (a.numero === 5 && ATO5_REFEITO)) && a.faixas);
/**
 * Comuns novos no molde do pool antigo: vida x0.4 da ficha (a ficha ja conta a vida de ato tardio;
 * o randomizador tem escala propria por onda), dano x0.75. Os tipos ja presentes ficam como estao.
 */
const _cache = new Map<string, unknown>();
const memo = <T,>(k: string, f: () => T): T => { if (!_cache.has(k)) _cache.set(k, f()); return _cache.get(k) as T; };
export const mobsRandomizerExtras = (jaTem: string[]): MobRandom[] => memo('m|' + jaTem.join(','), () => {
  const vistos = new Set(jaTem);
  const out: MobRandom[] = [];
  for (const a of fichasNovas()) for (const fx of a.faixas!) for (const m of fx.pool as MobFaixa[]) {
    const t = m.tipo as string;
    if (vistos.has(t) || inimigoExcluido(t)) continue;
    vistos.add(t);
    out.push({ type: m.tipo, hpMult: r2(m.hp * 0.4), dmg: Math.round(m.dano * 0.75), spdMult: m.vel, radius: m.raio, ...((m.alcance ?? 0) >= 400 ? { ranged: true } : {}) });
  }
  return out;
});
/** Chefes novos: vida igual a da ficha (teto 45), dano x1.3 (o pool antigo vai de 22 a 125), velocidade/alcance/cadencia da ficha. */
export const chefesRandomizerExtras = (jaTem: string[]): ChefeRandom[] => memo('c|' + jaTem.join(','), () => {
  const vistos = new Set(jaTem);
  const out: ChefeRandom[] = [];
  for (const a of fichasNovas()) for (const c of Object.values(a.chefes ?? {})) {
    const t = c.tipo as string;
    if (vistos.has(t) || inimigoExcluido(t)) continue;
    vistos.add(t);
    out.push({ type: c.tipo, hpMult: Math.min(45, c.hp), dmg: Math.round(c.dano * 1.3), spdMult: c.vel, radius: c.raio,
      attackRange: c.alcance ?? 220, attackSpeed: c.cadencia ?? 1400 });
  }
  return out;
});

// ── Escolha de mapa (so visual: fundo + objetos altos) ─────────────────
// Valor guardado: 'seguir' (padrao) | 'aleatorio' | modo do ato ('standard', 'act2'..'act10').
export type EscolhaMapa = string;
export const MAPA_CHAVE = 'grimhold_mapa_escolha';
export const MAPA_PADRAO: EscolhaMapa = 'seguir';
export const MAPAS_ATOS = (): string[] => ATOS.filter(a => !IS_DEMO || a.numero <= 2).map(a => a.modo);

const hash = (s: number, b: number): number => {
  let h = (s ^ Math.imul(b + 1, 0x9e3779b1)) >>> 0;
  h = Math.imul(h ^ (h >>> 16), 0x85ebca6b) >>> 0;
  h = Math.imul(h ^ (h >>> 13), 0xc2b2ae35) >>> 0;
  return ((h ^ (h >>> 16)) >>> 0) / 4294967296;
};
/** Sorteio fixo por semente e indice (mesma run = mesmo mapa por bloco). */
export const sortearMapa = (liberados: string[], semente: number, indice: number): string =>
  liberados.length ? liberados[Math.floor(hash(semente, indice) * liberados.length) % liberados.length] : 'standard';

/**
 * Mapa (modo do ato) a desenhar numa onda.
 *   modo endless/pacifist + 'seguir': o ato do bloco; se trancado, o ultimo liberado antes dele.
 *   randomizer + 'seguir': a cada 30 ondas um liberado sorteado.
 *   'aleatorio': um liberado sorteado no inicio (indice fixo).
 *   modo de ato: ele mesmo (se liberado).
 */
export const mapaDaOnda = (escolha: EscolhaMapa, wave: number, gm: string, liberados: string[], semente: number): string => {
  const lib = liberados.length ? liberados : ['standard'];
  if (escolha === 'aleatorio') return sortearMapa(lib, semente, -1);
  if (escolha === 'seguir') {
    if (gm === 'randomizer') return sortearMapa(lib, semente, Math.floor((Math.max(1, wave) - 1) / ENDLESS_BLOCO));
    const alvo = atoDoBlocoEndless(posEndless(wave).bloco);
    if (lib.includes(alvo.modo)) return alvo.modo;
    const antes = ATOS.filter(a => a.numero <= alvo.numero && lib.includes(a.modo));
    return antes.length ? antes[antes.length - 1].modo : lib[0];
  }
  return lib.includes(escolha) ? escolha : lib[0];
};
