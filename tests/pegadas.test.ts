import { test } from 'node:test';
import assert from 'node:assert/strict';
import { pegada, peBloqueado, yLivre, desviar } from '../components/systems/pegadas';
import { BARRIER_X, SPAWN_MIN_Y, SPAWN_MAX_Y } from '../components/systems/combat';
import { ARENA_ACT1_OBJECTS } from '../components/data/arenaAct1';
import { ARENA_ACT2_OBJECTS } from '../components/data/arenaAct2';
import { ARENA_ACT3_OBJECTS } from '../components/data/arenaAct3';
import { ARENA_ACT4_OBJECTS } from '../components/data/arenaAct4';
import { ARENA_ACT5_OBJECTS } from '../components/data/arenaAct5';
import { ARENA_ACT6_OBJECTS } from '../components/data/arenaAct6';
import { ARENA_ACT7_OBJECTS } from '../components/data/arenaAct7';
import { ARENA_ACT8_OBJECTS } from '../components/data/arenaAct8';
import { ARENA_ACT9_OBJECTS } from '../components/data/arenaAct9';
import { ARENA_ACT10_OBJECTS } from '../components/data/arenaAct10';
import { ARENA_ACT10B_OBJECTS } from '../components/data/arenaAct10b';
import { ARENA_ENDLESS_OBJECTS, ARENA_PACIFIST_OBJECTS, ARENA_RANDOMIZER_OBJECTS } from '../components/data/arenaModos';

// Regra do Marcos: ninguem anda por cima de lapide/estatua/pedra grande.
const ARENAS = { I: ARENA_ACT1_OBJECTS, II: ARENA_ACT2_OBJECTS, III: ARENA_ACT3_OBJECTS, IV: ARENA_ACT4_OBJECTS,
  V: ARENA_ACT5_OBJECTS, VI: ARENA_ACT6_OBJECTS, VII: ARENA_ACT7_OBJECTS, VIII: ARENA_ACT8_OBJECTS, IX: ARENA_ACT9_OBJECTS,
  X: ARENA_ACT10_OBJECTS, Xb: ARENA_ACT10B_OBJECTS, endless: ARENA_ENDLESS_OBJECTS, pacifist: ARENA_PACIFIST_OBJECTS, randomizer: ARENA_RANDOMIZER_OBJECTS };

for (const [nome, objs] of Object.entries(ARENAS)) {
  test(`pegadas ${nome}: nascimento nunca poe o pe em cima de objeto e sobra faixa livre`, () => {
    const p = objs.map(o => pegada(o, BARRIER_X));
    for (const alt of [36, 60, 84, 120]) {
      let livres = 0;
      for (let y = SPAWN_MIN_Y; y <= SPAWN_MAX_Y; y++) {
        const yl = yLivre(p, y, alt, SPAWN_MIN_Y, SPAWN_MAX_Y);
        assert.ok(!peBloqueado(p, yl + alt), `${nome} alt ${alt} y ${y} -> ${yl}`);
        if (!peBloqueado(p, y + alt)) livres++;
      }
      assert.ok(livres / (SPAWN_MAX_Y - SPAWN_MIN_Y + 1) >= 0.4, `${nome} alt ${alt}: so ${livres} y livres`);
    }
  });
}

test('lapides do Ato II: inimigo com pe na pegada desliza pra fora sem mudar o x', () => {
  const lap = ARENA_ACT2_OBJECTS.find(o => o.src.endsWith('/lapides.png'))!;
  const p = [pegada(lap, BARRIER_X)];
  const alt = 60, x = BARRIER_X + lap.x + lap.w / 2 - 30;
  let y = (lap.base ?? 0) - 10 - alt;   // pe 10 px acima da base: dentro da pegada
  for (let i = 0; i < 60; i++) y = desviar(p, x, y, 60, alt, 2, SPAWN_MIN_Y, SPAWN_MAX_Y);
  assert.ok(!peBloqueado(p, y + alt));
});
