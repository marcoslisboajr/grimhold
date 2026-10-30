// General de Ossos (Ato IX, onda 5): Formacao. Ao nascer e a cada 15 s chama um bloco de 6
// legionarios (variantes aleatorias) em 2 colunas x 3 linhas logo atras dele, andando juntos na
// velocidade do mais lento do bloco. Enquanto o bloco tiver 4+ vivos, cada membro recebe 40% menos
// dano (setter de vida do util.instalarReducao: a reducao entra antes da vida mudar). Membros pagam
// normal; morto o general, para de chamar (aCadaQuadro so roda com ele vivo).
import type { Enemy } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { centro, invocar, instalarReducao } from './util';

export const FORMACAO_MAX_BLOCOS = 4;   // teto por General (o do nascimento conta): membros pagam normal
export const FORMACAO_CADA = 15000, FORMACAO_N = 6, FORMACAO_MIN = 4, FORMACAO_FICA = 0.6;
export const LEGIOES = ['legiao', 'legiao_b', 'legiao_c', 'legiao_d', 'legiao_e'];
const PASSO = 56;

export const vivosDoBloco = (bloco: Enemy[]) => bloco.filter(m => m.hp > 0 && !(m as any)._chefeMorto).length;

export function chamarBloco(ctx: CtxChefe, chefe: Enemy): Enemy[] {
  const c = centro(chefe);
  const bloco: Enemy[] = [];
  for (let col = 0; col < 2; col++) for (let lin = 0; lin < 3; lin++) {
    const tipo = LEGIOES[Math.floor(Math.random() * LEGIOES.length)];
    bloco.push(invocar(ctx, chefe, tipo, c.x + chefe.width / 2 + 40 + col * PASSO, c.y + (lin - 1) * PASSO));
  }
  const vel = Math.min(...bloco.map(m => m.speed));
  for (const m of bloco) {
    m.speed = vel;
    (m as any)._bloco = bloco;
    instalarReducao(m, e => vivosDoBloco((e as any)._bloco) >= FORMACAO_MIN ? FORMACAO_FICA : 1);
    ctx.adicionarInimigo(m);
  }
  ((chefe as any)._blocos ??= []).push(bloco);
  ctx.efeito(c.x, c.y - chefe.height / 2 - 10, '⛨', '#d6d3d1', 40);
  return bloco;
}

export const generalOssos: ModuloChefe = {
  aoNascer(ctx, chefe) { chamarBloco(ctx, chefe); },
  aCadaQuadro(ctx, chefe, dt) {
    const x = chefe as any;
    if (chefe.hp <= 0 || (x._blocos?.length ?? 0) >= FORMACAO_MAX_BLOCOS) return;
    x._formT = (x._formT ?? 0) + dt;
    if (x._formT < FORMACAO_CADA) return;
    x._formT -= FORMACAO_CADA;
    chamarBloco(ctx, chefe);
  },
};
