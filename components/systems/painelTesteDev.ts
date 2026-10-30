// Painel de teste (so DEV_TESTE: `npm run dev` / electron:dev, nunca build nem demo).
// Logica pura: config do painel, "time pronto" por onda e o checkpoint de onda.
//
// TIME PRONTO (formula documentada, aproximacao de uma run tipica em Normal):
//   nivel do jogador   L = min(30, 1 + floor(0.8 * (onda - 1)))       (~1 level-up a cada 1,25 onda)
//   cartas equivalentes C = L - 1  -> todos os aliados: dano x(1 + 0,08*C), vida x(1 + 0,05*C),
//                                     cadencia x max(0,7, 1 - 0,01*C)   (media de cartas comuns/raras)
//   heroi              nivel min(15, 10 + floor(onda / 5))            (comeca no 10; XP de chefe)
//   recrutas           floor(onda / 4) aliados, ate encher as vagas;   nivel min(10, 1 + floor(onda / 3))
//   vagas              5 (+1 na onda >= 15, +1 na onda >= 25; teto 7 como a compra de vaga)
//   ouro               40 * onda  (sobra tipica para loja/gacha entre ondas)
//   muralha            +3 de vida maxima por onda (reparos/cartas de muralha de uma run tipica)
// Niveis usam a mesma escala do level-up de aliado do jogo (dano +10%/nv, vida +8%/nv,
// cadencia -3%/nv, alcance +2%/nv). Nao aplica cartas especificas, reliquias nem sinergias
// compradas: e um equivalente numerico.
import type { Ally, AllyType } from '../../types';

export interface CfgPainelTeste {
  modo: string;              // AtoModo ('standard' = Ato I)
  onda: number;
  dificuldade: string;       // easy | normal | hard | infernal
  heroi: AllyType;
  timePronto: boolean;
  muralhaImortal: boolean;
  fome: number;              // 0 = normal (onda final do X, 31, com Malachar/Corrompido); 1..3 = pula direto para a Fome
  corrompido: string | null; // null = nenhum (Malachar); tipo de heroi = corrompido desta run
}

export interface CheckpointOnda {
  onda: number;
  cfg: CfgPainelTeste;
  jogador: any | null;        // null = recomeca pela cfg (time pronto de novo)
  muralha: number;
  muralhaMax: number;
  xpAliados: Record<string, number>;
}

export const CFG_PADRAO: CfgPainelTeste = {
  modo: 'act10', onda: 31, dificuldade: 'normal', heroi: 'archer' as AllyType,
  timePronto: true, muralhaImortal: false, fome: 0, corrompido: null,
};

export interface BaseHeroi { type: AllyType; damage?: number; attackSpeed?: number; range?: number; projectileSpeed?: number; color?: string; hp?: number; maxHp?: number }

export const nivelJogadorNaOnda = (onda: number) => Math.min(30, 1 + Math.floor(0.8 * (Math.max(1, onda) - 1)));
export const nivelHeroiNaOnda = (onda: number) => Math.min(15, 10 + Math.floor(onda / 5));
export const nivelRecrutaNaOnda = (onda: number) => Math.min(10, 1 + Math.floor(onda / 3));
export const vagasNaOnda = (onda: number) => Math.min(7, 5 + (onda >= 15 ? 1 : 0) + (onda >= 25 ? 1 : 0));
export const recrutasNaOnda = (onda: number) => Math.floor(onda / 4);
export const ouroNaOnda = (onda: number) => 40 * onda;
export const muralhaExtraNaOnda = (onda: number) => 3 * Math.max(0, onda - 1);

// Mesma escala do level-up incremental do GameCanvas (de `de` para `para`)
export function subirNivel<T extends { damage: number; maxHp: number; hp: number; attackSpeed: number; range: number; level: number }>(a: T, para: number): T {
  const de = a.level;
  if (para <= de) return a;
  const f = (k: number, n: number) => 1 + (n - 1) * k;
  const fa = (n: number) => 1 - (n - 1) * 0.03;
  const maxHp = Math.round(a.maxHp * f(0.08, para) / f(0.08, de));
  return { ...a, level: para,
    damage: Math.round(a.damage * f(0.10, para) / f(0.10, de)),
    maxHp, hp: maxHp,
    attackSpeed: Math.max(200, Math.round(a.attackSpeed * fa(para) / fa(de))),
    range: Math.round(a.range * f(0.02, para) / f(0.02, de)) };
}

function cartasEquivalentes<T extends { damage: number; maxHp: number; hp: number; attackSpeed: number }>(a: T, c: number): T {
  const maxHp = Math.round(a.maxHp * (1 + 0.05 * c));
  return { ...a, damage: Math.round(a.damage * (1 + 0.08 * c)), maxHp, hp: maxHp, attackSpeed: Math.max(200, Math.round(a.attackSpeed * Math.max(0.7, 1 - 0.01 * c))) };
}

/** Monta o time pronto a partir do jogador inicial (heroi ja criado pelo jogo, com forja/arvore). */
export function montarTimePronto(p: any, onda: number, pool: BaseHeroi[], acharVaga: (allies: Ally[]) => { col: number; row: number }, id: () => string): any {
  const L = nivelJogadorNaOnda(onda), C = L - 1;
  const maxAllies = Math.max(p.maxAllies ?? 5, vagasNaOnda(onda));
  const allies: Ally[] = p.allies.map((a: Ally) => a.isHero ? subirNivel(a as any, nivelHeroiNaOnda(onda)) : a);
  const heroiTipo = allies.find(a => a.isHero)?.type;
  const tipos = pool.filter(b => b.type !== heroiTipo);
  const nRec = Math.min(maxAllies - allies.length, recrutasNaOnda(onda));
  for (let i = 0; i < nRec && tipos.length; i++) {
    const b = tipos[(i * 7 + onda) % tipos.length];
    const base: Ally = { id: `dev-${b.type}-${id()}`, type: b.type, level: 1, isHero: false,
      damage: b.damage || 10, attackSpeed: b.attackSpeed || 1000, range: b.range || 500, projectileSpeed: b.projectileSpeed || 8,
      color: b.color || 'text-white', hp: b.maxHp || b.hp || 50, maxHp: b.maxHp || b.hp || 50,
      perks: {}, gridPosition: acharVaga(allies), lastShotTime: 0, attackCooldown: 0, isAttacking: false } as any;
    allies.push(subirNivel(base as any, nivelRecrutaNaOnda(onda)));
  }
  return { ...p, level: L, xp: 0, xpToNextLevel: Math.floor(80 * Math.pow(1.18, C)), maxAllies,
    gold: (p.gold ?? 0) + ouroNaOnda(onda), allies: allies.map(a => cartasEquivalentes(a as any, C)) };
}

/** Copia o jogador para o checkpoint (aliados copiados um a um: o laco muta aliados no lugar). */
export function copiarJogador(p: any): any {
  return { ...p, fallenAllies: [], allies: (p.allies ?? []).map((a: any) => ({ ...a, perks: { ...(a.perks || {}) }, gridPosition: { ...a.gridPosition },
    hp: Math.max(1, a.hp ?? a.maxHp), statusEffect: 'none', isAttacking: false, lastShotTime: 0, attackCooldown: 0 })) };
}
