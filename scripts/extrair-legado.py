# extrair-legado.py — move o sorteio dos Atos I-V de createEnemy (GameCanvas.tsx)
# para components/data/atosLegado.ts SEM mudar o texto (so reindenta). Rodado uma vez
# na Etapa 0 do cadastro de atos; fica aqui como registro.
GC = 'components/GameCanvas.tsx'
src = open(GC, encoding='utf-8').read()
ini = src.index('      if (isAct1) {\n        // ── ACT 1: The Siege of Grimhold')
# fim: fecha a chave do "} else if (isAct5) {" contando chaves a partir de ini
i, prof = ini, 0
while True:
    c = src[i]
    if c == '{': prof += 1
    elif c == '}':
        prof -= 1
        if prof == 0:
            # so termina se nao for um "} else if (...) {" encadeado
            j = i + 1
            while src[j] in ' \t\n': j += 1
            if src[j:j+4] != 'else': break
    i += 1
fim = i + 1                                   # inclui a '}' final
corpo = src[ini:fim]
assert corpo.count('else if (isAct5)') == 1, 'bloco inesperado'
ded = '\n'.join(l[4:] if l.startswith('    ') else l for l in corpo.split('\n'))
arq = f'''// GERADO por scripts/extrair-legado.py (Etapa 0, 26/09/2026) a partir de createEnemy.
// Sorteio de inimigos dos Atos I-V exatamente como estava no GameCanvas — nao editar
// os numeros aqui sem atualizar tests/atos/legado.hashes.json (GRIM_GERAR=1 npm test -- legado).
import type {{ EnemyType }} from '../../types';

export interface StatsInimigo {{ type: EnemyType; hp: number; damage: number; speed: number; radius: number; attackRange: number; attackSpeed: number }}
export interface FlagsSpawn {{ isBossSpawn: boolean; isSecondBossSpawn: boolean; isEscort: boolean }}

export function sortearLegado(numero: number, baseWave: number, roll: number, f: FlagsSpawn, base: StatsInimigo): StatsInimigo {{
  let {{ type, hp, damage, speed, radius, attackRange, attackSpeed }} = base;
  const {{ isBossSpawn, isSecondBossSpawn, isEscort }} = f;
  const isAct1 = numero === 1, isAct2 = numero === 2, isAct3 = numero === 3, isAct4 = numero === 4, isAct5 = numero === 5;
{ded}
  return {{ type, hp, damage, speed, radius, attackRange, attackSpeed }};
}}
'''
open('components/data/atosLegado.ts', 'w', encoding='utf-8').write(arq)
novo = ('      ({ type, hp, damage, speed, radius, attackRange, attackSpeed } = _ato!.sortear(baseWave, roll,\n'
        '        { isBossSpawn, isSecondBossSpawn, isEscort }, { type, hp, damage, speed, radius, attackRange, attackSpeed }));')
open(GC, 'w', encoding='utf-8').write(src[:ini] + novo + src[fim:])
open('node_modules/.cache/legado-removido.txt', 'w', encoding='utf-8').write(corpo)
print('movidas', corpo.count('\n') + 1, 'linhas')
