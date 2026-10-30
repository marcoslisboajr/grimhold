// Etapa 3b: ficha da luta final, um final visivel por build, fecharCampanha e textos.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ATOS, atoDoModo, ATO5_REFEITO } from '../../components/data/atos';
import { fecharCampanha } from '../../components/systems/fimCampanha';
import { CHEFES_ATO10, CHEFES_CORROMPIDOS, HEROIS_CORROMPIVEIS, CHEFES_LEGADO } from '../../components/chefes/lista';
import { TIPOS_FOME } from '../../components/chefes/fome';
import { beforeEach } from 'node:test';
import * as fome from '../../components/chefes/fome';
import { DEVORADOR, TIPO_ANCIAO } from '../../components/chefes/fome';
import { despacharMorte, despacharQuadro } from '../../components/chefes';
import '../../components/chefes/ato10';
import { BARRIER_X, GRID_CELL_WIDTH, GRID_CELL_HEIGHT, GRID_ROWS } from '../../components/systems/combat';
import type { CtxChefe } from '../../components/chefes/tipos';
import { BESTIARY_EA, BESTIARY_BASE } from '../../components/data/bestiary';

const raiz = () => process.env.GRIM_RAIZ!;

test('so o act10 tem lutaFinal, com arena, fundos e 4 Pontos Fracos; os fundos existem em public/', () => {
  assert.deepEqual(ATOS.filter(a => a.lutaFinal).map(a => a.id), ['act10']);
  const lf = atoDoModo('act10')!.lutaFinal!;
  assert.equal(lf.pontosFracos.length, 4);
  assert.ok(lf.arena.length > 0);
  for (const u of [lf.fundo.campo, lf.fundo.patio, ...lf.arena.map(o => o.src)])
    assert.ok(fs.existsSync(path.join(raiz(), 'public', u.replace(/^\.\//, ''))), u);
});

test('atos finais: o X sempre; o V legado so enquanto ATO5_REFEITO for false (demo)', () => {
  const finais = ATOS.filter(a => a.final).map(a => a.id);
  assert.deepEqual(finais, ATO5_REFEITO ? ['act10'] : ['act5', 'act10']);
  assert.equal(atoDoModo('act5')!.lutaFinal, undefined, 'V (legado ou refeito) sem luta final');
  assert.equal(atoDoModo('act10')!.final, true);
});

test('fecharCampanha: ato sem lutaFinal faz as mesmas chamadas de antes (V legado), com e sem epilogo', () => {
  const log: string[] = [];
  const d = {
    gravar: (k: string, v: string) => log.push(`gravar ${k}=${v}`), desbloquearMalachar: () => log.push('malachar'),
    conquista: (id: string, a?: number) => log.push(`conquista ${id}${a ? '@' + a : ''}`), toastMalachar: () => log.push('toast'),
    epilogo: () => log.push('epilogo'), aoFecharLutaFinal: () => log.push('corrompido'),
  };
  fecharCampanha(atoDoModo('act5')!, true, d);
  assert.deepEqual(log, ['gravar grimhold_malachar_unlocked=true', 'malachar', 'conquista conquest_malachar_human@100', 'toast', 'epilogo']);
  log.length = 0;
  fecharCampanha(atoDoModo('act5')!, false, d);
  assert.deepEqual(log, ['gravar grimhold_malachar_unlocked=true', 'malachar', 'toast']);
  log.length = 0;
  fecharCampanha(atoDoModo('act10')!, true, d);
  assert.deepEqual(log, ['gravar grimhold_malachar_unlocked=true', 'malachar', 'conquista conquest_malachar_human@100', 'toast',
    'conquista act10_complete', 'conquista secret_true_ending', 'conquista all_acts_complete', 'corrompido', 'epilogo']);
});

test('tipos novos nao colidem com os tipos existentes das fichas nem com o legado', () => {
  const existentes = new Set<string>([...CHEFES_LEGADO,
    ...ATOS.flatMap(a => [...(a.faixas ?? []).flatMap(f => f.pool.map(m => m.tipo as string)), ...Object.values(a.chefes ?? {}).map(c => c.tipo as string)])]);
  for (const t of [...CHEFES_ATO10, ...CHEFES_CORROMPIDOS]) assert.ok(!existentes.has(t), t);
  assert.deepEqual([...TIPOS_FOME], [...CHEFES_ATO10]);
  assert.equal(new Set(CHEFES_CORROMPIDOS).size, HEROIS_CORROMPIVEIS.length);
});

test('chaves novas da Fome e do Corrompido nas 3 linguas, sem {x} simples', () => {
  const chaves = ['fome.transicao', 'fome.coracao', 'fome.morte', 'corrompido.chegada', 'corrompido.meio', 'corrompido.libertacao', 'corrompido.resistiu',
    'enemy.fome_ponto.name', 'enemy.fome_coracao.name', 'ui.fome.barra', 'enemy.corrupted.name', 'ui.ending.footer.act10', 'achievement.act10_complete.description',
    ...['mage', 'cleric', 'paladin', 'archer', 'jester', 'yue'].flatMap(h => [`chefe.corrupted_${h}.chegada`, `chefe.corrupted_${h}.meio`]),
    ...HEROIS_CORROMPIVEIS.map(h => `ui.class.${h}`)];
  for (const l of ['pt-BR', 'en', 'zh-CN']) {
    const j = JSON.parse(fs.readFileSync(path.join(raiz(), 'i18n/locales', `${l}.json`), 'utf8'));
    for (const k of chaves) {
      assert.ok(typeof j[k] === 'string' && j[k].length > 0, `${l}: ${k}`);
      assert.ok(!/(^|[^{])\{[a-zA-Z_]+\}(?!\})/.test(j[k]), `${l}: ${k} usa {x}`);
    }
    assert.ok(j['enemy.corrupted.name'].includes('{{hero}}'));
  }
});

// ── Devoradores de Mentes na luta da Fome (fome.ts, DEVORADOR) ──────────────────────────────
function arena() {
  const inimigos: any[] = [];
  const aliados: any[] = [0, 3, 5].map((row, i) => ({ id: `h${i}`, type: 'mage', hp: 100, maxHp: 100, gridPosition: { col: 3, row } }));
  const atordoado = new Map<any, number>();
  let agora = 0, id = 0;
  const ctx = (): CtxChefe => ({
    agora, inimigos, aliados, adicionarInimigo: e => { inimigos.push(e); }, falar: () => {},
    novoId: () => `d${++id}`, muralhaX: BARRIER_X, chegadaX: 1440,
    posAliado: a => ({ x: a.gridPosition.col * GRID_CELL_WIDTH + GRID_CELL_WIDTH / 2, y: a.gridPosition.row * GRID_CELL_HEIGHT + GRID_CELL_HEIGHT / 2 }),
    ferirAliado: () => {}, ferirMuralha: () => {}, efeito: () => {}, grade: { cols: 4, rows: GRID_ROWS }, moverAliado: () => {},
    atordoarAliado: (a, ate) => { atordoado.set(a, ate); }, fimDaCampanha: () => {}, trocarArena: () => {}, dizer: () => {},
  });
  const quadro = (ms: number) => {
    agora += ms;
    for (const e of [...inimigos]) if (e.hp > 0) despacharQuadro(ctx(), e);
    fome.passo(ctx());
    for (const e of [...inimigos]) if (e.hp <= 0) { despacharMorte(ctx(), e); inimigos.splice(inimigos.indexOf(e), 1); }
  };
  const rodar = (ms: number) => { for (let t = 0; t < ms; t += 50) quadro(50); };
  const dev = () => inimigos.filter(e => e.hp > 0 && (e.type === 'mind_flayer' || e.type === TIPO_ANCIAO));
  const pts = () => inimigos.filter(e => e.hp > 0 && e.type === 'fome_ponto');
  return { inimigos, aliados, atordoado, ctx, quadro, rodar, dev, pts, agora: () => agora };
}
const modeloF = { maxHp: 44.5 * 1000, damage: 108, speed: 0.8 };
const irFase3 = (m: ReturnType<typeof arena>) => {
  fome.iniciar(m.ctx(), { modelo: modeloF }); m.rodar(6050);
  const ps = m.pts();
  ps[0].hp = 0; ps[1].hp = 0; m.quadro(50); m.quadro(50);
  ps[2]._fechado = false; ps[2].hp = 0; m.quadro(50); m.quadro(50);
};
beforeEach(() => fome.resetFome());

test('Devoradores: 2 comuns na fase 1, sem recompensa e escalados pelo modelo', () => {
  const m = arena();
  fome.iniciar(m.ctx(), { modelo: modeloF }); m.rodar(6050);
  assert.equal(fome.estado().fase, 'fase1');
  const d = m.dev();
  assert.equal(d.length, DEVORADOR.FASE1);
  assert.ok(d.every(e => e.type === 'mind_flayer' && e._semRecompensa && e.reward === 0));
  assert.equal(d[0].maxHp, Math.ceil(1000 * DEVORADOR.HP));
});

test('Devoradores: +2 ao entrar na fase 2; Anciao na fase 3 com a barra no lugar da do Coracao', () => {
  const m = arena();
  fome.iniciar(m.ctx(), { modelo: modeloF }); m.rodar(6050);
  const ps = m.pts();
  ps[0].hp = 0; ps[1].hp = 0; m.quadro(50); m.quadro(50);
  assert.equal(fome.estado().fase, 'fase2');
  assert.equal(m.dev().filter(e => e.type === 'mind_flayer').length, DEVORADOR.FASE1 + DEVORADOR.FASE2);
  ps[2]._fechado = false; ps[2].hp = 0; m.quadro(50); m.quadro(50);
  assert.equal(fome.estado().fase, 'fase3');
  const anc = m.dev().filter(e => e.type === TIPO_ANCIAO);
  assert.equal(anc.length, 1);
  assert.ok(anc[0]._semRecompensa && anc[0].reward === 0);
  assert.equal(anc[0].width, DEVORADOR.ANCIAO_RAIO * 2);
  assert.ok(fome.anciaoVivo());
  const cor = m.inimigos.find(e => e.type === 'fome_coracao');
  assert.equal(cor._semBarra, true, 'Anciao vivo: a barra e a dele');
  anc[0].hp = 0; m.quadro(50);
  assert.equal(cor._semBarra, false, 'Anciao morto: a barra volta ao Coracao');
});

test('Coracao: 50% do dano com o Anciao vivo, inteiro sem ele', () => {
  const m = arena(); irFase3(m);
  const cor = m.inimigos.find(e => e.type === 'fome_coracao');
  const anc = m.dev().find(e => e.type === TIPO_ANCIAO);
  let h = cor.hp; cor.hp -= 1000;
  assert.equal(h - cor.hp, 1000 * DEVORADOR.CORACAO_FICA);
  anc.hp = 0; m.quadro(50);
  assert.equal(fome.anciaoVivo(), false);
  h = cor.hp; cor.hp -= 1000;
  assert.equal(h - cor.hp, 1000);
});

test('Explosao Mental atordoa so quem esta perto a cada 8 s; Dominar prende um heroi 3 s', () => {
  const m = arena();
  fome.iniciar(m.ctx(), { modelo: modeloF }); m.rodar(6050);
  const d = m.dev()[0];
  for (const o of m.dev()) o._tExplosao = -1e9;
  // encosta o Devorador na muralha, na fileira do heroi 0
  d.position.x = BARRIER_X; d.position.y = GRID_CELL_HEIGHT / 2 - d.height / 2;
  d._tExplosao = DEVORADOR.EXPLOSAO_CADA - 60;
  m.quadro(50); assert.equal(m.atordoado.size, 0);
  m.quadro(50);
  assert.equal(m.atordoado.get(m.aliados[0]), m.agora() + DEVORADOR.EXPLOSAO_ATORDOA);
  assert.ok(!m.atordoado.has(m.aliados[2]), 'longe (fileira 5) nao');
  fome.resetFome();
  const m2 = arena(); irFase3(m2);
  for (const o of m2.dev()) o._tExplosao = -1e9;
  m2.rodar(DEVORADOR.DOMINAR_CADA);
  const presos = [...m2.atordoado.values()];
  assert.equal(presos.length, 1);
  assert.ok(presos[0] > m2.agora() + DEVORADOR.DOMINAR_MS - 200);
});

test('Coracao morto: os Devoradores restantes somem sem recompensa; reset esquece o Anciao', () => {
  const m = arena(); irFase3(m);
  const ds = m.dev();
  assert.equal(ds.length, DEVORADOR.FASE1 + DEVORADOR.FASE2 + 1);
  const cor = m.inimigos.find(e => e.type === 'fome_coracao');
  cor._liberar = true; cor.hp = 0; m.quadro(50);
  assert.equal(fome.estado().fase, 'fim');
  assert.ok(ds.every(e => e.hp <= 0 && e._semRecompensa && e.reward === 0));
  assert.equal(m.dev().length, 0);
  fome.resetFome();
  assert.equal(fome.anciaoVivo(), false);
});

test('bestiario: Anciao so na versao completa; textos nas 3 linguas', () => {
  assert.ok(BESTIARY_EA.some(e => e.type === TIPO_ANCIAO));
  assert.ok(!BESTIARY_BASE.some(e => e.type === TIPO_ANCIAO));
  for (const l of ['pt-BR', 'en', 'zh-CN']) {
    const j = JSON.parse(fs.readFileSync(path.join(raiz(), 'i18n/locales', `${l}.json`), 'utf8'));
    for (const k of ['name', 'title', 'wave', 'lore', 'ability.0', 'ability.1', 'ability.2']) assert.ok(j[`bestiary.${TIPO_ANCIAO}.${k}`], `${l} ${k}`);
    for (const k of [`enemy.${TIPO_ANCIAO}.name`, `ui.obituary.enemy.${TIPO_ANCIAO}`]) assert.ok(j[k], `${l} ${k}`);
    assert.equal(j['bestiary.mind_flayer.ability.2'], undefined);
  }
});
