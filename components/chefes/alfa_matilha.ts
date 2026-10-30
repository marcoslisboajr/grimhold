// Alfa da Matilha (Ato VII, onda 15): Uivo. A cada 12 s os lobos em campo (lobo*, tribo_lobo*)
// ganham +30% de velocidade e +20% de dano por 5 s (expira do lado do lobo, como o canal do
// cultista vermelho). A 50% de vida chama 2 lobos. Nao fala.
import type { Enemy } from '../../types';
import type { ModuloChefe } from './tipos';
import { centro, invocar } from './util';

export const UIVO_CADA = 12000, UIVO_DURA = 5000, UIVO_VEL = 1.3, UIVO_DANO = 1.2;
export const ehLobo = (tipo: string) => tipo.startsWith('lobo') || tipo.startsWith('tribo_lobo');

export function tirarUivo(e: Enemy) {
  const x = e as any;
  if (!x._uivo) return;
  // tira so o multiplicador: o que mais mudou velocidade/dano nesses 5 s continua valendo
  e.speed /= UIVO_VEL; e.damage /= UIVO_DANO; x._uivo = false; x._uivoAte = 0;
}
// Chamado para todo inimigo a cada quadro (despacharQuadro): o reforco some sozinho
export function expirarUivo(e: Enemy, agora: number) { const x = e as any; if (x._uivo && (x._uivoAte ?? 0) <= agora) tirarUivo(e); }

export const alfaMatilha: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0) return;
    const c = centro(chefe);
    if (!x._alfaChamou && chefe.hp < chefe.maxHp * 0.5) {
      x._alfaChamou = true;
      for (const dy of [-80, 80]) ctx.adicionarInimigo(invocar(ctx, chefe, 'lobo', c.x + 40, c.y + dy));
    }
    if (chefe.position.x >= ctx.chegadaX) return;   // uivo so depois de chegar
    x._uivoT = (x._uivoT ?? 0) + dt;
    if (x._uivoT < UIVO_CADA) return;
    x._uivoT -= UIVO_CADA;
    for (const e of ctx.inimigos) {
      if (e.hp <= 0 || !ehLobo(e.type as string)) continue;
      const w = e as any;
      if (!w._uivo) { w._uivo = true; e.speed *= UIVO_VEL; e.damage *= UIVO_DANO; }
      w._uivoAte = ctx.agora + UIVO_DURA;
      const ce = centro(e); ctx.efeito(ce.x, ce.y - e.height / 2, '»', '#fbbf24', 30);
    }
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '♫', '#fbbf24', 45);
  },
};
