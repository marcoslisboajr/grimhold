// Estatuas do Leste e do Oeste (Ato IX, onda 20): luta dupla. Ao nascer, a Leste cria a Oeste ~160 px
// abaixo (acima, se nao couber); as duas andam. Enquanto as duas estao de pe, a cada 3 s cada uma cura
// a outra em 3% da vida maxima (efeito dourado ligando as duas). Quando uma cai, abre uma janela de
// 8 s: se a outra cair dentro dela, as duas morrem de vez; senao a caida volta com 40% da vida e a
// janela recomeca na proxima queda. A barra de chefe mostra a vida somada (index.vidaNaBarra).
//
// A queda nao e morte: o setter da vida (como o util.instalarReducao) segura a estatua em 1 de vida
// no golpe que a zeraria — nenhum lugar do jogo ve hp <= 0, nada paga abate, nada de "ao matar".
// Caida: parada, sem alvo, sem atacar e imune ate voltar. Cada estatua paga o abate uma vez so,
// quando as duas caem de vez (a volta nao e um novo inimigo: nao da pra farmar).
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro } from './util';
import { SPAWN_MAX_Y, SPAWN_MIN_Y } from '../systems/combat';

export const ESTATUA_DISTANCIA = 160, ESTATUA_CURA_CADA = 3000, ESTATUA_CURA = 0.03;
export const ESTATUA_JANELA = 8000, ESTATUA_VOLTA = 0.4, ESTATUA_FALA_OESTE = 4000;

export interface ParEstatuas { leste: Enemy; oeste: Enemy; caida?: Enemy; janelaAte: number; fim: boolean; agora: number; curaT: number }
export const parDe = (e: Enemy): ParEstatuas | undefined => (e as any)._par;
const outraDo = (p: ParEstatuas, e: Enemy) => e === p.leste ? p.oeste : p.leste;
const dePe = (p: ParEstatuas, e: Enemy) => e.hp > 0 && p.caida !== e;

function instalarPedra(e: Enemy, p: ParEstatuas) {
  const x = e as any;
  x._par = p;
  let v = e.hp;
  Object.defineProperty(e, 'hp', {
    enumerable: true, configurable: true,
    get: () => v,
    set: (n: number) => {
      if (p.fim || n >= v) { v = n; return; }       // cura, reposicao, ou ja e o fim
      if (p.caida === e) return;                      // caida: imune ate voltar
      if (n > 0) { v = n; return; }
      const outra = outraDo(p, e);
      if (p.caida === outra) {                        // a segunda caiu dentro da janela: fim das duas
        p.fim = true; v = n; outra.hp = 0; return;
      }
      if (outra.hp <= 0) { v = n; return; }
      v = 1;                                           // cai (nao morre)
      p.caida = e; p.janelaAte = p.agora + ESTATUA_JANELA;
      x._semAlvo = true; x._semAtacarAte = p.janelaAte;
      x._quedaX = e.position.x; x._quedaY = e.position.y;
    },
  });
}

export function vidaDoPar(p: ParEstatuas) {
  const hp = [p.leste, p.oeste].reduce((t, m) => t + (dePe(p, m) ? Math.max(0, m.hp) : 0), 0);
  return { hp, max: p.leste.maxHp + p.oeste.maxHp };
}

function curaDourada(ctx: CtxChefe, p: ParEstatuas) {
  const a = centro(p.leste), b = centro(p.oeste);
  for (let k = 1; k <= 5; k++) ctx.efeito(a.x + (b.x - a.x) * k / 6, a.y + (b.y - a.y) * k / 6, '•', '#fbbf24', 30);
  for (const m of [p.leste, p.oeste]) {
    m.hp = Math.min(m.maxHp, m.hp + m.maxHp * ESTATUA_CURA);
    const c = centro(m); ctx.efeito(c.x, c.y - m.height / 2, '✚', '#fbbf24', 35);
  }
}

export const estatuas: ModuloChefe = {
  aoNascer(ctx, leste) {
    if (leste.type !== 'estatua_leste' || parDe(leste)) return;
    let y = leste.position.y + ESTATUA_DISTANCIA;
    if (y > SPAWN_MAX_Y) y = Math.max(SPAWN_MIN_Y, leste.position.y - ESTATUA_DISTANCIA);
    // copia profunda do que nao for funcao: nada aninhado (status, elite, listas) fica compartilhado com a Leste
    const oeste = structuredClone(Object.fromEntries(Object.entries(leste).filter(([, v]) => typeof v !== 'function'))) as Enemy;
    Object.assign(oeste, { id: ctx.novoId(), type: 'estatua_oeste', position: { x: leste.position.x + 30, y } });
    const p: ParEstatuas = { leste, oeste, janelaAte: 0, fim: false, agora: ctx.agora, curaT: 0 };
    instalarPedra(leste, p); instalarPedra(oeste, p);
    for (const m of [leste, oeste]) (m as any)._barra = () => vidaDoPar(p);
    (leste as any)._falouMeio = true;   // a fala do meio ("Irmao, de pe") vem quando a Oeste volta
    ctx.adicionarInimigo(oeste);
  },
  aCadaQuadro(ctx, e, dt) {
    const p = parDe(e); if (!p || p.fim) return;
    p.agora = ctx.agora;
    const x = e as any;
    if (p.caida === e) {
      e.position.x = x._quedaX; e.position.y = x._quedaY;   // caida fica onde caiu
      if (ctx.agora < p.janelaAte) return;
      p.caida = undefined; x._semAlvo = false; x._semAtacarAte = 0;   // janela fechou: volta
      e.hp = Math.max(1, Math.ceil(e.maxHp * ESTATUA_VOLTA));
      const c = centro(e); ctx.efeito(c.x, c.y - e.height / 2, '✚', '#fbbf24', 45);
      if (e === p.oeste && !(p.leste as any)._falouVolta && dePe(p, p.leste)) { (p.leste as any)._falouVolta = true; ctx.falar(p.leste, 'meio'); }
      return;
    }
    if (e !== p.leste) return;   // o resto (cura, fala da Oeste) roda uma vez por quadro, na Leste
    if (!x._chegouEm && e.position.x < ctx.chegadaX) x._chegouEm = ctx.agora;
    if (x._chegouEm && !x._oesteFalou && ctx.agora - x._chegouEm >= ESTATUA_FALA_OESTE && dePe(p, p.oeste)) { x._oesteFalou = true; ctx.falar(p.oeste, 'chegada'); }
    if (!dePe(p, p.leste) || !dePe(p, p.oeste)) { p.curaT = 0; return; }
    p.curaT += dt;
    if (p.curaT < ESTATUA_CURA_CADA) return;
    p.curaT -= ESTATUA_CURA_CADA;
    curaDourada(ctx, p);
  },
};
