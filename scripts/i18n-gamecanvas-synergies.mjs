// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-synergies.mjs
//
// GameCanvas.tsx — PARTE 5b: o Codex de Sinergias (tela pequena, fecha o
// domínio do synergies.tsx, cujos DADOS já foram migrados antes).
//
// Uso:  npm run i18n:gc:synergies
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{/* SYNERGIES MODAL */}';
const FIM    = '{/* WAVE SUMMARY OVERLAY */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco do Codex de Sinergias');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.synergyCodex.")) {
  console.error('✗ O Codex de Sinergias JÁ está migrado.');
  process.exit(1);
}

const TROCAS = [
  ['ui.synergyCodex.title',   '>Synergy Codex<', ">{t('ui.synergyCodex.title')}<", 1],
  ['ui.synergyCodex.tagline', '>Combine classes to unlock powerful bonuses<', ">{t('ui.synergyCodex.tagline')}<", 1],
  ['ui.synergyCodex.count',   '{Object.keys(SYNERGIES).length} synergies',
   "{t('ui.synergyCodex.count', { n: Object.keys(SYNERGIES).length })}", 1, '{{n}} synergies'],
  ['ui.synergyCodex.classes', '/> Class Synergies — Multiple of the same class\n',
   "/> {t('ui.synergyCodex.classes')}\n", 1, 'Class Synergies — Multiple of the same class'],
  ['ui.synergyCodex.combos',  '/> Combo Synergies — Mix different classes\n',
   "/> {t('ui.synergyCodex.combos')}\n", 1, 'Combo Synergies — Mix different classes'],
  // seta fica fora da chave: é decoração, não texto
  ['ui.common.back',          '← Back\n', "← {t('ui.common.back')}\n", 1, null],
];

const chaves = {};
for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim().slice(0, 55)}" aparece ${achados}x no bloco — esperava ${vezes}`);
  if (valor !== null) chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  bloco = bloco.split(de).join(para);
}
console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves novas`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcSynergies', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
