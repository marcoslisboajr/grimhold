// Ossoth, Xama das Cinzas (Ato VII, onda 30): enquanto vivo, o primeiro "gigante" que morrer
// (lobo*, javali*, raptor*, lagarto*, tribo_*, alfa_matilha, chefe_tribal) ressuscita uma vez com 50% da
// vida (cinzas): a 1a morte paga normal e volta uma copia que nao paga (morteSemRecompensa). Depois disso, a cada
// 20 s pode ressuscitar o proximo. Vigia a morte dos outros (vigiarMorte, index.ts).
import type { ModuloChefe } from './tipos';
import { centro } from './util';
import { tirarUivo } from './alfa_matilha';

export const OSSOTH_VIDA = 0.5, OSSOTH_CADA = 20000;
export function ehGigante(tipo: string): boolean {
  return tipo.startsWith('lobo') || tipo.startsWith('javali') || tipo.startsWith('raptor') || tipo.startsWith('lagarto')
    || tipo.startsWith('tribo_') || tipo === 'alfa_matilha' || tipo === 'chefe_tribal';
}

export const ossoth: ModuloChefe = {
  vigiarMorte(ctx, eu, morto) {
    const x = eu as any, m = morto as any;
    if (!ehGigante(morto.type as string) || m._ossothRevivido || m._semRecompensa) return;
    if (x._ossothProximo !== undefined && ctx.agora < x._ossothProximo) return;
    x._ossothProximo = ctx.agora + OSSOTH_CADA;
    // o morto ja pagou (o jogo paga depois de despacharMorte); volta uma copia que nao paga de novo
    const hp = Math.max(1, Math.ceil(morto.maxHp * OSSOTH_VIDA));
    const c: any = { ...m, id: ctx.novoId(), position: { ...morto.position }, hp, bleedStacks: 0,
      _ossothRevivido: true, _semRecompensa: true, reward: 0,
      _chefeMorto: undefined, _chefeHp: undefined, _chefeT: undefined };
    tirarUivo(c);   // copia nasce sem o uivo
    if (Array.isArray(m._tribalChamou)) c._tribalChamou = [...m._tribalChamou];
    ctx.adicionarInimigo(c);
    const p = centro(morto);
    for (let k = 0; k < 5; k++) ctx.efeito(p.x + (k - 2) * 14, p.y - 10 - (k % 2) * 12, '☁', '#a8a29e', 45);
  },
};
