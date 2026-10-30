// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-account-migrate.mjs
//
// Migra components/data/account.ts — PARCIALMENTE, de propósito.
//
// MIGRA:
//   • ACCOUNT_LEVEL_REWARDS[n].label  → account.reward.<n>.label   (50)
//   • AVATAR_DEFS[].name              → avatar.<id>.name           (22)
//
// NÃO MIGRA (e não é esquecimento):
//   • ACCOUNT_TITLES / AccountReward.title — esses textos são gravados
//     NO SAVE (`profile.unlockedTitles`, `profile.equippedTitle`) e
//     comparados como identificador:
//       if (reward.title && !unlockedTitles.includes(reward.title))
//     Traduzir agora quebraria save antigo: o título viria em português,
//     não bateria com o inglês salvo, e seria concedido de novo / o
//     equipado deixaria de casar. Precisa antes trocar o save para
//     guardar um ID (ex.: o nível) e traduzir só na hora de exibir.
//   • AvatarDef.rarity — é CHAVE de RARITY_COLOR[av.rarity]. Traduzir
//     quebraria a cor. Vira chave compartilhada ('rarity.common'...) na
//     hora de migrar o GameCanvas, igual foi feito com os 'stat.*'.
//
// Uso:  npm run i18n:migrate:account
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { findBlock, findField, applyEdits, writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/data/account.ts');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("from '../../i18n'")) {
  console.error('✗ account.ts JÁ está migrado. Restaure o .pre-i18n.bak se quiser refazer.');
  process.exit(1);
}

const chaves = {};
const edits = [];

// ─── 1. ACCOUNT_LEVEL_REWARDS — a "id" é o NÚMERO do nível ────────────
const bRew = findBlock(src, 'export const ACCOUNT_LEVEL_REWARDS', '{', '}');
const NIVEL_RE = /^ {2}(\d+):\s*\{/gm;
NIVEL_RE.lastIndex = bRew.start;

const rewards = [];
for (let m; (m = NIVEL_RE.exec(src)) && m.index < bRew.end; ) {
  rewards.push({ level: m[1], start: m.index });
}
console.log(`• ${rewards.length} níveis de recompensa`);

rewards.forEach((r, i) => {
  const limit = rewards[i + 1]?.start ?? bRew.end;
  const label = findField(src, 'label', r.start, limit);
  if (!label) throw new Error(`nível ${r.level} sem label`);
  r.label = label.value;
  chaves[`account.reward.${r.level}.label`] = label.value;
  edits.push({ start: label.start, end: label.end, text: `get label() { return t('account.reward.${r.level}.label'); }` });
});

// ─── 2. AVATAR_DEFS — id + name ───────────────────────────────────────
const bAv = findBlock(src, 'export const AVATAR_DEFS', '[', ']');
const ID_RE = /\bid\s*:\s*(?=['"])/g;
ID_RE.lastIndex = bAv.start;

const avatares = [];
for (let m; (m = ID_RE.exec(src)) && m.index < bAv.end; ) {
  const campo = findField(src, 'id', m.index, bAv.end);
  avatares.push({ id: campo.value, start: m.index, afterId: campo.end });
  ID_RE.lastIndex = campo.end;
}
console.log(`• ${avatares.length} avatares`);

avatares.forEach((av, i) => {
  const limit = avatares[i + 1]?.start ?? bAv.end;
  const nome = findField(src, 'name', av.afterId, limit);
  if (!nome) throw new Error(`avatar '${av.id}' sem name`);
  av.name = nome.value;
  chaves[`avatar.${av.id}.name`] = nome.value;
  edits.push({ start: nome.start, end: nome.end, text: `get name() { return t('avatar.${av.id}.name'); }` });
});

// ─── Chaves + snapshot ────────────────────────────────────────────────
console.log(`• ${Object.keys(chaves).length} chaves novas`);
writeLocales(ROOT, chaves);

saveSnapshot(ROOT, 'account', {
  rewards:  rewards.map(r => ({ level: Number(r.level), label: r.label })),
  avatares: avatares.map(a => ({ id: a.id, name: a.name })),
});

// ─── Troca cirúrgica ──────────────────────────────────────────────────
src = applyEdits(src, edits);

// ─── import do t() + cabeçalho ────────────────────────────────────────
const header = `// data/account.ts
// Extracted from GameCanvas.tsx — account level system, titles,
// avatars, rewards and profile persistence functions.
// No React or canvas dependency.
// ══════════════════════════════════════════════════════════════════════
`;
if (!src.includes(header)) throw new Error('cabeçalho do account.ts mudou — ajuste o script');
src = src.replace(header, `// data/account.ts
// Nível de conta, títulos, avatares, recompensas e persistência do
// perfil. Extraído do GameCanvas.tsx.
//
// i18n PARCIAL: 'label' das recompensas e 'name' dos avatares vêm do
// i18n (chaves 'account.reward.<n>.label' e 'avatar.<id>.name').
// ACCOUNT_TITLES e AccountReward.title continuam em INGLÊS CRAVADO de
// propósito: esse texto é gravado no save e comparado como identificador
// (profile.unlockedTitles / equippedTitle). Traduzir sem antes trocar o
// save para guardar um ID quebraria perfil antigo. Mesma coisa com
// AvatarDef.rarity, que é chave de RARITY_COLOR.
// ══════════════════════════════════════════════════════════════════════
`);

const anchor = "import { storage } from '../systems/storage';\n";
if (!src.includes(anchor)) throw new Error('import do storage sumiu — ajuste o script');
src = src.replace(anchor, anchor + "import { t } from '../../i18n';\n");

writeMigrated(SRC, src);
