// Ajudantes dos modulos dos atos novos (VI+): centro/distancia e invocacao de inimigo tipado.
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { ATOS, ATO5_NOVO, ultimaOnda, type MobFaixa } from '../data/atos';

// Fichas onde procurar numeros de chefe/mob: as do jogo e a do Ato V refeito (fora do ATOS sem a chave)
const FICHAS = () => ATOS.includes(ATO5_NOVO) ? ATOS : [...ATOS, ATO5_NOVO];

export const centro = (e: Enemy) => ({ x: e.position.x + e.width / 2, y: e.position.y + e.height / 2 });
export const dist2 = (a: { x: number; y: number }, b: { x: number; y: number }) => (a.x - b.x) ** 2 + (a.y - b.y) ** 2;
export const vivo = (ctx: CtxChefe, e: Enemy) => e.hp > 0 && ctx.inimigos.includes(e);

// Linha do chefe na ficha do ato (onda e numeros) — base para escalar os invocados (atos VI+)
function fichaDoChefe(tipo: string): { onda: number; hp: number; dano: number; vel: number; final: boolean } | undefined {
  for (const a of FICHAS()) for (const [o, c] of Object.entries(a.chefes ?? {})) if (c.tipo === tipo) return { onda: Number(o), hp: c.hp, dano: c.dano, vel: c.vel, final: Number(o) === ultimaOnda(a) };
  return undefined;
}
export function mobDaFicha(tipo: string): MobFaixa | undefined {
  for (const a of FICHAS()) for (const f of a.faixas ?? []) { const m = f.pool.find(p => p.tipo === tipo); if (m) return m; }
  return undefined;
}

// Cria um inimigo do tipo pedido na posicao (centro) pedida, escalado a partir do chefe:
// a vida/dano/velocidade do chefe ja trazem dificuldade, nivel e ajuste do ato, entao
// invocado = chefe x (mob da ficha / chefe da ficha). A ultima onda do ato (30; 31 no X) tira o x1.5 de chefe final.
export function invocar(ctx: CtxChefe, chefe: Enemy, tipo: string, x: number, y: number, mob?: Omit<MobFaixa, 'tipo' | 'peso'>): Enemy {
  const m = mob ?? mobDaFicha(tipo);
  const fc = fichaDoChefe(chefe.type as string) ?? { onda: 10, hp: 1, dano: chefe.damage, vel: 1, final: false };
  const hpU = chefe.maxHp / fc.hp, danoU = chefe.damage / fc.dano / (fc.final ? 1.5 : 1), velU = chefe.speed / fc.vel;
  const hp = Math.max(1, Math.ceil(hpU * (m?.hp ?? 5)));
  const raio = m?.raio ?? 26;
  const e: any = {
    id: ctx.novoId(),
    position: { x: x - raio, y: y - raio },
    width: raio * 2, height: raio * 2,
    hp, maxHp: hp,
    speed: velU * (0.5 + fc.onda * 0.03) * (m?.vel ?? 1),
    damage: Math.max(1, Math.ceil(danoU * (m?.dano ?? 30))),
    type: tipo, color: chefe.color, variation: Math.floor(Math.random() * 3), statusEffect: 'none',
    attackRange: m?.alcance, attackSpeed: m?.cadencia,
    lastAttackTime: 0, lastBarrierAttackTime: 0, bleedStacks: 0, lastBleedTick: 0, statusDuration: 0,
    isAttacking: false, attackCooldown: 0, reward: 10, lane: 0, enemyLevel: (chefe as any).enemyLevel ?? 0,
    _invocado: true,
  };
  return e as Enemy;
}

// Invocado por timer (sem teto) nao paga nada: senao da pra farmar segurando a onda
export function semRecompensa<T extends Enemy>(e: T): T { (e as any)._semRecompensa = true; e.reward = 0; return e; }

// Reducao de dano (Ato VIII: couraca da tartaruga, carapaca do Rei Caranguejo, mergulho): 'fica'
// devolve a fracao do dano que fica (0 = imune). A reducao entra ANTES da vida mudar: a vida do
// inimigo vira uma propriedade com setter, e toda queda (em qualquer ponto do jogo que faca
// hp -= x) ja chega reduzida — nenhuma checagem "hp <= 0" do lugar do golpe ve uma morte falsa.
// Instalada so nos tipos cujo modulo usa reduzirDano; os outros inimigos nao mudam (fator 1).
export function instalarReducao(e: Enemy, fica: (e: Enemy) => number) {
  const x = e as any;
  if (x._reducao) return;
  x._reducao = fica;
  let v = e.hp;
  Object.defineProperty(e, 'hp', {
    enumerable: true, configurable: true,
    get: () => v,
    set: (n: number) => { v = n < v ? v - (v - n) * fica(e) : n; },
  });
}
// Fator do dano que fica (1 = sem reducao) — para consulta; a aplicacao e pelo setter acima
export const multiplicadorDano = (e: Enemy): number => (e as any)._reducao ? (e as any)._reducao(e) : 1;
export function reduzirDano(fica: (e: Enemy) => number): Pick<ModuloChefe, 'aoNascer' | 'aCadaQuadro'> {
  return {
    aoNascer: (_ctx, e) => instalarReducao(e, fica),
    aCadaQuadro: (_ctx, e) => instalarReducao(e, fica),   // garante nos invocados sem aoNascer
  };
}
