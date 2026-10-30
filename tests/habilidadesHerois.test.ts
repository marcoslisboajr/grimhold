import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as H from '../components/systems/habilidadesHerois';

test('Singularidade: puxa para o centro, com teto; chefes e parados ficam', () => {
  const alvos = [{ x: 0, chefe: false }, { x: 1000, chefe: false }, { x: 500, chefe: true }, { x: 900, chefe: false, parado: true }, { x: 600, chefe: false }];
  const c = H.centroSingularidade(alvos);
  assert.equal(c, 600);
  const n = H.puxarParaCentro(alvos, c);
  assert.equal(n[0], H.SINGULARIDADE_MAX_PUXAO);        // 600 * 0,7 = 420 -> teto 220
  assert.equal(n[1], 1000 - H.SINGULARIDADE_MAX_PUXAO);   // 400 * 0,7 = 280 -> teto 220
  assert.equal(n[2], 500);                                // chefe nao se move
  assert.equal(n[3], 900);                                // tentaculo parado
  assert.equal(n[4], 600);                                // ja no centro
  assert.deepEqual(H.puxarParaCentro([]), []);
});

test('Turbo de Mana: uma vez por onda, so com 5+ inimigos', () => {
  assert.equal(H.turboDeveAtivar(false, 4), false);
  assert.equal(H.turboDeveAtivar(false, 5), true);
  assert.equal(H.turboDeveAtivar(true, 20), false);
});

test('Ascensao do Lich: primeira onda 15+, uma vez por run, limite 8 e teto de minions', () => {
  assert.equal(H.lichAtivaNaOnda(14, false), false);
  assert.equal(H.lichAtivaNaOnda(15, false), true);
  assert.equal(H.lichAtivaNaOnda(22, true), false);
  assert.equal(H.lichErgue(15, 15, 0, 0), true);
  assert.equal(H.lichErgue(15, 16, 0, 0), false);
  assert.equal(H.lichErgue(15, 15, 8, 0), false);
  assert.equal(H.lichErgue(15, 15, 3, 10), false);
  assert.equal(H.lichErgue(undefined, 15, 0, 0), false);
});

test('Ressurreicao: uma vez por run, nao salva o proprio Sacerdote', () => {
  assert.equal(H.ressurreicaoSalva(2, 0, false), true);
  assert.equal(H.ressurreicaoSalva(0, 0, false), false);
  assert.equal(H.ressurreicaoSalva(2, 0, true), false);
  assert.equal(H.ressurreicaoSalva(2, -1, false), false);
});

test('Obra-Prima: ondas de ato e janela no relogio do jogo', () => {
  assert.ok(H.obraPrimaNaOnda(10) && H.obraPrimaNaOnda(30));
  assert.ok(!H.obraPrimaNaOnda(0) && !H.obraPrimaNaOnda(15));
  assert.ok(H.obraPrimaAtiva(1000 + H.OBRA_PRIMA_DURACAO_MS, 1000));
  assert.ok(!H.obraPrimaAtiva(1000, 1000));
  assert.ok(!H.obraPrimaAtiva(undefined, 0));
});
