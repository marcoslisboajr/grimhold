// O Coro (Ato VI, onda 10): o regente (tipo 'coro') nasce com 8 coristas em circulo andando juntos.
// Quando um corista morre abre uma janela de 5 s: se os 8 morrerem dentro dela o Coro cai; senao os
// mortos voltam com 50% da vida ao fim da janela. O regente e imune com qualquer corista vivo e a
// vida dele e a soma da vida dos coristas (a barra de chefe mostra isso).
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro, invocar } from './util';

export const CORO_MEMBROS = 8;
export const CORO_RAIO = 90;
export const CORO_JANELA = 5000;
export const CORO_REVIVE = 0.5;
export const CORO_GIRO = 0.00035;   // rad/ms

interface EstadoCoro { membros: Enemy[]; mortos: boolean[]; janelaAte: number; giro: number; caiu?: boolean }
const est = (chefe: Enemy): EstadoCoro | undefined => (chefe as any)._coro;
const morto = (ctx: CtxChefe, m: Enemy) => m.hp <= 0 || !ctx.inimigos.includes(m);

function posSlot(chefe: Enemy, s: EstadoCoro, i: number) {
  const c = centro(chefe), a = s.giro + (i / CORO_MEMBROS) * Math.PI * 2;
  return { x: c.x + Math.cos(a) * CORO_RAIO, y: c.y + Math.sin(a) * CORO_RAIO };
}
function novoMembro(ctx: CtxChefe, chefe: Enemy, s: EstadoCoro, i: number, hpBase: number): Enemy {
  const p = posSlot(chefe, s, i);
  const m = invocar(ctx, chefe, 'coro_cultista', p.x, p.y, { hp: 1, dano: 32, vel: 1, raio: 26 });
  m.hp = m.maxHp = hpBase;
  (m as any)._coroRegente = chefe.id;
  return m;
}

export const coro: ModuloChefe = {
  aoNascer(ctx, chefe) {
    const s: EstadoCoro = { membros: [], mortos: [], janelaAte: 0, giro: 0 };
    (chefe as any)._coro = s;
    const hpMembro = Math.max(1, Math.ceil(chefe.maxHp / CORO_MEMBROS));
    for (let i = 0; i < CORO_MEMBROS; i++) {
      const m = novoMembro(ctx, chefe, s, i, hpMembro);
      s.membros.push(m); s.mortos.push(false);
      ctx.adicionarInimigo(m);
    }
    chefe.maxHp = chefe.hp = hpMembro * CORO_MEMBROS;
  },
  aCadaQuadro(ctx, chefe, dt) {
    const s = est(chefe); if (!s || s.caiu) return;
    s.giro += dt * CORO_GIRO;
    for (let i = 0; i < CORO_MEMBROS; i++) {
      if (!s.mortos[i] && morto(ctx, s.membros[i])) {
        s.mortos[i] = true;
        if (!s.janelaAte) s.janelaAte = ctx.agora + CORO_JANELA;
      }
    }
    if (s.mortos.every(Boolean)) {   // os 8 caidos dentro da janela: o Coro cai
      s.caiu = true; chefe.hp = 0; return;
    }
    if (s.janelaAte && ctx.agora >= s.janelaAte) {   // janela fechou sem todos mortos: revivem
      s.janelaAte = 0;
      for (let i = 0; i < CORO_MEMBROS; i++) if (s.mortos[i]) {
        const velho = s.membros[i];
        const m = novoMembro(ctx, chefe, s, i, velho.maxHp);
        m.hp = Math.max(1, Math.ceil(velho.maxHp * CORO_REVIVE));
        (m as any)._semRecompensa = true; m.reward = 0;   // revivido nao paga abate (senao da pra farmar)
        s.membros[i] = m; s.mortos[i] = false;
        ctx.adicionarInimigo(m);
        const c = centro(m); ctx.efeito(c.x, c.y - 20, '✚', '#93c5fd', 40);
      }
    }
    // coristas andam com o regente (em circulo), sem passar da muralha
    for (let i = 0; i < CORO_MEMBROS; i++) {
      if (s.mortos[i]) continue;
      const m = s.membros[i], p = posSlot(chefe, s, i);
      m.position.x = Math.max(ctx.muralhaX + m.width / 2, p.x - m.width / 2);
      m.position.y = p.y - m.height / 2;
    }
    chefe.hp = s.membros.reduce((t, m, i) => t + (s.mortos[i] ? 0 : Math.max(0, m.hp)), 0);
    const x = chefe as any;
    if (!x._falouMeio && chefe.hp < chefe.maxHp * 0.5) { x._falouMeio = true; ctx.falar(chefe, 'meio'); }
  },
  aoTomarDano(ctx, chefe, dano) {
    const s = est(chefe); if (!s) return dano;
    return s.membros.some((m, i) => !s.mortos[i] && !morto(ctx, m)) ? 0 : dano;
  },
  antesDeMorrer(ctx, chefe) {
    const s = est(chefe); if (!s || s.caiu) return false;
    const vivos = s.membros.filter((m, i) => !s.mortos[i] && !morto(ctx, m));
    if (!vivos.length) return false;
    chefe.hp = Math.max(1, vivos.reduce((t, m) => t + m.hp, 0));
    return true;
  },
  aoMorrer(ctx, chefe) {   // o Coro caiu: quem sobrou do circulo cai junto
    const s = est(chefe); if (!s) return;
    s.caiu = true;
    s.membros.forEach(m => { if (m.hp > 0 && ctx.inimigos.includes(m)) m.hp = 0; });
  },
};
