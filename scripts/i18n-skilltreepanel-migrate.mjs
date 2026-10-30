// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-skilltreepanel-migrate.mjs
//
// PARTE 9: `components/panels/SkillTreePanel.tsx` — a árvore de perícias.
//
// Painel VIVO (o GameCanvas renderiza dentro da aba SKILLS). Ele não
// estava na lista original do plano; apareceu no levantamento de painéis
// vivos/mortos. Os DADOS (skillTrees.ts) já foram migrados na 2ª rodada —
// aqui é só a moldura da tela.
//
// Novidade do script: para texto em LINHA PRÓPRIA a troca é por regex
// `^(\s*)TEXTO$`, preservando a indentação que estiver lá. Nas partes
// anteriores eu escrevia os espaços na mão e errava a contagem toda hora.
//
// Uso:  npm run i18n:migrate:skilltreepanel
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/panels/SkillTreePanel.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ O SkillTreePanel JÁ está migrado.');
  process.exit(1);
}

const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/** Texto sozinho numa linha → vira {t('chave')} mantendo a indentação. */
function trocaLinha(key, texto) {
  const re = new RegExp(`^([ \\t]*)${escapar(texto)}[ \\t]*$`, 'gm');
  const achados = [...src.matchAll(re)];
  if (achados.length !== 1) throw new Error(`linha "${texto.slice(0, 45)}" aparece ${achados.length}x — esperava 1`);
  src = src.replace(re, `$1{t('${key}')}`);
  return texto;
}

/** Trecho exato (expressão, template, atributo). */
function trocaExata(key, de, para, valor) {
  const achados = src.split(de).length - 1;
  if (achados !== 1) throw new Error(`"${de.slice(0, 45)}" aparece ${achados}x — esperava 1`);
  src = src.split(de).join(para);
  return valor;
}

const chaves = {};

// ── texto em linha própria ────────────────────────────────────────────
for (const [key, texto] of [
  ['ui.skillTree.none',     'No skill tree available for this character.'],
  ['ui.skillTree.mastery',  'Mastery'],
  ['ui.skillTree.points',   'Skill Points'],
  ['ui.skillTree.pathA',    'Path A'],
  ['ui.skillTree.pathB',    'Path B'],
  ['ui.skillTree.hover',    'Hover a node to preview its effect.'],
  ['ui.skillTree.bonuses',  'Active Bonuses'],
  ['ui.skillTree.footnote', 'Skills reset each run · Mastery persists'],
]) chaves[key] = trocaLinha(key, texto);

// ── expressões ────────────────────────────────────────────────────────
chaves['ui.skillTree.maxLevel'] = trocaExata('ui.skillTree.maxLevel',
  "'✦ MAX LEVEL ✦'", "t('ui.skillTree.maxLevel')", '✦ MAX LEVEL ✦');

chaves['ui.skillTree.level'] = trocaExata('ui.skillTree.level',
  '`Level ${masteryLevel}`', "t('ui.skillTree.level', { n: masteryLevel })", 'Level {{n}}');

chaves['ui.skillTree.xpToLevel'] = trocaExata('ui.skillTree.xpToLevel',
  '{xpNeeded.toLocaleString()} XP to Level {masteryLevel + 1}',
  "{t('ui.skillTree.xpToLevel', { xp: xpNeeded.toLocaleString(), n: masteryLevel + 1 })}",
  '{{xp}} XP to Level {{n}}');

// o ↺ é decoração, fica fora da chave
chaves['ui.skillTree.reset'] = trocaExata('ui.skillTree.reset',
  '↺ Reset Points', "↺ {t('ui.skillTree.reset')}", 'Reset Points');

// ── import ────────────────────────────────────────────────────────────
const anchor = "import { MASTERY_XP_PER_LEVEL } from '../data/allies';\n";
if (!src.includes(anchor)) throw new Error('imports do SkillTreePanel mudaram — ajuste o script');
src = src.replace(anchor, anchor + "import { t } from '../../i18n';\n");

console.log(`• ${Object.keys(chaves).length} chaves`);
writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'skillTreePanel', { textos: Object.entries(chaves) });
writeMigrated(SRC, src);
