// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-resto-dados-migrate.mjs
//
// PARTE 16: os arquivos de dados que NÃO estavam na lista do plano.
//
// A lista original tinha 14 arquivos. Ao fechar o GameCanvas eu varri o
// projeto inteiro e achei mais quatro com texto de tela:
//   • starterChars.tsx — nome, descrição e lore dos 20 heróis
//   • forge.ts         — as melhorias permanentes da Forja
//   • weekly.ts        — os objetivos do desafio diário
//   • enemies.ts       — os rótulos de tipo de dano (PHY/ARC/NAT/HOL)
//
// starterChars é o mais sério: é o texto que o jogador lê ao escolher
// personagem. Ficar de fora teria sido uma falha grande.
//
// Uso:  npm run i18n:migrate:resto
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { scanItems, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');

const chaves = {};
const resumo = [];

/** Migra um arquivo cujos itens têm `id` + campos de texto. */
function migrar({ arquivo, prefixo, campos, importPath, anchor, idField = 'id' }) {
  const p = path.join(ROOT, arquivo);
  let src = fs.readFileSync(p, 'utf8');
  if (src.includes(`from '${importPath}'`)) {
    console.log(`  (${path.basename(arquivo)} já migrado — pulando)`);
    return;
  }

  const itens = scanItems(src, { fields: campos, idField });
  const edits = [];
  let n = 0;
  for (const item of itens) {
    for (const f of campos) {
      if (item[f] === undefined) continue;
      const key = `${prefixo}.${item.id}.${f}`;
      chaves[key] = item[f];
      edits.push({ ...item.spans[f], text: `get ${f}() { return t('${key}'); }` });
      n++;
    }
  }
  if (!n) throw new Error(`${arquivo}: nenhum texto casou`);

  src = applyEdits(src, edits);
  if (!src.includes(anchor)) throw new Error(`${arquivo}: âncora de import não encontrada`);
  src = src.replace(anchor, anchor + `import { t } from '${importPath}';\n`);

  writeMigrated(p, src);
  resumo.push(`${path.basename(arquivo)}: ${itens.length} itens, ${n} textos`);
}

// ─── starterChars.tsx — heróis ────────────────────────────────────────
// `lore` é template literal (crase), então não entra no scanner de aspas:
// fica registrado no plano como pendência desse arquivo.
migrar({
  arquivo: 'components/data/starterChars.tsx',
  prefixo: 'hero',
  campos: ['name', 'description'],
  idField: 'type',            // aqui o id do herói é o campo `type`
  importPath: '../../i18n',
  anchor: "import { AllyType } from '../types';\n",
});

// ─── forge.ts — melhorias permanentes ─────────────────────────────────
migrar({
  arquivo: 'components/data/forge.ts',
  prefixo: 'forgeUp',
  campos: ['name', 'desc', 'flavor'],
  importPath: '../../i18n',
  anchor: "import { storage } from '../systems/storage';\n",
});

// ─── weekly.ts — objetivos do desafio diário ──────────────────────────
migrar({
  arquivo: 'components/data/weekly.ts',
  prefixo: 'weekly',
  campos: ['label', 'description'],
  importPath: '../../i18n',
  anchor: "import { storage } from '../systems/storage';\n",
});

console.log(`\n• ${Object.keys(chaves).length} chaves novas`);
resumo.forEach(r => console.log('   ', r));

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'restoDados', { textos: Object.entries(chaves) });
