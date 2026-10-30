// Cultista-Mor (Ato VI, onda 5): a cada 10 s chama 3 cultistas comuns do bloco 1 em volta dele.
import type { ModuloChefe } from './tipos';
import { centro, invocar, semRecompensa } from './util';

export const CULTISTA_MOR_CADA = 10000;
export const CULTISTA_MOR_QTD = 3;
export const CULTISTA_MOR_RAIO = 80;
const CULTISTAS = ['cultista_vermelho', 'cultista_vermelho_b', 'cultista_branco', 'cultista_branco_b', 'cultista_verde', 'cultista_verde_b', 'cultista_negro', 'cultista_azul'];

export const cultistaMor: ModuloChefe = {
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0 || chefe.position.x >= ctx.chegadaX) return;   // so depois de entrar no campo
    x._morT = (x._morT ?? 0) + dt;
    if (x._morT < CULTISTA_MOR_CADA) return;
    x._morT -= CULTISTA_MOR_CADA;
    const c = centro(chefe);
    for (let k = 0; k < CULTISTA_MOR_QTD; k++) {
      const a = (k / CULTISTA_MOR_QTD) * Math.PI * 2 + Math.PI / 2;
      const tipo = CULTISTAS[Math.floor(Math.random() * CULTISTAS.length)];
      ctx.adicionarInimigo(semRecompensa(invocar(ctx, chefe, tipo, c.x + Math.cos(a) * CULTISTA_MOR_RAIO, c.y + Math.sin(a) * CULTISTA_MOR_RAIO)));
    }
    ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '✦', '#ef4444', 40);
  },
};
