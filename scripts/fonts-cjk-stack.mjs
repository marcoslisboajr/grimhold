// ══════════════════════════════════════════════════════════════════════
// scripts/fonts-cjk-stack.mjs
//
// Põe a 'Noto Sans SC' no FIM de toda pilha de fonte do jogo.
//
// Por que não bastou mexer no @theme do Tailwind: o jogo injeta um CSS
// em runtime (data/gacha.ts) que REDEFINE .font-cinzel / .font-medieval /
// .font-fantasy, e ainda usa estilo inline com a pilha escrita à mão
// (data/materials.ts → FONT). O @theme perde pra esses dois. Descobri
// olhando o getComputedStyle de um elemento com texto chinês: dava
// "Cardo, serif" mesmo depois de eu editar o tema.
//
// A Noto entra sempre como ÚLTIMO recurso, então inglês e português não
// mudam em nada — ela só assume onde a fonte anterior não tem o glifo.
//
// Uso:  npm run fonts:cjk-stack
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const CJK = "'Noto Sans SC'";

/** insere a CJK antes da família genérica final (serif/monospace/...) */
function comCJK(pilha) {
  if (pilha.includes('Noto Sans SC')) return pilha;
  return pilha.replace(/,\s*(serif|sans-serif|monospace|cursive|fantasy)\s*$/,
                       `, ${CJK}, $1`);
}

const alvos = [
  // CSS injetado em runtime — é ele que ganha das classes do Tailwind
  { arquivo: 'components/data/gacha.ts', regex: /(\.font-[a-z]+\s*\{\s*font-family:\s*)([^;]+)(;)/g },
  // pilhas escritas à mão, usadas em estilo inline
  { arquivo: 'components/data/materials.ts', regex: /((?:display|body|mono):\s*")([^"]+)(")/g },
  // literais soltos
  { arquivo: 'components/GameCanvas.tsx', regex: /(fontFamily:\s*")([^"]*(?:Cardo|Cinzel|Spectral|Space Mono)[^"]*)(")/g },
  { arquivo: 'components/CharacterEndingScreen.tsx', regex: /(fontFamily:\s*")([^"]*(?:Cardo|Cinzel)[^"]*)(")/g },
];

let total = 0;
for (const alvo of alvos) {
  const p = path.join(ROOT, alvo.arquivo);
  const antes = fs.readFileSync(p, 'utf8');
  let n = 0;
  const depois = antes.replace(alvo.regex, (todo, pre, pilha, pos) => {
    const nova = comCJK(pilha);
    if (nova !== pilha) n++;
    return pre + nova + pos;
  });
  if (n) fs.writeFileSync(p, depois);
  console.log(`  ${path.basename(alvo.arquivo)}: ${n} pilha(s)`);
  total += n;
}

if (!total) throw new Error('nenhuma pilha alterada — o formato mudou?');
console.log(`\n✓ ${total} pilhas de fonte agora terminam em ${CJK}`);
