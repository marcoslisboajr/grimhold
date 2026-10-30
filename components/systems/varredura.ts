// ══════════════════════════════════════════════════════════════════════
// varredura.ts — colisao de projetil por SEGMENTO (de onde estava ate onde chegou no quadro).
// Em velocidade alta (5x com queda de quadro, 10x/20x no DEV) o passo do projetil por quadro
// passa de 100-700 px, maior que o raio de acerto (24-40 px): testando so o ponto final, o tiro
// "atravessava" o alvo e seguia voando para tras dos herois (parecia um aliado atirando para tras).
// Aqui o teste usa o ponto do segmento mais proximo do alvo: em 1x (passo curto) da o mesmo
// resultado do teste de ponto; em velocidade alta nao perde mais o acerto.
// ══════════════════════════════════════════════════════════════════════

/** Posicao do inicio do quadro gravada no projetil antes de mover (ausente = teste de ponto). */
export interface ComRastro { position: { x: number; y: number }; _px?: number; _py?: number }

/**
 * Se o segmento (ax,ay)->(bx,by) passa a menos de `raio` do ponto (cx,cy), devolve o parametro
 * t em [0,1] do ponto mais proximo (0 = inicio do quadro, 1 = onde o projetil esta); senao null.
 */
export function contatoNoSegmento(ax: number, ay: number, bx: number, by: number, cx: number, cy: number, raio: number): number | null {
  const sx = bx - ax, sy = by - ay;
  const l2 = sx * sx + sy * sy;
  let t = l2 > 0 ? ((cx - ax) * sx + (cy - ay) * sy) / l2 : 1;
  if (t < 0) t = 0; else if (t > 1) t = 1;
  const dx = ax + sx * t - cx, dy = ay + sy * t - cy;
  return dx * dx + dy * dy < raio * raio ? t : null;
}

/** contatoNoSegmento usando o rastro do projetil (inicio do quadro -> posicao atual). */
export function contatoDoProjetil(p: ComRastro, cx: number, cy: number, raio: number): number | null {
  return contatoNoSegmento(p._px ?? p.position.x, p._py ?? p.position.y, p.position.x, p.position.y, cx, cy, raio);
}
