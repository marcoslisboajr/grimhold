// ══════════════════════════════════════════════════════════════════════
// components/ui/Pixel.tsx — primitivos da HUD pixel (B1b)
//
// Tres pecas, todas "pele": nao carregam estado nem logica do jogo.
//   <PixelPanel material="ember">   moldura de pedra 9-slice (public/ui/pixel/panel_*.png)
//   <PixelButton material="gold">   bloco de madeira com chanfro (button_*.png)
//   <PixelBar value={0.7} material="oxblood">  trilho gravado + preenchimento chapado
//
// As imagens sao geradas por scripts/ui-pixel.py a partir dos tilesets, ja
// recoloridas pra paleta "estela" (materials.ts). Regras da direcao de arte
// valem aqui tambem: superficie chapada, sem glow, sem blur, sem radius.
// ══════════════════════════════════════════════════════════════════════
import React from 'react';
import { MATERIAL, INK, type MaterialName } from '../systems/materials';

type Mat = MaterialName | 'neutral';

/** Material de acento de cada ato/modo — espelha ACT_THEMES (synergies.tsx). */
export const actMaterial = (gameMode: string): MaterialName => (
  gameMode === 'act2' ? 'verdigris'
  : gameMode === 'act3' ? 'ember'
  : gameMode === 'act4' ? 'frost'
  : gameMode === 'act5' ? 'amethyst'
  : gameMode === 'act6' ? 'slate'
  : gameMode === 'act7' ? 'verdigris'
  : gameMode === 'act8' ? 'frost'
  : gameMode === 'act9' ? 'ember'
  : gameMode === 'act10' ? 'amethyst'
  : gameMode === 'cursed' ? 'amethyst'
  : 'gold'
);

const PANEL_SLICE = 8;    // px do PNG 2x (4 nativos) que viram moldura
const BUTTON_SLICE = 8;   // 4 nativos: chanfro de 2 + 2 de folga
const BAR_SLICE = 4;      // 2 nativos: sulco de 1 + 1

const nineSlice = (file: string, slice: number): React.CSSProperties => ({
  borderStyle: 'solid',
  borderWidth: slice,
  borderImage: `url(./ui/pixel/${file}.png) ${slice} fill / ${slice}px round`,
  imageRendering: 'pixelated',
});

// ── Painel ─────────────────────────────────────────────────────────────
export interface PixelPanelProps extends React.HTMLAttributes<HTMLDivElement> {
  material?: Mat;
  /** variante elevada (hover, celula ativa) */
  hi?: boolean;
  /** ref opcional (o painel do chefe e preenchido por DOM direto) */
  innerRef?: React.Ref<HTMLDivElement>;
}
export const PixelPanel: React.FC<PixelPanelProps> = ({ material = 'neutral', hi, innerRef, style, className = '', children, ...rest }) => (
  <div ref={innerRef} className={`pixel-panel ${className}`}
    style={{ ...nineSlice(`panel_${material}${hi ? '_hi' : ''}`, PANEL_SLICE), ...style }} {...rest}>
    {children}
  </div>
);

// ── Botao ──────────────────────────────────────────────────────────────
export interface PixelButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  material?: Mat;
  /** aceso (selecionado / ativo) */
  active?: boolean;
}
export const PixelButton: React.FC<PixelButtonProps> = ({ material = 'neutral', active, style, className = '', children, ...rest }) => (
  <button className={`pixel-btn ${active ? 'is-active' : ''} ${className}`}
    style={{
      ...nineSlice(`button_${material}${active ? '_hi' : ''}`, BUTTON_SLICE),
      color: active ? '#131110' : INK.base,
      ...style,
    }} {...rest}>
    {children}
  </button>
);

// ── Barra ──────────────────────────────────────────────────────────────
export interface PixelBarProps extends React.HTMLAttributes<HTMLDivElement> {
  /** 0..1 */
  value: number;
  material?: MaterialName;
  /** ref do preenchimento, pra quem atualiza por DOM direto (barra do chefe) */
  fillRef?: React.Ref<HTMLDivElement>;
  height?: number;
}
export const PixelBar: React.FC<PixelBarProps> = ({ value, material = 'ember', fillRef, height = 12, style, className = '', ...rest }) => (
  <div className={`pixel-bar ${className}`} style={{ ...nineSlice('bar', BAR_SLICE), height, ...style }} {...rest}>
    <div ref={fillRef} className="pixel-bar-fill" style={{
      width: `${Math.max(0, Math.min(1, value)) * 100}%`,
      background: MATERIAL[material].base,
      boxShadow: `inset 0 2px 0 ${MATERIAL[material].dim}`,   // 1 pixel (2x) de sombra no topo = "gravado", nao glow
    }} />
  </div>
);
