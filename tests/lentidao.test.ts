import { test } from 'node:test';
import assert from 'node:assert/strict';
import { marcarLento, velocidadeComLentidao, lentidaoAte } from '../components/systems/lentidao';

test('lentidao vale enquanto o campo esta ativo e some sozinha', () => {
  const e: any = { speed: 2 };
  e._cm_wlock1_slow = 1000; marcarLento(e, '_cm_wlock1_slow', 0.75, 0.5);
  e._cm_rune4_slow = 500; marcarLento(e, '_cm_rune4_slow', 0.60, 0.5);
  assert.equal(velocidadeComLentidao(e, 2, 100), 1.2);   // a mais forte ativa
  assert.equal(velocidadeComLentidao(e, 2, 600), 1.5);   // rune venceu, warlock ainda vale
  assert.equal(velocidadeComLentidao(e, 2, 1000), 2);    // tudo venceu: volta ao normal
  assert.equal(e.speed, 2);                              // speed nunca e escrita
  assert.equal(lentidaoAte({ _slowUntil: 3, _sk_tundraSlowUntil: 9 }), 9);
});

test('piso nao acelera inimigo lento nem mexe em inimigo parado', () => {
  const t: any = { _slowUntil: 1000 }; marcarLento(t, '_slowUntil', 0.5, 0.3);
  assert.equal(velocidadeComLentidao(t, 0, 0), 0);
  assert.equal(velocidadeComLentidao(t, 0.2, 0), 0.2);
  assert.equal(velocidadeComLentidao(t, 1, 0), 0.5);
});

test('uivo que multiplica speed continua valendo com lentidao ativa', () => {
  const a: any = { _slowUntil: 1000 }; marcarLento(a, '_slowUntil', 0.5, 0.3);
  assert.equal(velocidadeComLentidao(a, 1 * 1.5, 0), 0.75);
  assert.equal(velocidadeComLentidao(a, 1, 2000), 1);
});
