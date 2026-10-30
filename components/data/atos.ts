// ══════════════════════════════════════════════════════════════════════
// atos.ts — cadastro de atos.
// Uma ficha por ato. Os Atos I-V sorteiam pelo codigo antigo (atosLegado.ts,
// travado por tests/atos/legado.hashes.json); atos novos usam faixas/chefes.
// ══════════════════════════════════════════════════════════════════════
import type { EnemyType } from '../../types';
import type { ArenaObject } from './arenaAct1';
import { ARENA_ACT1_OBJECTS } from './arenaAct1';
import { ARENA_ACT2_OBJECTS } from './arenaAct2';
import { ARENA_ACT3_OBJECTS } from './arenaAct3';
import { ARENA_ACT4_OBJECTS } from './arenaAct4';
import { ARENA_ACT5_OBJECTS } from './arenaAct5';
import { ARENA_ACT6_OBJECTS } from './arenaAct6';
import { ARENA_ACT7_OBJECTS } from './arenaAct7';
import { ARENA_ACT8_OBJECTS } from './arenaAct8';
import { ARENA_ACT9_OBJECTS } from './arenaAct9';
import { ARENA_ACT10_OBJECTS } from './arenaAct10';
import { ARENA_ACT10B_OBJECTS, PONTOS_FRACOS_ACT10B } from './arenaAct10b';
import { IS_DEMO } from '../systems/build';
import { sortearLegado, type FlagsSpawn, type StatsInimigo } from './atosLegado';

export type { FlagsSpawn, StatsInimigo };

// ── A chave do Ato V refeito (Etapa 3a) ─────────────────────────────────
// Unico lugar que decide qual Ato V o jogo usa. Ligada (build completa, dev e producao, desde o
// fechamento do EA): o V refeito (a traicao humana) — ficha, textos, chefes e fim do ato. Desligada
// (so a demo): o Ato V antigo (demonios, Malachar, epilogos, desbloqueio do Malachar) como sempre.
export const ATO5_REFEITO: boolean = !IS_DEMO;
export type AtoModo = 'standard' | 'act2' | 'act3' | 'act4' | 'act5' | 'act6' | 'act7' | 'act8' | 'act9' | 'act10';
export interface MobFaixa { tipo: EnemyType; peso: number; hp: number; dano: number; vel: number; raio: number; alcance?: number; cadencia?: number }
export interface Faixa { ateOnda: number; pool: MobFaixa[] }
export interface Chefe { tipo: EnemyType; hp: number; dano: number; vel: number; raio: number; alcance?: number; cadencia?: number; habilidade?: string; segundo?: Omit<Chefe, 'segundo'> }
export interface FundoAto { campo: string; patio: string; corBase: string; corLinha: string; corDestaque: string }
// Luta final dentro do ato (Etapa 3b, so o X): a vitoria na onda 30 nao fecha a run — a arena vira
// o interior da Fome (components/chefes/fome.ts) e so a morte do Coracao fecha a campanha
export interface LutaFinal { arena: ArenaObject[]; fundo: FundoAto; pontosFracos: { x: number; y: number }[] }
export interface Ato {
  id: string;
  modo: AtoModo;
  numero: number;
  numeral: string;
  chaveDesbloqueio?: string;
  destrava?: AtoModo;
  final?: true;
  // ajuste: multiplica HP e dano de todo inimigo do ato (18/9 e 20/09, historico no git do GameCanvas)
  ajuste: { hp: number; dmg: number };
  arena: ArenaObject[];
  selecao: { icone: string; material: 'gold' | 'verdigris' | 'bone' | 'oxblood' | 'amethyst' | 'frost' | 'ember' | 'slate'; chefesChaves: string[] };
  conquista?: string;
  faixas?: Faixa[];
  chefes?: Record<number, Chefe>;
  // textos: prefixo das chaves de texto do ato (ui.actSelect.<textos>.*, ui.victory.<textos>*). Sem: act<numero>
  textos?: string;
  // muralhaInfernalReforcada: no Infernal a muralha tem vida base x2.5 (e nao x2) — GameCanvas isAct4or5
  muralhaInfernalReforcada?: true;
  // regenHeroisMult: multiplica a regeneracao passiva dos herois entre ondas (GameCanvas _act5RegenMult)
  regenHeroisMult?: number;
  // fundo: cenario generico por ficha (GameCanvas). Atos I-V nao usam (blocos proprios)
  fundo?: FundoAto;
  lutaFinal?: LutaFinal;
  // ultimaOnda: onda do chefe final / fim do ato (sem: 30). O X tem 31 — a 30 e a maior onda comum
  // (sem chefe) e a 31 e so o chefe final com a escolta de demonios (depois dela, a Fome)
  ultimaOnda?: number;
  sortear: (onda: number, roll: number, f: FlagsSpawn, base: StatsInimigo) => StatsInimigo;
}

export const ONDAS_PADRAO = 30;
// Tamanho da onda 30 comum de um ato com ultimaOnda > 30 (X): a maior do ato, um pouco acima da 29 (25)
export const ONDA30_COMUM_X = 28;
export const ultimaOnda = (a?: Pick<Ato, 'ultimaOnda'> | null): number => a?.ultimaOnda ?? ONDAS_PADRAO;
// Posicao da onda no ciclo do ato (1..ultimaOnda)
export const ondaNoAto = (a: Pick<Ato, 'ultimaOnda'> | null | undefined, onda: number): number => ((onda - 1) % ultimaOnda(a)) + 1;
// Onda de chefe num ato: 5/10/15/20/25 e a ultima (30; no X a 31 — la a 30 e onda comum)
export const ehOndaDeChefe = (a: Pick<Ato, 'ultimaOnda'> | null | undefined, onda: number): boolean => {
  const c = ondaNoAto(a, onda);
  return c === ultimaOnda(a) || [5, 10, 15, 20, 25].includes(c);
};
// Ato cuja ultima onda e so o chefe final (sem mobs comuns; a escolta sao os invocados dele): o X
export const ondaFinalSoChefe = (a: Pick<Ato, 'ultimaOnda'> | null | undefined): boolean => ultimaOnda(a) > ONDAS_PADRAO;

export function sortearInimigo(ato: Pick<Ato, 'faixas' | 'chefes'>, onda: number, roll: number, f: FlagsSpawn, base: StatsInimigo): StatsInimigo {
  const r: StatsInimigo = { ...base };
  const chefe = onda % 5 === 0 || f.isBossSpawn ? ato.chefes?.[onda] : undefined;
  const c = chefe && (f.isBossSpawn ? chefe : f.isSecondBossSpawn ? chefe.segundo : undefined);
  if (c) {
    r.type = c.tipo; r.hp *= c.hp; r.damage = c.dano; r.speed = c.vel; r.radius = c.raio;
    if (c.alcance !== undefined) r.attackRange = c.alcance;
    if (c.cadencia !== undefined) r.attackSpeed = c.cadencia;
    return r;
  }
  const ondaFaixa = onda % 5 === 0 && f.isEscort ? onda - 1 : onda;
  const faixa = ato.faixas?.find(fx => fx.ateOnda >= ondaFaixa);
  if (!faixa || !faixa.pool.length) return r;
  const soma = faixa.pool.reduce((s, m) => s + m.peso, 0);
  let acc = 0;
  const m = faixa.pool.find(p => (acc += p.peso / soma) > roll) ?? faixa.pool[faixa.pool.length - 1];
  r.type = m.tipo; r.hp *= m.hp; r.damage = m.dano; r.speed *= m.vel; r.radius = m.raio;
  if (m.alcance !== undefined) r.attackRange = m.alcance;
  if (m.cadencia !== undefined) r.attackSpeed = m.cadencia;
  return r;
}

const legado = (n: number) => (onda: number, roll: number, f: FlagsSpawn, base: StatsInimigo) => sortearLegado(n, onda, roll, f, base);


// ── Ato VI — A Outra Margem (Etapa 1a) ─────────────────────────────────
// Numeros na ordem de grandeza do Ato V (atosLegado.ts, bloco isAct5) com ~10% a mais de vida.
// Peso: cada papel soma 12, dividido entre as variantes; fenix soma 4 (1/3).
// Chefes (Etapa 1b): tipos proprios em CHEFES_TIPOS (components/chefes/lista.ts), numeros dos
// provisorios da 1a; habilidades nos modulos de components/chefes/.
const var_ = (tipos: string[], total: number, m: Omit<MobFaixa, 'tipo' | 'peso'>): MobFaixa[] =>
  tipos.map(t => ({ tipo: t as EnemyType, peso: total / tipos.length, ...m }));
const ATO6: Ato = {
  id: 'act6', modo: 'act6', numero: 6, numeral: 'VI', chaveDesbloqueio: 'grimhold_act6_unlocked', destrava: 'act7',
  ajuste: { hp: 0.75, dmg: 1.00 }, arena: ARENA_ACT6_OBJECTS, muralhaInfernalReforcada: true, regenHeroisMult: 2.5,
  selecao: { icone: 'moon', material: 'slate', chefesChaves: ['cultista_mor', 'irma_de_cassiel', 'serafim_caido'] }, conquista: 'act6_complete',
  fundo: { campo: './sprites/arena/bg_act6_field.png', patio: './sprites/arena/bg_act6_courtyard.png', corBase: '#0a0614', corLinha: 'rgba(167,139,250,0.10)', corDestaque: '#a78bfa' },
  faixas: [
    { ateOnda: 9, pool: [
      ...var_(['cultista_vermelho', 'cultista_vermelho_b'], 12, { hp: 6.0, dano: 32, vel: 0.90, raio: 28 }),
      ...var_(['cultista_branco', 'cultista_branco_b'], 12, { hp: 5.0, dano: 26, vel: 0.70, raio: 26, alcance: 620, cadencia: 1400 }),
      ...var_(['cultista_verde', 'cultista_verde_b'], 12, { hp: 4.4, dano: 28, vel: 1.15, raio: 24 }),
      ...var_(['cultista_negro', 'cultista_azul'], 12, { hp: 8.0, dano: 32, vel: 0.60, raio: 32 }),
      ...var_(['lanterna', 'lanterna_b'], 12, { hp: 7.5, dano: 34, vel: 0.55, raio: 30, alcance: 660, cadencia: 1350 }),
    ] },
    { ateOnda: 19, pool: [
      ...var_(['anjo', 'anjo_rubro', 'anjo_sombrio'], 12, { hp: 9.5, dano: 42, vel: 0.60, raio: 34, alcance: 700, cadencia: 1150 }),
      ...var_(['anjo_sem_asas', 'anjo_sem_asas_rubro', 'anjo_sem_asas_sombrio'], 12, { hp: 10.5, dano: 44, vel: 0.60, raio: 36 }),
      ...var_(['morcego', 'morcego_rubro'], 12, { hp: 5.5, dano: 36, vel: 1.35, raio: 20 }),
      ...var_(['acaro_azul', 'acaro_vermelho', 'acaro_prata', 'acaro_amarelo'], 12, { hp: 4.0, dano: 30, vel: 1.20, raio: 18 }),
    ] },
    { ateOnda: 29, pool: [
      ...var_(['lich6', 'lich6_rubro', 'lich6_dourado'], 12, { hp: 13.0, dano: 50, vel: 0.45, raio: 36, alcance: 730, cadencia: 1050 }),
      ...var_(['cavaleiro_caido', 'cavaleiro_caido_b'], 12, { hp: 14.0, dano: 52, vel: 0.55, raio: 40 }),
      ...var_(['esqueleto6', 'esqueleto6_lanca', 'esqueleto6_escudo'], 12, { hp: 11.0, dano: 46, vel: 0.85, raio: 32 }),
      ...var_(['fenix', 'fenix_do_caos'], 4, { hp: 15.0, dano: 56, vel: 0.80, raio: 46 }),
    ] },
  ],
  chefes: {
    5:  { tipo: 'cultista_mor',      hp: 21, dano: 55, vel: 0.70, raio: 48, alcance: 420, cadencia: 1500 },   // Cultista-Mor
    10: { tipo: 'coro',              hp: 37, dano: 72, vel: 0.90, raio: 50, alcance: 320, cadencia: 1200 },   // O Coro
    15: { tipo: 'anjo_caido',        hp: 19, dano: 62, vel: 0.85, raio: 52, alcance: 360, cadencia: 1200 },   // Anjo Caido
    20: { tipo: 'irma_de_cassiel',   hp: 40, dano: 78, vel: 0.88, raio: 52, alcance: 220, cadencia: 1400 },   // Irma de Cassiel
    25: { tipo: 'fenix_ancia',       hp: 24, dano: 68, vel: 0.75, raio: 58, alcance: 500, cadencia: 1300 },   // Fenix
    30: { tipo: 'serafim_caido',     hp: 40, dano: 72, vel: 0.80, raio: 48, alcance: 700, cadencia: 1200 },   // Serafim Caido
  },
  sortear: (o, r, f, b) => sortearInimigo(ATO6, o, r, f, b),
};

// ── Ato VII — A Ravina dos Xamas (Etapa 1c) ─────────────────────────────
// Como o VI fez com o V: mesma ordem de grandeza do VI com ~10% a mais de vida. Peso: cada papel
// soma 12, dividido entre as variantes; sapo-xama (suporte, raro) soma 6.
// Chefes: tipos proprios (CHEFES_ATO7 em components/chefes/lista.ts); habilidades nos modulos.
// Herda do VI a muralha infernal reforcada e o regen x2.5 dos herois (mesma dificuldade de base).
const ATO7: Ato = {
  id: 'act7', modo: 'act7', numero: 7, numeral: 'VII', chaveDesbloqueio: 'grimhold_act7_unlocked', destrava: 'act8',
  ajuste: { hp: 0.75, dmg: 1.00 }, arena: ARENA_ACT7_OBJECTS, muralhaInfernalReforcada: true, regenHeroisMult: 2.5,
  selecao: { icone: 'fang', material: 'verdigris', chefesChaves: ['kwazul', 'xiphra', 'ossoth'] }, conquista: 'act7_complete',
  fundo: { campo: './sprites/arena/bg_act7_field.png', patio: './sprites/arena/bg_act7_courtyard.png', corBase: '#07140c', corLinha: 'rgba(134,239,172,0.10)', corDestaque: '#4ade80' },
  faixas: [
    { ateOnda: 9, pool: [
      ...var_(['sapo', 'sapo_b', 'sapo_c'], 12, { hp: 6.2, dano: 30, vel: 0.95, raio: 26 }),
      ...var_(['sapo_xama', 'sapo_xama_b'], 6, { hp: 6.0, dano: 24, vel: 0.70, raio: 26 }),
      ...var_(['rato', 'rato_b', 'rato_c', 'rato_d'], 12, { hp: 4.8, dano: 28, vel: 1.30, raio: 22 }),
      ...var_(['inseto', 'inseto_b', 'inseto_c'], 12, { hp: 7.0, dano: 40, vel: 0.85, raio: 28 }),
      ...var_(['vespa', 'vespa_b', 'vespa_c'], 12, { hp: 4.2, dano: 30, vel: 1.45, raio: 20 }),
    ] },
    { ateOnda: 19, pool: [
      ...var_(['lagarto', 'lagarto_b', 'lagarto_tribo', 'lagarto_tribo_b'], 12, { hp: 11.0, dano: 44, vel: 0.70, raio: 34 }),
      ...var_(['lobo', 'lobo_b'], 12, { hp: 12.0, dano: 46, vel: 1.15, raio: 42 }),
      ...var_(['javali', 'javali_b'], 12, { hp: 13.5, dano: 48, vel: 1.00, raio: 44 }),
      ...var_(['raptor', 'raptor_b'], 12, { hp: 11.5, dano: 46, vel: 1.20, raio: 42 }),
    ] },
    { ateOnda: 29, pool: [
      ...var_(['tribo_lobo', 'tribo_lobo_b', 'tribo_lobo_c'], 12, { hp: 14.0, dano: 54, vel: 0.70, raio: 34 }),
      ...var_(['tribo_raposa', 'tribo_raposa_b', 'tribo_raposa_c'], 12, { hp: 13.0, dano: 52, vel: 0.80, raio: 32 }),
      ...var_(['tribo_ave', 'tribo_ave_b', 'tribo_ave_c'], 12, { hp: 12.5, dano: 50, vel: 0.60, raio: 32, alcance: 700, cadencia: 1150 }),
      ...var_(['tribo_peixe', 'tribo_peixe_b', 'tribo_peixe_c'], 12, { hp: 13.0, dano: 52, vel: 0.55, raio: 34, alcance: 680, cadencia: 1250 }),
    ] },
  ],
  chefes: {
    5:  { tipo: 'sapo_rei',      hp: 29, dano: 58, vel: 0.70, raio: 48 },                                   // Sapo-Rei
    10: { tipo: 'kwazul',        hp: 40, dano: 74, vel: 0.80, raio: 50, alcance: 420, cadencia: 1300 },   // Kwa'Zul
    15: { tipo: 'alfa_matilha',  hp: 24, dano: 70, vel: 1.00, raio: 56 },                                   // Alfa da Matilha
    20: { tipo: 'xiphra',        hp: 44, dano: 84, vel: 0.90, raio: 50, alcance: 260, cadencia: 1100 },   // Xiphra
    25: { tipo: 'chefe_tribal',  hp: 30, dano: 74, vel: 0.80, raio: 54, alcance: 320, cadencia: 1300 },   // Chefe Tribal
    30: { tipo: 'ossoth',        hp: 44, dano: 78, vel: 0.75, raio: 50, alcance: 700, cadencia: 1200 },   // Ossoth
  },
  sortear: (o, r, f, b) => sortearInimigo(ATO7, o, r, f, b),
};

// ── Ato VIII — O Mar Sem Fundo (Etapa 2a) ───────────────────────────────
// Como o VII fez com o VI: mesma ordem de grandeza do VII com ~10% a mais de vida. Peso: cada papel
// soma 12, dividido entre as variantes; afogado veterano (tanque medio) soma 6.
// Faixas: 1-9 afogados/cardumes/aguas-vivas; 10-19 caranguejos/tartarugas/aguas-vivas/veterano;
// 20-29 serpentes/caranguejos/tartarugas/veterano.
// Chefes: tipos proprios (CHEFES_ATO8 em components/chefes/lista.ts); habilidades nos modulos.
// Herda do VII a muralha infernal reforcada e o regen x2.5 dos herois.
const ATO8: Ato = {
  id: 'act8', modo: 'act8', numero: 8, numeral: 'VIII', chaveDesbloqueio: 'grimhold_act8_unlocked', destrava: 'act9',
  ajuste: { hp: 0.75, dmg: 1.00 }, arena: ARENA_ACT8_OBJECTS, muralhaInfernalReforcada: true, regenHeroisMult: 2.5,
  selecao: { icone: 'wave', material: 'frost', chefesChaves: ['capitao_afogado', 'garuda', 'kraken'] }, conquista: 'act8_complete',
  fundo: { campo: './sprites/arena/bg_act8_field.png', patio: './sprites/arena/bg_act8_courtyard.png', corBase: '#04121a', corLinha: 'rgba(103,232,249,0.10)', corDestaque: '#22d3ee' },
  faixas: [
    { ateOnda: 9, pool: [
      ...var_(['afogado', 'afogado_b', 'afogado_c', 'afogado_d'], 12, { hp: 7.0, dano: 34, vel: 0.85, raio: 28 }),
      ...var_(['cardume', 'cardume_b', 'cardume_c'], 12, { hp: 4.6, dano: 28, vel: 1.55, raio: 20 }),
      ...var_(['agua_viva', 'agua_viva_b', 'agua_viva_c', 'agua_viva_d'], 12, { hp: 5.0, dano: 28, vel: 0.80, raio: 24, alcance: 520, cadencia: 1300 }),
    ] },
    { ateOnda: 19, pool: [
      ...var_(['caranguejo', 'caranguejo_b', 'caranguejo_c'], 12, { hp: 14.5, dano: 50, vel: 0.75, raio: 38 }),
      ...var_(['tartaruga', 'tartaruga_b', 'tartaruga_c'], 12, { hp: 16.0, dano: 44, vel: 0.50, raio: 46 }),
      ...var_(['afogado_veterano'], 6, { hp: 15.5, dano: 52, vel: 0.65, raio: 34 }),
      ...var_(['agua_viva_b', 'agua_viva_c'], 12, { hp: 7.0, dano: 40, vel: 0.80, raio: 24, alcance: 560, cadencia: 1250 }),
    ] },
    { ateOnda: 29, pool: [
      ...var_(['serpente_mar', 'serpente_mar_b', 'serpente_mar_c', 'serpente_mar_d'], 12, { hp: 15.0, dano: 62, vel: 1.15, raio: 36 }),
      ...var_(['caranguejo_b', 'caranguejo_c'], 12, { hp: 17.5, dano: 56, vel: 0.75, raio: 38 }),
      ...var_(['tartaruga_b', 'tartaruga_c'], 12, { hp: 19.5, dano: 50, vel: 0.50, raio: 46 }),
      ...var_(['afogado_veterano'], 6, { hp: 18.5, dano: 58, vel: 0.65, raio: 34 }),
    ] },
  ],
  chefes: {
    5:  { tipo: 'capitao_afogado', hp: 25, dano: 64, vel: 0.70, raio: 50 },                                   // Capitao Afogado
    10: { tipo: 'mae_das_aguas',   hp: 44, dano: 80, vel: 0.75, raio: 50, alcance: 480, cadencia: 1300 },   // Mae das Aguas
    15: { tipo: 'garuda',          hp: 30, dano: 78, vel: 0.95, raio: 60 },                                   // Garuda
    20: { tipo: 'rei_caranguejo',  hp: 48, dano: 92, vel: 0.70, raio: 56 },                                   // Rei Caranguejo
    25: { tipo: 'serpente_ancia',  hp: 34, dano: 84, vel: 0.95, raio: 54 },                                   // Serpente Ancia
    30: { tipo: 'kraken',          hp: 50, dano: 86, vel: 0.60, raio: 70, alcance: 820, cadencia: 1300 },   // Kraken
  },
  sortear: (o, r, f, b) => sortearInimigo(ATO8, o, r, f, b),
};

// ── Ato IX — Os Guardioes (Etapa 2b) ─────────────────────────────────────
// Como o VIII fez com o VII: mesma ordem de grandeza do VIII com ~10% a mais de vida. Peso: cada
// papel soma 12, dividido entre as variantes. Faixas: 1-9 legiao/cranios/mumias; 10-19
// estatuas-lamina/olhos do portao/legiao; 20-29 cerberos/estatuas-lamina. As crias da Drider
// (aranha*) so nascem invocadas (numeros no modulo drider.ts).
// Chefes: tipos proprios (CHEFES_ATO9 em components/chefes/lista.ts); habilidades nos modulos. A
// Estatua do Leste (20) traz a do Oeste (modulo estatuas.ts): cada uma com ~60% da vida de um chefe.
// Herda do VIII a muralha infernal reforcada e o regen x2.5 dos herois.
const ATO9: Ato = {
  id: 'act9', modo: 'act9', numero: 9, numeral: 'IX', chaveDesbloqueio: 'grimhold_act9_unlocked', destrava: 'act10',
  ajuste: { hp: 0.75, dmg: 1.00 }, arena: ARENA_ACT9_OBJECTS, muralhaInfernalReforcada: true, regenHeroisMult: 2.5,
  selecao: { icone: 'monolith', material: 'ember', chefesChaves: ['drider', 'estatua_leste', 'quimera'] }, conquista: 'act9_complete',
  fundo: { campo: './sprites/arena/bg_act9_field.png', patio: './sprites/arena/bg_act9_courtyard.png', corBase: '#141110', corLinha: 'rgba(214,211,209,0.10)', corDestaque: '#f97316' },
  faixas: [
    { ateOnda: 9, pool: [
      ...var_(['legiao', 'legiao_b', 'legiao_c', 'legiao_d', 'legiao_e'], 12, { hp: 6.2, dano: 36, vel: 0.85, raio: 28 }),
      ...var_(['cranio', 'cranio_b', 'cranio_c', 'cranio_d'], 12, { hp: 4.2, dano: 30, vel: 1.50, raio: 22 }),
      ...var_(['mumia', 'mumia_b'], 12, { hp: 8.0, dano: 34, vel: 0.50, raio: 34 }),
    ] },
    { ateOnda: 19, pool: [
      ...var_(['estatua_lamina', 'estatua_lamina_b', 'estatua_lamina_c'], 12, { hp: 17.0, dano: 58, vel: 0.70, raio: 38 }),
      ...var_(['beholder9', 'beholder9_b'], 12, { hp: 9.5, dano: 44, vel: 0.75, raio: 30, alcance: 580, cadencia: 1250 }),
      ...var_(['legiao', 'legiao_b', 'legiao_c', 'legiao_d', 'legiao_e'], 12, { hp: 14.0, dano: 48, vel: 0.85, raio: 30 }),
    ] },
    { ateOnda: 29, pool: [
      ...var_(['cerbero', 'cerbero_b'], 12, { hp: 20.0, dano: 64, vel: 1.15, raio: 48 }),
      ...var_(['estatua_lamina', 'estatua_lamina_b', 'estatua_lamina_c'], 12, { hp: 19.5, dano: 62, vel: 0.70, raio: 38 }),
    ] },
  ],
  chefes: {
    5:  { tipo: 'general_ossos',    hp: 35, dano: 70, vel: 0.65, raio: 50 },                                   // General de Ossos
    10: { tipo: 'cranio_ancestral', hp: 41, dano: 88, vel: 0.80, raio: 50, alcance: 480, cadencia: 1300 },   // Cranio Ancestral
    15: { tipo: 'drider',           hp: 33, dano: 86, vel: 0.90, raio: 58 },                                   // A Rainha Drider
    20: { tipo: 'estatua_leste',    hp: 32, dano: 92, vel: 0.60, raio: 54 },                                   // Estatuas do Leste e do Oeste (60% cada)
    25: { tipo: 'cerbero_alfa',     hp: 37, dano: 92, vel: 1.00, raio: 60, alcance: 240, cadencia: 1300 },   // Cerbero Alfa
    30: { tipo: 'quimera',          hp: 55, dano: 95, vel: 0.65, raio: 64, alcance: 700, cadencia: 1300 },   // A Quimera
  },
  sortear: (o, r, f, b) => sortearInimigo(ATO9, o, r, f, b),
};

// ── Ato V — duas fichas, a chave ATO5_REFEITO escolhe ───────────────────
// Legado: o sorteio antigo (atosLegado.ts, travado pelos hashes), final (epilogos + Malachar).
export const ATO5_LEGADO: Ato = { id: 'act5', modo: 'act5', numero: 5, numeral: 'V', chaveDesbloqueio: 'grimhold_act5_unlocked', destrava: 'act6', final: true, ajuste: { hp: 0.75, dmg: 1.00 }, muralhaInfernalReforcada: true, regenHeroisMult: 2.5, arena: ARENA_ACT5_OBJECTS,
  selecao: { icone: 'skull', material: 'amethyst', chefesChaves: ['elder_demon', 'elder_minotaur', 'malachar'] }, conquista: 'act5_complete', sortear: legado(5) };

// Refeito (Etapa 3a) — A Queda de Grimhold: a traicao humana. Mesmo ajuste/flags/cenario do V antigo.
// Numeros na ordem de grandeza dos comuns do V antigo em cada faixa (atosLegado.ts, bloco isAct5).
// Peso: cada papel soma 12, dividido entre as variantes; o arqueiro de Ashfen soma 6. Chefes: tipos
// proprios (CHEFES_ATO5R), numeros no molde dos chefes do V antigo nas mesmas ondas; o Tesoureiro nao
// tem arma (ataque fraco). Nao e final: sem epilogo e sem Malachar (isso passa para o X na Etapa 3b).
export const ATO5_NOVO: Ato = {
  id: 'act5', modo: 'act5', numero: 5, numeral: 'V', chaveDesbloqueio: 'grimhold_act5_unlocked', destrava: 'act6', textos: 'act5r',
  ajuste: { hp: 0.75, dmg: 1.00 }, muralhaInfernalReforcada: true, regenHeroisMult: 2.5, arena: ARENA_ACT5_OBJECTS,
  selecao: { icone: 'skull', material: 'amethyst', chefesChaves: ['tesoureiro', 'capitao_ashfen', 'reitor'] }, conquista: 'act5_complete',
  faixas: [
    { ateOnda: 9, pool: [
      ...var_(['soldado_ashfen', 'soldado_ashfen_b', 'soldado_ashfen_d'], 12, { hp: 6.0, dano: 32, vel: 0.85, raio: 28 }),
      ...var_(['soldado_ashfen_c'], 6, { hp: 5.0, dano: 28, vel: 0.70, raio: 26, alcance: 600, cadencia: 1400 }),   // arqueiro
      ...var_(['capanga', 'capanga_b', 'capanga_c'], 12, { hp: 4.4, dano: 28, vel: 1.20, raio: 24 }),
    ] },
    { ateOnda: 19, pool: [
      ...var_(['cavaleiro_negro', 'cavaleiro_negro_b'], 12, { hp: 9.5, dano: 44, vel: 0.60, raio: 36 }),
      ...var_(['saqueador', 'saqueador_martelo', 'saqueador_espada'], 9, { hp: 7.0, dano: 42, vel: 1.15, raio: 30 }),
      ...var_(['saqueador_lanca'], 3, { hp: 7.0, dano: 40, vel: 1.10, raio: 30, alcance: 220, cadencia: 1300 }),   // lanca: alcance curto
      ...var_(['corrupt_paladin'], 12, { hp: 8.5, dano: 44, vel: 0.70, raio: 34 }),
    ] },
    { ateOnda: 29, pool: [
      ...var_(['death_knight'], 12, { hp: 12.0, dano: 50, vel: 0.60, raio: 36 }),
      ...var_(['lich5', 'lich5_b'], 12, { hp: 9.5, dano: 44, vel: 0.50, raio: 34, alcance: 700, cadencia: 1150 }),
      ...var_(['mago_colegiado', 'mago_colegiado_b'], 12, { hp: 8.5, dano: 42, vel: 0.60, raio: 30, alcance: 650, cadencia: 1200 }),
      ...var_(['runa_hostil', 'runa_hostil_b'], 12, { hp: 4.5, dano: 36, vel: 1.30, raio: 22, alcance: 560, cadencia: 1300 }),
    ] },
  ],
  chefes: {
    5:  { tipo: 'sargento_ashfen', hp: 24, dano: 55, vel: 0.70, raio: 48 },                                   // Sargento de Ashfen
    10: { tipo: 'tesoureiro',      hp: 34, dano: 30, vel: 0.90, raio: 44 },                                   // O Tesoureiro (sem arma)
    15: { tipo: 'chefe_saqueador', hp: 20, dano: 62, vel: 0.85, raio: 50 },                                   // Chefe dos Saqueadores
    20: { tipo: 'capitao_ashfen',  hp: 36, dano: 78, vel: 0.88, raio: 46, alcance: 220, cadencia: 1400 },   // Capitao de Ashfen
    25: { tipo: 'lich_colegiado',  hp: 22, dano: 68, vel: 0.75, raio: 50, alcance: 500, cadencia: 1300 },   // Lich do Colegiado
    30: { tipo: 'reitor',          hp: 36, dano: 72, vel: 0.80, raio: 46, alcance: 700, cadencia: 1200 },   // O Reitor
  },
  sortear: (o, r, f, b) => sortearInimigo(ATO5_NOVO, o, r, f, b),
};

// ── Ato X — O Ventre (ondas 1-31: a 30 e a maior onda comum, a 31 e o chefe final) ─────────────
// Ondas 1-9: a legiao que saiu do V antigo, com os MESMOS numeros do legado nas ondas 1-4 e 6-9
// (por isso duas faixas, 4 e 9: pesos = as fatias de roll do legado). 11-29: o ventre, ~10% mais
// vida que o legado do V nas mesmas ondas. Chefes: os legados do V (habilidades e falas que ja tem)
// com os numeros do legado. Final: a vitoria exige a Fome (Etapa 3b, lutaFinal): vencer a 31 abre a
// luta dentro dela, e so a morte do Coracao fecha a campanha (epilogos, Malachar, conquista).
const ATO10: Ato = {
  id: 'act10', modo: 'act10', numero: 10, numeral: 'X', chaveDesbloqueio: 'grimhold_act10_unlocked', final: true, ultimaOnda: 31,
  ajuste: { hp: 0.75, dmg: 1.00 }, arena: ARENA_ACT10_OBJECTS, muralhaInfernalReforcada: true, regenHeroisMult: 2.5,
  selecao: { icone: 'eye', material: 'amethyst', chefesChaves: ['ghazbaran', 'zathroth', 'malachar'] }, conquista: 'act10_complete',
  fundo: { campo: './sprites/arena/bg_act10_field.png', patio: './sprites/arena/bg_act10_courtyard.png', corBase: '#0b0614', corLinha: 'rgba(167,139,250,0.10)', corDestaque: '#8b5cf6' },
  lutaFinal: {
    arena: ARENA_ACT10B_OBJECTS, pontosFracos: PONTOS_FRACOS_ACT10B,
    fundo: { campo: './sprites/arena/bg_act10b_field.png', patio: './sprites/arena/bg_act10b_courtyard.png', corBase: '#12040a', corLinha: 'rgba(248,113,113,0.10)', corDestaque: '#dc2626' },
  },
  faixas: [
    { ateOnda: 4, pool: [
      ...var_(['void_stalker'], 30, { hp: 4.0, dano: 30, vel: 1.05, raio: 30 }),
      ...var_(['lord_demon'], 28, { hp: 5.5, dano: 30, vel: 0.68, raio: 36 }),
      ...var_(['demon_eyes'], 22, { hp: 8.5, dano: 36, vel: 0.55, raio: 38, alcance: 650, cadencia: 1400 }),
      ...var_(['lesser_demon'], 20, { hp: 5.0, dano: 28, vel: 1.10, raio: 22 }),
    ] },
    { ateOnda: 9, pool: [
      ...var_(['void_stalker'], 35, { hp: 5.6, dano: 34, vel: 1.00, raio: 30 }),
      ...var_(['lord_demon'], 30, { hp: 7.2, dano: 32, vel: 0.65, raio: 38 }),
      ...var_(['demon_eyes'], 35, { hp: 7.5, dano: 32, vel: 0.52, raio: 40, alcance: 680, cadencia: 1300 }),
    ] },
    { ateOnda: 19, pool: [
      ...var_(['celula', 'celula_b', 'celula_c', 'celula_d'], 12, { hp: 12.5, dano: 44, vel: 0.85, raio: 32 }),
      ...var_(['tentaculo', 'tentaculo_b'], 12, { hp: 11.0, dano: 42, vel: 0.50, raio: 30, alcance: 260, cadencia: 1200 }),   // parado onde nasce (tentaculo.ts)
      ...var_(['acaro_azul', 'acaro_vermelho', 'acaro_prata', 'acaro_amarelo'], 12, { hp: 7.5, dano: 36, vel: 1.20, raio: 18 }),
      ...var_(['vespa', 'vespa_b', 'vespa_c'], 12, { hp: 7.5, dano: 36, vel: 1.45, raio: 20 }),
    ] },
    { ateOnda: 29, pool: [
      ...var_(['slime_grande', 'slime_grande_b'], 12, { hp: 17.0, dano: 50, vel: 0.45, raio: 44 }),
      ...var_(['bolha', 'bolha_b'], 12, { hp: 6.5, dano: 40, vel: 1.40, raio: 22 }),
      ...var_(['void_herald'], 12, { hp: 12.5, dano: 52, vel: 0.70, raio: 36, alcance: 700, cadencia: 1150 }),
      ...var_(['warlock_shade'], 12, { hp: 11.5, dano: 48, vel: 0.60, raio: 32, alcance: 680, cadencia: 1150 }),
    ] },
    // onda 30 (so no X): a maior onda comum do ato, sem chefe — o mesmo exercito da faixa 29
    { ateOnda: 30, pool: [
      ...var_(['slime_grande', 'slime_grande_b'], 12, { hp: 17.0, dano: 50, vel: 0.45, raio: 44 }),
      ...var_(['bolha', 'bolha_b'], 12, { hp: 6.5, dano: 40, vel: 1.40, raio: 22 }),
      ...var_(['void_herald'], 12, { hp: 12.5, dano: 52, vel: 0.70, raio: 36, alcance: 700, cadencia: 1150 }),
      ...var_(['warlock_shade'], 12, { hp: 11.5, dano: 48, vel: 0.60, raio: 32, alcance: 680, cadencia: 1150 }),
    ] },
  ],
  chefes: {
    5:  { tipo: 'infernatil' as EnemyType,    hp: 24, dano: 55, vel: 0.70, raio: 48, alcance: 420, cadencia: 1500 },
    10: { tipo: 'demon' as EnemyType,         hp: 34, dano: 72, vel: 0.90, raio: 42, alcance: 320, cadencia: 1200 },
    15: { tipo: 'ghazbaran' as EnemyType,     hp: 17, dano: 62, vel: 0.85, raio: 44, alcance: 360, cadencia: 1200 },
    20: { tipo: 'minotaur_king' as EnemyType, hp: 36, dano: 78, vel: 0.88, raio: 44, alcance: 220, cadencia: 1400 },
    25: { tipo: 'zathroth' as EnemyType,      hp: 22, dano: 68, vel: 0.75, raio: 42, alcance: 500, cadencia: 1300 },
    // 31 (ultimaOnda): so o chefe final + demonios, sem mobs comuns — +30% de vida e dano sobre o
    // Malachar que era o da onda 30 (36/72), para compensar. Vida 44.5 (nao 46.8): a base da onda 31 ja
    // traz ~5,2% a mais que a da 30 (30+6w, evolucao, rampa), e 44.5 x 1,052 = 36 x 1,30
    31: { tipo: 'malachar' as EnemyType,      hp: 44.5, dano: 93.6, vel: 0.80, raio: 42, alcance: 700, cadencia: 1200 },
  },
  // 1-9 (e a escolta da 10): o proprio sorteio legado do V, bit a bit (as faixas 4 e 9 acima sao os mesmos
  // numeros, para consulta/invocacao; o legado decide nas bordas de roll)
  sortear: (o, r, f, b) => (o <= 9 || (o === 10 && f.isEscort)) && !f.isBossSpawn && !f.isSecondBossSpawn
    ? sortearLegado(5, o, r, f, b) : sortearInimigo(ATO10, o, r, f, b),
};

export const ATOS: Ato[] = [
  { id: 'act1', modo: 'standard', numero: 1, numeral: 'I', destrava: 'act2', ajuste: { hp: 1.25, dmg: 1.15 }, arena: ARENA_ACT1_OBJECTS,
    selecao: { icone: 'swords', material: 'gold', chefesChaves: ['goblin_king', 'grim_reaper', 'dragon_lord'] }, sortear: legado(1) },
  { id: 'act2', modo: 'act2', numero: 2, numeral: 'II', chaveDesbloqueio: 'grimhold_act2_unlocked', destrava: 'act3', ajuste: { hp: 1.00, dmg: 1.15 }, arena: ARENA_ACT2_OBJECTS,
    selecao: { icone: 'leaf', material: 'verdigris', chefesChaves: ['elf_champion', 'minotaur_king', 'dragon_lord'] }, conquista: 'act2_complete', sortear: legado(2) },
  { id: 'act3', modo: 'act3', numero: 3, numeral: 'III', chaveDesbloqueio: 'grimhold_act3_unlocked', destrava: 'act4', ajuste: { hp: 0.75, dmg: 1.00 }, arena: ARENA_ACT3_OBJECTS,
    selecao: { icone: 'monolith', material: 'bone', chefesChaves: ['half_brothers', 'vampire_lord', 'demon'] }, conquista: 'act3_complete', sortear: legado(3) },
  { id: 'act4', modo: 'act4', numero: 4, numeral: 'IV', chaveDesbloqueio: 'grimhold_act4_unlocked', destrava: 'act5', ajuste: { hp: 0.90, dmg: 1.00 }, muralhaInfernalReforcada: true, arena: ARENA_ACT4_OBJECTS,
    selecao: { icone: 'eye', material: 'oxblood', chefesChaves: ['elder_warlord', 'elder_vampire_lord', 'dread_reaper'] }, conquista: 'act4_complete', sortear: legado(4) },
  ATO5_REFEITO ? ATO5_NOVO : ATO5_LEGADO,
  ATO6,
  ATO7,
  ATO8,
  ATO9,
  ATO10,
];

export function atoDoModo(modo: string): Ato | undefined {
  return ATOS.find(a => a.modo === modo);
}
