// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-charselect.mjs
//
// GameCanvas.tsx — PARTE 8: SELEÇÃO DE PERSONAGEM (cabeçalho e abas).
// Recorte pela condição: `{status === GameStatus.CHARACTER_SELECT && (`
// até `{/* LORE TAB */}` — o conteúdo de cada aba fica pras próximas
// partes, senão vira big bang de novo.
//
// Uso:  npm run i18n:gc:charselect
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{status === GameStatus.CHARACTER_SELECT && (() => {';
const FIM    = '{/* LORE TAB */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco da seleção de personagem');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.charSelect.")) {
  console.error('✗ A seleção de personagem JÁ está migrada.');
  process.exit(1);
}

const TROCAS = [
  // cabeçalho
  ['ui.charSelect.title',    '\n                  CHOOSE YOUR HERO\n', "\n                  {t('ui.charSelect.title')}\n", 1, 'CHOOSE YOUR HERO'],
  ['ui.charSelect.subtitle', "'Select your starting champion'", "t('ui.charSelect.subtitle')", 1, 'Select your starting champion'],
  ['ui.charSelect.heroCount',
   "{unlockedTypes.length} / {unlockedTypes.includes('malachar_human') ? STARTER_CHARS.length : STARTER_CHARS.length - 1} heroes",
   "{t('ui.charSelect.heroCount', { n: unlockedTypes.length, total: unlockedTypes.includes('malachar_human') ? STARTER_CHARS.length : STARTER_CHARS.length - 1 })}",
   1, '{{n}} / {{total}} heroes'],

  // dicas de interação
  ['ui.charSelect.hintSelect',  '>Tap to select · Hold to compare<', ">{t('ui.charSelect.hintSelect')}<", 1],
  ['ui.charSelect.hintPreview', '>Click to preview<', ">{t('ui.charSelect.hintPreview')}<", 1],
  ['ui.charSelect.hintCompare', '>Right-click a hero to compare stats<', ">{t('ui.charSelect.hintCompare')}<", 1],
  ['ui.charSelect.locked',      '>Locked<', ">{t('ui.charSelect.locked')}<", 1],

  // stats do herói (abreviações; 'HP' fica com a mesma chave do bestiário? não:
  // aqui é outra tela e outro layout, então chave própria)
  ['ui.charSelect.statDmg', "label: 'DMG'", "get label() { return t('ui.charSelect.statDmg'); }", 1, 'DMG'],
  ['ui.charSelect.statSpd', "label: 'SPD'", "get label() { return t('ui.charSelect.statSpd'); }", 1, 'SPD'],
  ['ui.charSelect.statHp',  "label: 'HP'",  "get label() { return t('ui.charSelect.statHp'); }",  1, 'HP'],
  ['ui.charSelect.statRng', "label: 'RNG'", "get label() { return t('ui.charSelect.statRng'); }", 1, 'RNG'],
  ['ui.charSelect.type',    '>Type<', ">{t('ui.charSelect.type')}<", 1],

  // covenant + botões
  ['ui.charSelect.covenant', '>ACTIVE COVENANT<', ">{t('ui.charSelect.covenant')}<", 1],
  ['ui.charSelect.play',     '>PLAY<', ">{t('ui.charSelect.play')}<", 1],
  ['ui.charSelect.unlock',   '>Unlock<', ">{t('ui.charSelect.unlock')}<", 1],
  ['ui.charSelect.needMore', 'Need {unlockCostNow - essence} more',
   "{t('ui.charSelect.needMore', { n: unlockCostNow - essence })}", 1, 'Need {{n}} more'],

  // abas
  ['ui.charSelect.tabLore',    "label: 'Lore'",    "get label() { return t('ui.charSelect.tabLore'); }",    1, 'Lore'],
  ['ui.charSelect.tabStats',   "label: 'Stats'",   "get label() { return t('ui.charSelect.tabStats'); }",   1, 'Stats'],
  ['ui.charSelect.tabCompare', "label: 'Compare'", "get label() { return t('ui.charSelect.tabCompare'); }", 1, 'Compare'],
  ['ui.charSelect.tabRelics',  "label: 'Relics'",  "get label() { return t('ui.charSelect.tabRelics'); }",  1, 'Relics'],
  ['ui.charSelect.tabDraft',   "label: 'Draft'",   "get label() { return t('ui.charSelect.tabDraft'); }",   1, 'Draft'],
  ['ui.charSelect.tabSkills',  "label: 'Skills'",  "get label() { return t('ui.charSelect.tabSkills'); }",  1, 'Skills'],
];

const chaves = {};
for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim().slice(0, 55)}" aparece ${achados}x no bloco — esperava ${vezes}`);
  if (valor !== null) chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  bloco = bloco.split(de).join(para);
}
console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcCharSelect', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
