// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-menu.mjs
//
// GameCanvas.tsx — PARTE 3: o MENU PRINCIPAL (a primeira tela do jogo).
// Mesmo método das partes 1 e 2: recorta o bloco {/* MENU */} até
// {/* WEEKLY CHALLENGE SCREEN */} e só mexe ali dentro.
//
// Inclui: entrada de nome, barra de perfil, botão de tutorial, START,
// os 14 botões do menu e o rodapé.
//
// NÃO toca (parece texto, mas não é):
//   • `e.key === 'Enter'` — tecla do teclado, não legenda.
//   • `+40`, `0/3`, `{lvl}` — números.
//
// Uso:  npm run i18n:gc:menu
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{/* MENU */}';
const FIM    = '{/* WEEKLY CHALLENGE SCREEN */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco do MENU');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.menu.")) {
  console.error('✗ O menu principal JÁ está migrado.');
  process.exit(1);
}

const TROCAS = [
  // ── entrada de nome ────────────────────────────────────────────────
  ['ui.menu.welcome',    '>WELCOME TO GRIMHOLD<', ">{t('ui.menu.welcome')}<", 1],
  ['ui.menu.nameIntro',
   'Choose your guardian name. It will be displayed throughout your journey and on your profile.',
   "{t('ui.menu.nameIntro')}", 1],
  ['ui.menu.namePlaceholder', 'placeholder="Your guardian name..."', "placeholder={t('ui.menu.namePlaceholder')}", 1, 'Your guardian name...'],
  ['ui.menu.nameRule',   'Letters, numbers and spaces only · 2–20 characters', "{t('ui.menu.nameRule')}", 1],
  ['ui.menu.beginWatch', '>\n              Begin the Watch\n', ">\n              {t('ui.menu.beginWatch')}\n", 1, 'Begin the Watch'],

  // ── barra de perfil ────────────────────────────────────────────────
  ['ui.menu.changeAvatar', 'title="Change avatar"', "title={t('ui.menu.changeAvatar')}", 1, 'Change avatar'],
  ['ui.menu.maxLevel',   "'MAX LEVEL'",  "t('ui.menu.maxLevel')", 1, 'MAX LEVEL'],
  ['ui.menu.max',        "? 'MAX' :",    "? t('ui.menu.max') :", 1, 'MAX'],
  ['ui.menu.pickTitle',  "'Pick title'", "t('ui.menu.pickTitle')", 1, 'Pick title'],
  ['ui.menu.noTitle',    "'No title yet'", "t('ui.menu.noTitle')", 1, 'No title yet'],

  // ── tutorial + start ───────────────────────────────────────────────
  ['ui.menu.tutorial',   '/> Tutorial — Learn the Basics\n', "/> {t('ui.menu.tutorial')}\n", 1, 'Tutorial — Learn the Basics'],
  ['ui.menu.start',      '>START<', ">{t('ui.menu.start')}<", 1],

  // ── os 14 botões do menu (array de dados dentro do JSX) ────────────
  ['ui.menu.library',    '>Library<',     ">{t('ui.menu.library')}<",     1],
  ['ui.menu.heroes',     "label:'Heroes'",      "get label() { return t('ui.menu.heroes'); }",      1, 'Heroes'],
  ['ui.menu.pass',       "label:'Battle Pass'", "get label() { return t('ui.menu.pass'); }",        1, 'Battle Pass'],
  ['ui.menu.grimoire',   "label:'Grimoire'",    "get label() { return t('ui.menu.grimoire'); }",    1, 'Grimoire'],
  ['ui.menu.bestiary',   "label:'Bestiary'",    "get label() { return t('ui.menu.bestiary'); }",    1, 'Bestiary'],
  ['ui.menu.synergies',  "label:'Synergies'",   "get label() { return t('ui.menu.synergies'); }",   1, 'Synergies'],
  ['ui.menu.progress',   '>Progress<',    ">{t('ui.menu.progress')}<",    1],
  ['ui.menu.achievements', '>Achievements<', ">{t('ui.menu.achievements')}<", 1],
  ['ui.menu.forge',      '>Forge<',       ">{t('ui.menu.forge')}<",       1],
  ['ui.menu.daily',      '>Daily<',       ">{t('ui.menu.daily')}<",       1],
  ['ui.menu.history',    '>History<',     ">{t('ui.menu.history')}<",     1],
  ['ui.menu.runHistory', '>Run History<', ">{t('ui.menu.runHistory')}<",  1],
  ['ui.menu.comingSoon', '>Coming Soon<', ">{t('ui.menu.comingSoon')}<",  1],
  ['ui.menu.credits',    '>Credits<',     ">{t('ui.menu.credits')}<",     1],

  // ── desafio semanal (selo no botão) ────────────────────────────────
  ['ui.menu.done',       '>DONE<', ">{t('ui.menu.done')}<", 1],

  // ── rodapé ─────────────────────────────────────────────────────────
  ['ui.menu.earlyAccess', '>EARLY ACCESS V0.7<', ">{t('ui.menu.earlyAccess')}<", 1],
  ['ui.menu.feedback',   '>Send Feedback<', ">{t('ui.menu.feedback')}<", 1],
  ['ui.menu.settings',   '>Settings<', ">{t('ui.menu.settings')}<", 1],
];

const chaves = {};
for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim()}" aparece ${achados}x no bloco — esperava ${vezes}`);
  chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  bloco = bloco.split(de).join(para);
}
console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcMenu', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
