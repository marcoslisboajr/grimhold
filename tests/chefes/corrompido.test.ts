// Heroi Corrompido (Etapa 3b): regras da chave, troca do chefe, habilidades do lote 1 e sprites.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { despacharQuadro } from '../../components/chefes';
import '../../components/chefes/ato10';
import { CHAVE_CORROMPIDO, lerCorrompido, gravarVitoria, chefeDaOnda30, HABILIDADES_CORROMPIDAS, EGIDE_ACERTOS, ENCANTO_MS, CARTA_ATORDOA, GRACA_CURA } from '../../components/chefes/corrompido';
import { HEROIS_CORROMPIVEIS, CHEFES_TIPOS } from '../../components/chefes/lista';
import type { CtxChefe } from '../../components/chefes/tipos';

const guarda = () => { const m = new Map<string, string>(); return { m, get: (k: string) => m.get(k) ?? null, set: (k: string, v: string) => { m.set(k, v); }, remove: (k: string) => { m.delete(k); } }; };

test('regras 1-4: grava o vencedor, troca o chefe da 30, Y==X volta o Malachar, 1a vez Malachar', () => {
  const s = guarda();
  assert.equal(lerCorrompido(s), undefined);
  assert.equal(chefeDaOnda30(lerCorrompido(s)), undefined, '1a vitoria: Malachar');
  assert.equal(gravarVitoria(s, 'mage', undefined), 'gravou');
  assert.equal(s.m.get(CHAVE_CORROMPIDO), 'mage');
  assert.equal(chefeDaOnda30(lerCorrompido(s)), 'corrupted_mage');
  assert.equal(gravarVitoria(s, 'yue', 'mage'), 'gravou', 'Y vence X: Y vira o corrompido');
  assert.equal(lerCorrompido(s), 'yue');
  assert.equal(gravarVitoria(s, 'yue', 'yue'), 'resistiu');
  assert.equal(lerCorrompido(s), undefined, 'Y == X: volta o Malachar');
  s.set(CHAVE_CORROMPIDO, 'lixo');
  assert.equal(lerCorrompido(s), undefined, 'valor invalido: Malachar');
});

test('todo heroi jogavel tem chefe corrompido (tipo de chefe) e sprite 1..4', () => {
  const raiz = process.env.GRIM_RAIZ!;
  const src = fs.readFileSync(path.join(raiz, 'components/data/starterChars.tsx'), 'utf8');
  const jogaveis = [...src.matchAll(/type:\s*'([a-z_]+)'/g)].map(m => m[1]);
  assert.ok(jogaveis.length >= 20);
  for (const h of jogaveis) {
    assert.ok((HEROIS_CORROMPIVEIS as readonly string[]).includes(h), h);
    assert.ok(CHEFES_TIPOS.has(`corrupted_${h}`), h);
    for (let i = 1; i <= 4; i++) assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies', `corrupted_${h}_${i}.png`)), `${h}_${i}`);
  }
});

test('lote 1 tem habilidade (Krash, Clerigo, Paladino, Arqueira, Jester, Yue); os outros sao genericos', () => {
  assert.deepEqual(Object.keys(HABILIDADES_CORROMPIDAS).sort(), ['archer', 'cleric', 'jester', 'mage', 'paladin', 'yue']);
});

function mundo() {
  const aliados: any[] = [0, 1, 2, 3].map(r => ({ id: `h${r}`, hp: 100, maxHp: 100, gridPosition: { col: 3, row: r } }));
  const inimigos: any[] = [];
  const atord = new Map<any, number>();
  let agora = 0;
  const ctx = (): CtxChefe => ({
    agora, inimigos, aliados, adicionarInimigo: e => { inimigos.push(e); }, falar: () => {}, novoId: () => 'x', muralhaX: 350, chegadaX: 1440,
    posAliado: () => ({ x: 0, y: 0 }), ferirAliado: (a, d) => { a.hp = Math.max(0, a.hp - Math.round(d)); }, ferirMuralha: () => {}, efeito: () => {},
    grade: { cols: 4, rows: 4 }, moverAliado: () => {}, atordoarAliado: (a, ate) => { atord.set(a, ate); },
  });
  const chefe = (h: string): any => ({ id: 'c', type: `corrupted_${h}`, position: { x: 900, y: 400 }, width: 80, height: 80, hp: 1000, maxHp: 1000, speed: 1 });
  return { aliados, inimigos, atord, ctx, chefe, avancar: (ms: number) => { agora += ms; } };
}

test('Krash: Sobrecarga Invertida fere so uma fileira', () => {
  const m = mundo();
  HABILIDADES_CORROMPIDAS.mage.usar(m.ctx(), m.chefe('mage'));
  const feridos = m.aliados.filter(a => a.hp < 100);
  assert.equal(feridos.length, 1);
  assert.equal(feridos[0].hp, 88);
});

test('Clerigo: cura os outros inimigos (30%), nao a si nem a Fome', () => {
  const m = mundo();
  const c = m.chefe('cleric'); c.hp = 500;
  const outro: any = { type: 'celula', hp: 10, maxHp: 100 }, cor: any = { type: 'fome_coracao', hp: 10, maxHp: 100 };
  m.inimigos.push(c, outro, cor);
  HABILIDADES_CORROMPIDAS.cleric.usar(m.ctx(), c);
  assert.equal(outro.hp, 10 + 100 * GRACA_CURA);
  assert.equal(cor.hp, 10); assert.equal(c.hp, 500);
});

test('Paladino: Egide Negra absorve os 3 proximos acertos, depois volta a tomar dano (sem cura depois)', () => {
  const m = mundo();
  const c = m.chefe('paladin');
  HABILIDADES_CORROMPIDAS.paladin.usar(m.ctx(), c);
  for (let k = 0; k < EGIDE_ACERTOS; k++) { c.hp -= 50; assert.equal(c.hp, 1000); }
  c.hp -= 50;
  assert.equal(c.hp, 950, 'a egide expirou');
});

test('Arqueira: 5 flechas de 6% em herois', () => {
  const m = mundo();
  HABILIDADES_CORROMPIDAS.archer.usar(m.ctx(), m.chefe('archer'));
  assert.equal(m.aliados.reduce((s, a) => s + (100 - a.hp), 0), 30);
});

test('Jester: Carta Marcada — 10% e atordoa 1 s; Yue: encanta 3 s', () => {
  const m = mundo();
  HABILIDADES_CORROMPIDAS.jester.usar(m.ctx(), m.chefe('jester'));
  const a = m.aliados.find(x => x.hp < 100)!;
  assert.equal(a.hp, 90);
  assert.equal(m.atord.get(a), CARTA_ATORDOA);
  const m2 = mundo();
  HABILIDADES_CORROMPIDAS.yue.usar(m2.ctx(), m2.chefe('yue'));
  assert.equal(m2.atord.size, 1);
  assert.equal([...m2.atord.values()][0], ENCANTO_MS);
});

test('chefe corrompido usa a habilidade no ritmo dela, so depois de chegar; generico nao faz nada', () => {
  const m = mundo();
  const c = m.chefe('mage'); m.inimigos.push(c);
  c.position.x = 1500;   // fora do campo ainda
  for (let t = 0; t < 7000; t += 100) { m.avancar(100); despacharQuadro(m.ctx(), c); }
  assert.ok(m.aliados.every(a => a.hp === 100), 'antes de chegar, nada');
  c.position.x = 900;
  for (let t = 0; t < 6100; t += 100) { m.avancar(100); despacharQuadro(m.ctx(), c); }
  assert.equal(m.aliados.filter(a => a.hp < 100).length, 1, 'uma sobrecarga em 6 s');
  const g = mundo(); const cg = g.chefe('druid'); g.inimigos.push(cg);
  for (let t = 0; t < 30000; t += 100) { g.avancar(100); despacharQuadro(g.ctx(), cg); }
  assert.ok(g.aliados.every(a => a.hp === 100) && g.atord.size === 0);
});
