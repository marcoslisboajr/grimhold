// ══════════════════════════════════════════════════════════════════════
// data/gacha.ts
// Extracted from GameCanvas.tsx — global CSS animations, gacha weights,
// rarities, colors and labels. No React dependency.
// ══════════════════════════════════════════════════════════════════════

import { t } from '../../i18n';

// ---------------------------------------------------------------------------
// Global CSS animations (injected via <style> in the root component)
// ---------------------------------------------------------------------------

export const styles = `
  /* O @import do Google saiu daqui: as fontes agora vem do disco,
     por ./fonts/latin.css no index.html (ver scripts/fonts-local.mjs). */

  /* Pixel (B1b, 18/9): rotulos/titulos/numeros em Jersey. Cardo fica de
     fallback; a Noto segue cobrindo o chines. Este bloco vence o Tailwind
     (nao esta em @layer), entao a troca tem que ser AQUI. */
  .font-cinzel { font-family: 'Jersey 15', 'Cardo', 'Noto Sans SC', serif; }
  .font-medieval { font-family: 'Jersey 10', 'Cardo', 'Noto Sans SC', serif; }
  .font-fantasy { font-family: 'Jersey 10', 'Cardo', 'Noto Sans SC', serif; }
  .font-nums { font-family: 'Jersey 15', 'Cinzel', 'Noto Sans SC', serif; }
  .font-mono { font-family: 'Jersey 15', 'Space Mono', 'Noto Sans SC', monospace; }
  .font-serif { font-family: 'Jersey 15', 'Cardo', 'Noto Sans SC', serif; font-style: normal; }
  body { font-family: 'Jersey 15', 'Cardo', 'Noto Sans SC', serif; }

  /* ── Pixel (B1b): remapa a paleta legada "slate" (azul-cinza) pra pedra
     quente e tira cantos redondos dos paineis. Vale pra todo painel antigo
     (configuracoes, passe, conquistas, creditos, historico) sem reescrever.
     Este bloco NAO esta em @layer, entao vence as utilities do Tailwind. */
  .bg-slate-950, .bg-slate-950\/95, .bg-slate-950\/98, .bg-slate-950\/90, .bg-slate-950\/80 { background-color: #131110 !important; }
  .bg-slate-900, .bg-slate-900\/60, .bg-slate-900\/80, .bg-slate-900\/90, .bg-slate-900\/95, .bg-slate-900\/50 { background-color: #1a1613 !important; }
  .bg-slate-800, .bg-slate-800\/80, .bg-slate-800\/60, .bg-slate-800\/50 { background-color: #221d18 !important; }
  .bg-slate-700, .bg-slate-700\/60, .bg-slate-700\/50 { background-color: #2a241e !important; }
  .border-slate-800, .border-slate-700, .border-slate-600, .border-slate-500, .border-slate-800\/60, .border-slate-700\/60 { border-color: #322b24 !important; }
  .text-slate-200, .text-slate-300 { color: #dcd2c4 !important; }
  .text-slate-400 { color: #8f8272 !important; }
  .text-slate-500 { color: #5f5548 !important; }
  .text-slate-600, .text-slate-700 { color: #443c33 !important; }
  .bg-stone-950\/40, .bg-stone-900\/60, .bg-stone-900\/40 { background-color: #1a1613 !important; }
  .rounded-xl, .rounded-lg, .rounded-md, .rounded-2xl, .rounded-3xl { border-radius: 0 !important; }
  .backdrop-blur-sm, .backdrop-blur-md, .backdrop-blur-xl { backdrop-filter: none !important; }
  .shadow-2xl, .shadow-xl, .shadow-lg { box-shadow: 0 8px 0 rgba(0,0,0,0.35) !important; }

  /* Mobile: prevent scroll bounce and unwanted touch gestures */
  html, body { overscroll-behavior: none; touch-action: none; -webkit-user-select: none; }

  /* Promote moving game elements to their own GPU layer */
  .game-entity { will-change: transform; backface-visibility: hidden; }

  .hud-panel {
    background: linear-gradient(180deg, #242c2f 0%, #242c2f 100%);
    border: 2px solid #916048;
    box-shadow: 0 0 10px rgba(0,0,0,0.8), inset 0 0 20px rgba(0,0,0,0.5);
    position: relative;
  }
  
  .hud-panel::before {
    content: '';
    position: absolute;
    inset: 2px;
    border: 1px solid #47585f;
    pointer-events: none;
  }

  .hud-gem {
    background: radial-gradient(circle at 30% 30%, #c59993, #6b3b34);
    box-shadow: 0 0 10px #9f584e, inset 0 0 5px rgba(255,255,255,0.5);
    border: 1px solid #221311;
  }

  .hud-gem-blue {
    background: radial-gradient(circle at 30% 30%, #9cabaf, #47585f);
    box-shadow: 0 0 10px #6d8894, inset 0 0 5px rgba(255,255,255,0.5);
    border: 1px solid #161b1d;
  }

  .hud-ornament {
    position: absolute;
    width: 20px;
    height: 20px;
    background: #916048;
    transform: rotate(45deg);
    border: 1px solid #a8745a;
    box-shadow: 0 0 5px rgba(0,0,0,0.5);
  }

  @keyframes attack-cast {
    0% { transform: translateY(0) scale(1); filter: brightness(1); }
    50% { transform: translateY(-4px) scale(1.1); filter: brightness(1.3); }
    100% { transform: translateY(0) scale(1); filter: brightness(1); }
  }
  @keyframes attack-recoil {
    0% { transform: translateX(0); }
    20% { transform: translateX(-4px); }
    100% { transform: translateX(0); }
  }
  @keyframes attack-summon {
    0% { transform: scale(1); }
    50% { transform: scale(0.9); filter: sepia(1) hue-rotate(270deg); }
    100% { transform: scale(1); }
  }
  @keyframes attack-play {
    0% { transform: rotate(0deg) scale(1); }
    25% { transform: rotate(-10deg) scale(1.1); }
    75% { transform: rotate(10deg) scale(1.1); }
    100% { transform: rotate(0deg) scale(1); }
  }
  @keyframes attack-pray {
    0% { transform: scale(1); filter: brightness(1); }
    50% { transform: scale(1.1); filter: brightness(1.5) drop-shadow(0 0 5px gold); }
    100% { transform: scale(1); filter: brightness(1); }
  }
  @keyframes weapon-swing {
    0% { transform: rotate(0deg); }
    25% { transform: rotate(-20deg); }
    60% { transform: rotate(45deg); }
    100% { transform: rotate(0deg); }
  }
  @keyframes bow-release {
    0% { transform: translateX(0) scale(1); }
    50% { transform: translateX(-3px) scale(0.9); }
    60% { transform: translateX(2px) scale(1.1); }
    100% { transform: translateX(0) scale(1); }
  }
  @keyframes staff-slam {
    0% { transform: translateY(0) rotate(0deg); }
    40% { transform: translateY(-6px) rotate(-10deg); }
    60% { transform: translateY(2px) rotate(5deg); }
    100% { transform: translateY(0) rotate(0deg); }
  }
  @keyframes orb-float {
    0% { transform: translateY(0); }
    50% { transform: translateY(-3px); }
    100% { transform: translateY(0); }
  }
  @keyframes walk-waddle {
    0% { transform: rotate(-4deg) translateY(0); }
    50% { transform: rotate(4deg) translateY(-2px); }
    100% { transform: rotate(-4deg) translateY(0); }
  }
  @keyframes walk-hover {
    0% { transform: translateY(0); }
    50% { transform: translateY(-6px); }
    100% { transform: translateY(0); }
  }
  @keyframes walk-squish {
    0% { transform: scaleX(1) scaleY(1); }
    50% { transform: scaleX(1.1) scaleY(0.9); }
    100% { transform: scaleX(1) scaleY(1); }
  }
  @keyframes pulse-glow {
    0%, 100% { box-shadow: 0 0 10px rgba(137,159,168, 0.5); }
    50% { box-shadow: 0 0 20px rgba(137,159,168, 0.8); }
  }
  @keyframes float-up {
    0% { transform: translateY(0) scale(1); opacity: 1; }
    100% { transform: translateY(-40px) scale(1.1); opacity: 0; }
  }
  @keyframes bg-scroll {
    0% { background-position: 0 0; }
    100% { background-position: 100% 100%; }
  }
  @keyframes shockwave {
    0% { transform: scale(0.1); opacity: 1; border-width: 20px; }
    100% { transform: scale(2); opacity: 0; border-width: 0px; }
  }
  @keyframes aura-pulse {
    0% { transform: scale(0.8); opacity: 0.5; }
    50% { transform: scale(1); opacity: 0.2; }
    100% { transform: scale(0.8); opacity: 0.5; }
  }
  .anim-cast { animation: attack-cast 0.3s ease-out; }
  .anim-recoil { animation: attack-recoil 0.2s ease-out; }
  .anim-summon { animation: attack-summon 0.4s ease-in-out; }
  .anim-play { animation: attack-play 1s infinite ease-in-out; }
  .anim-pray { animation: attack-pray 0.5s ease-in-out; }
  .anim-walk { animation: walk-waddle 0.6s infinite ease-in-out; }
  .anim-hover { animation: walk-hover 1.5s infinite ease-in-out; }
  .anim-squish { animation: walk-squish 0.8s infinite ease-in-out; }
`;


// ---------------------------------------------------------------------------
// Sistema de Gacha — pesos, raridades e display
// ---------------------------------------------------------------------------

export const GACHA_WEIGHTS: Record<string, number> = {
  mage: 44,  // Common    — balanced, beginner-friendly
  archer: 44,  // Common    — straightforward DPS
  druid: 45,  // Common    — easy crit hunter
  cleric: 40,  // Common    — solid support
  paladin: 30,  // Uncommon  — tanky specialist
  warlock: 28,  // Uncommon  — high dmg, short range
  priest: 25,  // Uncommon  — healing utility
  necromancer: 15,  // SemiRare  — skeleton mechanic
  bard: 10,  // SemiRare  — aura support
  runesmith: 7,  // Rare      — rune tower placer
  sylvanite: 6,  // Rare      — nature healer/poisoner
  vex: 12,  // SemiRare  — melee dash assassin
  dreadlord: 3,  // Legendary — self-harm berserker
  jester: 2,  // Legendary — chaos hybrid, roulette on death
  zylvara: 9,  // Rare      — shadow archer, poison + blink
  morrigan: 3,  // Legendary — hexblade witch, ash/curse/barrier sacrifice
  ixara: 12, // SemiRare  — chaos demoness, fury stacks
  berserker: 7,  // Rare      — blood rage, physical berserker
  frost_warden: 11, // SemiRare  — frost zone control, glacial wall
  inquisitor: 3,  // Legendary — verdict stacks, sentence active
  yue: 9,  // Rare      — dancarino de vanguarda, plateia + encanto
  billy: 9,  // Rare      — pistoleiro, o quarto tiro
  // malachar_human: fora da compra (so por conquista), mas entra na invocacao em batalha depois
  // de destravado. Sem peso aqui caia no padrao `?? 40` e virava o heroi MAIS comum. 1 = o mais
  // raro do jogo (decisao do Marcos, 28/09/2026).
  malachar_human: 1,
};

export const GACHA_RARITY: Record<string, 'common' | 'uncommon' | 'semiRare' | 'rare' | 'legendary'> = {
  mage: 'common', archer: 'common', druid: 'common', cleric: 'common',
  paladin: 'uncommon', warlock: 'uncommon', priest: 'uncommon',
  necromancer: 'semiRare', bard: 'semiRare',
  runesmith: 'rare', sylvanite: 'rare', dreadlord: 'legendary', jester: 'legendary', vex: 'semiRare',
  zylvara: 'rare', morrigan: 'legendary', ixara: 'semiRare',
  berserker: 'rare', frost_warden: 'semiRare', inquisitor: 'legendary',
  malachar_human: 'legendary',
  yue: 'rare', billy: 'rare',
};

export const GACHA_RARITY_COLORS: Record<string, string> = {
  common: 'text-[#a0978d]  border-[#675e53]   bg-[#2d2925]/80',
  uncommon: 'text-[#a0978d]   border-[#6d8894]    bg-[#1a1f21]/80',
  semiRare: 'text-[#a0978d] border-[#8a6e96]  bg-[#211a21]/80',
  rare: 'text-[#bc8e78] border-[#ac7357]  bg-[#241711]/80',
  legendary: 'text-[#cca998] border-[#ac7357]  bg-[#241711]/80',
  mythic: 'text-[#bfb8ae] border-[#a0978d]  bg-[#211a21]/80',
};

export const GACHA_RARITY_GLOW: Record<string, string> = {
  common: '',
  uncommon: '',
  semiRare: '',
  rare: ' animate-pulse',
  legendary: ' animate-pulse',
  mythic: ' animate-pulse',
};

// Getters, nao valores: o t() tem que rodar no acesso pra a troca de idioma
// valer na hora (mesmo padrao do resto do projeto).
// ATENCAO ao formato "<simbolo><espaco><palavra>": o GameCanvas faz
// RARITY_LABEL[r].split(' ')[1] pra mostrar so a palavra. A traducao nao
// pode ter espaco dentro da palavra, senao aquele split corta errado.
export const RARITY_LABEL: Record<string, string> = {
  get common()    { return `● ${t('ui.rarity.common')}`; },
  get uncommon()  { return `◆ ${t('ui.rarity.uncommon')}`; },
  get semiRare()  { return `◈ ${t('ui.rarity.semiRare')}`; },
  get rare()      { return `★ ${t('ui.rarity.rare')}`; },
  get legendary() { return `✦ ${t('ui.rarity.legendary')}`; },
  get mythic()    { return `✦ ${t('ui.rarity.mythic')}`; },
};

interface GameCanvasProps {
  status: GameStatus;
  setStatus: (status: GameStatus) => void;
}
