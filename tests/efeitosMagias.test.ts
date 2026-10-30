import { test } from 'node:test';
import assert from 'node:assert/strict';
import { efeitos, EFEITOS_MAX } from '../components/efeitosMagias';

test('efeitos: relogio do jogo decide validade (pausa = relogio parado)', () => {
  let agora = 1000;
  efeitos.usarRelogio(() => agora); efeitos.limpar();
  efeitos.area(10, 10, 180, 'sagrado', 450);
  assert.equal(efeitos.vivos(agora).length, 1);
  agora = 1449; assert.equal(efeitos.vivos(agora).length, 1);   // relogio parado nao consome
  agora = 1450; assert.equal(efeitos.vivos(agora).length, 0);
});

test('efeitos: teto de quantidade descarta os mais antigos', () => {
  efeitos.usarRelogio(() => 0); efeitos.limpar();
  for (let i = 0; i < EFEITOS_MAX + 25; i++) efeitos.explosao(i, 0, 'fogo', 0.5);
  const v = efeitos.vivos(1);
  assert.equal(v.length, EFEITOS_MAX);
  assert.equal((v[0] as any).x, 25);
  efeitos.limpar(); assert.equal(efeitos.vivos(1).length, 0);
});
