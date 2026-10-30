// Modulos do Ato V refeito (Etapa 3a): um teste por habilidade, com inimigos/aliados falsos e CtxChefe falso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { despacharNascer, despacharQuadro, despacharMorte, despacharEvitarMorte, morteSemRecompensa, despacharAcertoMuralha, despacharAlvo, despacharDanoEmAliado, intervaloAtaqueAliado, varrerSaidas } from '../../components/chefes';
import { INVOCADOS_MAX } from '../../components/chefes/invocacao_timer';
import '../../components/chefes/ato5r';
import type { CtxChefe } from '../../components/chefes/tipos';
import { ehVoador, ehChefe } from '../../components/chefes/lista';
import { TESOUREIRO_ROUBO } from '../../components/chefes/tesoureiro';

let seq = 0;
function mundo(aliados: any[] = [], ouro = 1000) {
  const m = { agora: 0, inimigos: [] as any[], aliados, pagos: 0, semPagar: 0, ouro };
  const ctx = (): CtxChefe => ({
    agora: m.agora, inimigos: m.inimigos, aliados: m.aliados,
    adicionarInimigo: e => { m.inimigos.push(e); }, falar: () => {},
    novoId: () => `n${++seq}`, muralhaX: 100, chegadaX: 1500,
    posAliado: a => ({ x: (a as any).gridPosition.col * 80, y: (a as any).gridPosition.row * 100 }),
    ferirAliado: (a, d) => { a.hp -= d; }, ferirMuralha: () => {}, efeito: () => {},
    grade: { cols: 4, rows: 8 },
    moverAliado: (a, col, row) => { a.gridPosition = { col, row }; },
    atordoarAliado: (a, ate) => { (a as any)._atordoadoAte = ate; },
    ouro: () => m.ouro, mudarOuro: d => { m.ouro = Math.max(0, m.ouro + d); },
  });
  const quadro = (ms: number) => {
    m.agora += ms;
    for (const e of [...m.inimigos]) despacharQuadro(ctx(), e);
    for (const e of [...m.inimigos]) {
      if (e.hp > 0) continue;
      if (morteSemRecompensa(e)) { m.semPagar++; despacharMorte(ctx(), e); m.inimigos.splice(m.inimigos.indexOf(e), 1); continue; }
      if (despacharEvitarMorte(ctx(), e)) continue;
      m.pagos++; despacharMorte(ctx(), e); m.inimigos.splice(m.inimigos.indexOf(e), 1);
    }
  };
  return { m, ctx, quadro };
}
const ini = (type: string, x = 800, y = 300, hp = 100, extra: any = {}) =>
  ({ id: `i${++seq}`, type, position: { x, y }, width: 40, height: 40, hp, maxHp: hp, damage: 10, speed: 1, reward: 10, ...extra } as any);
const nascer = (w: ReturnType<typeof mundo>, e: any) => { despacharNascer(w.ctx(), e); w.m.inimigos.push(e); return e; };
const heroi = (id: string, type: string, col = 2, row = 2) => ({ id, type, hp: 100, maxHp: 100, gridPosition: { col, row } } as any);
const doTipo = (w: ReturnType<typeof mundo>, p: string) => w.m.inimigos.filter(e => (e.type as string).startsWith(p));
const passa = (w: ReturnType<typeof mundo>, ms: number, passo = 100) => { for (let t = 0; t < ms; t += passo) w.quadro(passo); };

test('runas hostis voam; os 6 chefes do V refeito sao chefes; comuns nao', () => {
  for (const t of ['runa_hostil', 'runa_hostil_b']) assert.ok(ehVoador(t), t);
  for (const t of ['soldado_ashfen', 'capanga', 'cavaleiro_negro', 'saqueador', 'lich5', 'mago_colegiado', 'reitor', 'tesoureiro']) assert.ok(!ehVoador(t), t);
  for (const c of ['sargento_ashfen', 'tesoureiro', 'chefe_saqueador', 'capitao_ashfen', 'lich_colegiado', 'reitor']) assert.ok(ehChefe(c), c);
  assert.ok(!ehChefe('soldado_ashfen_d') && !ehChefe('saqueador_martelo') && !ehChefe('lich5_b') && !ehChefe('runa_hostil'));
});

for (const [chefe, tipo, n, cada] of [['sargento_ashfen', 'soldado_ashfen', 3, 12000], ['lich_colegiado', 'mago_colegiado', 2, 10000], ['reitor', 'runa_hostil', 2, 9000]] as const) {
  test(`${chefe}: chama ${n} ${tipo} a cada ${cada / 1000} s depois de chegar, sem recompensa; para ao morrer`, () => {
    const w = mundo();
    const c = nascer(w, ini(chefe, 1600, 300, 5000));
    passa(w, cada * 2);
    assert.equal(doTipo(w, tipo).length, 0, 'fora do campo nao chama');
    c.position.x = 900;
    passa(w, cada - 100); assert.equal(doTipo(w, tipo).length, 0);
    passa(w, 200); assert.equal(doTipo(w, tipo).length, n);
    passa(w, cada); assert.equal(doTipo(w, tipo).length, 2 * n);
    for (const e of doTipo(w, tipo)) { assert.equal(e.reward, 0); assert.ok(morteSemRecompensa(e)); }
    for (const e of doTipo(w, tipo)) e.hp = 0;
    w.quadro(16);
    assert.equal(w.m.semPagar, 2 * n); assert.equal(w.m.pagos, 0);
    c.hp = 0; w.quadro(16);
    passa(w, cada * 2); assert.equal(doTipo(w, tipo).length, 0, 'morto nao chama');
  });
}

test('Chefe dos Saqueadores: a 50% chama 4 saqueadores (um de cada arma), uma vez, pagando normal', () => {
  const w = mundo();
  const c = nascer(w, ini('chefe_saqueador', 900, 300, 1000));
  w.quadro(16); assert.equal(doTipo(w, 'saqueador').length, 0);
  c.hp = 490; w.quadro(16);
  assert.deepEqual(doTipo(w, 'saqueador').map(e => e.type).sort(), ['saqueador', 'saqueador_espada', 'saqueador_lanca', 'saqueador_martelo']);
  c.hp = 200; w.quadro(16); c.hp = 100; w.quadro(16);
  assert.equal(doTipo(w, 'saqueador').length, 4, 'so uma vez');
  for (const e of doTipo(w, 'saqueador')) { assert.ok(!morteSemRecompensa(e)); e.hp = 0; }
  w.quadro(16); assert.equal(w.m.pagos, 4);
});

test('Tesoureiro: rouba a cada acerto, 20% do ouro uma vez, devolve tudo ao morrer', () => {
  const w = mundo([], 1000);
  const t = nascer(w, ini('tesoureiro', 110, 300, 5000));
  despacharAcertoMuralha(w.ctx(), t, 5);
  const primeiro = TESOUREIRO_ROUBO + Math.floor((1000 - TESOUREIRO_ROUBO) * 0.2);
  assert.equal(w.m.ouro, 1000 - primeiro, '1o acerto: roubo + 20%');
  despacharAcertoMuralha(w.ctx(), t, 5);
  despacharAcertoMuralha(w.ctx(), t, 5);
  assert.equal(w.m.ouro, 1000 - primeiro - 2 * TESOUREIRO_ROUBO, 'os 20% sao uma vez so');
  assert.equal((t as any)._roubado, primeiro + 2 * TESOUREIRO_ROUBO);
  t.hp = 0; w.quadro(16);
  assert.equal(w.m.ouro, 1000, 'devolveu tudo');
  assert.equal(w.m.pagos, 1);
  // sem ouro nao fica negativo
  const w2 = mundo([], 3);
  const t2 = nascer(w2, ini('tesoureiro', 110, 300, 5000));
  despacharAcertoMuralha(w2.ctx(), t2, 5); assert.equal(w2.m.ouro, 0);
  t2.hp = 0; w2.quadro(16); assert.equal(w2.m.ouro, 3);
});

test('Tesoureiro: contrata um inimigo a cada 8 s (+30% de vida maxima e atual), uma vez por inimigo', () => {
  const w = mundo();
  const t = nascer(w, ini('tesoureiro', 900, 300, 5000));
  const a = nascer(w, ini('capanga', 1000, 300, 100));
  a.hp = 50;
  passa(w, 7900); assert.equal(a.maxHp, 100);
  passa(w, 200);
  assert.equal(a.maxHp, 130); assert.ok(Math.abs(a.hp - 65) < 1e-9); assert.ok((a as any)._contratado);
  passa(w, 8000);
  assert.equal(a.maxHp, 130, 'uma vez por inimigo');
  assert.equal(t.maxHp, 5000, 'nao se contrata');
  const b = nascer(w, ini('capanga_b', 1000, 400, 100));
  passa(w, 8000); assert.equal(b.maxHp, 130);
});

test('Capitao de Ashfen: grito a cada 15 s (-20% vel. de ataque por 5 s, expira); Gorak imune e +50%', () => {
  const mago = heroi('h1', 'mage'), gorak = heroi('h2', 'berserker');
  const w = mundo([mago, gorak]);
  nascer(w, ini('capitao_ashfen', 900, 300, 5000));
  passa(w, 14900);
  assert.equal(intervaloAtaqueAliado(mago, w.m.agora), 1);
  passa(w, 200);
  assert.ok(Math.abs(intervaloAtaqueAliado(mago, w.m.agora) - 1 / 0.8) < 1e-9, 'mago mais lento');
  assert.ok(Math.abs(intervaloAtaqueAliado(gorak, w.m.agora) - 1 / 1.5) < 1e-9, 'Gorak mais rapido');
  assert.equal((gorak as any)._gritoAte, undefined, 'Gorak imune ao grito');
  passa(w, 5000);
  assert.equal(intervaloAtaqueAliado(mago, w.m.agora), 1);
  assert.equal(intervaloAtaqueAliado(gorak, w.m.agora), 1);
  assert.equal((mago as any)._gritoAte, undefined, 'expirou no heroi');
});

test('Runas hostis nao ferem o Veltharion e preferem outro alvo', () => {
  const velt = heroi('v', 'runesmith'), krash = heroi('k', 'mage');
  const w = mundo([velt, krash]);
  const r = nascer(w, ini('runa_hostil_b', 600, 300, 50));
  assert.equal(despacharDanoEmAliado(w.ctx(), r, velt, 40), 0);
  assert.equal(despacharDanoEmAliado(w.ctx(), r, krash, 40), 40);
  assert.equal(despacharAlvo(w.ctx(), r, [velt, krash]), krash);
  assert.equal(despacharAlvo(w.ctx(), r, [velt]), undefined, 'so o Veltharion: fica o alvo do jogo (e o dano vira 0)');
});

test('invocacao por timer: teto de 12 invocados vivos por chefe (no teto a chamada e pulada)', () => {
  const w = mundo();
  const r = nascer(w, ini('reitor', 900, 300, 1e6));
  passa(w, 9000 * 20);
  assert.equal(doTipo(w, 'runa_hostil').length, INVOCADOS_MAX);
  doTipo(w, 'runa_hostil')[0].hp = 0; w.quadro(16);
  passa(w, 9000);
  assert.equal(doTipo(w, 'runa_hostil').length, INVOCADOS_MAX, 'repoe so ate o teto');
  // o teto e por chefe: invocados de outro chefe nao contam
  const r2 = nascer(w, ini('reitor', 900, 500, 1e6));
  passa(w, 9200);
  assert.equal(doTipo(w, 'runa_hostil').filter((e: any) => e._invocadoPor === r2).length, 2);
  assert.ok(r.hp > 0);
});

test('Tesoureiro: devolve o ouro morrendo por DoT (despacharMorte fora do quadro) e so uma vez', () => {
  const w = mundo([], 1000);
  const t = nascer(w, ini('tesoureiro', 110, 300, 5000));
  despacharAcertoMuralha(w.ctx(), t, 5);
  assert.ok(w.m.ouro < 1000);
  t.hp = 0; despacharMorte(w.ctx(), t); w.m.inimigos.splice(w.m.inimigos.indexOf(t), 1);   // caminho do sangramento/DoT
  assert.equal(w.m.ouro, 1000);
  varrerSaidas(w.ctx()); despacharMorte(w.ctx(), t);
  assert.equal(w.m.ouro, 1000, 'sem devolucao dupla');
});

test('Tesoureiro: tirado de campo sem morrer (fim de onda/run, splice direto) devolve o ouro, uma vez', () => {
  const w = mundo([], 1000);
  const t = nascer(w, ini('tesoureiro', 110, 300, 5000));
  despacharAcertoMuralha(w.ctx(), t, 5); despacharAcertoMuralha(w.ctx(), t, 5);
  w.m.inimigos.splice(w.m.inimigos.indexOf(t), 1);
  varrerSaidas(w.ctx());
  assert.equal(w.m.ouro, 1000);
  varrerSaidas(w.ctx());
  assert.equal(w.m.ouro, 1000, 'uma vez');
});
