// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-lore-migrate.mjs
//
// PARTE 16b: o `lore` dos 21 heróis (starterChars.tsx) e os rótulos de
// tipo de dano (enemies.ts).
//
// O `lore` ficou de fora da parte 16 porque é TEMPLATE LITERAL (crase) —
// o scanner de aspas não pega. É o texto mais longo do jogo depois do
// bestiário: a biografia de cada herói, que aparece na aba CHRONICLE.
//
// Igual ao CharacterEndingScreen: recusa migrar se algum template tiver
// ${...} dentro, porque aí a chave sairia com o sentido quebrado.
//
// Uso:  npm run i18n:migrate:lore
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { readString, scanItems, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const chaves = {};

// ─── lore dos heróis ──────────────────────────────────────────────────
{
  const p = path.join(ROOT, 'components/data/starterChars.tsx');
  let src = fs.readFileSync(p, 'utf8');
  if (src.includes("t('hero.") && src.includes('.lore')) {
    console.log('  (lore já migrado — pulando)');
  } else {
    // os heróis já têm `type` migrado; pego a ordem pelos `type: '...'`
    const TYPE_RE = /\btype:\s*(?=')/g;
    const herois = [];
    for (let m; (m = TYPE_RE.exec(src)); ) {
      const { value, end } = readString(src, m.index + m[0].length);
      herois.push({ type: value, start: m.index, afterType: end });
    }

    const edits = [];
    let n = 0;
    herois.forEach((h, i) => {
      const limite = herois[i + 1]?.start ?? src.length;
      const LORE_RE = /\blore:\s*(?=`)/g;
      LORE_RE.lastIndex = h.afterType;
      const m = LORE_RE.exec(src);
      if (!m || m.index >= limite) return;

      const inicio = m.index + m[0].length;
      let valor = '';
      let fim = -1;
      for (let k = inicio + 1; k < src.length; k++) {
        const c = src[k];
        if (c === '\\') { valor += src[k + 1]; k++; continue; }
        if (c === '`') { fim = k + 1; break; }
        if (c === '$' && src[k + 1] === '{') {
          throw new Error(`lore de '${h.type}' tem \${...} — vira chave quebrada; trate na mão`);
        }
        valor += c;
      }
      if (fim === -1) throw new Error(`lore de '${h.type}' não fechou`);

      const key = `hero.${h.type}.lore`;
      chaves[key] = valor;
      edits.push({ start: m.index, end: fim, text: `get lore() { return t('${key}'); }` });
      n++;
    });

    if (!n) throw new Error('nenhum lore casou — formato mudou?');
    src = applyEdits(src, edits);
    writeMigrated(p, src);
    console.log(`• ${n} biografias de herói`);
  }
}

// ─── enemies.ts — rótulos de tipo de dano ─────────────────────────────
{
  const p = path.join(ROOT, 'components/data/enemies.ts');
  let src = fs.readFileSync(p, 'utf8');
  if (src.includes("from '../../i18n'")) {
    console.log('  (enemies.ts já migrado — pulando)');
  } else {
    const itens = scanItems(src, { fields: ['label'], idField: 'key' });
    const usaKey = itens.length > 0;
    const lista = usaKey ? itens : scanItems(src, { fields: ['label'] });

    const edits = [];
    for (const item of lista) {
      if (item.label === undefined) continue;
      const key = `damageType.${item.id}`;
      chaves[key] = item.label;
      edits.push({ ...item.spans.label, text: `get label() { return t('${key}'); }` });
    }
    if (!edits.length) throw new Error('enemies.ts: nenhum label casou');

    src = applyEdits(src, edits);
    const anchor = src.match(/^import .*\n/m)?.[0];
    if (!anchor) throw new Error('enemies.ts: sem import pra ancorar');
    src = src.replace(anchor, anchor + "import { t } from '../../i18n';\n");
    writeMigrated(p, src);
    console.log(`• ${edits.length} rótulos de tipo de dano`);
  }
}

console.log(`\n• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'lore', { textos: Object.entries(chaves) });
