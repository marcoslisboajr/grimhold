// Regra geral de chefes (docs/propostas-sinergias.md §3.1) — um lugar so, testavel.
//  - Atordoar/congelar/enraizar em chefe: nao trava; vira -25% de velocidade por 1,5s (sem acumular).
//  - Efeitos "em TODOS os inimigos"/globais, areas de sinergia e explosoes por % do HP maximo: 50% em chefe.
// "Chefe" = ehChefe (Atos I-X, partes da Fome, Herois Corrompidos) + o Arcanista Elfo, que as listas
// antigas do GameCanvas tratavam como chefe.
import { ehChefe } from '../chefes/lista';

export const CHEFE_FATOR_GLOBAL = 0.5;
export const CHEFE_LENTIDAO_MULT = 0.75;
export const CHEFE_LENTIDAO_MS = 1500;

export const ehChefeOuFome = (tipo: string): boolean => ehChefe(tipo) || tipo === 'elf_arcanist';

type Alvo = { type: string | unknown; frozenUntil?: number; statusEffect?: unknown; statusDuration?: number };

/**
 * Atordoa (frozenUntil) um inimigo comum; num chefe aplica a lentidao de chefe.
 * Retorna true se atordoou, false se virou lentidao.
 */
export function atordoar(e: Alvo, agora: number, duracaoMs: number, status: string = 'frozen'): boolean {
  if (ehChefeOuFome(e.type as string)) {
    // sem acumular: so renova a janela de 1,5s
    (e as any)._chefeLentoAte = agora + CHEFE_LENTIDAO_MS;
    return false;
  }
  e.frozenUntil = Math.max(e.frozenUntil ?? 0, agora + duracaoMs);
  (e as any).statusEffect = status;
  return true;
}

/** Multiplicador de passo do chefe lentificado (1 fora da janela). */
export const multLentidaoChefe = (e: object, agora: number): number =>
  (((e as any)._chefeLentoAte ?? 0) > agora ? CHEFE_LENTIDAO_MULT : 1);

/** Dano de efeito global/area de sinergia: 50% em chefe. */
export const danoGlobal = (tipo: string, dano: number): number =>
  ehChefeOuFome(tipo) ? Math.round(dano * CHEFE_FATOR_GLOBAL) : dano;

/**
 * Explosao por % do HP maximo do morto. Chefe morto: conta 50% do HP maximo.
 * `teto` opcional (ex.: 3x o dano do golpe) limita o resultado.
 */
export function explosaoPorHpMax(tipoMorto: string, hpMaxMorto: number, pct: number, teto?: number): number {
  let d = hpMaxMorto * pct;
  if (ehChefeOuFome(tipoMorto)) d *= CHEFE_FATOR_GLOBAL;
  if (teto !== undefined) d = Math.min(d, teto);
  return Math.max(0, Math.round(d));
}
