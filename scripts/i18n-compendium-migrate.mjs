// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-compendium-migrate.mjs
//
// Migra components/data/compendium.tsx para o i18n.
//
// Estilo CIRÚRGICO (mesmo motivo do skillTrees): o arquivo tem JSX no meio
// dos dados (`iconSpecial: <Sigil ... />`), então não dá pra eval/regenerar.
// Aqui a formatação também é IRREGULAR — item numa linha só, item em três
// linhas, aspas simples e duplas misturadas — então o parser não pode ser
// por linha: ele varre o texto procurando os campos e lê cada literal de
// string respeitando os escapes.
//
//   antes:  { id: 'new-mage', title: 'Summon: Mage', description: '...', ...
//   depois: { id: 'new-mage', get title() { return t('compendium.new-mage.title'); }, ...
//
// Uso:  npm run i18n:migrate:compendium
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT      = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC       = path.join(ROOT, 'components/data/compendium.tsx');
const LOCALES   = path.join(ROOT, 'i18n/locales');
const SNAPSHOTS = path.join(ROOT, 'scripts/.snapshots');

const TEXT_FIELDS = ['title', 'description', 'flavorText'];

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ compendium.tsx JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

// ─── Leitura de um literal de string a partir da aspa de abertura ─────
// Devolve { value, end } — end é o índice DEPOIS da aspa de fechamento.
function readString(s, start) {
  const quote = s[start];
  let value = '';
  for (let i = start + 1; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { value += s[i + 1]; i++; continue; }  // \' \" \\ → literal
    if (c === quote) return { value, end: i + 1 };
    if (c === '\n') throw new Error(`string não fechada perto de: ${s.slice(start, start + 60)}`);
    value += c;
  }
  throw new Error('string não fechada no fim do arquivo');
}

// ─── Varredura: id + campos de texto, na ordem em que aparecem ────────
const FIELD_RE = new RegExp(`\\b(id|${TEXT_FIELDS.join('|')})\\s*:\\s*(?=['"])`, 'g');

const items = [];
let current = null;
for (const m of src.matchAll(FIELD_RE)) {
  const field = m[1];
  const quoteAt = m.index + m[0].length;
  const { value, end } = readString(src, quoteAt);
  const span = { start: m.index, end };          // cobre `campo: '...'`

  if (field === 'id') {
    current = { id: value, spans: {} };
    items.push(current);
  } else {
    if (!current) throw new Error(`campo '${field}' antes de qualquer id`);
    if (current[field] !== undefined) throw new Error(`'${field}' duplicado em '${current.id}'`);
    current[field] = value;
    current.spans[field] = span;
  }
}
console.log(`• ${items.length} itens encontrados`);

const dupes = items.map(i => i.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupes.length) throw new Error(`ids duplicados: ${[...new Set(dupes)].join(', ')}`);

const incompletos = items.filter(i => TEXT_FIELDS.some(f => i[f] === undefined));
if (incompletos.length) {
  throw new Error(`itens sem todos os campos de texto: ${incompletos.map(i => i.id).join(', ')}`);
}
console.log(`  ✓ todos com ${TEXT_FIELDS.join(' + ')}`);

// ─── en.json + locales ────────────────────────────────────────────────
const enPath = path.join(LOCALES, 'en.json');
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const before = Object.keys(en).length;
for (const item of items) {
  for (const f of TEXT_FIELDS) en[`compendium.${item.id}.${f}`] = item[f];
}
console.log(`• en.json: ${before} → ${Object.keys(en).length} chaves (+${Object.keys(en).length - before})`);
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

// ─── Snapshot do original ─────────────────────────────────────────────
fs.mkdirSync(SNAPSHOTS, { recursive: true });
fs.writeFileSync(
  path.join(SNAPSHOTS, 'compendium.original.json'),
  JSON.stringify({
    items: items.map(i => ({ id: i.id, title: i.title, description: i.description, flavorText: i.flavorText })),
  }, null, 2) + '\n',
);

// ─── Troca cirúrgica (de trás pra frente) ─────────────────────────────
const edits = [];
for (const item of items) {
  for (const f of TEXT_FIELDS) {
    edits.push({
      ...item.spans[f],
      text: `get ${f}() { return t('compendium.${item.id}.${f}'); }`,
    });
  }
}
edits.sort((a, b) => b.start - a.start);
for (const e of edits) src = src.slice(0, e.start) + e.text + src.slice(e.end);

// import do t()
const anchor = "  Check, Book, ArrowLeft, Sun, Crosshair, Heart, Lock, Gem,\n  CloudRain, LogOut, ScrollText, Star, Users } from 'lucide-react';\n";
if (!src.includes(anchor)) throw new Error('bloco de imports do compendium mudou — ajuste o script');
src = src.replace(anchor, anchor + "import { t } from '../../i18n';\n");

// cabeçalho
const header = `// data/compendium.ts
// Extracted from GameCanvas.tsx — compendium items (grimoire).`;
if (!src.includes(header)) throw new Error('cabeçalho do compendium mudou — ajuste o script');
src = src.replace(header, `// data/compendium.tsx
// Itens do compêndio (grimório), extraídos do GameCanvas.tsx.
// O texto (title/description/flavorText) vem do i18n, por GETTERS. Para
// mexer no texto, edite i18n/locales/en.json na chave 'compendium.<id>.*'.`);

const backup = SRC + '.pre-i18n.bak';
if (!fs.existsSync(backup)) fs.copyFileSync(SRC, backup);
fs.writeFileSync(SRC, src);
console.log(`✓ components/data/compendium.tsx migrado (backup em ${path.basename(backup)})`);
