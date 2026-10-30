// ══════════════════════════════════════════════════════════════════════
// components/ui/PixelCard.tsx — a carta-molde do jogo.
//
// Veste qualquer carta (level-up, loja, diario, gacha, compendio) com a
// imagem gerada por scripts/carta-pixel.py (public/ui/pixel/card_<raridade>.png)
// e poe cada pedaco na janela certa (CARD_LAYOUT, em px da imagem 300x420).
// A carta pode ser desenhada em outro tamanho: `scale` escala tudo junto.
//
// Slots: title (placa de metal), art (janela escura), tag (aba de raridade),
// body (pergaminho) e foot (rodape). Tudo posicionado em absoluto sobre a
// imagem, entao o layout do molde manda; o React so preenche.
// ══════════════════════════════════════════════════════════════════════
import React, { useLayoutEffect, useRef } from 'react';
import { CARD_W, CARD_H, CARD_LAYOUT, CARD_MONSTER_W, CARD_MONSTER_H, CARD_MONSTER_LAYOUT } from '../data/cardFrame';
import { INK } from '../systems/materials';

export type CardRarity = 'common' | 'uncommon' | 'rare' | 'legendary' | 'mythic';
/** Carta de monstro: a "raridade" e o nivel de ameaca (card_monster_<ameaca>.png). */
export type CardThreat = 'low' | 'medium' | 'high' | 'boss';

const RARITY_INK: Record<string, string> = {
  common: '#a4a4a4', uncommon: '#6fcf8a', rare: '#7fb0ee', legendary: '#f0c860', mythic: '#c9a0f5',
  low: '#b8b0a4', medium: '#e8c66a', high: '#e07a5a', boss: '#ff5a48',
};

export interface PixelCardProps extends Omit<React.HTMLAttributes<HTMLDivElement>, 'title'> {
  rarity: CardRarity | CardThreat;
  /** 'hero' (pergaminho, padrao) ou 'monster' (lapide, bestiario) */
  variant?: 'hero' | 'monster';
  title: React.ReactNode;
  art: React.ReactNode;
  /** texto da aba de raridade (ex.: "★ RARO") */
  tag?: React.ReactNode;
  body: React.ReactNode;
  foot?: React.ReactNode;
  /** 1 = 300x420 */
  scale?: number;
  selected?: boolean;
}

// Encolhe a fonte ate o texto caber na janela (o molde tem altura fixa; antes
// descricoes longas eram cortadas e nem o mouse em cima mostrava o resto).
const Ajustado: React.FC<{ base: number; min: number; style: React.CSSProperties; className?: string; children: React.ReactNode }> = ({ base, min, style, className, children }) => {
  const ref = useRef<HTMLDivElement>(null);
  useLayoutEffect(() => {
    const el = ref.current; if (!el) return;
    const ajustar = () => {
      let fs = base; el.style.fontSize = fs + 'px';
      while (fs > min && (el.scrollHeight > el.clientHeight + 1 || el.scrollWidth > el.clientWidth + 1)) {
        fs -= 0.5; el.style.fontSize = fs + 'px';
      }
    };
    ajustar();
    // a carta de level-up troca a descricao curta pela completa no hover
    // (CSS .upg-card:hover): reajusta depois da transicao e volta ao sair
    const carta = el.closest('.pixel-card');
    let timer = 0;
    const entrou = () => { timer = window.setTimeout(ajustar, 280); };
    const saiu = () => { window.clearTimeout(timer); window.setTimeout(ajustar, 280); };
    carta?.addEventListener('mouseenter', entrou); carta?.addEventListener('mouseleave', saiu);
    return () => { window.clearTimeout(timer); carta?.removeEventListener('mouseenter', entrou); carta?.removeEventListener('mouseleave', saiu); };
  }, [children, base, min]);
  return <div ref={ref} className={className} style={{ ...style, fontSize: base }}>{children}</div>;
};

const slotOf = (layout: Record<string, [number, number, number, number]>) => (k: string, scale: number): React.CSSProperties => {
  const [x, y, w, h] = layout[k];
  return { position: 'absolute', left: x * scale, top: y * scale, width: w * scale, height: h * scale };
};

export const PixelCard: React.FC<PixelCardProps> = ({ rarity, variant = 'hero', title, art, tag, body, foot, scale = 1, selected, style, className = '', ...rest }) => {
  const monster = variant === 'monster';
  const slot = slotOf(monster ? CARD_MONSTER_LAYOUT : CARD_LAYOUT);
  const cw = monster ? CARD_MONSTER_W : CARD_W, ch = monster ? CARD_MONSTER_H : CARD_H;
  // tinta do corpo: escura no pergaminho, osso na lapide
  const bodyInk = monster ? '#d2c6b4' : '#231b10';
  const footInk = monster ? '#a4988a' : '#3a2c14';
  return (
  <div className={`pixel-card ${className}`} style={{
    position: 'relative', width: cw * scale, height: ch * scale, flexShrink: 0,
    backgroundImage: `url(./ui/pixel/card_${monster ? 'monster_' : ''}${rarity}.png)`, backgroundSize: '100% 100%', imageRendering: 'pixelated',
    filter: selected ? 'brightness(1.12)' : undefined,
    ...style,
  }} {...rest}>
    <Ajustado base={22 * scale} min={13 * scale} className="pixel-display" style={{ ...slot('title', scale), display: 'flex', alignItems: 'center', justifyContent: 'center', lineHeight: 1, color: RARITY_INK[rarity], padding: `0 ${8 * scale}px`, overflow: 'hidden', whiteSpace: 'nowrap' }}>
      {title}
    </Ajustado>
    <div style={{ ...slot('art', scale), display: 'flex', alignItems: 'center', justifyContent: 'center', overflow: 'hidden' }}>
      {art}
    </div>
    {tag !== undefined && (
      <div className="pixel-text" style={{ ...slot('tag', scale), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 13 * scale, letterSpacing: '0.14em', lineHeight: 1, color: RARITY_INK[rarity], textTransform: 'uppercase', whiteSpace: 'nowrap' }}>
        {tag}
      </div>
    )}
    <Ajustado base={18 * scale} min={11 * scale} className="pixel-text pixel-card-body" style={{ ...slot('body', scale), lineHeight: 1.12, color: bodyInk, textShadow: 'none', textAlign: 'center', overflow: 'hidden', padding: `${4 * scale}px ${2 * scale}px` }}>
      {body}
    </Ajustado>
    {foot !== undefined && (
      <div className="pixel-text" style={{ ...slot('foot', scale), display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 14 * scale, lineHeight: 1, color: footInk, textShadow: 'none', whiteSpace: 'nowrap' }}>
        {foot}
      </div>
    )}
  </div>
  );
};

export const cardInk = (rarity: CardRarity | CardThreat) => RARITY_INK[rarity] ?? INK.base;
