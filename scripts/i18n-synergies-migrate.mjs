// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-synergies-migrate.mjs
//
// Migra components/data/synergies.tsx para o i18n (CIRÚRGICO — tem JSX
// nos ícones e os números são lógica de jogo).
//
// Este arquivo tem DUAS formas diferentes, e nenhuma delas casa com o
// scanner genérico da lib (que espera um campo `id:`):
//
//  1. SYNERGIES: Record<string, SynergyDef> — o "id" é a CHAVE do objeto,
//     não um campo. E as descrições estão num array de níveis:
//       archer: { name: 'Patrol', levels: [ { count: 1, desc: '...' }, ... ] }
//     → synergy.archer.name  /  synergy.archer.level.<i>.desc
//
//  2. COMBOS: ComboDef[] — tem `id`, mas as descrições são um array de
//     strings SOLTAS (sem nome de campo):
//       { id: 'sacred-trinity', name: '...', descs: [ '...', '...' ] }
//     → combo.sacred-trinity.name  /  combo.sacred-trinity.desc.<i>
//     O array inteiro vira um getter só, usando o tList() do i18n.
//
// Uso:  npm run i18n:migrate:synergies
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readString, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/data/synergies.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ synergies.tsx JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

/** Acha o bloco que começa no marcador e vai até o delimitador casado. */
function bloco(marker, open, close) {
  const i = src.indexOf(marker);
  if (i === -1) throw new Error(`marcador não encontrado: ${marker}`);
  const eq = src.indexOf('=', i);           // sempre DEPOIS do '=' (bug do piloto)
  const start = src.indexOf(open, eq);
  let d = 0;
  for (let k = start; k < src.length; k++) {
    if (src[k] === open) d++;
    else if (src[k] === close) { d--; if (d === 0) return { start, end: k + 1 }; }
  }
  throw new Error(`bloco não fechado: ${marker}`);
}

/** Próximo `campo: '...'` a partir de `from`, sem passar de `limit`. */
function campo(nome, from, limit) {
  const re = new RegExp(`\\b${nome}\\s*:\\s*(?=['"])`, 'g');
  re.lastIndex = from;
  const m = re.exec(src);
  if (!m || m.index >= limit) return null;
  const { value, end } = readString(src, m.index + m[0].length);
  return { value, start: m.index, end };
}

/** Todos os `campo: '...'` num intervalo, em ordem. */
function campos(nome, from, limit) {
  const out = [];
  let pos = from;
  for (;;) {
    const achado = campo(nome, pos, limit);
    if (!achado) return out;
    out.push(achado);
    pos = achado.end;
  }
}

const chaves = {};
const edits = [];

// ─── 1. SYNERGIES ─────────────────────────────────────────────────────
const bSyn = bloco('export const SYNERGIES', '{', '}');
const KEY_RE = /^ {2}([A-Za-z_][A-Za-z0-9_]*): \{$/gm;
KEY_RE.lastIndex = bSyn.start;

const synergies = [];
for (let m; (m = KEY_RE.exec(src)) && m.index < bSyn.end; ) {
  synergies.push({ key: m[1], start: m.index });
}
console.log(`• ${synergies.length} sinergias`);

synergies.forEach((syn, i) => {
  const limit = synergies[i + 1]?.start ?? bSyn.end;

  const nome = campo('name', syn.start, limit);
  if (!nome) throw new Error(`sinergia '${syn.key}' sem name`);
  syn.name = nome.value;
  chaves[`synergy.${syn.key}.name`] = nome.value;
  edits.push({ start: nome.start, end: nome.end, text: `get name() { return t('synergy.${syn.key}.name'); }` });

  syn.levels = campos('desc', nome.end, limit).map((d, idx) => {
    chaves[`synergy.${syn.key}.level.${idx}.desc`] = d.value;
    edits.push({ start: d.start, end: d.end, text: `get desc() { return t('synergy.${syn.key}.level.${idx}.desc'); }` });
    return d.value;
  });
  if (!syn.levels.length) throw new Error(`sinergia '${syn.key}' sem nenhum desc`);
});
console.log(`  ✓ ${synergies.reduce((n, s) => n + s.levels.length, 0)} níveis de sinergia`);

// ─── 2. COMBOS ────────────────────────────────────────────────────────
const bCombo = bloco('export const COMBOS', '[', ']');
const ID_RE = /\bid\s*:\s*(?=['"])/g;
ID_RE.lastIndex = bCombo.start;

const combos = [];
for (let m; (m = ID_RE.exec(src)) && m.index < bCombo.end; ) {
  const { value, end } = readString(src, m.index + m[0].length);
  combos.push({ id: value, start: m.index, afterId: end });
}
console.log(`• ${combos.length} combos`);

combos.forEach((combo, i) => {
  const limit = combos[i + 1]?.start ?? bCombo.end;

  const nome = campo('name', combo.afterId, limit);
  if (!nome) throw new Error(`combo '${combo.id}' sem name`);
  combo.name = nome.value;
  chaves[`combo.${combo.id}.name`] = nome.value;
  edits.push({ start: nome.start, end: nome.end, text: `get name() { return t('combo.${combo.id}.name'); }` });

  // descs: [ '...', '...' ] → um getter só, resolvido por tList()
  const dm = /\bdescs\s*:\s*\[/g;
  dm.lastIndex = combo.afterId;
  const achado = dm.exec(src);
  if (!achado || achado.index >= limit) throw new Error(`combo '${combo.id}' sem descs`);

  const arrStart = achado.index;
  let arrEnd = -1, d = 0;
  const textos = [];
  for (let k = src.indexOf('[', arrStart); k < src.length; k++) {
    const c = src[k];
    if (c === '[') d++;
    else if (c === ']') { d--; if (d === 0) { arrEnd = k + 1; break; } }
    else if (c === "'" || c === '"') { const s = readString(src, k); textos.push(s.value); k = s.end - 1; }
  }
  if (arrEnd === -1) throw new Error(`descs de '${combo.id}' não fechou`);
  if (!textos.length) throw new Error(`descs de '${combo.id}' está vazio`);

  combo.descs = textos;
  textos.forEach((txt, idx) => { chaves[`combo.${combo.id}.desc.${idx}`] = txt; });
  edits.push({ start: arrStart, end: arrEnd, text: `get descs() { return tList('combo.${combo.id}.desc'); }` });
});
console.log(`  ✓ ${combos.reduce((n, c) => n + c.descs.length, 0)} descrições de combo`);

// ─── Chaves + snapshot ────────────────────────────────────────────────
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);

saveSnapshot(ROOT, 'synergies', {
  synergies: synergies.map(s => ({ key: s.key, name: s.name, levels: s.levels })),
  combos:    combos.map(c => ({ id: c.id, name: c.name, descs: c.descs })),
});

// ─── Troca cirúrgica ──────────────────────────────────────────────────
src = applyEdits(src, edits);

// ─── import do t()/tList() + cabeçalho ────────────────────────────────
const header = `// data/synergies.ts
// Extracted from GameCanvas.tsx — synergy interfaces and definitions,
// temas de ato e combos cross-class.
// No React dependency (except ReactNode for icons).
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
`;
if (!src.includes(header)) throw new Error('cabeçalho do synergies.tsx mudou — ajuste o script');
src = src.replace(header, `// data/synergies.tsx
// Sinergias, temas de ato e combos cross-class, extraídos do GameCanvas.
// O texto (name/desc) vem do i18n, por GETTERS. Para mexer no texto, edite
// i18n/locales/en.json nas chaves 'synergy.<key>.*' e 'combo.<id>.*'.
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import { t, tList } from '../../i18n';
`);

writeMigrated(SRC, src);
