import { test } from 'node:test';
import assert from 'node:assert/strict';
import { contatoNoSegmento, contatoDoProjetil } from '../components/systems/varredura';

test('varredura: passo curto equivale ao teste de ponto', () => {
  assert.equal(contatoNoSegmento(0, 0, 6, 0, 10, 0, 24) !== null, true);
  assert.equal(contatoNoSegmento(0, 0, 6, 0, 100, 0, 24), null);
});

test('varredura: passo longo (20x) nao atravessa o alvo', () => {
  // tiro inimigo a 6 px/quadro x 20x x delta 3 = 360 px: antes de passar do heroi e depois dele
  const tiro = { position: { x: 60, y: 300 }, _px: 420, _py: 300 };
  const t = contatoDoProjetil(tiro, 240, 300, 24);
  assert.ok(t !== null && t > 0.45 && t < 0.55);
  // teste de ponto antigo (so o fim) errava
  const dx = tiro.position.x - 240; assert.ok(dx * dx >= 24 * 24);
});

test('varredura: segmento que passa longe nao acerta; sem rastro = teste de ponto', () => {
  assert.equal(contatoDoProjetil({ position: { x: 0, y: 0 }, _px: 400, _py: 0 }, 200, 60, 24), null);
  assert.equal(contatoDoProjetil({ position: { x: 200, y: 10 } }, 200, 0, 24), 1);
});
