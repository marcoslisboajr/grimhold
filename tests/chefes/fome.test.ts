// A Fome (Etapa 3b): luta final do Ato X. Relogio virtual e ctx falso, como em ato10.test.ts.
import { test, beforeEach } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { despacharMorte, despacharQuadro, podeSerAlvo, vidaNaBarra } from '../../components/chefes';
import '../../components/chefes/ato10';
import * as fome from '../../components/chefes/fome';
import { FOME } from '../../components/chefes/fome';
import { PONTOS_FRACOS_ACT10B } from '../../components/data/arenaAct10b';
import { BARRIER_X, GRID_CELL_WIDTH, GRID_CELL_HEIGHT, GRID_ROWS } from '../../components/systems/combat';
import type { CtxChefe } from '../../components/chefes/tipos';

const heroi = (id: string, row: number, hp = 100): any => ({ id, type: 'mage', hp, maxHp: 100, gridPosition: { col: 3, row } });
function mundo() {
  const inimigos: any[] = [], aliados: any[] = [heroi('a', 0), heroi('b', 3), heroi('c', 5)];
  const reg = { fim: 0, arena: [] as boolean[], atordoado: new Map<any, number>(), falas: [] as string[] };
  let agora = 0, id = 0;
  const ctx = (): CtxChefe => ({
    agora, inimigos, aliados, adicionarInimigo: e => { inimigos.push(e); }, falar: () => {},
    novoId: () => `f${++id}`, muralhaX: BARRIER_X, chegadaX: 1440, posAliado: a => ({ x: a.gridPosition.col * GRID_CELL_WIDTH + GRID_CELL_WIDTH / 2, y: a.gridPosition.row * GRID_CELL_HEIGHT + GRID_CELL_HEIGHT / 2 }),
    ferirAliado: (a, d) => { a.hp = Math.max(0, a.hp - Math.round(d)); }, ferirMuralha: () => {}, efeito: () => {},
    grade: { cols: 4, rows: GRID_ROWS }, moverAliado: () => {}, atordoarAliado: (a, ate) => { reg.atordoado.set(a, ate); },
    fimDaCampanha: () => { reg.fim++; }, trocarArena: f => { reg.arena.push(f); }, dizer: k => { reg.falas.push(k); },
  });
  // um quadro: modulos (como o GameCanvas) e a Fome; mortos (hp<=0) saem da lista com despacharMorte
  const quadro = (ms: number) => {
    agora += ms;
    for (const e of [...inimigos]) if (e.hp > 0) despacharQuadro(ctx(), e);
    fome.passo(ctx());
    for (const e of [...inimigos]) if (e.hp <= 0) { despacharMorte(ctx(), e); inimigos.splice(inimigos.indexOf(e), 1); }
  };
  const rodar = (ms: number, passo = 50) => { for (let t = 0; t < ms; t += passo) quadro(passo); };
  return { inimigos, aliados, reg, ctx, quadro, rodar, agora: () => agora };
}
const pontos = (m: ReturnType<typeof mundo>) => m.inimigos.filter(e => e.type === 'fome_ponto' && e.hp > 0);
// modelo = o chefe final do X (Malachar da onda 31: linha 44.5 da ficha) com 1000 de vida por unidade
const modelo = { maxHp: 44.5 * 1000, damage: 108, speed: 0.8 };

beforeEach(() => fome.resetFome());

test('transicao: dura 6 s, troca a arena uma vez (aos 3 s), ninguem toma dano, depois 4 Pontos', () => {
  const m = mundo();
  fome.iniciar(m.ctx(), { modelo });
  assert.equal(fome.estado().fase, 'transicao');
  m.rodar(2900);
  assert.deepEqual(m.reg.arena, []);
  m.rodar(200);
  assert.deepEqual(m.reg.arena, [true]);
  m.rodar(2800);
  assert.equal(fome.estado().fase, 'transicao');
  assert.ok(m.aliados.every(a => a.hp === 100), 'sem dano na transicao');
  m.rodar(200);
  assert.equal(fome.estado().fase, 'fase1');
  assert.equal(pontos(m).length, 4);
  assert.deepEqual(m.reg.arena, [true], 'troca uma vez so');
  // uma barra so: a soma dos pontos; vida total dos 4 = 1x Malachar do modelo
  const b = vidaNaBarra(pontos(m)[0]);
  assert.equal(b.max, 4 * Math.ceil(1000 * FOME.PONTO_HP));
  for (const p of pontos(m)) assert.equal(p._semRecompensa, true);
});

test('batida: 4% da vida max. e nunca mata (minimo 1 HP)', () => {
  const m = mundo();
  m.aliados[0].hp = 2; m.aliados[1].hp = 1;
  fome.iniciar(m.ctx(), { modelo });
  m.rodar(6000 + FOME.BATIDA1 + 50);
  assert.equal(m.aliados[0].hp, 1);
  assert.equal(m.aliados[1].hp, 1);
  assert.equal(m.aliados[2].hp, 100 - 4 - 0, 'uma batida (ou agarra) — 4% de 100');
  m.rodar(60000);
  assert.ok(m.aliados.every(a => a.hp >= 1), 'batida nunca mata');
});

test('fases: muda a 2 e a 1 pontos vivos; o ultimo se fecha para sempre e nasce o Coracao', () => {
  const m = mundo();
  fome.iniciar(m.ctx(), { modelo });
  m.rodar(6050);
  const ps = pontos(m);
  ps[0].hp = 0; m.quadro(50);
  assert.equal(fome.estado().fase, 'fase1');
  ps[1].hp = 0; m.quadro(50); m.quadro(50);
  assert.equal(fome.estado().fase, 'fase2');
  ps[2]._fechado = false; ps[2].hp = 0; m.quadro(50); m.quadro(50);
  assert.equal(fome.estado().fase, 'fase3');
  const ultimo = ps[3];
  assert.ok(ultimo._fechado && !podeSerAlvo(ultimo), 'ultimo fechado, sem alvo');
  const antes = ultimo.hp;
  ultimo.hp -= 999999; m.rodar(20000);
  assert.equal(ultimo.hp, antes, 'fechado para sempre: nao toma dano');
  const cor = m.inimigos.find(e => e.type === 'fome_coracao');
  assert.ok(cor && cor.hp > 0);
  assert.equal(cor.maxHp, Math.ceil(1000 * FOME.CORACAO_HP), 'Coracao = 1,2x o Malachar do modelo');
  assert.ok(m.reg.falas.includes('fome.coracao'));
});

test('celulas: sem recompensa e no maximo 12 vivas', () => {
  const m = mundo();
  fome.iniciar(m.ctx(), { modelo });
  m.rodar(6000 + FOME.CELULA_CADA * 30);
  const cel = m.inimigos.filter(e => e.type.startsWith('celula') && e.hp > 0);
  assert.equal(cel.length, FOME.TETO);
  assert.ok(cel.every(e => e._semRecompensa && e.reward === 0));
  assert.equal(fome.celulasVivas(m.ctx()), 12);
});

test('agarra: so prende depois do aviso de 1 s e solta em 2 s; sem dano', () => {
  const m = mundo();
  fome.iniciar(m.ctx(), { modelo });
  m.rodar(6000);
  let t0 = -1;
  for (let i = 0; i < 1000 && t0 < 0; i++) { m.quadro(10); if (fome.estado().agarra) t0 = m.agora(); }
  assert.ok(t0 > 0);
  const g = fome.estado().agarra!;
  assert.equal(g.avisoAte - t0, FOME.AGARRA_AVISO);
  assert.equal(m.reg.atordoado.size, 0, 'nada durante o aviso');
  while (m.agora() < g.avisoAte - 10) m.quadro(10);
  assert.equal(m.reg.atordoado.size, 0);
  m.quadro(20);
  assert.equal(m.reg.atordoado.size, 1);
  assert.equal([...m.reg.atordoado.values()][0], g.avisoAte + FOME.AGARRA_PRESO);
  while (m.agora() < g.ate) m.quadro(10);
  m.quadro(10);
  assert.equal(fome.estado().agarra, undefined);
});

test('Verme (fase 2): so acerta a fileira avisada, 15% da vida max., depois do aviso', () => {
  const m = mundo();
  fome.iniciar(m.ctx(), { modelo });
  m.rodar(6050);
  const ps = pontos(m); ps[0].hp = 0; ps[1].hp = 0; m.quadro(50); m.quadro(50);
  assert.equal(fome.estado().fase, 'fase2');
  for (const a of m.aliados) a.hp = 100;
  let v; for (let i = 0; i < 2000 && !(v = fome.estado().verme); i++) m.quadro(10);
  assert.ok(v);
  for (const a of m.aliados) a.hp = 100;   // zera batidas ate aqui
  const naFileira = m.aliados.filter(a => a.gridPosition.row === v!.row);
  while (m.agora() < v!.avisoAte - 20) m.quadro(10);
  // durante o aviso a fileira nao toma o golpe (so a batida, 4%)
  for (const a of naFileira) assert.ok(a.hp >= 96);
  const hpAntes = new Map(m.aliados.map(a => [a, a.hp]));
  m.quadro(30);
  for (const a of m.aliados) {
    const perdeu = hpAntes.get(a)! - a.hp;
    if (a.gridPosition.row === v!.row) assert.ok(perdeu >= 15, `fileira ${v!.row}: perdeu ${perdeu}`);
    else assert.ok(perdeu <= 4, `fora da fileira: perdeu ${perdeu}`);
  }
});

test('ponto fechado (fase 2) nao toma dano e nao dispara efeito de morte (instalarReducao)', () => {
  const m = mundo();
  fome.iniciar(m.ctx(), { modelo });
  m.rodar(6050);
  const ps = pontos(m); ps[0].hp = 0; ps[1].hp = 0; m.quadro(50); m.quadro(50);
  let fechado: any;
  for (let i = 0; i < 2000 && !fechado; i++) { m.quadro(10); fechado = pontos(m).find(p => p._fechado); }
  assert.ok(fechado && !podeSerAlvo(fechado));
  const hp = fechado.hp;
  fechado.hp -= hp * 10;   // golpe que mataria
  assert.equal(fechado.hp, hp, 'a vida nao muda: nenhum hp <= 0 falso');
  // execucoes do jogo escrevem a vida direto (hp = 0 / -9999): passam pelo mesmo setter e nao matam
  fechado.hp = 0; assert.equal(fechado.hp, hp);
  fechado.hp = -9999; assert.equal(fechado.hp, hp);
  m.rodar(FOME.FECHA_DUR + 100);
  assert.ok(!fechado._fechado && podeSerAlvo(fechado), 'reabre depois de 3 s');
});

test('Coracao: cura os monstros a cada batida e nao a si; morte chama fimDaCampanha uma vez so', () => {
  const m = mundo();
  fome.iniciar(m.ctx(), { modelo });
  m.rodar(6050);
  const ps = pontos(m);
  ps[0].hp = 0; ps[1].hp = 0; m.quadro(50); m.quadro(50);
  ps[2]._fechado = false; ps[2].hp = 0; m.quadro(50); m.quadro(50);
  const cor = m.inimigos.find(e => e.type === 'fome_coracao');
  const cel = m.inimigos.find(e => e.type.startsWith('celula') && e.hp > 0) ?? (m.rodar(3100), m.inimigos.find(e => e.type.startsWith('celula') && e.hp > 0));
  cel.hp = 1; cor.hp = cor.maxHp / 2;
  const c0 = cor.hp;
  m.rodar(FOME.BATIDA3 + 50);
  assert.ok(cel.hp > 1, 'celula curada');
  assert.equal(cor.hp, c0, 'o Coracao nao se cura');
  for (const e of m.inimigos) if (e.type === 'mind_flayer_anciao') e.hp = 0;   // Anciao vivo: o Coracao toma so 50%
  m.quadro(50);
  cor.hp = 0; m.quadro(50);
  assert.equal(fome.estado().fase, 'fim');
  assert.ok(m.inimigos.every(e => e.hp <= 0), 'celulas e o ultimo Ponto somem');
  assert.equal(m.reg.fim, 0, 'silencio antes');
  m.rodar(FOME.SILENCIO + 100);
  assert.equal(m.reg.fim, 1);
  m.rodar(10000);
  despacharMorte(m.ctx(), cor);
  assert.equal(m.reg.fim, 1, 'exatamente uma vez');
});

test('resetFome limpa tudo', () => {
  const m = mundo();
  fome.iniciar(m.ctx(), { modelo });
  m.rodar(9000);
  fome.resetFome();
  const s = fome.estado();
  assert.equal(s.fase, 'inativa'); assert.equal(s.agarra, undefined); assert.equal(s.verme, undefined); assert.equal(s.tint, 0);
  fome.iniciar(m.ctx(), { modelo });
  assert.equal(fome.estado().fase, 'transicao', 'pode iniciar de novo');
});

test('alcance: todo Ponto Fraco e o Coracao ao alcance do heroi de menor alcance, da Vanguarda, na fileira certa', () => {
  // alcance base mais curto entre os herois jogaveis (lido de starterChars.tsx)
  const src = fs.readFileSync(path.join(process.env.GRIM_RAIZ!, 'components/data/starterChars.tsx'), 'utf8');
  const minimo = Math.min(...[...src.matchAll(/range:\s*(\d+)/g)].map(r => Number(r[1])));
  assert.ok(minimo >= 300 && minimo <= 600, `minimo ${minimo}`);
  const heroiX = 3 * GRID_CELL_WIDTH + GRID_CELL_WIDTH / 2;   // Vanguarda (col 3), getScreenPosFromGrid
  const alcanca = (cx: number, cy: number, raio: number) => {
    const ex = BARRIER_X + cx - raio, ey = cy - raio;   // o jogo mede ate o canto (position) do inimigo
    for (let row = 0; row < GRID_ROWS; row++) {
      const hy = row * GRID_CELL_HEIGHT + GRID_CELL_HEIGHT / 2;
      if ((ex - heroiX) ** 2 + (ey - hy) ** 2 <= minimo * minimo) return true;
    }
    return false;
  };
  for (const p of PONTOS_FRACOS_ACT10B) assert.ok(alcanca(p.x, p.y, FOME.PONTO_RAIO), `ponto ${p.x},${p.y}`);
  // e visiveis: acima da barra inferior da HUD (y ~746, combat.ts SPAWN_MAX_Y)
  for (const p of PONTOS_FRACOS_ACT10B) assert.ok(p.y + FOME.PONTO_RAIO <= 746, `ponto ${p.y} atras da HUD`);
  assert.ok(FOME.CORACAO_Y + FOME.CORACAO_RAIO <= 746);
  assert.ok(alcanca(FOME.CORACAO_X, FOME.CORACAO_Y, FOME.CORACAO_RAIO), 'Coracao');
});

test('sprites da Fome existem', () => {
  const raiz = process.env.GRIM_RAIZ!;
  const arqs = [...[1, 2, 3, 4].flatMap(i => [`fome_ponto_${i}`, `fome_coracao_${i}`, `fome_agarra_${i}`]), 'fome_ponto_fechado',
    ...Array.from({ length: 9 }, (_, i) => `fome_verme_${i + 1}`)];
  for (const a of arqs) assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies', a + '.png')), a);
});
