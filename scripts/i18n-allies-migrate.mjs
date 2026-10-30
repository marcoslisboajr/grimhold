// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-allies-migrate.mjs
//
// Migra components/data/allies.ts para o i18n (estilo CIRÚRGICO — o
// arquivo tem funções `apply:` que são lógica de jogo).
//
// Dois grupos de relíquias, no mesmo namespace 'relic.<id>.*' porque os
// ids já são únicos entre eles:
//   ACCOUNT_RELICS (4)  → name, desc, flavor, tag
//   CHAR_RELICS   (105) → name, desc
//
// Uso:  npm run i18n:migrate:allies
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanItems, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/data/allies.ts');

const OBRIGATORIOS = ['name', 'desc'];        // toda relíquia tem
const OPCIONAIS    = ['flavor', 'tag'];       // só as de conta têm
const CAMPOS       = [...OBRIGATORIOS, ...OPCIONAIS];

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ allies.ts JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

const items = scanItems(src, { fields: CAMPOS });
console.log(`• ${items.length} relíquias encontradas`);

const semObrigatorio = items.filter(i => OBRIGATORIOS.some(f => i[f] === undefined));
if (semObrigatorio.length) {
  throw new Error(`relíquias sem name/desc: ${semObrigatorio.map(i => i.id).join(', ')}`);
}
const comFlavor = items.filter(i => i.flavor !== undefined).length;
const comTag    = items.filter(i => i.tag !== undefined).length;
console.log(`  ✓ todas com name + desc (${comFlavor} com flavor, ${comTag} com tag)`);
if (comFlavor !== comTag) {
  throw new Error('flavor e tag deveriam existir juntos (só nas relíquias de conta)');
}

// ─── Chaves ───────────────────────────────────────────────────────────
const chaves = {};
for (const item of items) {
  for (const f of CAMPOS) {
    if (item[f] !== undefined) chaves[`relic.${item.id}.${f}`] = item[f];
  }
}
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);

saveSnapshot(ROOT, 'allies', {
  items: items.map(i => ({
    id: i.id, name: i.name, desc: i.desc,
    ...(i.flavor !== undefined ? { flavor: i.flavor } : {}),
    ...(i.tag !== undefined ? { tag: i.tag } : {}),
  })),
});

// ─── Troca cirúrgica ──────────────────────────────────────────────────
const edits = [];
for (const item of items) {
  for (const f of CAMPOS) {
    if (item[f] === undefined) continue;
    edits.push({ ...item.spans[f], text: `get ${f}() { return t('relic.${item.id}.${f}'); }` });
  }
}
src = applyEdits(src, edits);

// ─── import do t() + cabeçalho ────────────────────────────────────────
const header = `// data/allies.ts
// Extracted from GameCanvas.tsx — mastery system, per-character
// relics, account relics, and ally constants.
// No React or canvas dependency.
// ══════════════════════════════════════════════════════════════════════
`;
if (!src.includes(header)) throw new Error('cabeçalho do allies.ts mudou — ajuste o script');
src = src.replace(header, `// data/allies.ts
// Sistema de masteria, relíquias de personagem, relíquias de conta e
// constantes de aliados. Extraído do GameCanvas.tsx.
// O texto (name/desc/flavor/tag) vem do i18n, por GETTERS. Para mexer no
// texto, edite i18n/locales/en.json na chave 'relic.<id>.*'.
// ══════════════════════════════════════════════════════════════════════

import { t } from '../../i18n';
`);

writeMigrated(SRC, src);
