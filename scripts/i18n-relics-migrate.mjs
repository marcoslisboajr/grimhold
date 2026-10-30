// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-relics-migrate.mjs
//
// Migra components/data/relics.ts para o i18n (estilo CIRÚRGICO — o
// arquivo é quase todo função `apply:`, lógica pura de jogo).
//
// Fecha o par com o allies.ts: `RELIC_DEFS` são as 12 relíquias de run
// definidas aqui + as 4 de conta que vêm por `...ACCOUNT_RELICS` (essas
// já foram migradas no allies). Mesmo namespace 'relic.<id>.*'.
//
// Cuidado tratado: os `apply` criam objetos com `id: \`relic-twin-${uid()}\``.
// Como o scanner só abre item em `id:` seguido de ASPA, esses são ignorados.
//
// Uso:  npm run i18n:migrate:relics
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanItems, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/data/relics.ts');

const CAMPOS = ['name', 'desc', 'flavor', 'tag'];

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ relics.ts JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

const items = scanItems(src, { fields: CAMPOS });
console.log(`• ${items.length} relíquias de run encontradas`);

const incompletas = items.filter(i => CAMPOS.some(f => i[f] === undefined));
if (incompletas.length) {
  throw new Error(`relíquias sem todos os campos: ${incompletas.map(i => i.id).join(', ')}`);
}
console.log(`  ✓ todas com ${CAMPOS.join(' + ')}`);

// ─── Chaves ───────────────────────────────────────────────────────────
const chaves = {};
for (const item of items) {
  for (const f of CAMPOS) chaves[`relic.${item.id}.${f}`] = item[f];
}
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);   // estoura se colidir com as do allies

saveSnapshot(ROOT, 'relics', {
  items: items.map(i => ({ id: i.id, name: i.name, desc: i.desc, flavor: i.flavor, tag: i.tag })),
});

// ─── Troca cirúrgica ──────────────────────────────────────────────────
const edits = [];
for (const item of items) {
  for (const f of CAMPOS) {
    edits.push({ ...item.spans[f], text: `get ${f}() { return t('relic.${item.id}.${f}'); }` });
  }
}
src = applyEdits(src, edits);

// ─── import do t() + cabeçalho ────────────────────────────────────────
const header = `// data/relics.ts
// Extracted from GameCanvas.tsx — run relic definitions.
// Depende de: uid (systems/combat), ACCOUNT_RELICS (data/allies)
// ══════════════════════════════════════════════════════════════════════

import { uid } from '../systems/combat';
import { ACCOUNT_RELICS } from './allies';
`;
if (!src.includes(header)) throw new Error('cabeçalho do relics.ts mudou — ajuste o script');
src = src.replace(header, `// data/relics.ts
// Relíquias de run, extraídas do GameCanvas.tsx.
// Depende de: uid (systems/combat), ACCOUNT_RELICS (data/allies)
// O texto (name/desc/flavor/tag) vem do i18n, por GETTERS. Para mexer no
// texto, edite i18n/locales/en.json na chave 'relic.<id>.*'.
// ══════════════════════════════════════════════════════════════════════

import { uid } from '../systems/combat';
import { ACCOUNT_RELICS } from './allies';
import { t } from '../../i18n';
`);

writeMigrated(SRC, src);
