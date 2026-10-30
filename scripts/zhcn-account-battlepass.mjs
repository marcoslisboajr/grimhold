// Gera account.reward.*.label e battlepass.level.*.label reaproveitando as
// traduções já feitas em title.*, relic.*.name e avatar.*.name — evita
// reinventar "Novice Guardian" duas vezes com texto potencialmente diferente.
import fs from 'node:fs';

const en = JSON.parse(fs.readFileSync('i18n/locales/en.json', 'utf8'));
const zh = JSON.parse(fs.readFileSync('i18n/locales/zh-CN.json', 'utf8'));

const saida = {};
const erros = [];

// ── account.reward.<n>.label ──
for (const k of Object.keys(en)) {
  if (!k.startsWith('account.reward.') || !k.endsWith('.label')) continue;
  const v = en[k];
  let m;
  if ((m = v.match(/^\+(\d+) Essence$/))) {
    saida[k] = `+${m[1]} 精华`;
  } else if ((m = v.match(/^Title: (.+)$/))) {
    // acha o título correspondente em title.*.name pelo texto em inglês
    const tKey = Object.keys(en).find(tk => tk.startsWith('title.') && en[tk] === m[1]);
    if (!tKey || !zh[tKey]) { erros.push(`${k}: não achei título zh para "${m[1]}"`); continue; }
    saida[k] = `称号：${zh[tKey]}`;
  } else if ((m = v.match(/^New Relic: (.+)$/))) {
    const rKey = Object.keys(en).find(rk => rk.startsWith('relic.') && rk.endsWith('.name') && en[rk] === m[1]);
    if (!rKey || !zh[rKey]) { erros.push(`${k}: não achei relíquia zh para "${m[1]}"`); continue; }
    saida[k] = `新遗物：${zh[rKey]}`;
  } else {
    erros.push(`${k}: padrão não reconhecido: "${v}"`);
  }
}

// ── battlepass.level.<n>.label ──
for (const k of Object.keys(en)) {
  if (!k.startsWith('battlepass.level.') || !k.endsWith('.label')) continue;
  const v = en[k];
  let m;
  if ((m = v.match(/^\+(\d+) Essence$/))) {
    saida[k] = `+${m[1]} 精华`;
  } else if ((m = v.match(/^Title: (.+)$/))) {
    const tKey = Object.keys(en).find(tk => tk.startsWith('title.') && en[tk] === m[1]);
    if (!tKey || !zh[tKey]) { erros.push(`${k}: não achei título zh para "${m[1]}"`); continue; }
    saida[k] = `称号：${zh[tKey]}`;
  } else if ((m = v.match(/^Card: (.+)$/))) {
    // cartas do battle pass: reaproveita shop.bp_*.title (já traduzido)
    const sKey = Object.keys(en).find(sk => sk.startsWith('shop.bp_') && sk.endsWith('.title') && en[sk] === m[1]);
    if (!sKey || !zh[sKey]) { erros.push(`${k}: não achei carta zh para "${m[1]}"`); continue; }
    saida[k] = `卡牌：${zh[sKey]}`;
  } else if ((m = v.match(/^Avatar: (.+)$/))) {
    const aKey = Object.keys(en).find(ak => ak.startsWith('avatar.') && ak.endsWith('.name') && en[ak] === m[1]);
    if (!aKey || !zh[aKey]) { erros.push(`${k}: não achei avatar zh para "${m[1]}"`); continue; }
    saida[k] = `头像：${zh[aKey]}`;
  } else if (k === 'battlepass.level.30.label') {
    // caso especial, composto — traduzido à mão
    saida[k] = '🃏 解锁英雄：Ming（弄臣）+ 称号：最后的Grimhold + 1000精华';
  } else {
    erros.push(`${k}: padrão não reconhecido: "${v}"`);
  }
}

if (erros.length) {
  console.error('Erros:');
  erros.forEach(e => console.error('  ' + e));
  process.exit(1);
}

fs.writeFileSync('traducoes/zhcn-account-battlepass.json', JSON.stringify(saida, null, 2) + '\n');
console.log('gerado com', Object.keys(saida).length, 'chaves');
