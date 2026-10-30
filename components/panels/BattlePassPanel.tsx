// ══════════════════════════════════════════════════════════════════════
// panels/BattlePassPanel.tsx
// Season 1: The Grimhold Awakening — Battle Pass UI (versao pixel)
// ══════════════════════════════════════════════════════════════════════

import React, { useRef } from 'react';
import { Sigil } from '../Sigil';
import { PixelPanel, PixelButton, PixelBar } from '../ui/Pixel';
import { PixelIcon } from '../ui/PixelIcon';
import { pixelIconFor } from '../ui/pixelIcons';
import {
  BATTLE_PASS_LEVELS,
  SEASON_META,
  BP_XP_FOR_LEVEL,
  BattlePassProgress,
  claimBPLevel,
} from '../data/battlePass';
import { titleText } from '../data/titles';
import { t } from '../../i18n';
import { STONE, LINE, INK, MATERIAL, type MaterialName } from '../data/materials';

// ---------------------------------------------------------------------------
// Raridade -> material da moldura do no
// ---------------------------------------------------------------------------

const RARITY_MAT: Record<string, MaterialName> = {
  common: 'bone', rare: 'frost', epic: 'amethyst', legendary: 'gold',
};

const TYPE_COLOR: Record<string, string> = {
  essence: MATERIAL.amethyst.base,
  title: MATERIAL.verdigris.base,
  avatar: MATERIAL.frost.base,
  card: MATERIAL.gold.base,
};

const LABEL: React.CSSProperties = { fontFamily: 'var(--font-pixel)', fontSize: 14, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK.faint };
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-pixel-display)', lineHeight: 1, textShadow: '0 2px 0 #0b0906' };

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface BattlePassPanelProps {
  progress: BattlePassProgress;
  essence: number;
  onClose: () => void;
  onClaim: (level: number, reward: any) => void;
  onProgressUpdate: (updated: BattlePassProgress) => void;
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const BattlePassPanel: React.FC<BattlePassPanelProps> = ({
  progress, essence, onClose, onClaim, onProgressUpdate,
}) => {
  const trackRef = useRef<HTMLDivElement>(null);
  const season = SEASON_META.season1;
  const MAX = season.maxLevel;
  const isMaxed = progress.currentLevel >= MAX;
  const xpNeeded = isMaxed ? 0 : BP_XP_FOR_LEVEL(progress.currentLevel + 1);
  const xpFrac = isMaxed ? 1 : progress.currentXP / xpNeeded;
  const seasonIcon = pixelIconFor(season.icon) ?? 'swords';

  // Scroll the track left/right
  const scroll = (dir: 'left' | 'right') => {
    if (!trackRef.current) return;
    trackRef.current.scrollBy({ left: dir === 'left' ? -320 : 320, behavior: 'smooth' });
  };

  // Claim a reward
  const handleClaim = (level: number) => {
    if (progress.currentLevel < level) return;
    if (progress.claimedLevels.includes(level)) return;
    const reward = BATTLE_PASS_LEVELS.find(l => l.level === level)?.reward;
    if (!reward) return;
    const updated = claimBPLevel(progress, level);
    onProgressUpdate(updated);
    onClaim(level, reward);
  };

  // How many unclaimed rewards are ready
  const unclaimedReady = BATTLE_PASS_LEVELS.filter(
    l => l.level <= progress.currentLevel && !progress.claimedLevels.includes(l.level)
  ).length;

  return (
    <div className="fixed inset-0 z-[200] flex flex-col"
      style={{ background: STONE.s0, backgroundImage: 'url(./ui/pixel/menu_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom', imageRendering: 'pixelated', fontFamily: 'var(--font-pixel)' }}>
      <div className="absolute inset-0" style={{ background: 'rgba(8,6,10,0.72)' }} />

      {/* ── CABECALHO ─────────────────────────────────────────────── */}
      <div className="relative z-10 shrink-0 flex items-center justify-between"
        style={{ padding: '12px 20px', background: 'rgba(11,9,6,0.85)', borderBottom: `2px solid ${LINE.soft}` }}>
        <PixelButton material="neutral" onClick={onClose} className="flex items-center gap-2"
          style={{ padding: '6px 14px', fontSize: 16, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
          <Sigil name="chevronL" size={14} /> {t('ui.common.back')}
        </PixelButton>

        <div className="flex items-center gap-3">
          <PixelIcon name={seasonIcon} size={36} />
          <div className="text-center">
            <h1 style={{ ...DISPLAY, fontSize: 34, letterSpacing: '0.06em', textTransform: 'uppercase', color: MATERIAL.amethyst.base }}>{season.name}</h1>
            <p style={{ ...LABEL, marginTop: 2 }}>{season.subtitle}</p>
          </div>
          <PixelIcon name={seasonIcon} size={36} style={{ transform: 'scaleX(-1)' }} />
        </div>

        <PixelPanel material="amethyst" className="flex items-center gap-2" style={{ padding: '4px 12px' }}>
          <PixelIcon name="amethyst" size={22} />
          <span style={{ ...DISPLAY, fontSize: 22, color: INK.base }}>{essence}</span>
        </PixelPanel>
      </div>

      {/* ── BARRA DE XP ───────────────────────────────────────────── */}
      <div className="relative z-10 shrink-0" style={{ padding: '10px 20px', background: 'rgba(11,9,6,0.7)', borderBottom: `2px solid ${LINE.soft}` }}>
        <div className="flex items-center justify-between" style={{ marginBottom: 6 }}>
          <div className="flex items-center gap-3">
            <div style={{ ...DISPLAY, fontSize: 26, color: MATERIAL.amethyst.base }}>
              {t('ui.battlePass.levelLabel', { n: progress.currentLevel })}
            </div>
            {unclaimedReady > 0 && (
              <PixelPanel material="amethyst" hi style={{ padding: '2px 10px', fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase', color: INK.base }}>
                {t(unclaimedReady > 1 ? 'ui.battlePass.rewardsReady' : 'ui.battlePass.rewardReady', { n: unclaimedReady })}
              </PixelPanel>
            )}
          </div>
          <div style={{ fontSize: 16, color: INK.dim }}>
            {isMaxed ? t('ui.battlePass.maxLevel') : `${progress.currentXP.toLocaleString()} / ${xpNeeded.toLocaleString()} XP`}
          </div>
        </div>
        <PixelBar value={xpFrac} material="amethyst" height={14} />
        <div className="flex justify-between" style={{ ...LABEL, marginTop: 4 }}>
          <span>{t('ui.battlePass.xpRates')}</span>
          <span>{t('ui.battlePass.levelLabel', { n: Math.min(progress.currentLevel + 1, MAX) })}</span>
        </div>
      </div>

      <div className="flex-1" />

      {/* ── TRILHA ────────────────────────────────────────────────── */}
      <div className="relative z-10 flex items-center" style={{ padding: '40px 0' }}>
        <PixelButton material="neutral" onClick={() => scroll('left')} className="absolute z-20 flex items-center justify-center"
          style={{ left: 8, width: 40, height: 40, padding: 0 }}>
          <Sigil name="chevronL" size={18} />
        </PixelButton>

        <div ref={trackRef} className="w-full overflow-x-auto" style={{ padding: '16px 56px', scrollbarWidth: 'none', msOverflowStyle: 'none' }}>
          <div className="flex items-center" style={{ width: 'max-content', paddingBottom: 8 }}>
            {BATTLE_PASS_LEVELS.map((lvl, idx) => {
              const unlocked = progress.currentLevel >= lvl.level;
              const claimed = progress.claimedLevels.includes(lvl.level);
              const claimable = unlocked && !claimed;
              const reward = lvl.reward;
              const rarityKey = reward.rarity ?? 'common';
              const mat: MaterialName = claimed ? 'slate' : unlocked ? (RARITY_MAT[rarityKey] ?? 'bone') : 'slate';
              const typeColor = TYPE_COLOR[reward.type] ?? INK.dim;
              const isCard = reward.type === 'card';
              const isMilestone = lvl.level % 5 === 0;
              const icon = claimed ? 'check' : reward.type === 'essence' ? 'amethyst' : (pixelIconFor(reward.icon) ?? 'gem');
              const box = isMilestone ? 92 : 72;

              return (
                <React.Fragment key={lvl.level}>
                  {/* trilho entre os nos: 4 px, aceso ate o nivel atual */}
                  {idx > 0 && (
                    <div className="shrink-0" style={{ width: 32, height: 4, background: unlocked ? MATERIAL.amethyst.base : LINE.soft }} />
                  )}

                  <div
                    onClick={() => claimable && handleClaim(lvl.level)}
                    className="relative flex flex-col items-center shrink-0"
                    style={{ width: isMilestone ? 104 : 84, cursor: claimable ? 'pointer' : 'default' }}
                  >
                    <div style={{ ...LABEL, fontSize: 14, marginBottom: 4, color: unlocked ? MATERIAL.amethyst.base : INK.ghost }}>
                      Lv {lvl.level}
                    </div>

                    <PixelPanel material={mat} hi={claimable} className="relative flex items-center justify-center"
                      style={{ width: box, height: box, padding: 0, opacity: claimed ? 0.6 : unlocked ? 1 : 0.55 }}>
                      <PixelIcon name={icon} size={isMilestone ? 44 : 34}
                        style={{ filter: unlocked ? 'none' : 'grayscale(1) brightness(0.6)' }} />

                      {/* selo de raridade da carta */}
                      {isCard && claimable && (
                        <div className="absolute" style={{ top: -9, left: '50%', transform: 'translateX(-50%)', padding: '1px 6px', fontSize: 11, letterSpacing: '0.1em', textTransform: 'uppercase', background: MATERIAL[mat].base, color: '#131110', border: `2px solid ${MATERIAL[mat].dim}` }}>
                          {rarityKey}
                        </div>
                      )}
                    </PixelPanel>

                    <div className="text-center" style={{ marginTop: 6, fontSize: 14, lineHeight: 1.15, maxWidth: box + 8, color: claimed ? INK.ghost : unlocked ? typeColor : INK.ghost }}>
                      {reward.type === 'title' ? `"${titleText(reward.titleId ?? '')}"` : reward.label}
                    </div>

                    {claimable && (
                      <PixelButton material="amethyst" onClick={e => { e.stopPropagation(); handleClaim(lvl.level); }}
                        style={{ marginTop: 6, padding: '3px 10px', fontSize: 14, letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                        {t('ui.battlePass.claim')}
                      </PixelButton>
                    )}
                  </div>
                </React.Fragment>
              );
            })}
          </div>
        </div>

        <PixelButton material="neutral" onClick={() => scroll('right')} className="absolute z-20 flex items-center justify-center"
          style={{ right: 8, width: 40, height: 40, padding: 0 }}>
          <Sigil name="chevronR" size={18} />
        </PixelButton>
      </div>

      {/* ── RODAPE — guia de XP ───────────────────────────────────── */}
      <div className="flex-1" />

      <div className="relative z-10 shrink-0 flex items-center justify-between flex-wrap gap-2"
        style={{ padding: '8px 20px', background: 'rgba(11,9,6,0.85)', borderTop: `2px solid ${LINE.soft}` }}>
        <div style={LABEL}>{t('ui.battlePass.footer')}</div>
        <div className="flex gap-4 flex-wrap">
          {[
            { icon: 'swords', get label() { return t('ui.battlePass.xpRun'); } },
            { icon: 'flag', get label() { return t('ui.battlePass.xpWave'); } },
            { icon: 'skull', get label() { return t('ui.battlePass.xpKill'); } },
            { icon: 'trophy', get label() { return t('ui.battlePass.xpVictory'); } },
          ].map(item => (
            <div key={item.label} className="flex items-center gap-1.5" style={{ fontSize: 15, color: INK.dim }}>
              <PixelIcon name={item.icon} size={20} />
              <span>{item.label}</span>
            </div>
          ))}
        </div>
      </div>

      <style>{`div::-webkit-scrollbar { display: none; }`}</style>
    </div>
  );
};
