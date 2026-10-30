// ══════════════════════════════════════════════════════════════════════
// CharacterEndingScreen.tsx
// Act 5 victory ending — character-specific epilogue (MK-style, 3 panels)
// ══════════════════════════════════════════════════════════════════════

import React, { useState, useEffect, useRef } from 'react';
import { PixelPanel } from './ui/Pixel';
import { INK, LINE } from './systems/materials';
import { t } from '../i18n';

// ── Types ─────────────────────────────────────────────────────────────
interface EndingPanel { text: string; }
interface CharacterEnding {
  type: string;
  name: string;
  title: string;
  color: string;
  icon: string;
  panels: [EndingPanel, EndingPanel, EndingPanel];
}

export interface CharacterEndingScreenProps {
  heroType: string;
  onClose: () => void;
  rodape?: string;   // chave i18n do rodape (padrao ui.ending.footer = Ato V; o X passa ui.ending.footer.act10)
}

// ── Endings data ───────────────────────────────────────────────────────
const ENDINGS: CharacterEnding[] = [
  {
    type: 'mage', get name() { return t('ending.mage.name'); }, get title() { return t('ending.mage.title'); }, color: '#9cabaf', icon: '🔮',
    panels: [
      { get text() { return t('ending.mage.panel.0'); } },
      { get text() { return t('ending.mage.panel.1'); } },
      { get text() { return t('ending.mage.panel.2'); } },
    ],
  },
  {
    type: 'archer', get name() { return t('ending.archer.name'); }, get title() { return t('ending.archer.title'); }, color: '#bc8e78', icon: '🏹',
    panels: [
      { get text() { return t('ending.archer.panel.0'); } },
      { get text() { return t('ending.archer.panel.1'); } },
      { get text() { return t('ending.archer.panel.2'); } },
    ],
  },
  {
    type: 'druid', get name() { return t('ending.druid.name'); }, get title() { return t('ending.druid.title'); }, color: '#959e87', icon: '🌿',
    panels: [
      { get text() { return t('ending.druid.panel.0'); } },
      { get text() { return t('ending.druid.panel.1'); } },
      { get text() { return t('ending.druid.panel.2'); } },
    ],
  },
  {
    type: 'cleric', get name() { return t('ending.cleric.name'); }, get title() { return t('ending.cleric.title'); }, color: '#d9c1b6', icon: '☀️',
    panels: [
      { get text() { return t('ending.cleric.panel.0'); } },
      { get text() { return t('ending.cleric.panel.1'); } },
      { get text() { return t('ending.cleric.panel.2'); } },
    ],
  },
  {
    type: 'paladin', get name() { return t('ending.paladin.name'); }, get title() { return t('ending.paladin.title'); }, color: '#d9c1b6', icon: '🛡️',
    panels: [
      { get text() { return t('ending.paladin.panel.0'); } },
      { get text() { return t('ending.paladin.panel.1'); } },
      { get text() { return t('ending.paladin.panel.2'); } },
    ],
  },
  {
    type: 'warlock', get name() { return t('ending.warlock.name'); }, get title() { return t('ending.warlock.title'); }, color: '#c3b3bf', icon: '👁️',
    panels: [
      { get text() { return t('ending.warlock.panel.0'); } },
      { get text() { return t('ending.warlock.panel.1'); } },
      { get text() { return t('ending.warlock.panel.2'); } },
    ],
  },
  {
    type: 'priest', get name() { return t('ending.priest.name'); }, get title() { return t('ending.priest.title'); }, color: '#ced0cb', icon: '✚',
    panels: [
      { get text() { return t('ending.priest.panel.0'); } },
      { get text() { return t('ending.priest.panel.1'); } },
      { get text() { return t('ending.priest.panel.2'); } },
    ],
  },
  {
    type: 'necromancer', get name() { return t('ending.necromancer.name'); }, get title() { return t('ending.necromancer.title'); }, color: '#9cabaf', icon: '💀',
    panels: [
      { get text() { return t('ending.necromancer.panel.0'); } },
      { get text() { return t('ending.necromancer.panel.1'); } },
      { get text() { return t('ending.necromancer.panel.2'); } },
    ],
  },
  {
    type: 'bard', get name() { return t('ending.bard.name'); }, get title() { return t('ending.bard.title'); }, color: '#c59993', icon: '🎵',
    panels: [
      { get text() { return t('ending.bard.panel.0'); } },
      { get text() { return t('ending.bard.panel.1'); } },
      { get text() { return t('ending.bard.panel.2'); } },
    ],
  },
  {
    type: 'runesmith', get name() { return t('ending.runesmith.name'); }, get title() { return t('ending.runesmith.title'); }, color: '#b6bebe', icon: '⚡',
    panels: [
      { get text() { return t('ending.runesmith.panel.0'); } },
      { get text() { return t('ending.runesmith.panel.1'); } },
      { get text() { return t('ending.runesmith.panel.2'); } },
    ],
  },
  {
    type: 'sylvanite', get name() { return t('ending.sylvanite.name'); }, get title() { return t('ending.sylvanite.title'); }, color: '#78866c', icon: '🌲',
    panels: [
      { get text() { return t('ending.sylvanite.panel.0'); } },
      { get text() { return t('ending.sylvanite.panel.1'); } },
      { get text() { return t('ending.sylvanite.panel.2'); } },
    ],
  },
  {
    type: 'dreadlord', get name() { return t('ending.dreadlord.name'); }, get title() { return t('ending.dreadlord.title'); }, color: '#c59993', icon: '🔥',
    panels: [
      { get text() { return t('ending.dreadlord.panel.0'); } },
      { get text() { return t('ending.dreadlord.panel.1'); } },
      { get text() { return t('ending.dreadlord.panel.2'); } },
    ],
  },
  {
    type: 'jester', get name() { return t('ending.jester.name'); }, get title() { return t('ending.jester.title'); }, color: '#c3b3bf', icon: '🎭',
    panels: [
      { get text() { return t('ending.jester.panel.0'); } },
      { get text() { return t('ending.jester.panel.1'); } },
      { get text() { return t('ending.jester.panel.2'); } },
    ],
  },
  {
    type: 'vex', get name() { return t('ending.vex.name'); }, get title() { return t('ending.vex.title'); }, color: '#c3b3bf', icon: '🗡️',
    panels: [
      { get text() { return t('ending.vex.panel.0'); } },
      { get text() { return t('ending.vex.panel.1'); } },
      { get text() { return t('ending.vex.panel.2'); } },
    ],
  },
  {
    type: 'zylvara', get name() { return t('ending.zylvara.name'); }, get title() { return t('ending.zylvara.title'); }, color: '#b6bebe', icon: '🌑',
    panels: [
      { get text() { return t('ending.zylvara.panel.0'); } },
      { get text() { return t('ending.zylvara.panel.1'); } },
      { get text() { return t('ending.zylvara.panel.2'); } },
    ],
  },
  {
    type: 'morrigan', get name() { return t('ending.morrigan.name'); }, get title() { return t('ending.morrigan.title'); }, color: '#af9bb1', icon: '🕯️',
    panels: [
      { get text() { return t('ending.morrigan.panel.0'); } },
      { get text() { return t('ending.morrigan.panel.1'); } },
      { get text() { return t('ending.morrigan.panel.2'); } },
    ],
  },
  {
    type: 'ixara', get name() { return t('ending.ixara.name'); }, get title() { return t('ending.ixara.title'); }, color: '#c3b3bf', icon: '✨',
    panels: [
      { get text() { return t('ending.ixara.panel.0'); } },
      { get text() { return t('ending.ixara.panel.1'); } },
      { get text() { return t('ending.ixara.panel.2'); } },
    ],
  },
  {
    type: 'berserker', get name() { return t('ending.berserker.name'); }, get title() { return t('ending.berserker.title'); }, color: '#b27870', icon: '🪓',
    panels: [
      { get text() { return t('ending.berserker.panel.0'); } },
      { get text() { return t('ending.berserker.panel.1'); } },
      { get text() { return t('ending.berserker.panel.2'); } },
    ],
  },
  {
    type: 'frost_warden', get name() { return t('ending.frost_warden.name'); }, get title() { return t('ending.frost_warden.title'); }, color: '#b6bebe', icon: '❄️',
    panels: [
      { get text() { return t('ending.frost_warden.panel.0'); } },
      { get text() { return t('ending.frost_warden.panel.1'); } },
      { get text() { return t('ending.frost_warden.panel.2'); } },
    ],
  },
  {
    type: 'inquisitor', get name() { return t('ending.inquisitor.name'); }, get title() { return t('ending.inquisitor.title'); }, color: '#b98e79', icon: '⚖️',
    panels: [
      { get text() { return t('ending.inquisitor.panel.0'); } },
      { get text() { return t('ending.inquisitor.panel.1'); } },
      { get text() { return t('ending.inquisitor.panel.2'); } },
    ],
  },
  {
    type: 'yue', get name() { return t('ending.yue.name'); }, get title() { return t('ending.yue.title'); }, color: '#e8a0c8', icon: '🎭',
    panels: [
      { get text() { return t('ending.yue.panel.0'); } },
      { get text() { return t('ending.yue.panel.1'); } },
      { get text() { return t('ending.yue.panel.2'); } },
    ],
  },
  {
    type: 'billy', get name() { return t('ending.billy.name'); }, get title() { return t('ending.billy.title'); }, color: '#e8b04a', icon: '🎩',
    panels: [
      { get text() { return t('ending.billy.panel.0'); } },
      { get text() { return t('ending.billy.panel.1'); } },
      { get text() { return t('ending.billy.panel.2'); } },
    ],
  },
  {
    type: 'malachar_human', get name() { return t('ending.malachar_human.name'); }, get title() { return t('ending.malachar_human.title'); }, color: '#c3b3bf', icon: '⚔️',
    panels: [
      { get text() { return t('ending.malachar_human.panel.0'); } },
      { get text() { return t('ending.malachar_human.panel.1'); } },
      { get text() { return t('ending.malachar_human.panel.2'); } },
    ],
  },
];

// ── Typewriter hook ────────────────────────────────────────────────────
function useTypewriter(text: string, speed = 22, active = true) {
  const [displayed, setDisplayed] = useState('');
  const [done, setDone] = useState(false);
  const idx = useRef(0);

  useEffect(() => {
    setDisplayed('');
    setDone(false);
    idx.current = 0;
    if (!active) { setDisplayed(text); setDone(true); return; }
    const id = setInterval(() => {
      idx.current++;
      setDisplayed(text.slice(0, idx.current));
      if (idx.current >= text.length) { clearInterval(id); setDone(true); }
    }, speed);
    return () => clearInterval(id);
  }, [text, active]);

  // Pula para o fim: o contador tambem vai ao fim, senao o setInterval ainda vivo reescrevia
  // o texto parcial no tique seguinte (clicar mostrava tudo por um instante e voltava a digitar).
  const skip = () => { idx.current = text.length; setDisplayed(text); setDone(true); };
  return { displayed, done, skip };
}

// ── Component ──────────────────────────────────────────────────────────
export const CharacterEndingScreen: React.FC<CharacterEndingScreenProps> = ({ heroType, onClose, rodape }) => {
  const ending = ENDINGS.find(e => e.type === heroType) ?? ENDINGS[0];
  if (!ending || !ending.panels) return null;

  const [panelIdx, setPanelIdx] = useState(0);
  const [fadeIn, setFadeIn] = useState(true);
  const [finalFade, setFinalFade] = useState(false);

  const safePanelIdx = Math.min(panelIdx, ending.panels.length - 1);
  const currentPanel = ending.panels[safePanelIdx] ?? ending.panels[0];
  const { displayed, done, skip } = useTypewriter(currentPanel?.text ?? '', 20, fadeIn);

  const goNext = () => {
    if (finalFade) return;
    if (!done) { skip(); return; }
    if (panelIdx < 2) {
      setFadeIn(false);
      setTimeout(() => { setPanelIdx(p => p + 1); setFadeIn(true); }, 400);
    } else {
      // final panel → fade to black → close
      setFinalFade(true);
      setTimeout(onClose, 1800);
    }
  };

  const handleKey = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); goNext(); }
    if (e.key === 'Escape') { setFinalFade(true); setTimeout(onClose, 600); }
  };

  const capitulo = ['I', 'II', 'III'][safePanelIdx];

  return (
    <div
      tabIndex={0} onKeyDown={handleKey}
      onClick={goNext}
      style={{
        position: 'fixed', inset: 0, zIndex: 200,
        background: '#000',
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', justifyContent: 'center',
        fontFamily: 'var(--font-pixel)',
        cursor: 'pointer',
        outline: 'none',
      }}
    >
      <style>{`
        @keyframes endingFadeIn { from { opacity:0; transform:translateY(12px); } to { opacity:1; transform:translateY(0); } }
        @keyframes endingPulse { 0%,100% { opacity:.55; } 50% { opacity:1; } }
        @keyframes endingSceneIn { from { opacity:0; } to { opacity:1; } }
      `}</style>

      {/* cena: a muralha de Grimhold ao anoitecer, escurecida — a vigilia acabou */}
      <div style={{
        position: 'absolute', inset: 0,
        backgroundImage: 'url(./ui/pixel/menu_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom',
        imageRendering: 'pixelated',
        opacity: finalFade ? 0 : 0.45,
        transition: finalFade ? 'opacity 1.8s ease' : 'none',
        animation: 'endingSceneIn 1.2s ease both',
      }} />
      <div style={{
        position: 'absolute', inset: 0,
        background: 'radial-gradient(ellipse at 50% 60%, rgba(8,6,10,0.15) 0%, rgba(8,6,10,0.85) 70%, #000 100%)',
        opacity: finalFade ? 0 : 1, transition: finalFade ? 'opacity 1.8s ease' : 'none',
      }} />

      {/* rotulo acima do cartao */}
      <div style={{
        position: 'relative', zIndex: 3, marginBottom: 14,
        fontFamily: 'var(--font-pixel-display)', fontSize: 22, letterSpacing: '0.3em', color: INK.faint,
        textShadow: '0 2px 0 #000',
        opacity: finalFade ? 0 : 1, transition: 'opacity 0.6s ease',
      }}>
        {t('ui.ending.label')} · {capitulo}
      </div>

      {/* cartao principal — painel de pedra pixel; a cor do heroi fica no texto */}
      <PixelPanel material="neutral" style={{
        position: 'relative', zIndex: 3,
        width: 'clamp(600px, 58vw, 880px)', maxWidth: '94vw',
        padding: '24px 30px',
        animation: fadeIn ? 'endingFadeIn 0.4s steps(6) both' : 'none',
        opacity: fadeIn && !finalFade ? 1 : 0,
        transition: !fadeIn ? 'opacity 0.35s ease' : finalFade ? 'opacity 1.2s ease' : 'none',
      }}>

        {/* cabecalho: retrato, nome e titulo do heroi */}
        <div style={{ marginBottom: 16, display: 'flex', alignItems: 'center', gap: 16 }}>
          <PixelPanel material="neutral" hi style={{ padding: 4, flexShrink: 0, lineHeight: 0 }}>
            <img src={`./ui/pixel/avatars/${ending.type}.png`} alt="" width={72} height={72}
              style={{ imageRendering: 'pixelated', display: 'block' }}
              onError={(e) => { (e.currentTarget as HTMLImageElement).style.display = 'none'; }} />
          </PixelPanel>
          <div>
            <div style={{ fontFamily: 'var(--font-pixel-display)', fontSize: 34, lineHeight: 1, color: ending.color, letterSpacing: '0.08em', textShadow: '0 2px 0 #0b0906' }}>
              {ending.name.toUpperCase()}
            </div>
            <div style={{ fontSize: 15, color: INK.faint, letterSpacing: '0.2em', textTransform: 'uppercase', marginTop: 5 }}>
              {ending.title}
            </div>
          </div>

          {/* contador de paineis: 3 blocos */}
          <div style={{ marginLeft: 'auto', display: 'flex', gap: 6, alignItems: 'center' }}>
            {[0,1,2].map(i => (
              <div key={i} style={{ width: 24, height: 8, background: i <= panelIdx ? ending.color : '#0b0906', border: `2px solid ${i <= panelIdx ? ending.color : LINE.soft}`, transition: 'background 0.4s' }} />
            ))}
          </div>
        </div>

        <div style={{ height: 2, background: LINE.soft, marginBottom: 18 }} />

        {/* texto do painel (datilografado) */}
        <div style={{ minHeight: 'clamp(130px,18vh,220px)', fontSize: 19, color: INK.base, lineHeight: 1.55 }}>
          {displayed}
          {!done && <span style={{ animation: 'endingPulse 0.8s steps(2) infinite', color: ending.color }}>▌</span>}
        </div>

        <div style={{ height: 2, background: LINE.soft, margin: '18px 0 12px' }} />

        {/* rodape */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
          <div style={{ fontSize: 13, color: INK.ghost, letterSpacing: '0.16em', textTransform: 'uppercase' }}>
            {t(rodape ?? 'ui.ending.footer')}
          </div>
          <div style={{
            fontSize: 14, color: done ? ending.color : INK.faint,
            letterSpacing: '0.16em', textTransform: 'uppercase',
            animation: done ? 'endingPulse 1.4s steps(2) infinite' : 'none',
            transition: 'color 0.3s',
          }}>
            {panelIdx < 2
              ? (done ? t('ui.ending.continue') : t('ui.ending.skip'))
              : (done ? t('ui.ending.theEnd') : t('ui.ending.skip'))}
          </div>
        </div>

      </PixelPanel>
    </div>
  );
};
