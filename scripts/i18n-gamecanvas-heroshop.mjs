// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-heroshop.mjs
//
// GameCanvas.tsx — PARTE 7: a LOJA DE HERÓIS. Fecha as quatro telas que
// estavam grudadas no bloco {/* ACHIEVEMENTS SCREEN */}.
// Recorte: `{showHeroShop && (` até `{/* BESTIARY */}`.
//
// Mexe também FORA do bloco: o `CONQUEST_HEROES` (linha ~100) é um Record
// no topo do arquivo com as 10 condições de desbloqueio, e esse texto
// aparece na tela ("Win a run with barrier at 15 HP or below"). O `key`
// continua sendo o tipo do herói; só o texto vira chave.
//
// Uso:  npm run i18n:gc:heroshop
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBlock, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("t('ui.heroShop.")) {
  console.error('✗ A loja de heróis JÁ está migrada.');
  process.exit(1);
}

const chaves = {};

// ─── 1. CONQUEST_HEROES (fora do bloco, no topo do arquivo) ───────────
const bConquest = findBlock(src, 'const CONQUEST_HEROES', '{', '}');
const PAR_RE = /([a-z_]+):(\s*)'((?:[^'\\]|\\.)*)'/g;
PAR_RE.lastIndex = bConquest.start;

const conquistas = [];
for (let m; (m = PAR_RE.exec(src)) && m.index < bConquest.end; ) {
  conquistas.push({ tipo: m[1], espaco: m[2], texto: m[3], start: m.index, end: m.index + m[0].length });
}
if (conquistas.length < 8) throw new Error(`só ${conquistas.length} condições de conquista — formato mudou?`);
console.log(`• ${conquistas.length} condições de desbloqueio (CONQUEST_HEROES)`);

// de trás pra frente, pros índices não saírem do lugar
for (const c of [...conquistas].reverse()) {
  chaves[`ui.conquest.${c.tipo}`] = c.texto;
  const novo = `get ${c.tipo}() { return t('ui.conquest.${c.tipo}'); }`;
  src = src.slice(0, c.start) + novo + src.slice(c.end);
}

// ─── 2. Bloco da loja ─────────────────────────────────────────────────
const INICIO = '{showHeroShop && (';
const FIM    = '{/* BESTIARY */}';
const iniIdx = src.indexOf(INICIO);
const fimIdx = src.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco da loja de heróis');
let bloco = src.slice(iniIdx, fimIdx);

const TROCAS = [
  ['ui.heroShop.title', '>Heroes<', ">{t('ui.heroShop.title')}<", 1],
  ['ui.heroShop.counter',
   "{unlockedTypes.length} unlocked · {(unlockedTypes.includes('malachar_human') ? STARTER_CHARS.length : STARTER_CHARS.length - 1) - unlockedTypes.length} available to buy",
   "{t('ui.heroShop.counter', { n: unlockedTypes.length, disponiveis: (unlockedTypes.includes('malachar_human') ? STARTER_CHARS.length : STARTER_CHARS.length - 1) - unlockedTypes.length })}",
   1, '{{n}} unlocked · {{disponiveis}} available to buy'],
  ['ui.heroShop.unlocked',   '>Unlocked<',        ">{t('ui.heroShop.unlocked')}<", 1],
  ['ui.heroShop.battlePass', '>Battle Pass<',     ">{t('ui.heroShop.battlePass')}<", 2, 'Battle Pass'],
  ['ui.heroShop.reachLevel', '>Reach Level 30<',  ">{t('ui.heroShop.reachLevel')}<", 2, 'Reach Level 30'],
  ['ui.heroShop.secret',     '>Secret<',          ">{t('ui.heroShop.secret')}<", 1],
  ['ui.heroShop.conquest',   '>Conquest<',        ">{t('ui.heroShop.conquest')}<", 1],
];

for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de.trim().slice(0, 55)}" aparece ${achados}x no bloco — esperava ${vezes}`);
  if (valor !== null) chaves[key] = valor ?? de.replace(/^>|<$/g, '').trim();
  bloco = bloco.split(de).join(para);
}
console.log(`• ${TROCAS.length} trocas no bloco, ${Object.keys(chaves).length} chaves no total`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcHeroShop', { textos: Object.entries(chaves) });

writeMigrated(SRC, src.slice(0, iniIdx) + bloco + src.slice(fimIdx));
