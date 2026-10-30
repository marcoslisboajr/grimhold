// Ato X com 31 ondas: a 30 vira a maior onda comum (sem chefe) e a 31 e so o chefe final (Malachar ou
// o Heroi Corrompido) com a escolta de demonios, mais forte que o chefe da antiga onda 30. Os outros
// atos (e o V legado) seguem com 30 ondas.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ATOS, ATO5_LEGADO, atoDoModo, ultimaOnda, ehOndaDeChefe, ondaFinalSoChefe, ondaNoAto, ONDA30_COMUM_X, ONDAS_PADRAO } from '../../components/data/atos';
import { sortearLegado } from '../../components/data/atosLegado';
import { ESCOLTA_INICIAL, REFORCO_CADA, REFORCO_N } from '../../components/chefes/ato10';
import { INVOCADOS_MAX } from '../../components/chefes/invocacao_timer';
import { chefeDaOnda30 } from '../../components/chefes/corrompido';

const A10 = atoDoModo('act10')!;
const comum = { isBossSpawn: false, isSecondBossSpawn: false, isEscort: false };
const chefe = { ...comum, isBossSpawn: true };
const base = { type: 'goblin' as any, hp: 100, damage: 3, speed: 1, radius: 24, attackRange: 0, attackSpeed: 0 };

// mesma base de vida do createEnemy do GameCanvas (30+6w, evolucao a cada 5, rampa a partir da 10)
const vidaBase = (w: number) => {
  let hp = 30 + w * 6;
  hp = Math.ceil(hp * (1 + Math.floor(w / 5) * 0.35));
  if (w > 10) hp = Math.ceil(hp * (1 + (w - 10) * 0.04));
  return hp;
};

test('X tem 31 ondas; os outros atos (e o V legado) tem 30', () => {
  assert.equal(ultimaOnda(A10), 31);
  for (const a of ATOS.filter(x => x.modo !== 'act10')) assert.equal(ultimaOnda(a), ONDAS_PADRAO, a.id);
  assert.equal(ultimaOnda(ATO5_LEGADO), 30);
  assert.equal(ATO5_LEGADO.ultimaOnda, undefined);
  assert.equal(ultimaOnda(undefined), 30, 'fora de ato');
  assert.equal(ondaFinalSoChefe(A10), true);
  for (const a of ATOS.filter(x => x.modo !== 'act10')) assert.equal(ondaFinalSoChefe(a), false, a.id);
});

test('ondas de chefe: X = 5..25 e 31 (a 30 e comum); demais = 5..30', () => {
  const chefesX = Array.from({ length: 31 }, (_, i) => i + 1).filter(o => ehOndaDeChefe(A10, o));
  assert.deepEqual(chefesX, [5, 10, 15, 20, 25, 31]);
  // proximaEhChefe (GameCanvas: ondaEhChefe = ehOndaDeChefe) depois de limpar a 30 do X: a 31 e de chefe -> sem encontro
  assert.equal(ehOndaDeChefe(A10, 30 + 1), true);
  for (const a of ATOS.filter(x => x.modo !== 'act10')) {
    const cs = Array.from({ length: 30 }, (_, i) => i + 1).filter(o => ehOndaDeChefe(a, o));
    assert.deepEqual(cs, [5, 10, 15, 20, 25, 30], a.id);
  }
  assert.equal(ondaNoAto(A10, 31), 31); assert.equal(ondaNoAto(A10, 32), 1);
  assert.equal(ondaNoAto(atoDoModo('act9'), 30), 30); assert.equal(ondaNoAto(atoDoModo('act9'), 31), 1);
});

test('onda 30 do X: comum, sem chefe, com os mobs do ventre e maior que a 29', () => {
  assert.equal(A10.chefes![30], undefined);
  const tipos29 = new Set(A10.faixas!.find(f => f.ateOnda === 29)!.pool.map(m => m.tipo));
  for (let k = 0; k < 200; k++) {
    const r = A10.sortear(30, k / 200, comum, base);
    assert.ok(tipos29.has(r.type), `${r.type}`);
    assert.notEqual(r.type, 'malachar');
  }
  // o spawn da 30 nao e onda de chefe (nenhum spawn sai como isBossSpawn); mesmo que saisse, nao ha chefe na 30
  assert.equal(ehOndaDeChefe(A10, 30), false);
  assert.ok(tipos29.has(A10.sortear(30, 0.5, chefe, base).type));
  // tamanho: a 29 tem min(25, 10 + 28*2) = 25; a 30 do X e a maior do ato
  const onda29 = Math.min(25, 10 + (29 - 1) * 2);
  assert.ok(ONDA30_COMUM_X > onda29 && ONDA30_COMUM_X <= onda29 + 5, `${ONDA30_COMUM_X}`);
});

test('onda 31 do X: Malachar com +30% de vida e dano sobre o chefe da antiga onda 30', () => {
  const leg30 = sortearLegado(5, 30, 0.5, chefe, base);   // o Malachar de hoje na 30 (mesmos numeros do legado)
  const m31 = A10.sortear(31, 0.5, chefe, base);
  assert.equal(m31.type, 'malachar');
  assert.ok(Math.abs(m31.damage - leg30.damage * 1.3) < 1e-9, `${m31.damage}`);
  // vida final = base da onda x ficha: a 31 ja tem ~5% a mais de base, a ficha completa os +30%
  const vida30 = vidaBase(30) * (leg30.hp / base.hp), vida31 = vidaBase(31) * (m31.hp / base.hp);
  assert.ok(Math.abs(vida31 / vida30 - 1.3) < 0.005, `${vida31 / vida30}`);
  assert.equal(m31.speed, leg30.speed); assert.equal(m31.radius, leg30.radius);
});

test('escolta da 31: 8 demonios na abertura, reforco a cada 10 s, teto de 12 (sem recompensa: ato10_escolta)', () => {
  assert.equal(ESCOLTA_INICIAL, 8);
  assert.equal(REFORCO_CADA, 10000);
  assert.equal(REFORCO_N, 3);
  assert.equal(INVOCADOS_MAX, 12);
});

test('Heroi Corrompido: troca o Malachar da 31 (a regra nao depende do numero da onda)', () => {
  assert.equal(chefeDaOnda30('jester'), 'corrupted_jester');
  assert.equal(chefeDaOnda30(undefined), undefined);
  assert.equal(A10.sortear(31, 0.5, chefe, base).type, 'malachar');   // o GameCanvas troca pelo corrompido na ultimaOnda
});

test('Fome: luta final so no X, depois da ultima onda (31)', () => {
  assert.deepEqual(ATOS.filter(a => a.lutaFinal).map(a => [a.id, ultimaOnda(a)]), [['act10', 31]]);
});

test('V legado inalterado: chefe da 30 e o Malachar do legado', () => {
  const r = ATO5_LEGADO.sortear(30, 0.5, chefe, base);
  assert.deepEqual(r, sortearLegado(5, 30, 0.5, chefe, base));
});
