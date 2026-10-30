// ══════════════════════════════════════════════════════════════════════
// components/panels/RunHistoryPanel.tsx — historico de runs (versao pixel)
// ══════════════════════════════════════════════════════════════════════

import React from 'react';

import { PixelPanel, PixelButton } from '../ui/Pixel';
import { PixelIcon } from '../ui/PixelIcon';
import { CharacterSprite } from '../CharacterSprite';
import { INK, LINE, MATERIAL, type MaterialName } from '../systems/materials';
import { t, getLanguage } from '../../i18n';
export interface RunHistoryEntry {
  id: string;
  date: number;
  wave: number;
  score: number;
  kills: number;
  damage?: number;
  allies: string[];
  heroType?: string;
  difficulty: string;
  gameMode: string;
  duration: number;
  goldAccumulated: number;
  result: 'victory' | 'defeat';
}

export interface RunHistoryPanelProps {
  runHistory: RunHistoryEntry[];
  onClearHistory?: () => void;
  onClose: () => void;
}

// ── helpers ──────────────────────────────────────────────────────────
const fmt = (n: number) => n >= 1_000_000
  ? `${(n / 1_000_000).toFixed(1)}M`
  : n >= 1_000
    ? `${(n / 1_000).toFixed(1)}k`
    : String(n);

const dur = (s: number) => `${Math.floor(s / 60)}m${String(s % 60).padStart(2, '0')}s`;

const DIFF_LABEL: Record<string, string> = {
  get easy() { return t('ui.runHistory.diff.easy'); }, get normal() { return t('ui.runHistory.diff.normal'); }, get hard() { return t('ui.runHistory.diff.hard'); }, get infernal() { return t('ui.runHistory.diff.infernal'); }, get random() { return t('ui.runHistory.diff.random'); },
};
const MODE_LABEL: Record<string, string> = {
  get standard() { return t('ui.runHistory.mode.standard'); }, get cursed() { return t('ui.runHistory.mode.cursed'); }, get endless() { return t('ui.runHistory.mode.endless'); }, get solo() { return t('ui.runHistory.mode.solo'); }, get pacifist() { return t('ui.runHistory.mode.pacifist'); },
  get randomizer() { return t('ui.runHistory.mode.randomizer'); }, get act2() { return t('ui.runHistory.mode.act2'); }, get act3() { return t('ui.runHistory.mode.act3'); }, get act4() { return t('ui.runHistory.mode.act4'); }, get act5() { return t('ui.runHistory.mode.act5'); }, get act6() { return t('ui.runHistory.mode.act6'); }, get act7() { return t('ui.runHistory.mode.act7'); }, get act8() { return t('ui.runHistory.mode.act8'); }, get act9() { return t('ui.runHistory.mode.act9'); }, get act10() { return t('ui.runHistory.mode.act10'); },
};
const MODE_MAT: Record<string, MaterialName> = {
  standard: 'gold', act2: 'verdigris', act3: 'ember', act4: 'frost', act5: 'amethyst', act6: 'slate', act7: 'verdigris', act8: 'frost', act9: 'ember', act10: 'amethyst',
  endless: 'slate', solo: 'frost', cursed: 'amethyst', randomizer: 'ember', pacifist: 'verdigris',
};
const HERO_LABEL: Record<string, string> = {
  get iron_sentinel() { return t('ui.runHistory.hero.iron_sentinel'); }, get mage() { return t('ui.runHistory.hero.mage'); }, get archer() { return t('ui.runHistory.hero.archer'); },
  get berserker() { return t('ui.runHistory.hero.berserker'); }, get frost_warden() { return t('ui.runHistory.hero.frost_warden'); }, get inquisitor() { return t('ui.runHistory.hero.inquisitor'); }, get yue() { return t('ui.runHistory.hero.yue'); }, get billy() { return t('ui.runHistory.hero.billy'); },
  get warlock() { return t('ui.runHistory.hero.warlock'); }, get druid() { return t('ui.runHistory.hero.druid'); }, get bard() { return t('ui.runHistory.hero.bard'); },
};
/** herois sem sprite de aliado (ex.: iron_sentinel) caem num icone pixel */
const HERO_FALLBACK_ICON: Record<string, string> = { iron_sentinel: 'gear' };

const LABEL: React.CSSProperties = { fontFamily: 'var(--font-pixel)', fontSize: 13, letterSpacing: '0.14em', textTransform: 'uppercase', color: INK.faint };
const DISPLAY: React.CSSProperties = { fontFamily: 'var(--font-pixel-display)', lineHeight: 1, textShadow: '0 2px 0 #0b0906' };

// ── component ─────────────────────────────────────────────────────────
export const RunHistoryPanel = ({ runHistory, onClearHistory, onClose }: RunHistoryPanelProps) => {
  const [filter, setFilter] = React.useState<'all' | 'victory' | 'defeat'>('all');

  const filtered = filter === 'all' ? runHistory
    : runHistory.filter(r => r.result === filter);

  // summary stats (always from all runs)
  const wins = runHistory.filter(r => r.result === 'victory').length;
  const bestWave = runHistory.length ? Math.max(...runHistory.map(r => r.wave)) : 0;
  const bestScore = runHistory.length ? Math.max(...runHistory.map(r => r.score)) : 0;
  const bestDmg = runHistory.length ? Math.max(...runHistory.map(r => r.damage ?? 0)) : 0;
  const avgKills = runHistory.length
    ? Math.round(runHistory.reduce((s, r) => s + r.kills, 0) / runHistory.length)
    : 0;

  return (
    <div className="fixed inset-0 z-[150] flex items-center justify-center p-3" style={{ background: 'rgba(8,6,10,0.88)', fontFamily: 'var(--font-pixel)' }}>
      <PixelPanel material="bone" className="relative w-full max-w-3xl max-h-[92vh] flex flex-col overflow-hidden" style={{ padding: 0 }}>

        {/* ── Cabecalho ── */}
        <div className="flex items-center justify-between flex-shrink-0 flex-wrap gap-2" style={{ padding: '10px 16px', borderBottom: `2px solid ${LINE.soft}` }}>
          <div className="flex items-center gap-3">
            <PixelPanel material="bone" hi style={{ padding: 4 }}><PixelIcon name="scroll" size={28} /></PixelPanel>
            <div>
              <h2 style={{ ...DISPLAY, fontSize: 26, letterSpacing: '0.06em', textTransform: 'uppercase', color: INK.base }}>{t('ui.runHistory.title')}</h2>
              <p style={{ ...LABEL, marginTop: 2 }}>{t('ui.runHistory.recorded', { n: runHistory.length })}</p>
            </div>
          </div>
          <div className="flex items-center gap-2">
            {/* filtros */}
            {(['all', 'victory', 'defeat'] as const).map(f => {
              const on = filter === f;
              const mat: MaterialName | 'neutral' = f === 'victory' ? 'gold' : f === 'defeat' ? 'oxblood' : 'neutral';
              return (
                <PixelButton key={f} material={on ? mat : 'neutral'} active={on} onClick={() => setFilter(f)}
                  className="flex items-center gap-1" style={{ padding: '4px 10px', fontSize: 15, letterSpacing: '0.08em', textTransform: 'uppercase' }}>
                  {f === 'victory' && <PixelIcon name="crown" size={16} />}
                  {f === 'defeat' && <PixelIcon name="skull" size={16} />}
                  {f === 'all' ? `${t('ui.runHistory.filter.all')} (${runHistory.length})` : f === 'victory' ? wins : runHistory.length - wins}
                </PixelButton>
              );
            })}
            {onClearHistory && runHistory.length > 0 && (
              <PixelButton material="neutral" onClick={() => { if (window.confirm(t('ui.runHistory.clearConfirm'))) onClearHistory(); }}
                style={{ padding: '4px 10px', fontSize: 14, letterSpacing: '0.08em', textTransform: 'uppercase', color: MATERIAL.oxblood.base }}>
                {t('ui.settings.btnClear')}
              </PixelButton>
            )}
            <PixelButton material="neutral" onClick={onClose} style={{ width: 32, height: 32, padding: 0, display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <PixelIcon name="cross" size={16} />
            </PixelButton>
          </div>
        </div>

        {/* ── Conteudo ── */}
        <div className="overflow-y-auto flex-1 custom-scrollbar flex flex-col gap-2" style={{ padding: 12 }}>
          {runHistory.length === 0 ? (
            <div className="flex flex-col items-center justify-center gap-2" style={{ padding: '80px 0' }}>
              <PixelIcon name="scroll" size={64} style={{ filter: 'grayscale(1) brightness(0.6)' }} />
              <span style={{ ...LABEL, fontSize: 16, color: INK.dim }}>{t('ui.runHistory.empty')}</span>
              <span style={{ fontSize: 15, color: INK.faint }}>{t('ui.runHistory.emptyHint')}</span>
            </div>
          ) : (
            <>
              {/* ── Resumo ── */}
              <div className="grid grid-cols-5 gap-2" style={{ marginBottom: 4 }}>
                {[
                  { icon: 'trophy', get label() { return t('ui.runHistory.winRate'); }, value: `${wins}/${runHistory.length}`, color: MATERIAL.gold.base },
                  { icon: 'flag', get label() { return t('ui.runHistory.bestWave'); }, value: String(bestWave), color: INK.base },
                  { icon: 'star_gold', get label() { return t('ui.runHistory.bestScore'); }, value: fmt(bestScore), color: MATERIAL.gold.base },
                  { icon: 'swords', get label() { return t('ui.runHistory.bestDmg'); }, value: fmt(bestDmg), color: MATERIAL.ember.base },
                  { icon: 'skull', get label() { return t('ui.runHistory.avgKills'); }, value: String(avgKills), color: MATERIAL.oxblood.base },
                ].map(stat => (
                  <PixelPanel key={stat.label} material="slate" className="flex flex-col items-center" style={{ padding: '6px 4px' }}>
                    <PixelIcon name={stat.icon} size={24} />
                    <span style={{ ...DISPLAY, fontSize: 22, color: stat.color, marginTop: 2 }}>{stat.value}</span>
                    <span style={{ ...LABEL, fontSize: 11, marginTop: 2, textAlign: 'center' }}>{stat.label}</span>
                  </PixelPanel>
                ))}
              </div>

              {/* ── Lista ── */}
              {filtered.length === 0 && (
                <div className="text-center" style={{ ...LABEL, fontSize: 15, padding: '48px 0' }}>{t('ui.runHistory.noFiltered', { filter: t(`ui.runHistory.filter.${filter}`) })}</div>
              )}
              {filtered.map((run, idx) => {
                const isVictory = run.result === 'victory';
                const isLatest = idx === 0 && filter === 'all';
                const modeMat = MODE_MAT[run.gameMode] ?? 'gold';
                const heroKey = run.heroType ?? '';
                const heroLabel = HERO_LABEL[heroKey] ?? (heroKey ? heroKey.replace(/_/g, ' ') : t('ui.runHistory.heroFallback'));
                const modeLabel = MODE_LABEL[run.gameMode] ?? run.gameMode;
                const diffLabel = DIFF_LABEL[run.difficulty] ?? run.difficulty;
                // segue o idioma do jogo (estava fixo em 'pt-BR', mesmo no build inglês)
                const dateStr = new Date(run.date).toLocaleDateString(getLanguage(), { day: '2-digit', month: '2-digit', year: '2-digit' });
                const timeStr = new Date(run.date).toLocaleTimeString(getLanguage(), { hour: '2-digit', minute: '2-digit' });

                return (
                  <PixelPanel key={run.id} material={isVictory ? 'gold' : 'slate'} className="relative" style={{ padding: 0 }}>
                    {isLatest && (
                      <div className="absolute z-10" style={{ top: -8, left: 10, ...LABEL, fontSize: 11, padding: '1px 6px', background: '#0b0906', border: `2px solid ${LINE.soft}`, color: INK.dim }}>{t('ui.runHistory.latest')}</div>
                    )}

                    <div className="flex items-stretch">

                      {/* ── Resultado ── */}
                      <div className="flex-shrink-0 flex flex-col items-center justify-center gap-1" style={{ width: 84, padding: '10px 4px', borderRight: `2px solid ${LINE.soft}` }}>
                        <PixelIcon name={isVictory ? 'crown' : 'skull'} size={28} />
                        <div style={{ ...DISPLAY, fontSize: 30, color: isVictory ? MATERIAL.gold.base : INK.dim }}>{run.wave}</div>
                        <div style={{ ...LABEL, fontSize: 11 }}>{isVictory ? t('ui.runHistory.victory') : t('ui.runHistory.wave')}</div>
                      </div>

                      {/* ── Estatisticas ── */}
                      <div className="flex-1 grid grid-cols-3 gap-x-3 gap-y-2 min-w-0" style={{ padding: '10px 12px' }}>
                        <Stat label={t('ui.runHistory.score')} value={fmt(run.score)} color={MATERIAL.gold.base} />
                        <Stat label={t('ui.runHistory.kills')} value={String(run.kills)} color={MATERIAL.oxblood.base} />
                        <Stat label={t('ui.runHistory.duration')} value={dur(run.duration)} color={INK.base} />
                        <Stat label={t('ui.runHistory.damage')} value={fmt(run.damage ?? 0)} color={MATERIAL.ember.base} />
                        <Stat label={t('ui.runHistory.gold')} value={`${run.goldAccumulated}g`} color={MATERIAL.gold.base} />
                        <Stat label={t('ui.runHistory.diff')} value={diffLabel} color={INK.base} />
                      </div>

                      {/* ── Modo + heroi + composicao ── */}
                      <div className="flex-shrink-0 flex flex-col justify-center gap-1" style={{ width: 150, padding: '10px 12px', borderLeft: `2px solid ${LINE.soft}` }}>
                        <span style={{ ...LABEL, fontSize: 13, color: MATERIAL[modeMat].base }}>{modeLabel}</span>
                        <div className="flex items-center gap-1">
                          {HERO_FALLBACK_ICON[heroKey] || !heroKey
                            ? <PixelIcon name={HERO_FALLBACK_ICON[heroKey] ?? 'helm'} size={18} />
                            : <CharacterSprite type={heroKey} className="w-5 h-5" />}
                          <span className="truncate" style={{ fontSize: 15, color: INK.base }}>{heroLabel}</span>
                        </div>
                        <div className="flex flex-wrap gap-1">
                          {run.allies.slice(0, 5).map((name, i) => (
                            <span key={i} style={{ fontSize: 11, lineHeight: 1, padding: '2px 4px', background: '#0b0906', border: `2px solid ${LINE.soft}`, color: INK.dim }}>{name}</span>
                          ))}
                          {run.allies.length > 5 && <span style={{ fontSize: 11, color: INK.faint, alignSelf: 'center' }}>+{run.allies.length - 5}</span>}
                          {run.allies.length === 0 && <span style={{ fontSize: 11, color: INK.faint }}>{t('ui.runHistory.noAllies')}</span>}
                        </div>
                        <span style={{ fontSize: 13, color: INK.faint, marginTop: 'auto' }}>{dateStr} {timeStr}</span>
                      </div>

                    </div>
                  </PixelPanel>
                );
              })}
            </>
          )}
        </div>
      </PixelPanel>
    </div>
  );
};

// tiny helper component
const Stat = ({ label, value, color }: { label: string; value: string; color: string }) => (
  <div className="flex flex-col min-w-0">
    <span style={{ ...LABEL, fontSize: 11 }}>{label}</span>
    <span className="truncate" style={{ ...DISPLAY, fontSize: 18, color, marginTop: 2 }}>{value}</span>
  </div>
);
