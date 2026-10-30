// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-verify.mjs
//
// Prova que a migração para i18n NÃO mudou nada para quem joga em inglês.
// Roda os arquivos de dados JÁ migrados (bundle via esbuild, que já vem
// com o Vite — sem dependência nova) e compara campo a campo com o
// snapshot tirado do arquivo original.
//
// Também confere:
//   • paridade de chaves entre en / pt-BR / zh-CN;
//   • que chave vazia cai no inglês (fallback);
//   • que a troca de idioma em tempo real realmente muda o texto.
//
// Uso:  npm run i18n:verify
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import * as esbuild from 'esbuild';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const LOCALES = path.join(ROOT, 'i18n/locales');
const SNAPSHOTS = path.join(ROOT, 'scripts/.snapshots');
const TMP = path.join(ROOT, 'scripts/.tmp');

let failures = 0;
const ok   = m => console.log(`  ✓ ${m}`);
const fail = m => { failures++; console.error(`  ✗ ${m}`); };

// ─── 1. Paridade de chaves entre os locales ───────────────────────────
console.log('\n[1] Chaves dos locales');
const en = JSON.parse(fs.readFileSync(path.join(LOCALES, 'en.json'), 'utf8'));
const ptBR = JSON.parse(fs.readFileSync(path.join(LOCALES, 'pt-BR.json'), 'utf8'));
const enKeys = Object.keys(en);
const porDominio = {};
for (const k of enKeys) porDominio[k.split('.')[0]] = (porDominio[k.split('.')[0]] ?? 0) + 1;
ok(`en.json: ${enKeys.length} chaves (${Object.entries(porDominio).map(([d, n]) => `${d}: ${n}`).join(', ')})`);

if (enKeys.some(k => !en[k])) fail('en.json tem valor vazio (a fonte da verdade não pode ter)');
else ok('en.json sem valores vazios');

for (const locale of ['pt-BR', 'zh-CN']) {
  const data = JSON.parse(fs.readFileSync(path.join(LOCALES, `${locale}.json`), 'utf8'));
  const keys = Object.keys(data);
  const missing = enKeys.filter(k => !(k in data));
  const extra   = keys.filter(k => !(k in en));
  if (missing.length) fail(`${locale}: ${missing.length} chave(s) faltando (ex.: ${missing[0]})`);
  if (extra.length)   fail(`${locale}: ${extra.length} chave(s) órfã(s) (ex.: ${extra[0]})`);
  if (!missing.length && !extra.length) {
    const done = keys.filter(k => data[k]).length;
    ok(`${locale}: mesmas ${keys.length} chaves — ${done} traduzidas (${Math.round(done / keys.length * 100)}%)`);
  }
}

// ─── 2. Bundle dos arquivos migrados ──────────────────────────────────
console.log('\n[2] Rodando os arquivos de dados migrados');
fs.mkdirSync(TMP, { recursive: true });
const entry = path.join(TMP, 'entry.ts');
fs.writeFileSync(entry, `
import { ENEMY_NAMES, BESTIARY } from '../../components/data/bestiary';
import { SKILL_TREES } from '../../components/data/skillTrees';
import { COMPENDIUM_ITEMS } from '../../components/data/compendium';
import { ACCOUNT_RELICS, CHAR_RELICS } from '../../components/data/allies';
import { RELIC_DEFS } from '../../components/data/relics';
import { SYNERGIES, COMBOS } from '../../components/data/synergies';
import { ACHIEVEMENT_DEFS } from '../../components/data/achievements';
import { ACCOUNT_LEVEL_REWARDS, AVATAR_DEFS, ACCOUNT_TITLES } from '../../components/data/account';
import { MERCHANT_META, POOL_BLACKSMITH, POOL_HEALER, POOL_MAGE, POOL_SEASON1_CARDS } from '../../components/data/shopPools';
import { SEASON_META, BATTLE_PASS_LEVELS, getUnlockedBPTitles } from '../../components/data/battlePass';
import { TITLES, titleText, migrateTitleIds, migrateTitleId } from '../../components/data/titles';
import { ACCOUNT_LEVEL_REWARDS as REWARDS } from '../../components/data/account';
import { setLanguage, i18next } from '../../i18n';
const dump = () => ({
  ENEMY_NAMES: { ...ENEMY_NAMES },
  BESTIARY: BESTIARY.map(e => ({
    type: e.type, name: e.name, title: e.title, wave: e.wave,
    hp: e.hp, dmg: e.dmg, speed: e.speed, threat: e.threat,
    lore: e.lore, abilities: [...e.abilities],
  })),
  SKILL_NODES: SKILL_TREES.flatMap(tree => tree.nodes.map(n => ({
    id: n.id, name: n.name, desc: n.desc,
  }))),
  COMPENDIUM: COMPENDIUM_ITEMS.map(i => ({
    id: i.id, title: i.title, description: i.description, flavorText: i.flavorText,
  })),
  // mesma ordem do scanner: relíquias de conta primeiro, depois as de personagem
  RELICS: [
    ...ACCOUNT_RELICS.map(r => ({ id: r.id, name: r.name, desc: r.desc, flavor: r.flavor, tag: r.tag })),
    ...Object.values(CHAR_RELICS).flat().map(r => ({ id: r.id, name: r.name, desc: r.desc })),
  ],
  // RELIC_DEFS = 12 relíquias de run + as 4 de conta (que vêm por spread)
  RELIC_DEFS: RELIC_DEFS.map(r => ({ id: r.id, name: r.name, desc: r.desc, flavor: r.flavor, tag: r.tag })),
  SYNERGIES: Object.entries(SYNERGIES).map(([key, s]) => ({
    key, name: s.name, levels: s.levels.map(l => l.desc),
  })),
  COMBOS: COMBOS.map(c => ({ id: c.id, name: c.name, descs: [...c.descs] })),
  ACHIEVEMENTS: ACHIEVEMENT_DEFS.map(a => ({ id: a.id, title: a.title, description: a.description })),
  ACCOUNT_REWARDS: Object.entries(ACCOUNT_LEVEL_REWARDS).map(([level, r]) => ({ level: Number(level), label: r.label })),
  AVATARS: AVATAR_DEFS.map(a => ({ id: a.id, name: a.name })),
  // titulos NAO sao traduzidos (viram identificador no save) — o teste 4 confere isso
  ACCOUNT_TITLES: { ...ACCOUNT_TITLES },
  MERCHANTS: Object.entries(MERCHANT_META).map(([key, m]) => ({ key, name: m.name, desc: m.desc })),
  // mesma ordem do script: blacksmith, healer, mage, season1
  SHOP_ITEMS: [...POOL_BLACKSMITH, ...POOL_HEALER, ...POOL_MAGE, ...POOL_SEASON1_CARDS]
    .map(i => ({ id: i.id, title: i.title, desc: i.desc })),
  SEASON: { name: SEASON_META.season1.name, subtitle: SEASON_META.season1.subtitle },
  BP_LEVELS: BATTLE_PASS_LEVELS.map(l => ({ level: l.level, label: l.reward.label })),
  // agora o passe devolve IDs, não texto
  BP_TITLE_IDS: getUnlockedBPTitles(30),
  TITLES: TITLES.map(d => ({ id: d.id, source: d.source, level: d.level, legacy: d.legacy, texto: titleText(d.id) })),
  // migração de save antigo: texto em inglês → id
  MIGRACAO: {
    lista: migrateTitleIds(['Novice Guardian', 'Awakened', 'acc_50']),
    equipado: migrateTitleId('Stone Warden'),
    desconhecido: migrateTitleId('Titulo Que Nao Existe'),
    idempotente: migrateTitleIds(migrateTitleIds(['Novice Guardian'])),
  },
  // ids concedidos pelas recompensas
  REWARD_TITLE_IDS: Object.values(REWARDS).map(r => r.titleId).filter(Boolean),
});
export { dump, setLanguage, i18next };
`);

const out = path.join(TMP, 'bundle.mjs');
await esbuild.build({
  entryPoints: [entry],
  bundle: true,
  outfile: out,
  format: 'esm',
  platform: 'node',
  target: 'node18',
  // react entra no bundle (esbuild converte o CJS) — externo daria
  // "Dynamic require of react is not supported" no output ESM.
  logLevel: 'silent',
});

const mod = await import(pathToFileURL(out).href + `?t=${Date.now()}`);

// ⚠ FORÇAR o inglês antes de tirar a foto. Sem isso o idioma inicial vem
// do navigator.language — que no Node desta máquina é 'pt-BR'! Enquanto o
// pt-BR estava vazio ninguém percebia (tudo caía no fallback inglês), mas
// na primeira tradução de verdade a comparação passou a medir pt-BR
// contra o snapshot inglês e acusou 246 "diferenças" que não existiam.
mod.setLanguage('en');
const englishNow = mod.dump();
ok(`bestiary.ts: ${englishNow.BESTIARY.length} entradas, ${Object.keys(englishNow.ENEMY_NAMES).length} nomes`);
ok(`skillTrees.ts: ${englishNow.SKILL_NODES.length} nós`);
ok(`compendium.tsx: ${englishNow.COMPENDIUM.length} itens`);
ok(`allies.ts: ${englishNow.RELICS.length} relíquias`);
ok(`relics.ts: ${englishNow.RELIC_DEFS.length} relíquias de run (12 próprias + 4 de conta)`);
ok(`synergies.tsx: ${englishNow.SYNERGIES.length} sinergias + ${englishNow.COMBOS.length} combos`);
ok(`achievements.ts: ${englishNow.ACHIEVEMENTS.length} conquistas`);
ok(`account.ts: ${englishNow.ACCOUNT_REWARDS.length} recompensas + ${englishNow.AVATARS.length} avatares`);
ok(`shopPools.ts: ${englishNow.MERCHANTS.length} mercadores + ${englishNow.SHOP_ITEMS.length} itens`);
ok(`battlePass.ts: ${englishNow.BP_LEVELS.length} níveis (${englishNow.BP_TITLE_IDS.length} títulos por id)`);
ok(`titles.ts: ${englishNow.TITLES.length} títulos no registro`);

// ─── 3. Inglês idêntico ao original ───────────────────────────────────
console.log('\n[3] Inglês idêntico aos arquivos originais');

function comparar(rotulo, esperado, obtido, campos, chave) {
  let diffs = 0;
  const diff = (what, a, b) => {
    if (JSON.stringify(a) !== JSON.stringify(b)) {
      diffs++;
      if (diffs <= 5) console.error(`    · ${what}\n        original: ${JSON.stringify(a)}\n        migrado : ${JSON.stringify(b)}`);
    }
  };
  diff(`${rotulo}: quantidade de itens`, esperado.length, obtido.length);
  esperado.forEach((o, i) => {
    const n = obtido[i] ?? {};
    for (const f of campos) diff(`${rotulo}[${i}] (${o[chave]}).${f}`, o[f], n[f]);
  });
  const total = esperado.length * campos.length;
  if (diffs) fail(`${rotulo}: ${diffs} diferença(s) em ${total} campos`);
  else ok(`${rotulo}: ${total} campos comparados — 0 diferenças`);
}

// bestiary
const snapBestiary = path.join(SNAPSHOTS, 'bestiary.original.json');
// `--regravar-bestiary`: o elenco MUDOU de proposito (inimigo novo, inimigo que
// trocou de ato) e o ingles atual passa a ser a referencia. So use quando a
// diferenca acusada for a que voce mesmo fez — o snapshot existe pra pegar
// mudanca acidental, e regravar sem olhar apaga essa protecao.
if (process.argv.includes('--regravar-bestiary')) {
  const anterior = fs.existsSync(snapBestiary) ? JSON.parse(fs.readFileSync(snapBestiary, 'utf8')) : { ENEMY_NAMES: {}, BESTIARY: [] };
  fs.writeFileSync(snapBestiary, JSON.stringify({ ENEMY_NAMES: englishNow.ENEMY_NAMES, BESTIARY: englishNow.BESTIARY }, null, 2) + '\n');
  ok(`bestiary.original.json REGRAVADO: ${Object.keys(anterior.ENEMY_NAMES).length}→${Object.keys(englishNow.ENEMY_NAMES).length} nomes, ${anterior.BESTIARY.length}→${englishNow.BESTIARY.length} entradas`);
}
if (!fs.existsSync(snapBestiary)) {
  fail('snapshot do bestiary não encontrado — rode npm run i18n:migrate:bestiary');
} else {
  const orig = JSON.parse(fs.readFileSync(snapBestiary, 'utf8'));
  const origNames = Object.keys(orig.ENEMY_NAMES);
  const newNames  = Object.keys(englishNow.ENEMY_NAMES);
  if (JSON.stringify(origNames) !== JSON.stringify(newNames)) fail('ENEMY_NAMES: lista/ordem de tipos mudou');
  else {
    const errados = origNames.filter(k => orig.ENEMY_NAMES[k] !== englishNow.ENEMY_NAMES[k]);
    if (errados.length) fail(`ENEMY_NAMES: ${errados.length} nome(s) diferentes (ex.: ${errados[0]})`);
    else ok(`ENEMY_NAMES: ${origNames.length} nomes comparados — 0 diferenças`);
  }
  comparar('BESTIARY', orig.BESTIARY, englishNow.BESTIARY,
    ['type', 'name', 'title', 'wave', 'hp', 'dmg', 'speed', 'threat', 'lore', 'abilities'], 'type');
}

// skillTrees
const snapSkills = path.join(SNAPSHOTS, 'skillTrees.original.json');
if (!fs.existsSync(snapSkills)) {
  fail('snapshot do skillTrees não encontrado — rode npm run i18n:migrate:skilltrees');
} else {
  const orig = JSON.parse(fs.readFileSync(snapSkills, 'utf8'));
  comparar('SKILL_NODES', orig.nodes, englishNow.SKILL_NODES, ['id', 'name', 'desc'], 'id');
}

// compendium
const snapCompendium = path.join(SNAPSHOTS, 'compendium.original.json');
if (!fs.existsSync(snapCompendium)) {
  fail('snapshot do compendium não encontrado — rode npm run i18n:migrate:compendium');
} else {
  const orig = JSON.parse(fs.readFileSync(snapCompendium, 'utf8'));
  comparar('COMPENDIUM', orig.items, englishNow.COMPENDIUM, ['id', 'title', 'description', 'flavorText'], 'id');
}

// allies
const snapAllies = path.join(SNAPSHOTS, 'allies.original.json');
if (!fs.existsSync(snapAllies)) {
  fail('snapshot do allies não encontrado — rode npm run i18n:migrate:allies');
} else {
  const orig = JSON.parse(fs.readFileSync(snapAllies, 'utf8'));
  // flavor/tag só existem nas 4 de conta; nas outras os dois lados são undefined
  comparar('RELICS', orig.items, englishNow.RELICS, ['id', 'name', 'desc', 'flavor', 'tag'], 'id');
}

// relics — o snapshot tem só as 12 próprias; casa por id, não por posição
const snapRelics = path.join(SNAPSHOTS, 'relics.original.json');
if (!fs.existsSync(snapRelics)) {
  fail('snapshot do relics não encontrado — rode npm run i18n:migrate:relics');
} else {
  const orig = JSON.parse(fs.readFileSync(snapRelics, 'utf8'));
  const vivos = orig.items.map(o => englishNow.RELIC_DEFS.find(r => r.id === o.id) ?? {});
  comparar('RELIC_DEFS', orig.items, vivos, ['id', 'name', 'desc', 'flavor', 'tag'], 'id');
}

// synergies
const snapSyn = path.join(SNAPSHOTS, 'synergies.original.json');
if (!fs.existsSync(snapSyn)) {
  fail('snapshot do synergies não encontrado — rode npm run i18n:migrate:synergies');
} else {
  const orig = JSON.parse(fs.readFileSync(snapSyn, 'utf8'));
  comparar('SYNERGIES', orig.synergies, englishNow.SYNERGIES, ['key', 'name', 'levels'], 'key');
  comparar('COMBOS', orig.combos, englishNow.COMBOS, ['id', 'name', 'descs'], 'id');
}

// achievements
const snapAch = path.join(SNAPSHOTS, 'achievements.original.json');
if (!fs.existsSync(snapAch)) {
  fail('snapshot do achievements não encontrado — rode npm run i18n:migrate:achievements');
} else {
  const orig = JSON.parse(fs.readFileSync(snapAch, 'utf8'));
  comparar('ACHIEVEMENTS', orig.items, englishNow.ACHIEVEMENTS, ['id', 'title', 'description'], 'id');
}

// account
const snapAcc = path.join(SNAPSHOTS, 'account.original.json');
if (!fs.existsSync(snapAcc)) {
  fail('snapshot do account não encontrado — rode npm run i18n:migrate:account');
} else {
  const orig = JSON.parse(fs.readFileSync(snapAcc, 'utf8'));
  comparar('ACCOUNT_REWARDS', orig.rewards, englishNow.ACCOUNT_REWARDS, ['level', 'label'], 'level');
  comparar('AVATARS', orig.avatares, englishNow.AVATARS, ['id', 'name'], 'id');
}

// shopPools
const snapShop = path.join(SNAPSHOTS, 'shopPools.original.json');
if (!fs.existsSync(snapShop)) {
  fail('snapshot do shopPools não encontrado — rode npm run i18n:migrate:shoppools');
} else {
  const orig = JSON.parse(fs.readFileSync(snapShop, 'utf8'));
  comparar('MERCHANTS', orig.mercadores, englishNow.MERCHANTS, ['key', 'name', 'desc'], 'key');
  comparar('SHOP_ITEMS', orig.itens, englishNow.SHOP_ITEMS, ['id', 'title', 'desc'], 'id');
}

// battlePass
const snapBP = path.join(SNAPSHOTS, 'battlePass.original.json');
if (!fs.existsSync(snapBP)) {
  fail('snapshot do battlePass não encontrado — rode npm run i18n:migrate:battlepass');
} else {
  const orig = JSON.parse(fs.readFileSync(snapBP, 'utf8'));
  comparar('BP_LEVELS', orig.niveis, englishNow.BP_LEVELS, ['level', 'label'], 'level');
  if (englishNow.SEASON.name === orig.season.name && englishNow.SEASON.subtitle === orig.season.subtitle) {
    ok('SEASON_META: name + subtitle iguais ao original');
  } else {
    fail(`SEASON_META mudou: ${JSON.stringify(englishNow.SEASON)}`);
  }
}

// ─── 3b. Títulos: registro, chaves e migração de save ─────────────────
console.log('\n[3b] Títulos (id no save, texto no i18n)');
{
  const semChave = englishNow.TITLES.filter(d => !(`title.${d.id}.name` in en));
  if (semChave.length) fail(`título sem chave no en.json: ${semChave.map(d => d.id).join(', ')}`);
  else ok(`${englishNow.TITLES.length} títulos com chave 'title.<id>.name'`);

  const textoErrado = englishNow.TITLES.filter(d => d.texto !== d.legacy);
  if (textoErrado.length) fail(`texto em inglês mudou: ${textoErrado.map(d => `${d.id}: ${d.texto} ≠ ${d.legacy}`).join('; ')}`);
  else ok('texto em inglês idêntico ao que os saves antigos guardavam');

  const idsRegistro = new Set(englishNow.TITLES.map(d => d.id));
  const orfaos = [...englishNow.REWARD_TITLE_IDS, ...englishNow.BP_TITLE_IDS].filter(id => !idsRegistro.has(id));
  if (orfaos.length) fail(`recompensa aponta pra id inexistente: ${orfaos.join(', ')}`);
  else ok(`${englishNow.REWARD_TITLE_IDS.length} recompensas de conta + ${englishNow.BP_TITLE_IDS.length} do passe apontam pra ids válidos`);

  const m = englishNow.MIGRACAO;
  const migracaoOk =
    JSON.stringify(m.lista) === JSON.stringify(['acc_1', 'bp_3', 'acc_50']) &&
    m.equipado === 'acc_10' &&
    m.desconhecido === 'Titulo Que Nao Existe' &&
    JSON.stringify(m.idempotente) === JSON.stringify(['acc_1']);
  if (migracaoOk) ok('save antigo migra pra id (e rodar de novo não estraga; id desconhecido passa direto)');
  else fail(`migração de save errada: ${JSON.stringify(m)}`);
}

// ─── 3c. Painéis de UI: toda chave citada no código existe no en.json ──
// Painel é componente React — não dá pra importar e ler os campos como
// nos arquivos de dados. Então a verificação é sobre o FONTE: toda chave
// que o painel cita tem que existir, e o texto tem que bater com o
// snapshot do original.
console.log('\n[3c] Painéis de UI');
// ATENCAO: so entram aqui paineis que o jogo RENDERIZA de verdade.
// Varios arquivos em components/panels/ sao copias mortas — o GameCanvas
// tem a versao viva inline. Confira com `grep -c "<NomeDoPainel"` antes.
const PAINEIS = [
  { file: 'components/CharacterEndingScreen.tsx',   snapshot: 'endings' },
  { file: 'components/panels/RunHistoryPanel.tsx',  snapshot: 'runHistory' },
  // GameCanvas vai por partes; cada parte acrescenta chaves ao mesmo arquivo
  // gameCanvas.original.json junta as partes já migradas do GameCanvas
  { file: 'components/GameCanvas.tsx',              snapshot: 'gameCanvas' },
  { file: 'components/LanguageSelect.tsx',          snapshot: null },
  { file: 'components/panels/SkillTreePanel.tsx',   snapshot: 'skillTreePanel' },
  { file: 'components/panels/WaveSummaryOverlay.tsx', snapshot: 'waveSummary' },
  { file: 'components/data/starterChars.tsx',       snapshot: null },
  { file: 'components/data/forge.ts',               snapshot: null },
  { file: 'components/data/weekly.ts',              snapshot: null },
  { file: 'components/data/enemies.ts',             snapshot: null },
  { file: 'components/data/gacha.ts',               snapshot: null },
  { file: 'components/data/materials.ts',           snapshot: null },
  { file: 'components/panels/BattlePassPanel.tsx',  snapshot: null },
];

for (const painel of PAINEIS) {
  const nome = path.basename(painel.file);
  const fonte = fs.readFileSync(path.join(ROOT, painel.file), 'utf8');

  const chaves = [...fonte.matchAll(/(?<![A-Za-z0-9_])t\(\s*'([^']+)'/g)].map(m => m[1]);
  const listas = [...fonte.matchAll(/(?<![A-Za-z0-9_])tList\(\s*'([^']+)'/g)].map(m => m[1]);

  const faltando = [
    ...chaves.filter(k => !(k in en)),
    ...listas.filter(b => !(`${b}.0` in en)),
  ];
  if (faltando.length) fail(`${nome}: ${faltando.length} chave(s) citada(s) e inexistente(s): ${faltando.slice(0, 3).join(', ')}`);
  else ok(`${nome}: ${chaves.length} chaves + ${listas.length} listas, todas existem no en.json`);

  // sobrou algum texto em inglês cravado no que foi migrado?
  if (!painel.snapshot) continue;   // painel sem snapshot: só a checagem de chaves
  const snapPath = path.join(SNAPSHOTS, `${painel.snapshot}.original.json`);
  if (!fs.existsSync(snapPath)) { fail(`${nome}: snapshot não encontrado`); continue; }
  const snap = JSON.parse(fs.readFileSync(snapPath, 'utf8'));

  // snapshot: pares [chave, texto original] gravados pelo script do painel
  const textos = snap.textos ?? [];
  const errados = textos.filter(([k, v]) => en[k] !== v);
  if (errados.length) fail(`${nome}: ${errados.length} texto(s) diferentes do original (ex.: ${errados[0][0]})`);
  else ok(`${nome}: ${textos.length} textos idênticos ao original`);
}

// ─── 3d. <Trans>: frase com marcação no meio ──────────────────────────
// Se um índice de tag estiver errado (<1> onde devia ser <3>), o texto
// sai faltando pedaço — e SÓ no idioma traduzido, o que ninguém percebe
// testando em inglês. Aqui os <Trans> são renderizados de verdade e o
// texto puro é comparado com o do fonte.
console.log('\n[3d] Frases com <Trans>');
{
  const gc = fs.readFileSync(path.join(ROOT, 'components/GameCanvas.tsx'), 'utf8');
  // pega <Trans> com ou sem atributos extras (values=, count=, ...)
  const todos = [...gc.matchAll(/<Trans ([^>]*?)>([\s\S]*?)<\/Trans>/g)]
    .map(m => ({ attrs: m[1], jsx: m[2], key: (m[1].match(/i18nKey="([^"]+)"/) ?? [])[1] }));
  const semKey = todos.filter(c => !c.key);
  if (semKey.length) fail(`${semKey.length} <Trans> sem i18nKey`);

  // os que usam values={{...}} referenciam variavel do componente: nao da
  // pra renderizar isolado. Nesses, confere so a ESTRUTURA (nº de tags).
  const comValues = todos.filter(c => c.key && /values=/.test(c.attrs));
  for (const c of comValues) {
    if (!(c.key in en)) { fail(`${c.key}: chave nao existe no en.json`); continue; }
    const spans = (c.jsx.match(/<span/g) ?? []).length;
    const tags = new Set([...en[c.key].matchAll(/<(\d+)>/g)].map(m => m[1])).size;
    if (spans !== tags) fail(`${c.key}: ${spans} <span> no JSX mas ${tags} tag(s) na chave`);
    else ok(`${c.key}: estrutura confere (${tags} tag) — usa values, nao da pra renderizar isolado`);
  }

  const casos = todos.filter(c => c.key && !/values=/.test(c.attrs));

  if (!casos.length) ok('nenhum <Trans> no arquivo (nada a conferir)');
  else {
    fs.mkdirSync(TMP, { recursive: true });
    fs.writeFileSync(path.join(TMP, 'trans.tsx'), `
import React from 'react';
import { renderToStaticMarkup } from 'react-dom/server';
import { Trans } from 'react-i18next';
import { setLanguage } from '../../i18n';
// ⚠ FORÇAR inglês. O que este bloco verifica é o ÍNDICE das tags <N> do
// <Trans> contra o texto-fonte em inglês do JSX. Se o i18n subir em pt-BR
// (o padrão nesta máquina, via navigator.language), o render sai traduzido e
// a comparação falha por motivo errado — foi o que aconteceu no dia em que o
// tutorial foi traduzido.
setLanguage('en');
${casos.map((c, i) => `const C${i} = () => (<Trans i18nKey="${c.key}">${c.jsx}</Trans>);`).join('\n')}
const comps: any = [${casos.map((_, i) => `C${i}`).join(', ')}];
export function render(i: number) { return renderToStaticMarkup(React.createElement(comps[i])); }
`);
    await esbuild.build({
      entryPoints: [path.join(TMP, 'trans.tsx')],
      bundle: true, outfile: path.join(TMP, 'trans.cjs'),
      format: 'cjs', platform: 'node', target: 'node18', logLevel: 'silent',
    });
    const { createRequire } = await import('node:module');
    const trans = createRequire(import.meta.url)(path.join(TMP, 'trans.cjs'));
    const puro = h => h.replace(/<[^>]+>/g, '').replace(/&#x27;/g, "'").replace(/&amp;/g, '&').replace(/\s+/g, ' ').trim();

    let ruins = 0;
    casos.forEach((c, i) => {
      const esperado = puro(c.jsx.replace(/className="[^"]*"/g, ''));
      const obtido = puro(trans.render(i));
      if (esperado !== obtido) {
        ruins++;
        if (ruins <= 3) console.error(`    · ${c.key}
        fonte : ${esperado}
        render: ${obtido}`);
      }
    });
    if (ruins) fail(`${ruins} de ${casos.length} <Trans> perderam texto — índice de tag errado`);
    else ok(`${casos.length} <Trans> renderizam o texto completo (índices das tags corretos)`);
  }
}

// ─── 4. Fallback e troca de idioma ────────────────────────────────────
console.log('\n[4] Fallback e troca de idioma em tempo real');
mod.setLanguage('pt-BR');
const ptNow = mod.dump();
if (JSON.stringify(ptNow) === JSON.stringify(englishNow)) ok('pt-BR sem traduções → texto sai 100% em inglês (fallback funcionando)');
else ok('pt-BR já tem traduções aplicadas (fallback só onde falta)');

// injeta traduções na marra e confere que os getters pegam na hora
mod.i18next.addResource('pt-BR', 'translation', 'bestiary.goblin.name', 'Goblin de Teste');
mod.i18next.addResource('pt-BR', 'translation', 'skill.sk_mage_root.name', 'Foco Arcano');
mod.i18next.addResource('pt-BR', 'translation', 'compendium.new-mage.title', 'Invocar: Mago');
mod.i18next.addResource('pt-BR', 'translation', 'relic.cm_mage_1.name', 'Amplificador Arcano');
mod.i18next.addResource('pt-BR', 'translation', 'relic.relic_bloodpact.name', 'Pacto de Sangue');
mod.i18next.addResource('pt-BR', 'translation', 'synergy.archer.name', 'Patrulha');
mod.i18next.addResource('pt-BR', 'translation', 'achievement.wave_5.title', 'Primeiro Sangue');
mod.i18next.addResource('pt-BR', 'translation', 'account.reward.1.label', 'Título: Guardião Novato');
mod.i18next.addResource('pt-BR', 'translation', 'shop.shop-war-drum.title', 'Tambor de Guerra');
mod.i18next.addResource('pt-BR', 'translation', 'battlepass.level.3.label', 'Título: Desperto');
mod.i18next.addResource('pt-BR', 'translation', 'title.acc_1.name', 'Guardião Novato');
mod.i18next.addResource('pt-BR', 'translation', 'combo.sacred-trinity.desc.0', 'Teste de lista');
const injetado = mod.dump();
const nomeGoblin = injetado.BESTIARY.find(e => e.type === 'goblin')?.name;
const nomeSkill  = injetado.SKILL_NODES.find(n => n.id === 'sk_mage_root')?.name;
const nomeItem   = injetado.COMPENDIUM.find(i => i.id === 'new-mage')?.title;
const nomeRelic  = injetado.RELICS.find(r => r.id === 'cm_mage_1')?.name;
const nomeRun    = injetado.RELIC_DEFS.find(r => r.id === 'relic_bloodpact')?.name;
const nomeSyn    = injetado.SYNERGIES.find(s => s.key === 'archer')?.name;
// lista: injetamos um sentinela SÓ no item 0. O item 1 tem que continuar
// resolvendo a chave dele — seja o pt-BR já traduzido, seja o inglês de
// fallback. Antes isto comparava com o inglês fixo, e quebrou no dia em que
// combo.sacred-trinity.desc.1 foi traduzido. Comparar com "o que a chave
// resolve" continua provando o que importa: cada item da lista resolve
// sozinho, e o sentinela do 0 não vaza para o 1.
const listaCombo = injetado.COMBOS.find(c => c.id === 'sacred-trinity')?.descs;
const esperadoItem1 = ptBR['combo.sacred-trinity.desc.1'] || en['combo.sacred-trinity.desc.1'];
const traduzidos = {
  bestiary: nomeGoblin === 'Goblin de Teste',
  skill:    nomeSkill  === 'Foco Arcano',
  compendium: nomeItem === 'Invocar: Mago',
  relic:    nomeRelic  === 'Amplificador Arcano',
  run:      nomeRun    === 'Pacto de Sangue',
  synergy:  nomeSyn    === 'Patrulha',
  achievement: injetado.ACHIEVEMENTS.find(a => a.id === 'wave_5')?.title === 'Primeiro Sangue',
  account:     injetado.ACCOUNT_REWARDS.find(r => r.level === 1)?.label === 'Título: Guardião Novato',
  // o texto do título é traduzível…
  tituloTraduzido: injetado.TITLES.find(d => d.id === 'acc_1')?.texto === 'Guardião Novato',
  // …mas o ID que vai pro save NÃO muda com o idioma
  idIntacto: injetado.REWARD_TITLE_IDS[0] === 'acc_1' && injetado.BP_TITLE_IDS[0] === 'bp_3',
  shop:        injetado.SHOP_ITEMS.find(i => i.id === 'shop-war-drum')?.title === 'Tambor de Guerra',
  battlepass:  injetado.BP_LEVELS.find(l => l.level === 3)?.label === 'Título: Desperto',
  // o legado (formato de save antigo) nunca pode mudar de idioma
  legadoIntacto: injetado.TITLES.find(d => d.id === 'acc_1')?.legacy === 'Novice Guardian',
  lista:    listaCombo?.[0] === 'Teste de lista' && listaCombo?.[1] === esperadoItem1,
};
if (Object.values(traduzidos).every(Boolean)) ok('getters resolvem t() no acesso — troca de idioma vale na hora (inclusive lista meio traduzida)');
else fail(`getter não pegou a tradução injetada: ${JSON.stringify(traduzidos)}`);

mod.setLanguage('en');
const voltou = mod.dump();
const okVolta = voltou.BESTIARY.find(e => e.type === 'goblin')?.name === 'Goblin'
             && voltou.SKILL_NODES.find(n => n.id === 'sk_mage_root')?.name === 'Arcane Focus'
             && voltou.COMPENDIUM.find(i => i.id === 'new-mage')?.title === 'Summon: Krash'
             && voltou.RELICS.find(r => r.id === 'cm_mage_1')?.name === 'Arcane Amplifier'
             && voltou.RELIC_DEFS.find(r => r.id === 'relic_bloodpact')?.name === 'Blood Pact'
             && voltou.SYNERGIES.find(s => s.key === 'archer')?.name === 'Patrol'
             && voltou.ACHIEVEMENTS.find(a => a.id === 'wave_5')?.title === 'First Blood'
             && voltou.ACCOUNT_REWARDS.find(r => r.level === 1)?.label === 'Title: Novice Guardian'
             && voltou.SHOP_ITEMS.find(i => i.id === 'shop-war-drum')?.title === 'War Drum'
             && voltou.BP_LEVELS.find(l => l.level === 3)?.label === 'Title: Awakened'
             && voltou.TITLES.find(d => d.id === 'acc_1')?.texto === 'Novice Guardian';
if (okVolta) ok('voltar pra en restaura o texto original');
else fail('voltar pra en falhou');

// ─── Resultado ────────────────────────────────────────────────────────
fs.rmSync(TMP, { recursive: true, force: true });
console.log(failures ? `\n✗ ${failures} verificação(ões) falharam\n` : '\n✓ Tudo certo — o inglês está intacto.\n');
process.exit(failures ? 1 : 0);
