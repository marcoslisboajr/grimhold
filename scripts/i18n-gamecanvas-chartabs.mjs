// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-chartabs.mjs
//
// GameCanvas.tsx — PARTE 8b: conteúdo das abas LORE, STATS e COMPARE da
// seleção de personagem. Recorte: {/* LORE TAB */} até {/* DRAFT TAB */}.
//
// Uso:  npm run i18n:gc:chartabs
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{/* LORE TAB */}';
const FIM    = '{/* DRAFT TAB */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei as abas Lore/Stats/Compare');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.charTabs.")) {
  console.error('✗ As abas JÁ estão migradas.');
  process.exit(1);
}

const TROCAS = [
  // aba Lore
  ['ui.charTabs.ability',   '>Ability<',   ">{t('ui.charTabs.ability')}<", 1],
  ['ui.charTabs.chronicle', '>Chronicle<', ">{t('ui.charTabs.chronicle')}<", 1],
  ['ui.charTabs.synergies', '>Synergies<', ">{t('ui.charTabs.synergies')}<", 1],

  // aba Stats — rótulo + explicação de cada barra
  // 'Damage' e 'Range' aparecem nas DUAS abas (stats e compare): mesma
  // palavra, mesma chave, duas ocorrências.
  ['ui.charTabs.statDamage',      "label: 'Damage'",       "get label() { return t('ui.charTabs.statDamage'); }",      2, 'Damage'],
  ['ui.charTabs.statDamageDesc',  "desc: 'Base damage per projectile hit'", "get desc() { return t('ui.charTabs.statDamageDesc'); }", 1, 'Base damage per projectile hit'],
  ['ui.charTabs.statSpeed',       "label: 'Attack Speed'", "get label() { return t('ui.charTabs.statSpeed'); }",       1, 'Attack Speed'],
  ['ui.charTabs.statSpeedDesc',   "desc: 'Attacks per second'", "get desc() { return t('ui.charTabs.statSpeedDesc'); }", 1, 'Attacks per second'],
  ['ui.charTabs.statHpDesc',      "desc: 'Hero starting health points'", "get desc() { return t('ui.charTabs.statHpDesc'); }", 1, 'Hero starting health points'],
  ['ui.charTabs.statRange',       "label: 'Range'",        "get label() { return t('ui.charTabs.statRange'); }",       2, 'Range'],
  ['ui.charTabs.statRangeDesc',   "desc: 'Maximum attack distance'", "get desc() { return t('ui.charTabs.statRangeDesc'); }", 1, 'Maximum attack distance'],
  ['ui.charTabs.statProj',        "label: 'Proj. Speed'",  "get label() { return t('ui.charTabs.statProj'); }",        1, 'Proj. Speed'],
  ['ui.charTabs.statProjDesc',    "desc: 'How fast projectiles travel'", "get desc() { return t('ui.charTabs.statProjDesc'); }", 1, 'How fast projectiles travel'],
  ['ui.charTabs.heroBonus',       '>Hero Bonus (×3)<', ">{t('ui.charTabs.heroBonus')}<", 1],

  // aba Compare
  ['ui.charTabs.noCompare',     '>No hero selected for comparison<', ">{t('ui.charTabs.noCompare')}<", 1],
  ['ui.charTabs.noCompareHint', '>Right-click any hero in the grid to compare<', ">{t('ui.charTabs.noCompareHint')}<", 1],
  ['ui.charTabs.cmpAtkSpeed',   "label: 'Atk Speed'",  "get label() { return t('ui.charTabs.cmpAtkSpeed'); }",  1, 'Atk Speed'],
  ['ui.charTabs.cmpProjSpeed',  "label: 'Proj Speed'", "get label() { return t('ui.charTabs.cmpProjSpeed'); }", 1, 'Proj Speed'],
  ['ui.charTabs.clearCompare',  '\n                            Clear comparison\n', "\n                            {t('ui.charTabs.clearCompare')}\n", 1, 'Clear comparison'],
];

const chaves = {};
for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim().slice(0, 55)}" aparece ${achados}x no bloco — esperava ${vezes}`);
  if (valor !== null) chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  bloco = bloco.split(de).join(para);
}

// 'HP' e 'Damage' aparecem nas duas abas (stats e compare) — mesma
// palavra, mesma chave: as trocas acima já cobrem as duas ocorrências.
chaves['ui.charTabs.statHp'] = 'HP';

console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves`);

// as duas abas usam label: 'HP' — troca separada porque o valor é o mesmo
const ALVO_HP = "label: 'HP'";
const nHp = bloco.split(ALVO_HP).length - 1;
if (nHp !== 2) throw new Error(`"label: 'HP'" aparece ${nHp}x — esperava 2`);
bloco = bloco.split(ALVO_HP).join("get label() { return t('ui.charTabs.statHp'); }");

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcCharTabs', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
