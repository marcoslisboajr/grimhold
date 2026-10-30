// ══════════════════════════════════════════════════════════════════════
// components/panels/WaveSummaryOverlay.tsx
// Wave summary — px no espaco do canvas; .hud-fixo (index.css) escala junto com o campo
// ══════════════════════════════════════════════════════════════════════

import React from 'react';

import { Sigil, Ico } from '../Sigil';
import { t } from '../../i18n';
import { PixelPanel } from '../ui/Pixel';
import { INK, LINE, MATERIAL } from '../systems/materials';
export interface WaveSummary {
  wave: number;
  kills: number;
  damage: number;
  goldEarned: number;
  crits: number;
  eliteKills: number;
  barrierDelta: number;
  topKiller: string;
  damageByAlly: Record<string, number>;
  isBossWave: boolean;
  grade: 'S' | 'A' | 'B' | 'C';
}

interface WaveSummaryOverlayProps {
  summary: WaveSummary;
  onClose: () => void;
}

const GRADE_COLOR: Record<string, string> = {
  S: '#b98e79', A: '#959e87', B: '#9cabaf', C: '#9cabaf',
};
const GRADE_LABEL: Record<string, string> = {
  S: 'PERFECT', A: 'EXCELLENT', B: 'GOOD', C: 'OK',
};
const GRADE_GLOW: Record<string, string> = {
  S: 'rgba(194,172,130,0.35)', A: 'rgba(145,164,132,0.3)', B: 'rgba(160,178,186,0.25)', C: 'rgba(152,171,180,0.2)',
};

export const WaveSummaryOverlay: React.FC<WaveSummaryOverlayProps> = ({ summary, onClose }) => {
  if (!summary || !summary.grade || !summary.wave) return null;

  const gc = GRADE_COLOR[summary.grade] ?? '#9cabaf';
  const gl = GRADE_LABEL[summary.grade] ?? '';
  const gg = GRADE_GLOW[summary.grade] ?? 'transparent';

  const dmgDisplay = (summary.damage ?? 0) >= 1000
    ? `${((summary.damage ?? 0) / 1000).toFixed(1)}k`
    : String(Math.floor(summary.damage ?? 0));

  const accentBorder = summary.isBossWave ? '#ac7357' : '#344045';
  const accentGlow = summary.isBossWave ? 'rgba(171,113,85,0.25)' : 'rgba(160,178,186,0.12)';
  const headerGrad = summary.isBossWave
    ? 'linear-gradient(90deg,rgba(90,60,45,0.7),rgba(24,30,33,0.9))'
    : 'linear-gradient(90deg,rgba(25,32,35,0.9),rgba(24,30,33,0.9))';

  const stats = [
    { icon: '💀', get label() { return t('ui.waveSummary.kills'); }, value: String(summary.kills ?? 0), color: '#c59993' },
    { icon: '⚔️', get label() { return t('ui.waveSummary.damage'); }, value: dmgDisplay, color: '#bc8e78' },
    { icon: '🪙', get label() { return t('ui.waveSummary.gold'); }, value: `+${summary.goldEarned ?? 0}`,color: '#b98e79' },
    { icon: '⚡', get label() { return t('ui.waveSummary.crits'); }, value: String(summary.crits ?? 0), color: '#c3b3bf' },
  ];

  return (
    <div onClick={onClose} className="hud-fixo" style={{
      position: 'fixed',
      bottom: 150,
      left: '50%',
      transform: 'translateX(-50%)',
      zIndex: 160,
      width: 440,
      maxWidth: '94vw',
      cursor: 'pointer',
      fontFamily: 'var(--font-pixel)',
      animation: 'wavePopIn 0.25s cubic-bezier(0.34,1.56,0.64,1) both',
    }}>
      <style>{`
        @keyframes wavePopIn {
          from { opacity: 0; transform: translateX(-50%) scale(0.88); }
          to { opacity: 1; transform: translateX(-50%) scale(1); }
        }
      `}</style>

      {/* o cartao inteiro em 78% (Marcos, 18/9: "grande demais"). Num div
          proprio porque .hud-fixo ja usa zoom no container (escala do canvas) */}
      <div style={{ zoom: 0.78 }}>
      <PixelPanel material={summary.isBossWave ? 'oxblood' : summary.grade === 'S' ? 'gold' : 'slate'} style={{ padding: 0 }}>

        {/* ── Header ── */}
        <div style={{
          display: 'flex', alignItems: 'center', justifyContent: 'space-between',
          padding: '15px 18px 12px',
          borderBottom: `2px solid ${LINE.base}`,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '11px' }}>
            <span style={{ fontSize: '24px', display: 'flex' }}><Ico icon={summary.isBossWave ? '💀' : '⚔️'} size={32} /></span>
            <div>
              <div style={{
                fontSize: '15px',
                letterSpacing: '3px',
                color: summary.isBossWave ? '#bc8e78' : '#9cabaf',
                fontWeight: 700, textTransform: 'uppercase',
              }}>
                {summary.isBossWave ? t('ui.waveSummary.bossWave') : t('ui.waveSummary.waveN', { n: summary.wave })}
              </div>
              <div style={{
                fontSize: '13px',
                color: '#47585f', letterSpacing: '2.5px',
                textTransform: 'uppercase', marginTop: 2,
              }}>{t('ui.waveSummary.completed')}</div>
            </div>
          </div>

          {/* Grade badge */}
          <div style={{
            width: '62px',
            height: '62px',
            borderRadius: 0,
            background: '#0b0906',
            border: `2px solid ${gc}`,
            boxShadow: `none`,
            display: 'flex', flexDirection: 'column',
            alignItems: 'center', justifyContent: 'center', gap: 1,
          }}>
            <span style={{ fontSize: '30px', fontWeight: 900, color: gc, lineHeight: 1 }}>{summary.grade}</span>
            <span style={{ fontSize: '11px', color: gc, letterSpacing: '0.5px', opacity: 0.9 }}>{gl}</span>
          </div>
        </div>

        {/* ── Stats grid ── */}
        <div style={{
          display: 'grid', gridTemplateColumns: 'repeat(4,1fr)',
          gap: '8px',
          padding: '12px 14px',
        }}>
          {stats.map(s => (
            <div key={s.label} style={{
              display: 'flex', flexDirection: 'column', alignItems: 'center',
              gap: '4px',
              padding: '10px 6px',
              background: '#0b0906',
              borderRadius: 0,
              border: `2px solid ${LINE.soft}`,
            }}>
              <span style={{ display: 'flex' }}><Ico icon={s.icon} size={28} /></span>
              <span style={{ fontSize: '18px', fontWeight: 700, color: s.color, fontFamily: 'monospace', lineHeight: 1 }}>{s.value}</span>
              <span style={{ fontSize: '12px', color: '#47585f', letterSpacing: '1.5px', textTransform: 'uppercase' }}>{s.label}</span>
            </div>
          ))}
        </div>

        {/* ── Badges ── */}
        <div style={{
          display: 'flex', gap: '6.5px',
          padding: `0 14px 12px`,
          flexWrap: 'wrap', justifyContent: 'center',
        }}>
          {(summary.eliteKills ?? 0) > 0 && (
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#ac7357', background: 'rgba(90,60,45,0.35)', border: '1px solid #f59e0b55', borderRadius: 0, padding: '4px 10px' }}>
              <Sigil name="star" size={16} /> {t(summary.eliteKills > 1 ? 'ui.waveSummary.elites' : 'ui.waveSummary.elite', { n: summary.eliteKills })}
            </span>
          )}
          {(summary.barrierDelta ?? 0) < 0 ? (
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#c59993', background: 'rgba(105,58,51,0.3)', border: '1px solid #f8717155', borderRadius: 0, padding: '4px 10px' }}>
              <Sigil name="shield" size={16} /> −{Math.abs(summary.barrierDelta ?? 0)} HP
            </span>
          ) : (
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#959e87', background: 'rgba(50,59,44,0.3)', border: '1px solid #4ade8055', borderRadius: 0, padding: '4px 10px' }}>
              <Sigil name="shield" size={16} /> {t('ui.waveSummary.barrierIntact')}
            </span>
          )}
          {summary.topKiller && (
            <span style={{ fontSize: '13px', fontWeight: 700, color: '#9cabaf', background: 'rgba(71,89,97,0.3)', border: '1px solid #60a5fa55', borderRadius: 0, padding: '4px 10px' }}>
              <Sigil name="trophy" size={16} /> {t('ui.waveSummary.mvp', { name: summary.topKiller.charAt(0).toUpperCase() + summary.topKiller.slice(1) })}
            </span>
          )}
        </div>

        {/* ── Dismiss hint ── */}
        <div style={{
          textAlign: 'center',
          padding: '5px 0 7px',
          fontSize: '11px',
          color: '#344045', letterSpacing: '2px', textTransform: 'uppercase',
          borderTop: '1px solid rgba(255,255,255,0.04)',
        }}>
          {t('ui.waveSummary.dismiss')}
        </div>
      </PixelPanel>
      </div>
    </div>
  );
};
