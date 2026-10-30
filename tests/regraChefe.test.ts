import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ehChefeOuFome, atordoar, multLentidaoChefe, danoGlobal, explosaoPorHpMax, CHEFE_LENTIDAO_MS } from '../components/systems/regraChefe';

test('ehChefeOuFome cobre legado, atos novos, Fome, Corrompidos e o Arcanista', () => {
  for (const t of ['goblin_king', 'malachar', 'cultista_mor', 'kraken', 'quimera', 'reitor', 'fome_ponto', 'fome_coracao', 'corrupted_vex', 'elf_arcanist'])
    assert.ok(ehChefeOuFome(t), t);
  for (const t of ['skeleton', 'goblin', 'esqueleto6', 'tentaculo'])
    assert.ok(!ehChefeOuFome(t), t);
});

test('atordoar: comum trava, chefe so fica 25% mais lento por 1,5s sem acumular', () => {
  const comum: any = { type: 'goblin' };
  assert.equal(atordoar(comum, 1000, 1500, 'freeze'), true);
  assert.equal(comum.frozenUntil, 2500);
  assert.equal(comum.statusEffect, 'freeze');
  // nao encurta um atordoamento mais longo
  atordoar(comum, 1100, 200);
  assert.equal(comum.frozenUntil, 2500);

  const chefe: any = { type: 'kraken' };
  assert.equal(atordoar(chefe, 1000, 5000), false);
  assert.equal(chefe.frozenUntil, undefined);
  assert.equal(chefe._chefeLentoAte, 1000 + CHEFE_LENTIDAO_MS);
  atordoar(chefe, 1200, 5000);
  assert.equal(chefe._chefeLentoAte, 1200 + CHEFE_LENTIDAO_MS);   // renova, nao soma
  assert.equal(multLentidaoChefe(chefe, 1300), 0.75);
  assert.equal(multLentidaoChefe(chefe, 1200 + CHEFE_LENTIDAO_MS + 1), 1);
  assert.equal(multLentidaoChefe({}, 0), 1);
});

test('danoGlobal: 50% em chefe, inteiro em comum', () => {
  assert.equal(danoGlobal('goblin', 100), 100);
  assert.equal(danoGlobal('fome_coracao', 100), 50);
  assert.equal(danoGlobal('corrupted_paladin', 33), 17);
});

test('explosaoPorHpMax: chefe morto conta metade; teto opcional', () => {
  assert.equal(explosaoPorHpMax('goblin', 100, 3.0), 300);
  assert.equal(explosaoPorHpMax('kraken', 10000, 3.0), 15000);
  assert.equal(explosaoPorHpMax('goblin', 100, 1.5, 90), 90);
  assert.equal(explosaoPorHpMax('kraken', 10000, 1.5, 600), 600);
});
