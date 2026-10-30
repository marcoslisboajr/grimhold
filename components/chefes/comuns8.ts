// Habilidades dos comuns do Ato VIII (registradas por tipo como os chefes).
import type { ModuloChefe } from './tipos';
import { centro, dist2, reduzirDano } from './util';

// Agua-viva da Fenda (voa: ehVoador): ao morrer, choque — a carga volta pela linha do tiro: centrado
// no ultimo heroi que ela mirou (danoEmAliado guarda o alvo), atordoa 0,5 s esse heroi e os herois a
// ate 80 px dele. Sem alvo ainda: centrado nela mesma. Uma vez: aoMorrer so roda uma vez (_chefeMorto).
export const CHOQUE_RAIO = 80, CHOQUE_ATORDOA = 500;
export const aguaViva: ModuloChefe = {
  danoEmAliado(_ctx, eu, alvo, dano) { (eu as any)._ultimoAlvo = alvo; return dano; },
  aoMorrer(ctx, eu) {
    const ult = (eu as any)._ultimoAlvo;
    const c = ult && ult.hp > 0 && ctx.aliados.includes(ult) ? ctx.posAliado(ult) : centro(eu);
    for (const a of ctx.aliados) {
      if (a.hp <= 0 || dist2(c, ctx.posAliado(a)) > CHOQUE_RAIO * CHOQUE_RAIO) continue;
      ctx.atordoarAliado(a, ctx.agora + CHOQUE_ATORDOA);
      const p = ctx.posAliado(a); ctx.efeito(p.x, p.y - 30, 'ϟ', '#22d3ee', 22);
    }
    ctx.efeito(c.x, c.y - 20, '✺', '#67e8f9', 20);
  },
};

// Tartaruga-Couraca: recebe 35% menos dano de tudo.
export const COURACA_FICA = 0.65;
export const tartaruga: ModuloChefe = reduzirDano(() => COURACA_FICA);
