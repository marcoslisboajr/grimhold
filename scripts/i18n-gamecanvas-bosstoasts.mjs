// ══════════════════════════════════════════════════════════════════════
// i18n-gamecanvas-bosstoasts.mjs — os toasts de chefe/evento do GameCanvas.
//
// Por que existiam vazamentos aqui depois de "i18n completa": sao strings
// passadas a setBossDoubleToast(...) — ARGUMENTO de funcao, nao texto em
// posicao de JSX. O i18n-leaks so olhava JSX. Achado no A4 (teste da demo):
// "ETERNAL FLAME — The ground burns beneath your feet!" no chefe do Ato I,
// em portugues. Tres dos 14 disparam na demo.
//
// Uso:  node scripts/i18n-gamecanvas-bosstoasts.mjs
// Idempotente: aborta se as chaves ja existem ou se a contagem nao bate.
// ══════════════════════════════════════════════════════════════════════
import fs from 'node:fs';

const GC = 'components/GameCanvas.tsx';
const LOCALES = ['en', 'pt-BR', 'zh-CN'];
const ANCORA = '"ui.hud.modeEndless"';   // chave depois da qual inserimos

// [chave, en, pt-BR, zh-CN, texto EXATO hoje no codigo (pra substituir)]
const TOASTS = [
  ['twinThreat',
    '⚠ TWIN THREAT! Boss reinforcements incoming!',
    '⚠ AMEAÇA DUPLA! Reforços do chefe a caminho!',
    '⚠ 双重威胁！首领援军来袭！',
    "'⚠ TWIN THREAT! Boss reinforcements incoming!'"],
  ['infernoBreath',
    "🔥 INFERNO BREATH — Vreth'Kal exhales ancient fire!",
    "🔥 SOPRO INFERNAL — Vreth'Kal exala fogo antigo!",
    "🔥 炼狱吐息 — Vreth'Kal 喷出远古之火！",
    `"🔥 INFERNO BREATH — Vreth'Kal exhales ancient fire!"`],
  ['eternalFlame',
    '🌋 ETERNAL FLAME — The ground burns beneath your feet!',
    '🌋 CHAMA ETERNA — O chão queima sob seus pés!',
    '🌋 永恒之焰 — 脚下的大地在燃烧！',
    "'🌋 ETERNAL FLAME — The ground burns beneath your feet!'"],
  ['hypnoticGaze',
    '👁 HYPNOTIC GAZE — {{name}} is paralyzed!',
    '👁 OLHAR HIPNÓTICO — {{name}} está paralisado!',
    '👁 催眠凝视 — {{name}} 被麻痹了！',
    null],   // tem interpolacao: tratado a parte abaixo
  ['mistForm',
    '🌫 MIST FORM — Valdris disperses into shadow!',
    '🌫 FORMA DE NÉVOA — Valdris se dispersa em sombra!',
    '🌫 雾化 — Valdris 散入阴影！',
    "'🌫 MIST FORM — Valdris disperses into shadow!'"],
  ['summonInfernal',
    '👿 SUMMON INFERNAL — Malachar calls his infernal servants!',
    '👿 INVOCAÇÃO INFERNAL — Malachar chama seus servos infernais!',
    '👿 召唤炼狱 — Malachar 唤来他的炼狱仆从！',
    "'👿 SUMMON INFERNAL — Malachar calls his infernal servants!'"],
  ['soulChain',
    '🔗 SOUL CHAIN — Two souls are bound together!',
    '🔗 CORRENTE DE ALMAS — Duas almas ficam atadas!',
    '🔗 灵魂锁链 — 两个灵魂被绑在一起！',
    "'🔗 SOUL CHAIN — Two souls are bound together!'"],
  ['riftTear',
    '💀 RIFT TEAR — A wound in reality opens!',
    '💀 RASGO NA FENDA — Uma ferida se abre na realidade!',
    '💀 裂隙撕裂 — 现实上裂开一道伤口！',
    "'💀 RIFT TEAR — A wound in reality opens!'"],
  ['malacharWrath',
    "⚡ MALACHAR'S WRATH — All abilities surge at double speed!",
    '⚡ FÚRIA DE MALACHAR — Todas as habilidades no dobro da velocidade!',
    '⚡ Malachar 之怒 — 所有技能速度翻倍！',
    `"⚡ MALACHAR'S WRATH — All abilities surge at double speed!"`],
  ['rouletteConfetti',
    '🎪 ROULETTE: Confetti Explosion!',
    '🎪 ROLETA: Explosão de Confete!',
    '🎪 轮盘：彩纸爆炸！',
    "'🎪 ROULETTE: Confetti Explosion!'"],
  ['rouletteHeal',
    '🎪 ROULETTE: Full House Heal!',
    '🎪 ROLETA: Cura Full House!',
    '🎪 轮盘：满堂治疗！',
    "'🎪 ROULETTE: Full House Heal!'"],
  ['rouletteVanish',
    '🎪 ROULETTE: Grand Disappearing Act!',
    '🎪 ROLETA: Grande Ato do Desaparecimento!',
    '🎪 轮盘：大消失术！',
    "'🎪 ROULETTE: Grand Disappearing Act!'"],
  ['rouletteFrenzy',
    '🎪 ROULETTE: Speed Frenzy! All allies +100% dmg for 10s!',
    '🎪 ROLETA: Frenesi! Todos os aliados +100% de dano por 10s!',
    '🎪 轮盘：狂速！所有盟友伤害 +100%，持续 10 秒！',
    "'🎪 ROULETTE: Speed Frenzy! All allies +100% dmg for 10s!'"],
  ['rouletteConfusion',
    '🎪 ROULETTE: Mass Confusion!',
    '🎪 ROLETA: Confusão em Massa!',
    '🎪 轮盘：群体混乱！',
    "'🎪 ROULETTE: Mass Confusion!'"],
];

const contar = (s, sub) => s.split(sub).length - 1;
const jsonStr = (s) => JSON.stringify(s);

// ── 1. locales ──────────────────────────────────────────────────────────
for (const [i, loc] of LOCALES.entries()) {
  const p = `i18n/locales/${loc}.json`;
  let txt = fs.readFileSync(p, 'utf8');
  if (txt.includes('"ui.bossToast.')) { console.log(`(${loc}: ja tem ui.bossToast.*, pulando)`); continue; }
  const n = contar(txt, ANCORA);
  if (n !== 1) throw new Error(`${loc}: esperava 1 ancora ${ANCORA}, achei ${n}`);
  const linhas = TOASTS.map(t => `  ${jsonStr('ui.bossToast.' + t[0])}: ${jsonStr(t[1 + i])},`).join('\n');
  txt = txt.replace(new RegExp(`^(\\s*${ANCORA.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}: .*,)$`, 'm'), `$1\n${linhas}`);
  fs.writeFileSync(p, txt);
  console.log(`✓ ${loc}: +${TOASTS.length} chaves`);
}

// ── 2. call sites ───────────────────────────────────────────────────────
let gc = fs.readFileSync(GC, 'utf8');
let trocas = 0;
for (const [chave, , , , literal] of TOASTS) {
  if (!literal) continue;
  const alvo = `setBossDoubleToast(${literal})`;
  const n = contar(gc, alvo);
  if (n !== 1) throw new Error(`esperava 1 ocorrencia de ${alvo}, achei ${n}`);
  gc = gc.replace(alvo, `setBossDoubleToast(t('ui.bossToast.${chave}'))`);
  trocas++;
}
// hypnoticGaze: concatenava o tipo do aliado com a primeira letra maiuscula.
// Vira interpolacao com o nome de classe traduzido (ui.class.*), com o tipo
// cru como fallback pra nunca mostrar chave na tela.
const gazeAntes = `setBossDoubleToast('👁 HYPNOTIC GAZE — ' + (currentPlayer.allies[nearestIdx].type.charAt(0).toUpperCase() + currentPlayer.allies[nearestIdx].type.slice(1)) + ' is paralyzed!');`;
const gazeDepois = `setBossDoubleToast(t('ui.bossToast.hypnoticGaze', { name: t('ui.class.' + currentPlayer.allies[nearestIdx].type, { defaultValue: currentPlayer.allies[nearestIdx].type }) }));`;
{
  const n = contar(gc, gazeAntes);
  if (n !== 1) throw new Error(`hypnoticGaze: esperava 1, achei ${n}`);
  gc = gc.replace(gazeAntes, gazeDepois);
  trocas++;
}
fs.writeFileSync(GC, gc);
console.log(`✓ GameCanvas: ${trocas} call sites trocados`);
console.log(`restam setBossDoubleToast com string cravada: ${contar(gc, "setBossDoubleToast('") + contar(gc, 'setBossDoubleToast("')}`);
