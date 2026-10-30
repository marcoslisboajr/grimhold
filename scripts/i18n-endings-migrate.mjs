// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-endings-migrate.mjs
//
// Migra components/CharacterEndingScreen.tsx — o epílogo do Ato V, um
// texto por personagem. Painel VIVO (GameCanvas.tsx:16441 renderiza).
//
//   ending.<type>.name  / .title
//   ending.<type>.panel.<i>       (3 painéis por personagem)
//   ui.ending.*                   (rodapé e os avisos de clique)
//
// Detalhe: os textos dos painéis são TEMPLATE LITERALS (crase), porque
// têm aspas e apóstrofos dentro. Nenhum usa ${...}, então dá pra tratar
// como string comum — o script confere isso antes de mexer.
//
// Uso:  npm run i18n:migrate:endings
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findField, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/CharacterEndingScreen.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../i18n'")) {
  console.error('✗ CharacterEndingScreen.tsx JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

/** Lê um template literal (crase). Recusa interpolação — mudaria o sentido. */
function readTemplate(s, start) {
  let value = '';
  for (let i = start + 1; i < s.length; i++) {
    const c = s[i];
    if (c === '\\') { value += s[i + 1]; i++; continue; }
    if (c === '`') return { value, end: i + 1 };
    if (c === '$' && s[i + 1] === '{') throw new Error(`template com \${...} não pode virar chave: ${s.slice(start, start + 60)}`);
    value += c;
  }
  throw new Error('template literal não fechado');
}

const chaves = {};
const edits = [];

// ─── 1. ENDINGS — o id é o campo `type` ───────────────────────────────
const TYPE_RE = /\btype:\s*(?=')/g;
const finais = [];
for (let m; (m = TYPE_RE.exec(src)); ) {
  const campo = findField(src, 'type', m.index, src.length);
  finais.push({ type: campo.value, start: m.index, afterType: campo.end });
  TYPE_RE.lastIndex = campo.end;
}
console.log(`• ${finais.length} epílogos`);

finais.forEach((fim, i) => {
  const limit = finais[i + 1]?.start ?? src.length;

  for (const f of ['name', 'title']) {
    const campo = findField(src, f, fim.afterType, limit);
    if (!campo) throw new Error(`epílogo '${fim.type}' sem ${f}`);
    fim[f] = campo.value;
    chaves[`ending.${fim.type}.${f}`] = campo.value;
    edits.push({ start: campo.start, end: campo.end, text: `get ${f}() { return t('ending.${fim.type}.${f}'); }` });
  }

  // painéis: text: `...`  (3 por personagem)
  const TEXT_RE = /\btext:\s*(?=`)/g;
  TEXT_RE.lastIndex = fim.afterType;
  fim.panels = [];
  for (let m; (m = TEXT_RE.exec(src)) && m.index < limit; ) {
    const { value, end } = readTemplate(src, m.index + m[0].length);
    const idx = fim.panels.length;
    fim.panels.push(value);
    chaves[`ending.${fim.type}.panel.${idx}`] = value;
    edits.push({ start: m.index, end, text: `get text() { return t('ending.${fim.type}.panel.${idx}'); }` });
    TEXT_RE.lastIndex = end;
  }
  if (fim.panels.length !== 3) throw new Error(`epílogo '${fim.type}' tem ${fim.panels.length} painéis (esperava 3)`);
});
console.log(`  ✓ ${finais.length * 3} painéis de texto`);

// ─── 2. Moldura ───────────────────────────────────────────────────────
const MOLDURA = [
  { key: 'footer',   de: 'Grimhold — Act V',    para: "{t('ui.ending.footer')}",   vezes: 1 },
  { key: 'continue', de: "'[ CONTINUE ]'",      para: "t('ui.ending.continue')",   vezes: 1, valor: '[ CONTINUE ]' },
  { key: 'theEnd',   de: "'[ THE END ]'",       para: "t('ui.ending.theEnd')",     vezes: 1, valor: '[ THE END ]' },
  { key: 'skip',     de: "'[ click to skip ]'", para: "t('ui.ending.skip')",       vezes: 2, valor: '[ click to skip ]' },
];

for (const item of MOLDURA) {
  const achados = [...src.matchAll(new RegExp(item.de.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))];
  if (achados.length !== item.vezes) {
    throw new Error(`"${item.de}" aparece ${achados.length}x — esperava ${item.vezes}`);
  }
  chaves[`ui.ending.${item.key}`] = item.valor ?? item.de;
  for (const a of achados) edits.push({ start: a.index, end: a.index + item.de.length, text: item.para });
}
console.log(`• ${MOLDURA.length} frases da moldura`);

// ─── Chaves + snapshot ────────────────────────────────────────────────
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);

saveSnapshot(ROOT, 'endings', {
  textos: Object.entries(chaves),   // [chave, texto original] — formato que o verify lê
  epilogos: finais.map(f => ({ type: f.type, name: f.name, title: f.title, panels: f.panels })),
});

// ─── Troca cirúrgica + import ─────────────────────────────────────────
src = applyEdits(src, edits);

const anchor = "import { Ico } from './Sigil';\n";
if (!src.includes(anchor)) throw new Error('imports do CharacterEndingScreen mudaram — ajuste o script');
src = src.replace(anchor, anchor + "import { t } from '../i18n';\n");

writeMigrated(SRC, src);
