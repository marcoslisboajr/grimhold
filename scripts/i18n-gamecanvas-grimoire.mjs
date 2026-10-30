// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-grimoire.mjs
//
// GameCanvas.tsx — PARTE 6b: o GRIMÓRIO (Arcane Grimoire).
// Recorta de `{status === GameStatus.COLLECTION && (` até
// `{showHeroShop && (` — a terceira das quatro telas grudadas no bloco
// {/* ACHIEVEMENTS SCREEN */}.
//
// Os 20 rótulos de classe saem do próprio `classDefs` (o `key` continua
// sendo o id; só o `label` vira chave), então não tem lista escrita na
// mão pra sair de sincronia.
//
// Uso:  npm run i18n:gc:grimoire
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBlock, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{status === GameStatus.COLLECTION && (';
const FIM    = '{showHeroShop && (';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco do Grimório');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.grimoire.")) {
  console.error('✗ O Grimório JÁ está migrado.');
  process.exit(1);
}

const chaves = {};
const TROCAS = [
  ['ui.grimoire.title',   '>Arcane Grimoire<', ">{t('ui.grimoire.title')}<", 1],
  ['ui.common.back',      '<ArrowLeft size={24} /> Back\n', "<ArrowLeft size={24} /> {t('ui.common.back')}\n", 1, null],
  ['ui.grimoire.summons',   'title="Summons"',   "title={t('ui.grimoire.summons')}",   1, 'Summons'],
  ['ui.grimoire.global',    'title="Global"',    "title={t('ui.grimoire.global')}",    1, 'Global'],
  ['ui.grimoire.synergies', 'title="Synergies"', "title={t('ui.grimoire.synergies')}", 1, 'Synergies'],
];

// ─── rótulos de classe: lidos do próprio classDefs ────────────────────
const bClasses = findBlock(bloco, 'const classDefs', '[', ']');
const CLASSE_RE = /\{ key: '([a-z_]+)', icon: '([^']*)', label: '([^']*)'/g;
CLASSE_RE.lastIndex = bClasses.start;
let n = 0;
for (let m; (m = CLASSE_RE.exec(bloco)) && m.index < bClasses.end; ) {
  const [, key, , label] = m;
  TROCAS.push([`ui.grimoire.class.${key}`, `label: '${label}'`, `get label() { return t('ui.grimoire.class.${key}'); }`, 1, label]);
  n++;
}
console.log(`• ${n} classes lidas do classDefs`);
if (n < 15) throw new Error('achei classes de menos — o formato do classDefs mudou?');

for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim().slice(0, 55)}" aparece ${achados}x no bloco — esperava ${vezes}`);
  if (valor !== null) chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  bloco = bloco.split(de).join(para);
}
console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcGrimoire', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
