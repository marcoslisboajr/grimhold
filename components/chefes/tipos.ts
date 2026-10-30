// Contrato dos modulos de chefe (spec 2026-09-26-atos-vi-x-design.md). Cada chefe com
// habilidade nova ganha um arquivo em components/chefes/ e se registra em index.ts.
// Os modulos tambem servem para habilidades de inimigos comuns (registro por tipo).
import type { Enemy, Ally } from '../../types';

export interface CtxChefe {
  agora: number;                                  // timestamp do loop (ms, tempo virtual)
  inimigos: Enemy[];
  aliados: Ally[];
  adicionarInimigo: (e: Enemy) => void;
  falar: (chefe: Enemy, modo: 'chegada' | 'meio' | 'morte') => void;
  // Etapa 1b
  novoId: () => string;                           // id unico para inimigo invocado
  muralhaX: number;                               // x da muralha (inimigo para em muralhaX + largura/2)
  chegadaX: number;                               // x a partir do qual o chefe "chegou" (balao de chegada)
  posAliado: (a: Ally) => { x: number; y: number };
  ferirAliado: (a: Ally, dano: number, cor?: string) => void;
  ferirMuralha: (dano: number) => void;
  efeito: (x: number, y: number, texto: string, cor: string, vida?: number) => void;   // texto flutuante curto
  // Etapa 1c (Ato VII)
  grade: { cols: number; rows: number };          // grade dos herois (col cols-1 = Vanguarda, colada na muralha)
  moverAliado: (a: Ally, col: number, row: number) => void;   // o modulo ja checou que a celula esta livre
  atordoarAliado: (a: Ally, ate: number) => void;              // heroi nao age ate 'ate' (tempo virtual)
  // Etapa 3a (Ato V refeito, Tesoureiro): ouro da run. Opcionais: sem eles o modulo nao mexe no ouro
  ouro?: () => number;
  mudarOuro?: (delta: number) => void;
  // Etapa 3b (A Fome, luta final do X). Opcionais: sem eles o modulo nao fecha a run nem troca o cenario
  fimDaCampanha?: () => void;                     // Coracao morto: o jogo fecha a campanha (epilogos etc.)
  trocarArena?: (final: boolean) => void;         // true = interior da Fome (ato.lutaFinal)
  dizer?: (chave: string, nome: string) => void;  // balao de fala sem inimigo (chave i18n)
}
export interface ModuloChefe {
  aoNascer?(ctx: CtxChefe, chefe: Enemy): void;
  aCadaQuadro?(ctx: CtxChefe, chefe: Enemy, dt: number): void;
  aoTomarDano?(ctx: CtxChefe, chefe: Enemy, dano: number): number;   // devolve o dano que fica (0 = imune)
  // chamado quando a vida chega a 0, ANTES do jogo contar a morte; true = nao morre (o modulo repoe a vida)
  antesDeMorrer?(ctx: CtxChefe, chefe: Enemy): boolean;
  aoMorrer?(ctx: CtxChefe, chefe: Enemy): void;
  // Etapa 1c: tiro do inimigo em heroi. escolherAlvo recebe os herois no alcance (ja filtrados pelo
  // jogo) e pode trocar o alvo; danoEmAliado pode mudar o dano do tiro (ex.: critico)
  escolherAlvo?(ctx: CtxChefe, chefe: Enemy, candidatos: Ally[]): Ally | undefined;
  danoEmAliado?(ctx: CtxChefe, chefe: Enemy, alvo: Ally, dano: number): number;
  // Vigia: chamado quando OUTRO inimigo morreu de vez (despacharMorte, antes do jogo pagar o abate
  // dele); o vigia pode por uma copia em campo (ex.: Ossoth), marcada _semRecompensa
  vigiarMorte?(ctx: CtxChefe, eu: Enemy, morto: Enemy): void;
  // Etapa 3a: chefe acertou a muralha (GameCanvas, golpe de chefe parado na muralha), com o dano que ficou
  aoAcertarMuralha?(ctx: CtxChefe, eu: Enemy, dano: number): void;
  // Etapa 3a: saiu de campo SEM morrer (varrerSaidas) — ex.: o Tesoureiro devolve o ouro roubado
  aoSair?(ctx: CtxChefe, eu: Enemy): void;
}
