import { test } from 'node:test';
import assert from 'node:assert/strict';
import { registrarChefe, despacharNascer, despacharQuadro, despacharMorte } from '../../components/chefes';
import type { CtxChefe } from '../../components/chefes/tipos';

const ctx = (agora: number): CtxChefe => ({ agora, inimigos: [], aliados: [], adicionarInimigo: () => {}, falar: () => {},
  novoId: () => 'x', muralhaX: 0, chegadaX: 9999, posAliado: () => ({ x: 0, y: 0 }), ferirAliado: () => {}, ferirMuralha: () => {}, efeito: () => {},
  grade: { cols: 4, rows: 8 }, moverAliado: () => {}, atordoarAliado: () => {} });
const chefe = () => ({ id: 'e1', type: 'teste_chefe', hp: 100, maxHp: 100 } as any);

test('tipo sem modulo nao faz nada', () => {
  const e = { ...chefe(), type: 'goblin' };
  despacharNascer(ctx(0), e); despacharQuadro(ctx(0), e); despacharMorte(ctx(0), e);
  assert.equal(e.hp, 100);
});
test('nascer, quadro com dt e morrer sao chamados', () => {
  const log: string[] = [];
  registrarChefe('teste_chefe', {
    aoNascer: () => log.push('nasceu'),
    aCadaQuadro: (_c, _e, dt) => log.push(`q${dt}`),
    aoMorrer: () => log.push('morreu'),
  });
  const e = chefe();
  despacharNascer(ctx(0), e); despacharQuadro(ctx(1000), e); despacharQuadro(ctx(1016), e); despacharMorte(ctx(1016), e);
  assert.deepEqual(log, ['nasceu', 'q0', 'q16', 'morreu']);
});
test('aoTomarDano pode anular o dano (imune)', () => {
  registrarChefe('teste_imune', { aoTomarDano: () => 0 });
  const e = { ...chefe(), type: 'teste_imune' };
  despacharQuadro(ctx(0), e);
  e.hp = 60;                                  // levou 40 entre um quadro e outro
  despacharQuadro(ctx(16), e);
  assert.equal(e.hp, 100);
});
test('aoTomarDano pode reduzir pela metade', () => {
  registrarChefe('teste_meio', { aoTomarDano: (_c, _e, d) => d / 2 });
  const e = { ...chefe(), type: 'teste_meio' };
  despacharQuadro(ctx(0), e); e.hp = 60; despacharQuadro(ctx(16), e);
  assert.equal(e.hp, 80);
});
test('aoMorrer so dispara uma vez mesmo com dois caminhos de morte chamando despacharMorte', () => {
  const log: string[] = [];
  registrarChefe('teste_morte_dupla', { aoMorrer: () => log.push('morreu') });
  const e = { ...chefe(), type: 'teste_morte_dupla' };
  despacharMorte(ctx(0), e);   // ex: caminho do bleed/DoT
  despacharMorte(ctx(0), e);   // ex: caminho do projetil, mesmo quadro
  assert.deepEqual(log, ['morreu']);
});
