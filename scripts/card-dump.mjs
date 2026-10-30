import fs from 'node:fs';

const src = fs.readFileSync('components/GameCanvas.tsx', 'utf8');
function lineOf(idx) { return src.slice(0, idx).split('\n').length; }

function extrairBlocos() {
  const blocos = [];
  const marcador = 'options.push(';
  let i = 0;
  while ((i = src.indexOf(marcador, i)) !== -1) {
    const inicioParen = i + marcador.length - 1;
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

const alvo = process.argv.slice(2);
const blocos = extrairBlocos();
for (const b of blocos) {
  const bate = alvo.length === 0 || alvo.some(a => b.texto.includes('id: `' + a + '-') || b.texto.includes("id: '" + a + "'"));
  if (bate) {
    console.log('═══ linha ' + lineOf(b.inicio) + ' ═══');
    console.log(b.texto.slice(0, 1000));
    console.log();
  }
}
