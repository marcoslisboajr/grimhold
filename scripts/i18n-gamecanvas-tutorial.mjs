// ══════════════════════════════════════════════════════════════════════
// scripts/i18n-gamecanvas-tutorial.mjs
//
// GameCanvas.tsx — PARTE 11: o TUTORIAL (parte simples).
//
// ⚠ O tutorial tem DOIS tipos de texto, e só um dá pra tratar com troca
// de string:
//
//  (a) texto inteiro num nó só — cabeçalho do passo, "Skip tutorial",
//      dicas soltas, tela de conclusão. É o que ESTE script migra.
//
//  (b) FRASE COM MARCAÇÃO NO MEIO, tipo:
//        Enemies march from the <span class="red">right</span> toward
//        your barrier on the <span class="blue">left</span>.
//      Aqui NÃO dá pra criar uma chave por pedaço: "right" e "left"
//      sozinhos não têm tradução possível (dependem da frase), e a ordem
//      das palavras muda de idioma pra idioma. O certo é o componente
//      <Trans> do react-i18next, que guarda a frase inteira numa chave só
//      e numera as tags. Ver o exemplo já aplicado no passo 1 e a lista
//      do que falta no plano.
//
// Uso:  npm run i18n:gc:tutorial
// ══════════════════════════════════════════════════════════════════════

import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import { writeLocales, saveSnapshot, writeMigrated } from './lib/i18n-surgical.mjs';

const ROOT = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const SRC  = path.join(ROOT, 'components/GameCanvas.tsx');

const INICIO = '{isTutorialActive && tutorialStep > 0 && tutorialStep < 7 && status === GameStatus.PLAYING && (';
const FIM    = '{/* TITLE SELECTOR */}';

const full = fs.readFileSync(SRC, 'utf8');
const iniIdx = full.indexOf(INICIO);
const fimIdx = full.indexOf(FIM);
if (iniIdx === -1 || fimIdx === -1 || fimIdx < iniIdx) throw new Error('não achei o bloco do tutorial');

let bloco = full.slice(iniIdx, fimIdx);
if (bloco.includes("t('ui.tutorial.")) {
  console.error('✗ O tutorial JÁ está migrado.');
  process.exit(1);
}

const escapar = s => s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
const chaves = {};

function linha(key, texto, vezes = 1) {
  const re = new RegExp(`^([ \\t]*)${escapar(texto)}[ \\t]*$`, 'gm');
  const n = [...bloco.matchAll(re)].length;
  if (n !== vezes) throw new Error(`linha "${texto.slice(0, 45)}" aparece ${n}x — esperava ${vezes}`);
  bloco = bloco.replace(re, `$1{t('${key}')}`);
  chaves[key] = texto;
}

function exato(key, de, para, vezes, valor) {
  const n = bloco.split(de).length - 1;
  if (n !== vezes) throw new Error(`"${de.slice(0, 45)}" aparece ${n}x — esperava ${vezes}`);
  bloco = bloco.split(de).join(para);
  chaves[key] = valor;
}

// ─── cabeçalhos de passo ──────────────────────────────────────────────
// NOTA: o passo de colocar o herói diz "Step 1 of 5" e o da onda 1 diz
// "Step 1 of 7" — numeração inconsistente que já existia. Mantive o texto
// como está (a regra é não mudar o inglês); vale corrigir no en.json.
exato('ui.tutorial.step0.title', '>Step 1 of 5 — Place your hero<', ">{t('ui.tutorial.step0.title')}<", 1, 'Step 1 of 5 — Place your hero');
exato('ui.tutorial.step1.title', '>Step 1 of 7 — Wave 1<', ">{t('ui.tutorial.step1.title')}<", 1, 'Step 1 of 7 — Wave 1');
exato('ui.tutorial.step2.title', '>Step 2 of 7 — Visit the shop<', ">{t('ui.tutorial.step2.title')}<", 1, 'Step 2 of 7 — Visit the shop');
exato('ui.tutorial.step3.title', '>Step 3 of 7 — Synergies & Resistances<', ">{t('ui.tutorial.step3.title')}<", 1, 'Step 3 of 7 — Synergies & Resistances');
exato('ui.tutorial.step4.title', '>Step 4 of 7 — Spells & Relics<', ">{t('ui.tutorial.step4.title')}<", 1, 'Step 4 of 7 — Spells & Relics');
exato('ui.tutorial.step5.title', '>Step 5 of 7 — Boss Wave & Forge<', ">{t('ui.tutorial.step5.title')}<", 1, 'Step 5 of 7 — Boss Wave & Forge');

// ─── texto de nó único ────────────────────────────────────────────────
exato('ui.tutorial.step0.body', '>Your hero attacks enemies automatically once placed.<',
      ">{t('ui.tutorial.step0.body')}<", 1, 'Your hero attacks enemies automatically once placed.');
exato('ui.tutorial.shopWaves', '>Shops open at waves 5, 10, 15, 20, 26+.<',
      ">{t('ui.tutorial.shopWaves')}<", 1, 'Shops open at waves 5, 10, 15, 20, 26+.');
exato('ui.tutorial.spellCooldown', '>Spells have cooldowns — use them at the right moment.<',
      ">{t('ui.tutorial.spellCooldown')}<", 1, 'Spells have cooldowns — use them at the right moment.');

// ─── pular (3 botões, mesma palavra) ──────────────────────────────────
linha('ui.tutorial.skip', 'Skip tutorial', 3);

// ─── conclusão ────────────────────────────────────────────────────────
exato('ui.tutorial.done',   '>Tutorial complete!<', ">{t('ui.tutorial.done')}<", 1, 'Tutorial complete!');
exato('ui.tutorial.reward', '>+40 ✦ Essence rewarded!<', ">{t('ui.tutorial.reward')}<", 1, '+40 ✦ Essence rewarded!');
exato('ui.tutorial.goPlay', '>Now start a real run and hold the line!<',
      ">{t('ui.tutorial.goPlay')}<", 1, 'Now start a real run and hold the line!');

console.log(`• ${Object.keys(chaves).length} chaves (parte simples do tutorial)`);
console.log('  ⚠ as frases com marcação no meio ficaram de fora — precisam de <Trans>, ver o plano');

writeLocales(ROOT, chaves);
saveSnapshot(ROOT, 'gcTutorial', { textos: Object.entries(chaves) });
writeMigrated(SRC, full.slice(0, iniIdx) + bloco + full.slice(fimIdx));
