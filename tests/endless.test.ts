import { test } from 'node:test';
import assert from 'node:assert/strict';
import fs from 'node:fs';
import path from 'node:path';
import { ATOS } from '../components/data/atos';
import {
  ENDLESS_CICLO, ENDLESS_NBLOCOS, ENDLESS_BLOCK_SCALES, posEndless, atoDoBlocoEndless, ehChefeEndless, blocoUsaFicha,
  chefeEndless, sortearComumEndless, inimigoExcluido, mobsRandomizerExtras, chefesRandomizerExtras, mapaDaOnda, MAPAS_ATOS,
  multEndless,
} from '../components/systems/endless';

const base = { type: 'goblin' as any, hp: 100, damage: 3, speed: 1, radius: 24, attackRange: 0, attackSpeed: 0 };
const TODOS: string[] = ATOS.map(a => a.modo as string);

test('ciclo do Infinito: 300 ondas, 10 blocos de 30, bloco -> ato certo', () => {
  assert.equal(ENDLESS_CICLO, 300);
  assert.equal(ENDLESS_NBLOCOS, 10);
  assert.equal(ENDLESS_BLOCK_SCALES.length, 10);
  for (let i = 1; i < 10; i++) assert.ok(ENDLESS_BLOCK_SCALES[i] > ENDLESS_BLOCK_SCALES[i - 1]);
  const casos: [number, number, number][] = [[1, 0, 1], [30, 0, 30], [31, 1, 1], [150, 4, 30], [151, 5, 1], [200, 6, 20], [271, 9, 1], [300, 9, 30], [301, 0, 1]];
  for (const [w, bloco, local] of casos) {
    const p = posEndless(w);
    assert.equal(p.bloco, bloco, `onda ${w}`); assert.equal(p.local, local, `onda ${w}`);
    assert.equal(atoDoBlocoEndless(p.bloco).numero, bloco + 1);
  }
  assert.equal(posEndless(301).ciclo, 1);
  assert.equal(posEndless(300).ciclo, 0);
  assert.ok(ehChefeEndless(200) && ehChefeEndless(300) && !ehChefeEndless(205));
  // V refeito e VI-X pela ficha; I-IV pelo codigo antigo do Infinito
  assert.deepEqual([...Array(10).keys()].map(blocoUsaFicha), [false, false, false, false, true, true, true, true, true, true]);
  // escala por onda/ciclo (aplicada uma vez so): vida plana ate a 150, cresce depois, ciclo seguinte mais forte
  assert.equal(multEndless(150).hp, 1);
  assert.ok(multEndless(300).hp > 3 && multEndless(300).hp < 3.5);
  assert.ok(multEndless(301).hp > multEndless(300).hp);
  assert.ok(multEndless(200).vel === multEndless(151).vel);
});

test('chefe a cada 10 ondas vem do ato do bloco, nunca excluido', () => {
  for (let b = 4; b < 10; b++) {
    const ato = atoDoBlocoEndless(b);
    for (const local of [10, 20, 30]) {
      const c = chefeEndless(ato, local);
      assert.ok(c, `bloco ${b} onda ${local}`);
      assert.ok(!inimigoExcluido(c!.tipo as string), `${c!.tipo}`);
      assert.ok(Object.values(ato.chefes ?? {}).some(x => x.tipo === c!.tipo));
    }
  }
  assert.equal(chefeEndless(atoDoBlocoEndless(9), 30)?.tipo, 'zathroth');   // o Malachar final (31) fica de fora
  assert.notEqual(chefeEndless(atoDoBlocoEndless(8), 20)?.tipo, 'estatua_leste');
});

test('exclusoes: nenhum fome_/corrupted_/estatua/Malachar sorteado no Infinito', () => {
  for (let b = 4; b < 10; b++) {
    const ato = atoDoBlocoEndless(b);
    for (let local = 1; local <= 30; local++) {
      if (local % 10 === 0) continue;
      for (let i = 0; i < 40; i++) {
        const r = sortearComumEndless(ato, local, i / 40, base);
        assert.ok(!inimigoExcluido(r.type as string), `bloco ${b} onda ${local}: ${r.type}`);
        assert.notEqual(r.type, 'goblin', `bloco ${b} onda ${local} caiu no base`);
      }
    }
  }
});

test('exclusoes no Randomizador e extras com numeros no molde do pool', () => {
  const ms = mobsRandomizerExtras(['void_stalker', 'death_knight']);
  const cs = chefesRandomizerExtras(['malachar', 'zathroth']);
  assert.ok(ms.length > 20); assert.ok(cs.length > 15);
  for (const m of ms) {
    assert.ok(!inimigoExcluido(m.type as string), m.type);
    assert.ok(!['void_stalker', 'death_knight'].includes(m.type as string));
    assert.ok(m.hpMult > 0.5 && m.hpMult <= 8 && m.dmg > 5 && m.dmg < 60, `${m.type} ${m.hpMult} ${m.dmg}`);
  }
  for (const c of cs) {
    assert.ok(!inimigoExcluido(c.type as string), c.type);
    assert.ok(c.hpMult >= 10 && c.hpMult <= 45 && c.dmg >= 22 && c.dmg <= 130, `${c.type} ${c.hpMult} ${c.dmg}`);
  }
  assert.equal(new Set(ms.map(m => m.type)).size, ms.length);
});

test('Solitario roda sobre o Infinito (handleModeSelectConfirm manda solo -> endless fora da demo)', () => {
  const src = fs.readFileSync(path.join(process.env.GRIM_RAIZ ?? process.cwd(), 'components', 'GameCanvas.tsx'), 'utf8');
  assert.match(src, /\(mode === 'solo' && !IS_DEMO\) \? 'endless'/);
  // e o Infinito usa o ciclo do systems/endless.ts (nada de 150 fixo)
  assert.doesNotMatch(src, /% 150\)/);
  assert.match(src, /cycleLen = \(gameMode === 'endless' \|\| gameMode === 'pacifist'\) \? ENDLESS_CICLO/);
});

test("escolha de mapa: 'seguir' devolve o ato do bloco; trancado cai no ultimo liberado; fixo e aleatorio", () => {
  assert.equal(MAPAS_ATOS().length, 10);
  assert.equal(mapaDaOnda('seguir', 1, 'endless', TODOS, 7), 'standard');
  assert.equal(mapaDaOnda('seguir', 45, 'endless', TODOS, 7), 'act2');
  assert.equal(mapaDaOnda('seguir', 200, 'endless', TODOS, 7), 'act7');
  assert.equal(mapaDaOnda('seguir', 300, 'endless', TODOS, 7), 'act10');
  assert.equal(mapaDaOnda('seguir', 301, 'endless', TODOS, 7), 'standard');
  assert.equal(mapaDaOnda('seguir', 200, 'endless', ['standard', 'act2', 'act3'], 7), 'act3');
  assert.equal(mapaDaOnda('act6', 5, 'endless', TODOS, 7), 'act6');
  assert.equal(mapaDaOnda('act6', 5, 'endless', ['standard'], 7), 'standard');
  const al = mapaDaOnda('aleatorio', 1, 'endless', TODOS, 99);
  assert.ok(TODOS.includes(al));
  assert.equal(mapaDaOnda('aleatorio', 250, 'endless', TODOS, 99), al);
  // Randomizador 'seguir': fixo dentro de um bloco de 30, sempre liberado
  const lib = ['standard', 'act4', 'act9'];
  assert.equal(mapaDaOnda('seguir', 31, 'randomizer', lib, 5), mapaDaOnda('seguir', 60, 'randomizer', lib, 5));
  for (let w = 1; w < 400; w += 13) assert.ok(lib.includes(mapaDaOnda('seguir', w, 'randomizer', lib, 5)));
});
