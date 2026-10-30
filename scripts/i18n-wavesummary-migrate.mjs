// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-wavesummary-migrate.mjs
//
// PARTE 10c: `components/panels/WaveSummaryOverlay.tsx` — o resumo que
// aparece ao fim de cada onda. Painel VIVO.
//
// Uso:  npm run i18n:migrate:wavesummary
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/panels/WaveSummaryOverlay.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ O WaveSummaryOverlay JÁ está migrado.');
  process.exit(1);
}

const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const chaves = {};

function linha(key, texto) {
  const re = new RegExp(`^([ \\t]*)${escapar(texto)}[ \\t]*$`, 'gm');
  const n = [...src.matchAll(re)].length;
  if (n !== 1) throw new Error(`linha "${texto}" aparece ${n}x — esperava 1`);
  src = src.replace(re, `$1{t('${key}')}`);
  chaves[key] = texto;
}

function exato(key, de, para, valor) {
  const n = src.split(de).length - 1;
  if (n !== 1) throw new Error(`"${de}" aparece ${n}x — esperava 1`);
  src = src.split(de).join(para);
  chaves[key] = valor;
}

for (const [key, rotulo] of [
  ['ui.waveSummary.kills',  'KILLS'],
  ['ui.waveSummary.damage', 'DAMAGE'],
  ['ui.waveSummary.gold',   'GOLD'],
  ['ui.waveSummary.crits',  'CRITS'],
]) exato(key, `label: '${rotulo}'`, `get label() { return t('${key}'); }`, rotulo);

exato('ui.waveSummary.completed', '>COMPLETED<', `>{t('ui.waveSummary.completed')}<`, 'COMPLETED');
linha('ui.waveSummary.dismiss', 'tap to dismiss');

const anchor = "import { Sigil, Ico } from '../Sigil';\n";
if (!src.includes(anchor)) throw new Error('imports do WaveSummaryOverlay mudaram — ajuste o script');
src = src.replace(anchor, anchor + "import { t } from '../../i18n';\n");

console.log(`• ${Object.keys(chaves).length} chaves`);
writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'waveSummary', { textos: Object.entries(chaves) });
writeMigrated(SRC, src);
