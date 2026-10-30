// ══════════════════════════════════════════════════════════════════════
// components/panels/EncontroOverlay.tsx
// Encontro entre ondas: cena com 2–3 escolhas (dados em data/encontros.ts).
// Tela cheia por cima do campo, mesma direcao de arte do level-up (PixelPanel).
// Opcao com `requer` fora do time aparece apagada com o nome de quem falta —
// e assim que o jogador descobre que vale variar o time.
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import { t } from '../../i18n';
import { PixelPanel, PixelButton } from '../ui/Pixel';
import { INK, MATERIAL } from '../systems/materials';
import { STARTER_CHARS } from '../data/starterChars';
import type { Encontro, OpcaoEncontro } from '../data/encontros';

interface Props {
  encontro: Encontro;
  alliesTipos: string[];
  ouro: number;
  muralhaHp: number;
  onEscolher: (opcao: OpcaoEncontro) => void;
}

const nomeDe = (tipo: string) => (STARTER_CHARS.find(h => h.type === tipo)?.name ?? tipo).replace(/\s*[（(].*$/, '');

export const EncontroOverlay: React.FC<Props> = ({ encontro, alliesTipos, ouro, muralhaHp, onEscolher }) => (
  <div className="fixed inset-0 z-[200] flex items-center justify-center" style={{ background: 'rgba(5,4,8,0.86)' }}>
    <style>{`@keyframes encontroIn{from{opacity:0;transform:translateY(14px)}to{opacity:1;transform:translateY(0)}}`}</style>
    <div style={{ animation: 'encontroIn 0.25s steps(5) both', width: 'min(92vw, 640px)' }}>
      <PixelPanel material="bone" hi style={{ padding: '14px 18px 16px' }}>
        <div className="pixel-text uppercase text-center" style={{ fontSize: 13, letterSpacing: '0.24em', color: MATERIAL.gold.base, lineHeight: 1 }}>
          {t('ui.encontro.rotulo')}
        </div>
        <div className="pixel-display text-center" style={{ fontSize: 30, lineHeight: 1.05, color: INK.base, marginTop: 8 }}>
          {t(`encontro.${encontro.id}.titulo`)}
        </div>
        <p className="pixel-text" style={{ fontSize: 18, lineHeight: 1.3, color: INK.base, margin: '14px 4px 18px', textAlign: 'center' }}>
          {t(`encontro.${encontro.id}.texto`)}
        </p>

        <div className="flex flex-col gap-2">
          {/* Todo encontro tem saida sem custo: se nenhuma opcao ja for "nada", entra um "seguir em frente" */}
          {[...encontro.opcoes, ...(encontro.opcoes.some(o => !o.efeitos.length && !o.custoOuro && !o.custoMuralha && !o.requer) ? [] : [{ id: 'ignorar', efeitos: [] } as OpcaoEncontro])].map(op => {
            const faltando = op.requer && !op.requer.some(r => alliesTipos.includes(r)) ? op.requer : null;
            const semOuro = (op.custoOuro ?? 0) > ouro;
            const semMuralha = (op.custoMuralha ?? 0) >= muralhaHp;   // nunca deixa a muralha em 0
            const bloqueada = !!faltando || semOuro || semMuralha;
            return (
              <PixelButton key={op.id} data-testid="encontro-opcao" material={faltando ? 'neutral' : op.requer ? 'amethyst' : op.id === 'ignorar' ? 'neutral' : 'gold'} disabled={bloqueada}
                onClick={() => !bloqueada && onEscolher(op)}
                style={{ padding: '9px 12px', textAlign: 'left', opacity: bloqueada ? 0.55 : 1, cursor: bloqueada ? 'not-allowed' : 'pointer' }}>
                <div className="pixel-text" style={{ fontSize: 17, lineHeight: 1.2, color: INK.base, textTransform: 'none', letterSpacing: 0 }}>
                  {op.id === 'ignorar' ? t('ui.encontro.ignorar') : t(`encontro.${encontro.id}.op.${op.id}`)}
                </div>
                <div className="pixel-text" style={{ fontSize: 13, lineHeight: 1.1, marginTop: 3, color: faltando ? MATERIAL.amethyst.base : semOuro || semMuralha ? MATERIAL.oxblood.base : INK.dim }}>
                  {faltando
                    ? t('ui.encontro.requer', { nome: faltando.map(nomeDe).join(' / ') })
                    : [op.custoOuro ? t('ui.encontro.custoOuro', { n: op.custoOuro }) : null,
                       op.custoMuralha ? t('ui.encontro.custoMuralha', { n: op.custoMuralha }) : null]
                        .filter(Boolean).join(' · ')}
                </div>
              </PixelButton>
            );
          })}
        </div>
      </PixelPanel>
    </div>
  </div>
);
