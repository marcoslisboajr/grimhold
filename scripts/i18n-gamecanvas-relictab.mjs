// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-relictab.mjs
//
// GameCanvas.tsx — PARTE 8c: abas DRAFT e RELICS da seleção de
// personagem. Recorte: {/* DRAFT TAB */} até {/* SKILLS TAB */}.
//
// ⚠ AQUI MORA O BUG DO "MAESTRIA": a aba de relíquias mostra
// `✦ Maestria Nv.3` — texto em PORTUGUÊS cravado no build inglês, que
// está na 0.7.0 da Steam agora. Virou chave com interpolação; o valor em
// inglês vai como "Mastery Lv.{{n}}", que é o que a tela DEVIA mostrar.
// Isso MUDA o texto em inglês — é a única mudança de texto inglês feita
// nesta migração inteira, e é correção de bug, não tradução.
//
// Uso:  npm run i18n:gc:relictab
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{/* DRAFT TAB */}';
const FIM    = '{/* SKILLS TAB */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei as abas Draft/Relics');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.draft.")) {
  console.error('✗ As abas Draft/Relics JÁ estão migradas.');
  process.exit(1);
}

const TROCAS = [
  // aba Draft
  ['ui.draft.synergyDetected', '>Synergy Detected<', ">{t('ui.draft.synergyDetected')}<", 1],
  ['ui.draft.chooseUpTo',      'Choose up to 2 heroes ', "{t('ui.draft.chooseUpTo')} ", 1, 'Choose up to 2 heroes'],
  ['ui.draft.selected2',       '>— 2/2 selected<', ">{t('ui.draft.selected2')}<", 1, '— 2/2 selected'],
  ['ui.draft.selected1',       '>— 1/2 selected<', ">{t('ui.draft.selected1')}<", 1, '— 1/2 selected'],

  // aba Relics — masteria
  ['ui.relics.mastery',   '>Mastery<', ">{t('ui.relics.mastery')}<", 1],
  ['ui.relics.maxLevel',  "'MAX LEVEL'", "t('ui.relics.maxLevel')", 1, 'MAX LEVEL'],
  ['ui.relics.level',     '`Level ${masLvl}`', "t('ui.relics.level', { n: masLvl })", 1, 'Level {{n}}'],
  ['ui.relics.xpToLevel', '{xpNeeded.toLocaleString()} XP to Level {masLvl + 1}',
   "{t('ui.relics.xpToLevel', { xp: xpNeeded.toLocaleString(), n: masLvl + 1 })}", 1, '{{xp}} XP to Level {{n}}'],
  ['ui.relics.none',      '>No relics available for this character.<', ">{t('ui.relics.none')}<", 1],

  // ⚠ o bug: "Maestria" em português no build inglês
  ['ui.relics.masteryLevel',
   '{unlocked ? `✦ Maestria Nv.${relic.masteryLevel}` : `🔒 Maestria Nv.${relic.masteryLevel}`}',
   "{(unlocked ? '✦ ' : '🔒 ') + t('ui.relics.masteryLevel', { n: relic.masteryLevel })}",
   1, 'Mastery Lv.{{n}}'],
];

const chaves = {};
for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim().slice(0, 55)}" aparece ${achados}x no bloco — esperava ${vezes}`);
  if (valor !== null) chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  bloco = bloco.split(de).join(para);
}
console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves`);
console.log('  ⚠ "Maestria Nv.N" (português) virou "Mastery Lv.{{n}}" — correção de bug, muda o texto em inglês');

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcRelicTab', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
