// Modulos do Ato VII (Etapa 1c): um teste por habilidade, com inimigos/aliados falsos e CtxChefe falso.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { despacharNascer, despacharQuadro, despacharMorte, despacharEvitarMorte, morteSemRecompensa, despacharAlvo, despacharDanoEmAliado } from '../../components/chefes';
import '../../components/chefes/ato7';
import type { CtxChefe } from '../../components/chefes/tipos';
import { ehVoador, prioridadeAlvo } from '../../components/chefes/lista';
import { OSSOTH_CADA } from '../../components/chefes/ossoth';

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
  // um quadro como o loop do GameCanvas: despacho por inimigo; mortos saem (com ou sem recompensa)
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
const doTipo = (w: ReturnType<typeof mundo>, t: string) => w.m.inimigos.filter(e => e.type === t);

test('Sapo-Xama ergue totem a cada 9 s (parado 1 s); totem cura 4% no raio de 140 a cada 2 s e expira em 10 s sem pagar', () => {
  const w = mundo();
  const xama = nascer(w, ini('sapo_xama', 800, 300, 100));
  const perto = nascer(w, ini('sapo', 880, 300, 1000)); perto.hp = 500;
  const longe = nascer(w, ini('sapo', 1100, 300, 1000)); longe.hp = 500;
  w.quadro(0); w.quadro(8990);
  assert.equal(doTipo(w, 'totem_xama').length, 0);
  w.quadro(10);
  const [totem] = doTipo(w, 'totem_xama');
  assert.ok(totem, 'ergueu o totem');
  assert.ok(totem.hp < xama.maxHp && totem.speed === 0 && totem.damage === 0);
  xama.position.x -= 50; w.quadro(500);
  assert.equal(xama.position.x, 800, 'parado 1 s');
  w.quadro(600); xama.position.x -= 50; w.quadro(16);
  assert.equal(xama.position.x, 750, 'anda de novo');
  const tx = totem.position.x;
  totem.position.x -= 30; w.quadro(16);
  assert.equal(totem.position.x, tx, 'totem nao anda');
  // curas: 2 s de quadros do totem (o 1o quadro dele, o de 500 ms, tem dt 0)
  const hp0 = perto.hp;
  w.quadro(2000 - 600 - 16 - 16 - 1);
  assert.equal(perto.hp, hp0);
  w.quadro(1);
  assert.equal(perto.hp, hp0 + 40); assert.equal(longe.hp, 500);
  const pagosAntes = w.m.pagos;
  for (let t = 0; t < 90; t++) w.quadro(100);
  assert.ok(!w.m.inimigos.includes(totem), 'expirou');
  assert.equal(w.m.pagos, pagosAntes, 'expirar nao paga abate');
});

test('vespas voam (sombra, prioridade de alvo); sapos nao', () => {
  for (const t of ['vespa', 'vespa_b', 'vespa_c']) assert.ok(ehVoador(t), t);
  for (const t of ['sapo', 'rato', 'lobo', 'totem_xama']) assert.ok(!ehVoador(t), t);
  assert.ok(prioridadeAlvo('vespa', 3) < prioridadeAlvo('vespa', 1));
});

test('Sapo-Rei chama 2 sapos a cada 10 s (so depois de chegar)', () => {
  const w = mundo();
  nascer(w, ini('sapo_rei', 1600, 300, 2900, { damage: 58 }));
  for (let t = 0; t < 120; t++) w.quadro(100);
  assert.equal(doTipo(w, 'sapo').length, 0, 'fora do campo nao chama');
  w.m.inimigos[0].position.x = 800;
  w.quadro(0);
  for (let t = 0; t < 99; t++) w.quadro(100);
  assert.equal(doTipo(w, 'sapo').length, 0);
  w.quadro(100);
  assert.equal(doTipo(w, 'sapo').length, 2);
  for (let t = 0; t < 100; t++) w.quadro(100);
  assert.equal(doTipo(w, 'sapo').length, 4);
});

test("Kwa'Zul: lingua a cada 8 s puxa o heroi mais distante para a Vanguarda e atordoa 1,5 s", () => {
  const fundo = heroi('f', 0, 5), meio = heroi('m', 2, 2);
  const w = mundo([fundo, meio]);
  nascer(w, ini('kwazul', 800, 300, 4000));
  w.quadro(0);
  for (let t = 0; t < 79; t++) w.quadro(100);
  assert.deepEqual(fundo.gridPosition, { col: 0, row: 5 });
  w.quadro(100);
  assert.deepEqual(fundo.gridPosition, { col: 3, row: 5 }, 'mesma linha na coluna da frente');
  assert.equal((fundo as any)._atordoadoAte, w.m.agora + 1500);
  assert.deepEqual(meio.gridPosition, { col: 2, row: 2 });
});

test("Kwa'Zul: celula da frente ocupada vai para a livre mais proxima; frente cheia so atordoa", () => {
  const alvo = heroi('a', 1, 4);
  const vizinhos = [heroi('v4', 3, 4), heroi('v3', 3, 3)];
  const w = mundo([alvo, ...vizinhos]);
  nascer(w, ini('kwazul', 800, 300, 4000));
  w.quadro(0); w.quadro(8000);
  assert.deepEqual(alvo.gridPosition, { col: 3, row: 5 }, 'linha 4 ocupada: vai para a 5');
  const alvo2 = heroi('b', 0, 1);
  const cheia = Array.from({ length: 8 }, (_, r) => heroi(`c${r}`, 3, r));
  const w2 = mundo([alvo2, ...cheia]);
  nascer(w2, ini('kwazul', 800, 300, 4000));
  w2.quadro(0); w2.quadro(8000);
  assert.deepEqual(alvo2.gridPosition, { col: 0, row: 1 }, 'sem celula livre: fica');
  assert.equal((alvo2 as any)._atordoadoAte, w2.m.agora + 1500, 'mas atordoa');
});

test('Alfa da Matilha: uivo so em lobos (+30% vel, +20% dano), expira em 5 s; a 50% chama 2 lobos', () => {
  const w = mundo();
  const alfa = nascer(w, ini('alfa_matilha', 800, 300, 3000));
  const lobo = nascer(w, ini('lobo', 900, 300, 100, { damage: 50, speed: 1 }));
  const tribo = nascer(w, ini('tribo_lobo_b', 900, 400, 100, { damage: 50, speed: 1 }));
  const javali = nascer(w, ini('javali', 900, 200, 100, { damage: 50, speed: 1 }));
  w.quadro(0); w.quadro(12000);
  assert.equal(lobo.damage, 60); assert.ok(Math.abs(lobo.speed - 1.3) < 1e-9);
  assert.equal(tribo.damage, 60);
  assert.equal(javali.damage, 50); assert.equal(javali.speed, 1);
  w.quadro(4900);
  assert.equal(lobo.damage, 60, 'ainda nos 5 s');
  w.quadro(200);
  assert.equal(lobo.damage, 50); assert.equal(lobo.speed, 1, 'expirou do lado do lobo');
  assert.equal(doTipo(w, 'lobo').length, 1);
  // o que mudou durante o uivo continua depois (so o multiplicador sai)
  w.quadro(0); w.quadro(6900);
  assert.ok(Math.abs(lobo.speed - 1.3) < 1e-9);
  lobo.speed = 1.3 * 0.5; lobo.damage += 6;   // outro efeito no meio do uivo
  w.quadro(5100);
  assert.ok(Math.abs(lobo.speed - 0.5) < 1e-9); assert.ok(Math.abs(lobo.damage - 55) < 1e-9);
  alfa.hp = 1400; w.quadro(16); alfa.hp = 1300; w.quadro(16);
  assert.equal(doTipo(w, 'lobo').length, 3, 'chamou 2 lobos uma vez');
});

test('Xiphra: mira o heroi com menor % de vida; critico x2 so abaixo de 25%', () => {
  const w = mundo();
  const x = nascer(w, ini('xiphra', 800, 300, 4000, { damage: 80 }));
  const cheio = heroi('a', 3, 1, 900, 1000), ferido = heroi('b', 1, 2, 300, 1000), quase = heroi('c', 2, 3, 240, 1000);
  assert.equal(despacharAlvo(w.ctx(), x, [cheio as any, ferido as any]), ferido);
  assert.equal(despacharAlvo(w.ctx(), x, [cheio as any, ferido as any, quase as any]), quase);
  assert.equal(despacharDanoEmAliado(w.ctx(), x, ferido as any, 80), 80, '30%: sem critico');
  assert.equal(despacharDanoEmAliado(w.ctx(), x, quase as any, 80), 160, '24%: critico');
  assert.equal(despacharAlvo(w.ctx(), ini('goblin'), [cheio as any, ferido as any]), undefined, 'outros tipos: jogo decide');
  assert.equal(despacharDanoEmAliado(w.ctx(), ini('goblin'), quase as any, 80), 80);
});

test('Chefe Tribal chama 1 guerreiro de cada tribo a 66% e a 33%, uma vez cada', () => {
  const w = mundo();
  const c = nascer(w, ini('chefe_tribal', 800, 300, 3000));
  const tribos = () => w.m.inimigos.filter(e => (e.type as string).startsWith('tribo_'));
  w.quadro(0);
  c.hp = 1900; w.quadro(16);
  assert.deepEqual(tribos().map(e => e.type).sort(), ['tribo_ave', 'tribo_lobo', 'tribo_peixe', 'tribo_raposa']);
  c.hp = 1800; w.quadro(16);
  assert.equal(tribos().length, 4);
  c.hp = 900; w.quadro(16); c.hp = 800; w.quadro(16);
  assert.equal(tribos().length, 8);
});

test('Ossoth: 1a morte do gigante paga, volta uma copia com 50% que nao paga; uma vez por gigante; respeita os 20 s', () => {
  const w = mundo();
  nascer(w, ini('ossoth', 1000, 300, 4000));
  const sapo = nascer(w, ini('sapo', 800, 300, 100));
  const lobo = nascer(w, ini('lobo', 800, 400, 200));
  const javali = nascer(w, ini('javali', 800, 200, 200));
  w.quadro(0);
  sapo.hp = 0; w.quadro(16);
  assert.equal(w.m.pagos, 1); assert.equal(w.m.inimigos.length, 3, 'sapo nao e gigante');
  lobo.hp = 0; w.quadro(16);
  assert.equal(w.m.pagos, 2, '1a morte do lobo paga normal');
  const copia = w.m.inimigos.find(e => e.type === 'lobo');
  assert.ok(copia && copia !== lobo && copia.hp === 100 && morteSemRecompensa(copia), 'volta com 50%, sem recompensa');
  javali.hp = 0; w.quadro(16);
  assert.equal(w.m.pagos, 3);
  assert.ok(!w.m.inimigos.some(e => e.type === 'javali'), 'antes dos 20 s: nao volta');
  copia.hp = 0; w.quadro(16);
  assert.equal(w.m.pagos, 3, '2a morte nao paga');
  assert.ok(!w.m.inimigos.some(e => e.type === 'lobo'), 'uma vez por gigante');
  w.quadro(OSSOTH_CADA);
  const guerreiro = nascer(w, ini('tribo_ave_b', 800, 300, 300));
  guerreiro.hp = 0; w.quadro(16);
  assert.equal(w.m.pagos, 4);
  assert.ok(w.m.inimigos.some(e => e.type === 'tribo_ave_b' && e.hp === 150), 'guerreiro de tribo conta como gigante; depois dos 20 s volta');
});

test('Ossoth morto nao ressuscita ninguem', () => {
  const w = mundo();
  const o = nascer(w, ini('ossoth', 1000, 300, 4000));
  const lobo = nascer(w, ini('lobo', 800, 400, 200));
  w.quadro(0);
  o.hp = 0; w.quadro(16);
  lobo.hp = 0; w.quadro(16);
  assert.ok(!w.m.inimigos.some(e => e.type === 'lobo'));
});
