// Registro e despacho dos modulos de chefe. O GameCanvas chama despachar* em 3 lugares:
// spawnEnemy (nascer), loop por inimigo (quadro + dano) e limpeza dos mortos (morte).
// O dano e detectado pela diferenca de vida entre quadros (o jogo aplica dano em muitos lugares).
import type { Enemy, Ally } from '../../types';
import type { CtxChefe, ModuloChefe } from './tipos';
import { expirarCanal } from './comuns6';
import { expirarUivo } from './alfa_matilha';

export const MODULOS_CHEFE: Record<string, ModuloChefe> = {};
export function registrarChefe(tipo: string, m: ModuloChefe) { MODULOS_CHEFE[tipo] = m; }

// Inimigos cujo modulo tem aoSair: acompanhados ate sairem de campo (varrerSaidas)
const ACOMPANHADOS = new Set<Enemy>();
const acompanhar = (e: Enemy) => { if (MODULOS_CHEFE[e.type as string]?.aoSair) ACOMPANHADOS.add(e); };
export function despacharNascer(ctx: CtxChefe, e: Enemy) {
  acompanhar(e);
  MODULOS_CHEFE[e.type as string]?.aoNascer?.(ctx, e);
}
export function despacharQuadro(ctx: CtxChefe, e: Enemy) {
  expirarCanal(e, ctx.agora);   // canal do cultista vermelho (qualquer tipo)
  expirarUivo(e, ctx.agora);    // uivo do Alfa da Matilha (lobos)
  const m = MODULOS_CHEFE[e.type as string]; if (!m) return;
  if (m.aoSair) ACOMPANHADOS.add(e);
  const x = e as any;
  if (x._chefeHp !== undefined && m.aoTomarDano && e.hp < x._chefeHp) {
    const queda = x._chefeHp - e.hp;
    const fica = Math.max(0, Math.min(queda, m.aoTomarDano(ctx, e, queda)));
    e.hp += queda - fica;
  }
  const dt = x._chefeT === undefined ? 0 : ctx.agora - x._chefeT;
  x._chefeT = ctx.agora;
  m.aCadaQuadro?.(ctx, e, dt);
  x._chefeHp = e.hp;
}
// Vida chegou a 0: o modulo pode cancelar a morte (renascer, regente imune). Sem modulo: false.
export function despacharEvitarMorte(ctx: CtxChefe, e: Enemy): boolean {
  const m = MODULOS_CHEFE[e.type as string];
  if (!m?.antesDeMorrer || (e as any)._chefeMorto) return false;
  if (!m.antesDeMorrer(ctx, e)) return false;
  (e as any)._chefeHp = e.hp;   // a vida reposta nao conta como cura no proximo quadro
  return true;
}
// Tiro de inimigo em heroi (GameCanvas, ataque a distancia): alvo e dano pelo modulo, se houver
export function despacharAlvo(ctx: CtxChefe, e: Enemy, candidatos: Ally[]): Ally | undefined {
  return candidatos.length ? MODULOS_CHEFE[e.type as string]?.escolherAlvo?.(ctx, e, candidatos) : undefined;
}
export function despacharDanoEmAliado(ctx: CtxChefe, e: Enemy, alvo: Ally, dano: number): number {
  const f = MODULOS_CHEFE[e.type as string]?.danoEmAliado;
  return f ? f(ctx, e, alvo, dano) : dano;
}
// Inimigo que nao pode ser alvo agora (Ato VIII: mergulho da Serpente Ancia, Kraken submerso): o
// GameCanvas pula na escolha de alvo dos herois; o dano que chegar assim mesmo o modulo anula
export { multiplicadorDano } from './util';
export const podeSerAlvo = (e: Enemy) => !(e as any)._semAlvo;
// Vida que a barra de chefe mostra (Ato IX: as Estatuas mostram a soma das duas em cada uma); sem
// modulo: a vida do proprio inimigo
export function vidaNaBarra(e: Enemy): { hp: number; max: number } {
  const b = (e as any)._barra;
  return b ? b() : { hp: e.hp, max: e.maxHp };
}
// Nome da barra de chefe quando nao e o do tipo (Etapa 3b: os Pontos Fracos mostram "A Fome"): chave i18n
export const nomeNaBarra = (e: Enemy): string | undefined => (e as any)._nomeBarraChave;
// Fio de teia (Ato IX, Drider): do topo da arena (y = 0, mesma x) as costas dela, em coordenadas do
// campo. O GameCanvas so desenha o que vier daqui (undefined = sem fio)
export function fioDe(e: Enemy): { x: number; y0: number; y1: number } | undefined {
  if (!(e as any)._fio || e.hp <= 0) return undefined;
  return { x: e.position.x + e.width / 2, y0: 0, y1: e.position.y + e.height * 0.3 };
}
// Morte que nao paga nada (coristas revividos do Coro): o GameCanvas so tira do campo
export const morteSemRecompensa = (e: Enemy) => !!(e as any)._semRecompensa;
// Chefe acertou a muralha (Ato V refeito: o Tesoureiro rouba ouro)
export function despacharAcertoMuralha(ctx: CtxChefe, e: Enemy, dano: number) {
  MODULOS_CHEFE[e.type as string]?.aoAcertarMuralha?.(ctx, e, dano);
}
// Intervalo de ataque do heroi (Ato V refeito: grito do Capitao de Ashfen, furia do Gorak): o GameCanvas multiplica
export { intervaloAtaqueAliado } from './capitao_ashfen';
// Uma vez por quadro (GameCanvas): quem saiu da lista de inimigos sem passar por despacharMorte
// (qualquer caminho que tire o inimigo sem contar a morte) recebe aoSair, uma vez.
export function varrerSaidas(ctx: CtxChefe) {
  for (const e of [...ACOMPANHADOS]) {
    if (ctx.inimigos.includes(e)) continue;
    ACOMPANHADOS.delete(e);
    const x = e as any;
    if (x._chefeMorto || x._saiu) continue;
    x._saiu = true;
    MODULOS_CHEFE[e.type as string]?.aoSair?.(ctx, e);
  }
}
// Run nova (o campo e zerado): esquece os acompanhados sem chamar aoSair (nada volta para a run nova)
export function esquecerSaidas() { ACOMPANHADOS.clear(); }
export function despacharMorte(ctx: CtxChefe, e: Enemy) {
  const x = e as any;
  if (x._chefeMorto) return;   // ja despachado por outro caminho de morte (bleed/DoT/projetil): so uma vez
  x._chefeMorto = true;
  ACOMPANHADOS.delete(e);
  MODULOS_CHEFE[e.type as string]?.aoMorrer?.(ctx, e);
  // vigias em campo (Ossoth): o morto paga normalmente; o vigia pode trazer uma copia sem recompensa
  for (const v of [...ctx.inimigos]) {
    if (v === e || v.hp <= 0) continue;
    MODULOS_CHEFE[v.type as string]?.vigiarMorte?.(ctx, v, e);
  }
}
