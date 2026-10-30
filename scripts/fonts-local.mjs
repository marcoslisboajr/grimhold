// ══════════════════════════════════════════════════════════════════════
// scripts/fonts-local.mjs
//
// Baixa TODAS as fontes do jogo do Google Fonts e deixa no disco.
//
// POR QUÊ: o Grimhold é distribuído pela Steam, em Electron. Hoje ele
// pede as fontes ao `fonts.googleapis.com` toda vez que abre — pelo
// <link> do index.html e por um @import dentro do CSS injetado em
// runtime (data/gacha.ts). Sem internet, o jogo abre com a serifada
// padrão do sistema e perde a identidade visual inteira.
// Numa noite de Next Fest isso acontece com alguém.
//
// Generaliza o que o scripts/fonts-cjk.mjs já fazia pro chinês.
//
// Uso:  npm run fonts:local          (pacote 'latin', o do jogo hoje)
//       npm run fonts:pixel          (pacote 'pixel', pra HUD pixel art — B1b)
//
// Cada pacote vai pra pasta e CSS proprios. NUNCA acrescente familia no
// meio de um pacote existente: os arquivos sao nomeados pela POSICAO do
// bloco e os ja baixados sao pulados — deslocar a lista serve fonte
// errada em silencio.
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';

const PACOTES = {
  /** As famílias e pesos que o jogo realmente usa hoje. */
  latin: {
    nome: 'latin',
    // mesmos parâmetros que estavam no <link> e no @import
    url: 'https://fonts.googleapis.com/css2'
       + '?family=Cardo:ital,wght@0,400;0,700;1,400'
       + '&family=Cinzel:wght@400;600;700;900'
       + '&family=MedievalSharp'
       // Roboto saiu: nenhum componente usava, eram 451 KB de peso morto
       + '&family=Space+Mono:wght@400;700'
       + '&family=Spectral:ital,wght@0,400;0,500;1,400'
       + '&display=swap',
  },
  /**
   * Fontes pixel pra HUD pixel art (PLANO_MESTRE B1b/B1e). Escolhidas em
   * 17/9/2026 num espécime com texto do jogo e acentos: Jersey 15 pra
   * números e títulos, Jersey 10 pra rótulos — mesma família, coesão de
   * graça. Ambas OFL. So ficam nítidas em múltiplo inteiro do tamanho
   * nativo (15→30→45, 10→20→30). Não cobrem chinês: o zh-CN segue na
   * Noto Sans SC até decidirmos (Fusion Pixel é a alternativa CJK).
   */
  pixel: {
    nome: 'pixel',
    url: 'https://fonts.googleapis.com/css2'
       + '?family=Jersey+10'
       + '&family=Jersey+15'
       + '&display=swap',
  },
};

const PACOTE = PACOTES[process.argv[2] ?? 'latin'];
if (!PACOTE) throw new Error(`pacote desconhecido: ${process.argv[2]} (existem: ${Object.keys(PACOTES).join(', ')})`);

const DEST = path.join(ROOT, 'public/fonts', PACOTE.nome);
const CSS  = path.join(ROOT, 'public/fonts', `${PACOTE.nome}.css`);

console.log('• baixando a folha de estilo…');
const css = await (await fetch(PACOTE.url, { headers: { 'User-Agent': UA } })).text();

// o índice é a POSIÇÃO do bloco — nunca o nome do arquivo. (No CJK, tirar
// do nome fez 4 pedaços colidirem num arquivo só, em silêncio.)
const blocos = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)].map((m, i) => {
  const corpo = m[1];
  return {
    idx: String(i).padStart(3, '0'),
    familia: (corpo.match(/font-family:\s*'([^']+)'/) ?? [])[1],
    url: (corpo.match(/url\((https:[^)]+)\)/) ?? [])[1],
    range: (corpo.match(/unicode-range:\s*([^;]+);/) ?? [])[1],
    estilo: (corpo.match(/font-style:\s*([^;]+);/) ?? [])[1] ?? 'normal',
    peso: (corpo.match(/font-weight:\s*([^;]+);/) ?? [])[1] ?? '400',
  };
});

const ruins = blocos.filter(b => !b.url || !b.familia);
if (ruins.length) throw new Error(`${ruins.length} bloco(s) sem url ou família`);
if (new Set(blocos.map(b => b.idx)).size !== blocos.length) throw new Error('índices repetidos');

const familias = [...new Set(blocos.map(b => b.familia))];
console.log(`• ${blocos.length} pedaços, ${familias.length} famílias: ${familias.join(', ')}`);

fs.mkdirSync(DEST, { recursive: true });
let bytes = 0, baixados = 0;
for (const b of blocos) {
  const arq = path.join(DEST, `f-${b.idx}.woff2`);
  if (fs.existsSync(arq)) { bytes += fs.statSync(arq).size; continue; }
  const buf = Buffer.from(await (await fetch(b.url, { headers: { 'User-Agent': UA } })).arrayBuffer());
  fs.writeFileSync(arq, buf);
  bytes += buf.length; baixados++;
}
console.log(`• ${baixados} baixados, ${(bytes / 1024).toFixed(0)} KB no disco`);

const local = blocos.map(b => `@font-face {
  font-family: '${b.familia}';
  font-style: ${b.estilo};
  font-weight: ${b.peso};
  font-display: swap;
  src: url('./${PACOTE.nome}/f-${b.idx}.woff2') format('woff2');${b.range ? `
  unicode-range: ${b.range};` : ''}
}`).join('\n');

fs.writeFileSync(CSS, `/* GERADO por scripts/fonts-local.mjs — não editar na mão.
   Fontes do jogo servidas DO DISCO: o Grimhold roda offline na Steam e
   não pode depender do fonts.googleapis.com pra ter a própria cara.
   Famílias: ${familias.join(', ')} */

${local}
`);

console.log(`✓ ${path.relative(ROOT, CSS)} gerado`);
