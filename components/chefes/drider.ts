// A Rainha Drider (Ato IX, onda 15): Teia. Um fio de teia liga o topo da arena (y = 0, na mesma x)
// as costas dela o tempo todo (o GameCanvas desenha pelo index.fioDe). Ciclo:
//   desce 1,5 s (pendurada, do topo ate a fileira em que nasceu) -> embaixo 8 s (anda e ataca
//   normal) -> sobe 1,5 s ate o topo -> em cima 4 s: fora de alcance (_semAlvo), nao ataca, nao
//   toma dano, e solta 2 crias (aranha*) que descem pelo fio ate o chao -> desce de novo.
// Enquanto sobe/esta em cima nao avanca em x. Crias nao pagam nada (_semRecompensa).
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro, invocar, instalarReducao } from './util';
import { ARANHAS } from './comuns9';

export const DRIDER_DESCE = 1500, DRIDER_EMBAIXO = 8000, DRIDER_SOBE = 1500, DRIDER_CIMA = 4000;
export const DRIDER_TOPO = 0;          // y do topo do sprite quando esta em cima
export const DRIDER_CRIAS = 2;
export const CRIA_MOB = { hp: 5.0, dano: 34, vel: 1.40, raio: 20 };
export type FaseDrider = 'desce' | 'embaixo' | 'sobe' | 'cima';

const lerp = (a: number, b: number, f: number) => a + (b - a) * Math.max(0, Math.min(1, f));
const emCima = (e: Enemy) => !!(e as any)._semAlvo;

function soltarCrias(ctx: CtxChefe, chefe: Enemy) {
  const x = chefe as any, c = centro(chefe);
  for (let k = 0; k < DRIDER_CRIAS; k++) {
    const tipo = ARANHAS[Math.floor(Math.random() * ARANHAS.length)];
    const a = invocar(ctx, chefe, tipo, c.x + (k ? 18 : -18), c.y, CRIA_MOB) as any;
    a._semRecompensa = true; a.reward = 0;               // invocada nao paga (senao da pra farmar)
    a._desceX = a.position.x;
    a._desceAte = x._yBase + chefe.height / 2 + (k ? 50 : -50);   // chao: a fileira da Drider
    ctx.adicionarInimigo(a);
  }
  ctx.efeito(c.x, c.y + chefe.height / 2, '🕷', '#e7e5e4', 40);
}

export const drider: ModuloChefe = {
  aoNascer(_ctx, chefe) {
    const x = chefe as any;
    x._fio = true;
    x._yBase = chefe.position.y;
    x._fase = 'desce'; x._faseT = 0; x._yIni = DRIDER_TOPO;
    chefe.position.y = DRIDER_TOPO;
    x._falouMeio = true;   // a fala do meio vem na primeira subida (as crias), nao aos 50%
    instalarReducao(chefe, e => emCima(e) ? 0 : 1);
  },
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    instalarReducao(chefe, e => emCima(e) ? 0 : 1);
    if (chefe.hp <= 0 || !x._fase) return;
    x._faseT += dt;
    switch (x._fase as FaseDrider) {
      case 'desce':
        chefe.position.y = lerp(x._yIni, x._yBase, x._faseT / DRIDER_DESCE);
        if (x._faseT >= DRIDER_DESCE) { x._fase = 'embaixo'; x._faseT -= DRIDER_DESCE; }
        break;
      case 'embaixo':
        if (x._faseT >= DRIDER_EMBAIXO) {
          x._fase = 'sobe'; x._faseT -= DRIDER_EMBAIXO;
          x._yIni = chefe.position.y; x._xFixo = chefe.position.x;
          x._semAtacarAte = ctx.agora + DRIDER_SOBE + DRIDER_CIMA;   // subindo/em cima nao ataca
        }
        break;
      case 'sobe':
        chefe.position.x = x._xFixo;
        chefe.position.y = lerp(x._yIni, DRIDER_TOPO, x._faseT / DRIDER_SOBE);
        if (x._faseT >= DRIDER_SOBE) {
          x._fase = 'cima'; x._faseT -= DRIDER_SOBE;
          chefe.position.y = DRIDER_TOPO;
          x._semAlvo = true;
          soltarCrias(ctx, chefe);
          if (!x._falouCrias) { x._falouCrias = true; ctx.falar(chefe, 'meio'); }
        }
        break;
      case 'cima':
        chefe.position.x = x._xFixo;
        chefe.position.y = DRIDER_TOPO;
        if (x._faseT >= DRIDER_CIMA) {
          x._fase = 'desce'; x._faseT -= DRIDER_CIMA;
          x._semAlvo = false; x._yIni = DRIDER_TOPO;
        }
        break;
    }
  },
};
