// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-lore-keys.mjs
//
// Gera as chaves 'hero.<type>.lore' lendo o BACKUP pré-i18n do
// starterChars.tsx.
//
// POR QUE EXISTE: o script da parte 16b gravou o .tsx e SÓ DEPOIS
// escreveria os locales — e estourou no meio (no enemies.ts). Resultado:
// o código já chamava t('hero.mage.lore') e a chave não existia, então a
// tela mostraria "hero.mage.lore" cru.
//
// LIÇÃO: script de migração deve gravar as CHAVES antes (ou junto) do
// código, nunca depois. Um erro no meio deixa o jogo apontando pra chave
// que não existe.
//
// Uso:  npm run i18n:lore-keys
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readString, writeLocales, saveSnapshot } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const BAK  = path.join(ROOT, 'components/data/starterChars.tsx.pre-i18n.bak');
const ATUAL = path.join(ROOT, 'components/data/starterChars.tsx');

const bak = fs.readFileSync(BAK, 'utf8');

// no backup, cada herói é `type: 'x'` seguido mais adiante de lore: `...`
const TYPE_RE = /\btype:\s*(?=')/g;
const herois = [];
for (let m; (m = TYPE_RE.exec(bak)); ) {
  const { value, end } = readString(bak, m.index + m[0].length);
  herois.push({ type: value, start: m.index, afterType: end });
}

const chaves = {};
herois.forEach((h, i) => {
  const limite = herois[i + 1]?.start ?? bak.length;
  const LORE_RE = /\blore:\s*(?=`)/g;
  LORE_RE.lastIndex = h.afterType;
  const m = LORE_RE.exec(bak);
  if (!m || m.index >= limite) return;

  const inicio = m.index + m[0].length;
  let valor = '';
  for (let k = inicio + 1; k < bak.length; k++) {
    const c = bak[k];
    if (c === '\\') { valor += bak[k + 1]; k++; continue; }
    if (c === '`') break;
    if (c === '$' && bak[k + 1] === '{') throw new Error(`lore de '${h.type}' tem \${...}`);
    valor += c;
  }
  chaves[`hero.${h.type}.lore`] = valor;
});

// confere contra o que o CÓDIGO já está pedindo
const atual = fs.readFileSync(ATUAL, 'utf8');
const pedidas = [...atual.matchAll(/t\('(hero\.[a-z_]+\.lore)'\)/g)].map(m => m[1]);
const faltando = pedidas.filter(k => !(k in chaves));
if (faltando.length) throw new Error(`o código pede chaves que o backup não tem: ${faltando.join(', ')}`);

console.log(`• ${Object.keys(chaves).length} biografias recuperadas do backup`);
console.log(`  ✓ cobrem as ${pedidas.length} chaves que o código pede`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'heroLore', { textos: Object.entries(chaves) });
