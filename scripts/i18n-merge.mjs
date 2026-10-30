// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-merge.mjs
//
// Aplica um lote de traduções num locale, com conferência.
//
// Uso:  node scripts/i18n-merge.mjs <locale> <arquivo.json>
//       npm run i18n:merge -- pt-BR traducoes/ui-lote1.json
//
// O que ele NÃO deixa passar:
//   • chave que não existe no en.json (erro de digitação no lote);
//   • valor vazio (não traduzir é diferente de traduzir pra "");
//   • placeholder {{x}} que sumiu ou apareceu do nada — isso quebraria a
//     interpolação em runtime e só apareceria no idioma traduzido;
//   • tag <N> de <Trans> com contagem diferente do inglês.
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const [locale, arquivo] = process.argv.slice(2);
if (!locale || !arquivo) {
  console.error('uso: node scripts/i18n-merge.mjs <locale> <arquivo.json>');
  process.exit(1);
}

const enPath = path.join(ROOT, 'i18n/locales/en.json');
const locPath = path.join(ROOT, 'i18n/locales', `${locale}.json`);
const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
const alvo = JSON.parse(fs.readFileSync(locPath, 'utf8'));
const lote = JSON.parse(fs.readFileSync(path.isAbsolute(arquivo) ? arquivo : path.join(ROOT, arquivo), 'utf8'));

const marcadores = s => [...String(s).matchAll(/\{\{(\w+)\}\}/g)].map(m => m[1]).sort();
const tags = s => [...String(s).matchAll(/<(\d+)>/g)].map(m => m[1]).sort();

const erros = [];
let aplicadas = 0, jaIguais = 0;

for (const [k, v] of Object.entries(lote)) {
  if (!(k in en))          { erros.push(`${k}: não existe no en.json`); continue; }
  if (!String(v).trim())   { erros.push(`${k}: valor vazio`); continue; }

  const mEn = marcadores(en[k]), mTr = marcadores(v);
  if (JSON.stringify(mEn) !== JSON.stringify(mTr)) {
    erros.push(`${k}: placeholders diferentes — en {{${mEn.join(',')}}} vs traduzido {{${mTr.join(',')}}}`);
    continue;
  }
  const tEn = tags(en[k]), tTr = tags(v);
  if (JSON.stringify(tEn) !== JSON.stringify(tTr)) {
    erros.push(`${k}: tags de <Trans> diferentes — en <${tEn.join(',')}> vs traduzido <${tTr.join(',')}>`);
    continue;
  }

  if (alvo[k] === v) { jaIguais++; continue; }
  alvo[k] = v;
  aplicadas++;
}

if (erros.length) {
  console.error(`\n✗ ${erros.length} problema(s) — NADA foi gravado:`);
  erros.slice(0, 20).forEach(e => console.error('   ' + e));
  process.exit(1);
}

// mantém a ordem do en.json, pra ficar fácil de comparar lado a lado
const saida = {};
for (const k of Object.keys(en)) saida[k] = alvo[k] ?? '';
fs.writeFileSync(locPath, JSON.stringify(saida, null, 2) + '\n');

const traduzidas = Object.values(saida).filter(Boolean).length;
const total = Object.keys(en).length;
console.log(`✓ ${locale}: +${aplicadas} traduções${jaIguais ? ` (${jaIguais} já iguais)` : ''}`);
console.log(`  ${traduzidas}/${total} chaves traduzidas (${(traduzidas / total * 100).toFixed(1)}%)`);
