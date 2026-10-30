// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-credits.mjs
//
// GameCanvas.tsx — PARTE 5: telas de CRÉDITOS e COMING SOON (roadmap).
// Lista montada a partir do `npm run i18n:scan`, não no olho.
//
// NÃO traduz (nome próprio / endereço):
//   • "GRIMHOLD", "Marcos Antonio Lisboa Junior", "Final Boss Blues",
//     "Eric Matyas", "Mixkit" — nomes de pessoa, estúdio e marca.
//   • patreon.com/finalbossblues, soundimage.org, mixkit.co — URLs.
// Nomes de gente e de estúdio não mudam de idioma; traduzir seria erro,
// e ainda por cima quebraria a atribuição das licenças.
//
// Uso:  npm run i18n:gc:credits
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{/* CREDITS SCREEN */}';
const FIM    = '{/* RUN HISTORY SCREEN */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei os blocos de Créditos/Coming Soon');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.credits.")) {
  console.error('✗ A parte 5 JÁ foi migrada.');
  process.exit(1);
}

const TROCAS = [
  // ── créditos ───────────────────────────────────────────────────────
  ['ui.credits.title',        '>Credits<', ">{t('ui.credits.title')}<", 1],
  ['ui.common.tagline',       '>Tower Defense Roguelike<', ">{t('ui.common.tagline')}<", 1, null],
  ['ui.credits.development',  '>Development<', ">{t('ui.credits.development')}<", 1],
  ['ui.credits.role',         '>Design · Code · Direction<', ">{t('ui.credits.role')}<", 1],
  ['ui.credits.art',          '>Character Art & Sprites<', ">{t('ui.credits.art')}<", 1],
  ['ui.credits.artLicense',   '>Used under commercial license (Patron+)<', ">{t('ui.credits.artLicense')}<", 1],
  ['ui.credits.music',        '>Music<', ">{t('ui.credits.music')}<", 1],
  ['ui.credits.musicMenu',    '>Menu Theme<', ">{t('ui.credits.musicMenu')}<", 1],
  ['ui.credits.musicGameplay','>Gameplay Theme<', ">{t('ui.credits.musicGameplay')}<", 1],
  ['ui.credits.musicLicense', '>Free for commercial use with attribution<', ">{t('ui.credits.musicLicense')}<", 1],
  ['ui.credits.sfx',          '>Sound Effects<', ">{t('ui.credits.sfx')}<", 1],
  ['ui.credits.sfxLicense',   '>Free license<', ">{t('ui.credits.sfxLicense')}<", 1],
  ['ui.credits.thanks',       '>Special Thanks<', ">{t('ui.credits.thanks')}<", 1],
  ['ui.credits.thanksText',
   'To everyone who played the playtest versions, sent feedback and reported bugs. Grimhold exists because of you.',
   "{t('ui.credits.thanksText')}", 1],

  // ── coming soon / roadmap ──────────────────────────────────────────
  ['ui.roadmap.title',    '>The Road Ahead<', ">{t('ui.roadmap.title')}<", 1],
  ['ui.roadmap.title',    '\n                  The Road Ahead\n', "\n                  {t('ui.roadmap.title')}\n", 1, null],
  ['ui.roadmap.subtitle', '>Early Access v0.7 · Grimhold Roadmap<', ">{t('ui.roadmap.subtitle')}<", 1],
  ['ui.roadmap.intro',
   "Grimhold is in active development, and this is where it's headed. Everything below is what I'm working toward — shaped by what the community enjoys most.",
   "{t('ui.roadmap.intro')}", 1],

  // itens do roadmap (5 × título + descrição)
  ['ui.roadmap.item.0.title', "title: 'More Heroes'", "get title() { return t('ui.roadmap.item.0.title'); }", 1, 'More Heroes'],
  ['ui.roadmap.item.0.desc',  "desc: 'New heroes, each with their own skill tree, playstyle, and ending.'",
   "get desc() { return t('ui.roadmap.item.0.desc'); }", 1, 'New heroes, each with their own skill tree, playstyle, and ending.'],
  ['ui.roadmap.item.1.title', "title: 'New Modes'", "get title() { return t('ui.roadmap.item.1.title'); }", 1, 'New Modes'],
  ['ui.roadmap.item.1.desc',  `desc: "Additional ways to play, including greater challenges for players who've mastered the core game."`,
   "get desc() { return t('ui.roadmap.item.1.desc'); }", 1, "Additional ways to play, including greater challenges for players who've mastered the core game."],
  ['ui.roadmap.item.2.title', "title: 'Full Localization'", "get title() { return t('ui.roadmap.item.2.title'); }", 1, 'Full Localization'],
  ['ui.roadmap.item.2.desc',  "desc: 'Complete English and Portuguese support across the entire game.'",
   "get desc() { return t('ui.roadmap.item.2.desc'); }", 1, 'Complete English and Portuguese support across the entire game.'],
  ['ui.roadmap.item.3.title', "title: 'Leaderboards'", "get title() { return t('ui.roadmap.item.3.title'); }", 1, 'Leaderboards'],
  ['ui.roadmap.item.3.desc',  "desc: 'Compete for the longest survival in Endless mode.'",
   "get desc() { return t('ui.roadmap.item.3.desc'); }", 1, 'Compete for the longest survival in Endless mode.'],
  ['ui.roadmap.item.4.title', "title: 'Deeper Progression'", "get title() { return t('ui.roadmap.item.4.title'); }", 1, 'Deeper Progression'],
  ['ui.roadmap.item.4.desc',  "desc: 'More relics, synergies, and content across the acts, plus continued balance and polish.'",
   "get desc() { return t('ui.roadmap.item.4.desc'); }", 1, 'More relics, synergies, and content across the acts, plus continued balance and polish.'],

  // rodapé + fechar (reusa chaves que já existem)
  ['ui.menu.earlyAccess', '>EARLY ACCESS V0.7<', ">{t('ui.menu.earlyAccess')}<", 1, null],
  ['ui.common.close',     '\n                Close\n', "\n                {t('ui.common.close')}\n", 1, null],
  // esta o scanner NÃO pegou: a linha começa com '©' e o regex exigia letra
  ['ui.credits.copyright', '>© 2025 Marcos Antonio Lisboa Junior · All rights reserved<',
   ">{t('ui.credits.copyright')}<", 1, '© 2025 Marcos Antonio Lisboa Junior · All rights reserved'],
];

const chaves = {};
for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim().slice(0, 55)}" aparece ${achados}x no bloco — esperava ${vezes}`);
  // valor === null → chave já existe (reuso), não recria
  if (valor !== null) chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  bloco = bloco.split(de).join(para);
}
console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves novas (o resto reusa chave existente)`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcCredits', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
