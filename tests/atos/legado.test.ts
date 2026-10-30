// Impressao digital do sorteio dos Atos I-V: para cada ato x onda x tipo de spawn,
// hash dos resultados de 200 valores de roll. Se um numero mudar, o hash muda.
// Regerar (so quando a mudanca for de proposito): GRIM_GERAR=1 npm test -- legado
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { createHash } from 'node:crypto';
import fs from 'node:fs';
import path from 'node:path';
import { sortearLegado, type FlagsSpawn } from '../../components/data/atosLegado';

const ARQ = path.join(process.env.GRIM_RAIZ ?? '.', 'tests', 'atos', 'legado.hashes.json');
const SPAWNS: Record<string, FlagsSpawn> = {
  comum: { isBossSpawn: false, isSecondBossSpawn: false, isEscort: false },
  escolta: { isBossSpawn: false, isSecondBossSpawn: false, isEscort: true },
  chefe: { isBossSpawn: true, isSecondBossSpawn: false, isEscort: false },
  segundo: { isBossSpawn: false, isSecondBossSpawn: true, isEscort: false },
};
function hashes(): Record<string, string> {
  const out: Record<string, string> = {};
  for (let ato = 1; ato <= 5; ato++) for (let onda = 1; onda <= 30; onda++) for (const [nome, f] of Object.entries(SPAWNS)) {
    const linhas: string[] = [];
    for (let k = 0; k < 200; k++) {
      const roll = k / 200;
      // base igual a de createEnemy: hp 30+6w, speed 0.5+0.03w, radius 24, dano 3, sem alcance
      const r = sortearLegado(ato, onda, roll, f, { type: 'goblin', hp: 30 + onda * 6, damage: 3, speed: 0.5 + onda * 0.03, radius: 24, attackRange: 0, attackSpeed: 0 });
      linhas.push(JSON.stringify(r));
    }
    out[`${ato}-${onda}-${nome}`] = createHash('sha256').update(linhas.join('\n')).digest('hex').slice(0, 16);
  }
  return out;
}
test('sorteio dos Atos I-V igual a referencia', () => {
  const atual = hashes();
  if (process.env.GRIM_GERAR === '1' || !fs.existsSync(ARQ)) { fs.writeFileSync(ARQ, JSON.stringify(atual, null, 1)); return; }
  const ref = JSON.parse(fs.readFileSync(ARQ, 'utf8'));
  const diferentes = Object.keys(ref).filter(k => ref[k] !== atual[k]);
  assert.deepEqual(diferentes, [], `mudou: ${diferentes.slice(0, 10).join(', ')}`);
});
