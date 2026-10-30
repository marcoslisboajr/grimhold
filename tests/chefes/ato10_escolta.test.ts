// Chefe final do Ato X (onda 31): Malachar maior e o exercito da Fome (escolta + reforcos), tambem no Corrompido.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { despacharNascer, despacharQuadro } from '../../components/chefes';
import { prepararChefeFinal, ESCALA_MALACHAR, ESCOLTA_INICIAL, REFORCO_N, REFORCO_CADA, DEMONIOS_ESCOLTA, vagasMalachar, marcarInvocadoMalachar } from '../../components/chefes/ato10';
import { INVOCADOS_MAX } from '../../components/chefes/invocacao_timer';
import { ATOS } from '../../components/data/atos';
import type { CtxChefe } from '../../components/chefes/tipos';

let id = 0;
const ctx = (agora: number, inimigos: any[]): CtxChefe => ({
  agora, inimigos, aliados: [], adicionarInimigo: e => { inimigos.push(e); }, falar: () => {},
  novoId: () => `n${++id}`, muralhaX: 350, chegadaX: 1500, posAliado: () => ({ x: 0, y: 0 }),
  ferirAliado: () => {}, ferirMuralha: () => {}, efeito: () => {}, grade: { cols: 4, rows: 8 },
  moverAliado: () => {}, atordoarAliado: () => {},
});
const chefe = (type = 'malachar'): any => ({ id: 'b', type, position: { x: 1700, y: 400 }, width: 84, height: 84, hp: 36000, maxHp: 36000, damage: 108, speed: 0.8, color: '', enemyLevel: 0 });
const escolta = (l: any[], b: any) => l.filter(e => e._invocadoPor === b);

function nasce(b: any, final = true) {
  const lista: any[] = [b];
  if (final) prepararChefeFinal(b);
  despacharNascer(ctx(0, lista), b);
  return lista;
}
// anda ate o campo e roda 'ms' de quadros de 100 ms
function roda(lista: any[], b: any, ms: number, t0 = 0) {
  b.position.x = 1000;
  for (let t = 0; t <= ms; t += 100) despacharQuadro(ctx(t0 + t, lista), b);
}

test('Malachar da onda 31 do X: maior (hitbox junto) e com o centro no mesmo lugar', () => {
  const b = chefe(); const cx = b.position.x + b.width / 2, cy = b.position.y + b.height / 2;
  nasce(b);
  assert.equal(b.width, 84 * ESCALA_MALACHAR); assert.equal(b.height, 84 * ESCALA_MALACHAR);
  assert.ok(Math.abs(b.position.x + b.width / 2 - cx) < 1e-9 && Math.abs(b.position.y + b.height / 2 - cy) < 1e-9);
  prepararChefeFinal(b); assert.equal(b.width, 84 * ESCALA_MALACHAR, 'so uma vez');
});

test('escolta inicial: demonios da lista, sem recompensa, marcados como invocados do chefe', () => {
  const b = chefe(); const lista = nasce(b);
  const es = escolta(lista, b);
  assert.equal(es.length, ESCOLTA_INICIAL);
  for (const e of es) {
    assert.ok((DEMONIOS_ESCOLTA as readonly string[]).includes(e.type));
    assert.equal(e.reward, 0); assert.equal(e._semRecompensa, true);
    assert.ok(e.hp > 0 && e.hp < b.maxHp);
  }
});

test('reforcos: a cada 10 s, 3 demonios sem recompensa; teto de 12 vivos; param com o chefe morto', () => {
  const b = chefe(); const lista = nasce(b);
  roda(lista, b, REFORCO_CADA - 100);
  assert.equal(escolta(lista, b).length, ESCOLTA_INICIAL, 'antes do primeiro reforco');
  roda(lista, b, 100, REFORCO_CADA - 100);
  assert.equal(escolta(lista, b).length, ESCOLTA_INICIAL + REFORCO_N);
  roda(lista, b, REFORCO_CADA * 10, REFORCO_CADA);
  assert.equal(escolta(lista, b).filter(e => e.hp > 0).length, INVOCADOS_MAX);
  assert.ok(escolta(lista, b).every(e => e.reward === 0 && e._semRecompensa));
  for (const e of escolta(lista, b)) e.hp = 0;   // limpa o campo
  b.hp = 0;
  const antes = lista.length;
  roda(lista, b, REFORCO_CADA * 3, REFORCO_CADA * 20);
  assert.equal(lista.length, antes, 'chefe morto nao chama mais');
});

test('reforcos escalam com o chefe (dificuldade vem nos numeros dele)', () => {
  const fraco = chefe(), forte = chefe(); forte.maxHp *= 2; forte.hp = forte.maxHp;
  const hpDe = (b: any) => escolta(nasce(b), b)[0].maxHp;
  const r = Math.random; Math.random = () => 0;   // sempre o mesmo tipo
  try { assert.ok(hpDe(forte) > hpDe(fraco) * 1.9); } finally { Math.random = r; }
});

test('Heroi Corrompido na onda 31: mesma escolta e reforcos, sem mudar de tamanho', () => {
  const b = chefe('corrupted_jester'); const lista = nasce(b);
  assert.equal(b.width, 84);
  assert.equal(escolta(lista, b).length, ESCOLTA_INICIAL);
  const r = Math.random; Math.random = () => 0;
  try {
    const c2 = chefe('corrupted_jester'), m = chefe();
    assert.equal(escolta(nasce(c2), c2)[0].maxHp, escolta(nasce(m), m)[0].maxHp, 'escala pelos numeros do Malachar');
  } finally { Math.random = r; }
  roda(lista, b, REFORCO_CADA);
  assert.equal(escolta(lista, b).length, ESCOLTA_INICIAL + REFORCO_N);
});

test('fora da onda 31 do X (Malachar do V legado, sem prepararChefeFinal): sem escolta e sem mudar', () => {
  const b = chefe(); const lista = nasce(b, false);
  assert.equal(b.width, 84); assert.equal(lista.length, 1);
  roda(lista, b, REFORCO_CADA * 3);
  assert.equal(lista.length, 1);
});

test('invocacao propria do Malachar: no X sem recompensa e dentro do teto; no V legado igual', () => {
  const b = chefe(); const lista = nasce(b);   // 8 da escolta
  assert.equal(vagasMalachar(b, lista, 2), 2);
  const d: any = { type: 'lesser_demon', hp: 50, reward: 10 };
  marcarInvocadoMalachar(b, d); lista.push(d);
  assert.equal(d.reward, 0); assert.equal(d._semRecompensa, true); assert.equal(d._invocadoPor, b);
  for (let k = 0; k < 2; k++) lista.push({ hp: 10, _invocadoPor: b });   // 11 vivos
  assert.equal(vagasMalachar(b, lista, 2), 1);
  lista.push({ hp: 10, _invocadoPor: b });
  assert.equal(vagasMalachar(b, lista, 2), 0, 'teto de 12');
  const leg = chefe(); const ll = nasce(leg, false);
  for (let k = 0; k < 20; k++) ll.push({ hp: 10, _invocadoPor: leg });
  assert.equal(vagasMalachar(leg, ll, 2), 2);
  const d2: any = { type: 'lesser_demon', hp: 50, reward: 10 };
  marcarInvocadoMalachar(leg, d2);
  assert.equal(d2.reward, 10); assert.equal(d2._semRecompensa, undefined);
});

test('so o X tem luta final (o unico ato onde o GameCanvas chama prepararChefeFinal)', () => {
  assert.deepEqual(ATOS.filter(a => a.lutaFinal).map(a => a.id), ['act10']);
});
