// Pegada (area de chao) dos objetos altos da arena — estatua, lapide, arvore,
// pedra grande. Regra do Marcos: ninguem anda POR CIMA deles.
//
// Os inimigos nascem num y continuo (SPAWN_MIN_Y..spawnMaxY) e andam reto pra
// esquerda — nao ha trilhas. Entao:
//  1. profundidade = base do objeto (linha do pe), sem desconto: pe acima da
//     base -> atras; pe abaixo -> na frente. Nunca "em cima".
//  2. o pe de um inimigo nunca fica DENTRO da pegada (faixa [base-P, base+F] na
//     largura do tronco/pedra). O sorteio do y de nascimento evita as pegadas e,
//     se algo empurrar o inimigo pra dentro (puxao, invocacao, chefe), ele
//     desliza em y pra fora — o x nao muda, entao o tempo ate a muralha e o mesmo.
import type { ArenaObject } from '../data/arenaAct1';

/** folga abaixo da base: pe ate aqui ainda "encostaria" no objeto */
const FOLGA_FRENTE = 6;
/** o inimigo comeca a desviar este tanto antes de chegar (ele anda pra esquerda) */
const ANTECIPA_X = 70;

export interface Pegada { x0: number; x1: number; y0: number; y1: number }

/** profundidade do chao ocupado: 22% da altura, entre 12 e 30 px */
export function profPegada(o: ArenaObject): number {
  return Math.max(12, Math.min(30, Math.round(o.h * 0.22)));
}

/** pegada em coordenadas do CANVAS (barreiraX = BARRIER_X) */
export function pegada(o: ArenaObject, barreiraX: number): Pegada {
  const base = o.base ?? o.y + o.h;
  const recuo = Math.round(o.w * 0.15);   // a copa/borda larga nao conta, so o miolo
  return { x0: barreiraX + o.x + recuo, x1: barreiraX + o.x + o.w - recuo, y0: base - profPegada(o), y1: base + FOLGA_FRENTE };
}

/** zIndex do objeto: exatamente a linha do pe (base) */
export function zDoObjeto(o: ArenaObject): number { return o.base ?? o.y + o.h; }

/** o pe (y) cai em alguma faixa de pegada? (inimigo anda a largura toda) */
export function peBloqueado(pegadas: Pegada[], peY: number): boolean {
  for (const p of pegadas) if (peY >= p.y0 && peY <= p.y1) return true;
  return false;
}

/**
 * y (topo do sprite) de nascimento que nao poe o pe em nenhuma pegada.
 * Tenta o sorteio; se cair numa pegada, usa o y livre mais perto dentro da faixa.
 */
export function yLivre(pegadas: Pegada[], ySorteado: number, altura: number, minY: number, maxY: number): number {
  if (!pegadas.length || !peBloqueado(pegadas, ySorteado + altura)) return ySorteado;
  for (let d = 1; d <= maxY - minY; d++) {
    for (const y of [ySorteado - d, ySorteado + d]) {
      if (y < minY || y > maxY) continue;
      if (!peBloqueado(pegadas, y + altura)) return y;
    }
  }
  return ySorteado;   // faixa toda coberta (nao acontece nos cenarios atuais)
}

/**
 * Passo de desvio: se o pe (centro x, base y) esta dentro de uma pegada — ou
 * vai entrar nos proximos ANTECIPA_X px — desliza o y pra saida mais proxima.
 * Devolve o novo y (topo do sprite).
 */
export function desviar(pegadas: Pegada[], x: number, y: number, largura: number, altura: number, passo: number, minY: number, maxY: number): number {
  const cx = x + largura / 2, pe = y + altura;
  for (const p of pegadas) {
    if (cx < p.x0 || cx > p.x1 + ANTECIPA_X) continue;
    if (pe < p.y0 || pe > p.y1) continue;
    const acima = p.y0 - 1 - altura, abaixo = p.y1 + 1 - altura;
    let alvo = (pe - p.y0) < (p.y1 - pe) ? acima : abaixo;
    if (alvo < minY) alvo = abaixo;
    if (alvo > maxY) alvo = acima;
    const d = alvo - y;
    return Math.abs(d) <= passo ? alvo : y + Math.sign(d) * passo;
  }
  return y;
}
