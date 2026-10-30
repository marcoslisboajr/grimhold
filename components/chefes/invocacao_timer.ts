// Invocacao por timer (Ato V refeito): depois de chegar ao campo, a cada 'cada' ms o chefe chama 'n'
// inimigos (tipos sorteados de 'tipos') a frente dele. Por timer = sem recompensa (util.semRecompensa):
// senao da pra farmar segurando a onda. Morto o chefe, para (aCadaQuadro so roda com ele vivo).
// Teto: no maximo INVOCADOS_MAX invocados vivos por chefe; no teto, a chamada e pulada.
import type { ModuloChefe } from './tipos';
import { centro, invocar, semRecompensa } from './util';

export const INVOCADOS_MAX = 12;
export const invocadosVivos = (inimigos: { hp: number }[], chefe: object) =>
  inimigos.filter(e => e.hp > 0 && (e as any)._invocadoPor === chefe).length;

export function invocacaoPorTimer(tipos: string[], n: number, cada: number, simbolo: string, cor: string): ModuloChefe {
  return {
    aCadaQuadro(ctx, chefe, dt) {
      const x = chefe as any;
      if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;
      x._invT = (x._invT ?? 0) + dt;
      if (x._invT < cada) return;
      x._invT -= cada;
      const c = centro(chefe);
      const vagas = Math.min(n, INVOCADOS_MAX - invocadosVivos(ctx.inimigos, chefe));
      if (vagas <= 0) return;
      for (let k = 0; k < vagas; k++) {
        const tipo = tipos[Math.floor(Math.random() * tipos.length)];
        const dy = (k - (n - 1) / 2) * 64;
        const e = semRecompensa(invocar(ctx, chefe, tipo, c.x - chefe.width / 2 - 30, c.y + dy));
        (e as any)._invocadoPor = chefe;
        ctx.adicionarInimigo(e);
      }
      ctx.efeito(c.x, c.y - chefe.height / 2 - 10, simbolo, cor, 40);
    },
  };
}
