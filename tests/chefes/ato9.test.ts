// Modulos do Ato IX (Etapa 2b): um teste por habilidade, com inimigos/aliados falsos e CtxChefe falso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { despacharNascer, despacharQuadro, despacharMorte, despacharEvitarMorte, morteSemRecompensa, podeSerAlvo, despacharDanoEmAliado, multiplicadorDano, vidaNaBarra, fioDe } from '../../components/chefes';
import '../../components/chefes/ato9';
import type { CtxChefe } from '../../components/chefes/tipos';
import { ehVoador, ehChefe, ignoraChao } from '../../components/chefes/lista';
import { DRIDER_TOPO } from '../../components/chefes/drider';

let seq = 0;
function mundo(aliados: any[] = []) {
  const m = { agora: 0, inimigos: [] as any[], aliados, feridos: [] as [string, number][], pagos: 0, semPagar: 0, falas: [] as string[] };
  const ctx = (): CtxChefe => ({
    agora: m.agora, inimigos: m.inimigos, aliados: m.aliados,
    adicionarInimigo: e => { m.inimigos.push(e); }, falar: (e, modo) => { m.falas.push(`${e.type}.${modo}`); },
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
const heroi = (id: string, col: number, row: number, hp = 100, maxHp = 100) => ({ id, type: 'mage', hp, maxHp, gridPosition: { col, row } });
const doTipo = (w: ReturnType<typeof mundo>, p: string) => w.m.inimigos.filter(e => (e.type as string).startsWith(p));
const passa = (w: ReturnType<typeof mundo>, ms: number, passo = 100) => { for (let t = 0; t < ms; t += passo) w.quadro(passo); };

test('cranios e Quimera voam; so a Quimera ignora o chao; os 7 chefes do IX sao chefes', () => {
  for (const t of ['cranio', 'cranio_b', 'cranio_c', 'cranio_d', 'cranio_ancestral', 'quimera']) assert.ok(ehVoador(t), t);
  for (const t of ['legiao', 'mumia', 'estatua_lamina', 'beholder9', 'cerbero', 'aranha', 'drider', 'estatua_leste', 'general_ossos', 'cerbero_alfa']) assert.ok(!ehVoador(t), t);
  assert.ok(ignoraChao('quimera'));
  for (const t of ['cranio', 'garuda', 'anjo', 'vespa', 'agua_viva']) assert.ok(!ignoraChao(t), t);
  for (const c of ['general_ossos', 'cranio_ancestral', 'drider', 'estatua_leste', 'estatua_oeste', 'cerbero_alfa', 'quimera']) assert.ok(ehChefe(c), c);
  assert.ok(!ehChefe('aranha') && !ehChefe('legiao_e') && !ehChefe('beholder9'));
});

test('estatua-lamina: pele de pedra reduz 25% (inclusive o golpe que zeraria a vida)', () => {
  const w = mundo();
  const e = nascer(w, ini('estatua_lamina_c', 800, 300, 1000));
  w.quadro(0);
  assert.equal(multiplicadorDano(e), 0.75);
  e.hp -= 100; assert.equal(e.hp, 925);
  e.hp -= 1200; assert.ok(e.hp > 0 && Math.abs(e.hp - 25) < 1e-9, 'a reducao entra antes da vida mudar');
  e.hp -= 100; w.quadro(16);
  assert.ok(!w.m.inimigos.includes(e)); assert.equal(w.m.pagos, 1);
});

test('General de Ossos: bloco de 6 ao nascer e a cada 15 s; -40% so com 4+ vivos; para ao morrer', () => {
  const w = mundo();
  const g = nascer(w, ini('general_ossos', 900, 300, 3000));
  assert.equal(doTipo(w, 'legiao').length, 6, 'ao nascer');
  const bloco = (g as any)._blocos[0];
  // 2 colunas x 3 linhas, atras dele (x maior), mesma velocidade (a do mais lento)
  assert.equal(new Set(bloco.map((m: any) => m.position.x)).size, 2);
  assert.equal(new Set(bloco.map((m: any) => m.position.y)).size, 3);
  for (const m of bloco) assert.ok(m.position.x > g.position.x + g.width / 2);
  assert.equal(new Set(bloco.map((m: any) => m.speed)).size, 1);
  for (const m of bloco) assert.ok(['legiao', 'legiao_b', 'legiao_c', 'legiao_d', 'legiao_e'].includes(m.type));
  const alvo = bloco[0], hp0 = alvo.hp;
  alvo.hp -= 10; assert.ok(Math.abs(alvo.hp - (hp0 - 6)) < 1e-9, '6 vivos: fica 60%');
  bloco[1].hp -= 1e6; bloco[2].hp -= 1e6; w.quadro(16);   // 4 vivos: ainda reduz
  const hp1 = alvo.hp; alvo.hp -= 10; assert.ok(Math.abs(alvo.hp - (hp1 - 6)) < 1e-9, '4 vivos');
  bloco[3].hp -= 1e6; w.quadro(16);                   // 3 vivos: dano cheio
  const hp2 = alvo.hp; alvo.hp -= 10; assert.ok(Math.abs(alvo.hp - (hp2 - 10)) < 1e-9, '3 vivos');
  assert.equal(w.m.pagos, 3, 'membros pagam normal');
  w.quadro(0); passa(w, 14800);
  assert.equal((g as any)._blocos.length, 1);
  passa(w, 300);
  assert.equal((g as any)._blocos.length, 2, 'de novo aos 15 s');
  g.hp = 0; w.quadro(16);
  passa(w, 31000);
  assert.equal((g as any)._blocos.length, 2, 'morto nao chama');
});

test('Cranio Ancestral: a cada 8 s cospe 2 cranios em chamas; abaixo de 50% cospe 3', () => {
  const w = mundo();
  const c = nascer(w, ini('cranio_ancestral', 800, 300, 3000));
  w.quadro(0); passa(w, 7900);
  assert.equal(doTipo(w, 'cranio_c').length, 0);
  passa(w, 100);
  assert.equal(doTipo(w, 'cranio_c').length, 2);
  for (const s of doTipo(w, 'cranio_c')) assert.ok(s.position.x < c.position.x, 'a frente dele');
  c.hp = 1400; passa(w, 8000);
  assert.equal(doTipo(w, 'cranio_c').length, 5);
});

test('Drider: desce 1,5 s / embaixo 8 s / sobe 1,5 s / em cima 4 s; sem alvo so em cima; 2 crias sem ouro; fio exposto', () => {
  const w = mundo();
  const d = nascer(w, ini('drider', 900, 400, 5000));
  const x = d as any;
  assert.equal(x._fase, 'desce'); assert.equal(d.position.y, DRIDER_TOPO);
  let f = fioDe(d)!;
  assert.deepEqual(f, { x: 920, y0: 0, y1: DRIDER_TOPO + 12 });
  w.quadro(0); passa(w, 700);
  assert.ok(d.position.y > DRIDER_TOPO && d.position.y < 400, 'descendo');
  assert.ok(podeSerAlvo(d));
  passa(w, 800);
  assert.equal(x._fase, 'embaixo'); assert.equal(d.position.y, 400);
  f = fioDe(d)!; assert.equal(f.y0, 0); assert.equal(f.y1, 412); assert.equal(f.x, d.position.x + 20);
  d.position.x -= 50;                        // anda embaixo
  passa(w, 7900);
  assert.equal(x._fase, 'embaixo'); assert.ok(podeSerAlvo(d));
  passa(w, 100);
  assert.equal(x._fase, 'sobe'); assert.ok(podeSerAlvo(d), 'subindo ainda pode ser alvo');
  const xFixo = d.position.x;
  d.position.x -= 30; passa(w, 700);        // o jogo tenta andar: nao avanca
  assert.equal(d.position.x, xFixo); assert.ok(d.position.y < 400 && d.position.y > DRIDER_TOPO);
  assert.ok(x._semAtacarAte >= w.m.agora);
  passa(w, 800);
  assert.equal(x._fase, 'cima'); assert.equal(d.position.y, DRIDER_TOPO);
  assert.ok(!podeSerAlvo(d), 'em cima: fora de alcance');
  assert.ok(fioDe(d)!.y1 < 412, 'o fio encurta');
  assert.equal(doTipo(w, 'aranha').length, 2);
  for (const a of doTipo(w, 'aranha')) { assert.ok(morteSemRecompensa(a)); assert.equal(a.reward, 0); }
  assert.deepEqual(w.m.falas, ['drider.meio']);
  const hp = d.hp; d.hp -= 1000; assert.equal(d.hp, hp, 'em cima nao toma dano');
  d.position.x -= 30; passa(w, 1000); assert.equal(d.position.x, xFixo);
  // crias descem pelo fio ate o chao
  passa(w, 1000);
  for (const a of doTipo(w, 'aranha')) { assert.equal((a as any)._desceAte, undefined, 'chegaram ao chao'); assert.ok(a.position.y > 300); }
  passa(w, 1900);
  assert.equal(x._fase, 'cima');
  passa(w, 100);
  assert.equal(x._fase, 'desce'); assert.ok(podeSerAlvo(d));
  // crias mortas nao pagam
  for (const a of doTipo(w, 'aranha')) a.hp = 0;
  w.quadro(16);
  assert.equal(w.m.pagos, 0); assert.equal(w.m.semPagar, 2);
  passa(w, 1500 + 8000 + 1500);
  assert.equal(doTipo(w, 'aranha').length, 2, '2 por subida');
  assert.deepEqual(w.m.falas, ['drider.meio'], 'fala do meio uma vez');
});

test('Estatuas: Leste cria a Oeste 160 px abaixo (ou acima); cura mutua 3% a cada 3 s so com as duas de pe; barra somada', () => {
  const w = mundo();
  const l = nascer(w, ini('estatua_leste', 900, 300, 1000));
  const o = w.m.inimigos.find(e => e.type === 'estatua_oeste');
  assert.ok(o); assert.equal(o.position.y, 460); assert.equal(o.maxHp, 1000);
  const w2 = mundo(); nascer(w2, ini('estatua_leste', 900, 600, 1000));
  assert.equal(w2.m.inimigos.find(e => e.type === 'estatua_oeste').position.y, 440, 'sem espaco embaixo: acima');
  w.quadro(0);
  l.hp = 500; o.hp = 800;
  assert.deepEqual(vidaNaBarra(l), { hp: 1300, max: 2000 }); assert.deepEqual(vidaNaBarra(o), { hp: 1300, max: 2000 });
  passa(w, 2900); assert.equal(l.hp, 500);
  passa(w, 100); assert.equal(l.hp, 530); assert.equal(o.hp, 830);
  // Oeste cai: sem cura enquanto caida; barra conta 0 para ela
  o.hp -= 5000;
  assert.equal(o.hp, 1, 'caida nao morre (ninguem ve hp <= 0)');
  assert.ok(!podeSerAlvo(o));
  assert.deepEqual(vidaNaBarra(l), { hp: 530, max: 2000 });
  passa(w, 3000); assert.equal(l.hp, 530, 'sem cura com uma caida');
  o.hp -= 100; assert.equal(o.hp, 1, 'caida imune');
});

test('Estatuas: janela de 8 s — as duas caem dentro dela: fim (cada uma paga uma vez); senao a caida volta com 40% sem pagar', () => {
  const w = mundo();
  const l = nascer(w, ini('estatua_leste', 900, 300, 1000));
  const o = w.m.inimigos.find(e => e.type === 'estatua_oeste');
  w.quadro(0);
  const ox = o.position.x;
  o.hp = 0; w.quadro(16);
  assert.ok(w.m.inimigos.includes(o), 'caiu, nao morreu'); assert.equal(w.m.pagos, 0);
  o.position.x -= 40; w.quadro(16); assert.equal(o.position.x, ox, 'caida fica parada');
  passa(w, 7900);
  assert.ok(!podeSerAlvo(o));
  passa(w, 100);
  assert.ok(podeSerAlvo(o)); assert.equal(o.hp, 400, 'volta com 40%'); assert.equal(w.m.pagos, 0, 'volta sem pagar');
  assert.ok(w.m.falas.includes('estatua_leste.meio'));
  // Leste cai; Oeste nao cai dentro da janela: Leste volta
  l.hp -= 99999; w.quadro(16);
  assert.equal(l.hp, 1); passa(w, 8100);
  assert.equal(l.hp, 400); assert.equal(w.m.pagos, 0);
  // a janela recomeca na proxima queda: Leste cai, Oeste cai 5 s depois: fim das duas
  l.hp = 0; w.quadro(16); passa(w, 5000);
  o.hp -= 99999; w.quadro(16);
  assert.ok(!w.m.inimigos.includes(o) && !w.m.inimigos.includes(l), 'as duas morrem de vez');
  assert.equal(w.m.pagos, 2, 'cada estatua paga uma vez so');
});

test('Cerbero Alfa: acerta o alvo e ate 2 herois a ate 90 px (x0,6); a 50% chama 2 cerberos uma vez', () => {
  // alvo (1,1)=(80,100); (2,1)=(160,100) a 80; (0,1)=(0,100) a 80; (1,2)=(80,200) a 100 (fora); (2,0)=(160,0) fora
  const alvo = heroi('a', 1, 1), p1 = heroi('p1', 2, 1), p2 = heroi('p2', 0, 1), longe = heroi('l', 1, 2), longe2 = heroi('l2', 2, 0);
  const w = mundo([alvo, p1, p2, longe, longe2]);
  const c = nascer(w, ini('cerbero_alfa', 800, 300, 3000));
  w.quadro(0);
  assert.equal(despacharDanoEmAliado(w.ctx(), c, alvo as any, 100), 100, 'dano no alvo nao muda');
  assert.deepEqual(w.m.feridos.map(f => f[0]).sort(), ['p1', 'p2']);
  assert.ok(w.m.feridos.every(f => f[1] === 60));
  // com 3 perto, so os 2 mais proximos
  const w2 = mundo([heroi('a', 1, 1), heroi('b', 1, 1.5), heroi('c', 2, 1), heroi('d', 0.5, 1)]);
  const c2 = nascer(w2, ini('cerbero_alfa'));
  despacharDanoEmAliado(w2.ctx(), c2, w2.m.aliados[0], 50);
  assert.deepEqual(w2.m.feridos.map(f => f[0]).sort(), ['b', 'd']);
  c.hp = 1400; w.quadro(16); c.hp = 1300; w.quadro(16); c.hp = 500; w.quadro(16);
  assert.equal(w.m.inimigos.filter(e => e.type === 'cerbero').length, 2);
});

test('Quimera: sopro so na fileira avisada (aviso 1 s, dano x1,2); chama 2 estatuas-lamina a 66% e a 33%, uma vez cada', () => {
  const h1 = heroi('a', 3, 4, 1000, 1000), h2 = heroi('b', 1, 4, 1000, 1000), h3 = heroi('c', 2, 6, 1000, 1000);
  const w = mundo([h1, h2, h3]);
  const q = nascer(w, ini('quimera', 900, 300, 10000, { damage: 100 }));
  w.quadro(0); passa(w, 8900);
  assert.equal((q as any)._soproFileira, undefined);
  passa(w, 100);
  assert.equal((q as any)._soproFileira, 4);
  h3.gridPosition = { col: 2, row: 4 }; h1.gridPosition = { col: 3, row: 7 };   // mudou depois do aviso
  passa(w, 1000);
  assert.deepEqual(w.m.feridos.map(f => f[0]).sort(), ['b', 'c']);
  assert.ok(w.m.feridos.every(f => f[1] === 120));
  q.hp = 6500; w.quadro(16); q.hp = 6000; w.quadro(16);
  assert.equal(doTipo(w, 'estatua_lamina').length, 2);
  q.hp = 3200; w.quadro(16); q.hp = 2000; w.quadro(16);
  assert.equal(doTipo(w, 'estatua_lamina').length, 4);
});

test('General de Ossos: no maximo 4 blocos por General (o do nascimento conta); membros pagam', () => {
  const w = mundo();
  const g = nascer(w, ini('general_ossos', 900, 300, 3000));
  w.quadro(0); passa(w, 120000);
  assert.equal((g as any)._blocos.length, 4);
  assert.equal(doTipo(w, 'legiao').length, 24);
  for (const m of doTipo(w, 'legiao')) assert.ok(!morteSemRecompensa(m));
});

test('invocados por timer nao pagam: cranios cuspidos, cultistas do Cultista-Mor, sapos do Sapo-Rei', async () => {
  await import('../../components/chefes/ato6'); await import('../../components/chefes/ato7');
  for (const [chefe, prefixo] of [['cranio_ancestral', 'cranio_c'], ['cultista_mor', 'cultista_'], ['sapo_rei', 'sapo']] as const) {
    const w = mundo();
    nascer(w, ini(chefe, 800, 300, 3000));
    w.quadro(0); passa(w, 10000);
    const inv = w.m.inimigos.filter(e => e.type !== chefe && (e.type as string).startsWith(prefixo));
    assert.ok(inv.length >= 2, chefe);
    for (const e of inv) { assert.ok(morteSemRecompensa(e), `${chefe}: ${e.type}`); assert.equal(e.reward, 0); }
  }
});

test('Estatua do Oeste nao compartilha objetos aninhados com a Leste', () => {
  const w = mundo();
  const l = nascer(w, ini('estatua_leste', 900, 300, 1000, { extra: { lista: [1] }, bleed: { n: 1 } }));
  const o = w.m.inimigos.find(e => e.type === 'estatua_oeste');
  assert.notEqual(o.position, l.position); assert.notEqual(o.extra, l.extra); assert.notEqual(o.extra.lista, l.extra.lista);
  assert.deepEqual(o.extra, { lista: [1] });
  o.extra.lista.push(2); assert.deepEqual(l.extra.lista, [1]);
});
