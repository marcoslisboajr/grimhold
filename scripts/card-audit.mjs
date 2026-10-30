// ══════════════════════════════════════════════════════════════════════
// scripts/card-audit.mjs
//
// Pergunta: das cartas que o GameCanvas oferece de verdade durante uma
// run (as chamadas options.push({...}) no gerador de cartas de level-up),
// quantas têm title/description traduzíveis (get title() { return t(...) })
// e quantas têm texto cravado (title: `...` ou title: "...")?
//
// Existe porque um grep ingênuo (só uma linha, um formato de aspas) achou
// 45 chamadas quando na verdade há 125 — o resto está formatado com
// quebra de linha depois do `{`, ou com aspas simples/duplas variando.
// Balanceamento de chaves manual porque os objetos têm funções `apply`
// com corpo em chaves, JSX (<Icon />), e objetos aninhados (perks).
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const src = fs.readFileSync(path.join(ROOT, 'components/GameCanvas.tsx'), 'utf8');

function lineOf(idx) {
  return src.slice(0, idx).split('\n').length;
}

// Acha "options.push(" e extrai o bloco balanceado entre o "(" dele e o ")" que fecha.
function extrairBlocos() {
  const blocos = [];
  const marcador = 'options.push(';
  let i = 0;
  while ((i = src.indexOf(marcador, i)) !== -1) {
    const inicioParen = i + marcador.length - 1; // posição do '('
    let depth = 0, j = inicioParen, emString = null;
    for (; j < src.length; j++) {
      const c = src[j];
      if (emString) {
        if (c === '\\') { j++; continue; }
        if (c === emString) emString = null;
        continue;
      }
      if (c === '"' || c === "'" || c === '`') { emString = c; continue; }
      if (c === '(') depth++;
      else if (c === ')') { depth--; if (depth === 0) break; }
    }
    blocos.push({ inicio: i, texto: src.slice(inicioParen, j + 1) });
    i = j + 1;
  }
  return blocos;
}

const blocos = extrairBlocos();

const resultado = [];
for (const b of blocos) {
  const idMatch = b.texto.match(/id:\s*`([a-zA-Z0-9_-]+)-?\$?\{?[^`]*`|id:\s*'([a-zA-Z0-9_-]+)'|id:\s*"([a-zA-Z0-9_-]+)"/);
  const id = idMatch ? (idMatch[1] || idMatch[2] || idMatch[3]) : '(sem id reconhecível)';
  const traduzido = /get\s+title\s*\(\)\s*\{\s*return\s+t\(/.test(b.texto) || /\btitle:\s*t\(/.test(b.texto);
  const tituloCravado = !traduzido && /\btitle:\s*[`'"]/.test(b.texto);
  resultado.push({ linha: lineOf(b.inicio), id, traduzido, tituloCravado });
}

const semId = resultado.filter(r => r.id === '(sem id reconhecível)');
const trad = resultado.filter(r => r.traduzido);
const cravado = resultado.filter(r => r.tituloCravado);
const nenhum = resultado.filter(r => !r.traduzido && !r.tituloCravado);

console.log(`Total de options.push(...) encontrados: ${resultado.length}`);
console.log(`  com id reconhecível: ${resultado.length - semId.length}`);
console.log(`  título traduzido (get title + t()): ${trad.length}`);
console.log(`  título cravado (title: literal): ${cravado.length}`);
console.log(`  nem um nem outro (checar manualmente): ${nenhum.length}`);

if (cravado.length) {
  console.log('\n── Cartas com título cravado (não traduzem) ──');
  cravado.forEach(r => console.log(`  linha ${r.linha}: ${r.id}`));
}
if (nenhum.length) {
  console.log('\n── Sem padrão reconhecido (checar manualmente) ──');
  nenhum.forEach(r => console.log(`  linha ${r.linha}: ${r.id}`));
}
if (semId.length) {
  console.log('\n── Sem id reconhecível pelo regex (checar manualmente) ──');
  semId.forEach(r => console.log(`  linha ${r.linha}`));
}
