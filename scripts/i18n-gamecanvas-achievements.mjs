// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-achievements.mjs
//
// GameCanvas.tsx — PARTE 6: a tela de CONQUISTAS.
//
// O comentário {/* ACHIEVEMENTS SCREEN */} cobre QUATRO telas grudadas
// (conquistas, passe, grimório e loja de heróis). Esta parte recorta só a
// primeira: de `{showAchievements && (` até `{showBattlePass && (`.
//
// Uso:  npm run i18n:gc:achievements
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{showAchievements && (';
const FIM    = '{showBattlePass && (';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco de Conquistas');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.achievements.")) {
  console.error('✗ A tela de Conquistas JÁ está migrada.');
  process.exit(1);
}

const TROCAS = [
  ['ui.achievements.title', '>Achievements<', ">{t('ui.achievements.title')}<", 1],

  // contadores → interpolação
  ['ui.achievements.unlocked',
   '{ACHIEVEMENT_DEFS.filter(d => achievements[d.id]?.unlockedAt).length} / {ACHIEVEMENT_DEFS.length} unlocked',
   "{t('ui.achievements.unlocked', { n: ACHIEVEMENT_DEFS.filter(d => achievements[d.id]?.unlockedAt).length, total: ACHIEVEMENT_DEFS.length })}",
   1, '{{n}} / {{total}} unlocked'],
  ['ui.achievements.essence',
   '{ACHIEVEMENT_DEFS.filter(d => achievements[d.id]?.unlockedAt).reduce((s, d) => s + d.essenceReward, 0)} essence earned',
   "{t('ui.achievements.essence', { n: ACHIEVEMENT_DEFS.filter(d => achievements[d.id]?.unlockedAt).reduce((s, d) => s + d.essenceReward, 0) })}",
   1, '{{n}} essence earned'],

  // abas de categoria
  ['ui.achievements.tabAll',      "label: 'All'",      "get label() { return t('ui.achievements.tabAll'); }",      1, 'All'],
  ['ui.achievements.tabProgress', "label: 'Progress'", "get label() { return t('ui.achievements.tabProgress'); }", 1, 'Progress'],
  ['ui.achievements.tabBosses',   "label: 'Bosses'",   "get label() { return t('ui.achievements.tabBosses'); }",   1, 'Bosses'],
  ['ui.achievements.tabSecrets',  "label: 'Secrets'",  "get label() { return t('ui.achievements.tabSecrets'); }",  1, 'Secrets'],

  // conquista secreta ainda bloqueada
  ['ui.achievements.secretHint', "'Hidden condition — play to discover.'", "t('ui.achievements.secretHint')", 1, 'Hidden condition — play to discover.'],
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
saveSnapshot(ROOT, 'gcAchievements', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
