// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-splash.mjs
//
// GameCanvas.tsx — PARTE 4: splash, seletores de título/avatar, avisos
// (toasts) e as SOBRAS do menu (parte 3).
//
// Esta parte nasceu do `npm run i18n:scan`: a parte 3 passou na
// verificação com 30 chaves e mesmo assim tinha deixado texto pra trás
// (o subtítulo "Tower Defense Roguelike" estava em linha própria, que o
// meu jeito antigo de inventariar não pegava).
//
// NÃO traduz:
//   • "GRIMHOLD" — é o nome do jogo. Nome próprio de marca fica igual em
//     todo idioma (na Steam também).
//
// Uso:  npm run i18n:gc:splash
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("t('ui.splash.")) {
  console.error('✗ A parte 4 JÁ foi migrada.');
  process.exit(1);
}

const chaves = {};
const TROCAS = [
  // ── frases do splash: array no corpo do componente → tList() ───────
  ['ui.splash.lore', `const lines = [
      "The walls of Grimhold have never fallen.",
      "Something ancient stirs beneath the gates.",
      "Every decision matters. Every wave is a test.",
      "Build your formation. Hold the line.",
      "The darkness does not negotiate.",
      "Grimhold endures — or it doesn't.",
      "Your allies are all that stand between hope and ruin.",
    ];
    return lines[Math.floor(Math.random() * lines.length)];`,
   `const lines = tList('ui.splash.lore');
    return lines[Math.floor(Math.random() * lines.length)];`, 1, null],

  // ── splash ─────────────────────────────────────────────────────────
  ['ui.splash.loading', '\n                Initializing Realm…\n', "\n                {t('ui.splash.loading')}\n", 1, 'Initializing Realm…'],
  // subtítulo: aparece no splash E no menu — mesma frase, chave comum
  ['ui.common.tagline', '\n              Tower Defense Roguelike\n', "\n              {t('ui.common.tagline')}\n", 1, 'Tower Defense Roguelike'],
  ['ui.common.tagline', '\n                Tower Defense Roguelike\n', "\n                {t('ui.common.tagline')}\n", 1, 'Tower Defense Roguelike'],

  // ── seletor de título ──────────────────────────────────────────────
  ['ui.titles.choose',   '>Choose Title<', ">{t('ui.titles.choose')}<", 1],
  ['ui.titles.counter',  '{accountProfile.unlockedTitles.length} / {TITLES.length} unlocked',
   "{t('ui.titles.counter', { n: accountProfile.unlockedTitles.length, total: TITLES.length })}", 1,
   '{{n}} / {{total}} unlocked'],
  ['ui.titles.none',     '>No titles unlocked yet.<', ">{t('ui.titles.none')}<", 1],
  ['ui.titles.noneHint', '>Reach Account Level 1 to earn your first title.<', ">{t('ui.titles.noneHint')}<", 1],
  ['ui.titles.equipped', '>✓ Equipped<', ">{t('ui.titles.equipped')}<", 1, '✓ Equipped'],

  // ── seletor de avatar ──────────────────────────────────────────────
  ['ui.avatars.choose',  '>Choose Avatar<', ">{t('ui.avatars.choose')}<", 1],

  // ── botão Close dos dois seletores (mesma palavra, uma chave) ──────
  ['ui.common.close', '\n              Close\n', "\n              {t('ui.common.close')}\n", 2, 'Close'],

  // ── avisos (toasts) ────────────────────────────────────────────────
  ['ui.toast.achievement', '>Achievement Unlocked!<', ">{t('ui.toast.achievement')}<", 1],
  ['ui.toast.heroUnlocked', '<span>Hero Unlocked</span>', "<span>{t('ui.toast.heroUnlocked')}</span>", 1, 'Hero Unlocked'],
  ['ui.toast.heroWhere',   '\n              Available in Hero Selection\n', "\n              {t('ui.toast.heroWhere')}\n", 1, 'Available in Hero Selection'],
  ['ui.toast.dailyDone',   '>Daily Challenge Complete!<', ">{t('ui.toast.dailyDone')}<", 1],
  ['ui.toast.dailyCleared','>All objectives cleared!<', ">{t('ui.toast.dailyCleared')}<", 1],
  ['ui.toast.danger',      '>Danger!<', ">{t('ui.toast.danger')}<", 1],
];

for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = src.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim().slice(0, 50)}" aparece ${achados}x — esperava ${vezes}`);
  if (valor !== null) chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  src = src.split(de).join(para);
}

// as 7 frases do splash viram lista indexada
const LORE = [
  'The walls of Grimhold have never fallen.',
  'Something ancient stirs beneath the gates.',
  'Every decision matters. Every wave is a test.',
  'Build your formation. Hold the line.',
  'The darkness does not negotiate.',
  "Grimhold endures — or it doesn't.",
  'Your allies are all that stand between hope and ruin.',
];
LORE.forEach((txt, i) => { chaves[`ui.splash.lore.${i}`] = txt; });

console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves (7 são as frases do splash)`);

// o tList() precisa estar importado
if (!/import \{ t(, tList)? \} from '\.\.\/i18n'/.test(src)) throw new Error('import do i18n não está como esperado');
src = src.replace("import { t } from '../i18n';", "import { t, tList } from '../i18n';");

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcSplash', { textos: Object.entries(chaves) });
writeMigrated(SRC, src);
