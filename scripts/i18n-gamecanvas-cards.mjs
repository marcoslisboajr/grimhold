// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-cards.mjs
//
// GameCanvas.tsx — PARTE 13: as CARTAS (level-up e Dead Man's Hand).
//
// Elas ficam no meio da lógica, lá em cima do arquivo — por isso caíam no
// grupo "(topo do arquivo)" do scanner, que eu tinha rotulado como ruído.
// Não era: é conteúdo de verdade.
//
// DESCOBERTA: as cartas de level-up REPETEM o texto do compendium.tsx (o
// mesmo id, o mesmo título e a mesma descrição). Então elas reusam as
// chaves 'compendium.<id>.*' que já existem — o tradutor traduz uma vez
// só, e carta e grimório nunca mais divergem.
//   • texto idêntico  → reusa a chave do compêndio;
//   • texto diferente → chave própria 'ui.card.<id>.*' (e fica registrado
//     que os dois textos divergem HOJE, o que já era um bug de conteúdo);
//   • carta do Dead Man's Hand (id dinâmico com uid()) → chave própria
//     'ui.dmh.<slug>.*', tirada do prefixo estável do id.
//
// Uso:  npm run i18n:gc:cards
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("t('ui.card.") || src.includes("t('ui.dmh.")) {
  console.error('✗ As cartas JÁ estão migradas.');
  process.exit(1);
}

const en = JSON.parse(fs.readFileSync(path.join(ROOT, 'i18n/locales/en.json'), 'utf8'));
const desescapar = s => s.replace(/\\(['"\\])/g, '$1');

// id literal OU template `dmh-...-${uid()}`, seguido de title e description
const RE = new RegExp(
  String.raw`id:\s*(?:'([^']+)'|` + '`' + String.raw`([^` + '`' + String.raw`]*?)\$\{uid\(\)\}` + '`' + String.raw`)\s*,\s*` +
  String.raw`title:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*,\s*` +
  String.raw`description:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")`,
  'g');

const cartas = [...src.matchAll(RE)].map(m => ({
  idLiteral: m[1] ?? null,
  slug: m[2] ? m[2].replace(/-$/, '') : null,
  title: desescapar(m[3] ?? m[4]),
  desc:  desescapar(m[5] ?? m[6]),
  start: m.index,
  end: m.index + m[0].length,
  bruto: m[0],
}));
console.log(`• ${cartas.length} cartas encontradas (${cartas.filter(c => c.idLiteral).length} com id fixo, ${cartas.filter(c => c.slug).length} do Dead Man's Hand)`);
if (!cartas.length) throw new Error('nenhuma carta casou — o formato mudou?');

const chaves = {};
const divergentes = [];
const edits = [];

for (const c of cartas) {
  let kTitle, kDesc;

  if (c.idLiteral) {
    const ct = `compendium.${c.idLiteral}.title`;
    const cd = `compendium.${c.idLiteral}.description`;
    if (en[ct] === c.title && en[cd] === c.desc) {
      kTitle = ct; kDesc = cd;                       // reusa o compêndio
    } else {
      if (ct in en) divergentes.push(c.idLiteral);   // existe mas texto difere
      kTitle = `ui.card.${c.idLiteral}.title`;
      kDesc  = `ui.card.${c.idLiteral}.description`;
      chaves[kTitle] = c.title; chaves[kDesc] = c.desc;
    }
  } else {
    kTitle = `ui.dmh.${c.slug}.title`;
    kDesc  = `ui.dmh.${c.slug}.description`;
    if (kTitle in chaves && chaves[kTitle] !== c.title) throw new Error(`slug repetido com texto diferente: ${c.slug}`);
    chaves[kTitle] = c.title; chaves[kDesc] = c.desc;
  }

  const idParte = c.idLiteral ? `id: '${c.idLiteral}'` : 'id: `' + c.slug + '-${uid()}`';
  edits.push({
    start: c.start, end: c.end,
    text: `${idParte}, get title() { return t('${kTitle}'); }, get description() { return t('${kDesc}'); }`,
  });
}

for (const e of edits.sort((a, b) => b.start - a.start)) {
  src = src.slice(0, e.start) + e.text + src.slice(e.end);
}

console.log(`• ${Object.keys(chaves).length} chaves novas (o resto reusa 'compendium.*')`);
if (divergentes.length) {
  console.log(`  ⚠ ${divergentes.length} carta(s) com texto DIFERENTE do compêndio (bug de conteúdo, não de i18n):`);
  divergentes.forEach(id => console.log(`     ${id}`));
}

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcCards', { textos: Object.entries(chaves) });
writeMigrated(SRC, src);
