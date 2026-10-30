import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ATOS, atoDoModo, sortearInimigo, type Ato } from '../../components/data/atos';
import { sortearLegado } from '../../components/data/atosLegado';
import { CHEFES_TIPOS, CHEFES_ATO6, CHEFES_ATO7, CHEFES_ATO8, CHEFES_ATO9, CHEFES_ATO5R, CHEFES_ATO10, CHEFES_CORROMPIDOS, CHEFES_LEGADO, SPRITE_ATO6, SPRITE_ATO7, SPRITE_ATO8, SPRITE_ATO9 } from '../../components/chefes/lista';

const base = { type: 'goblin' as any, hp: 100, damage: 3, speed: 1, radius: 24, attackRange: 0, attackSpeed: 0 };
const comum = { isBossSpawn: false, isSecondBossSpawn: false, isEscort: false };
const FICHA: Pick<Ato, 'faixas' | 'chefes'> = {
  faixas: [
    { ateOnda: 9, pool: [{ tipo: 'goblin', peso: 3, hp: 2, dano: 10, vel: 1.5, raio: 20 }, { tipo: 'orc', peso: 1, hp: 4, dano: 20, vel: 0.5, raio: 30, alcance: 500, cadencia: 2000 }] },
    { ateOnda: 30, pool: [{ tipo: 'lich', peso: 1, hp: 3, dano: 30, vel: 1, raio: 26 }] },
  ],
  chefes: { 10: { tipo: 'orc_warlord', hp: 18, dano: 25, vel: 0.35, raio: 30, segundo: { tipo: 'goblin_king', hp: 10, dano: 22, vel: 0.55, raio: 28 } } },
};

test('atoDoModo acha I-X e ignora outros modos', () => {
  assert.equal(atoDoModo('standard')?.numero, 1);
  assert.equal(atoDoModo('act5')?.numero, 5);
  assert.equal(atoDoModo('endless'), undefined);
  assert.equal(atoDoModo('act6')?.numero, 6);
  assert.equal(atoDoModo('act7')?.numero, 7);
  assert.equal(atoDoModo('act8')?.numero, 8);
  assert.equal(atoDoModo('act9')?.numero, 9);
  assert.equal(atoDoModo('act10')?.numero, 10);
  assert.equal(ATOS.length, 10);
});
test('cadeia de desbloqueio I->X, V (refeito, fora da demo) nao e final e destrava o VI, ..., IX o X; X e final', () => {
  assert.deepEqual(ATOS.map(a => a.destrava ?? '-'), ['act2', 'act3', 'act4', 'act5', 'act6', 'act7', 'act8', 'act9', 'act10', '-']);
  assert.deepEqual(ATOS.map(a => !!a.final), [false, false, false, false, false, false, false, false, false, true]);
  assert.equal(atoDoModo('act3')?.chaveDesbloqueio, 'grimhold_act3_unlocked');
});
test('ajuste igual ao ATO_AJUSTE antigo', () => {
  assert.deepEqual(ATOS.map(a => a.ajuste), [{ hp: 1.25, dmg: 1.15 }, { hp: 1.00, dmg: 1.15 }, { hp: 0.75, dmg: 1.00 }, { hp: 0.90, dmg: 1.00 }, { hp: 0.75, dmg: 1.00 }, { hp: 0.75, dmg: 1.00 }, { hp: 0.75, dmg: 1.00 }, { hp: 0.75, dmg: 1.00 }, { hp: 0.75, dmg: 1.00 }, { hp: 0.75, dmg: 1.00 }]);
});
test('fichas I-IV (e o V legado da demo) sorteiam igual ao legado', () => {
  for (const a of [...ATOS.filter(x => x.numero <= 4), ATO5_LEGADO]) for (const onda of [1, 5, 10, 17, 30]) for (const roll of [0, 0.37, 0.99])
    assert.deepEqual(a.sortear(onda, roll, comum, base), sortearLegado(a.numero, onda, roll, comum, base));
});
test('sortearInimigo: peso, multiplicadores e alcance', () => {
  const g = sortearInimigo(FICHA, 3, 0.1, comum, base);
  assert.deepEqual(g, { type: 'goblin', hp: 200, damage: 10, speed: 1.5, radius: 20, attackRange: 0, attackSpeed: 0 });
  const o = sortearInimigo(FICHA, 3, 0.8, comum, base);   // 0.8 >= 3/4 -> orc
  assert.deepEqual(o, { type: 'orc', hp: 400, damage: 20, speed: 0.5, radius: 30, attackRange: 500, attackSpeed: 2000 });
});
test('sortearInimigo: faixa certa, escolta usa a onda anterior, chefe e segundo chefe', () => {
  assert.equal(sortearInimigo(FICHA, 12, 0, comum, base).type, 'lich');
  assert.equal(sortearInimigo(FICHA, 10, 0, { ...comum, isEscort: true }, base).type, 'goblin');
  const c = sortearInimigo(FICHA, 10, 0, { ...comum, isBossSpawn: true }, base);
  assert.deepEqual(c, { type: 'orc_warlord', hp: 1800, damage: 25, speed: 0.35, radius: 30, attackRange: 0, attackSpeed: 0 });
  assert.equal(sortearInimigo(FICHA, 10, 0, { ...comum, isSecondBossSpawn: true }, base).type, 'goblin_king');
});

// ── Ato VI (Etapa 1a) ──────────────────────────────────────────────────
import fs from 'node:fs';
import path from 'node:path';
const A6 = atoDoModo('act6')!;
const tipos6 = () => new Set<string>([...A6.faixas!.flatMap(f => f.pool.map(m => m.tipo as string)), ...Object.values(A6.chefes!).map(c => c.tipo as string)]);
test('act6: faixas cobrem 1-29 e ha chefe em 5..30', () => {
  for (let o = 1; o <= 29; o++) assert.ok(A6.faixas!.some(f => f.ateOnda >= o), `onda ${o}`);
  assert.deepEqual(Object.keys(A6.chefes!).map(Number).sort((a, b) => a - b), [5, 10, 15, 20, 25, 30]);
});
test('act6: sorteio so devolve tipos do ato (e os chefes novos em 5..30)', () => {
  const doAto = new Set(['cultista_vermelho', 'cultista_vermelho_b', 'cultista_branco', 'cultista_branco_b', 'cultista_verde', 'cultista_verde_b', 'cultista_negro', 'cultista_azul', 'lanterna', 'lanterna_b', 'anjo', 'anjo_rubro', 'anjo_sombrio', 'anjo_sem_asas', 'anjo_sem_asas_rubro', 'anjo_sem_asas_sombrio', 'morcego', 'morcego_rubro', 'acaro_azul', 'acaro_vermelho', 'acaro_prata', 'acaro_amarelo', 'lich6', 'lich6_rubro', 'lich6_dourado', 'cavaleiro_caido', 'cavaleiro_caido_b', 'esqueleto6', 'esqueleto6_lanca', 'esqueleto6_escudo', 'fenix', 'fenix_do_caos', ...CHEFES_ATO6]);
  assert.equal(doAto.size, 38);
  for (const t of tipos6()) assert.ok(doAto.has(t), t);
  for (let o = 1; o <= 30; o++) for (const roll of [0, 0.13, 0.29, 0.5, 0.71, 0.88, 0.97, 0.9999])
    for (const f of [comum, { ...comum, isEscort: o % 5 === 0 }, { ...comum, isBossSpawn: o % 5 === 0 }]) {
      if (o === 30 && !f.isEscort && !f.isBossSpawn) continue;   // onda 30 so tem escolta + chefe
      const t = A6.sortear(o, roll, f, base).type as string;
      assert.ok(doAto.has(t), `onda ${o} roll ${roll}: ${t}`);
    }
  assert.equal(A6.sortear(30, 0, { ...comum, isBossSpawn: true }, base).type, 'serafim_caido');
});
test('act6: todo tipo tem os 4 PNGs', () => {
  const raiz = process.env.GRIM_RAIZ!;
  for (const t of tipos6()) for (let i = 1; i <= 4; i++)
    assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies', `${SPRITE_ATO6[t] ?? t}_${i}.png`)), `${t}_${i}.png`);
});
test('act6: chaves i18n novas existem nas 3 linguas e sem {x} simples', () => {
  const raiz = process.env.GRIM_RAIZ!;
  const chaves = ['ui.actSelect.act6.title', 'ui.actSelect.act6.subtitle', 'ui.actSelect.act6.lore', 'ui.actSelect.act6.lockMsg', 'ui.hud.modeAct6', 'ui.runHistory.mode.act6',
    'ui.victory.act6', 'ui.victory.act6.subtitle', 'ui.victory.act6.boss', 'ui.victory.act6.text', 'ui.victory.act6.tagline',
    ...A6.selecao.chefesChaves.map(c => `ui.actSelect.boss.${c}`),
    ...[...tipos6(), 'coro_cultista'].flatMap(t => [`enemy.${t}.name`, `ui.obituary.enemy.${t}`])];
  for (const l of ['pt-BR', 'en', 'zh-CN']) {
    const j = JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales', `${l}.json`), 'utf8'));
    for (const k of chaves) {
      assert.equal(typeof j[k], 'string', `${l}: ${k}`);
      assert.ok(!/(^|[^{])\{[a-zA-Z_]+\}(?!\})/.test(j[k]), `${l}: ${k} usa {x}`);
    }
  }
});

test('act6: os 6 chefes da ficha sao os tipos novos e estao em CHEFES_TIPOS; legado intacto', () => {
  const chefes = Object.keys(A6.chefes!).map(Number).sort((a, b) => a - b).map(o => A6.chefes![o].tipo as string);
  assert.deepEqual(chefes, [...CHEFES_ATO6]);
  for (const c of chefes) assert.ok(CHEFES_TIPOS.has(c), c);
  assert.equal(CHEFES_TIPOS.size, CHEFES_LEGADO.length + 6 + CHEFES_ATO7.length + CHEFES_ATO8.length + CHEFES_ATO9.length + CHEFES_ATO5R.length + CHEFES_ATO10.length + CHEFES_CORROMPIDOS.length);   // + Atos VII (1c), VIII (2a), IX (2b), V refeito (3a) e a Fome (3b)
  assert.ok(!CHEFES_TIPOS.has('coro_cultista') && !CHEFES_TIPOS.has('fallen_seraph'));
  assert.equal(A6.conquista, 'act6_complete');
});
test('act6: falas dos chefes e conquista existem nas 3 linguas', () => {
  const raiz = process.env.GRIM_RAIZ!;
  const chaves = ['achievement.act6_complete.title', 'achievement.act6_complete.description', 'chefe.irma_de_cassiel.contra.cassiel',
    ...CHEFES_ATO6.filter(c => c !== 'fenix_ancia').flatMap(c => ['chegada', 'meio', 'morte'].map(m => `chefe.${c}.${m}`))];
  for (const l of ['pt-BR', 'en', 'zh-CN']) {
    const j = JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales', `${l}.json`), 'utf8'));
    for (const k of chaves) assert.ok(typeof j[k] === 'string' && j[k].length > 0, `${l}: ${k}`);
    for (const m of ['chegada', 'meio', 'morte']) assert.equal(j[`chefe.fenix_ancia.${m}`], undefined, 'fenix nao fala');
  }
});

// ── Ato VII (Etapa 1c) ─────────────────────────────────────────────────
const A7 = atoDoModo('act7')!;
const tipos7 = () => new Set<string>([...A7.faixas!.flatMap(f => f.pool.map(m => m.tipo as string)), ...Object.values(A7.chefes!).map(c => c.tipo as string)]);
test('act7: ficha, faixas 1-29, chefes 5..30 sao os tipos novos e reconhecidos como chefe; VI destrava o VII', () => {
  assert.equal(A7.numeral, 'VII'); assert.equal(A7.chaveDesbloqueio, 'grimhold_act7_unlocked');
  assert.equal(atoDoModo('act6')!.destrava, 'act7');
  assert.deepEqual(A7.faixas!.map(f => f.ateOnda), [9, 19, 29]);
  for (let o = 1; o <= 29; o++) assert.ok(A7.faixas!.some(f => f.ateOnda >= o), `onda ${o}`);
  const chefes = Object.keys(A7.chefes!).map(Number).sort((a, b) => a - b).map(o => A7.chefes![o].tipo as string);
  assert.deepEqual(chefes, [...CHEFES_ATO7]);
  for (const c of chefes) assert.ok(CHEFES_TIPOS.has(c), c);
  assert.equal(A7.sortear(30, 0, { ...comum, isBossSpawn: true }, base).type, 'ossoth');
  for (let o = 1; o <= 29; o++) for (const roll of [0, 0.2, 0.5, 0.8, 0.9999]) assert.ok(tipos7().has(A7.sortear(o, roll, comum, base).type as string));
  assert.equal(A7.conquista, 'act7_complete');
  // sapo-xama raro: metade do peso de um papel
  const f1 = A7.faixas![0].pool, peso = (p: string) => f1.filter(m => (m.tipo as string).startsWith(p) && !(p === 'sapo' && (m.tipo as string).startsWith('sapo_xama'))).reduce((s, m) => s + m.peso, 0);
  assert.equal(peso('sapo_xama') * 2, peso('sapo'));
});
test('act7: todo tipo (e o totem) tem sprite', () => {
  const raiz = process.env.GRIM_RAIZ!;
  for (const t of tipos7()) for (let i = 1; i <= 4; i++)
    assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies', `${SPRITE_ATO7[t] ?? t}_${i}.png`)), `${t}_${i}.png`);
  assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies/totem_xama.png')));
});
test('act7: chaves i18n nas 3 linguas (sem {x} simples); Alfa nao fala', () => {
  const raiz = process.env.GRIM_RAIZ!;
  const chaves = ['ui.actSelect.act7.title', 'ui.actSelect.act7.subtitle', 'ui.actSelect.act7.lore', 'ui.actSelect.act7.lockMsg', 'ui.hud.modeAct7', 'ui.runHistory.mode.act7',
    'ui.victory.act7', 'ui.victory.act7.subtitle', 'ui.victory.act7.boss', 'ui.victory.act7.text', 'ui.victory.act7.tagline',
    'achievement.act7_complete.title', 'achievement.act7_complete.description',
    ...A7.selecao.chefesChaves.map(c => `ui.actSelect.boss.${c}`),
    ...[...tipos7(), 'totem_xama'].flatMap(t => [`enemy.${t}.name`, `ui.obituary.enemy.${t}`]),
    ...CHEFES_ATO7.filter(c => c !== 'alfa_matilha').flatMap(c => ['chegada', 'meio', 'morte'].map(m => `chefe.${c}.${m}`))];
  for (const l of ['pt-BR', 'en', 'zh-CN']) {
    const j = JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales', `${l}.json`), 'utf8'));
    for (const k of chaves) {
      assert.ok(typeof j[k] === 'string' && j[k].length > 0, `${l}: ${k}`);
      assert.ok(!/(^|[^{])\{[a-zA-Z_]+\}(?!\})/.test(j[k]), `${l}: ${k} usa {x}`);
    }
    for (const m of ['chegada', 'meio', 'morte']) assert.equal(j[`chefe.alfa_matilha.${m}`], undefined, 'alfa nao fala');
  }
});

// ── Ato VIII (Etapa 2a) ────────────────────────────────────────────────
const A8 = atoDoModo('act8')!;
const tipos8 = () => new Set<string>([...A8.faixas!.flatMap(f => f.pool.map(m => m.tipo as string)), ...Object.values(A8.chefes!).map(c => c.tipo as string)]);
test('act8: ficha, faixas 1-29, chefes 5..30 sao os tipos novos e reconhecidos como chefe; VII destrava o VIII', () => {
  assert.equal(A8.numeral, 'VIII'); assert.equal(A8.chaveDesbloqueio, 'grimhold_act8_unlocked');
  assert.equal(atoDoModo('act7')!.destrava, 'act8');
  assert.deepEqual(A8.ajuste, atoDoModo('act7')!.ajuste);
  assert.deepEqual(A8.faixas!.map(f => f.ateOnda), [9, 19, 29]);
  for (let o = 1; o <= 29; o++) assert.ok(A8.faixas!.some(f => f.ateOnda >= o), `onda ${o}`);
  const chefes = Object.keys(A8.chefes!).map(Number).sort((a, b) => a - b).map(o => A8.chefes![o].tipo as string);
  assert.deepEqual(chefes, [...CHEFES_ATO8]);
  assert.deepEqual(Object.keys(A8.chefes!).map(Number).sort((a, b) => a - b), [5, 10, 15, 20, 25, 30]);
  for (const c of chefes) assert.ok(CHEFES_TIPOS.has(c), c);
  assert.equal(A8.sortear(30, 0, { ...comum, isBossSpawn: true }, base).type, 'kraken');
  for (let o = 1; o <= 29; o++) for (const roll of [0, 0.2, 0.5, 0.8, 0.9999]) assert.ok(tipos8().has(A8.sortear(o, roll, comum, base).type as string));
  assert.equal(A8.conquista, 'act8_complete');
  // todos os 22 comuns aparecem em alguma faixa; veterano com metade do peso de um papel
  assert.equal([...tipos8()].filter(t => !(CHEFES_ATO8 as readonly string[]).includes(t)).length, 22);
  const f2 = A8.faixas![1].pool, peso = (p: string) => f2.filter(m => (m.tipo as string).startsWith(p)).reduce((s, m) => s + m.peso, 0);
  assert.equal(peso('afogado_veterano') * 2, peso('caranguejo'));
});
test('act8: todo tipo tem sprite (remapeados pelo SPRITE_ATO8)', () => {
  const raiz = process.env.GRIM_RAIZ!;
  assert.deepEqual(Object.keys(SPRITE_ATO8).sort(), ['mae_das_aguas', 'rei_caranguejo', 'serpente_ancia']);
  for (const t of tipos8()) for (let i = 1; i <= 4; i++)
    assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies', `${SPRITE_ATO8[t] ?? t}_${i}.png`)), `${t}_${i}.png`);
  for (const f of [A8.fundo!.campo, A8.fundo!.patio]) assert.ok(fs.existsSync(path.join(raiz, 'public', f)), f);
});
test('act8: chaves i18n nas 3 linguas (sem {x} simples); Mae das Aguas e Kraken nao falam', () => {
  const raiz = process.env.GRIM_RAIZ!;
  const mudos = ['mae_das_aguas', 'kraken'];
  const chaves = ['ui.actSelect.act8.title', 'ui.actSelect.act8.subtitle', 'ui.actSelect.act8.lore', 'ui.actSelect.act8.lockMsg', 'ui.hud.modeAct8', 'ui.runHistory.mode.act8',
    'ui.victory.act8', 'ui.victory.act8.subtitle', 'ui.victory.act8.boss', 'ui.victory.act8.text', 'ui.victory.act8.tagline',
    'achievement.act8_complete.title', 'achievement.act8_complete.description',
    ...A8.selecao.chefesChaves.map(c => `ui.actSelect.boss.${c}`),
    ...[...tipos8()].flatMap(t => [`enemy.${t}.name`, `ui.obituary.enemy.${t}`]),
    ...CHEFES_ATO8.filter(c => !mudos.includes(c)).flatMap(c => ['chegada', 'meio', 'morte'].map(m => `chefe.${c}.${m}`))];
  for (const l of ['pt-BR', 'en', 'zh-CN']) {
    const j = JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales', `${l}.json`), 'utf8'));
    for (const k of chaves) {
      assert.ok(typeof j[k] === 'string' && j[k].length > 0, `${l}: ${k}`);
      assert.ok(!/(^|[^{])\{[a-zA-Z_]+\}(?!\})/.test(j[k]), `${l}: ${k} usa {x}`);
    }
    for (const c of mudos) for (const m of ['chegada', 'meio', 'morte']) assert.equal(j[`chefe.${c}.${m}`], undefined, `${c} nao fala`);
  }
});

// ── Ato IX (Etapa 2b) ──────────────────────────────────────────────────
const A9 = atoDoModo('act9')!;
const tipos9 = () => new Set<string>([...A9.faixas!.flatMap(f => f.pool.map(m => m.tipo as string)), ...Object.values(A9.chefes!).map(c => c.tipo as string)]);
const CRIAS9 = ['aranha', 'aranha_b'];
test('act9: ficha, faixas 1-29, chefes 5..30 sao os tipos novos e reconhecidos como chefe; VIII destrava o IX', () => {
  assert.equal(A9.numeral, 'IX'); assert.equal(A9.chaveDesbloqueio, 'grimhold_act9_unlocked');
  assert.equal(atoDoModo('act8')!.destrava, 'act9');
  assert.deepEqual(A9.ajuste, atoDoModo('act8')!.ajuste);
  assert.equal(A9.muralhaInfernalReforcada, true); assert.equal(A9.regenHeroisMult, 2.5);
  assert.deepEqual(A9.faixas!.map(f => f.ateOnda), [9, 19, 29]);
  const chefes = Object.keys(A9.chefes!).map(Number).sort((a, b) => a - b).map(o => A9.chefes![o].tipo as string);
  assert.deepEqual(chefes, ['general_ossos', 'cranio_ancestral', 'drider', 'estatua_leste', 'cerbero_alfa', 'quimera']);
  assert.deepEqual([...CHEFES_ATO9].sort(), [...chefes, 'estatua_oeste'].sort());
  for (const c of CHEFES_ATO9) assert.ok(CHEFES_TIPOS.has(c), c);
  assert.equal(A9.sortear(30, 0, { ...comum, isBossSpawn: true }, base).type, 'quimera');
  assert.equal(A9.sortear(20, 0, { ...comum, isBossSpawn: true }, base).type, 'estatua_leste');
  for (let o = 1; o <= 29; o++) for (const roll of [0, 0.2, 0.5, 0.8, 0.9999]) assert.ok(tipos9().has(A9.sortear(o, roll, comum, base).type as string));
  assert.equal(A9.conquista, 'act9_complete');
  // os 18 comuns aparecem em alguma faixa; crias da Drider so invocadas; papeis com peso 12
  const comuns = [...tipos9()].filter(t => !(CHEFES_ATO9 as readonly string[]).includes(t));
  assert.equal(comuns.length, 18);
  for (const c of CRIAS9) assert.ok(!tipos9().has(c), c);
  const peso = (fx: number, p: string) => A9.faixas![fx].pool.filter(m => (m.tipo as string).startsWith(p)).reduce((s, m) => s + m.peso, 0);
  assert.equal(peso(0, 'legiao'), 12); assert.equal(peso(0, 'cranio'), 12); assert.equal(peso(0, 'mumia'), 12);
  assert.equal(peso(1, 'estatua_lamina'), 12); assert.equal(peso(1, 'beholder9'), 12); assert.equal(peso(1, 'legiao'), 12);
  assert.equal(peso(2, 'cerbero'), 12); assert.equal(peso(2, 'estatua_lamina'), 12);
  // ~10% mais vida que o VIII (media de vida por faixa)
  const media = (a: Ato, i: number) => a.faixas![i].pool.reduce((s, m) => s + m.hp * m.peso, 0) / a.faixas![i].pool.reduce((s, m) => s + m.peso, 0);
  for (let i = 0; i < 3; i++) { const r = media(A9, i) / media(atoDoModo('act8')!, i); assert.ok(r > 1.0 && r < 1.25, `faixa ${i}: ${r}`); }
});
test('act9: todo tipo tem sprite (remapeados pelo SPRITE_ATO9), incluindo crias e a Estatua do Oeste; cenario existe', () => {
  const raiz = process.env.GRIM_RAIZ!;
  assert.deepEqual(SPRITE_ATO9, { general_ossos: 'legiao_e', cranio_ancestral: 'cranio_d', cerbero_alfa: 'cerbero_b' });
  for (const t of [...tipos9(), ...CRIAS9, 'estatua_oeste']) for (let i = 1; i <= 4; i++)
    assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies', `${SPRITE_ATO9[t] ?? t}_${i}.png`)), `${t}_${i}.png`);
  for (const f of [A9.fundo!.campo, A9.fundo!.patio]) assert.ok(fs.existsSync(path.join(raiz, 'public', f)), f);
});
test('act9: nenhum tipo do IX colide com tipo de ato anterior', () => {
  const antigos = new Set<string>([...CHEFES_LEGADO, ...CHEFES_ATO6, ...CHEFES_ATO7, ...CHEFES_ATO8,
    ...ATOS.filter(a => a.numero >= 6 && a.numero <= 8).flatMap(a => a.faixas!.flatMap(f => f.pool.map(m => m.tipo as string)))]);
  const tiposTs = fs.readFileSync(path.join(process.env.GRIM_RAIZ!, 'types.ts'), 'utf8');
  const bloco = tiposTs.slice(tiposTs.indexOf('export type EnemyType'), tiposTs.indexOf('// Ato 9'));
  for (const t of [...tipos9(), ...CRIAS9, 'estatua_oeste']) {
    assert.ok(!antigos.has(t), t);
    assert.ok(!bloco.includes(`'${t}'`), `${t} ja existia em EnemyType`);
  }
  assert.ok(!tipos9().has('beholder') && tipos9().has('beholder9'), 'o olho do IX e beholder9, nao o beholder antigo');
});
test('act9: chaves i18n nas 3 linguas (sem {x} simples); Cranio Ancestral e Cerbero Alfa nao falam', () => {
  const raiz = process.env.GRIM_RAIZ!;
  const mudos = ['cranio_ancestral', 'cerbero_alfa'];
  const falas = ['general_ossos.chegada', 'general_ossos.meio', 'general_ossos.morte', 'drider.chegada', 'drider.meio', 'drider.morte',
    'estatua_leste.chegada', 'estatua_oeste.chegada', 'estatua_leste.meio', 'estatua_leste.morte', 'estatua_oeste.morte',
    'quimera.chegada', 'quimera.meio', 'quimera.morte'];
  const chaves = ['ui.actSelect.act9.title', 'ui.actSelect.act9.subtitle', 'ui.actSelect.act9.lore', 'ui.actSelect.act9.lockMsg', 'ui.hud.modeAct9', 'ui.runHistory.mode.act9',
    'ui.victory.act9', 'ui.victory.act9.subtitle', 'ui.victory.act9.boss', 'ui.victory.act9.text', 'ui.victory.act9.tagline',
    'achievement.act9_complete.title', 'achievement.act9_complete.description',
    ...A9.selecao.chefesChaves.map(c => `ui.actSelect.boss.${c}`),
    ...[...tipos9(), ...CRIAS9, 'estatua_oeste'].flatMap(t => [`enemy.${t}.name`, `ui.obituary.enemy.${t}`]),
    ...falas.map(f => `chefe.${f}`)];
  for (const l of ['pt-BR', 'en', 'zh-CN']) {
    const j = JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales', `${l}.json`), 'utf8'));
    for (const k of chaves) {
      assert.ok(typeof j[k] === 'string' && j[k].length > 0, `${l}: ${k}`);
      assert.ok(!/(^|[^{])\{[a-zA-Z_]+\}(?!\})/.test(j[k]), `${l}: ${k} usa {x}`);
    }
    for (const c of mudos) for (const m of ['chegada', 'meio', 'morte']) assert.equal(j[`chefe.${c}.${m}`], undefined, `${c} nao fala`);
    assert.equal(j['chefe.estatua_oeste.meio'], undefined);
  }
  assert.equal(JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales/en.json'), 'utf8'))['achievement.act9_complete.title'], 'Gatebreaker');
});
// ── Ato V refeito e Ato X (Etapa 3a) ───────────────────────────────────
import { ATO5_REFEITO, ATO5_NOVO, ATO5_LEGADO } from '../../components/data/atos';
import { SPRITE_ATO5R } from '../../components/chefes/lista';
const SPAWNS = [comum, { ...comum, isEscort: true }, { ...comum, isBossSpawn: true }, { ...comum, isSecondBossSpawn: true }];
const A5N = ATO5_NOVO;
const tipos5r = () => new Set<string>([...A5N.faixas!.flatMap(f => f.pool.map(m => m.tipo as string)), ...Object.values(A5N.chefes!).map(c => c.tipo as string)]);
const COMUNS5R = ['soldado_ashfen', 'soldado_ashfen_b', 'soldado_ashfen_c', 'soldado_ashfen_d', 'capanga', 'capanga_b', 'capanga_c', 'cavaleiro_negro', 'cavaleiro_negro_b',
  'saqueador', 'saqueador_lanca', 'saqueador_martelo', 'saqueador_espada', 'lich5', 'lich5_b', 'mago_colegiado', 'mago_colegiado_b', 'runa_hostil', 'runa_hostil_b'];
const NOVOS10 = ['celula', 'celula_b', 'celula_c', 'celula_d', 'tentaculo', 'tentaculo_b', 'slime_grande', 'slime_grande_b', 'bolha', 'bolha_b'];

test('chave ATO5_REFEITO ligada fora da demo: o act5 do jogo e o refeito; a ficha legada (demo) sorteia igual ao legado', () => {
  assert.equal(ATO5_REFEITO, true);
  assert.equal(atoDoModo('act5'), ATO5_NOVO);
  assert.equal(ATO5_LEGADO.final, true); assert.equal(ATO5_LEGADO.textos, undefined);
  assert.deepEqual(ATO5_LEGADO.selecao.chefesChaves, ['elder_demon', 'elder_minotaur', 'malachar']);
  for (let onda = 1; onda <= 30; onda++) for (const f of SPAWNS) for (let k = 0; k < 200; k += 7)
    assert.deepEqual(ATO5_LEGADO.sortear(onda, k / 200, f, base), sortearLegado(5, onda, k / 200, f, base));
});
test('act5 refeito: mesma base do V antigo, faixas 9/19/29, chefes 5..30 novos, nao final, textos act5r', () => {
  for (const k of ['id', 'modo', 'numero', 'numeral', 'chaveDesbloqueio', 'destrava', 'ajuste', 'arena', 'muralhaInfernalReforcada', 'regenHeroisMult', 'conquista'] as const)
    assert.deepEqual(A5N[k], ATO5_LEGADO[k], k);
  assert.equal(A5N.final, undefined); assert.equal(A5N.textos, 'act5r');
  assert.deepEqual(A5N.faixas!.map(f => f.ateOnda), [9, 19, 29]);
  const chefes = Object.keys(A5N.chefes!).map(Number).sort((a, b) => a - b).map(o => A5N.chefes![o].tipo as string);
  assert.deepEqual(chefes, [...CHEFES_ATO5R]);
  for (const c of chefes) assert.ok(CHEFES_TIPOS.has(c), c);
  for (const [o, c] of Object.entries(A5N.chefes!)) assert.equal(A5N.sortear(Number(o), 0, { ...comum, isBossSpawn: true }, base).type, c.tipo);
  for (let o = 1; o <= 29; o++) for (const roll of [0, 0.2, 0.5, 0.8, 0.9999]) assert.ok(tipos5r().has(A5N.sortear(o, roll, comum, base).type as string));
  const comuns = [...tipos5r()].filter(t => !(CHEFES_ATO5R as readonly string[]).includes(t));
  assert.deepEqual(comuns.sort(), [...COMUNS5R, 'corrupt_paladin', 'death_knight'].sort());
  const peso = (fx: number, p: string) => A5N.faixas![fx].pool.filter(m => (m.tipo as string).startsWith(p)).reduce((s, m) => s + m.peso, 0);
  assert.equal(peso(0, 'capanga'), 12); assert.equal(peso(0, 'soldado_ashfen'), 18);   // corpo a corpo 12 + arqueiro 6
  assert.equal(peso(1, 'cavaleiro_negro'), 12); assert.equal(peso(1, 'saqueador'), 12); assert.equal(peso(1, 'corrupt_paladin'), 12);
  for (const p of ['death_knight', 'lich5', 'mago_colegiado', 'runa_hostil']) assert.equal(peso(2, p), 12, p);
  const arq = A5N.faixas![0].pool.find(m => m.tipo === 'soldado_ashfen_c')!; assert.ok(arq.alcance! >= 500);
  const lanca = A5N.faixas![1].pool.find(m => m.tipo === 'saqueador_lanca')!; assert.ok(lanca.alcance! > 0 && lanca.alcance! <= 300);
  // mesma ordem de grandeza do V antigo: vida media de cada faixa entre 0,7x e 1,4x da do legado
  const mediaLeg = (a: number, b: number) => { let s = 0, n = 0; for (let o = a; o <= b; o++) for (let k = 0; k < 100; k++) { s += sortearLegado(5, o, k / 100, comum, base).hp / base.hp; n++; } return s / n; };
  const media = (i: number) => A5N.faixas![i].pool.reduce((s, m) => s + m.hp * m.peso, 0) / A5N.faixas![i].pool.reduce((s, m) => s + m.peso, 0);
  [[1, 9], [11, 19], [21, 29]].forEach(([a, b], i) => { const r = media(i) / mediaLeg(a, b); assert.ok(r > 0.7 && r < 1.4, `faixa ${i}: ${r}`); });
});
test('act5 refeito: todo tipo tem sprite (remapeados pelo SPRITE_ATO5R)', () => {
  const raiz = process.env.GRIM_RAIZ!;
  assert.deepEqual(SPRITE_ATO5R, { sargento_ashfen: 'soldado_ashfen_d', chefe_saqueador: 'saqueador_martelo', lich_colegiado: 'lich5_b' });
  for (const t of tipos5r()) for (let i = 1; i <= 4; i++)
    assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies', `${SPRITE_ATO5R[t] ?? t}_${i}.png`)), `${t}_${i}.png`);
});

const A10 = atoDoModo('act10')!;
const tipos10 = () => new Set<string>([...A10.faixas!.flatMap(f => f.pool.map(m => m.tipo as string)), ...Object.values(A10.chefes!).map(c => c.tipo as string)]);
test('act10: ficha, destravado pelo IX, final, chefes legados do V com os numeros do legado', () => {
  assert.equal(A10.final, true);
  assert.equal(A10.numeral, 'X'); assert.equal(A10.chaveDesbloqueio, 'grimhold_act10_unlocked');
  assert.equal(atoDoModo('act9')!.destrava, 'act10'); assert.equal(A10.destrava, undefined);
  assert.deepEqual(A10.ajuste, atoDoModo('act9')!.ajuste);
  assert.equal(A10.muralhaInfernalReforcada, true); assert.equal(A10.regenHeroisMult, 2.5);
  assert.equal(A10.conquista, 'act10_complete');
  assert.deepEqual(A10.selecao.chefesChaves, ['ghazbaran', 'zathroth', 'malachar']);
  assert.equal(A10.fundo!.corBase, '#0b0614'); assert.equal(A10.fundo!.corDestaque, '#8b5cf6');
  const chefes = Object.keys(A10.chefes!).map(Number).sort((a, b) => a - b).map(o => A10.chefes![o].tipo as string);
  assert.deepEqual(chefes, ['infernatil', 'demon', 'ghazbaran', 'minotaur_king', 'zathroth', 'malachar']);
  for (const c of chefes) assert.ok(CHEFES_LEGADO.includes(c as any), c);
  for (const o of [5, 10, 15, 20, 25]) assert.deepEqual(A10.sortear(o, 0.5, { ...comum, isBossSpawn: true }, base), sortearLegado(5, o, 0.5, { ...comum, isBossSpawn: true }, base), `chefe ${o}`);
  // o Malachar foi da 30 para a 31 (ultimaOnda), com +30% sobre os numeros do legado (vida calibrada, ver ato10_onda31)
  const leg30 = sortearLegado(5, 30, 0.5, { ...comum, isBossSpawn: true }, base), m31 = A10.sortear(31, 0.5, { ...comum, isBossSpawn: true }, base);
  assert.equal(m31.type, 'malachar'); assert.ok(Math.abs(m31.damage - leg30.damage * 1.3) < 1e-9);
});
test('act10: ondas 1-9 (e a escolta da 10) sao a legiao do V antigo com os mesmos numeros do legado', () => {
  for (let o = 1; o <= 9; o++) for (const f of [comum, { ...comum, isEscort: true }]) for (let k = 0; k < 200; k++)
    assert.deepEqual(A10.sortear(o, k / 200, f, base), sortearLegado(5, o, k / 200, f, base), `onda ${o} roll ${k / 200}`);
  for (let k = 0; k < 200; k++) assert.deepEqual(A10.sortear(10, k / 200, { ...comum, isEscort: true }, base), sortearLegado(5, 10, k / 200, { ...comum, isEscort: true }, base));
  // as faixas 4 e 9 guardam os mesmos numeros (longe das bordas de roll)
  for (const [o, roll] of [[2, 0.1], [2, 0.4], [2, 0.7], [2, 0.9], [7, 0.1], [7, 0.5], [7, 0.9]])
    assert.deepEqual(sortearInimigo(A10, o, roll, comum, base), sortearLegado(5, o, roll, comum, base), `faixa ${o} ${roll}`);
});
test('act10: faixas 11-29 do ventre (~10% mais vida que o legado do V), tipos e sprites', () => {
  const raiz = process.env.GRIM_RAIZ!;
  assert.deepEqual(A10.faixas!.map(f => f.ateOnda), [4, 9, 19, 29, 30]);
  const t19 = A10.faixas![2].pool.map(m => m.tipo as string), t29 = A10.faixas![3].pool.map(m => m.tipo as string);
  for (const p of ['celula', 'tentaculo', 'acaro_', 'vespa']) assert.ok(t19.some(t => t.startsWith(p)), p);
  for (const p of ['slime_grande', 'bolha', 'void_herald', 'warlock_shade']) assert.ok(t29.some(t => t.startsWith(p)), p);
  for (const t of NOVOS10) assert.ok(tipos10().has(t), t);
  const tent = A10.faixas![2].pool.find(m => m.tipo === 'tentaculo')!; assert.equal(tent.alcance, 260);
  const mediaLeg = (a: number, b: number) => { let s = 0, n = 0; for (let o = a; o <= b; o++) for (let k = 0; k < 100; k++) { s += sortearLegado(5, o, k / 100, comum, base).hp / base.hp; n++; } return s / n; };
  const media = (i: number) => A10.faixas![i].pool.reduce((s, m) => s + m.hp * m.peso, 0) / A10.faixas![i].pool.reduce((s, m) => s + m.peso, 0);
  [[11, 19, 2], [21, 29, 3]].forEach(([a, b, i]) => { const r = media(i) / mediaLeg(a, b); assert.ok(r > 1.0 && r < 1.25, `faixa ${i}: ${r}`); });
  for (let o = 11; o <= 29; o++) for (const roll of [0, 0.3, 0.6, 0.9999]) assert.ok(tipos10().has(A10.sortear(o, roll, comum, base).type as string));
  for (const t of tipos10()) for (let i = 1; i <= 4; i++)
    assert.ok(fs.existsSync(path.join(raiz, 'public/sprites/enemies', `${t}_${i}.png`)), `${t}_${i}.png`);
  for (const f of [A10.fundo!.campo, A10.fundo!.patio]) assert.ok(fs.existsSync(path.join(raiz, 'public', f)), f);
});
test('Etapa 3a: nenhum tipo novo (V refeito e X) colide com tipo antigo', () => {
  const antigos = new Set<string>([...CHEFES_LEGADO, ...CHEFES_ATO6, ...CHEFES_ATO7, ...CHEFES_ATO8, ...CHEFES_ATO9,
    ...ATOS.filter(a => a.numero >= 6 && a.numero <= 9).flatMap(a => a.faixas!.flatMap(f => f.pool.map(m => m.tipo as string)))]);
  const tiposTs = fs.readFileSync(path.join(process.env.GRIM_RAIZ!, 'types.ts'), 'utf8');
  const bloco = tiposTs.slice(tiposTs.indexOf('export type EnemyType'), tiposTs.indexOf('// Ato 5 refeito'));
  for (const t of [...COMUNS5R, ...CHEFES_ATO5R, ...NOVOS10]) {
    assert.ok(!antigos.has(t), t);
    assert.ok(!bloco.includes(`'${t}'`), `${t} ja existia em EnemyType`);
  }
});
test('Etapa 3a: chaves i18n nas 3 linguas (sem {x} simples); falas e contra.<heroi> com ids reais; mudos', () => {
  const raiz = process.env.GRIM_RAIZ!;
  const falas = ['tesoureiro.chegada', 'tesoureiro.meio', 'tesoureiro.morte', 'tesoureiro.contra.vex',
    'capitao_ashfen.chegada', 'capitao_ashfen.meio', 'capitao_ashfen.morte', 'capitao_ashfen.contra.berserker', 'capitao_ashfen.contra.paladin',
    'reitor.chegada', 'reitor.meio', 'reitor.morte', 'reitor.contra.mage', 'reitor.contra.runesmith'];
  const chaves = [
    ...['title', 'subtitle', 'lore', 'lockMsg'].flatMap(k => [`ui.actSelect.act5r.${k}`, `ui.actSelect.act10.${k}`]),
    ...['', '.subtitle', '.boss', '.text', '.tagline'].flatMap(k => [`ui.victory.act5r${k}`, `ui.victory.act10${k}`]),
    'ui.hud.modeAct10', 'ui.runHistory.mode.act10', 'achievement.act10_complete.title', 'achievement.act10_complete.description',
    ...[...A5N.selecao.chefesChaves, ...A10.selecao.chefesChaves].map(c => `ui.actSelect.boss.${c}`),
    ...[...tipos5r(), ...NOVOS10].filter(t => !['corrupt_paladin', 'death_knight'].includes(t)).flatMap(t => [`enemy.${t}.name`, `ui.obituary.enemy.${t}`]),
    ...falas.map(f => `chefe.${f}`)];
  for (const l of ['pt-BR', 'en', 'zh-CN']) {
    const j = JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales', `${l}.json`), 'utf8'));
    for (const k of chaves) {
      assert.ok(typeof j[k] === 'string' && j[k].length > 0, `${l}: ${k}`);
      assert.ok(!/(^|[^{])\{[a-zA-Z_]+\}(?!\})/.test(j[k]), `${l}: ${k} usa {x}`);
    }
    for (const c of ['sargento_ashfen', 'chefe_saqueador', 'lich_colegiado']) for (const m of ['chegada', 'meio', 'morte']) assert.equal(j[`chefe.${c}.${m}`], undefined, `${c} nao fala`);
    assert.equal(j['ui.actSelect.act5.subtitle'] !== j['ui.actSelect.act5r.subtitle'], true, 'textos do V antigo intactos e separados');
  }
  const en = JSON.parse(fs.readFileSync(path.join(raiz, 'i18n/locales/en.json'), 'utf8'));
  assert.equal(en['achievement.act10_complete.title'], "The Hunger's Door");
  assert.equal(en['ui.actSelect.act5r.subtitle'], 'The Fall of Grimhold');
  assert.equal(en['ui.actSelect.act5.subtitle'], 'The End of Grimhold');
});
