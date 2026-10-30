// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-shop.mjs
//
// GameCanvas.tsx — PARTE 10b: a LOJA DO MERCADOR (a que abre no meio da
// run). Recorte: {/* SHOP MODAL */} até {/* SYNERGIES MODAL */}.
//
// Os ITENS da loja já foram migrados lá atrás (shopPools.ts); aqui é a
// moldura: abas, status do mercador, reroll, e a aba de dispensar aliado.
//
// Uso:  npm run i18n:gc:shop
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{/* SHOP MODAL */}';
const FIM    = '{/* SYNERGIES MODAL */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco da loja');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.merchant.")) {
  console.error('✗ A loja JÁ está migrada.');
  process.exit(1);
}

const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const chaves = {};

function linha(key, texto, vezes = 1) {
  const re = new RegExp(`^([ \\t]*)${escapar(texto)}[ \\t]*$`, 'gm');
  const n = [...bloco.matchAll(re)].length;
  if (n !== vezes) throw new Error(`linha "${texto.slice(0, 45)}" aparece ${n}x — esperava ${vezes}`);
  bloco = bloco.replace(re, `$1{t('${key}')}`);
  chaves[key] = texto;
}

function exato(key, de, para, vezes, valor) {
  const n = bloco.split(de).length - 1;
  if (n !== vezes) throw new Error(`"${de.slice(0, 45)}" aparece ${n}x — esperava ${vezes}`);
  bloco = bloco.split(de).join(para);
  if (valor !== null) chaves[key] = valor;
}

// ─── abas (o emoji fica fora da chave) ────────────────────────────────
linha('ui.merchant.tabBuy',     '🛍 Buy');
linha('ui.merchant.tabDismiss', '💀 Dismiss');

// ─── status do mercador ───────────────────────────────────────────────
exato('ui.merchant.leavingIn',
  '`Merchant leaving in ${Math.max(0, merchantEvent.expiresAfterWave - waveRef.current + 1)} wave(s)`',
  "t('ui.merchant.leavingIn', { n: Math.max(0, merchantEvent.expiresAfterWave - waveRef.current + 1) })",
  1, 'Merchant leaving in {{n}} wave(s)');
exato('ui.merchant.available', "'Merchant available'", "t('ui.merchant.available')", 1, 'Merchant available');

// ─── espelho do abismo / itens ────────────────────────────────────────
exato('ui.merchant.mirrorActive', '>RIFT MIRROR ACTIVE<', ">{t('ui.merchant.mirrorActive')}<", 1, 'RIFT MIRROR ACTIVE');
exato('ui.merchant.mirrorHint',   '>Next item purchased will have double effect<',
      ">{t('ui.merchant.mirrorHint')}<", 1, 'Next item purchased will have double effect');
exato('ui.merchant.purchased',    '>Purchased<', ">{t('ui.merchant.purchased')}<", 1, 'Purchased');
exato('ui.merchant.free',         '>FREE<', ">{t('ui.merchant.free')}<", 1, 'FREE');

// ─── reroll ───────────────────────────────────────────────────────────
exato('ui.merchant.reroll', '>Reroll<', ">{t('ui.merchant.reroll')}<", 1, 'Reroll');
exato('ui.merchant.rerollTitle',
  'title={player.gold < rerollCost ? `Need ${rerollCost}g to reroll` : `Reroll all 3 items for ${rerollCost}g`}',
  "title={player.gold < rerollCost ? t('ui.merchant.rerollNeed', { n: rerollCost }) : t('ui.merchant.rerollAll', { n: rerollCost })}",
  1, null);
chaves['ui.merchant.rerollNeed'] = 'Need {{n}}g to reroll';
chaves['ui.merchant.rerollAll']  = 'Reroll all 3 items for {{n}}g';

// ─── aba de dispensar ─────────────────────────────────────────────────
exato('ui.merchant.noSellHeroes', '>Heroes cannot be sold.<', ">{t('ui.merchant.noSellHeroes')}<", 1, 'Heroes cannot be sold.');
linha('ui.merchant.noAllies', 'No allies available to dismiss.');

console.log(`• ${Object.keys(chaves).length} chaves`);
writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcShop', { textos: Object.entries(chaves) });
writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
