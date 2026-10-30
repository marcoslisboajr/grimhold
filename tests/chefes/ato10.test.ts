// Modulos do Ato X (Etapa 3a): so o tentaculo e novo.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { despacharNascer, despacharQuadro } from '../../components/chefes';
import '../../components/chefes/ato10';
import type { CtxChefe } from '../../components/chefes/tipos';

const ctx = (agora: number, inimigos: any[]): CtxChefe => ({
  agora, inimigos, aliados: [], adicionarInimigo: e => { inimigos.push(e); }, falar: () => {},
  novoId: () => 'n', muralhaX: 100, chegadaX: 1500, posAliado: () => ({ x: 0, y: 0 }),
  ferirAliado: () => {}, ferirMuralha: () => {}, efeito: () => {}, grade: { cols: 4, rows: 8 },
  moverAliado: () => {}, atordoarAliado: () => {},
});

test('tentaculo: nasce entre 35% e 60% do campo e nao se move', () => {
  for (let k = 0; k < 50; k++) {
    const e: any = { id: 't', type: k % 2 ? 'tentaculo' : 'tentaculo_b', position: { x: 1700, y: 420 }, width: 60, height: 60, hp: 100, maxHp: 100, speed: 1 };
    const lista: any[] = [e, { type: 'celula', hp: 10, position: { x: 0, y: 0 } }];   // outro vivo: nao murcha
    despacharNascer(ctx(0, lista), e);
    const cx = e.position.x + e.width / 2;
    const largura = 1660 - 100;
    assert.ok(cx >= 100 + largura * 0.35 - 1e-9 && cx <= 100 + largura * 0.6 + 1e-9, `x ${cx}`);
    assert.equal(e.position.y, 420);
    const x0 = e.position.x;
    for (let t = 1; t <= 20; t++) {
      e.position.x -= 5; e.position.y += 2;   // o jogo tenta andar
      despacharQuadro(ctx(t * 16, lista), e);
      assert.equal(e.position.x, x0); assert.equal(e.position.y, 420);
    }
  }
});

test('tentaculo: sozinho em campo por 15 s murcha e morre (a onda acaba); com outro vivo, nao', () => {
  const t1: any = { id: 'a', type: 'tentaculo', position: { x: 1700, y: 300 }, width: 60, height: 60, hp: 100, maxHp: 100 };
  const t2: any = { id: 'b', type: 'tentaculo_b', position: { x: 1700, y: 500 }, width: 60, height: 60, hp: 100, maxHp: 100 };
  const outro: any = { id: 'c', type: 'celula', position: { x: 900, y: 400 }, width: 40, height: 40, hp: 50, maxHp: 50 };
  const lista = [t1, t2, outro];
  despacharNascer(ctx(0, lista), t1); despacharNascer(ctx(0, lista), t2);
  let agora = 0;
  const roda = (ms: number) => { for (let t = 0; t < ms; t += 100) { agora += 100; for (const e of lista) if (e.hp > 0 && e.type.startsWith('tentaculo')) despacharQuadro(ctx(agora, lista), e); } };
  roda(30000);
  assert.ok(t1.hp > 0 && t2.hp > 0, 'com outro inimigo vivo nao murcha');
  outro.hp = 0;
  roda(14800);
  assert.ok(t1.hp > 0 && t2.hp > 0, 'antes dos 15 s');
  roda(400);
  assert.equal(t1.hp, 0); assert.equal(t2.hp, 0);
  assert.ok(lista.every(e => e.hp <= 0), 'nenhum vivo: a onda acaba');
});
