// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-audit-live.mjs
//
// Responde a UMA pergunta: quais componentes o GameCanvas realmente
// renderiza, e quais deles ainda não passaram pelo i18n?
//
// Existe porque o ModeSelectOverlay ficou de fora da migração inteira e
// só apareceu quando o Marcos mandou um print da tela em inglês. Um
// componente vivo sem i18n é um vazamento garantido na tela.
//
// ⚠ Nada de backslash em regex montada por string aqui. A versão
// anterior deste script usava new RegExp('<'+nome+'[\\s/>]') e o
// heredoc do shell comeu uma das barras, virando a classe [s/>] — o
// script então dava "morto" para tudo e eu quase acreditei. Detecção
// por indexOf, que não tem escape para errar.
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const gc = fs.readFileSync(path.join(ROOT, 'components/GameCanvas.tsx'), 'utf8');

const dirs = ['components', 'components/panels'];
const arquivos = [];
for (const d of dirs) {
  for (const f of fs.readdirSync(path.join(ROOT, d))) {
    if (f.endsWith('.tsx') && f !== 'GameCanvas.tsx') arquivos.push(d + '/' + f);
  }
}

// <Nome seguido de espaço, /, > ou quebra de linha = está sendo renderizado.
// Sem regex: só indexOf + olhar o caractere seguinte.
const renderizado = (nome) => {
  const alvo = '<' + nome;
  let i = 0;
  while ((i = gc.indexOf(alvo, i)) !== -1) {
    const prox = gc[i + alvo.length];
    if (prox === undefined || prox === ' ' || prox === '\n' || prox === '\r'
        || prox === '\t' || prox === '/' || prox === '>') return true;
    i += alvo.length;
  }
  return false;
};

const vivos = [], mortos = [], faltando = [];
for (const f of arquivos) {
  const nome = path.basename(f, '.tsx');
  const src = fs.readFileSync(path.join(ROOT, f), 'utf8');
  const temI18n = /from ['"][^'"]*i18n['"]/.test(src);
  if (!renderizado(nome)) { mortos.push(f); continue; }
  (temI18n ? vivos : faltando).push(f);
}

console.log('\nVIVOS e com i18n (' + vivos.length + '):');
vivos.forEach(f => console.log('  ✓ ' + f));
console.log('\nMORTOS — nunca renderizados (' + mortos.length + '):');
mortos.forEach(f => console.log('  · ' + f));

if (faltando.length) {
  console.log('\n⚠ VIVOS SEM i18n (' + faltando.length + ') — vazam texto na tela:');
  faltando.forEach(f => console.log('  ⚠ ' + f));
  process.exit(1);
}
console.log('\n✓ todo componente renderizado importa o i18n');
