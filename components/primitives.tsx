// ══════════════════════════════════════════════════════════════════
// GRIMHOLD — PRIMITIVAS
// Tier 0.3 — os tijolos compartilhados de toda a UI
//
// Hoje cada painel reimplementa header, card, botão e barra à mão
// (com gradiente + glow + blur). Estas primitivas substituem tudo
// isso. Reestilizar um painel vira, na prática, trocar as <div>
// por estes componentes.
// ══════════════════════════════════════════════════════════════════
import React from 'react';
import { t } from '../i18n';
import {
  STONE, LINE, INK, GROOVE, MATERIAL, TYPE, FONT,
  engraved, carved, recessed, lifted,
  type Material,
} from './data/materials';
import { Sigil, type SigilName } from './Sigil';
import { PixelIcon } from './ui/PixelIcon';

// ── Pixel (B1b) ─────────────────────────────────────────────────────
// Nome do material (pra achar button_<nome>.png) a partir do objeto Material.
const materialName = (m: Material): string =>
  (Object.entries(MATERIAL).find(([, v]) => v.base === m.base)?.[0]) ?? 'neutral';
// Sigil (SVG de linha) -> icone pixel do Time Fantasy quando existe um equivalente.
const PIXEL_ICON: Record<string, string> = {
  swords: 'swords', skull: 'skull', flame: 'flame', shield: 'shield', heart: 'heart', sprout: 'leaf',
  infinity: 'hourglass', dice: 'sparkle', dove: 'heart', lock: 'lock', check: 'check', cross: 'cross',
  tome: 'tome', scroll: 'scroll', crown: 'crown', gem: 'gem', coin: 'coin', anvil: 'hammer', star: 'star',
  trophy: 'trophy', gear: 'gear', mail: 'mail', potion: 'potion', frost: 'ice', bolt: 'bolt',
};

// ─── SURFACE ──────────────────────────────────────────────────────
// Superfície de pedra. Substitui todo `background: linear-gradient(...)`.
interface SurfaceProps extends React.HTMLAttributes<HTMLDivElement> {
  level?: 0 | 1 | 2 | 3;
  bordered?: boolean;
  elevated?: boolean;
  children?: React.ReactNode;
}
export const Surface: React.FC<SurfaceProps> = ({
  level = 1, bordered = true, elevated = false, style, children, ...rest
}) => (
  <div
    style={{
      background: [STONE.s0, STONE.s1, STONE.s2, STONE.s3][level],
      border: bordered ? `1px solid ${LINE.base}` : undefined,
      borderRadius: 0,
      ...(elevated ? lifted : carved),
      ...style,
    }}
    {...rest}
  >
    {children}
  </div>
);

// ─── PANEL FRAME ──────────────────────────────────────────────────
// Moldura de painel com cantos gravados. Substitui o card arredondado
// com glow que hoje envolve cada painel.
interface PanelFrameProps {
  accent?: string;
  children: React.ReactNode;
  style?: React.CSSProperties;
}
export const PanelFrame: React.FC<PanelFrameProps> = ({
  accent = LINE.base, children, style,
}) => (
  <div style={{ position: 'relative', background: STONE.s1, border: `1px solid ${LINE.base}`, ...lifted, ...style }}>
    {([
      { top: -1, left: -1, borderTop: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` },
      { top: -1, right: -1, borderTop: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
      { bottom: -1, left: -1, borderBottom: `2px solid ${accent}`, borderLeft: `2px solid ${accent}` },
      { bottom: -1, right: -1, borderBottom: `2px solid ${accent}`, borderRight: `2px solid ${accent}` },
    ] as React.CSSProperties[]).map((c, i) => (
      <span key={i} style={{ position: 'absolute', width: 12, height: 12, pointerEvents: 'none', ...c }} />
    ))}
    {children}
  </div>
);

// ─── PANEL HEADER ─────────────────────────────────────────────────
interface PanelHeaderProps {
  title: string;
  /** parte destacada do título, ex: A <b>FORJA</b> */
  highlight?: string;
  subtitle?: string;
  accent?: string;
  onBack?: () => void;
  right?: React.ReactNode;
}
export const PanelHeader: React.FC<PanelHeaderProps> = ({
  title, highlight, subtitle, accent = MATERIAL.ember.base, onBack, right,
}) => (
  <div style={{
    display: 'flex', justifyContent: 'space-between', alignItems: 'center',
    padding: '20px 26px', borderBottom: `1px solid ${LINE.base}`, background: STONE.s0,
  }}>
    {onBack ? (
      <button
        onClick={onBack}
        style={{
          ...TYPE.label, fontSize: 12, letterSpacing: '.2em',
          color: INK.dim, background: 'transparent', border: 'none', cursor: 'pointer',
          display: 'flex', alignItems: 'center', gap: 6,
        }}
      >
        <Sigil name="chevronL" size={14} /> {t('ui.common.back')}
      </button>
    ) : <span style={{ width: 80 }} />}

    <div style={{ textAlign: 'center' }}>
      <h1 style={{ ...TYPE.pageTitle, color: '#462e23', margin: 0, ...engraved }}>
        {title}{highlight && <b style={{ color: accent, fontWeight: 800 }}> {highlight}</b>}
      </h1>
      {subtitle && (
        <p style={{ ...TYPE.label, color: INK.faint, marginTop: 5 }}>{subtitle}</p>
      )}
    </div>

    <div style={{ minWidth: 80, display: 'flex', justifyContent: 'flex-end' }}>{right}</div>
  </div>
);

// ─── ICON NICHE ───────────────────────────────────────────────────
// Nicho fundo onde o sigilo mora. Substitui o ícone-emoji com glow.
export const IconNiche: React.FC<{
  icon: SigilName | string; material: Material; size?: number;
}> = ({ icon, material, size = 46 }) => (
  <div className="pixel-panel" style={{
    width: size, height: size, flexShrink: 0,
    borderStyle: 'solid', borderWidth: 8, imageRendering: 'pixelated',
    borderImage: `url(./ui/pixel/panel_${materialName(material)}_hi.png) 8 fill / 8px round`,
    display: 'flex', alignItems: 'center', justifyContent: 'center',
    color: material.base,
  }}>
    {PIXEL_ICON[icon as string]
      ? <PixelIcon name={PIXEL_ICON[icon as string]} size={Math.round(size * 0.62)} />
      : <Sigil name={icon} size={Math.round(size * 0.52)} />}
  </div>
);

// ─── CARVED BUTTON ────────────────────────────────────────────────
interface CarvedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  material?: Material;
  variant?: 'solid' | 'ghost';
  full?: boolean;
  icon?: SigilName;
}
export const CarvedButton: React.FC<CarvedButtonProps> = ({
  material = MATERIAL.ember, variant = 'solid', full, icon, disabled,
  children, style, ...rest
}) => (
  <button
    disabled={disabled}
    className="pixel-btn"
    style={{
      width: full ? '100%' : undefined,
      padding: '8px 18px 10px',
      fontFamily: FONT.display, fontSize: 16, letterSpacing: '.1em',
      borderStyle: 'solid', borderWidth: 8, imageRendering: 'pixelated',
      borderImage: `url(./ui/pixel/button_${variant === 'ghost' || disabled ? 'neutral' : materialName(material)}.png) 8 fill / 8px round`,
      color: disabled ? INK.faint : INK.base,
      cursor: disabled ? 'not-allowed' : 'pointer',
      display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 8,
      ...style,
    }}
    {...rest}
  >
    {icon && (PIXEL_ICON[icon as string] ? <PixelIcon name={PIXEL_ICON[icon as string]} size={20} /> : <Sigil name={icon} size={15} />)}
    {children}
  </button>
);

// ─── BAR ──────────────────────────────────────────────────────────
// Barra de progresso chapada. Substitui a barra com gradiente + glow.
export const Bar: React.FC<{
  value: number; max?: number; material?: Material;
  width?: number | string; height?: number; hatched?: boolean;
}> = ({ value, max = 100, material = MATERIAL.ember, width = '100%', height = 8, hatched }) => (
  <div className="pixel-bar" style={{
    width, height: Math.max(height, 12), position: 'relative',
    borderStyle: 'solid', borderWidth: 4, imageRendering: 'pixelated',
    borderImage: 'url(./ui/pixel/bar.png) 4 fill / 4px round', overflow: 'hidden',
  }}>
    <div style={{
      height: '100%',
      width: `${Math.max(0, Math.min(100, (value / max) * 100))}%`,
      background: material.base,
      backgroundImage: hatched
        ? 'repeating-linear-gradient(45deg,transparent,transparent 3px,rgba(0,0,0,.18) 3px,rgba(0,0,0,.18) 4px)'
        : undefined,
      boxShadow: `inset 0 1px 0 ${GROOVE.hi}`,
    }} />
  </div>
);

// ─── PIPS ─────────────────────────────────────────────────────────
// Níveis discretos (ex: 3/5 da Forja). Sulcos que enchem de material.
export const Pips: React.FC<{
  filled: number; total: number; material?: Material; showFraction?: boolean;
}> = ({ filled, total, material = MATERIAL.ember, showFraction = true }) => (
  <div style={{ display: 'flex', gap: 5, alignItems: 'center' }}>
    {Array.from({ length: total }).map((_, i) => (
      <i key={i} style={{
        flex: 1, height: 8,
        background: i < filled ? material.base : STONE.s3,
        border: `1px solid ${i < filled ? 'transparent' : GROOVE.lo}`,
        boxShadow: i < filled ? `inset 0 1px 0 ${GROOVE.hi}` : 'inset 0 1px 2px rgba(0,0,0,.5)',
      }} />
    ))}
    {showFraction && (
      <span style={{ ...TYPE.numeral, color: INK.faint, marginLeft: 4 }}>{filled}/{total}</span>
    )}
  </div>
);

// ─── BADGE ────────────────────────────────────────────────────────
// Rótulo de categoria/raridade gravado. Substitui a pill arredondada.
export const Badge: React.FC<{
  label: string; material: Material; mark?: string;
}> = ({ label, material, mark }) => (
  <span style={{
    display: 'inline-flex', alignItems: 'center', gap: 4,
    ...TYPE.label, fontSize: 12, letterSpacing: '.16em',
    color: material.base, border: `1px solid ${material.dim}`,
    padding: '2px 6px', background: STONE.s0, borderRadius: 0,
  }}>
    {mark && <span>{mark}</span>}{label}
  </span>
);

// ─── STAT READOUT ─────────────────────────────────────────────────
// Leitura de recurso da HUD (ouro, essência...).
export const StatReadout: React.FC<{
  icon: SigilName; value: React.ReactNode; label: string; material: Material;
}> = ({ icon, value, label, material }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 9 }}>
    <IconNiche icon={icon} material={material} size={26} />
    <div style={{ lineHeight: 1.05 }}>
      <div style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 17, color: INK.base }}>{value}</div>
      <div style={{ ...TYPE.numeral, fontSize: 13, letterSpacing: '.16em', color: INK.faint, textTransform: 'uppercase' }}>{label}</div>
    </div>
  </div>
);

// ─── DIVIDER ──────────────────────────────────────────────────────
export const Divider: React.FC<{ label?: string; accent?: string }> = ({ label, accent = INK.faint }) => (
  <div style={{ display: 'flex', alignItems: 'center', gap: 14, margin: '18px 0', color: accent }}>
    <span style={{ flex: 1, height: 1, background: LINE.base }} />
    {label && <span style={{ ...TYPE.label, fontSize: 12, color: accent }}>{label}</span>}
    <span style={{ flex: 1, height: 1, background: LINE.base }} />
  </div>
);
