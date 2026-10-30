// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-endrun.mjs
//
// GameCanvas.tsx — PARTE 15: tela de fim de run (vitória/derrota),
// obituário, forja, desafio diário e as sobras curtas do combate.
//
// ⚠ ACHADO GRANDE: esta tela tem SETE textos em PORTUGUÊS no build
// inglês — "Melhor", "RECORDE!", "Empatado", "MVP Aliado", "aliados",
// "passe o mouse", "Perks ativos". Somados aos dois que já achei
// (Maestria e "Total gasto no shop"), são NOVE vazamentos.
// Aqui eles viram chave com o valor em INGLÊS (que é o que a tela devia
// mostrar). Isso muda o texto inglês — de propósito, é correção de bug.
//
// Uso:  npm run i18n:gc:endrun
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

let src = fs.readFileSync(SRC, 'utf8');
if (src.includes("t('ui.endRun.")) {
  console.error('✗ A parte 15 JÁ foi migrada.');
  process.exit(1);
}

const chaves = {};
const naoAchados = [];
function exato(key, de, para, valor, vezes = 1) {
  const n = src.split(de).length - 1;
  if (n !== vezes) throw new Error(`"${de.slice(0, 45)}" aparece ${n}x — esperava ${vezes}`);
  src = src.split(de).join(para);
  chaves[key] = valor;
}
const escapar = t => t.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

/**
 * Troca o texto esteja ele como `>texto<` na mesma linha OU sozinho numa
 * linha (mantendo a indentação). Nas partes anteriores eu tinha que
 * decidir a forma na mão e errava direto; aqui o script tenta as duas.
 */
function tag(key, texto, valor) {
  const inline = `>${texto}<`;
  const temInline = src.split(inline).length - 1;
  const camposComTexto = ['label', 'title', 'desc', 'name']
    .filter(c => src.split(`${c}: '${texto}'`).length - 1 === 1);

  // ⚠ ACONTECEU: "Barrier" existia como >Barrier< DENTRO de um <Trans> do
  // tutorial E como label:'Barrier' na forja. O inline ganhou e o texto
  // foi trocado no lugar errado, corrompendo o <Trans>. Se as duas formas
  // existem, o script não adivinha: recusa e pede alvo explícito.
  if (temInline && camposComTexto.length) {
    naoAchados.push(`${texto}  (AMBÍGUO: existe como >${texto}< e como ${camposComTexto[0]}: '${texto}')`);
    return;
  }

  if (temInline === 1) return exato(key, inline, `>{t('${key}')}<`, valor ?? texto);
  if (camposComTexto.length === 1) {
    const campo = camposComTexto[0];
    return exato(key, `${campo}: '${texto}'`, `get ${campo}() { return t('${key}'); }`, valor ?? texto);
  }

  const re = new RegExp(`^([ \\t]*)${escapar(texto)}[ \\t]*$`, 'gm');
  const n = [...src.matchAll(re)].length;
  // não estoura no primeiro que falha: junta todos e mostra a lista no
  // fim, senão eu descubro um por vez e gasto uma rodada em cada.
  if (n !== 1) { naoAchados.push(`${texto}  (${n} linhas)`); return; }
  src = src.replace(re, `$1{t('${key}')}`);
  chaves[key] = valor ?? texto;
}

// ─── PORTUGUÊS no build inglês → vira chave, com o inglês certo ───────
tag('ui.endRun.best',      'Melhor',      'Best');
tag('ui.endRun.record',    'RECORDE!',    'RECORD!');
tag('ui.endRun.tied',      'Empatado',    'Tied');
tag('ui.endRun.mvpAlly',   'MVP Aliado',  'Ally MVP');
tag('ui.endRun.allies',    'aliados',     'allies');
tag('ui.endRun.hoverHint', 'passe o mouse', 'hover');
tag('ui.endRun.perks',     'Perks ativos', 'Active perks');

// ─── resto da tela de fim de run ──────────────────────────────────────
tag('ui.endRun.grade',        'Grade');
tag('ui.endRun.finalConquest','Final Conquest');
tag('ui.endRun.totalDamage',  'TOTAL DAMAGE');
tag('ui.endRun.enemiesSlain', 'ENEMIES SLAIN');
tag('ui.endRun.clearTime',    'CLEAR TIME');
tag('ui.endRun.critAccuracy', 'CRIT ACCURACY');
tag('ui.endRun.wavesCleared', 'WAVES CLEARED');
tag('ui.endRun.goldInvested', 'GOLD INVESTED');
tag('ui.endRun.victoryScore', 'VICTORY SCORE');
tag('ui.endRun.squadHonors',  'Squad Honors · Damage Leaders');
tag('ui.endRun.finalFormation','Final Formation');
tag('ui.endRun.obituary',     'Run Obituary');
tag('ui.endRun.nemesis',      'Nemesis');
tag('ui.endRun.fallen',       'Fallen');
tag('ui.endRun.topAllies',    'Top Allies — Damage');
tag('ui.endRun.composition',  'Composition');
tag('ui.endRun.damage',       'Damage');
tag('ui.endRun.kills',        'Kills');
tag('ui.endRun.time',         'Time');
tag('ui.endRun.crits',        'Crits');
tag('ui.endRun.damageType',   'Damage Type');
tag('ui.endRun.hero',         'Hero');
tag('ui.endRun.max',          'MAX');

// ─── títulos de vitória por ato ───────────────────────────────────────
for (const [key, texto] of [
  ['act1', 'GRIMHOLD STANDS'], ['act2', 'THE GROVE AWAKENS'],
  ['act3', 'FALL OF THE TITANS'], ['act4', 'THE ABYSS SEALED'],
  ['act5', 'GRIMHOLD ENDURES'], ['survivor', 'LEGEND OF THE SURVIVOR'],
  ['commander', 'COMMANDER ASCENSION'],
]) tag(`ui.victory.${key}`, texto);

// ─── mercadores / avisos de combate ───────────────────────────────────
tag('ui.merchant.grandSale', 'Grand Sale');
tag('ui.combat.selectMeteor', 'Select the Meteor target');
for (const [key, texto] of [
  ['rain', 'RAIN!'], ['cursed', 'CURSED!'], ['dodge', 'DODGE!'],
  ['revived', 'REVIVED!'], ['rune', 'RUNE!'], ['blessing', 'BLESSING!'],
]) tag(`ui.combat.${key}`, texto);

// ─── forja / diário ───────────────────────────────────────────────────
tag('ui.forge.title',   'FORGE');
tag('ui.forge.subtitle','Permanent upgrades — paid with Essence');
tag('ui.forge.maxed',   'MAXED');
for (const [key, texto] of [
  ['all', 'All'], ['barrier', 'Barrier'], ['economy', 'Economy'],
  ['allies', 'Allies'], ['combat', 'Combat'],
]) tag(`ui.forge.cat.${key}`, texto);
tag('ui.daily.title',     'Daily Challenge');
tag('ui.daily.complete',  'Challenge Complete!');
tag('ui.daily.reward',    'Daily Reward');
tag('ui.tutorial.letsPlay', "Let's Play!");
tag('ui.common.skip',     'Skip');

if (naoAchados.length) {
  console.log(`
⚠ ${naoAchados.length} não encontrados (formato diferente — trate na mão):`);
  naoAchados.forEach(t => console.log('   ', t));
  console.log('');
}
console.log(`• ${Object.keys(chaves).length} chaves`);
console.log('  ⚠ 7 textos que estavam em PORTUGUÊS no build inglês foram corrigidos');

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcEndRun', { textos: Object.entries(chaves) });
writeMigrated(SRC, src);
