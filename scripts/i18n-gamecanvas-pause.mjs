// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-pause.mjs
//
// GameCanvas.tsx — PARTE 10: pausa, fim de jogo e os avisos de loja.
// Primeiro pedaço do texto que vive junto do loop de jogo.
//
// Usa a troca por REGEX pra texto em linha própria (jeito novo, da parte
// 9): o script diz só o texto, a indentação é preservada.
//
// Uso:  npm run i18n:gc:pause
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{isPaused && status === GameStatus.PLAYING && (';
const FIM    = '{/* CHARACTER SELECT - FIXED LAYOUT WITH UNLOCKS */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco de pausa/fim de jogo');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.pause.")) {
  console.error('✗ A parte 10 JÁ foi migrada.');
  process.exit(1);
}

const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const chaves = {};

/** texto sozinho numa linha → {t('chave')}, mantendo a indentação */
function linha(key, texto, vezes = 1) {
  const re = new RegExp(`^([ \\t]*)${escapar(texto)}[ \\t]*$`, 'gm');
  const n = [...bloco.matchAll(re)].length;
  if (n !== vezes) throw new Error(`linha "${texto.slice(0, 45)}" aparece ${n}x — esperava ${vezes}`);
  bloco = bloco.replace(re, `$1{t('${key}')}`);
  chaves[key] = texto;
}

/** trecho exato (>x<, atributo, expressão) */
function exato(key, de, para, vezes, valor) {
  const n = bloco.split(de).length - 1;
  if (n !== vezes) throw new Error(`"${de.slice(0, 45)}" aparece ${n}x — esperava ${vezes}`);
  bloco = bloco.split(de).join(para);
  if (valor !== null) chaves[key] = valor;
}

// ─── pausa ────────────────────────────────────────────────────────────
// "GRIMHOLD" fica em inglês: nome do jogo.
exato('ui.pause.paused',  '>⏸ PAUSED<', ">⏸ {t('ui.pause.paused')}<", 1, 'PAUSED');
exato('ui.pause.wave',    "label: 'Wave'",  "get label() { return t('ui.pause.wave'); }",  1, 'Wave');
exato('ui.pause.kills',   "label: 'Kills'", "get label() { return t('ui.pause.kills'); }", 1, 'Kills');
exato('ui.pause.time',    "label: 'Time'",  "get label() { return t('ui.pause.time'); }",  1, 'Time');
exato('ui.pause.gold',    "label: 'Gold'",  "get label() { return t('ui.pause.gold'); }",  1, 'Gold');
linha('ui.pause.resume',  '▶ Resume');
linha('ui.pause.abandon', '✕ Abandon Run');
exato('ui.pause.confirmAbandon', "'Abandon run? Your progress will be saved for XP.'",
      "t('ui.pause.confirmAbandon')", 1, 'Abandon run? Your progress will be saved for XP.');
exato('ui.pause.escHint', '>PRESS ESC TO RESUME<', ">{t('ui.pause.escHint')}<", 1, 'PRESS ESC TO RESUME');

// ─── fim de jogo e avisos de loja ─────────────────────────────────────
linha('ui.game.over', 'GAME OVER');
exato('ui.shop.availableAt', '>AVAILABLE AT SHOP<', ">{t('ui.shop.availableAt')}<", 1, 'AVAILABLE AT SHOP');
exato('ui.shop.click',       '>CLICK<', ">{t('ui.shop.click')}<", 1, 'CLICK');

console.log(`• ${Object.keys(chaves).length} chaves`);
writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcPause', { textos: Object.entries(chaves) });
writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
