// Modulos do Ato VIII (Etapa 2a): um teste por habilidade, com inimigos/aliados falsos e CtxChefe falso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { despacharNascer, despacharQuadro, despacharMorte, despacharEvitarMorte, morteSemRecompensa, podeSerAlvo, despacharDanoEmAliado, multiplicadorDano } from '../../components/chefes';
import '../../components/chefes/ato8';
import type { CtxChefe } from '../../components/chefes/tipos';
import { ehVoador, prioridadeAlvo, ehChefe } from '../../components/chefes/lista';
import { limiteKraken } from '../../components/chefes/kraken';
import { CANVAS_WIDTH } from '../../components/systems/combat';

let seq = 0;
function mundo(aliados: any[] = []) {
  const m = { agora: 0, inimigos: [] as any[], aliados, feridos: [] as [string, number][], pagos: 0 };
  const ctx = (): CtxChefe => ({
    agora: m.agora, inimigos: m.inimigos, aliados: m.aliados,
    adicionarInimigo: e => { m.inimigos.push(e); }, falar: () => {},
    novoId: () => `n${++seq}`, muralhaX: 100, chegadaX: 1500,
    posAliado: a => ({ x: (a as any).gridPosition.col * 80, y: (a as any).gridPosition.row * 100 }),
    ferirAliado: (a, d) => { a.hp -= d; m.feridos.push([a.id, d]); },
    ferirMuralha: () => {}, efeito: () => {},
    grade: { cols: 4, rows: 8 },
    moverAliado: (a, col, row) => { a.gridPosition = { col, row }; },
    atordoarAliado: (a, ate) => { (a as any)._atordoadoAte = ate; },
  });
  const quadro = (ms: number) => {
    m.agora += ms;
    for (const e of [...m.inimigos]) despacharQuadro(ctx(), e);
    for (const e of [...m.inimigos]) {
      if (e.hp > 0) continue;
      if (morteSemRecompensa(e)) { despacharMorte(ctx(), e); m.inimigos.splice(m.inimigos.indexOf(e), 1); continue; }
      if (despacharEvitarMorte(ctx(), e)) continue;
      m.pagos++; despacharMorte(ctx(), e); m.inimigos.splice(m.inimigos.indexOf(e), 1);
    }
  };
  return { m, ctx, quadro };
}
const ini = (type: string, x = 800, y = 300, hp = 100, extra: any = {}) =>
  ({ id: `i${++seq}`, type, position: { x, y }, width: 40, height: 40, hp, maxHp: hp, damage: 10, speed: 1, ...extra } as any);
const nascer = (w: ReturnType<typeof mundo>, e: any) => { despacharNascer(w.ctx(), e); w.m.inimigos.push(e); return e; };
const heroi = (id: string, col: number, row: number, hp = 100, maxHp = 100) => ({ id, type: 'mage', hp, maxHp, gridPosition: { col, row } });
const doTipo = (w: ReturnType<typeof mundo>, p: string) => w.m.inimigos.filter(e => (e.type as string).startsWith(p));

test('aguas-vivas, Mae das Aguas e Garuda voam; os outros do VIII nao', () => {
  for (const t of ['agua_viva', 'agua_viva_b', 'agua_viva_c', 'agua_viva_d', 'mae_das_aguas', 'garuda']) assert.ok(ehVoador(t), t);
  for (const t of ['afogado', 'cardume', 'caranguejo', 'tartaruga', 'serpente_mar', 'kraken', 'capitao_afogado']) assert.ok(!ehVoador(t), t);
  assert.ok(prioridadeAlvo('agua_viva', 3) < prioridadeAlvo('agua_viva', 1));
  for (const c of ['capitao_afogado', 'mae_das_aguas', 'garuda', 'rei_caranguejo', 'serpente_ancia', 'kraken']) assert.ok(ehChefe(c), c);
});

test('agua-viva: choque ao morrer centrado no ultimo heroi mirado atordoa 0,5 s ele e quem esta a 80 px, uma vez', () => {
  // alvo (2,1) em (160,100); vizinho (3,1) em (240,100) a 80 px; longe (0,1) em (0,100) a 160 px
  const alvo = heroi('a', 2, 1), perto = heroi('p', 3, 1), longe = heroi('l', 0, 1);
  const w = mundo([alvo, perto, longe]);
  const av = nascer(w, ini('agua_viva_c', 900, 300, 50));   // morre longe dos herois (ataca a distancia)
  w.quadro(0);
  assert.equal(despacharDanoEmAliado(w.ctx(), av, alvo as any, 28), 28, 'dano do tiro nao muda');
  av.hp = 0; w.quadro(16);
  assert.equal((alvo as any)._atordoadoAte, w.m.agora + 500);
  assert.equal((perto as any)._atordoadoAte, w.m.agora + 500);
  assert.equal((longe as any)._atordoadoAte, undefined);
  (perto as any)._atordoadoAte = 0;
  despacharMorte(w.ctx(), av);   // outro caminho de morte: nao repete
  assert.equal((perto as any)._atordoadoAte, 0);
});

test('tartaruga: couraca reduz 35% do dano (inclusive do golpe que zeraria a vida)', () => {
  const w = mundo();
  const t = nascer(w, ini('tartaruga_b', 800, 300, 1000));
  w.quadro(0);
  t.hp -= 100; w.quadro(16);
  assert.equal(t.hp, 935);
  t.hp -= 1400;                  // 1400 x 0.65 = 910 < 935: sobrevive
  assert.ok(t.hp > 0 && Math.abs(t.hp - 25) < 1e-9, 'a reducao entra antes: o lugar do golpe nunca ve hp <= 0');
  w.quadro(16);
  assert.ok(w.m.inimigos.includes(t)); assert.ok(Math.abs(t.hp - 25) < 1e-9);
  t.hp -= 100; w.quadro(16);    // 65 > 25: morre
  assert.ok(!w.m.inimigos.includes(t)); assert.equal(w.m.pagos, 1);
});

test('Capitao Afogado: ancora a cada 9 s no heroi mais proximo (dano x2, atordoa 1,2 s), aviso 0,8 s antes', () => {
  const perto = heroi('p', 3, 3), longe = heroi('l', 0, 0);
  const w = mundo([perto, longe]);
  const cap = nascer(w, ini('capitao_afogado', 400, 280, 3000, { damage: 60 }));
  w.quadro(0);
  for (let t = 0; t < 81; t++) w.quadro(100);   // 8,1 s
  assert.equal((cap as any)._ancoraAlvo, undefined, 'ainda sem aviso');
  w.quadro(100);                                 // 8,2 s: aviso
  assert.equal((cap as any)._ancoraAlvo, perto);
  assert.equal(w.m.feridos.length, 0);
  for (let t = 0; t < 7; t++) w.quadro(100);
  assert.equal(w.m.feridos.length, 0);
  w.quadro(100);                                 // 9 s
  assert.deepEqual(w.m.feridos, [['p', 120]]);
  assert.equal((perto as any)._atordoadoAte, w.m.agora + 1200);
  assert.equal((longe as any)._atordoadoAte, undefined);
  for (let t = 0; t < 90; t++) w.quadro(100);
  assert.equal(w.m.feridos.length, 2, 'de novo aos 18 s');
});

test('Mae das Aguas: a 66% e a 33% chama 3 aguas-vivas, uma vez cada', () => {
  const w = mundo();
  const mae = nascer(w, ini('mae_das_aguas', 800, 300, 3000));
  w.quadro(0);
  mae.hp = 1950; w.quadro(16);
  assert.equal(doTipo(w, 'agua_viva').length, 3);
  mae.hp = 1850; w.quadro(16);
  assert.equal(doTipo(w, 'agua_viva').length, 3);
  mae.hp = 900; w.quadro(16); mae.hp = 800; w.quadro(16);
  assert.equal(doTipo(w, 'agua_viva').length, 6);
  for (const a of doTipo(w, 'agua_viva')) assert.ok(['agua_viva', 'agua_viva_b', 'agua_viva_c', 'agua_viva_d'].includes(a.type));
});

test('Garuda: vendaval a cada 10 s atordoa 1 s os 2 herois com mais vida (aviso 0,8 s); a 50% chama 2 aguas-vivas', () => {
  const a = heroi('a', 3, 1, 900, 1000), b = heroi('b', 2, 2, 500, 1000), c = heroi('c', 1, 3, 700, 1000);
  const w = mundo([a, b, c]);
  const g = nascer(w, ini('garuda', 800, 300, 3000));
  w.quadro(0);
  for (let t = 0; t < 91; t++) w.quadro(100);   // 9,1 s
  assert.equal((g as any)._vendavalAlvos, undefined);
  w.quadro(100);                                 // 9,2 s: aviso
  assert.deepEqual((g as any)._vendavalAlvos.map((x: any) => x.id), ['a', 'c']);
  for (let t = 0; t < 8; t++) w.quadro(100);
  assert.equal((a as any)._atordoadoAte, w.m.agora + 1000);
  assert.equal((c as any)._atordoadoAte, w.m.agora + 1000);
  assert.equal((b as any)._atordoadoAte, undefined);
  g.hp = 1400; w.quadro(16); g.hp = 1300; w.quadro(16);
  assert.equal(doTipo(w, 'agua_viva').length, 2);
});

test('Rei Caranguejo: carapaca reduz 70% fora da janela e 0% dentro (3 s a cada 10 s)', () => {
  const w = mundo();
  const r = nascer(w, ini('rei_caranguejo', 800, 300, 10000));
  w.quadro(0); w.quadro(1000);
  r.hp -= 1000; w.quadro(16);
  assert.ok(Math.abs(r.hp - 9700) < 1e-6, 'fechado: fica 30%');
  for (let t = 0; t < 60; t++) w.quadro(100);   // ~7,0 s: abre
  assert.ok((r as any)._guardaAberta);
  const hp0 = r.hp;
  r.hp -= 1000; w.quadro(16);
  assert.ok(Math.abs(r.hp - (hp0 - 1000)) < 1e-6, 'aberto: dano cheio');
  for (let t = 0; t < 30; t++) w.quadro(100);   // passou dos 10 s: fecha
  assert.ok(!(r as any)._guardaAberta);
  const hp1 = r.hp;
  r.hp -= 1000; w.quadro(16);
  assert.ok(Math.abs(r.hp - (hp1 - 300)) < 1e-6, 'fechou de novo');
});

test('Serpente Ancia: mergulho a cada 12 s, 1,5 s sem alvo e sem dano; ressurge 120 px adiante sem passar da muralha', () => {
  const w = mundo();
  const s = nascer(w, ini('serpente_ancia', 800, 300, 3000));
  w.quadro(0);
  for (let t = 0; t < 119; t++) w.quadro(100);
  assert.ok(podeSerAlvo(s));
  w.quadro(100);   // 12 s
  assert.ok(!podeSerAlvo(s), 'submersa');
  s.hp -= 500; s.position.x -= 30; w.quadro(16);
  assert.equal(s.hp, 3000, 'nao toma dano');
  assert.equal(s.position.x, 800, 'parada embaixo d agua');
  s.hp = 0; w.quadro(16);
  assert.ok(w.m.inimigos.includes(s) && s.hp === 3000, 'nem morre');
  for (let t = 0; t < 14; t++) w.quadro(100);
  assert.ok(!podeSerAlvo(s));
  w.quadro(100);   // 1,5 s
  assert.ok(podeSerAlvo(s));
  assert.equal(s.position.x, 680);
  // perto da muralha: limite muralhaX + largura/2 = 120
  s.position.x = 180;
  for (let t = 0; t < 120; t++) w.quadro(100);
  for (let t = 0; t < 16; t++) w.quadro(100);
  assert.ok(podeSerAlvo(s));
  assert.equal(s.position.x, 120);
});

test('Kraken: nao passa de 60% do campo; tentaculos so na fileira avisada; submerge uma vez; chama serpentes a 66%/33%', () => {
  const h1 = heroi('a', 3, 2, 1000, 1000), h2 = heroi('b', 1, 2, 1000, 1000), h3 = heroi('c', 2, 5, 1000, 1000);
  const w = mundo([h1, h2, h3]);
  const k = nascer(w, ini('kraken', 900, 300, 10000, { damage: 80 }));
  const lim = CANVAS_WIDTH - (CANVAS_WIDTH - 100) * 0.6;
  assert.equal(limiteKraken(w.ctx()), lim);
  w.quadro(0);
  k.position.x = lim - 200; w.quadro(16);
  assert.equal(k.position.x, lim, 'fica no mar');
  // tentaculos: aviso aos 7 s na fileira com mais herois (2), golpe aos 8 s
  for (let t = 0; t < 69; t++) w.quadro(100);
  assert.equal((k as any)._tentFileira, undefined);
  w.quadro(100);
  assert.equal((k as any)._tentFileira, 2);
  h3.gridPosition = { col: 2, row: 2 }; h1.gridPosition = { col: 3, row: 6 };   // mudou depois do aviso
  for (let t = 0; t < 10; t++) w.quadro(100);
  assert.deepEqual(w.m.feridos.map(f => f[0]).sort(), ['b', 'c'], 'so quem esta na fileira avisada');
  assert.ok(w.m.feridos.every(f => f[1] === 120));
  // 66%: 2 serpentes
  k.hp = 6500; w.quadro(16);
  assert.equal(doTipo(w, 'serpente_mar').length, 2);
  // 50%: submerge 3 s, sem alvo/dano, volta com +5%
  k.hp = 4900; w.quadro(16);
  assert.ok(!podeSerAlvo(k));
  k.hp -= 1000; w.quadro(16);
  assert.equal(k.hp, 4900, 'submerso nao toma dano');
  for (let t = 0; t < 30; t++) w.quadro(100);
  assert.ok(podeSerAlvo(k));
  assert.equal(k.hp, 5400, 'curou 5%');
  k.hp = 4000; w.quadro(16);
  assert.ok(podeSerAlvo(k), 'uma vez so');
  k.hp = 3200; w.quadro(16);
  assert.equal(doTipo(w, 'serpente_mar').length, 4, '33%');
  k.hp = 2000; w.quadro(16);
  assert.equal(doTipo(w, 'serpente_mar').length, 4);
});

test('reducao de dano entra antes da vida mudar (sem morte falsa no lugar do golpe); outros inimigos com fator 1', () => {
  const w = mundo();
  const rei = nascer(w, ini('rei_caranguejo', 800, 300, 2000));
  assert.equal(multiplicadorDano(rei), 0.3);
  let viuMorte = false;
  rei.hp -= 3000;                          // golpe grande com a guarda fechada
  if (rei.hp <= 0) viuMorte = true;        // checagem tipica do GameCanvas (explosao ao matar, almas...)
  assert.ok(!viuMorte); assert.ok(Math.abs(rei.hp - 1100) < 1e-9);
  rei.hp = Math.max(0, rei.hp - 1000);     // outra forma de golpe
  assert.ok(Math.abs(rei.hp - 800) < 1e-9);
  rei.hp = 2000; assert.equal(rei.hp, 2000, 'cura/reposicao passa inteira');
  const gob = nascer(w, ini('goblin', 800, 300, 100));
  assert.equal(multiplicadorDano(gob), 1);
  gob.hp -= 150; assert.equal(gob.hp, -50, 'legado intocado');
  assert.ok(Object.getOwnPropertyDescriptor(gob, 'hp')!.writable, 'legado segue com hp comum');
});

test('submersos nao atacam: Serpente e Kraken marcam _semAtacarAte; tentaculos pausam', () => {
  const w = mundo([heroi('a', 3, 2)]);
  const s = nascer(w, ini('serpente_ancia', 800, 300, 3000));
  const k = nascer(w, ini('kraken', 900, 300, 10000));
  w.quadro(0);
  for (let t = 0; t < 120; t++) w.quadro(100);
  assert.ok(!podeSerAlvo(s)); assert.equal((s as any)._semAtacarAte, (s as any)._mergAte);
  k.hp = 4900; w.quadro(16);
  assert.ok(!podeSerAlvo(k)); assert.equal((k as any)._semAtacarAte, (k as any)._submergeAte);
  const tent = (k as any)._tentT; w.quadro(1000);
  assert.equal((k as any)._tentT, tent, 'tentaculos parados enquanto submerso');
});
