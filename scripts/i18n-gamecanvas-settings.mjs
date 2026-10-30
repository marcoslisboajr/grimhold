// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-settings.mjs
//
// GameCanvas.tsx — PARTE 1: a tela de Settings.
//
// O GameCanvas tem 19 mil linhas e ~691 strings; migrar tudo de uma vez
// seria o "big bang" que este plano proíbe. Então vai por TELA, e cada
// parte tem seu script.
//
// Como o mesmo texto aparece em várias telas ("Reset", "Close"...), o
// script NÃO troca no arquivo inteiro: ele recorta o bloco da tela pelos
// comentários que já existem no JSX ({/* SETTINGS SCREEN */} até
// {/* CREDITS SCREEN */}) e só mexe ali dentro. Toda troca declara
// quantas vezes deve casar — se o arquivo mudar, o script estoura em vez
// de trocar a coisa errada.
//
// Uso:  npm run i18n:gc:settings
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{/* SETTINGS SCREEN */}';
const FIM    = '{/* CREDITS SCREEN */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco da tela de Settings');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.settings.")) {
  console.error('✗ A tela de Settings JÁ está migrada.');
  process.exit(1);
}

// key | texto exato no fonte | substituto | quantas vezes deve casar
const TROCAS = [
  // cabeçalho
  ['title',            '>Settings<',                                  ">{t('ui.settings.title')}<", 1],
  // áudio
  ['audio',            '>Audio<',                                     ">{t('ui.settings.audio')}<", 1],
  ['music',            '>Music Volume<',                              ">{t('ui.settings.music')}<", 1],
  ['musicHint',        '>Menu & gameplay tracks<',                    ">{t('ui.settings.musicHint')}<", 1],
  ['sfx',              '>SFX Volume<',                                ">{t('ui.settings.sfx')}<", 1],
  ['sfxHint',          '>Cards, waves & summons<',                    ">{t('ui.settings.sfxHint')}<", 1],
  // gameplay
  ['gameplay',         '>Gameplay<',                                  ">{t('ui.settings.gameplay')}<", 1],
  ['speed',            '>Default Speed<',                             ">{t('ui.settings.speed')}<", 1],
  ['speedHint',        '>Game speed when each wave starts<',          ">{t('ui.settings.speedHint')}<", 1],
  // zona de perigo
  ['danger',           '>Data — danger zone<',                        ">{t('ui.settings.danger')}<", 1],
  ['resetTutorial',    '>Reset Tutorial<',                            ">{t('ui.settings.resetTutorial')}<", 1],
  ['resetTutorialHint','>Show tutorial again on next run<',           ">{t('ui.settings.resetTutorialHint')}<", 1],
  ['clearHistory',     '>Clear Run History<',                         ">{t('ui.settings.clearHistory')}<", 1],
  ['clearHistoryHint', '>Delete all saved run records<',              ">{t('ui.settings.clearHistoryHint')}<", 1],
  ['resetForge',       '>Reset Forge<',                               ">{t('ui.settings.resetForge')}<", 1],
  ['resetForgeHint',   '>Wipes all Forge upgrades permanently<',      ">{t('ui.settings.resetForgeHint')}<", 1],
  ['deleteAll',        '>Delete All Data<',                           ">{t('ui.settings.deleteAll')}<", 1],
  ['deleteAllHint',    '>Wipes profile, forge, history and achievements<', ">{t('ui.settings.deleteAllHint')}<", 1],
  // botões (o mesmo "Reset" aparece 2x — mesma palavra, mesma chave)
  ['btnReset',         '\n                      Reset\n',             "\n                      {t('ui.settings.btnReset')}\n", 2],
  ['btnClear',         '\n                      Clear\n',             "\n                      {t('ui.settings.btnClear')}\n", 1],
  ['btnDeleteAll',     '\n                      Delete All\n',        "\n                      {t('ui.settings.btnDeleteAll')}\n", 1],
  ['close',            '\n                Close\n',                   "\n                {t('ui.settings.close')}\n", 1],
  // rodapé
  ['footer',           '>GRIMHOLD — EARLY ACCESS V0.7<',              ">{t('ui.settings.footer')}<", 1],
  // confirmações do navegador
  ['confirmHistory',   "'Clear all run history?'",                    "t('ui.settings.confirmHistory')", 1],
  ['confirmForge',     "'Reset all Forge upgrades? This cannot be undone.'", "t('ui.settings.confirmForge')", 1],
  ['confirmDeleteAll', "'Delete ALL data? This cannot be undone.'",   "t('ui.settings.confirmDeleteAll')", 1],
];

const chaves = {};
for (const [key, de, para, vezes] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim()}" aparece ${achados}x no bloco — esperava ${vezes}`);
  // o valor da chave é o texto limpo (sem os delimitadores de JSX/aspas)
  chaves[`ui.settings.${key}`] = de.replace(/^[>\n\s]+|[<\n\s]+$/g, '').replace(/^'|'$/g, '');
  bloco = bloco.split(de).join(para);
}
console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcSettings', { textos: Object.entries(chaves) });

let novo = full.slice(0, iniIdx) + bloco + full.slice(fimIdx);

// garante o import do t() (a primeira parte migrada é quem adiciona)
if (!novo.includes("from '../i18n'")) {
  const anchor = "import { TITLES, titlesBySource, titleText } from './data/titles';\n";
  if (!novo.includes(anchor)) throw new Error('não achei onde pôr o import do t()');
  novo = novo.replace(anchor, anchor + "import { t } from '../i18n';\n");
  console.log('• import do t() adicionado');
}

writeMigrated(SRC, novo);
