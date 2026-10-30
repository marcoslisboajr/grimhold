// ══════════════════════════════════════════════════════════════════════
// components/ModeSelectOverlay.tsx — estilo Estela (menu / seleção de herói)
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import {
  STONE, LINE, INK, GROOVE, MATERIAL, TYPE, FONT,
  engraved, recessed, carved, lifted,
} from './data/materials';
import { PanelFrame, IconNiche, CarvedButton, Badge, Divider } from './primitives';
import { IS_DEMO, dificuldadeLiberada } from './systems/build';
import { Sigil, type SigilName } from './Sigil';
import { t } from '../i18n';

interface ModeSelectOverlayProps {
  infernalUnlocked: boolean;
  /** Desafio Semanal: semana ISO, heroi sorteado e melhor resultado local */
  semanal?: { semana: string; heroiNome: string; tentativas: number; melhor: { score: number; wave: number; heroType: string } | null };
  onConfirm: (diff: string, mode: string, curse: number | null, relicId: string | null) => void;
  onClose: () => void;
  starterType: string;
  characterMastery: Record<string, { level: number; xp: number }>;
}

// ── Dados ────────────────────────────────────────────────────────────────────
type MatKey = keyof typeof MATERIAL;

// Funções, não const de módulo: precisam chamar t() em tempo de render pra
// resolver no idioma atual e reagir à troca de idioma ao vivo (mesmo padrão
// getter usado no resto do projeto — ver plano/I18N_PLANO.md).
const getDifficulties = () => ([
  { id: 'easy', label: t('ui.modeSelect.diff.easy.label', 'EASY'), icon: 'sprout' as SigilName, mkey: 'verdigris' as MatKey,
    desc: t('ui.modeSelect.diff.easy.desc', 'For beginners. Slower enemies, more resilient barrier.'),
    tag: t('ui.modeSelect.diff.easy.tag', 'Recommended for new players') },
  { id: 'normal', label: t('ui.modeSelect.diff.normal.label', 'NORMAL'), icon: 'scales' as SigilName, mkey: 'frost' as MatKey,
    desc: t('ui.modeSelect.diff.normal.desc', 'The standard experience. Strategy and good composition are essential.'),
    tag: t('ui.modeSelect.diff.normal.tag', 'Balanced experience') },
  { id: 'hard', label: t('ui.modeSelect.diff.hard.label', 'HARD'), icon: 'skull' as SigilName, mkey: 'oxblood' as MatKey,
    desc: t('ui.modeSelect.diff.hard.desc', 'Aggressive enemies, scarce gold. Every decision matters.'),
    tag: t('ui.modeSelect.diff.hard.tag', 'For veterans') },
  { id: 'infernal', label: t('ui.modeSelect.diff.infernal.label', 'INFERNAL'), icon: 'flame' as SigilName, mkey: 'ember' as MatKey,
    desc: t('ui.modeSelect.diff.infernal.desc', 'Only the best survive. No mercy, no rest.'),
    tag: t('ui.modeSelect.diff.infernal.tag', 'Beat the game first'), locked: true },
// Na demo so Facil e Normal. Dificil e Infernal sao do jogo comprado — ver
// DEMO_DIFICULDADES em systems/build.ts.
] as const).filter(d => dificuldadeLiberada(d.id));

const getSpecialModes = () => ([
  { id: 'none', label: t('ui.modeSelect.modes.none.label', 'STANDARD'), icon: 'swords' as SigilName, mkey: 'slate' as MatKey,
    desc: t('ui.modeSelect.modes.none.desc', 'No modifiers. The classic Grimhold experience.') },
  { id: 'pacifist', label: t('ui.modeSelect.modes.pacifist.label', 'PACIFIST'), icon: 'dove' as SigilName, mkey: 'verdigris' as MatKey,
    desc: t('ui.modeSelect.modes.pacifist.desc', 'Chill mode. Barrier and allies have infinite HP. No essence rewards.') },
  { id: 'endless', label: t('ui.modeSelect.modes.endless.label', 'ENDLESS'), icon: 'infinity' as SigilName, mkey: 'gold' as MatKey,
    desc: t('ui.modeSelect.modes.endless.desc', 'After wave 50, waves keep coming forever. How long can you hold?') },
  { id: 'randomizer', label: t('ui.modeSelect.modes.randomizer.label', 'RANDOMIZER'), icon: 'dice' as SigilName, mkey: 'amethyst' as MatKey,
    desc: t('ui.modeSelect.modes.randomizer.desc', 'Completely random enemies every wave. Choose your difficulty and adapt or perish.'),
    badge: t('ui.modeSelect.modes.randomizer.badge', 'UNPREDICTABLE') },
  // Guardiao Solitario: e um MODIFICADOR sobre o Infinito (vira gameMode 'endless' + soloRef
  // no GameCanvas, 29/09). Na demo (sem Infinito) segue no modo de ato, pela selecao de ato
  { id: 'solo', label: t('ui.modeSelect.modes.solo.label', 'LONE GUARDIAN'), icon: 'crown' as SigilName, mkey: 'oxblood' as MatKey,
    desc: t('ui.modeSelect.modes.solo.desc', 'Your hero alone. No summons: every card is theirs, and they level faster.'),
    badge: t('ui.modeSelect.modes.solo.badge', 'ONE HERO') },
  // Desafio Semanal: seed = semana ISO, heroi sorteado, Normal, Ato I, sem reliquia (systems/semanal.ts)
  { id: 'weekly', label: t('ui.modeSelect.modes.weekly.label', 'WEEKLY CHALLENGE'), icon: 'trophy' as SigilName, mkey: 'gold' as MatKey,
    desc: t('ui.modeSelect.modes.weekly.desc', 'Same run for everyone this week: fixed seed, drawn hero, Normal, Act I. Beat your best.'),
    badge: t('ui.modeSelect.modes.weekly.badge', 'SEEDED') },
// Na demo o corte e "Ato I completo", e os modos especiais PULAM a selecao
// de ato — deixa-los abertos daria conteudo sem limite e furaria o corte.
// (o Solitario passa pela selecao de ato, entao respeita o corte e fica liberado)
] as const).filter(m => !IS_DEMO || m.id === 'none' || m.id === 'solo' || m.id === 'weekly');

// ── Componente ────────────────────────────────────────────────────────────────
export const ModeSelectOverlay = ({
  infernalUnlocked,
  semanal,
  onConfirm,
  onClose,
}: ModeSelectOverlayProps) => {
  const [step, setStep] = React.useState(1);
  const [selectedDiff, setSelectedDiff] = React.useState<string | null>(null);
  const [selectedMode, setSelectedMode] = React.useState('none');
  const [hoveredDiff, setHoveredDiff] = React.useState<string | null>(null);
  const [hoveredMode, setHoveredMode] = React.useState<string | null>(null);
  const [selectedCurse, setSelectedCurse] = React.useState<number | null>(null);
  const [animating, setAnimating] = React.useState(false);

  const DIFFICULTIES = getDifficulties();
  const SPECIAL_MODES = getSpecialModes();
  const currentMode = SPECIAL_MODES.find(m => m.id === selectedMode);
  const canProceed = true;

  const handleSelectMode = (m: typeof SPECIAL_MODES[number]) => {
    setSelectedMode(m.id); setSelectedCurse(null);
  };
  const handleProceedToDiff = () => {
    if (!canProceed) return;
    if (selectedMode === 'weekly') { onConfirm('normal', 'weekly', null, null); return; }   // dificuldade fixa: pula a etapa
    setAnimating(true);
    setTimeout(() => { setStep(2); setAnimating(false); }, 380);
  };
  const handleSelectDiff = (d: typeof DIFFICULTIES[number]) => {
    if ((d as any).locked && !infernalUnlocked) return;
    onConfirm(d.id, selectedMode, selectedCurse, null);
  };
  const handleBack = () => {
    setAnimating(true);
    setTimeout(() => { setStep(1); setSelectedDiff(null); setAnimating(false); }, 300);
  };

  return (
    <div className="ui-zoom" style={{
      position: 'fixed', inset: 0, zIndex: 200, background: STONE.s0,
      backgroundImage: 'url(./ui/pixel/menu_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom', imageRendering: 'pixelated',
      display: 'flex', flexDirection: 'column', fontFamily: FONT.display, overflow: 'hidden',
    }}>
      <style>{`
        @keyframes es-fadeup { from { opacity:0; transform:translateY(14px) } to { opacity:1; transform:translateY(0) } }
        .es-card { transition: transform .16s ease, border-color .16s ease; cursor:pointer; }
        .es-card:hover { transform: translateY(-3px); }
        .es-card:active { transform: translateY(0); }
        .es-back { transition: color .16s ease; }
        .es-back:hover { color: ${INK.base} !important; }
      `}</style>

      {/* escurece a cena pra os cards lerem bem */}
      <div style={{ position:'absolute', inset:0, pointerEvents:'none', zIndex:0, background:'rgba(7,6,10,0.62)' }} />

      {/* fechar */}
      <CarvedButton
        onClick={onClose}
        material={MATERIAL.bone}
        style={{ position:'fixed', top:16, right:16, zIndex:30, ...TYPE.label, fontSize:14, letterSpacing:'.2em' }}
        icon="cross"
      >{t('ui.modeSelect.back', 'BACK')}</CarvedButton>

      {/* área rolável */}
      <div style={{
        position:'absolute', inset:0, overflowY:'auto', overflowX:'hidden', zIndex:10,
        display:'flex', flexDirection:'column', alignItems:'center',
        padding:'clamp(28px,5vh,64px) clamp(16px,3vw,48px) 56px',
      }}>
        {/* cabeçalho */}
        <div style={{ textAlign:'center', marginBottom:34, width:'100%', animation:'es-fadeup .4s ease both' }}>
          <div style={{ ...TYPE.label, fontSize:12, letterSpacing:'.55em', color:INK.faint, marginBottom:12 }}>
            GRIMHOLD
          </div>
          <h1 style={{
            ...TYPE.pageTitle, fontSize:'clamp(26px,4vw,52px)', color:INK.base, margin:0,
            letterSpacing:'.06em', ...engraved,
          }}>
            {step === 1
              ? t('ui.modeSelect.title.mode', 'CHOOSE YOUR MODE')
              : t('ui.modeSelect.title.difficulty', 'CHOOSE YOUR DIFFICULTY')}
          </h1>

          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:12, marginTop:10 }}>
            <span style={{ width:64, height:1, background:`linear-gradient(to right, transparent, ${LINE.hover})` }} />
            <Sigil name="swords" size={12} style={{ color: INK.faint } as any} />
            <span style={{ width:64, height:1, background:`linear-gradient(to left, transparent, ${LINE.hover})` }} />
          </div>

          {/* stepper */}
          <div style={{ display:'flex', alignItems:'center', justifyContent:'center', gap:10, marginTop:16 }}>
            {([t('ui.modeSelect.step.mode', 'MODE'), t('ui.modeSelect.step.difficulty', 'DIFFICULTY')] as const).map((label, i) => {
              const done = step > i + 1, active = step === i + 1;
              const accent = active ? MATERIAL.ember.base : done ? MATERIAL.verdigris.base : INK.faint;
              return (
                <div key={label} style={{ display:'flex', alignItems:'center', gap:10 }}>
                  <div style={{ display:'flex', alignItems:'center', gap:7, opacity: active||done ? 1 : 0.5 }}>
                    <span style={{
                      width:20, height:20, border:`1px solid ${done ? MATERIAL.verdigris.base : active ? MATERIAL.ember.base : LINE.base}`,
                      background: done ? MATERIAL.verdigris.dim : STONE.s1, ...recessed,
                      display:'flex', alignItems:'center', justifyContent:'center',
                      ...TYPE.numeral, fontSize:13, color: accent,
                    }}>
                      {done ? <Sigil name="check" size={12} /> : i + 1}
                    </span>
                    <span style={{ ...TYPE.label, fontSize:12, letterSpacing:'.22em', color: accent }}>{label}</span>
                  </div>
                  {i < 1 && <span style={{ width:30, height:1, background: done ? MATERIAL.verdigris.dim : LINE.base }} />}
                </div>
              );
            })}
          </div>
        </div>

        {/* ── STEP 1 — MODOS ── */}
        {step === 1 && (
          <div style={{
            width:'100%', maxWidth:'min(96vw,1100px)',
            opacity: animating ? 0 : 1, transition:'opacity .3s ease',
          }}>
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(280px,1fr))', gap:16, marginBottom:22 }}>
              {SPECIAL_MODES.map((m, i) => {
                const mat = MATERIAL[m.mkey];
                const isSel = selectedMode === m.id;
                const isHov = hoveredMode === m.id;
                const lit = isSel || isHov;
                return (
                  <PanelFrame
                    key={m.id}
                    accent={isSel ? mat.base : lit ? mat.dim : LINE.base}
                    style={{ animation:`es-fadeup .4s ${i*0.06}s ease both`, cursor:'pointer' } as any}
                  >
                    <div
                      className="es-card"
                      onMouseEnter={() => setHoveredMode(m.id)}
                      onMouseLeave={() => setHoveredMode(null)}
                      onClick={() => handleSelectMode(m)}
                      style={{ position:'relative', padding:'22px 20px' }}
                    >
                      {isSel && (
                        <div style={{ position:'absolute', top:14, right:14, color: mat.base }}>
                          <Sigil name="check" size={16} />
                        </div>
                      )}
                      <IconNiche icon={m.icon} material={mat} size={46} />
                      <div style={{
                        ...TYPE.label, fontSize:12, letterSpacing:'.18em', marginTop:14, marginBottom:8,
                        color: lit ? mat.base : INK.dim, ...(lit ? engraved : {}),
                      }}>{m.label}</div>
                      <p style={{ fontFamily:FONT.body, fontSize:10.5, lineHeight:1.7, color:INK.faint, margin:0 }}>
                        {m.desc}
                      </p>
                      {(m as any).badge && (
                        <div style={{ marginTop:12 }}>
                          <Badge label={(m as any).badge} material={mat} mark="✦" />
                        </div>
                      )}
                    </div>
                  </PanelFrame>
                );
              })}
            </div>

            {/* banner do Desafio Semanal */}
            {selectedMode === 'weekly' && semanal && (
              <div style={{ animation:'es-fadeup .3s ease both', marginBottom:20 }}>
                <Divider label={t('ui.semanal.banner', { semana: semanal.semana })} accent={MATERIAL.gold.base} />
                <p style={{ fontFamily:FONT.body, fontSize:12, lineHeight:1.7, color:INK.dim, margin:'6px 0 0', textAlign:'center' }}>
                  {t('ui.semanal.heroi', { nome: semanal.heroiNome })}
                  {' · '}
                  {semanal.melhor ? t('ui.semanal.melhor', { pts: semanal.melhor.score, onda: semanal.melhor.wave, n: semanal.tentativas }) : t('ui.semanal.semTentativa')}
                </p>
              </div>
            )}
            {/* banner do Pacifist */}
            {selectedMode === 'pacifist' && (
              <div style={{ animation:'es-fadeup .3s ease both', marginBottom:20 }}>
                <Divider label={t('ui.modeSelect.pacifistBanner.title', 'PACIFIST MODE')} accent={MATERIAL.verdigris.base} />
                <div style={{ display:'grid', gap:8 }}>
                  {([
                    { icon:'shield' as SigilName, text:t('ui.modeSelect.pacifistBanner.barrier', 'Barrier has infinite HP — cannot be destroyed') },
                    { icon:'heart' as SigilName, text:t('ui.modeSelect.pacifistBanner.allies', 'Allies cannot die') },
                    { icon:'gamepad' as SigilName, text:t('ui.modeSelect.pacifistBanner.chill', 'Chill experience — no essence rewards') },
                  ]).map((it, i) => (
                    <div key={i} style={{
                      display:'flex', alignItems:'center', gap:12, padding:'9px 13px',
                      background:STONE.s1, border:`1px solid ${LINE.base}`, ...carved,
                    }}>
                      <span style={{ color: MATERIAL.verdigris.base, display:'flex' }}>
                        <Sigil name={it.icon} size={15} />
                      </span>
                      <span style={{ fontFamily:FONT.body, fontSize:10.5, lineHeight:1.5, color:INK.dim }}>{it.text}</span>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* prosseguir */}
            <CarvedButton
              full
              material={MATERIAL[currentMode?.mkey ?? 'ember']}
              disabled={!canProceed}
              onClick={handleProceedToDiff}
              style={{ padding:'15px 0', letterSpacing:'.32em', fontSize:12 }}
            >
              <Sigil name="chevronR" size={13} /> {selectedMode === 'weekly' ? t('ui.semanal.jogar') : t('ui.modeSelect.proceedButton', 'CHOOSE YOUR DIFFICULTY')}
            </CarvedButton>
          </div>
        )}

        {/* ── STEP 2 — DIFICULDADE ── */}
        {step === 2 && (
          <div style={{
            width:'100%', maxWidth:'min(96vw,1100px)',
            opacity: animating ? 0 : 1, transition:'opacity .3s ease',
          }}>
            {/* voltar + selo do modo */}
            <div style={{ display:'flex', alignItems:'center', gap:14, marginBottom:26 }}>
              <button
                onClick={handleBack}
                className="es-back"
                style={{
                  ...TYPE.label, fontSize:12, letterSpacing:'.2em', color:INK.faint,
                  background:'none', border:'none', cursor:'pointer',
                  display:'flex', alignItems:'center', gap:6, padding:0,
                }}
              ><Sigil name="chevronL" size={13} /> {t('ui.modeSelect.back', 'BACK')}</button>
              <span style={{ flex:1, height:1, background:LINE.base }} />
              <div style={{
                display:'flex', alignItems:'center', gap:8,
                background:STONE.s1, border:`1px solid ${MATERIAL[currentMode?.mkey ?? 'slate'].dim}`,
                ...carved, padding:'6px 14px',
              }}>
                <span style={{ color: MATERIAL[currentMode?.mkey ?? 'slate'].base, display:'flex' }}>
                  <Sigil name={currentMode?.icon ?? 'swords'} size={14} />
                </span>
                <span style={{ ...TYPE.label, fontSize:12, letterSpacing:'.2em', color: MATERIAL[currentMode?.mkey ?? 'slate'].base }}>
                  {currentMode?.label ?? t('ui.modeSelect.modes.none.label', 'STANDARD')}
                </span>
              </div>
              <span style={{ flex:1, height:1, background:LINE.base }} />
            </div>

            {/* cards de dificuldade */}
            <div style={{ display:'grid', gridTemplateColumns:'repeat(auto-fit,minmax(220px,1fr))', gap:16 }}>
              {DIFFICULTIES.map((d, i) => {
                const mat = MATERIAL[d.mkey];
                const locked = (d as any).locked && !infernalUnlocked;
                const isHov = hoveredDiff === d.id && !locked;
                return (
                  <PanelFrame
                    key={d.id}
                    accent={isHov ? mat.base : mat.dim}
                    style={{ animation:`es-fadeup .45s ${i*0.06}s ease both`, opacity: locked ? 0.4 : 1 } as any}
                  >
                    <div
                      className="es-card"
                      onMouseEnter={() => !locked && setHoveredDiff(d.id)}
                      onMouseLeave={() => setHoveredDiff(null)}
                      onClick={() => handleSelectDiff(d)}
                      style={{ position:'relative', padding:'26px 20px', cursor: locked ? 'not-allowed' : 'pointer' }}
                    >
                      {locked && (
                        <div style={{ position:'absolute', top:14, right:14, color:INK.faint }}>
                          <Sigil name="lock" size={15} />
                        </div>
                      )}
                      <IconNiche icon={d.icon} material={mat} size={50} />
                      <div style={{
                        ...TYPE.label, fontSize:13, letterSpacing:'.2em', marginTop:14, marginBottom:8,
                        color: isHov ? mat.base : INK.dim, ...(isHov ? engraved : {}),
                      }}>{d.label}</div>
                      <p style={{ fontFamily:FONT.body, fontSize:10.5, lineHeight:1.75, color:INK.faint, margin:'0 0 14px' }}>
                        {d.desc}
                      </p>
                      <Badge label={d.tag} material={mat} />
                    </div>
                  </PanelFrame>
                );
              })}
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
