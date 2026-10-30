// ══════════════════════════════════════════════════════════════════════
// panels/HeroCodexPage.tsx
// Página cheia de Heróis do menu (substitui o modal "Heróis"): à esquerda a
// grade de retratos com filtros por facção e papel; à direita a Ficha (stats,
// bom em / sofre com, posto, sinergias, compra) e a Crônica (crônica longa,
// origem, laços, epílogo se já visto). Sem lógica de jogo: recebe tudo por
// props. Conteúdo vem de data/lore.ts + i18n lore.* (ver docs/LORE.md).
// ══════════════════════════════════════════════════════════════════════

import React, { useMemo, useState } from 'react';
import { STONE, LINE, INK, GROOVE, MATERIAL, TYPE, FONT, engraved, carved, recessed, getRarity } from '../data/materials';
import { PixelPanel, PixelButton } from '../ui/Pixel';
import { Sigil } from '../Sigil';
import { CharacterSprite } from '../CharacterSprite';
import { STARTER_CHARS } from '../data/starterChars';
import { GACHA_RARITY } from '../data/gacha';
import { COMBOS } from '../data/synergies';
import { ALLY_DAMAGE_TYPE, DMG_TYPE_DISPLAY } from '../data/enemies';
import { POSTO_PREFERIDO, POSTOS, POSTO_PREFERIDO_BONUS } from '../systems/combat';
import { LORE, FACCOES, PAPEIS, FACCAO_COR, LACO_ICONE, type Faccao, type Papel } from '../data/lore';
import { t, hasKey } from '../../i18n';
import type { AllyType } from '../../types';

export interface HeroCodexPageProps {
  unlockedTypes: string[];
  essence: number;
  onUnlock: (type: AllyType) => void;
  unlockCost: (type: AllyType) => number;
  conquestText: (type: string) => string | undefined;   // texto da conquista, se o herói só vem por conquista
  endingsSeen: string[];
  isDemo: boolean;
  onClose: () => void;
}

const RARITY_ORDER: Record<string, number> = { common: 0, uncommon: 1, semiRare: 2, rare: 3, legendary: 4, mythic: 5 };
const primeiroNome = (nome: string) => nome.replace(/\s*[(（].*$/, '');   // 'Krash (Mago)' e 'Krash（法师）' -> 'Krash'
const classe = (nome: string) => (nome.match(/[(（](.+)[)）]/)?.[1] ?? '');

const Divisor: React.FC<{ label: string }> = ({ label }) => (
  <div className="flex items-center gap-3 mb-3">
    <div className="flex-1" style={{ height: 1, background: LINE.base }} />
    <span style={{ ...TYPE.label, fontSize: 13, color: INK.faint }}>{label}</span>
    <div className="flex-1" style={{ height: 1, background: LINE.base }} />
  </div>
);

const Bloco: React.FC<{ label: string; children: React.ReactNode; className?: string }> = ({ label, children, className = '' }) => (
  <div className={`p-4 ${className}`} style={{ background: STONE.s1, ...carved }}>
    <Divisor label={label} />
    {children}
  </div>
);

const Chip: React.FC<{ on: boolean; color?: string; onClick: () => void; children: React.ReactNode }> = ({ on, color, onClick, children }) => (
  <button onClick={onClick} className="px-2 py-1"
    style={{ ...TYPE.label, fontSize: 12, borderRadius: 0, cursor: 'pointer',
             background: on ? STONE.s2 : STONE.s0, color: on ? (color ?? INK.base) : INK.faint,
             border: `1px solid ${on ? (color ?? INK.base) : LINE.base}` }}>
    {children}
  </button>
);

const Retrato: React.FC<{ tipo: string; size: number; dim?: boolean }> = ({ tipo, size, dim }) => (
  <img src={`./ui/pixel/avatars/${tipo}.png`} alt="" width={size} height={size} draggable={false}
    style={{ imageRendering: 'pixelated', opacity: dim ? 0.45 : 1, filter: dim ? 'grayscale(70%)' : 'none' }} />
);

export const HeroCodexPage: React.FC<HeroCodexPageProps> = ({
  unlockedTypes, essence, onUnlock, unlockCost, conquestText, endingsSeen, isDemo, onClose,
}) => {
  const [tipo, setTipo] = useState<string>(unlockedTypes[0] ?? 'mage');
  const [aba, setAba] = useState<'ficha' | 'cronica'>('ficha');
  const [filtroFaccao, setFiltroFaccao] = useState<Faccao | null>(null);
  const [filtroPapel, setFiltroPapel] = useState<Papel | null>(null);

  const herois = useMemo(() => [...STARTER_CHARS].sort((a, b) => {
    const ra = RARITY_ORDER[GACHA_RARITY[a.type] ?? 'common'] ?? 0;
    const rb = RARITY_ORDER[GACHA_RARITY[b.type] ?? 'common'] ?? 0;
    return ra !== rb ? ra - rb : a.name.localeCompare(b.name);
  }), []);

  const visiveis = herois.filter(h => {
    const l = LORE[h.type as string];
    if (!l) return false;
    if (filtroFaccao && l.faccao !== filtroFaccao) return false;
    if (filtroPapel && l.papel !== filtroPapel) return false;
    return true;
  });

  const sel = STARTER_CHARS.find(h => h.type === tipo) ?? STARTER_CHARS[0];
  const lore = LORE[sel.type as string];
  const raridade = GACHA_RARITY[sel.type] ?? 'common';
  const rar = getRarity(raridade);
  const desbloqueado = unlockedTypes.includes(sel.type);
  const secreto = (sel.type as string) === 'malachar_human' && !desbloqueado;
  const corFaccao = FACCAO_COR[lore.faccao];
  const escolher = (tp: string) => { setTipo(tp); };

  const totalVenda = (unlockedTypes.includes('malachar_human') ? STARTER_CHARS.length : STARTER_CHARS.length - 1) - unlockedTypes.length;

  return (
    <div className="fixed inset-0 z-[300] flex flex-col" style={{ background: STONE.s0 }} data-testid="hero-codex">
      {/* ── Cabeçalho ── */}
      <div className="shrink-0 flex items-center justify-between px-4 md:px-6 py-3" style={{ background: STONE.s0, borderBottom: `1px solid ${LINE.base}` }}>
        <div className="flex items-center gap-3">
          <span style={{ color: MATERIAL.oxblood.base }}><Sigil name="swords" size={20} /></span>
          <div>
            <h2 style={{ ...TYPE.pageTitle, fontSize: 'clamp(1.1rem,2vw,1.6rem)', color: INK.base, ...engraved }}>{t('ui.heroShop.title')}</h2>
            <div style={{ ...TYPE.label, fontSize: 12, color: INK.faint }}>{t('ui.heroShop.counter', { n: unlockedTypes.length, disponiveis: totalVenda })}</div>
          </div>
        </div>
        <div className="flex items-center gap-3">
          <PixelPanel hi className="flex items-center gap-2" style={{ padding: '4px 10px' }}>
            <Sigil name="banner" size={14} color={MATERIAL.gold.base} />
            <span style={{ ...TYPE.numeral, fontSize: 16, color: INK.base }} title={t('ui.estandartes.dica')}>{essence}</span>
          </PixelPanel>
          <PixelButton material="neutral" onClick={onClose} style={{ fontSize: 14, letterSpacing: '.12em', padding: '6px 14px' }} data-testid="codex-fechar">
            ← {t('ui.codex.menu')}
          </PixelButton>
        </div>
      </div>

      <div className="flex-1 flex min-h-0">
        {/* ── Coluna esquerda: filtros + grade ── */}
        <div className="shrink-0 flex flex-col min-h-0" style={{ width: 'clamp(260px, 32vw, 380px)', background: STONE.s1, borderRight: `1px solid ${LINE.base}` }}>
          <div className="shrink-0 p-3 flex flex-col gap-2" style={{ borderBottom: `1px solid ${LINE.base}` }}>
            <div className="flex flex-wrap gap-1" data-testid="filtro-faccao">
              <Chip on={filtroFaccao === null} onClick={() => setFiltroFaccao(null)}>{t('ui.codex.todas')}</Chip>
              {FACCOES.map(f => (
                <Chip key={f} on={filtroFaccao === f} color={FACCAO_COR[f]} onClick={() => setFiltroFaccao(filtroFaccao === f ? null : f)}>
                  {t(`lore.faccao.${f}.nome`)}
                </Chip>
              ))}
            </div>
            <div className="flex flex-wrap gap-1" data-testid="filtro-papel">
              <Chip on={filtroPapel === null} onClick={() => setFiltroPapel(null)}>{t('ui.codex.todos')}</Chip>
              {PAPEIS.map(p => (
                <Chip key={p} on={filtroPapel === p} onClick={() => setFiltroPapel(filtroPapel === p ? null : p)}>{t(`lore.papel.${p}`)}</Chip>
              ))}
            </div>
          </div>
          <div className="flex-1 overflow-y-auto custom-scrollbar p-3">
            <div className="grid gap-2" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(76px, 1fr))' }}>
              {visiveis.map(h => {
                const on = h.type === sel.type;
                const unl = unlockedTypes.includes(h.type);
                const oculto = (h.type as string) === 'malachar_human' && !unl;
                const r = GACHA_RARITY[h.type] ?? 'common';
                const cor = FACCAO_COR[LORE[h.type as string].faccao];
                return (
                  <button key={h.type} onClick={() => escolher(h.type as string)} data-testid={`codex-heroi-${h.type}`}
                    className="relative flex flex-col items-center p-1.5"
                    style={{ background: on ? STONE.s2 : STONE.s0, border: `${on ? 2 : 1}px solid ${on ? getRarity(r).accent : LINE.base}`, borderRadius: 0, cursor: 'pointer' }}>
                    <div className="relative">
                      {oculto
                        ? <div style={{ width: 56, height: 56, background: '#050508' }} />
                        : <Retrato tipo={h.type as string} size={56} dim={!unl} />}
                      {!unl && !oculto && (
                        <div className="absolute bottom-0 right-0 p-0.5" style={{ background: STONE.s0 }}><Sigil name="lock" size={9} color={INK.faint} /></div>
                      )}
                    </div>
                    <span className="mt-1 truncate w-full text-center" style={{ fontFamily: FONT.display, fontSize: 12, color: oculto ? INK.ghost : INK.base }}>
                      {oculto ? '???' : primeiroNome(h.name)}
                    </span>
                    <span style={{ ...TYPE.label, fontSize: 14, color: oculto ? INK.ghost : getRarity(r).accent }}>{oculto ? '???' : getRarity(r).label}</span>
                    <div style={{ height: 2, width: '100%', marginTop: 3, background: oculto ? LINE.base : cor }} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        {/* ── Coluna direita: cabeçalho do herói + abas ── */}
        <div className="flex-1 flex flex-col min-h-0 min-w-0">
          <div className="shrink-0 flex items-center gap-4 px-4 md:px-6 py-3" style={{ background: STONE.s0, borderBottom: `1px solid ${LINE.base}` }}>
            <div className="relative w-20 h-20 md:w-24 md:h-24 flex items-center justify-center shrink-0 overflow-hidden"
              style={{ background: GROOVE.lo, ...recessed }}>
              {secreto
                ? <span style={{ fontFamily: FONT.display, fontSize: 28, color: INK.ghost }}>?</span>
                : <div style={{ opacity: desbloqueado ? 1 : 0.5, filter: desbloqueado ? 'none' : 'grayscale(60%)' }}>
                    <CharacterSprite type={sel.type} isHero className="w-16 h-16 md:w-20 md:h-20" />
                  </div>}
            </div>
            <div className="flex-1 min-w-0">
              <h3 className="truncate" data-testid="codex-nome" style={{ fontFamily: FONT.display, fontWeight: 700, fontSize: 'clamp(1.2rem,2.2vw,1.7rem)', color: INK.base, ...engraved }}>
                {secreto ? '???' : primeiroNome(sel.name)}
                {!secreto && <span style={{ ...TYPE.label, fontSize: 13, color: INK.faint, marginLeft: 10 }}>{classe(sel.name)}</span>}
              </h3>
              <div className="flex flex-wrap gap-2 mt-1.5">
                <span style={{ ...TYPE.label, fontSize: 12, padding: '2px 7px', color: rar.accent, border: `1px solid ${rar.accent}`, background: STONE.s0 }}>{rar.mark} {rar.label}</span>
                {!secreto && <>
                  <span style={{ ...TYPE.label, fontSize: 12, padding: '2px 7px', color: corFaccao, border: `1px solid ${corFaccao}`, background: STONE.s0 }} data-testid="codex-faccao">{t(`lore.faccao.${lore.faccao}.nome`)}</span>
                  <span style={{ ...TYPE.label, fontSize: 12, padding: '2px 7px', color: INK.dim, border: `1px solid ${LINE.base}`, background: STONE.s0 }}>{t(`lore.papel.${lore.papel}`)}</span>
                </>}
              </div>
            </div>
            {/* Bloco de compra / estado */}
            {!secreto && (
              <div className="shrink-0 flex flex-col items-center gap-1" data-testid="codex-compra">
                {desbloqueado ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: STONE.s1, border: `1px solid ${MATERIAL.verdigris.dim}` }}>
                    <Sigil name="check" size={12} color={MATERIAL.verdigris.base} />
                    <span style={{ ...TYPE.label, fontSize: 12, color: MATERIAL.verdigris.base }}>{t('ui.heroShop.unlocked')}</span>
                  </div>
                ) : (sel.type as string) === 'malachar_human' && conquestText(sel.type as string) ? (
                  <div className="flex flex-col items-center gap-0.5 px-3 py-1.5" style={{ background: STONE.s1, border: `1px solid ${MATERIAL.gold.dim}`, maxWidth: 220 }}>
                    <span style={{ ...TYPE.label, fontSize: 12, color: MATERIAL.gold.base }}>{t('ui.heroShop.conquest')}</span>
                    <span className="text-center" style={{ ...TYPE.body, fontSize: 13, color: INK.dim, lineHeight: 1.25 }}>{conquestText(sel.type as string)}</span>
                  </div>
                ) : isDemo ? (
                  <div className="flex items-center gap-1.5 px-3 py-1.5" style={{ background: STONE.s2, border: `1px solid ${LINE.base}` }}>
                    <Sigil name="lock" size={10} color={INK.faint} />
                    <span style={{ ...TYPE.label, fontSize: 12, color: INK.faint }}>{t('ui.demo.heroLocked')}</span>
                  </div>
                ) : (() => {
                  const custo = unlockCost(sel.type as AllyType);
                  const da = essence >= custo;
                  // Conquista / passe continuam valendo: mostra a condição e, embaixo, a compra por Estandartes
                  const viaConquista = (sel.type as string) === 'jester' ? t('ui.heroShop.reachLevel') : conquestText(sel.type as string);
                  return <>
                    {viaConquista && (
                      <span className="text-center" style={{ ...TYPE.body, fontSize: 12, color: INK.dim, lineHeight: 1.25, maxWidth: 240 }}>
                        <span style={{ color: MATERIAL.gold.base }}>{(sel.type as string) === 'jester' ? t('ui.heroShop.battlePass') : t('ui.heroShop.conquest')}:</span> {viaConquista} · {t('ui.heroShop.ouCompre')}
                      </span>
                    )}
                    <button onClick={() => onUnlock(sel.type as AllyType)} disabled={!da} data-testid="codex-comprar"
                      className="px-5 py-2.5 flex items-center gap-2"
                      style={{ background: da ? STONE.s2 : STONE.s1, border: `1px solid ${da ? MATERIAL.amethyst.base : LINE.base}`, borderRadius: 0, cursor: da ? 'pointer' : 'not-allowed', opacity: da ? 1 : 0.55 }}>
                      <Sigil name="banner" size={14} color={da ? MATERIAL.gold.base : INK.faint} />
                      <span style={{ ...TYPE.label, fontSize: 13, letterSpacing: '.2em', color: da ? INK.base : INK.faint }}>{t('ui.charSelect.unlock')}</span>
                      <span style={{ ...TYPE.numeral, fontSize: 14, color: da ? MATERIAL.gold.base : INK.faint }}>{custo}</span>
                    </button>
                    {!da && <span style={{ ...TYPE.numeral, fontSize: 13, color: MATERIAL.oxblood.base }}>{t('ui.charSelect.needMoreEst', { n: custo - essence })}</span>}
                  </>;
                })()}
              </div>
            )}
          </div>

          {/* Abas */}
          <div className="shrink-0 flex gap-1 px-2 pt-1.5" style={{ borderBottom: `2px solid ${LINE.base}`, background: STONE.s0 }}>
            {([['ficha', 'note', t('ui.codex.abaFicha')], ['cronica', 'scroll', t('ui.codex.abaCronica')]] as const).map(([k, ic, label]) => (
              <PixelButton key={k} material={aba === k ? 'ember' : 'neutral'} active={aba === k} onClick={() => setAba(k)} data-testid={`codex-aba-${k}`}
                style={{ flex: '0 0 auto', minWidth: 150, fontSize: 15, letterSpacing: '.12em', display: 'flex', alignItems: 'center', justifyContent: 'center', gap: 7, padding: '6px 14px 8px' }}>
                <Sigil name={ic} size={13} />{label}
              </PixelButton>
            ))}
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 md:p-5 flex flex-col gap-4" data-testid="codex-corpo">
            {secreto ? (
              <Bloco label={t('ui.heroShop.secret')}>
                <p style={{ ...TYPE.body, fontSize: 15, color: INK.dim }}>{t('ui.codex.epilogoBloqueado')}</p>
              </Bloco>
            ) : aba === 'ficha' ? (
              <>
                {/* Stats */}
                <div className="flex flex-wrap gap-2">
                  {[
                    { label: t('ui.charSelect.statDmg'), val: sel.damage, icon: 'blade', mat: MATERIAL.oxblood },
                    { label: t('ui.charSelect.statSpd'), val: `${(1000 / (sel.attackSpeed ?? 1000)).toFixed(1)}/s`, icon: 'fast', mat: MATERIAL.verdigris },
                    { label: t('ui.charSelect.statHp'), val: sel.hp, icon: 'heart', mat: MATERIAL.ember },
                    { label: t('ui.charSelect.statRng'), val: sel.range, icon: 'bow', mat: MATERIAL.slate },
                  ].map(st => (
                    <PixelPanel key={st.label} hi className="flex items-center gap-2" style={{ padding: '2px 8px' }}>
                      <Sigil name={st.icon} size={13} color={st.mat.base} />
                      <span style={{ ...TYPE.label, fontSize: 13, color: INK.faint }}>{st.label}</span>
                      <span style={{ ...TYPE.numeral, fontSize: 16, color: INK.base }}>{st.val}</span>
                    </PixelPanel>
                  ))}
                  {(() => {
                    const dt = ALLY_DAMAGE_TYPE[sel.type]; const dd = dt ? DMG_TYPE_DISPLAY[dt] : null;
                    return dd ? (
                      <PixelPanel hi className="flex items-center gap-2" style={{ padding: '2px 8px' }}>
                        <Sigil name="arcane" size={13} color={MATERIAL.amethyst.base} />
                        <span style={{ ...TYPE.label, fontSize: 13, color: INK.faint }}>{t('ui.charSelect.type')}</span>
                        <span style={{ ...TYPE.numeral, fontSize: 14, color: INK.base }}>{dd.full}</span>
                      </PixelPanel>
                    ) : null;
                  })()}
                </div>

                <Bloco label={t('ui.charTabs.ability')}>
                  <p style={{ ...TYPE.flavor, fontSize: 15, color: INK.base, borderLeft: `2px solid ${rar.accent}`, paddingLeft: 12 }}>{sel.description}</p>
                </Bloco>

                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  <Bloco label={t('ui.codex.bomEm')}>
                    <ul className="flex flex-col gap-1.5" data-testid="codex-bom-em">
                      {Array.from({ length: lore.bomEm }, (_, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span style={{ color: MATERIAL.verdigris.base, flexShrink: 0, marginTop: 3 }}><Sigil name="check" size={11} /></span>
                          <span style={{ ...TYPE.body, fontSize: 15, color: INK.dim }}>{t(`lore.${sel.type}.bomEm.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </Bloco>
                  <Bloco label={t('ui.codex.sofreCom')}>
                    <ul className="flex flex-col gap-1.5">
                      {Array.from({ length: lore.sofreCom }, (_, i) => (
                        <li key={i} className="flex items-start gap-2">
                          <span style={{ color: MATERIAL.oxblood.base, flexShrink: 0, fontFamily: FONT.mono, fontSize: 14 }}>✕</span>
                          <span style={{ ...TYPE.body, fontSize: 15, color: INK.dim }}>{t(`lore.${sel.type}.sofreCom.${i}`)}</span>
                        </li>
                      ))}
                    </ul>
                  </Bloco>
                </div>

                {/* Posto preferido */}
                {(() => {
                  const col = POSTO_PREFERIDO[sel.type as string];
                  if (col === undefined) return null;
                  const posto = POSTOS[col];
                  const bonusKey = `ui.posto.bonus.${sel.type}`;
                  return (
                    <Bloco label={t('ui.posto.preferido')}>
                      <div className="flex items-center gap-3 flex-wrap">
                        <span style={{ ...TYPE.itemName, fontSize: 16, color: MATERIAL.gold.base }}>{t(`ui.posto.${posto.chave}`)}</span>
                        <span style={{ ...TYPE.numeral, fontSize: 13, color: INK.faint }}>+{Math.round(POSTO_PREFERIDO_BONUS * 100)}% {t('ui.posto.dano')} · +{Math.round(POSTO_PREFERIDO_BONUS * 100)}% {t('ui.posto.alcance')}</span>
                      </div>
                      {hasKey(bonusKey) && <p className="mt-2" style={{ ...TYPE.body, fontSize: 15, color: INK.dim }}>{t(bonusKey)}</p>}
                    </Bloco>
                  );
                })()}

                {/* Sinergias (combos que o incluem) */}
                {(() => {
                  const combos = COMBOS.filter(c => c.types.includes(sel.type));
                  if (!combos.length) return null;
                  return (
                    <Bloco label={t('ui.charTabs.synergies')}>
                      <div className="flex flex-col gap-3">
                        {combos.map(combo => (
                          <div key={combo.id} className="p-3" style={{ border: `1px solid ${LINE.base}`, background: STONE.s0 }}>
                            <div className="flex items-center gap-2.5 mb-2">
                              <Sigil name="arcane" size={13} color={MATERIAL.amethyst.base} />
                              <span style={{ ...TYPE.itemName, fontSize: 16 }}>{combo.name}</span>
                              <span style={{ ...TYPE.numeral, fontSize: 13, color: INK.ghost, marginLeft: 'auto' }}>{t('ui.charSelect.synergyUnits', { n: combo.thresholds[0] })}</span>
                            </div>
                            <div className="flex flex-wrap gap-1.5 mb-2">
                              {combo.types.filter(tp => tp !== sel.type).map(tp => {
                                const pc = STARTER_CHARS.find(s => s.type === tp);
                                const pr = GACHA_RARITY[tp] ?? 'common';
                                return (
                                  <button key={tp} onClick={() => escolher(tp as string)} className="flex items-center gap-1.5 px-2 py-1"
                                    style={{ ...TYPE.label, fontSize: 12, background: STONE.s1, border: `1px solid ${LINE.base}`, color: getRarity(pr).accent, borderRadius: 0, cursor: 'pointer' }}>
                                    <CharacterSprite type={tp} className="w-4 h-4" />{pc ? primeiroNome(pc.name) : tp}
                                  </button>
                                );
                              })}
                            </div>
                            <div className="flex flex-col gap-1">
                              {combo.descs.map((d, i) => (
                                <div key={i} className="flex items-start gap-2">
                                  <span style={{ ...TYPE.numeral, fontSize: 13, color: MATERIAL.amethyst.base, flexShrink: 0, marginTop: 2 }}>T{i + 1}</span>
                                  <span style={{ ...TYPE.body, fontSize: 15, color: INK.dim }}>{d}</span>
                                </div>
                              ))}
                            </div>
                          </div>
                        ))}
                      </div>
                    </Bloco>
                  );
                })()}
              </>
            ) : (
              <>
                <Bloco label={t('ui.charTabs.chronicle')}>
                  <p style={{ ...TYPE.body, fontSize: 15, color: INK.dim, lineHeight: 1.9 }}>{sel.lore || sel.description}</p>
                  {hasKey(`lore.${sel.type}.faccaoTexto`) && (
                    <div className="mt-4 p-3.5" style={{ background: STONE.s0, border: `1px solid ${LINE.base}`, borderLeft: `3px solid ${corFaccao}` }}>
                      <div className="flex items-center gap-2 mb-1.5">
                        <span style={{ ...TYPE.label, fontSize: 11, letterSpacing: '.15em', color: corFaccao }}>
                          {t('ui.codex.registroFaccao', { faccao: t(`lore.faccao.${lore.faccao}.nome`) })}
                        </span>
                      </div>
                      <p style={{ ...TYPE.body, fontSize: 14.5, color: INK.base, lineHeight: 1.7, fontStyle: 'italic' }} data-testid="codex-faccao-texto">
                        "{t(`lore.${sel.type}.faccaoTexto`)}"
                      </p>
                    </div>
                  )}
                </Bloco>

                <div className="grid gap-4" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))' }}>
                  <Bloco label={t('ui.codex.origem')}>
                    <div style={{ ...TYPE.itemName, fontSize: 16, color: INK.base }}>{t(`lore.lugar.${lore.origem}`)}</div>
                    <p className="mt-2" style={{ ...TYPE.body, fontSize: 14, color: INK.dim, lineHeight: 1.5 }}>{t(`lore.faccao.${lore.faccao}.desc`)}</p>
                  </Bloco>
                  <Bloco label={t('ui.codex.lacos')}>
                    {lore.lacos.length === 0
                      ? <p style={{ ...TYPE.body, fontSize: 15, color: INK.faint }}>{t('ui.codex.semLacos')}</p>
                      : <div className="flex flex-col gap-3" data-testid="codex-lacos">
                          {lore.lacos.map(l => {
                            const outro = STARTER_CHARS.find(s => s.type === l.com);
                            const outroOculto = l.com === 'malachar_human' && !unlockedTypes.includes('malachar_human');
                            return (
                              <div key={l.chave} className="flex gap-3">
                                <button onClick={() => !outroOculto && escolher(l.com)} className="shrink-0" style={{ background: STONE.s0, border: `1px solid ${LINE.base}`, borderRadius: 0, cursor: outroOculto ? 'default' : 'pointer', padding: 2 }}>
                                  {outroOculto ? <div style={{ width: 40, height: 40, background: '#050508' }} /> : <Retrato tipo={l.com} size={40} />}
                                </button>
                                <div className="min-w-0">
                                  <div className="flex items-center gap-2">
                                    <span style={{ ...TYPE.itemName, fontSize: 15, color: INK.base }}>{outroOculto ? '???' : (outro ? primeiroNome(outro.name) : l.com)}</span>
                                    <span style={{ ...TYPE.label, fontSize: 11, color: MATERIAL.gold.base }}>{LACO_ICONE[l.tipo]} {t(`lore.laco.tipo.${l.tipo}`)}</span>
                                  </div>
                                  <p style={{ ...TYPE.body, fontSize: 14, color: INK.dim, lineHeight: 1.5 }}>{t(`lore.laco.${l.chave}`)}</p>
                                </div>
                              </div>
                            );
                          })}
                        </div>}
                  </Bloco>
                </div>

                <Bloco label={t('ui.codex.epilogo')}>
                  {endingsSeen.includes(sel.type as string) && hasKey(`ending.${sel.type}.panel.0`) ? (
                    <div className="flex flex-col gap-3" data-testid="codex-epilogo">
                      {[0, 1, 2].map(i => (
                        <p key={i} style={{ ...TYPE.body, fontSize: 15, color: INK.dim, lineHeight: 1.8 }}>
                          <span style={{ ...TYPE.numeral, fontSize: 13, color: MATERIAL.gold.base, marginRight: 8 }}>{['I', 'II', 'III'][i]}</span>
                          {t(`ending.${sel.type}.panel.${i}`)}
                        </p>
                      ))}
                    </div>
                  ) : (
                    <div className="flex items-center gap-2" data-testid="codex-epilogo-bloqueado">
                      <Sigil name="lock" size={11} color={INK.faint} />
                      <span style={{ ...TYPE.body, fontSize: 15, color: INK.faint }}>{t('ui.codex.epilogoBloqueado')}</span>
                    </div>
                  )}
                </Bloco>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};
