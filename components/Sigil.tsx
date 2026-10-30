// ══════════════════════════════════════════════════════════════════
// GRIMHOLD — SIGILOS
// Tier 0.5 — sistema de ícones que substitui os emojis
//
// Todos os traços usam `currentColor`: o sigilo NÃO tem cor própria,
// ele herda a cor do material onde está. Muralha num card de barreira
// sai aço; lâmina num card de combate sai sangue.
//
// USO:
//   1) Montar <SigilDefs /> UMA vez na raiz do app (App.tsx / GameCanvas).
//   2) Usar <Sigil name="wall" size={24} /> onde antes havia emoji.
//
// Na camada de dados, trocar  icon: '🏰'  por  icon: 'wall'.
// ══════════════════════════════════════════════════════════════════
import React from 'react';
import { pixelIconFor, SIGIL_KEEP } from './ui/pixelIcons';

export type SigilName =
  // barreira
  | 'wall' | 'shield' | 'stone'
  // economia
  | 'vault' | 'coin' | 'clover'
  // aliados
  | 'star' | 'heart' | 'banner' | 'arcane'
  // combate
  | 'blade' | 'tome' | 'blood' | 'swords'
  // recursos / estados
  | 'gem' | 'skull' | 'comet' | 'frost' | 'flame' | 'bow' | 'wave'
  // sistema
  | 'pause' | 'play' | 'gear' | 'lock' | 'check' | 'cross' | 'fast'
  | 'chevronL' | 'chevronR' | 'trophy' | 'scroll' | 'reroll'
  | 'anvil' | 'crown' | 'mail' | 'note'
  | 'leaf' | 'monolith' | 'eye' | 'dove' | 'infinity' | 'dice' | 'gamepad' | 'sprout' | 'scales'
  | 'flask' | 'bolt' | 'sun' | 'moon' | 'beads' | 'fang' | 'ghost' | 'key';

interface SigilProps {
  name: SigilName | string;
  size?: number;
  /** sobrescreve a cor herdada; por padrão usa currentColor */
  color?: string;
  strokeWidth?: number;
  style?: React.CSSProperties;
  className?: string;
}

export const Sigil: React.FC<SigilProps> = ({
  name, size = 24, color, strokeWidth = 1.6, style, className,
}) => {
  // Pixel (B1b): a partir de 18 px (arte de carta, nicho, botao grande) o
  // Sigil vira o icone pixel equivalente, se houver. Abaixo disso (rotulos,
  // setas) o SVG de linha continua — pixel encolhido demais borra.
  const px = size >= 16 && !SIGIL_KEEP.has(name) ? pixelIconFor(name) : null;
  if (px) return (
    <img src={`./ui/pixel/icons/${px}.png`} width={size} height={size} alt="" draggable={false} className={className}
      style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0, ...(style as any) }} />
  );
  return (
  <svg
    width={size}
    height={size}
    className={className}
    style={{
      stroke: color ?? 'currentColor',
      fill: 'none',
      strokeWidth,
      strokeLinecap: 'round',
      strokeLinejoin: 'round',
      flexShrink: 0,
      ...style,
    }}
    aria-hidden="true"
  >
    <use href={`#sg-${name}`} />
  </svg>
  );
};

/** Monte isto UMA vez na raiz da árvore React. */
export const SigilDefs: React.FC = () => (
  <svg width={0} height={0} style={{ position: 'absolute' }} aria-hidden="true">
    <defs>
      {/* ─── barreira ─── */}
      <symbol id="sg-wall" viewBox="0 0 24 24">
        <path d="M3 21V11h18v10z" /><path d="M3 11V8h3v3M9 11V8h3v3M15 11V8h3v3" />
        <path d="M3 15h18M8 11v4M13 15v6M18 11v4" />
      </symbol>
      <symbol id="sg-shield" viewBox="0 0 24 24">
        <path d="M12 3l7 2v6c0 4-3 7-7 9-4-2-7-5-7-9V5z" /><path d="M12 4v16" />
      </symbol>
      <symbol id="sg-stone" viewBox="0 0 24 24">
        <path d="M6 19l-1-6 3-5 7-1 4 4-1 8z" /><path d="M8 13l3 2 4-1M12 15v4" />
      </symbol>

      {/* ─── economia ─── */}
      <symbol id="sg-vault" viewBox="0 0 24 24">
        <path d="M4 10h16v9H4z" /><path d="M4 10c0-3 3-4 8-4s8 1 8 4" />
        <path d="M4 13h16M11 13h2v3h-2z" />
      </symbol>
      <symbol id="sg-coin" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="8" /><path d="M12 3l2 6 6 0M12 21l-2-6-6 0" />
        <circle cx="12" cy="12" r="3" />
      </symbol>
      <symbol id="sg-clover" viewBox="0 0 24 24">
        <path d="M12 12c0-3-1-5-4-5s-3 4-1 5c-3-1-5 1-4 4s4 2 5 1c-1 3 1 4 4 4s3-3 2-4c1 1 5 1 5-3s-4-3-5-2c1-2 0-5-3-5s-4 2-4 5" />
      </symbol>

      {/* ─── aliados ─── */}
      <symbol id="sg-star" viewBox="0 0 24 24">
        <path d="M12 3l2.6 6.2 6.4.5-4.9 4.1 1.6 6.2L12 16.9 6.3 20.2l1.6-6.2L3 9.7l6.4-.5z" />
      </symbol>
      <symbol id="sg-heart" viewBox="0 0 24 24">
        <path d="M12 20S4 14.5 4 8.8A3.6 3.6 0 0112 6a3.6 3.6 0 018 2.8C20 14.5 12 20 12 20z" />
      </symbol>
      <symbol id="sg-banner" viewBox="0 0 24 24">
        <path d="M6 3v18" /><path d="M6 4h13l-3 3.5 3 3.5H6" /><path d="M11 6.5h3" />
      </symbol>
      <symbol id="sg-arcane" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="2.5" />
        <path d="M12 2v5M12 17v5M2 12h5M17 12h5M6 6l3 3M15 15l3 3M18 6l-3 3M9 15l-3 3" />
      </symbol>

      {/* ─── combate ─── */}
      <symbol id="sg-blade" viewBox="0 0 24 24">
        <path d="M19 4l-9 9M15 4h4v4" /><path d="M10 13l-2 2 3 3 2-2M6 16l-2 4 4-2" />
      </symbol>
      <symbol id="sg-tome" viewBox="0 0 24 24">
        <path d="M4 5c3-1 6-1 8 1 2-2 5-2 8-1v13c-3-1-6-1-8 1-2-2-5-2-8-1z" /><path d="M12 6v13" />
      </symbol>
      <symbol id="sg-blood" viewBox="0 0 24 24">
        <path d="M12 3c0 4-5 7-5 11a5 5 0 0010 0c0-4-5-7-5-11z" />
        <path d="M9.5 15a2.5 2.5 0 002.5 2.5" />
      </symbol>
      <symbol id="sg-swords" viewBox="0 0 24 24">
        <path d="M4 4l9 9M4 4l3 .3M4 4l.3 3M14 14l4 4-1 2-2-1-3-3" />
        <path d="M20 4l-9 9M20 4l-3 .3M20 4l-.3 3M10 14l-4 4 1 2 2-1 3-3" />
      </symbol>

      {/* ─── recursos / estados ─── */}
      <symbol id="sg-gem" viewBox="0 0 24 24">
        <path d="M6 4h12l3 5-9 11-9-11z" /><path d="M6 4l3 5h6l3-5M3 9h18M12 20V9" />
      </symbol>
      <symbol id="sg-skull" viewBox="0 0 24 24">
        <path d="M5 10a7 7 0 0114 0v4l-2 1v3h-3v-2h-4v2H7v-3l-2-1z" />
        <circle cx="9" cy="10.5" r="1.4" /><circle cx="15" cy="10.5" r="1.4" /><path d="M11 15h2" />
      </symbol>
      <symbol id="sg-comet" viewBox="0 0 24 24">
        <circle cx="16" cy="8" r="4" /><path d="M13 11l-9 9M12 7l-6 1M17 12l-1 6" />
      </symbol>
      <symbol id="sg-frost" viewBox="0 0 24 24">
        <path d="M12 2v20M3.3 7l17.4 10M20.7 7L3.3 17" />
        <path d="M12 6l-2.5-2M12 6l2.5-2M12 18l-2.5 2M12 18l2.5 2M4.5 9l.3-3.2 3.2.3M19.5 9l-.3-3.2-3.2.3M4.5 15l.3 3.2 3.2-.3M19.5 15l-.3 3.2-3.2-.3" />
      </symbol>
      <symbol id="sg-flame" viewBox="0 0 24 24">
        <path d="M12 3c1 4 5 5 5 9a5 5 0 01-10 0c0-2 1-3 2-4 0 2 1 3 2 3 1-3-1-5 1-8z" />
      </symbol>
      <symbol id="sg-bow" viewBox="0 0 24 24">
        <path d="M6 3a13 13 0 010 18" /><path d="M6 3l14 9-14 9" opacity="0" />
        <path d="M6 3v18" /><path d="M4 12h16M17 9l3 3-3 3" />
      </symbol>
      <symbol id="sg-wave" viewBox="0 0 24 24">
        <path d="M2 9c3-3 5-3 8 0s5 3 8 0M2 15c3-3 5-3 8 0s5 3 8 0M2 12c3-3 5-3 8 0s5 3 8 0" opacity=".5" />
        <path d="M2 12c3-3 5-3 8 0s5 3 8 0" />
      </symbol>

      {/* ─── sistema ─── */}
      <symbol id="sg-pause" viewBox="0 0 24 24"><path d="M8 5v14M16 5v14" /></symbol>
      <symbol id="sg-play" viewBox="0 0 24 24"><path d="M7 4l13 8-13 8z" /></symbol>
      <symbol id="sg-gear" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="3" />
        <path d="M12 2.5v3M12 18.5v3M2.5 12h3M18.5 12h3M5.3 5.3l2.1 2.1M16.6 16.6l2.1 2.1M18.7 5.3l-2.1 2.1M7.4 16.6l-2.1 2.1" />
      </symbol>
      <symbol id="sg-lock" viewBox="0 0 24 24">
        <path d="M5 11h14v9H5z" /><path d="M8 11V7a4 4 0 018 0v4M12 15v2" />
      </symbol>
      <symbol id="sg-check" viewBox="0 0 24 24"><path d="M4 12l5 5L20 6" /></symbol>
      <symbol id="sg-cross" viewBox="0 0 24 24"><path d="M5 5l14 14M19 5L5 19" /></symbol>
      <symbol id="sg-fast" viewBox="0 0 24 24"><path d="M5 6l6 6-6 6M12 6l6 6-6 6" /></symbol>
      <symbol id="sg-chevronL" viewBox="0 0 24 24"><path d="M15 5l-7 7 7 7" /></symbol>
      <symbol id="sg-chevronR" viewBox="0 0 24 24"><path d="M9 5l7 7-7 7" /></symbol>
      <symbol id="sg-trophy" viewBox="0 0 24 24">
        <path d="M8 4h8v5a4 4 0 01-8 0z" /><path d="M8 5H5v2a3 3 0 003 3M16 5h3v2a3 3 0 01-3 3" />
        <path d="M12 13v4M9 20h6M10 17h4v3h-4z" />
      </symbol>
      <symbol id="sg-scroll" viewBox="0 0 24 24">
        <path d="M6 4h12v14a2 2 0 002 2H8a2 2 0 01-2-2z" /><path d="M9 8h6M9 12h6M18 4a2 2 0 012 2v14" />
      </symbol>
      <symbol id="sg-anvil" viewBox="0 0 24 24">
        <path d="M4 8h9l3 3h4c0 3-2 5-5 5H9l-2-5H4z" /><path d="M10 16v3M8 21h8l-1-2H9z" />
      </symbol>
      <symbol id="sg-crown" viewBox="0 0 24 24">
        <path d="M4 18h16M4 18l-1-9 5 4 4-7 4 7 5-4-1 9z" /><path d="M8 14h8" />
      </symbol>
      <symbol id="sg-mail" viewBox="0 0 24 24">
        <path d="M3 6h18v12H3z" /><path d="M3 7l9 6 9-6" />
      </symbol>
      <symbol id="sg-note" viewBox="0 0 24 24">
        <path d="M5 3h11l3 3v15H5z" /><path d="M16 3v3h3M8 11h8M8 15h8M8 7h4" />
      </symbol>
      <symbol id="sg-leaf" viewBox="0 0 24 24">
        <path d="M4 20c0-9 5-14 16-15 1 11-4 16-13 16z" /><path d="M4 20c4-5 8-8 13-10" />
      </symbol>
      <symbol id="sg-monolith" viewBox="0 0 24 24">
        <path d="M7 21V6l5-3 5 3v15z" /><path d="M7 10h10M7 15h10M12 3v18" />
      </symbol>
      <symbol id="sg-eye" viewBox="0 0 24 24">
        <path d="M2 12s4-6 10-6 10 6 10 6-4 6-10 6-10-6-10-6z" /><circle cx="12" cy="12" r="2.8" />
      </symbol>
      <symbol id="sg-reroll" viewBox="0 0 24 24">
        <path d="M20 8a8 8 0 10-1 8" /><path d="M20 3v5h-5" />
      </symbol>
      <symbol id="sg-dove" viewBox="0 0 24 24">
        <path d="M20 4c-1.5.5-3 1.5-4 3.5a7 7 0 0 0-6.5-1.5c-2 .5-3.5 2-4 4-.5 2 0 4 1.5 5.5l.5.5c-.5 1-.5 2.5 0 3.5.5 1 2 1.5 3 1.5H12c.5-1.5 0-3-.5-4.5 1 0 2 .5 3 1.5.5.5 1.5 1 2.5 1 .5 0 1-.5 1-1v-2c1.5.5 3 0 4-1.5 1-1.5.5-3.5-1-4.5a3 3 0 0 0 1-3c-.5-1.5-2-2.5-3.5-3z" />
      </symbol>
      <symbol id="sg-infinity" viewBox="0 0 24 24">
        <path d="M12 12c-2-2.67-4-4-6-4a4 4 0 1 0 0 8c2 0 4-1.33 6-4zm0 0c2 2.67 4 4 6 4a4 4 0 1 0 0-8c-2 0-4 1.33-6 4z" />
      </symbol>
      <symbol id="sg-dice" viewBox="0 0 24 24">
        <rect x="4" y="4" width="16" height="16" rx="2" ry="2" />
        <path d="M8 8h.01M16 8h.01M12 12h.01M8 16h.01M16 16h.01" strokeWidth="2.5" strokeLinecap="round" />
      </symbol>
      <symbol id="sg-gamepad" viewBox="0 0 24 24">
        <rect x="2" y="6" width="20" height="12" rx="3" />
        <path d="M6 12h4M8 10v4M15 11h.01M18 13h.01" strokeWidth="2.5" strokeLinecap="round" />
      </symbol>
      <symbol id="sg-sprout" viewBox="0 0 24 24">
        <path d="M2 22h20M9 22c0-5 1.5-9 5-12M11 15.5c-1.9 1.2-4 2.5-4 5.5M14 10c0-4 3-7 7-9M17 6.5c-1.9 1.2-4 2.5-4 5.5" />
      </symbol>
      <symbol id="sg-scales" viewBox="0 0 24 24">
        <path d="m16 16 3-8 3 8c-.87.65-2.24 1-3 1s-2.13-.35-3-1Z" />
        <path d="m2 16 3-8 3 8c-.87.65-2.24 1-3 1s-2.13-.35-3-1Z" />
        <path d="M7 21h10M12 3v18M3 7h18" />
      </symbol>
      <symbol id="sg-flask" viewBox="0 0 24 24">
        <path d="M10 2h4M12 2v6l-5 9a3 3 0 002.6 4.5h8.8A3 3 0 0021 17l-5-9V2" />
        <path d="M8.5 14h7M12 17h.01" />
      </symbol>
      <symbol id="sg-bolt" viewBox="0 0 24 24">
        <path d="M13 2L3 14h9l-1 8 10-12h-9l1-8z" />
      </symbol>
      <symbol id="sg-sun" viewBox="0 0 24 24">
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v3M12 19v3M2 12h3M19 12h3M4.9 4.9l2.2 2.2M16.9 16.9l2.2 2.2M19.1 4.9l-2.2 2.2M7.1 16.9l-2.2 2.2" />
      </symbol>
      <symbol id="sg-moon" viewBox="0 0 24 24">
        <path d="M21 12.79A9 9 0 1111.21 3 7 7 0 0021 12.79z" />
      </symbol>
      <symbol id="sg-beads" viewBox="0 0 24 24">
        <circle cx="12" cy="5" r="2" />
        <circle cx="17" cy="8" r="2" />
        <circle cx="18" cy="14" r="2" />
        <circle cx="12" cy="18" r="2" />
        <circle cx="6" cy="14" r="2" />
        <circle cx="7" cy="8" r="2" />
        <path d="M12 18v4M10 20h4" />
      </symbol>
      <symbol id="sg-fang" viewBox="0 0 24 24">
        <path d="M5 4c0 7 2 16 7 16s7-9 7-16M5 4h14M8 4c0 5 1 10 4 14" />
      </symbol>
      <symbol id="sg-ghost" viewBox="0 0 24 24">
        <path d="M4 19V10a8 8 0 0116 0v9l-3-2-2.5 2-2.5-2-2.5 2-2.5-2z" />
        <circle cx="9" cy="10" r="1.5" /><circle cx="15" cy="10" r="1.5" />
      </symbol>
      <symbol id="sg-key" viewBox="0 0 24 24">
        <circle cx="8" cy="15" r="4" />
        <path d="M11 12l9-9M17 3l3 3M14 6l2 2" />
      </symbol>
    </defs>
  </svg>
);

// ══════════════════════════════════════════════════════════════════
// MAPA DE MIGRAÇÃO — emoji → sigilo
// Ponte para a camada de dados: enquanto os data/*.ts ainda tiverem
// emoji, <Sigil> consegue resolver pelo glifo antigo.
// Permite migrar arquivo por arquivo, sem big-bang.
// ══════════════════════════════════════════════════════════════════
export const EMOJI_TO_SIGIL: Record<string, SigilName> = {
  '🏰': 'wall',    '🪨': 'stone',   '🛡️': 'shield',  '🛡': 'shield',
  '💰': 'vault',   '🪙': 'coin',    '🍀': 'clover',
  '⭐': 'star',    '❤': 'heart',    '❤️': 'heart',   '📣': 'banner',
  '🔮': 'arcane',  '✨': 'arcane',  '⚡': 'comet',
  '🗡': 'blade',   '🗡️': 'blade',  '⚔': 'swords',   '⚔️': 'swords',
  '📚': 'tome',    '📜': 'scroll',  '🩸': 'blood',
  '💎': 'gem',     '💀': 'skull',   '☠': 'skull',    '☠️': 'skull',
  '☄': 'comet',   '☄️': 'comet',   '❄': 'frost',    '❄️': 'frost',
  '🔥': 'flame',   '🏹': 'bow',     '🌊': 'wave',
  '⚙': 'gear',    '⚙️': 'gear',    '🔒': 'lock',    '🏆': 'trophy',
  '✓': 'check',    '✅': 'check',   '✕': 'cross',    '✗': 'cross',
  '↺': 'reroll',   '🔁': 'reroll',

  // ── Segunda leva: emoji legado -> glifo que JA existe no conjunto.
  // Escolhido por funcao, nao por desenho: o bau do mercador vira
  // 'vault' porque e o glifo de guardar coisa, nao porque parece
  // um carrinho. Emoji sem equivalente continua caindo no fallback.
  '🌿': 'leaf',    '🌱': 'sprout',  '🌳': 'leaf',    '🍂': 'leaf',
  '🌺': 'leaf',    '👑': 'crown',   '🎵': 'note',    '🎲': 'dice',
  '🎮': 'gamepad', '♾️': 'infinity', '♾': 'infinity',
  '👁️': 'eye', '👁': 'eye',   '🗿': 'monolith',
  '☀️': 'sun',   '☀': 'sun',        '🌑': 'moon',    '💡': 'sun',
  '📖': 'tome',    '⚒️': 'anvil', '⚒': 'anvil',      '🔩': 'anvil',
  '⚖️': 'scales','⚖': 'scales',     '🪓': 'blade',   '🔱': 'blade',
  '💜': 'gem',     '💚': 'heart',  '⚕': 'heart',
  '🌟': 'star',    '🏅': 'trophy', '🎯': 'eye',
  '🌀': 'arcane',  '💥': 'comet',
  '🕯️': 'flame', '🕯': 'flame', '🌋': 'flame',
  '🐉': 'fang',    '👿': 'skull',  '😈': 'skull',
  '⚰️': 'stone', '⚰': 'stone',
  '⚠️': 'cross', '⚠': 'cross',      '❓': 'scroll',
  '🛒': 'vault',   '🎪': 'banner', '🎭': 'ghost',   '🔗': 'beads',
};

/** Resolve tanto nome novo ('wall') quanto emoji legado ('🏰'). */
export const resolveSigil = (icon: string): SigilName | null =>
  (EMOJI_TO_SIGIL[icon] ?? (icon as SigilName)) || null;

const VALID_SIGILS = new Set<string>([
  'wall', 'shield', 'stone',
  'vault', 'coin', 'clover',
  'star', 'heart', 'banner', 'arcane',
  'blade', 'tome', 'blood', 'swords',
  'gem', 'skull', 'comet', 'frost', 'flame', 'bow', 'wave',
  'pause', 'play', 'gear', 'lock', 'check', 'cross', 'fast',
  'chevronL', 'chevronR', 'trophy', 'scroll', 'reroll',
  'anvil', 'crown', 'mail', 'note',
  'leaf', 'monolith', 'eye', 'dove', 'infinity', 'dice', 'gamepad', 'sprout', 'scales',
  'flask', 'bolt', 'sun', 'moon', 'beads', 'fang', 'ghost', 'key'
]);

export interface IcoProps {
  /** emoji legado ('🏰'), nome de glifo ('wall') ou um no ja pronto. */
  icon: React.ReactNode;
  size?: number;
  color?: string;
  className?: string;
}

export const Ico: React.FC<IcoProps> = ({ icon, size = 16, color, className }) => {
  // Nem todo call site passa string: alguns ja montam o no do icone.
  // Nesses casos nao ha o que resolver — renderiza como veio.
  if (typeof icon !== 'string') return <>{icon}</>;
  // Pixel (B1b): se existe icone pixel pro emoji/nome, ele vence o Sigil e o emoji.
  const px = pixelIconFor(icon);
  if (px) return <img src={`./ui/pixel/icons/${px}.png`} width={size} height={size} alt="" draggable={false} className={className}
    style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle', flexShrink: 0 }} />;
  const sigilName = resolveSigil(icon);
  if (sigilName && VALID_SIGILS.has(sigilName)) {
    return <Sigil name={sigilName} size={size} color={color} className={className} />;
  }
  return (
    <span style={{ fontSize: size }} className={className}>
      {icon}
    </span>
  );
};

