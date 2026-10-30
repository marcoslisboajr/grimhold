// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-battlepass-migrate.mjs
//
// Migra components/data/battlePass.ts — PARCIALMENTE, de propósito.
//
// MIGRA:
//   • SEASON_META.season1.name / .subtitle → season.season1.*        (2)
//   • BATTLE_PASS_LEVELS[].reward.label    → battlepass.level.<n>.label (30)
//
// NÃO MIGRA (REGRA DE OURO — texto que é identificador):
//   • `reward.title` (11) — mesmíssimo caso do account.ts:
//     getUnlockedBPTitles() devolve essas STRINGS e elas vão parar em
//     profile.unlockedPassTitles, que é gravado no save. Traduzir agora
//     quebraria perfil antigo. Some junto com o refactor de títulos.
//
// NÃO MIGRA (código morto duplicado):
//   • BP_SEASON1_CARDS — os mesmos 5 cards existem em
//     shopPools.POOL_SEASON1_CARDS (esses SIM usados pelo jogo e já
//     migrados, chaves 'shop.bp_*'). O objeto daqui não é importado por
//     ninguém fora deste arquivo. Traduzir seria duplicar trabalho do
//     tradutor; o certo é apagar a cópia morta — decisão do Marcos.
//
// Uso:  npm run i18n:migrate:battlepass
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBlock, findField, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/data/battlePass.ts');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ battlePass.ts JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

const chaves = {};
const edits = [];

// ─── 1. SEASON_META ───────────────────────────────────────────────────
const bMeta = findBlock(src, 'export const SEASON_META', '{', '}');
const meta = {};
for (const f of ['name', 'subtitle']) {
  const campo = findField(src, f, bMeta.start, bMeta.end);
  if (!campo) throw new Error(`SEASON_META sem ${f}`);
  meta[f] = campo.value;
  chaves[`season.season1.${f}`] = campo.value;
  edits.push({ start: campo.start, end: campo.end, text: `get ${f}() { return t('season.season1.${f}'); }` });
}
console.log(`• SEASON_META: ${meta.name} — ${meta.subtitle}`);

// ─── 2. BATTLE_PASS_LEVELS — o "id" é o número do nível ───────────────
const bLev = findBlock(src, 'export const BATTLE_PASS_LEVELS', '[', ']');
const LEVEL_RE = /\{\s*level:\s*(\d+),/g;
LEVEL_RE.lastIndex = bLev.start;

const niveis = [];
for (let m; (m = LEVEL_RE.exec(src)) && m.index < bLev.end; ) {
  niveis.push({ level: m[1], start: m.index });
}
console.log(`• ${niveis.length} níveis de passe`);

niveis.forEach((n, i) => {
  const limit = niveis[i + 1]?.start ?? bLev.end;
  const label = findField(src, 'label', n.start, limit);
  if (!label) throw new Error(`nível ${n.level} sem label`);
  n.label = label.value;
  chaves[`battlepass.level.${n.level}.label`] = label.value;
  edits.push({ start: label.start, end: label.end, text: `get label() { return t('battlepass.level.${n.level}.label'); }` });
});

// Sanidade: os `title` das recompensas TÊM que continuar intactos.
// (?<![A-Za-z]) evita casar com o final de "subtitle:"; e cada aspa tem a
// sua própria classe, senão "Grimhold's Chosen" (aspa dupla com apóstrofo
// dentro) escapa da checagem.
const TITULO_RE = /(?<![A-Za-z])title:\s*(?:'((?:[^'\\]|\\.)*)'|"((?:[^"\\]|\\.)*)")/g;
const lerTitulos = txt => [...txt.matchAll(TITULO_RE)].map(m => m[1] ?? m[2]);
const titulosAntes = lerTitulos(src);
console.log(`  ✓ ${titulosAntes.length} 'title' de recompensa preservados em inglês (identificador de save)`);

// ─── Chaves + snapshot ────────────────────────────────────────────────
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);

saveSnapshot(ROOT, 'battlePass', {
  season: meta,
  niveis: niveis.map(n => ({ level: Number(n.level), label: n.label })),
  titulos: titulosAntes,
});

// ─── Troca cirúrgica ──────────────────────────────────────────────────
src = applyEdits(src, edits);

const titulosDepois = lerTitulos(src);
if (JSON.stringify(titulosAntes) !== JSON.stringify(titulosDepois)) {
  throw new Error('os títulos de recompensa foram alterados — isso quebraria save antigo');
}

// ─── import do t() + cabeçalho ────────────────────────────────────────
const header = `// data/battlePass.ts
// Season 1: The Grimhold Awakening — free battle pass system.
// No React/canvas dependencies — pure data + persistence.
// ══════════════════════════════════════════════════════════════════════
`;
if (!src.includes(header)) throw new Error('cabeçalho do battlePass.ts mudou — ajuste o script');
src = src.replace(header, `// data/battlePass.ts
// Season 1: The Grimhold Awakening — passe de batalha gratuito.
// Sem React/canvas — dados puros + persistência.
//
// i18n PARCIAL: 'name'/'subtitle' da season e o 'label' de cada nível vêm
// do i18n ('season.season1.*' e 'battlepass.level.<n>.label').
// O 'title' das recompensas continua em INGLÊS CRAVADO de propósito:
// getUnlockedBPTitles() devolve essa string e ela vai pro save
// (profile.unlockedPassTitles). Mesmo caso do ACCOUNT_TITLES.
// BP_SEASON1_CARDS também não foi traduzido: é cópia morta do
// shopPools.POOL_SEASON1_CARDS (esse sim usado, já migrado).
// ══════════════════════════════════════════════════════════════════════
`);

const anchor = "import { storage } from '../systems/storage';\n";
if (!src.includes(anchor)) throw new Error('import do storage sumiu — ajuste o script');
src = src.replace(anchor, anchor + "import { t } from '../../i18n';\n");

writeMigrated(SRC, src);
