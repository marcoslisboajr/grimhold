import { test } from 'node:test';
import assert from 'node:assert/strict';
import * as S from '../components/systems/sinergias';

test('3.3: Senhor do Pavor x1,30/x1,60/x2,10 (2/3/4 copias)', () => {
  assert.deepEqual([1, 2, 3, 4].map(S.dreadBonusDmgMult), [1, 1.30, 1.60, 2.10]);
});

test('3.3: combos de tipo unico 1,20/1,45/1,80', () => {
  assert.deepEqual([0, 1, 2, 3].map(S.comboSoloDmg), [1, 1.20, 1.45, 1.80]);
});

test('3.3: Fome Sombria T2 x1,60; Arqueira Nv3 0,62; Mago Nv4 x1,85 e 25%', () => {
  assert.equal(S.darkHungerDmg(2), 1.60);
  assert.equal(S.darkHungerDmg(1), 1.35);
  assert.equal(S.archerCooldownMult(3), 0.62);
  assert.equal(S.archerCooldownMult(4), 0.45);
  assert.equal(S.mageDamageMult(4), 1.85);
  assert.equal(S.MAGE_SOBRECARGA_CHANCE, 0.25);
});

test('3.3: Paladino +40/75/120/200% vs profanos e base +8/16/25/35%, Castigo 1s', () => {
  assert.deepEqual([1, 2, 3, 4].map(S.paladinUndeadBonus), [0.40, 0.75, 1.20, 2.00]);
  assert.deepEqual([1, 2, 3, 4].map(S.paladinBaseDmgMult), [1.08, 1.16, 1.25, 1.35]);
  assert.equal(S.PALADINO_CASTIGO_MS, 1000);
});

test('3.4: Cacada Selvagem fundida (3/5), exige os 3 tipos', () => {
  assert.equal(S.wildHuntTier(1, 1, 1), 1);
  assert.equal(S.wildHuntTier(1, 2, 2), 2);
  assert.equal(S.wildHuntTier(0, 3, 3), 0);
  assert.equal(S.wildHuntDmg(1), 1.18);
  assert.equal(S.wildHuntDmg(2), 1.35);
  assert.equal(S.wildHuntAuraDmg(1), 0.12);
  assert.equal(S.wildHuntAuraDmg(2), 0.25);
  assert.equal(S.wildHuntCooldown(1), 1);
  assert.ok(Math.abs(1 / S.wildHuntCooldown(2) - 1.15) < 1e-9);
});

test('3.4: Baluarte de Ferro e Gelo = paladino + guardia (2/4)', () => {
  assert.equal(S.bulwarkTier(1, 0), 0);
  assert.equal(S.bulwarkTier(1, 1), 1);
  assert.equal(S.bulwarkTier(2, 2), 2);
  assert.equal(S.bulwarkDmgRed(1), 0.15);
  assert.equal(S.bulwarkDmgRed(2), 0.30);
  assert.equal(S.bulwarkPlacaMult(1), 0.85);
  assert.equal(S.bulwarkMuralhaExtraMs(2), 1000);
});

test('bug: Pacto Praguejado nunca amplifica abaixo da Praga base (1,25)', () => {
  for (const t of [0, 1, 2, 3]) assert.ok(S.hexboundHexAmp(t) >= S.HEX_AMP_BASE, String(t));
  assert.equal(S.hexboundHexAmp(1), 1.25);
  assert.equal(S.hexboundHexAmp(3), 1.45);
});

test('Bobo, Morrigan e Vex: 4 niveis', () => {
  assert.deepEqual([0, 1, 2, 3, 4].map(S.jesterDmgMult), [1, 1, 1.30, 1.60, 1.80]);
  assert.deepEqual([0, 1, 2, 3, 4].map(S.jesterTriploIntervalo), [0, 0, 5, 5, 2]);
  assert.equal(S.jesterBallCooldown(1), 0.80);
  assert.deepEqual([0, 1].map(S.morriganAlmaBonus), [0, 0.01]);
  assert.deepEqual([1, 2].map(S.morriganConsumidorBonus), [0.15, 0.25]);
  assert.deepEqual([2, 3].map(S.morriganDevorarAlmas), [0, 8]);
  assert.deepEqual([3, 4].map(S.morriganDevorarMs), [5000, 8000]);
  assert.deepEqual([0, 1, 2, 3, 4].map(S.vexDashInterval), [5, 4, 3, 2, 1]);
  assert.deepEqual([1, 2, 3, 4].map(S.vexDashDmgMult), [1, 1.25, 1.60, 2.20]);
  assert.deepEqual([2, 3].map(S.vexBlinkMs), [600, 900]);
  assert.equal(S.vexIntocavel(4), true);
});
