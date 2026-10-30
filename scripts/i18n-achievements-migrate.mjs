// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-achievements-migrate.mjs
//
// Migra components/data/achievements.ts para o i18n (CIRÚRGICO — o
// arquivo também tem a persistência em localStorage).
//
//   { id: 'wave_5', title: '...', description: '...', icon: '🩸', ... }
//   → achievement.wave_5.title / .description
//
// Uso:  npm run i18n:migrate:achievements
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanItems, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/data/achievements.ts');

const CAMPOS = ['title', 'description'];

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ achievements.ts JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

const items = scanItems(src, { fields: CAMPOS });
console.log(`• ${items.length} conquistas encontradas`);

const incompletas = items.filter(i => CAMPOS.some(f => i[f] === undefined));
if (incompletas.length) {
  throw new Error(`conquistas sem title/description: ${incompletas.map(i => i.id).join(', ')}`);
}
console.log(`  ✓ todas com ${CAMPOS.join(' + ')}`);

// ─── Chaves ───────────────────────────────────────────────────────────
const chaves = {};
for (const item of items) {
  for (const f of CAMPOS) chaves[`achievement.${item.id}.${f}`] = item[f];
}
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);

saveSnapshot(ROOT, 'achievements', {
  items: items.map(i => ({ id: i.id, title: i.title, description: i.description })),
});

// ─── Troca cirúrgica ──────────────────────────────────────────────────
src = applyEdits(src, items.flatMap(item =>
  CAMPOS.map(f => ({ ...item.spans[f], text: `get ${f}() { return t('achievement.${item.id}.${f}'); }` })),
));

// ─── import do t() + cabeçalho ────────────────────────────────────────
const header = `// data/achievements.ts
// Extracted from GameCanvas.tsx — achievement definitions, indexed map
// for O(1) lookups and localStorage persistence.
// No React or canvas dependency.
// ══════════════════════════════════════════════════════════════════════
`;
if (!src.includes(header)) throw new Error('cabeçalho do achievements.ts mudou — ajuste o script');
src = src.replace(header, `// data/achievements.ts
// Conquistas, mapa indexado para lookup O(1) e persistência em
// localStorage. Extraído do GameCanvas.tsx.
// O texto (title/description) vem do i18n, por GETTERS. Para mexer no
// texto, edite i18n/locales/en.json na chave 'achievement.<id>.*'.
// ══════════════════════════════════════════════════════════════════════
`);

const anchor = "import { storage } from '../systems/storage';\n";
if (!src.includes(anchor)) throw new Error('import do storage sumiu — ajuste o script');
src = src.replace(anchor, anchor + "import { t } from '../../i18n';\n");

writeMigrated(SRC, src);
