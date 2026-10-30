// ══════════════════════════════════════════════════════════════════════
// scripts/fonts-cjk.mjs
//
// Baixa a Noto Sans SC (chinês simplificado) e deixa TUDO LOCAL.
//
// POR QUE LOCAL, E NÃO O <link> DO GOOGLE FONTS:
// o jogo roda em Electron, distribuído pela Steam. Fonte vinda de CDN
// exige internet toda vez que o jogo abre. Sem rede, o chinês vira
// quadradinho (□□□) — e "não abriu com internet" é a metade dos casos
// numa noite de Next Fest. Fonte de jogo tem que estar no disco.
//
// COMO FUNCIONA O CORTE EM PEDAÇOS:
// o Google divide a Noto Sans SC em ~100 arquivos, cada um com um
// `unicode-range`. O navegador só baixa o pedaço que contém os caracteres
// que estão na tela. Guardando todos localmente, o disco leva ~4 MB mas o
// runtime carrega só uns poucos KB — o melhor dos dois mundos.
//
// Uso:  npm run fonts:cjk
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const DEST = path.join(ROOT, 'public/fonts/noto-sans-sc');
const CSS  = path.join(ROOT, 'public/fonts/noto-sans-sc.css');

// UA de navegador moderno: sem isso o Google devolve TTF em vez de WOFF2
const UA = 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36';
const FONTE_CSS = 'https://fonts.googleapis.com/css2?family=Noto+Sans+SC:wght@400&display=swap';

console.log('• baixando a folha de estilo da fonte…');
const css = await (await fetch(FONTE_CSS, { headers: { 'User-Agent': UA } })).text();

// ⚠ NÃO tirar o índice do nome do arquivo: as últimas 4 URLs (latin,
// latin-ext, cyrillic, greek) NÃO terminam em `.N.woff2`, então saíam
// como `undefined` e as quatro gravavam no MESMO arquivo — três
// unicode-range apontando pro conteúdo errado, em silêncio.
// O índice é a POSIÇÃO do bloco: sempre único.
const blocos = [...css.matchAll(/@font-face\s*\{([\s\S]*?)\}/g)].map((m, i) => {
  const corpo = m[1];
  return {
    idx: String(i).padStart(3, '0'),
    url: (corpo.match(/url\((https:[^)]+)\)/) ?? [])[1],
    range: (corpo.match(/unicode-range:\s*([^;]+);/) ?? [])[1],
  };
});

if (!blocos.length) throw new Error('não consegui ler os blocos @font-face — o formato do Google mudou?');
const semDados = blocos.filter(b => !b.url || !b.range);
if (semDados.length) throw new Error(`${semDados.length} bloco(s) sem url ou unicode-range`);
if (new Set(blocos.map(b => b.idx)).size !== blocos.length) throw new Error('índices repetidos');
console.log(`• ${blocos.length} pedaços a baixar`);

fs.mkdirSync(DEST, { recursive: true });

let bytes = 0, baixados = 0;
for (const b of blocos) {
  if (!b.url || !b.range) throw new Error(`bloco ${b.idx} sem url ou unicode-range`);
  const arquivo = path.join(DEST, `nsc-${b.idx}.woff2`);
  if (fs.existsSync(arquivo)) { bytes += fs.statSync(arquivo).size; continue; }
  const buf = Buffer.from(await (await fetch(b.url, { headers: { 'User-Agent': UA } })).arrayBuffer());
  fs.writeFileSync(arquivo, buf);
  bytes += buf.length; baixados++;
  if (baixados % 20 === 0) console.log(`   ${baixados}/${blocos.length}…`);
}
console.log(`• ${baixados} baixados, ${(bytes / 1024 / 1024).toFixed(1)} MB no disco`);

// ─── CSS local, com os mesmos unicode-range ───────────────────────────
const local = blocos.map(b => `/* [${b.idx}] */
@font-face {
  font-family: 'Noto Sans SC';
  font-style: normal;
  font-weight: 400;
  font-display: swap;
  src: url('./noto-sans-sc/nsc-${b.idx}.woff2') format('woff2');
  unicode-range: ${b.range};
}`).join('\n');

fs.writeFileSync(CSS, `/* GERADO por scripts/fonts-cjk.mjs — não editar na mão.
   Noto Sans SC (SIL Open Font License 1.1), servida do disco: o jogo
   roda offline na Steam e não pode depender de CDN.
   O navegador só carrega o pedaço com os caracteres que estão na tela. */

${local}
`);

console.log(`✓ ${path.relative(ROOT, CSS)} gerado com ${blocos.length} @font-face`);
