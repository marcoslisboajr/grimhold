// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-runhistory-migrate.mjs
//
// Migra components/panels/RunHistoryPanel.tsx — histórico de runs.
// Painel VIVO (GameCanvas.tsx:15390 renderiza).
//
//   ui.runHistory.diff.<key>  / .mode.<key> / .hero.<key>   (Records)
//   ui.runHistory.*                                          (moldura)
//
// Fica de fora, de propósito:
//   • MODE_COLOR e HERO_ICON — cor e emoji, não texto.
//   • `run.allies` — nomes que vêm do SAVE, não do código.
//   • dur() — formato "12m05s"; virar chave só faria sentido junto de uma
//     revisão de formatação de tempo, não agora.
//
// Uso:  npm run i18n:migrate:runhistory
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBlock, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/panels/RunHistoryPanel.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ RunHistoryPanel.tsx JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

const chaves = {};
const edits = [];

// ─── 1. Os três Records de rótulo ─────────────────────────────────────
const RECORDS = [
  { nome: 'DIFF_LABEL', prefixo: 'diff' },
  { nome: 'MODE_LABEL', prefixo: 'mode' },
  { nome: 'HERO_LABEL', prefixo: 'hero' },
];

for (const rec of RECORDS) {
  const b = findBlock(src, `const ${rec.nome}`, '{', '}');
  const PAR_RE = /([A-Za-z_][A-Za-z0-9_]*):\s*'((?:[^'\\]|\\.)*)'/g;
  PAR_RE.lastIndex = b.start;

  let n = 0;
  for (let m; (m = PAR_RE.exec(src)) && m.index < b.end; ) {
    const [todo, campo, valor] = m;
    const chave = `ui.runHistory.${rec.prefixo}.${campo}`;
    chaves[chave] = valor.replace(/\\(['"\\])/g, '$1');
    edits.push({ start: m.index, end: m.index + todo.length, text: `get ${campo}() { return t('${chave}'); }` });
    n++;
  }
  console.log(`• ${rec.nome}: ${n} rótulos`);
}

// ─── 2. Moldura e rótulos soltos no JSX ───────────────────────────────
// `de` é o trecho exato no fonte; `para` é o que entra no lugar.
const MOLDURA = [
  // texto filho de JSX
  { key: 'title',      de: '>Run History<',                          para: ">{t('ui.runHistory.title')}<",              valor: 'Run History' },
  { key: 'empty',      de: '>No runs recorded yet<',                  para: ">{t('ui.runHistory.empty')}<",              valor: 'No runs recorded yet' },
  { key: 'emptyHint',  de: '>Complete a game to see your history here<', para: ">{t('ui.runHistory.emptyHint')}<",       valor: 'Complete a game to see your history here' },
  { key: 'latest',     de: '>latest<',                                para: ">{t('ui.runHistory.latest')}<",             valor: 'latest' },
  { key: 'noAllies',   de: '>no allies<',                             para: ">{t('ui.runHistory.noAllies')}<",           valor: 'no allies' },
  // literais dentro de expressão
  { key: 'victory',    de: "'Victory'",                               para: "t('ui.runHistory.victory')",                valor: 'Victory' },
  { key: 'wave',       de: "'Wave'",                                  para: "t('ui.runHistory.wave')",                   valor: 'Wave' },
  { key: 'heroFallback', de: "'Hero'",                                para: "t('ui.runHistory.heroFallback')",           valor: 'Hero' },
  // rótulos dos cartões de resumo
  { key: 'winRate',    de: "label: 'Win Rate'",                       para: "get label() { return t('ui.runHistory.winRate'); }",   valor: 'Win Rate' },
  { key: 'bestWave',   de: "label: 'Best Wave'",                      para: "get label() { return t('ui.runHistory.bestWave'); }",  valor: 'Best Wave' },
  { key: 'bestScore',  de: "label: 'Best Score'",                     para: "get label() { return t('ui.runHistory.bestScore'); }", valor: 'Best Score' },
  { key: 'bestDmg',    de: "label: 'Best Dmg'",                       para: "get label() { return t('ui.runHistory.bestDmg'); }",   valor: 'Best Dmg' },
  { key: 'avgKills',   de: "label: 'Avg Kills'",                      para: "get label() { return t('ui.runHistory.avgKills'); }",  valor: 'Avg Kills' },
  // rótulos do <Stat>
  { key: 'score',      de: 'label="Score"',                           para: "label={t('ui.runHistory.score')}",          valor: 'Score' },
  { key: 'kills',      de: 'label="Kills"',                           para: "label={t('ui.runHistory.kills')}",          valor: 'Kills' },
  { key: 'duration',   de: 'label="Duration"',                        para: "label={t('ui.runHistory.duration')}",       valor: 'Duration' },
  { key: 'damage',     de: 'label="Damage"',                          para: "label={t('ui.runHistory.damage')}",         valor: 'Damage' },
  { key: 'gold',       de: 'label="Gold"',                            para: "label={t('ui.runHistory.gold')}",           valor: 'Gold' },
  { key: 'diff',       de: 'label="Diff"',                            para: "label={t('ui.runHistory.diff')}",           valor: 'Diff' },
];

for (const item of MOLDURA) {
  const achados = [...src.matchAll(new RegExp(item.de.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'), 'g'))];
  if (achados.length !== 1) throw new Error(`"${item.de}" aparece ${achados.length}x — esperava 1`);
  chaves[`ui.runHistory.${item.key}`] = item.valor;
  edits.push({ start: achados[0].index, end: achados[0].index + item.de.length, text: item.para });
}
console.log(`• ${MOLDURA.length} textos da moldura`);

// ─── Chaves + snapshot ────────────────────────────────────────────────
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'runHistory', { textos: Object.entries(chaves) });

// ─── Troca cirúrgica + import ─────────────────────────────────────────
src = applyEdits(src, edits);

const anchor = /(^import .*\n)(?![\s\S]*^import )/m;
if (!anchor.test(src)) throw new Error('não achei onde pôr o import');
src = src.replace(anchor, `$1import { t } from '../../i18n';\n`);

writeMigrated(SRC, src);
