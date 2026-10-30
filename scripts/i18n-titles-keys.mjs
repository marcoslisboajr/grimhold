// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-titles-keys.mjs
//
// Cria as chaves 'title.<id>.name' a partir do registro de
// components/data/titles.ts. O valor em inglês é o mesmo texto que os
// saves antigos guardavam (`legacy`), então nada muda na tela pra quem
// joga em inglês.
//
// Uso:  npm run i18n:titles-keys
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/data/titles.ts');

// Lê o array TITLES do .ts sem precisar compilar: são só literais.
const src = fs.readFileSync(SRC, 'utf8');
const RE = /\{\s*id:\s*'([^']+)',\s*source:\s*'([^']+)',\s*level:\s*(\d+),\s*legacy:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")\s*\}/g;

const titulos = [...src.matchAll(RE)].map(m => ({
  id: m[1], source: m[2], level: Number(m[3]),
  legacy: (m[4] ?? m[5]).replace(/\\(['"\\])/g, '$1'),
}));

if (!titulos.length) throw new Error('nenhum título lido de titles.ts — o formato mudou?');
console.log(`• ${titulos.length} títulos (${titulos.filter(t => t.source === 'account').length} de conta, ${titulos.filter(t => t.source === 'pass').length} de passe)`);

const chaves = {};
for (const t of titulos) chaves[`title.${t.id}.name`] = t.legacy;

writeLocales(ROOT, chaves);
console.log('✓ chaves de título criadas');
