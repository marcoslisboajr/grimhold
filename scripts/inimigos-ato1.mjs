// ══════════════════════════════════════════════════════════════════════
// inimigos-ato1.mjs — elenco de deserto do Ato I (decisao do Marcos, 17/9).
//
// Seis inimigos novos (sprites por scripts/sprites-ato1.py):
//   centaur, centaur_archer, harpy, stone_guardian  → ondas 21-24
//   medusa (chefe)                                  → onda 25
//   fire_dragon                                     → ondas 26-29
// Saem do Ato I: minotauros (voltam a ser so do Ato II) e frost_dragon.
//
// Toca: types.ts, EntitySprites.tsx, enemies.ts, bestiary.ts, os 3 locales
// (5 textos + habilidades por inimigo) e os textos de "onda" dos que sairam.
// A tabela de spawn e as listas de chefe do GameCanvas ficam pra edicao a
// mao (sao decisoes de balanceamento, nao de dados).
//
// Uso:  node scripts/inimigos-ato1.mjs      (idempotente: aborta se ja rodou)
// ══════════════════════════════════════════════════════════════════════
import fs from 'node:fs';

const NOVOS = ['centaur', 'centaur_archer', 'harpy', 'stone_guardian', 'medusa', 'fire_dragon'];
const contar = (s, sub) => s.split(sub).length - 1;
const exige = (s, sub, n, onde) => { const c = contar(s, sub); if (c !== n) throw new Error(`${onde}: esperava ${n}x "${sub.slice(0, 50)}", achei ${c}`); };
const J = (s) => JSON.stringify(s);

// ── textos ──────────────────────────────────────────────────────────────
// Tom do GLOSSARIO: seco e ironico. Nomes proprios nao se traduzem.
const T = {
  centaur: {
    name:  ['Centaur', 'Centauro das Dunas', '沙丘半人马'],
    title: ['Dune Rider', 'Cavaleiro das Dunas', '沙丘骑手'],
    wave:  ['Act I · Children of the Ruins (W21-24)', 'Ato I · Filhos das Ruínas (O21-24)', '第一幕 · 废墟之子 (W21-24)'],
    lore:  ['Nomads of the sand that swallowed the old city. They never learned to build; they only learned that whoever builds has something to lose.',
            'Nômades da areia que engoliu a cidade antiga. Nunca aprenderam a construir — só aprenderam que quem constrói tem algo a perder.',
            '吞没古城的沙海里的游牧者。他们从没学会建造，只学会了一件事：会建造的人，就有东西可失去。'],
    ab: [['Charge — closes distance fast', 'Investida — fecha distância rápido', '冲锋——快速逼近'],
         ['Trample', 'Pisoteio', '践踏']],
  },
  centaur_archer: {
    name:  ['Centaur Archer', 'Arqueiro Centauro', '半人马弓手'],
    title: ['Rider of the Long Shot', 'Cavaleiro do Tiro Longo', '远射骑手'],
    wave:  ['Act I · Children of the Ruins (W21-24)', 'Ato I · Filhos das Ruínas (O21-24)', '第一幕 · 废墟之子 (W21-24)'],
    lore:  ['Shoots from horseback at a full gallop and rarely misses. The desert is flat and has nowhere to hide; the centaurs have known this longer than anyone.',
            'Atira a galope e raramente erra. O deserto é plano e não tem onde se esconder; os centauros sabem disso há mais tempo que qualquer um.',
            '全速奔驰时放箭，几乎不失手。沙漠平坦无处可藏——这一点，半人马比谁都清楚得早。'],
    ab: [['Ranged shot (600)', 'Tiro à distância (600)', '远程射击 (600)'],
         ['Kiting — stays out of reach', 'Mantém distância', '保持距离']],
  },
  harpy: {
    name:  ['Harpy', 'Harpia', '鹰身女妖'],
    title: ['Ruin Scavenger', 'Carniceira das Ruínas', '废墟食腐者'],
    wave:  ['Act I · Children of the Ruins (W21-24)', 'Ato I · Filhos das Ruínas (O21-24)', '第一幕 · 废墟之子 (W21-24)'],
    lore:  ['They circle before the fight is over, because they already know how it ends. Fast, loud, and interested only in what is left behind.',
            'Rodeiam antes de a luta acabar, porque já sabem como termina. Rápidas, barulhentas, e só interessadas no que sobra.',
            '战斗还没结束就开始盘旋，因为结局她们早已知道。快，吵，只对剩下的东西感兴趣。'],
    ab: [['Flight — very fast', 'Voo — muito rápida', '飞行——极快'],
         ['Dive strike', 'Mergulho', '俯冲']],
  },
  stone_guardian: {
    name:  ['Stone Guardian', 'Guardião de Pedra', '石像守卫'],
    title: ['Six Arms of the Buried Temple', 'Seis Braços do Templo Soterrado', '埋没神庙的六臂'],
    wave:  ['Act I · Children of the Ruins (W21-24)', 'Ato I · Filhos das Ruínas (O21-24)', '第一幕 · 废墟之子 (W21-24)'],
    lore:  ['Carved to guard a temple that no longer exists, for a god no one remembers. It still shows up for work.',
            'Esculpido para guardar um templo que não existe mais, para um deus de que ninguém lembra. Ainda assim, bate ponto.',
            '为守护一座早已不存在的神庙而雕刻，供奉一位无人记得的神。它至今仍准时上工。'],
    ab: [['Stone body — heavy damage reduction', 'Corpo de pedra — forte redução de dano', '石躯——大幅减伤'],
         ['Slow but relentless', 'Lento, mas implacável', '缓慢而不休']],
  },
  medusa: {
    name:  ['Medusa', 'Medusa', '美杜莎'],
    title: ['The Last Priestess', 'A Última Sacerdotisa', '最后的女祭司'],
    wave:  ['Act I · Boss (W25)', 'Ato I · Chefe (O25)', '第一幕 · 首领 (W25)'],
    lore:  ['The sand took the city, the temple, and everyone who prayed there. It did not take her. She has had a long time to decide how she feels about that.',
            'A areia levou a cidade, o templo e todos que rezavam ali. Não levou ela. Ela teve muito tempo pra decidir o que acha disso.',
            '沙海带走了城、神庙，还有在那里祈祷的所有人。没带走她。她有的是时间去想清楚自己对此作何感想。'],
    ab: [['Petrifying gaze — ranged', 'Olhar petrificante — à distância', '石化凝视——远程'],
         ['Serpent skin — resists physical', 'Pele de serpente — resiste a físico', '蛇鳞——抗物理']],
  },
  fire_dragon: {
    name:  ['Fire Dragon', 'Dragão de Fogo', '火龙'],
    title: ['Sun-Scaled', 'Escamas de Sol', '日鳞'],
    wave:  ['Act I · Dragon flight (W26-29)', 'Ato I · Voo de dragões (O26-29)', '第一幕 · 巨龙群 (W26-29)'],
    lore:  ['Where the frost dragons went north, these stayed and learned to like the heat. The desert did not make them; it only made them worse.',
            'Enquanto os dragões de gelo foram pro norte, estes ficaram e aprenderam a gostar do calor. O deserto não os criou — só os piorou.',
            '冰霜龙北上之时，它们留了下来，学会了喜欢炎热。沙漠没有造就它们，只是让它们更糟。'],
    ab: [['Fire breath', 'Sopro de fogo', '火焰吐息'],
         ['Scorching aura', 'Aura escaldante', '灼热光环']],
  },
};

// os que SAEM do Ato I: texto de onda perde a parte do Ato I (por idioma)
const WAVE_ANTES_DEPOIS = {
  en: [
    ['Act I · Minotaur war-herd (W21-24) · Act II (W11-19)', 'Act II · Minotaur war-herd (W11-19)', 4],
    ['Act I · Boss (W25) · Act II · Boss (W20) · Act V · Boss (W20)', 'Act II · Boss (W20) · Act V · Boss (W20)', 1],
    ['"bestiary.frost_dragon.wave": "Act I · Dragon flight (W26-29) · Act II (W21-29)"', '"bestiary.frost_dragon.wave": "Act II · Dragon flight (W21-29)"', 1],
  ],
  'pt-BR': [
    ['Ato I · Manada de guerra minotauro (O21-24) · Ato II (O11-19)', 'Ato II · Manada de guerra minotauro (O11-19)', 4],
    ['Ato I · Chefe (O25) · Ato II · Chefe (O20) · Ato V · Chefe (O20)', 'Ato II · Chefe (O20) · Ato V · Chefe (O20)', 1],
    ['"bestiary.frost_dragon.wave": "Ato I · Voo de dragões (O26-29) · Ato II (O21-29)"', '"bestiary.frost_dragon.wave": "Ato II · Voo de dragões (O21-29)"', 1],
  ],
  'zh-CN': [
    ['第一幕 · 牛头人战群 (W21-24) · 第二幕 (W11-19)', '第二幕 · 牛头人战群 (W11-19)', 4],
    ['第一幕 · 首领 (W25) · 第二幕 · 首领 (W20) · 第五幕 · 首领 (W20)', '第二幕 · 首领 (W20) · 第五幕 · 首领 (W20)', 1],
    ['"bestiary.frost_dragon.wave": "第一幕 · 巨龙群 (W26-29) · 第二幕 (W21-29)"', '"bestiary.frost_dragon.wave": "第二幕 · 巨龙群 (W21-29)"', 1],
  ],
};

// ── 1. locales ──────────────────────────────────────────────────────────
['en', 'pt-BR', 'zh-CN'].forEach((loc, i) => {
  const p = `i18n/locales/${loc}.json`;
  let s = fs.readFileSync(p, 'utf8');
  if (s.includes('"enemy.centaur.name"')) { console.log(`(${loc}: ja migrado, pulando)`); return; }
  const ancN = /^(\s*"enemy\.minotaur_king\.name": .*,)$/m;
  exige(s, '"enemy.minotaur_king.name"', 1, loc);
  s = s.replace(ancN, `$1\n` + NOVOS.map(t => `  ${J('enemy.' + t + '.name')}: ${J(T[t].name[i])},`).join('\n'));
  const ancB = /^(\s*"bestiary\.minotaur_king\.ability\.3": .*,)$/m;
  exige(s, '"bestiary.minotaur_king.ability.3"', 1, loc);
  const bloco = NOVOS.map(t => [
    `  ${J('bestiary.' + t + '.name')}: ${J(T[t].name[i])},`,
    `  ${J('bestiary.' + t + '.title')}: ${J(T[t].title[i])},`,
    `  ${J('bestiary.' + t + '.wave')}: ${J(T[t].wave[i])},`,
    `  ${J('bestiary.' + t + '.lore')}: ${J(T[t].lore[i])},`,
    ...T[t].ab.map((a, k) => `  ${J('bestiary.' + t + '.ability.' + k)}: ${J(a[i])},`),
  ].join('\n')).join('\n');
  s = s.replace(ancB, `$1\n${bloco}`);
  for (const [antes, depois, n] of WAVE_ANTES_DEPOIS[loc]) { exige(s, antes, n, loc + ' wave'); s = s.split(antes).join(depois); }
  JSON.parse(s);
  fs.writeFileSync(p, s);
  console.log(`✓ ${loc}: +${NOVOS.length} inimigos, ondas atualizadas`);
});

// ── 2. types.ts ─────────────────────────────────────────────────────────
{
  const p = 'types.ts'; let s = fs.readFileSync(p, 'utf8');
  exige(s, "| 'elf_champion' | 'enemy_bone' |", 1, p);
  s = s.replace("| 'elf_champion' | 'enemy_bone' |", "| 'elf_champion' | " + NOVOS.map(t => `'${t}'`).join(' | ') + " | 'enemy_bone' |");
  fs.writeFileSync(p, s); console.log('✓ types.ts');
}

// ── 3. EntitySprites.tsx ────────────────────────────────────────────────
{
  const p = 'components/EntitySprites.tsx'; let s = fs.readFileSync(p, 'utf8');
  const anc = "  'minotaur', 'minotaur_archer', 'minotaur_warrior', 'minotaur_guard', 'minotaur_king',\n";
  exige(s, anc, 1, p);
  s = s.replace(anc, anc + "  // Ato 1 — Filhos das Ruínas (deserto) + chefe Medusa + Dragão de Fogo\n  'centaur', 'centaur_archer', 'harpy', 'stone_guardian', 'medusa', 'fire_dragon',\n");
  const ancE = "  frost_dragon: '❄️',\n"; exige(s, ancE, 1, p);
  s = s.replace(ancE, ancE + "  fire_dragon: '🔥',\n  centaur: '🐎',\n  centaur_archer: '🏹',\n  harpy: '🦅',\n  stone_guardian: '🗿',\n  medusa: '🐍',\n");
  const ancV = "  orc_berserker: 130,\n"; exige(s, ancV, 1, p);
  s = s.replace(ancV, ancV + "  harpy: 110,\n  centaur: 120,\n  stone_guardian: 220,\n");
  fs.writeFileSync(p, s); console.log('✓ EntitySprites.tsx');
}

// ── 4. enemies.ts ───────────────────────────────────────────────────────
{
  const p = 'components/data/enemies.ts'; let s = fs.readFileSync(p, 'utf8');
  const anc = /^(\s*minotaur_king:\s*\{[^\n]*\},?)$/m;
  exige(s, 'minotaur_king:', 1, p);
  s = s.replace(anc, `$1
  // Ato I — deserto (17/9/2026)
  centaur:              { physical: 1.0,  nature: 1.20, arcane: 1.15 },
  centaur_archer:       { physical: 1.0,  nature: 1.20, arcane: 1.15 },
  harpy:                { physical: 1.15, arcane: 0.85, holy: 1.25 },
  stone_guardian:       { physical: 0.35, arcane: 1.50, nature: 1.3, chaos: 1.3 },
  medusa:               { physical: 0.55, holy: 1.40,   arcane: 1.2 },
  fire_dragon:          { physical: 0.75, nature: 0.70, arcane: 1.30, holy: 1.20 },`);
  const ancB = "  'minotaur_king',\n  'dragon_lord',"; exige(s, ancB, 1, p);
  s = s.replace(ancB, "  'minotaur_king',\n  'medusa',\n  'dragon_lord',");
  fs.writeFileSync(p, s); console.log('✓ enemies.ts');
}

// ── 5. bestiary.ts ──────────────────────────────────────────────────────
{
  const p = 'components/data/bestiary.ts'; let s = fs.readFileSync(p, 'utf8');
  const ancL = "  'minotaur_king',\n"; exige(s, ancL, 1, p);
  s = s.replace(ancL, ancL + NOVOS.map(t => `  '${t}',\n`).join(''));
  const ancE = /^(\s*entry\('minotaur_king',[^\n]*\),)$/m; exige(s, "entry('minotaur_king',", 1, p);
  s = s.replace(ancE, `$1
  entry('centaur',           'medium',  'medium',          'medium',          'high'),
  entry('centaur_archer',    'medium',  'low',             'medium',          'medium'),
  entry('harpy',             'medium',  'low',             'medium',          'very_high'),
  entry('stone_guardian',    'high',    'very_high',       'high',            'very_low'),
  entry('medusa',            'boss',    'colossal',        'devastating',     'low'),
  entry('fire_dragon',       'high',    'high',            'high',            'medium'),`);
  fs.writeFileSync(p, s); console.log('✓ bestiary.ts');
}
console.log('\nfalta a mao: tabela de spawn (ondas 21-29) e listas de chefe no GameCanvas.');
