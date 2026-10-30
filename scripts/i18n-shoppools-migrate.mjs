// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-shoppools-migrate.mjs
//
// Migra components/data/shopPools.ts para o i18n (CIRÚRGICO — cada item
// carrega uma função `apply:` que é lógica de jogo).
//
//   • MERCHANT_META (3 mercadores) → merchant.<key>.name / .desc
//   • POOL_BLACKSMITH / POOL_HEALER / POOL_MAGE / POOL_SEASON1_CARDS
//     (60 itens)                   → shop.<id>.title / .desc
//
// Fica em inglês de propósito (REGRA DE OURO — texto que é identificador):
//   • `stackKey` ('warDrumStacks'), `rarity` ('rare'|'epic'|'legendary'),
//     `iconType` — nada disso é texto de tela, são chaves de lógica.
//   • `SHOP_POOL` não tem item próprio: é spread dos três pools (spread de
//     ARRAY, mantém as referências, então os getters sobrevivem).
//
// Uso:  npm run i18n:migrate:shoppools
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBlock, findField, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/data/shopPools.ts');

const POOLS = ['POOL_BLACKSMITH', 'POOL_HEALER', 'POOL_MAGE', 'POOL_SEASON1_CARDS'];

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ shopPools.ts JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

const chaves = {};
const edits = [];

// ─── 1. MERCHANT_META — a "id" é a chave do objeto ────────────────────
const bMeta = findBlock(src, 'export const MERCHANT_META', '{', '}');
const META_RE = /^ {2}([a-z_]+):\s*\{/gm;
META_RE.lastIndex = bMeta.start;

const mercadores = [];
for (let m; (m = META_RE.exec(src)) && m.index < bMeta.end; ) {
  mercadores.push({ key: m[1], start: m.index });
}
console.log(`• ${mercadores.length} mercadores`);

mercadores.forEach((mer, i) => {
  const limit = mercadores[i + 1]?.start ?? bMeta.end;
  for (const f of ['name', 'desc']) {
    const campo = findField(src, f, mer.start, limit);
    if (!campo) throw new Error(`mercador '${mer.key}' sem ${f}`);
    mer[f] = campo.value;
    chaves[`merchant.${mer.key}.${f}`] = campo.value;
    edits.push({ start: campo.start, end: campo.end, text: `get ${f}() { return t('merchant.${mer.key}.${f}'); }` });
  }
});

// ─── 2. Pools de itens ────────────────────────────────────────────────
const itens = [];
for (const pool of POOLS) {
  const b = findBlock(src, `export const ${pool}`, '[', ']');
  const ID_RE = /\bid\s*:\s*(?=['"])/g;
  ID_RE.lastIndex = b.start;

  const doPool = [];
  for (let m; (m = ID_RE.exec(src)) && m.index < b.end; ) {
    const campo = findField(src, 'id', m.index, b.end);
    doPool.push({ pool, id: campo.value, start: m.index, afterId: campo.end });
    ID_RE.lastIndex = campo.end;
  }

  doPool.forEach((item, i) => {
    const limit = doPool[i + 1]?.start ?? b.end;
    for (const f of ['title', 'desc']) {
      const campo = findField(src, f, item.afterId, limit);
      if (!campo) throw new Error(`item '${item.id}' sem ${f}`);
      item[f] = campo.value;
      chaves[`shop.${item.id}.${f}`] = campo.value;
      edits.push({ start: campo.start, end: campo.end, text: `get ${f}() { return t('shop.${item.id}.${f}'); }` });
    }
  });

  console.log(`• ${pool}: ${doPool.length} itens`);
  itens.push(...doPool);
}

const dupes = itens.map(i => i.id).filter((id, i, a) => a.indexOf(id) !== i);
if (dupes.length) throw new Error(`ids de item duplicados: ${[...new Set(dupes)].join(', ')}`);

// ─── Chaves + snapshot ────────────────────────────────────────────────
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);

saveSnapshot(ROOT, 'shopPools', {
  mercadores: mercadores.map(m => ({ key: m.key, name: m.name, desc: m.desc })),
  itens:      itens.map(i => ({ id: i.id, title: i.title, desc: i.desc })),
});

// ─── Troca cirúrgica ──────────────────────────────────────────────────
src = applyEdits(src, edits);

// ─── import do t() + cabeçalho ────────────────────────────────────────
const header = `// data/shopPools.ts
// Extracted from GameCanvas.tsx — item pools for the 3 merchants.
// The apply() functions receive only PlayerState as parameter —
// no React or component state dependency.
// ══════════════════════════════════════════════════════════════════════

import { AllyPerks } from '../types';
`;
if (!src.includes(header)) throw new Error('cabeçalho do shopPools.ts mudou — ajuste o script');
src = src.replace(header, `// data/shopPools.ts
// Pools de itens dos 3 mercadores, extraídos do GameCanvas.tsx.
// As funções apply() recebem só o PlayerState — sem dependência de React.
//
// O texto (title/desc dos itens, name/desc dos mercadores) vem do i18n,
// por GETTERS. Chaves: 'shop.<id>.*' e 'merchant.<key>.*'.
// stackKey / rarity / iconType continuam em inglês: são identificadores
// de lógica, não texto de tela.
// ══════════════════════════════════════════════════════════════════════

import { AllyPerks } from '../types';
import { t } from '../../i18n';
`);

writeMigrated(SRC, src);
