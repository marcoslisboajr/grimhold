// Etapa 1c T0: o predicado unico de chefe e os campos da ficha que substituiram 'act6' no GameCanvas
// devolvem exatamente o que o codigo antigo devolvia para os tipos/modos existentes.
import { test } from 'node:test';
import assert from 'node:assert/strict';
import { ehChefe, CHEFES_LEGADO, CHEFES_ATO6, CHEFES_ATOS_NOVOS } from '../../components/chefes/lista';
import { atoDoModo } from '../../components/data/atos';

test('ehChefe: legado + Ato VI sao chefe; comuns e invocados nao', () => {
  for (const t of [...CHEFES_LEGADO, ...CHEFES_ATO6]) assert.ok(ehChefe(t), t);
  for (const t of ['goblin', 'orc', 'coro_cultista', 'fallen_seraph', 'elf_arcanist', 'beholder', 'hydra', 'mind_flayer', 'cultista_vermelho', 'anjo', 'fenix'])
    assert.ok(!ehChefe(t), t);
  for (const t of CHEFES_ATO6) assert.ok(CHEFES_ATOS_NOVOS.includes(t), t);
});
test('ficha: muralha infernal reforcada em IV-VI e regen x2.5 em V-VI (como o codigo antigo)', () => {
  const antigoMuralha = (m: string) => m === 'act4' || m === 'act5' || m === 'act6';
  const antigoRegen = (m: string) => (m === 'act5' || m === 'act6') ? 2.5 : 1.0;
  for (const m of ['standard', 'act2', 'act3', 'act4', 'act5', 'act6', 'endless', 'pacifist', 'randomizer', 'solo']) {
    assert.equal(!!atoDoModo(m)?.muralhaInfernalReforcada, antigoMuralha(m), m);
    assert.equal(atoDoModo(m)?.regenHeroisMult ?? 1.0, antigoRegen(m), m);
  }
});
