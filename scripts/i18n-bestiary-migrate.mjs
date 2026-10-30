// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-bestiary-migrate.mjs
//
// Migra components/data/bestiary.ts para o sistema de i18n:
//   1. lê o arquivo ORIGINAL (texto cravado em inglês) e extrai os dados;
//   2. gera/atualiza i18n/locales/en.json (fonte da verdade);
//   3. propaga as chaves para pt-BR.json e zh-CN.json (valores vazios =
//      fallback pro inglês), preservando traduções já feitas;
//   4. guarda um snapshot do original em scripts/.snapshots/ para o
//      script de verificação comparar depois;
//   5. reescreve o .ts usando getters + t().
//
// Uso:  node scripts/i18n-bestiary-migrate.mjs [caminho-do-original]
// Rodar de novo em cima do arquivo JÁ migrado não funciona (e o script
// avisa) — passe o backup .pre-i18n.bak se precisar refazer.
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC_TS    = process.argv[2] ?? path.join(ROOT, 'components/data/bestiary.ts');
const LOCALES   = path.join(ROOT, 'i18n/locales');
const SNAPSHOTS = path.join(ROOT, 'scripts/.snapshots');

// ─── Extração (núcleo validado no piloto) ─────────────────────────────
// ATENÇÃO ao bug já resolvido: procurar o delimitador DEPOIS do '=',
// senão o extrator confunde com o '[]' de "BestiaryEntry[]".
function grabLiteral(marker, src, open, close) {
  const i = src.indexOf(marker);
  if (i === -1) throw new Error(`marcador não encontrado: ${marker}`);
  const eq = src.indexOf('=', i);           // <- essencial
  const s  = src.indexOf(open, eq);
  let d = 0, e = -1;
  for (let k = s; k < src.length; k++) {
    const c = src[k];
    if (c === open) d++;
    else if (c === close) { d--; if (d === 0) { e = k; break; } }
  }
  if (e === -1) throw new Error(`literal não fechado: ${marker}`);
  return src.slice(s, e + 1);
}
const grabObject = (m, s) => grabLiteral(m, s, '{', '}');
const grabArray  = (m, s) => grabLiteral(m, s, '[', ']');

const source = fs.readFileSync(SRC_TS, 'utf8');
if (source.includes("from '../../i18n'")) {
  console.error('✗ Este bestiary.ts JÁ está migrado. Passe o backup .pre-i18n.bak como argumento.');
  process.exit(1);
}

// eval() funciona porque os literais só têm strings/objetos, sem variáveis.
const ENEMY_NAMES = eval(`(${grabObject('ENEMY_NAMES', source)})`);
const BESTIARY    = eval(`(${grabArray('BESTIARY', source)})`);

console.log(`• ${Object.keys(ENEMY_NAMES).length} nomes de inimigos`);
console.log(`• ${BESTIARY.length} entradas de bestiário`);

// ─── Stats compartilhados (otimização do plano) ───────────────────────
// 'Low' aparece dezenas de vezes: vira UMA chave stat.low, traduzida uma
// vez só, em vez de repetir a mesma tradução em cada entrada.
const statSlug = v => String(v).trim().toLowerCase().replace(/[^a-z0-9]+/g, '_');
const STAT_VALUES = new Map();               // slug -> texto em inglês
for (const e of BESTIARY) {
  for (const v of [e.hp, e.dmg, e.speed]) {
    const slug = statSlug(v);
    const prev = STAT_VALUES.get(slug);
    if (prev !== undefined && prev !== v) throw new Error(`colisão de slug de stat: ${slug}`);
    STAT_VALUES.set(slug, v);
  }
}
console.log(`• ${STAT_VALUES.size} valores de stat distintos (chaves compartilhadas)`);

// ─── Montagem do en.json ──────────────────────────────────────────────
const en = {};
for (const [slug, text] of [...STAT_VALUES].sort()) en[`stat.${slug}`] = text;
for (const [type, name] of Object.entries(ENEMY_NAMES)) en[`enemy.${type}.name`] = name;
for (const e of BESTIARY) {
  en[`bestiary.${e.type}.name`]  = e.name;
  en[`bestiary.${e.type}.title`] = e.title;
  en[`bestiary.${e.type}.wave`]  = e.wave;
  en[`bestiary.${e.type}.lore`]  = e.lore;
  e.abilities.forEach((ab, i) => { en[`bestiary.${e.type}.ability.${i}`] = ab; });
}
console.log(`• ${Object.keys(en).length} chaves no en.json`);

// Confere que as chaves do piloto não mudaram de valor.
const enPath = path.join(LOCALES, 'en.json');
if (fs.existsSync(enPath)) {
  const old = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const changed = Object.keys(old).filter(k => k in en && old[k] !== en[k]);
  const dropped = Object.keys(old).filter(k => !(k in en));
  if (changed.length) console.warn(`  ⚠ ${changed.length} chave(s) mudaram de valor:`, changed.slice(0, 5));
  if (dropped.length) console.warn(`  ⚠ ${dropped.length} chave(s) sumiram:`, dropped.slice(0, 5));
  if (!changed.length && !dropped.length) console.log('  ✓ compatível com o en.json anterior');
}
fs.mkdirSync(LOCALES, { recursive: true });
fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');

// ─── pt-BR / zh-CN: mesmas chaves, traduções preservadas ──────────────
for (const locale of ['pt-BR', 'zh-CN']) {
  const p = path.join(LOCALES, `${locale}.json`);
  const existing = fs.existsSync(p) ? JSON.parse(fs.readFileSync(p, 'utf8')) : {};
  const out = {};
  let kept = 0;
  for (const k of Object.keys(en)) {
    out[k] = existing[k] ?? '';           // '' = não traduzido → cai no inglês
    if (out[k]) kept++;
  }
  fs.writeFileSync(p, JSON.stringify(out, null, 2) + '\n');
  console.log(`• ${locale}.json: ${Object.keys(out).length} chaves (${kept} traduzidas)`);
}

// ─── Snapshot do original (para o script de verificação) ──────────────
fs.mkdirSync(SNAPSHOTS, { recursive: true });
fs.writeFileSync(
  path.join(SNAPSHOTS, 'bestiary.original.json'),
  JSON.stringify({ ENEMY_NAMES, BESTIARY }, null, 2) + '\n',
);

// ─── Reescrita do .ts ─────────────────────────────────────────────────
const q = s => `'${String(s).replace(/\\/g, '\\\\').replace(/'/g, "\\'")}'`;
const statUnion = [...STAT_VALUES.keys()].sort().map(q).join(' | ');
const pad = (s, n) => s + ' '.repeat(Math.max(0, n - s.length));

const entryLines = BESTIARY.map(e =>
  `  entry(${pad(q(e.type) + ',', 20)} ${pad(q(e.threat) + ',', 10)} ` +
  `${pad(q(statSlug(e.hp)) + ',', 18)} ${pad(q(statSlug(e.dmg)) + ',', 18)} ${q(statSlug(e.speed))}),`
).join('\n');

const namesLines = Object.keys(ENEMY_NAMES).map(t => `  ${q(t)},`).join('\n');

const BT = '`';   // crase, para não brigar com o template literal deste script
const ts = `// ══════════════════════════════════════════════════════════════════════
// data/bestiary.ts
// Nomes de inimigos e bestiário completo (lore, habilidades, ameaça).
// Sem dependência de React ou canvas.
//
// i18n: TODO texto vem do i18n (ver plano/I18N_PLANO.md). Os campos são
// GETTERS — resolvem t() na hora do render, não no load do módulo, para
// que a troca de idioma valha na hora, sem recarregar o jogo.
// O inglês continua sendo a fonte da verdade: i18n/locales/en.json.
//
// GERADO por scripts/i18n-bestiary-migrate.mjs — para mexer no TEXTO,
// edite o en.json, não este arquivo.
// ══════════════════════════════════════════════════════════════════════

import { t, tList } from '../../i18n';

// ---------------------------------------------------------------------------
// Tipos
// ---------------------------------------------------------------------------

export type ThreatLevel = 'low' | 'medium' | 'high' | 'boss';

/** Valores de stat compartilhados — traduzidos uma vez em 'stat.<slug>'. */
export type StatKey = ${statUnion};

export interface BestiaryEntry {
  type:      string;
  name:      string;
  title:     string;
  wave:      string;
  hp:        string;
  dmg:       string;
  speed:     string;
  threat:    ThreatLevel;
  lore:      string;
  abilities: string[];
}

// ---------------------------------------------------------------------------
// Enemy display names (usados em toasts, tooltips, run history)
// ---------------------------------------------------------------------------

export const ENEMY_TYPES = [
${namesLines}
] as const;

/** Record<type, nome traduzido>. Tipo desconhecido devolve undefined,
 *  igual ao objeto literal de antes. */
export const ENEMY_NAMES: Record<string, string> = Object.defineProperties(
  {},
  Object.fromEntries(
    ENEMY_TYPES.map(type => [type, {
      enumerable: true,
      get: () => t(${BT}enemy.\${type}.name${BT}),
    }]),
  ),
) as Record<string, string>;

// ---------------------------------------------------------------------------
// Bestiário
// ---------------------------------------------------------------------------

function entry(type: string, threat: ThreatLevel, hp: StatKey, dmg: StatKey, speed: StatKey): BestiaryEntry {
  return {
    type,
    threat,
    get name()      { return t(${BT}bestiary.\${type}.name${BT});  },
    get title()     { return t(${BT}bestiary.\${type}.title${BT}); },
    get wave()      { return t(${BT}bestiary.\${type}.wave${BT});  },
    get lore()      { return t(${BT}bestiary.\${type}.lore${BT});  },
    get abilities() { return tList(${BT}bestiary.\${type}.ability${BT}); },
    get hp()        { return t(${BT}stat.\${hp}${BT});    },
    get dmg()       { return t(${BT}stat.\${dmg}${BT});   },
    get speed()     { return t(${BT}stat.\${speed}${BT}); },
  };
}

//        type                 threat     hp                 dmg                speed
export const BESTIARY: BestiaryEntry[] = [
${entryLines}
];
`;

const backup = SRC_TS + '.pre-i18n.bak';
if (!fs.existsSync(backup)) fs.copyFileSync(SRC_TS, backup);
fs.writeFileSync(path.join(ROOT, 'components/data/bestiary.ts'), ts);
console.log(`✓ components/data/bestiary.ts reescrito (backup em ${path.basename(backup)})`);
