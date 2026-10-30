// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-bestiary.mjs
//
// GameCanvas.tsx — PARTE 2: a tela do Bestiário.
// Mesmo método da parte 1: recorta o bloco e só mexe ali dentro.
//
// Fecha o domínio do bestiary.ts (dados migrados na 1ª rodada) e traz as
// CHAVES COMPARTILHADAS DE AMEAÇA — 'threat.low/medium/high/boss' — que
// o plano já previa: o dado continua sendo o id ('low'), e a palavra
// ("Weak") vira chave, traduzida uma vez só.
//
// Interpolação: usa {{n}} de propósito, NÃO {{count}} — 'count' liga o
// mecanismo de plural do i18next, que procuraria 'chave_other' e não
// acharia nada (as chaves aqui são planas).
//
// Uso:  npm run i18n:gc:bestiary
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{showBestiary && (';
const FIM    = '{/* DEBUG BUTTONS';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco do Bestiário');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.bestiary.")) {
  console.error('✗ A tela do Bestiário JÁ está migrada.');
  process.exit(1);
}

// chave | texto exato | substituto | vezes | valor em inglês (quando difere do texto)
const TROCAS = [
  ['ui.bestiary.title',     '>Bestiary<',                 ">{t('ui.bestiary.title')}<", 1],
  ['ui.bestiary.tagline',   '>Know thy enemy — or perish<', ">{t('ui.bestiary.tagline')}<", 1],
  // 'Back' é palavra repetida em várias telas → namespace comum, uma chave só
  ['ui.common.back',        '<ArrowLeft size={24} /> Back\n', "<ArrowLeft size={24} /> {t('ui.common.back')}\n", 1, 'Back'],
  ['ui.bestiary.waveLabel', '>Wave <',                    ">{t('ui.bestiary.waveLabel')} <", 1, 'Wave'],
  ['ui.bestiary.abilities', '>Abilities<',                ">{t('ui.bestiary.abilities')}<", 1],

  // rótulos de ameaça — chave COMPARTILHADA, o dado continua sendo o id
  ['threat.low',    "label: 'Weak'",      "get label() { return t('threat.low'); }",    1, 'Weak'],
  ['threat.medium', "label: 'Medium'",    "get label() { return t('threat.medium'); }", 1, 'Medium'],
  ['threat.high',   "label: 'Dangerous'", "get label() { return t('threat.high'); }",   1, 'Dangerous'],
  ['threat.boss',   "label: 'BOSS'",      "get label() { return t('threat.boss'); }",   1, 'BOSS'],

  // abreviações da linha de stats (ver nota sobre 'VEL' no plano)
  ['ui.bestiary.statHp',    "[['HP', monster.hp], ['DMG', monster.dmg], ['VEL', monster.speed]]",
   "[[t('ui.bestiary.statHp'), monster.hp], [t('ui.bestiary.statDmg'), monster.dmg], [t('ui.bestiary.statSpeed'), monster.speed]]",
   1, 'HP'],

  // com número no meio → interpolação
  ['ui.bestiary.catalogued', '{BESTIARY.length} creatures catalogued',
   "{t('ui.bestiary.catalogued', { n: BESTIARY.length })}", 1, '{{n}} creatures catalogued'],
  ['ui.bestiary.slain', 'Slain {lifetimeKillsByTypeRef.current[monster.type] ?? 0}',
   "{t('ui.bestiary.slain', { n: lifetimeKillsByTypeRef.current[monster.type] ?? 0 })}", 1, 'Slain {{n}}'],
  ['ui.bestiary.more', '+{monster.abilities.length - 3} more...',
   "{t('ui.bestiary.more', { n: monster.abilities.length - 3 })}", 1, '+{{n}} more...'],
];

const chaves = {};
for (const [key, de, para, vezes, valor] of TROCAS) {
  const achados = bloco.split(de).length - 1;
  if (achados !== vezes) throw new Error(`"${de}" aparece ${achados}x no bloco — esperava ${vezes}`);
  chaves[key] = valor ?? de.replace(/^>|<$/g, '');
  bloco = bloco.split(de).join(para);
}

// as outras duas abreviações não têm troca própria (saem na mesma linha)
chaves['ui.bestiary.statDmg']   = 'DMG';
chaves['ui.bestiary.statSpeed'] = 'VEL';

console.log(`• ${TROCAS.length} trocas, ${Object.keys(chaves).length} chaves`);

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcBestiary', { textos: Object.entries(chaves) });

writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
