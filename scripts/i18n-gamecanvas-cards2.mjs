// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-cards2.mjs
//
// GameCanvas.tsx — PARTE 14: as cartas de level-up cuja DESCRIÇÃO é um
// template literal com valores calculados no meio, tipo:
//
//   title: 'Ranger Focus',
//   description: `🏹 Archer attack speed: ${curSpd}/s → ${nxtSpd}/s (+8%).`
//
// A parte 13 não pegou essas porque o regex de lá exigia aspas na
// descrição. São 63 cartas — o maior naco que ainda faltava.
//
// Cada ${expr} vira um {{placeholder}} e a expressão vai no objeto de
// interpolação, então o número continua sendo calculado em runtime:
//
//   get description() { return t('ui.card.<id>.description',
//                                { curSpd: curSpd, nxtSpd: nxtSpd }); }
//
// O nome do placeholder é o próprio identificador quando dá (`curSpd`),
// senão v0, v1... Nome legível importa: é o que o tradutor vê.
//
// Uso:  npm run i18n:gc:cards2
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("t('ui.cardx.")) {
  console.error('✗ A parte 14 JÁ foi migrada.');
  process.exit(1);
}

/** slug estável a partir do título (o id da carta tem uid() dentro) */
const slug = s => s.toLowerCase()
  .normalize('NFD').replace(/[̀-ͯ]/g, '')
  .replace(/[^a-z0-9]+/g, '-').replace(/^-|-$/g, '');

const RE = /title:\s*'([^']+)',\s*description:\s*`([^`]*)`/g;
const cartas = [...src.matchAll(RE)].map(m => ({
  titulo: m[1], desc: m[2], start: m.index, end: m.index + m[0].length,
}));

// ⚠ ARMADILHA (aconteceu de verdade): `[^`]*` para na PRIMEIRA crase, e
// uma descrição pode ter template ANINHADO:
//   `... ${wc > 0 ? `(${wc} already queued)` : ''}`
// Nesse caso o casamento termina no meio e a troca corta a linha ao meio.
// Se a descrição capturada tiver um ${ sem } fechado, é aninhamento —
// recusa e trate essa carta na mão.
for (const c of cartas) {
  const abre = (c.desc.match(/\$\{/g) ?? []).length;
  const fecha = (c.desc.match(/\}/g) ?? []).length;
  if (abre > fecha) {
    throw new Error(
      `descrição de "${c.titulo}" tem template ANINHADO — o regex cortaria ` +
      `a linha ao meio. Migre essa carta na mão (ver war-council no plano).`);
  }
}
console.log(`• ${cartas.length} cartas com descrição em template literal`);
if (!cartas.length) throw new Error('nenhuma casou — formato mudou?');

const chaves = {};
const edits = [];
const usados = new Set();

for (const c of cartas) {
  const id = slug(c.titulo);
  if (usados.has(id)) throw new Error(`dois títulos geram o mesmo slug: ${c.titulo}`);
  usados.add(id);

  // troca cada ${expr} por {{nome}} e guarda a expressão
  const vars = [];
  let i = 0;
  const valor = c.desc.replace(/\$\{([^}]*)\}/g, (_, expr) => {
    const nome = /^[A-Za-z_$][\w$]*$/.test(expr.trim()) ? expr.trim() : `v${i}`;
    i++;
    vars.push([nome, expr.trim()]);
    return `{{${nome}}}`;
  });

  chaves[`ui.cardx.${id}.title`] = c.titulo;
  chaves[`ui.cardx.${id}.description`] = valor;

  const objeto = vars.length ? `, { ${vars.map(([n, e]) => `${n}: ${e}`).join(', ')} }` : '';
  edits.push({
    start: c.start, end: c.end,
    text: `get title() { return t('ui.cardx.${id}.title'); }, ` +
          `get description() { return t('ui.cardx.${id}.description'${objeto}); }`,
  });
}

for (const e of edits.sort((a, b) => b.start - a.start)) {
  src = src.slice(0, e.start) + e.text + src.slice(e.end);
}

const comVar = Object.entries(chaves).filter(([k, v]) => k.endsWith('.description') && v.includes('{{'));
console.log(`• ${Object.keys(chaves).length} chaves (${comVar.length} descrições com valor calculado no meio)`);
console.log('  exemplo:', comVar[0]?.[1]?.slice(0, 80));

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcCards2', { textos: Object.entries(chaves) });
writeMigrated(SRC, src);
