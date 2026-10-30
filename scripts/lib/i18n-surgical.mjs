// ══════════════════════════════════════════════════════════════════════
// scripts/lib/i18n-surgical.mjs
//
// Peças comuns da migração CIRÚRGICA (a que se usa em arquivo que tem
// lógica/JSX junto do texto: troca só os campos de texto e deixa o resto
// byte a byte igual).
//
// Nasceu do script do compendium.tsx, que continua com a cópia própria
// dele por já ter rodado. Arquivo novo: use ESTA lib.
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';

/**
 * Lê um literal de string a partir do índice da aspa de abertura.
 * Respeita escapes (\' \" \\), então `kingdom\'s` volta como `kingdom's`.
 * @returns { value, end } — end é o índice DEPOIS da aspa de fechamento.
 */
export function readString(src, start) {
  const quote = src[start];
  let value = '';
  for (let i = start + 1; i < src.length; i++) {
    const c = src[i];
    if (c === '\\') { value += src[i + 1]; i++; continue; }
    if (c === quote) return { value, end: i + 1 };
    if (c === '\n') throw new Error(`string não fechada perto de: ${src.slice(start, start + 60)}`);
    value += c;
  }
  throw new Error('string não fechada no fim do arquivo');
}

/**
 * Varre o fonte procurando `<campo>: '<texto>'` e agrupa por item,
 * começando um item novo a cada `<idField>`. Funciona com a formatação
 * torta (item numa linha só ou em várias, aspas simples e duplas).
 *
 * @param {string} src
 * @param {object} opts
 * @param {string[]} opts.fields      campos de texto a extrair
 * @param {string}   [opts.idField]   campo que abre um item (default 'id')
 * @returns itens: { id, <campo>: valor, spans: { <campo>: {start, end} } }
 */
export function scanItems(src, { fields, idField = 'id' }) {
  const re = new RegExp(`\\b(${idField}|${fields.join('|')})\\s*:\\s*(?=['"])`, 'g');
  const items = [];
  let current = null;

  for (const m of src.matchAll(re)) {
    const field = m[1];
    const { value, end } = readString(src, m.index + m[0].length);

    if (field === idField) {
      current = { id: value, spans: {} };
      items.push(current);
      continue;
    }
    if (!current) throw new Error(`campo '${field}' antes de qualquer ${idField}`);
    if (current[field] !== undefined) throw new Error(`'${field}' duplicado em '${current.id}'`);
    current[field] = value;
    current.spans[field] = { start: m.index, end };
  }

  const dupes = items.map(i => i.id).filter((id, i, a) => a.indexOf(id) !== i);
  if (dupes.length) throw new Error(`ids duplicados: ${[...new Set(dupes)].join(', ')}`);

  return items;
}

/**
 * Acha o bloco de um export, do delimitador de abertura ao casado.
 * Procura o delimitador DEPOIS do '=' — senão o '[' de "Foo[]" na
 * anotação de tipo engana o extrator (bug pego no piloto do bestiary).
 * @returns { start, end } — end é o índice DEPOIS do fechamento.
 */
export function findBlock(src, marker, open, close) {
  const i = src.indexOf(marker);
  if (i === -1) throw new Error(`marcador não encontrado: ${marker}`);
  const eq = src.indexOf('=', i);
  const start = src.indexOf(open, eq);
  let d = 0;
  for (let k = start; k < src.length; k++) {
    if (src[k] === open) d++;
    else if (src[k] === close) { d--; if (d === 0) return { start, end: k + 1 }; }
  }
  throw new Error(`bloco não fechado: ${marker}`);
}

/** Próximo `campo: '...'` a partir de `from`, sem passar de `limit`. */
export function findField(src, nome, from, limit) {
  const re = new RegExp(`\\b${nome}\\s*:\\s*(?=['"])`, 'g');
  re.lastIndex = from;
  const m = re.exec(src);
  if (!m || m.index >= limit) return null;
  const { value, end } = readString(src, m.index + m[0].length);
  return { value, start: m.index, end };
}

/** Troca os trechos no fonte, de trás pra frente (índices não saem do lugar). */
export function applyEdits(src, edits) {
  for (const e of [...edits].sort((a, b) => b.start - a.start)) {
    src = src.slice(0, e.start) + e.text + src.slice(e.end);
  }
  return src;
}

/**
 * Grava as chaves novas no en.json e propaga pros outros locales,
 * preservando o que já foi traduzido.
 */
export function writeLocales(root, novasChaves) {
  const dir = path.join(root, 'i18n/locales');
  const enPath = path.join(dir, 'en.json');
  const en = JSON.parse(fs.readFileSync(enPath, 'utf8'));
  const before = Object.keys(en).length;

  // Colisao de namespace: dois arquivos gerando a mesma chave sobrescreveria
  // texto em silencio. Melhor estourar aqui.
  const colisoes = Object.keys(novasChaves).filter(k => k in en);
  if (colisoes.length) {
    throw new Error(
      `${colisoes.length} chave(s) ja existem no en.json (namespace colidindo): ` +
      colisoes.slice(0, 5).join(', '),
    );
  }
  Object.assign(en, novasChaves);
  fs.writeFileSync(enPath, JSON.stringify(en, null, 2) + '\n');
  console.log(`• en.json: ${before} → ${Object.keys(en).length} chaves (+${Object.keys(en).length - before})`);

  for (const locale of ['pt-BR', 'zh-CN']) {
    const p = path.join(dir, `${locale}.json`);
    const existing = JSON.parse(fs.readFileSync(p, 'utf8'));
    const out = {};
    let kept = 0;
    for (const k of Object.keys(en)) {
      out[k] = existing[k] ?? '';        // '' = não traduzido → cai no inglês
      if (out[k]) kept++;
    }
    fs.writeFileSync(p, JSON.stringify(out, null, 2) + '\n');
    console.log(`• ${locale}.json: ${Object.keys(out).length} chaves (${kept} traduzidas)`);
  }
}

/** Snapshot do texto original, pro i18n-verify comparar depois. */
export function saveSnapshot(root, nome, dados) {
  const dir = path.join(root, 'scripts/.snapshots');
  fs.mkdirSync(dir, { recursive: true });
  fs.writeFileSync(path.join(dir, `${nome}.original.json`), JSON.stringify(dados, null, 2) + '\n');
}

/** Grava o arquivo migrado, guardando o original em .pre-i18n.bak. */
export function writeMigrated(srcPath, content) {
  const backup = srcPath + '.pre-i18n.bak';
  if (!fs.existsSync(backup)) fs.copyFileSync(srcPath, backup);
  fs.writeFileSync(srcPath, content);
  console.log(`✓ ${path.basename(srcPath)} migrado (backup em ${path.basename(backup)})`);
}
