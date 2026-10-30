// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-trans.mjs
//
// GameCanvas.tsx — PARTE 11b: as frases do tutorial que têm MARCAÇÃO NO
// MEIO. Cada uma vira UM <Trans> com a frase inteira numa chave só.
//
// Por que <Trans> e não uma chave por pedaço: "right", "left", "Meteor"
// soltos não têm tradução possível fora da frase, e a ordem das palavras
// muda de idioma pra idioma. Ver a prova no plano (PARTE 11).
//
// Regra dos índices: contam TODOS os filhos do <Trans>, texto incluído.
//   0 = texto, 1 = <span>, 2 = texto, 3 = <span>, ...
//
// Uso:  npm run i18n:gc:trans
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

let src = fs.readFileSync(SRC, 'utf8');

/**
 * Cada item: a linha EXATA do fonte e a chave. O script embrulha a linha
 * num <Trans> e monta o valor da chave numerando as tags na ordem.
 */
const FRASES = [
  ['ui.tutorial.step2.body',
   `Wave complete! When a <span className="text-amber-300 font-bold">🛒 merchant</span> is available, the <span className="text-amber-300 font-bold">SHOP button</span> appears in the bottom HUD. Click it to buy allies and upgrades!`],

  ['ui.tutorial.step3.body',
   `Having <span className="text-fuchsia-300 font-bold">2+ allies of the same class</span> activates a synergy bonus. Check the <span className="text-fuchsia-300 font-bold">✦ Synergies</span> panel (top right) to see what's active!`],

  ['ui.tutorial.step4.body',
   `See the spell buttons at the <span className="text-cyan-300 font-bold">bottom of the screen</span>? Use <span className="text-orange-300 font-bold">Meteor</span>, <span className="text-cyan-300 font-bold">Freeze</span>, or <span className="text-green-300 font-bold">Repair</span> during this wave!`],

  ['ui.tutorial.step5.body',
   `Wave 5 — the <span className="text-red-400 font-bold">Goblin King</span> boss appears! Use your spells and hold the line to complete training.`],
];

/** Transforma o JSX numa string com as tags numeradas. */
function numerar(jsx) {
  let i = 0, out = '';
  const re = /<span[^>]*>([\s\S]*?)<\/span>/g;
  let pos = 0, m;
  while ((m = re.exec(jsx))) {
    const antes = jsx.slice(pos, m.index);
    if (antes) { out += antes; i++; }        // nó de texto
    out += `<${i}>${m[1]}</${i}>`; i++;      // o span
    pos = m.index + m[0].length;
  }
  out += jsx.slice(pos);
  return out;
}

const chaves = {};
for (const [key, jsx] of FRASES) {
  const n = src.split(jsx).length - 1;
  if (n !== 1) throw new Error(`frase de "${key}" aparece ${n}x — esperava 1`);
  chaves[key] = numerar(jsx);
  src = src.split(jsx).join(`<Trans i18nKey="${key}">${jsx}</Trans>`);
}

// ─── o aviso da Forge: o <span> externo fica, o <Trans> vai por dentro ─
const FORGE_DE = `<span className="text-orange-300 font-bold">Forge</span> — in the main menu, spend Essence to permanently upgrade heroes across all runs!`;
const nForge = src.split(FORGE_DE).length - 1;
if (nForge !== 1) throw new Error(`aviso da Forge aparece ${nForge}x — esperava 1`);
chaves['ui.tutorial.forgeHint'] = numerar(FORGE_DE);
src = src.split(FORGE_DE).join(`<Trans i18nKey="ui.tutorial.forgeHint">${FORGE_DE}</Trans>`);

// ─── os 6 itens da lista de conclusão ─────────────────────────────────
const CHECKLIST = [
  ['barrier',     'text-blue-300',    'Barrier',     'protect it at all costs'],
  ['shop',        'text-amber-300',   'Shop',        'buy allies in the bottom HUD'],
  ['synergies',   'text-fuchsia-300', 'Synergies',   'stack same-class allies'],
  ['resistances', 'text-orange-300',  'Resistances', 'mix damage types'],
  ['relics',      'text-violet-300',  'Relics',      'equip before each run'],
  ['forge',       'text-orange-300',  'Forge',       'spend Essence between runs'],
];
for (const [id, cor, nome, resto] of CHECKLIST) {
  const de = `<span><span className="${cor}">${nome}</span> — ${resto}</span>`;
  const n = src.split(de).length - 1;
  if (n !== 1) throw new Error(`item "${nome}" da lista aparece ${n}x — esperava 1`);
  const key = `ui.tutorial.recap.${id}`;
  const interno = `<span className="${cor}">${nome}</span> — ${resto}`;
  chaves[key] = numerar(interno);
  src = src.split(de).join(`<span><Trans i18nKey="${key}">${interno}</Trans></span>`);
}

console.log(`• ${Object.keys(chaves).length} frases com <Trans>`);
for (const [k, v] of Object.entries(chaves)) console.log(`  ${k}\n    ${v.slice(0, 100)}`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcTrans', { textos: Object.entries(chaves) });
writeMigrated(SRC, src);
