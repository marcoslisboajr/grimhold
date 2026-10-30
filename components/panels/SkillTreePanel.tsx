// ══════════════════════════════════════════════════════════════════════
// panels/SkillTreePanel.tsx
// Skill tree tab — rendered inside CharacterSelectPanel.
// Stores allocations per character in localStorage.
// ══════════════════════════════════════════════════════════════════════

import { storage } from '../systems/storage';
import React from 'react';
import { Trans } from 'react-i18next';
import {
  STONE, LINE, INK, GROOVE, MATERIAL, TYPE, FONT,
  engraved, carved, recessed,
} from '../data/materials';
import { Sigil } from '../Sigil';
import {
  SKILL_TREES,
  SkillNode,
  SkillPath,
  getSkillTree,
  canUnlockNode,
  aggregateSkillEffects,
} from '../data/skillTrees';
import { MASTERY_XP_PER_LEVEL } from '../data/allies';
import { t } from '../../i18n';

// ---------------------------------------------------------------------------
// Persistence helpers
// ---------------------------------------------------------------------------

const SK_STORAGE_KEY = 'grimhold_skill_allocations';

export const loadSkillAllocations = (): Record<string, string[]> => {
  try {
    const s = storage.get(SK_STORAGE_KEY);
    return s ? JSON.parse(s) : {};
  } catch { return {}; }
};

export const saveSkillAllocations = (allocs: Record<string, string[]>): void => {
  try { storage.set(SK_STORAGE_KEY, JSON.stringify(allocs)); } catch { /* silent */ }
};

export const getCharSkills = (charType: string): string[] =>
  loadSkillAllocations()[charType] ?? [];

export const saveCharSkills = (charType: string, nodeIds: string[]): void => {
  const all = loadSkillAllocations();
  all[charType] = nodeIds;
  saveSkillAllocations(all);
};

// ---------------------------------------------------------------------------
// Node layout positions (fixed grid per tree)
// The tree SVG viewBox is 680×320. Positions are absolute within it.
// ---------------------------------------------------------------------------

/** X positions by path */
const PATH_X: Record<SkillPath, number> = {
  root:     340,
  A:        0,    // overridden per node (A1–A4 use left columns)
  B:        0,    // overridden per node (B1–B4 use right columns)
  capstone: 340,
};

/** Hardcoded (x, y) positions for the 10-node layout */
const NODE_POS: Record<string, { x: number; y: number }> = {
  // Root
  root:  { x: 340, y: 28 },
  // Path A (left side)
  a1:    { x: 160, y: 100 },
  a2:    { x:  90, y: 178 },
  a3:    { x:  90, y: 260 },
  a4:    { x: 220, y: 178 },
  // Path B (right side)
  b1:    { x: 520, y: 100 },
  b2:    { x: 590, y: 178 },
  b3:    { x: 590, y: 260 },
  b4:    { x: 460, y: 178 },
  // Capstone
  cap:   { x: 340, y: 315 },
};

function nodePos(nodeId: string): { x: number; y: number } {
  // Strip 'sk_' prefix then strip charType prefix (handles multi-word types like frost_warden)
  const withoutSk = nodeId.startsWith('sk_') ? nodeId.slice(3) : nodeId;
  // Known two-word charType prefixes to strip
  const twoWordPrefixes = ['frost_warden_', 'malachar_human_'];
  let key = '';
  for (const prefix of twoWordPrefixes) {
    if (withoutSk.startsWith(prefix)) { key = withoutSk.slice(prefix.length); break; }
  }
  if (!key) {
    // Single-word charType: strip up to first underscore
    const idx = withoutSk.indexOf('_');
    key = idx !== -1 ? withoutSk.slice(idx + 1) : withoutSk;
  }
  return NODE_POS[key] ?? { x: 340, y: 160 };
}

// ---------------------------------------------------------------------------
// Color palette per path
// ---------------------------------------------------------------------------

const PATH_COLORS = {
  root:     { stroke: MATERIAL.gold.base,      fill: MATERIAL.gold.dim,      text: MATERIAL.gold.base,      glow: 'transparent' },
  A:        { stroke: MATERIAL.amethyst.base,  fill: MATERIAL.amethyst.dim,  text: MATERIAL.amethyst.base,  glow: 'transparent' },
  B:        { stroke: MATERIAL.verdigris.base, fill: MATERIAL.verdigris.dim, text: MATERIAL.verdigris.base, glow: 'transparent' },
  capstone: { stroke: MATERIAL.oxblood.base,   fill: MATERIAL.oxblood.dim,   text: MATERIAL.oxblood.base,   glow: 'transparent' },
  locked:   { stroke: LINE.base,               fill: STONE.s2,               text: INK.ghost },
  excluded: { stroke: LINE.soft,               fill: STONE.s1,               text: INK.ghost },
};

type NodeState = 'unlocked' | 'available' | 'locked' | 'excluded';

// ---------------------------------------------------------------------------
// Props
// ---------------------------------------------------------------------------

export interface SkillTreePanelProps {
  charType:        string;
  charName:        string;
  accentColor:     string;
  masteryLevel:    number;
  masteryXp:       number;
  /** Read-only; all persistence is done internally via localStorage */
}

// ---------------------------------------------------------------------------
// Component
// ---------------------------------------------------------------------------

export const SkillTreePanel: React.FC<SkillTreePanelProps> = ({
  charType, charName, accentColor, masteryLevel, masteryXp,
}) => {
  const tree = getSkillTree(charType);

  const [unlockedIds, setUnlockedIds] = React.useState<string[]>(() => getCharSkills(charType));
  const [hoveredNode, setHoveredNode] = React.useState<SkillNode | null>(null);
  const [hoveredState, setHoveredState] = React.useState<NodeState>('locked');

  // Re-load when character changes
  React.useEffect(() => {
    setUnlockedIds(getCharSkills(charType));
    setHoveredNode(null);
  }, [charType]);

  if (!tree) {
    return (
      <div className="flex items-center justify-center h-32" style={{ ...TYPE.label, fontSize: 12, color: INK.faint }}>
        {t('ui.skillTree.none')}
      </div>
    );
  }

  const unlockedSet = new Set(unlockedIds);
  const pointsSpent = tree.nodes
    .filter(n => unlockedSet.has(n.id))
    .reduce((s, n) => s + n.cost, 0);
  const pointsTotal = masteryLevel;
  const pointsLeft  = pointsTotal - pointsSpent;

  const xpNeeded = masteryLevel < 10 ? MASTERY_XP_PER_LEVEL(masteryLevel) : 0;
  const xpPct    = xpNeeded > 0 ? Math.round((masteryXp / xpNeeded) * 100) : 100;

  // ── State helpers ─────────────────────────────────────────────────────────

  function getState(node: SkillNode): NodeState {
    if (unlockedSet.has(node.id)) return 'unlocked';
    if (node.excludes?.some(e => unlockedSet.has(e))) return 'excluded';
    const reqOk = !node.requires?.length
      ? true
      : node.path === 'capstone'
        ? node.requires.some(r => unlockedSet.has(r))
        : node.requires.every(r => unlockedSet.has(r));
    if (!reqOk || pointsLeft < node.cost) return 'locked';
    return 'available';
  }

  // ── Click handlers ────────────────────────────────────────────────────────

  function handleNodeClick(node: SkillNode) {
    const state = getState(node);
    if (state === 'available') {
      const next = [...unlockedIds, node.id];
      setUnlockedIds(next);
      saveCharSkills(charType, next);
    } else if (state === 'unlocked') {
      // Remove this node and any that depend on it
      const toRemove = new Set([node.id]);
      let changed = true;
      while (changed) {
        changed = false;
        tree.nodes.forEach(n => {
          if (!toRemove.has(n.id) && n.requires?.some(r => toRemove.has(r))) {
            toRemove.add(n.id); changed = true;
          }
        });
      }
      const next = unlockedIds.filter(id => !toRemove.has(id));
      setUnlockedIds(next);
      saveCharSkills(charType, next);
    }
  }

  function handleReset() {
    setUnlockedIds([]);
    saveCharSkills(charType, []);
    setHoveredNode(null);
  }

  // ── Aggregated effects preview ────────────────────────────────────────────
  const aggregated = aggregateSkillEffects(unlockedIds);

  // ── Render SVG tree ───────────────────────────────────────────────────────

  function renderConnector(from: SkillNode, to: SkillNode) {
    const fp = nodePos(from.id);
    const tp = nodePos(to.id);
    const fromUnlocked = unlockedSet.has(from.id);
    const toState      = getState(to);
    const active       = fromUnlocked && (unlockedSet.has(to.id) || toState === 'available');
    const col          = active ? (PATH_COLORS[to.path] ?? PATH_COLORS.locked) : PATH_COLORS.locked;
    return (
      <line
        key={`conn-${from.id}-${to.id}`}
        x1={fp.x} y1={fp.y} x2={tp.x} y2={tp.y}
        stroke={active ? col.stroke : LINE.base}
        strokeWidth={active ? 1.5 : 1}
        strokeDasharray={active ? undefined : '3 3'}
        opacity={active ? 0.7 : 0.25}
      />
    );
  }

  function renderNode(node: SkillNode) {
    const state = getState(node);
    const col   = (state === 'unlocked' || state === 'available')
      ? (PATH_COLORS[node.path] ?? PATH_COLORS.locked)
      : state === 'excluded' ? PATH_COLORS.excluded : PATH_COLORS.locked;
    const pos = nodePos(node.id);
    const r   = node.path === 'root' ? 22 : node.path === 'capstone' ? 24 : 18;
    const interactive = state === 'available' || state === 'unlocked';
    const opacity = state === 'locked' ? 0.4 : state === 'excluded' ? 0.18 : 1;

    return (
      <g
        key={node.id}
        transform={`translate(${pos.x},${pos.y})`}
        style={{ cursor: interactive ? 'pointer' : 'default', opacity }}
        onMouseEnter={() => { setHoveredNode(node); setHoveredState(state); }}
        onMouseLeave={() => { setHoveredNode(null); }}
        onClick={() => handleNodeClick(node)}
      >
        {/* Transparent hit area covering entire node bounds so mouse movements don't flicker */}
        <rect
          x={-(r + 14)}
          y={-(r + 6)}
          width={(r + 14) * 2}
          height={(r + 6) + r + 30}
          fill="transparent"
          style={{ pointerEvents: 'all' }}
        />
        {/* Glow ring for unlocked */}
        {state === 'unlocked' && (
          <circle r={r + 6} fill="none" stroke={col.stroke} strokeWidth={1} opacity={0.25} style={{ pointerEvents: 'none' }} />
        )}
        {/* Pulse ring for available */}
        {state === 'available' && (
          <circle r={r + 4} fill="none" stroke={col.stroke} strokeWidth={1}
            strokeDasharray="2 2" opacity={0.45} style={{ pointerEvents: 'none' }} />
        )}
        {/* Main circle */}
        <circle r={r} fill={col.fill} stroke={col.stroke}
          strokeWidth={state === 'unlocked' ? 2 : 1.5} style={{ pointerEvents: 'none' }} />
        {/* Center text: cost or checkmark */}
        <text
          textAnchor="middle" dominantBaseline="middle"
          fill={interactive ? col.text : INK.ghost}
          fontSize={r > 20 ? 14 : 11}
          fontFamily="var(--font-cinzel, 'Cinzel', serif)"
          fontWeight="700"
          style={{ pointerEvents: 'none' }}
        >
          {state === 'unlocked' ? '✓' : node.cost}
        </text>
        {/* Label below */}
        <text
          textAnchor="middle" dominantBaseline="auto"
          y={r + 11}
          fill={state === 'available' ? col.text : INK.ghost}
          fontSize={8.5}
          fontFamily="var(--font-cinzel, 'Cinzel', serif)"
          letterSpacing="0.05em"
          opacity={state === 'unlocked' ? 1 : state === 'available' ? 0.8 : 0.3}
          style={{ pointerEvents: 'none' }}
        >
          {node.name}
        </text>
        {/* Cost label */}
        <text
          textAnchor="middle" y={r + 21}
          fill={state === 'available' ? col.stroke : LINE.base}
          fontSize={7}
          fontFamily="var(--font-cinzel, 'Cinzel', serif)"
          opacity={state === 'unlocked' ? 0.6 : state === 'available' ? 0.55 : 0.15}
          style={{ pointerEvents: 'none' }}
        >
          {node.cost}pt{node.cost > 1 ? 's' : ''}
        </text>
      </g>
    );
  }

  // ── Tooltip content ───────────────────────────────────────────────────────

  const hintText: Record<NodeState, string> = {
    unlocked:  t('ui.skillTree.hintUnlocked'),
    available: t('ui.skillTree.hintAvailable', { n: hoveredNode?.cost ?? 1 }),
    locked:    t('ui.skillTree.hintLocked'),
    excluded:  t('ui.skillTree.hintExcluded'),
  };

  // ── Bonus summary (compact) ───────────────────────────────────────────────
  const bonusLines: string[] = [];
  if (aggregated.damageBonus)      bonusLines.push(`DMG +${Math.round(aggregated.damageBonus * 100)}%`);
  if (aggregated.attackSpeedBonus) bonusLines.push(`ATK/S +${Math.round(Math.abs(aggregated.attackSpeedBonus) * 100)}%`);
  if (aggregated.rangeBonus)       bonusLines.push(`Range +${Math.round(aggregated.rangeBonus * 100)}%`);
  if (aggregated.hpBonus)          bonusLines.push(`HP +${Math.round(aggregated.hpBonus * 100)}%`);
  if (aggregated.lifesteal)        bonusLines.push(`Lifesteal ${Math.round(aggregated.lifesteal * 100)}%`);
  if (aggregated.critDmgMultiplier)bonusLines.push(`Crit DMG +${Math.round(aggregated.critDmgMultiplier * 100)}%`);
  if (aggregated.chainBounces)     bonusLines.push(`+${aggregated.chainBounces} Chain Bounce${aggregated.chainBounces > 1 ? 's' : ''}`);
  if (aggregated.auraBonusRadius)  bonusLines.push(`Aura +${aggregated.auraBonusRadius}px`);
  if (aggregated.goldOnKill)       bonusLines.push(`+${aggregated.goldOnKill} Gold/Kill`);
  if (aggregated.selfHealOnKill)   bonusLines.push(`+${aggregated.selfHealOnKill} HP/Kill`);
  if (aggregated.barrierHealOnKill)bonusLines.push(`+${aggregated.barrierHealOnKill} Barrier/Kill`);
  if (aggregated.freeStacksPerWave)bonusLines.push(`+${aggregated.freeStacksPerWave} Free Stacks/Wave`);
  if (aggregated.allyHealPerWave)  bonusLines.push(`+${aggregated.allyHealPerWave} Ally HP/Wave`);
  const customCount = tree.nodes.filter(n => unlockedSet.has(n.id) && n.effect.customTag).length;
  if (customCount > 0)             bonusLines.push(`${customCount} Special Effect${customCount > 1 ? 's' : ''}`);

  // ── JSX ───────────────────────────────────────────────────────────────────

  return (
    <div style={{ animation: 'msFadeUp 0.3s ease both' }}>

      {/* Mastery header — same style as Relic tab */}
      <div className="mb-5 p-4" style={{ background: STONE.s1, border: `1px solid ${LINE.base}`, ...carved }}>
        <div className="flex items-center justify-between mb-2">
          <span style={{ ...TYPE.label, fontSize: 12, color: INK.dim }}>
            {t('ui.skillTree.mastery')}
          </span>
          <span className="font-cinzel font-bold text-sm"
            style={{ ...TYPE.itemName, fontSize: 15, color: masteryLevel >= 10 ? MATERIAL.gold.base : INK.base }}>
            {masteryLevel >= 10 ? t('ui.skillTree.maxLevel') : t('ui.skillTree.level', { n: masteryLevel })}
          </span>
        </div>
        {masteryLevel < 10 && (
          <>
            <div className="mb-1" style={{ height: 8, background: STONE.s2, border: `1px solid ${LINE.base}`, ...recessed }}>
              <div className="h-full rounded-full transition-all duration-700"
                style={{ width: `${xpPct}%`, background: MATERIAL.ember.base, boxShadow: `inset 0 1px 0 ${GROOVE.hi}` }} />
            </div>
            <div className="flex justify-between" style={{ ...TYPE.numeral, fontSize: 13, color: INK.ghost }}>
              <span>{masteryXp.toLocaleString()} XP</span>
              <span>{t('ui.skillTree.xpToLevel', { xp: xpNeeded.toLocaleString(), n: masteryLevel + 1 })}</span>
            </div>
          </>
        )}

        {/* Points counter */}
        <div className="flex items-center justify-between mt-3 pt-3 border-t border-slate-800/60">
          <div className="flex items-center gap-2">
            <span style={{ ...TYPE.label, fontSize: 12, color: INK.faint }}>
              {t('ui.skillTree.points')}
            </span>
            <span className="font-cinzel font-bold text-base" style={{ color: accentColor }}>
              {pointsLeft}
            </span>
            <span style={{ ...TYPE.numeral, fontSize: 13, color: INK.ghost }}>/ {pointsTotal}</span>
          </div>
          <div className="flex gap-1">
            {/* Path A label */}
            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-cinzel"
              style={{ ...TYPE.label, fontSize: 12, background: STONE.s1, border: `1px solid ${MATERIAL.amethyst.dim}`, color: MATERIAL.amethyst.base }}>
              <span style={{ width: 6, height: 6, background: MATERIAL.amethyst.base, display: 'inline-block' }} />
              {t('ui.skillTree.pathA')}
            </div>
            <div className="flex items-center gap-1 px-2 py-0.5 rounded text-[12px] font-cinzel"
              style={{ ...TYPE.label, fontSize: 12, background: STONE.s1, border: `1px solid ${MATERIAL.verdigris.dim}`, color: MATERIAL.verdigris.base }}>
              <span style={{ width: 6, height: 6, background: MATERIAL.verdigris.base, display: 'inline-block' }} />
              {t('ui.skillTree.pathB')}
            </div>
          </div>
        </div>
      </div>

      {/* Tooltip / info box — fixed height so it NEVER shifts the SVG layout */}
      <div
        className="p-3.5 mb-4"
        style={{
          background: STONE.s1,
          border: `1px solid ${LINE.base}`,
          height: 108,
          minHeight: 108,
          maxHeight: 108,
          boxSizing: 'border-box',
          overflowY: 'auto',
          ...carved,
        }}
      >
        {hoveredNode ? (
          <div className="flex flex-col justify-center min-h-full">
            <div className="flex items-center gap-2 mb-1">
              <span className="text-xs font-cinzel font-bold"
                style={{ color: (PATH_COLORS[hoveredNode.path] ?? PATH_COLORS.locked).text }}>
                {hoveredNode.name}
              </span>
              <span className="text-[12px] font-cinzel px-1.5 py-0.5 rounded border uppercase tracking-widest"
                style={{
                  color: (PATH_COLORS[hoveredNode.path] ?? PATH_COLORS.locked).stroke,
                  borderColor: `${(PATH_COLORS[hoveredNode.path] ?? PATH_COLORS.locked).stroke}40`,
                  background: 'rgba(0,0,0,0.4)',
                }}>
                {hoveredNode.path === 'capstone' ? t('ui.skillTree.capstone') : hoveredNode.path === 'root' ? t('ui.skillTree.root') : t('ui.skillTree.pathN', { n: hoveredNode.path })}
                {' · '}{hoveredNode.cost}pt{hoveredNode.cost > 1 ? 's' : ''}
              </span>
            </div>
            <p style={{ ...TYPE.body, fontSize: 13, lineHeight: 1.35, color: INK.dim, marginBottom: 3 }}>{hoveredNode.desc}</p>
            <p className="text-[14px] italic"
              style={{ ...TYPE.numeral, fontSize: 12, color: hoveredState === 'unlocked' ? MATERIAL.verdigris.base : hoveredState === 'available' ? MATERIAL.ember.base : INK.ghost }}>
              {hintText[hoveredState]}
            </p>
          </div>
        ) : (
          <div className="h-full flex items-center justify-center text-center">
            <p style={{ ...TYPE.body, fontSize: 14, color: INK.ghost }}>
              {t('ui.skillTree.hover')}
            </p>
          </div>
        )}
      </div>

      {/* SVG Tree */}
      <div className="overflow-hidden mb-4" style={{ background: STONE.s0, border: `1px solid ${LINE.base}` }}>
        <svg viewBox="0 0 680 350" width="100%" style={{ display: 'block', padding: '4px 0' }}>
          {/* Connectors first */}
          {tree.nodes.flatMap(node =>
            (node.requires ?? []).map(reqId => {
              const src = tree.nodes.find(n => n.id === reqId);
              return src ? renderConnector(src, node) : null;
            })
          )}
          {/* Nodes */}
          {tree.nodes.map(renderNode)}
        </svg>
      </div>

      {/* Active bonuses */}
      {bonusLines.length > 0 && (
        <div className="p-4 mb-4" style={{ background: STONE.s1, border: `1px solid ${LINE.base}` }}>
          <div className="flex items-center gap-2 mb-3">
            <div className="flex-1" style={{ height: 1, background: LINE.base }} />
            <span className="text-[13px] font-cinzel uppercase tracking-widest" style={{ color: accentColor }}>
              {t('ui.skillTree.bonuses')}
            </span>
            <div className="flex-1" style={{ height: 1, background: LINE.base }} />
          </div>
          <div className="flex flex-wrap gap-1.5">
            {bonusLines.map((line, i) => (
              <span key={i}
                className="text-[14px] font-cinzel px-2 py-0.5 rounded border"
                style={{
                  color: accentColor,
                  borderColor: `${accentColor}40`,
                  background: 'rgba(0,0,0,0.4)',
                }}>
                {line}
              </span>
            ))}
          </div>
        </div>
      )}

      {/* Reset button */}
      <div className="flex items-center justify-between">
        <button
          onClick={handleReset}
          disabled={unlockedIds.length === 0}
          className="text-[14px] font-cinzel uppercase tracking-widest px-3 py-1.5 rounded border transition-all"
          style={{
            background: 'transparent',
            borderColor: unlockedIds.length > 0 ? LINE.hover : LINE.base,
            color: unlockedIds.length > 0 ? INK.dim : INK.ghost,
            cursor: unlockedIds.length > 0 ? 'pointer' : 'default',
          }}
        >
          ↺ {t('ui.skillTree.reset')}
        </button>
        <p style={{ ...TYPE.label, fontSize: 12, color: INK.ghost }}>
          {t('ui.skillTree.footnote')}
        </p>
      </div>

      {/* XP tip */}
      {masteryLevel < 10 && (
        <div className="mt-4 p-3 text-center" style={{ background: STONE.s1, border: `1px solid ${LINE.base}` }}>
          <p style={{ ...TYPE.label, fontSize: 12, color: INK.ghost }}>
            <Trans i18nKey="ui.skillTree.playWith" values={{ name: charName.split(' ')[0] }}>Play with <span style={{ color: accentColor }}>{'{{name}}'}</span> to earn mastery XP and unlock more skill points.</Trans>
            <br />{t('ui.skillTree.xpRates')}
          </p>
        </div>
      )}
    </div>
  );
};
