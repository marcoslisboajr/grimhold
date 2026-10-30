// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-hud.mjs
//
// GameCanvas.tsx — PARTE 12 (última das telas): HUD da run, diário da
// run, histórico de compras, aviso de nível e a carta do Jester.
//
// ⚠ ACHADO: "Total gasto no shop" está em PORTUGUÊS no build inglês
// (linha ~13430) — mesmo caso do "Maestria". Virou chave, e o valor em
// inglês é "Total spent at shop", que é o que a tela devia mostrar.
// É a 2ª (e última) correção de texto inglês desta migração.
//
// Uso:  npm run i18n:gc:hud
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBlock, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("t('ui.hud.")) {
  console.error('✗ O HUD JÁ está migrado.');
  process.exit(1);
}

const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const chaves = {};

function linha(key, texto, vezes = 1) {
  const re = new RegExp(`^([ \\t]*)${escapar(texto)}[ \\t]*$`, 'gm');
  const n = [...src.matchAll(re)].length;
  if (n !== vezes) throw new Error(`linha "${texto.slice(0, 45)}" aparece ${n}x — esperava ${vezes}`);
  src = src.replace(re, `$1{t('${key}')}`);
  chaves[key] = texto;
}

function exato(key, de, para, vezes, valor) {
  const n = src.split(de).length - 1;
  if (n !== vezes) throw new Error(`"${de.slice(0, 50)}" aparece ${n}x — esperava ${vezes}`);
  src = src.split(de).join(para);
  if (valor !== null) chaves[key] = valor;
}

// ─── HUD ──────────────────────────────────────────────────────────────
exato('ui.hud.weakTo',   '>Next wave weak to:<', ">{t('ui.hud.weakTo')}<", 1, 'Next wave weak to:');
exato('ui.hud.speed',    '>spd<', ">{t('ui.hud.speed')}<", 1, 'spd');
exato('ui.hud.level',    '>lvl<', ">{t('ui.hud.level')}<", 1, 'lvl');
exato('ui.hud.dismissQ', '>Dismiss?<', ">{t('ui.hud.dismissQ')}<", 1, 'Dismiss?');
// ">Shop<" também aparece dentro de um <Trans> do tutorial — por isso o
// alvo aqui inclui o estilo, pra pegar só o botão do HUD.
exato('ui.hud.shop', "lineHeight: 1.3 }}>Shop</span>", "lineHeight: 1.3 }}>{t('ui.hud.shop')}</span>", 1, 'Shop');
exato('ui.hud.toggleSound',   'title="Toggle sound (music + SFX)"', "title={t('ui.hud.toggleSound')}", 1, 'Toggle sound (music + SFX)');
exato('ui.hud.abandonRun',    'title="Abandon Run"', "title={t('ui.hud.abandonRun')}", 1, 'Abandon Run');
exato('ui.hud.rightClickSell','title="Right-click to dismiss"', "title={t('ui.hud.rightClickSell')}", 1, 'Right-click to dismiss');

// ─── diário da run / histórico de compras ─────────────────────────────
exato('ui.hud.journal',    '>Run Journal<', ">{t('ui.hud.journal')}<", 1, 'Run Journal');
exato('ui.hud.noCards',    '>No cards chosen yet<', ">{t('ui.hud.noCards')}<", 1, 'No cards chosen yet');
exato('ui.hud.shopHistory','>Shop History<', ">{t('ui.hud.shopHistory')}<", 1, 'Shop History');
exato('ui.hud.noPurchases','>No items purchased yet<', ">{t('ui.hud.noPurchases')}<", 1, 'No items purchased yet');

// ⚠ português no build inglês — corrigido pro que a tela devia mostrar
exato('ui.hud.totalSpent', '>Total gasto no shop<', ">{t('ui.hud.totalSpent')}<", 1, 'Total spent at shop');

// ─── avisos ───────────────────────────────────────────────────────────
exato('ui.toast.accountLevelUp', '>Account Level Up!<', ">{t('ui.toast.accountLevelUp')}<", 1, 'Account Level Up!');

// ─── carta do Jester ──────────────────────────────────────────────────
linha('ui.levelUp.deadMansHand', "Dead Man's Hand");
linha('ui.levelUp.discard', 'Discard this card');

// a frase tem marcação E valor dinâmico → <Trans> com values
const CARTA_DE = `A card dropped from <span className="text-red-400 font-bold">{jesterCardDrop.enemyName}</span>'s soul!`;
const nCarta = src.split(CARTA_DE).length - 1;
if (nCarta !== 1) throw new Error(`frase da carta aparece ${nCarta}x — esperava 1`);
src = src.split(CARTA_DE).join(
  `<Trans i18nKey="ui.levelUp.cardFrom" values={{ name: jesterCardDrop.enemyName }}>` +
  `A card dropped from <span className="text-red-400 font-bold">{'{{name}}'}</span>'s soul!</Trans>`);
chaves['ui.levelUp.cardFrom'] = "A card dropped from <1>{{name}}</1>'s soul!";

// ─── rótulos de classe do CLASS_INFO (lidos do próprio Record) ────────
const b = findBlock(src, 'const CLASS_INFO', '{', '}');
const RE = /([a-z_]+):\{label:'([^']+)'/g;
RE.lastIndex = b.start;
const classes = [];
for (let m; (m = RE.exec(src)) && m.index < b.end; ) classes.push({ key: m[1], label: m[2], start: m.index, end: m.index + m[0].length });
if (classes.length < 15) throw new Error(`só ${classes.length} classes no CLASS_INFO — formato mudou?`);
for (const c of [...classes].reverse()) {
  chaves[`ui.class.${c.key}`] = c.label;
  src = src.slice(0, c.start) + `${c.key}:{get label() { return t('ui.class.${c.key}'); }` + src.slice(c.end);
}
console.log(`• ${classes.length} rótulos de classe (CLASS_INFO)`);

console.log(`• ${Object.keys(chaves).length} chaves`);
console.log('  ⚠ "Total gasto no shop" (português) virou "Total spent at shop" — correção de bug');

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcHud', { textos: Object.entries(chaves) });
writeMigrated(SRC, src);
