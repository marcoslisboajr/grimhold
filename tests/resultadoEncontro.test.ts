import { test } from 'node:test';
import assert from 'node:assert/strict';
import { linhasResultadoEncontro } from '../components/systems/resultadoEncontro';

const nome = (t: string) => t.toUpperCase();

test('ouro ganho e custo pago viram linhas com tom certo', () => {
  const L = linhasResultadoEncontro({ custoOuro: 80 }, [{ k: 'ouro', n: 120 }, { k: 'muralhaMax', n: 150 }], nome);
  assert.deepEqual(L.map(l => [l.chave, l.vars?.n, l.tom]), [
    ['ui.encontro.res.custoOuro', 80, 'ruim'],
    ['ui.encontro.res.ouro', 120, 'ouro'],
    ['ui.encontro.res.muralhaMax', 150, 'bom'],
  ]);
  const M = linhasResultadoEncontro({ custoMuralha: 50 }, [{ k: 'dano', pct: 15, alvo: 'distancia' }], nome);
  assert.equal(M[0].chave, 'ui.encontro.res.custoMuralha');
  assert.equal(M[1].chave, 'ui.encontro.res.dano.distancia');
});

test('aliado sem espaco vira ouro; aliado novo leva nome e nivel', () => {
  const L = linhasResultadoEncontro({}, [{ k: 'semEspaco', n: 40 }], nome);
  assert.deepEqual(L, [{ chave: 'ui.encontro.res.semEspaco', vars: { n: 40 }, tom: 'ouro' }]);
  const A = linhasResultadoEncontro({ custoMuralha: 100 }, [{ k: 'aliado', tipo: 'paladin', nivel: 4 }], nome);
  assert.deepEqual(A[1], { chave: 'ui.encontro.res.aliado', vars: { nome: 'PALADIN', n: 4 }, tom: 'bom' });
});

test('fortalecer e dano em heroi nomeado', () => {
  const L = linhasResultadoEncontro({}, [{ k: 'fortalecido', tipo: 'mage', pct: 15 }, { k: 'dano', pct: 20, alvo: 'zylvara' }], nome);
  assert.deepEqual(L[0], { chave: 'ui.encontro.res.fortalecido', vars: { nome: 'MAGE', n: 15 }, tom: 'bom' });
  assert.deepEqual(L[1].vars, { n: 20, nome: 'ZYLVARA' });
});

test('proxima onda: vida menor e boa, velocidade/cota/ouro em dobro', () => {
  const L = linhasResultadoEncontro({}, [{ k: 'ondaHp', pct: -30 }, { k: 'ondaVel', pct: 30 }, { k: 'ondaOuroDobro' },
    { k: 'cota', abates: 15, ganha: 200, perde: 100 }], nome);
  assert.deepEqual(L.map(l => [l.chave, l.tom]), [
    ['ui.encontro.res.ondaHpMenos', 'bom'], ['ui.encontro.res.ondaVel', 'ruim'],
    ['ui.encontro.res.ondaOuroDobro', 'ouro'], ['ui.encontro.res.cota', 'neutro']]);
  assert.equal(L[0].vars?.n, 30);
});

test('sorte do ferreiro e opcao sem efeito', () => {
  const F = linhasResultadoEncontro({}, [{ k: 'ferreiro', bom: 'archer', ruim: 'druid' }], nome);
  assert.deepEqual(F.map(l => l.tom), ['bom', 'ruim']);
  assert.deepEqual(linhasResultadoEncontro({}, [], nome), [{ chave: 'ui.encontro.res.nada', tom: 'neutro' }]);
});
