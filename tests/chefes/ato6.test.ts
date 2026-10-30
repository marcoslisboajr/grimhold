// Modulos do Ato VI (Etapa 1b): um teste por habilidade, com inimigos/aliados falsos e CtxChefe falso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { despacharNascer, despacharQuadro, despacharMorte, despacharEvitarMorte, morteSemRecompensa } from '../../components/chefes';
import '../../components/chefes/ato6';
import type { CtxChefe } from '../../components/chefes/tipos';
import { CORO_MEMBROS, CORO_JANELA } from '../../components/chefes/coro';
import { ehVoador, prioridadeAlvo } from '../../components/chefes/lista';

let seq = 0;
function mundo(aliados: any[] = []) {
  const m = { agora: 0, inimigos: [] as any[], aliados, feridos: [] as [string, number][], muralha: 0 };
  const ctx = (): CtxChefe => ({
    agora: m.agora, inimigos: m.inimigos, aliados: m.aliados,
    adicionarInimigo: e => { m.inimigos.push(e); }, falar: () => {},
    novoId: () => `n${++seq}`, muralhaX: 100, chegadaX: 1500,
    posAliado: a => (a as any).pos, ferirAliado: (a, d) => { a.hp -= d; m.feridos.push([a.id, d]); },
    ferirMuralha: d => { m.muralha += d; }, efeito: () => {},
    grade: { cols: 4, rows: 8 }, moverAliado: () => {}, atordoarAliado: () => {},
  });
  // um quadro: todo inimigo vivo passa pelo despacho (como o loop do GameCanvas); mortos saem
  const quadro = (ms: number) => {
    m.agora += ms;
    for (const e of [...m.inimigos]) despacharQuadro(ctx(), e);
    for (const e of [...m.inimigos]) if (e.hp <= 0 && !despacharEvitarMorte(ctx(), e)) { despacharMorte(ctx(), e); m.inimigos.splice(m.inimigos.indexOf(e), 1); }
  };
  return { m, ctx, quadro };
}
const ini = (type: string, x = 800, y = 300, hp = 100, extra: any = {}) =>
  ({ id: `i${++seq}`, type, position: { x, y }, width: 40, height: 40, hp, maxHp: hp, damage: 10, speed: 1, ...extra } as any);
const nascer = (w: ReturnType<typeof mundo>, e: any) => { despacharNascer(w.ctx(), e); w.m.inimigos.push(e); return e; };

test('Cultista-Mor chama 3 cultistas a cada 10 s (so depois de chegar)', () => {
  const w = mundo();
  const mor = nascer(w, ini('cultista_mor', 800, 300, 2600, { damage: 55 }));
  w.quadro(0);
  for (let t = 0; t < 99; t++) w.quadro(100);
  assert.equal(w.m.inimigos.length, 1);
  w.quadro(100);
  assert.equal(w.m.inimigos.length, 4);
  assert.ok(w.m.inimigos.slice(1).every(e => (e.type as string).startsWith('cultista_') && e.hp > 0 && e.hp < mor.hp));
  for (let t = 0; t < 100; t++) w.quadro(100);
  assert.equal(w.m.inimigos.length, 7);
});

test('Coro: 8 coristas em circulo; regente imune com membro vivo e vida = soma', () => {
  const w = mundo();
  const reg = nascer(w, ini('coro', 800, 300, 800));
  assert.equal(w.m.inimigos.filter(e => e.type === 'coro_cultista').length, CORO_MEMBROS);
  w.quadro(16);
  assert.equal(reg.hp, reg.maxHp);
  reg.hp -= 300; w.quadro(16);                       // bateram no regente
  assert.equal(reg.hp, reg.maxHp, 'imune');
  reg.hp = -50;                                      // golpe fatal no regente com coristas vivos
  assert.equal(despacharEvitarMorte(w.ctx(), reg), true);
  assert.ok(reg.hp > 0);
  const m0 = w.m.inimigos.find(e => e.type === 'coro_cultista');
  m0.hp -= 40; w.quadro(16);
  assert.equal(reg.hp, reg.maxHp - 40, 'barra = soma dos membros');
});

test('Coro revive (50%) quem morreu se a janela de 5 s fecha sem todos mortos', () => {
  const w = mundo();
  const reg = nascer(w, ini('coro', 800, 300, 800));
  w.quadro(16);
  const membros = w.m.inimigos.filter(e => e.type === 'coro_cultista');
  membros[0].hp = 0; membros[1].hp = 0;
  w.quadro(16);
  assert.equal(w.m.inimigos.filter(e => e.type === 'coro_cultista').length, 6);
  w.quadro(CORO_JANELA);
  const vivos = w.m.inimigos.filter(e => e.type === 'coro_cultista');
  assert.equal(vivos.length, 8);
  assert.equal(vivos.filter(e => e.hp === Math.ceil(e.maxHp * 0.5)).length, 2);
  const revividos = vivos.filter(e => morteSemRecompensa(e));
  assert.equal(revividos.length, 2, 'revividos nao pagam abate');
  assert.ok(revividos.every(e => e.reward === 0));
  assert.equal(vivos.filter(e => !morteSemRecompensa(e)).length, 6, 'originais pagam');
  assert.ok(w.m.inimigos.includes(reg));
});

test('Coro cai se os 8 morrem dentro da janela (regente morre junto)', () => {
  const w = mundo();
  const reg = nascer(w, ini('coro', 800, 300, 800));
  w.quadro(16);
  const membros = w.m.inimigos.filter(e => e.type === 'coro_cultista');
  membros.slice(0, 4).forEach(e => { e.hp = 0; }); w.quadro(1000);
  membros.slice(4).forEach(e => { e.hp = 0; }); w.quadro(1000);
  w.quadro(16);
  assert.ok(!w.m.inimigos.includes(reg), 'regente caiu');
  assert.equal(w.m.inimigos.length, 0);
});

test('Irma de Cassiel cura so anjos no raio (8% a cada 4 s)', () => {
  const w = mundo();
  nascer(w, ini('irma_de_cassiel', 800, 300, 4000));
  const perto = nascer(w, ini('anjo', 900, 300, 1000)); perto.hp = 500;
  const semAsas = nascer(w, ini('anjo_sem_asas', 800, 400, 1000)); semAsas.hp = 500;
  const longe = nascer(w, ini('anjo_rubro', 1300, 300, 1000)); longe.hp = 500;
  const cult = nascer(w, ini('cultista_negro', 850, 300, 1000)); cult.hp = 500;
  w.quadro(0); w.quadro(3990);
  assert.equal(perto.hp, 500);
  w.quadro(20);
  assert.equal(perto.hp, 580); assert.equal(semAsas.hp, 580);
  assert.equal(longe.hp, 500); assert.equal(cult.hp, 500);
});

test('Irma de Cassiel: com Cassiel em campo nao ataca por 3 s ao chegar', () => {
  const w = mundo([{ id: 'c', type: 'cassiel', hp: 100, maxHp: 100, pos: { x: 0, y: 0 } }]);
  const irma = nascer(w, ini('irma_de_cassiel', 1400, 300, 4000));
  w.quadro(100);
  assert.equal(irma._semAtacarAte, 100 + 3000);
});

test('Fenix Ancia renasce uma vez so (40%), a 2a morte conta', () => {
  const w = mundo();
  const f = nascer(w, ini('fenix_ancia', 800, 300, 1000));
  let mortes = 0;
  w.quadro(16);
  f.hp = -30; w.quadro(16);
  assert.ok(w.m.inimigos.includes(f)); assert.equal(f.hp, 400);
  f.hp = 0;
  assert.equal(despacharEvitarMorte(w.ctx(), f), false);
  w.quadro(16);
  if (!w.m.inimigos.includes(f)) mortes++;
  assert.equal(mortes, 1);
});

test('Serafim chama 3 anjos a 66% e a 33%, uma vez cada; Julgamento tira 15% do heroi com mais vida', () => {
  const a1 = { id: 'a1', type: 'mage', hp: 300, maxHp: 400, pos: { x: 50, y: 300 } };
  const a2 = { id: 'a2', type: 'paladin', hp: 900, maxHp: 1000, pos: { x: 60, y: 200 } };
  const w = mundo([a1, a2]);
  const s = nascer(w, ini('serafim_caido', 800, 300, 3000));
  w.quadro(0);
  s.hp = 1900; w.quadro(16); w.quadro(16);
  assert.equal(w.m.inimigos.filter(e => (e.type as string).startsWith('anjo')).length, 3);
  s.hp = 1800; w.quadro(16);
  assert.equal(w.m.inimigos.filter(e => (e.type as string).startsWith('anjo')).length, 3);
  s.hp = 900; w.quadro(16); s.hp = 800; w.quadro(16);
  assert.equal(w.m.inimigos.filter(e => (e.type as string).startsWith('anjo')).length, 6);
  for (let t = 0; t < 80; t++) w.quadro(100);
  assert.deepEqual(w.m.feridos, [['a2', 150]]);
});

test('Cultista branco cura 5% no raio de 150 a cada 3 s e nao a si mesmo', () => {
  const w = mundo();
  const b = nascer(w, ini('cultista_branco', 800, 300, 1000)); b.hp = 500;
  const perto = nascer(w, ini('lich6', 900, 300, 1000)); perto.hp = 500;
  const longe = nascer(w, ini('lich6', 1000, 300, 1000)); longe.hp = 500;
  w.quadro(0); w.quadro(3000);
  assert.equal(perto.hp, 550); assert.equal(longe.hp, 500); assert.equal(b.hp, 500);
});

test('Cultista verde para a 60 px da muralha, pisca 0,6 s e explode uma vez (heroi + muralha)', () => {
  const heroi = { id: 'h', type: 'mage', hp: 500, maxHp: 500, pos: { x: 170, y: 320 } };
  const w = mundo([heroi]);
  const v = nascer(w, ini('cultista_verde', 170, 300, 100, { damage: 20 }));   // 50 px da muralha (100 + 20)
  w.quadro(16);
  assert.ok(v._pavioEm !== undefined);
  v.position.x -= 30; w.quadro(300);
  assert.equal(v.position.x, 170, 'parado');
  assert.equal(w.m.muralha, 0);
  w.quadro(400);
  assert.equal(w.m.muralha, 60); assert.deepEqual(w.m.feridos, [['h', 60]]);
  assert.ok(!w.m.inimigos.includes(v));
  w.quadro(1000);
  assert.equal(w.m.muralha, 60);
});

test('Cultista vermelho dobra o dano de demonios no raio de 180 e devolve ao morrer', () => {
  const w = mundo();
  const c = nascer(w, ini('cultista_vermelho', 800, 300, 100));
  const d = nascer(w, ini('imp', 900, 300, 100, { damage: 15 }));
  const g = nascer(w, ini('goblin', 850, 300, 100, { damage: 15 }));
  w.quadro(16);
  assert.equal(d.damage, 30); assert.equal(g.damage, 15);
  w.quadro(16);
  assert.equal(d.damage, 30, 'nao acumula');
  c.hp = 0; w.quadro(16);
  assert.equal(d.damage, 30, 'ainda dentro dos 300 ms');
  w.quadro(400);
  assert.equal(d.damage, 15, 'expira do lado do demonio');
});

test('Canal do vermelho expira mesmo se o ultimo vermelho sai do campo sem morrer', () => {
  const w = mundo();
  const c = nascer(w, ini('cultista_vermelho', 800, 300, 100));
  const d = nascer(w, ini('demon', 900, 300, 100, { damage: 20 }));
  w.quadro(16);
  assert.equal(d.damage, 40);
  w.m.inimigos.splice(w.m.inimigos.indexOf(c), 1);   // encostou na muralha: removido sem despacharMorte
  w.quadro(400);
  assert.equal(d.damage, 20);
});

test('Hoste Caida voa e passa por cima da Vanguarda; anjo sem asas anda no chao', () => {
  for (const t of ['anjo', 'anjo_rubro', 'anjo_sombrio', 'anjo_caido', 'irma_de_cassiel', 'serafim_caido', 'morcego', 'morcego_rubro', 'fenix', 'fenix_do_caos', 'fenix_ancia']) assert.ok(ehVoador(t), t);
  for (const t of ['anjo_sem_asas', 'anjo_sem_asas_rubro', 'cultista_verde', 'goblin', 'fallen_seraph']) assert.ok(!ehVoador(t), t);
  assert.ok(prioridadeAlvo('anjo', 3) < prioridadeAlvo('anjo', 1));
  assert.ok(prioridadeAlvo('anjo', 3) > -1, 'Vanguarda ainda e alvo se for a unica');
  assert.equal(prioridadeAlvo('goblin', 3), 3);
});
