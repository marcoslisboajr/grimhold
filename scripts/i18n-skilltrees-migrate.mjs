// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-skilltrees-migrate.mjs
//
// Migra components/data/skillTrees.ts para o i18n.
//
// Diferença para o bestiary: este arquivo NÃO é só texto — tem efeitos,
// requisitos e exclusões que são LÓGICA de jogo. Então aqui NÃO se
// regenera o arquivo a partir de um eval: faz-se uma troca cirúrgica,
// só nos dois campos de texto de cada nó (name/desc), deixando todo o
// resto byte a byte igual.
//
//   antes:  id: 'sk_mage_root', name: 'Arcane Focus', icon: '🔮', ...
//           desc: 'Mage starts the run with +10% base damage.',
//
//   depois: id: 'sk_mage_root', icon: '🔮', ...
//           get name() { return t('skill.sk_mage_root.name'); },
//           get desc() { return t('skill.sk_mage_root.desc'); },
//
// Uso:  node scripts/i18n-skilltrees-migrate.mjs
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT      = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_TS    = path.join(ROOT, 'components/data/skillTrees.ts');
const LOCALES   = path.join(ROOT, 'i18n/locales');
const SNAPSHOTS = path.join(ROOT, 'scripts/.snapshots');

let src = fs.readFileSync(SRC_TS, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ skillTrees.ts JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

/** Desfaz os escapes de um literal de string do TS ('\\' e a própria aspa). */
const unescape = (s, quote) =>
  s.replace(/\\([\\'"])/g, '$1').replace(new RegExp(`\\\\${quote}`, 'g'), quote);

// ─── 1. Nós: id + name (sempre na mesma linha) ────────────────────────
const NODE_RE = /id: '([^']+)', name: (?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)"),/g;
const nodes = [];
for (const m of src.matchAll(NODE_RE)) {
  const quote = m[2] !== undefined ? "'" : '"';
  nodes.push({
    id: m[1],
    name: unescape(m[2] ?? m[3], quote),
    index: m.index,
    match: m[0],
  });
}
console.log(`• ${nodes.length} nós encontrados (id + name)`);

const dupes = nodes.map(n => n.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupes.length) throw new Error(`ids duplicados: ${[...new Set(dupes)].join(', ')}`);

// ─── 2. desc (sempre em linha própria, depois do id do mesmo nó) ──────
const DESC_RE = /^([ \t]*)desc: '((?:[^'\\]|\\.)*)',[ \t]*$/gm;
const descs = [];
for (const m of src.matchAll(DESC_RE)) {
  descs.push({ indent: m[1], text: unescape(m[2], "'"), index: m.index, match: m[0] });
}
console.log(`• ${descs.length} descrições encontradas`);

if (descs.length !== nodes.length) {
  throw new Error(`nós (${nodes.length}) e descrições (${descs.length}) não batem — revise o parser`);
}

// Casa cada desc com o nó imediatamente anterior a ela.
descs.forEach((d, i) => {
  const node = nodes[i];
  const next = nodes[i + 1];
  if (d.index < node.index || (next && d.index > next.index)) {
    throw new Error(`desc fora de ordem perto de '${node.id}' — revise o parser`);
  }
  node.desc = d.text;
  node.descMatch = d;
});
console.log('  ✓ cada descrição casou com o nó anterior');

// ─── 3. en.json (mantém as chaves já existentes) ──────────────────────
const enPath = path.join(LOCALES, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const before = Object.keys(en).length;
for (const n of nodes) {
  en[`skill.${n.id}.name`] = n.name;
  en[`skill.${n.id}.desc`] = n.desc;
}
const added = Object.keys(en).length - before;
console.log(`• en.json: ${before} → ${Object.keys(en).length} chaves (+${added})`);
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');

for (const locale of ['pt-BR', 'zh-CN']) {
  const p = path.join(LOCALES, `${locale}.json`);
  const existing = JSON.parse(fs.readFileSync(p, 'utf8'));
  const out = {};
  let kept = 0;
  for (const k of Object.keys(en)) {
    out[k] = existing[k] ?? '';
    if (out[k]) kept++;
  }
  fs.writeFileSync(p, JSON.stringify(out, null, 2) + '\n');
  console.log(`• ${locale}.json: ${Object.keys(out).length} chaves (${kept} traduzidas)`);
}

// ─── 4. Snapshot do original ──────────────────────────────────────────
fs.mkdirSync(SNAPSHOTS, { recursive: true });
fs.writeFileSync(
  path.join(SNAPSHOTS, 'skillTrees.original.json'),
  JSON.stringify({ nodes: nodes.map(n => ({ id: n.id, name: n.name, desc: n.desc })) }, null, 2) + '\n',
);

// ─── 5. Troca cirúrgica no .ts ────────────────────────────────────────
// De trás pra frente, para os índices não saírem do lugar.
const edits = [];
for (const n of nodes) {
  edits.push({ index: n.index, length: n.match.length, text: `id: '${n.id}',` });
  edits.push({
    index: n.descMatch.index,
    length: n.descMatch.match.length,
    text:
      `${n.descMatch.indent}get name() { return t('skill.${n.id}.name'); },\n` +
      `${n.descMatch.indent}get desc() { return t('skill.${n.id}.desc'); },`,
  });
}
edits.sort((a, b) => b.index - a.index);
for (const e of edits) {
  src = src.slice(0, e.index) + e.text + src.slice(e.index + e.length);
}

// import do t() logo depois do cabeçalho
const header = `// ══════════════════════════════════════════════════════════════════════
// data/skillTrees.ts
// Skill tree definitions per character.
// No React or canvas dependencies — pure data only.
// ══════════════════════════════════════════════════════════════════════
`;
if (!src.startsWith(header)) throw new Error('cabeçalho do skillTrees.ts mudou — ajuste o script');
src = src.replace(header, `// ══════════════════════════════════════════════════════════════════════
// data/skillTrees.ts
// Skill tree definitions per character.
// Só os EFEITOS são dados aqui — o texto (name/desc de cada nó) vem do
// i18n, por GETTERS, resolvidos na hora do render. Para mexer no texto,
// edite i18n/locales/en.json na chave 'skill.<id>.name' / '.desc'.
// ══════════════════════════════════════════════════════════════════════

import { t } from '../../i18n';
`);

const backup = SRC_TS + '.pre-i18n.bak';
if (!fs.existsSync(backup)) fs.copyFileSync(SRC_TS, backup);
fs.writeFileSync(SRC_TS, src);
console.log(`✓ components/data/skillTrees.ts migrado (backup em ${path.basename(backup)})`);
