// Habilidades dos comuns do Ato IX (registradas por tipo como os chefes).
import type { ModuloChefe } from './tipos';
import { reduzirDano } from './util';

// Estatua-Lamina: pele de pedra — recebe 25% menos dano de tudo (mesmo mecanismo da couraca do VIII).
export const PELE_DE_PEDRA_FICA = 0.75;
export const ESTATUAS_LAMINA = ['estatua_lamina', 'estatua_lamina_b', 'estatua_lamina_c'];
export const estatuaLamina: ModuloChefe = reduzirDano(() => PELE_DE_PEDRA_FICA);

// Cria da Drider (aranha*): so nasce invocada pela Drider (drider.ts), que marca _desceAte (y do
// centro no chao) e _desceX. Enquanto desce pelo fio fica na mesma x e nao ataca; no chao anda
// normal. Nao paga nada (_semRecompensa, marcado na invocacao).
export const ARANHA_DESCE_VEL = 0.3;   // px/ms
export const ARANHAS = ['aranha', 'aranha_b'];
export const aranha: ModuloChefe = {
  aCadaQuadro(ctx, eu, dt) {
    const x = eu as any;
    if (x._desceAte === undefined || eu.hp <= 0) return;
    eu.position.x = x._desceX;
    const alvoY = x._desceAte - eu.height / 2;
    eu.position.y = Math.min(alvoY, eu.position.y + ARANHA_DESCE_VEL * dt);
    x._semAtacarAte = ctx.agora + 100;
    if (eu.position.y >= alvoY) { x._desceAte = undefined; x._semAtacarAte = 0; }
  },
};
