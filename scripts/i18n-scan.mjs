// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-scan.mjs
//
// Lista o texto que AINDA está cravado em inglês num .tsx, agrupado pela
// seção do JSX ({/* NOME */}) em que aparece.
//
// Por que existe: nas partes 1-3 do GameCanvas eu montava a lista de
// strings "no olho", procurando `>texto<`. Isso perde:
//   • texto em linha própria (`\n      Tower Defense Roguelike\n`);
//   • placeholder=/title= em atributo;
//   • rótulo dentro de array de dados no meio do JSX.
// O menu passou pela verificação com 30 chaves e ainda tinha sobra.
// Este scanner é pra parar de adivinhar.
//
// Uso:  npm run i18n:scan                       (GameCanvas inteiro)
//       npm run i18n:scan -- <arquivo> <seção>  (filtra por seção)
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const alvo = process.argv[2] ?? 'components/GameCanvas.tsx';
const filtro = process.argv[3];

const linhas = fs.readFileSync(path.join(ROOT, alvo), 'utf8').split('\n');

// Linha que já usa t(...) está migrada — não interessa.
const jaMigrada = l => /\bt\(\s*['"`]/.test(l) || /\btList\(/.test(l) || /titleText\(/.test(l);

// Ruído comum: classe do Tailwind, cor, caminho, url, código.
// (o texto pode começar com símbolo — '© 2025 ...' escapou na parte 5
//  porque o regex antigo exigia letra na primeira posição)
const ruido = txt =>
  txt.length < 3 ||
  /^[a-z-]+(\s+[a-z0-9:\[\]#.\/-]+)+$/.test(txt) ||   // cara de className
  /^(true|false|null|undefined|auto|none|const|return|import|export)$/i.test(txt) ||
  /[{}<>=]|\.(tsx?|css|png|mp3)$|https?:|^[a-z]+\.[a-z]+$/.test(txt);

const achados = [];
let secao = '(topo do arquivo)';

linhas.forEach((linha, i) => {
  const m = linha.match(/\{\/\*\s*(.{2,60}?)\s*\*\/\}/);
  if (m) secao = m[1];
  if (jaMigrada(linha)) return;

  const add = (txt, tipo) => {
    txt = txt.trim();
    if (!ruido(txt) && /[A-Za-z]{3}/.test(txt)) achados.push({ linha: i + 1, secao, tipo, txt });
  };

  // a) linha inteira de texto JSX
  const puro = linha.match(/^\s{4,}([A-Za-z©®✦⚔+][A-Za-z0-9 .,!?·—–&%/'’()©®✦⚔+-]*)$/);
  if (puro && !linha.includes(':')) add(puro[1], 'texto');

  // b) >texto< na mesma linha
  for (const g of linha.matchAll(/>([A-Za-z©®✦⚔][^<>{}]{2,70})</g)) add(g[1], 'texto');

  // c) atributos que aparecem na tela
  for (const g of linha.matchAll(/\b(placeholder|title|alt|aria-label)="([^"]{3,})"/g)) add(g[2], g[1]);

  // d) rótulo em objeto de dados dentro do JSX
  for (const g of linha.matchAll(/\b(label|name|title|desc|text|sub|tag|msg)\s*:\s*'([A-Z][^']{2,60})'/g)) add(g[2], g[1]);
});

// ─── Relatório ────────────────────────────────────────────────────────
const porSecao = new Map();
for (const a of achados) {
  if (filtro && !a.secao.toLowerCase().includes(filtro.toLowerCase())) continue;
  if (!porSecao.has(a.secao)) porSecao.set(a.secao, []);
  porSecao.get(a.secao).push(a);
}

const ordenadas = [...porSecao.entries()].sort((a, b) => b[1].length - a[1].length);
console.log(`\n${alvo}${filtro ? ` — seções contendo "${filtro}"` : ''}`);
console.log(`${achados.length} candidatas em ${porSecao.size} seções\n`);

for (const [sec, itens] of ordenadas) {
  console.log(`── ${sec}  (${itens.length})`);
  if (filtro) for (const it of itens) console.log(`   ${String(it.linha).padStart(5)}  [${it.tipo}] ${it.txt}`);
}
if (!filtro) console.log('\nRode com um filtro de seção pra ver as linhas: npm run i18n:scan -- components/GameCanvas.tsx MENU');
