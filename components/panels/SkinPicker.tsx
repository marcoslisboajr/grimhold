// ══════════════════════════════════════════════════════════════════════
// SkinPicker — setinha embaixo do retrato na seleção de herói; abre a
// lista de skins do herói: Original, compradas (equipar) e à venda (essência).
// ══════════════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { STONE, LINE, INK, MATERIAL, TYPE } from '../data/materials';
import { Sigil } from '../Sigil';
import { t } from '../../i18n';
import { SKINS, PRECO_SKIN, temSkin, skinEquipada, comprarSkin, equiparSkin, useSkins } from '../data/skins';

interface Props {
  tipo: string;
  essence: number;
  gastarEssencia: (n: number) => void;
  liberado: boolean;
}

export const SkinPicker: React.FC<Props> = ({ tipo, essence, gastarEssencia, liberado }) => {
  useSkins();
  const [aberto, setAberto] = useState(false);
  const lista = SKINS[tipo] ?? [];
  if (!lista.length) return null;
  const atual = skinEquipada(tipo);

  const item = (id: string | undefined, src: string, nome: string) => {
    const tem = !id || temSkin(id);
    const on = atual === id;
    const da = essence >= PRECO_SKIN;
    const clicavel = tem ? liberado : da;
    return (
      <button key={id ?? 'original'} disabled={!clicavel}
        onClick={() => {
          if (!tem) { if (!da) return; gastarEssencia(PRECO_SKIN); comprarSkin(id!); equiparSkin(tipo, id); return; }
          equiparSkin(tipo, id);
        }}
        className="flex flex-col items-center gap-1 p-1.5"
        title={!tem && !da ? t('ui.lojaPerfil.faltam', { n: PRECO_SKIN - essence }) : ''}
        style={{ width: 84, background: on ? STONE.s2 : STONE.s1, border: `1px solid ${on ? MATERIAL.gold.base : LINE.base}`,
                 cursor: clicavel ? 'pointer' : 'not-allowed', opacity: tem || da ? 1 : 0.55 }}>
        <div className="flex items-end justify-center" style={{ width: 64, height: 72 }}>
          <img src={src} draggable={false} style={{ imageRendering: 'pixelated', maxWidth: 60, maxHeight: 72, filter: tem ? 'none' : 'grayscale(0.6) brightness(0.75)' }} />
        </div>
        <span className="text-center" style={{ ...TYPE.label, fontSize: 11, color: on ? MATERIAL.gold.base : INK.dim, lineHeight: 1.15 }}>{nome}</span>
        {tem
          ? (on && <Sigil name="check" size={11} color={MATERIAL.gold.base} />)
          : <span className="flex items-center gap-1" style={{ ...TYPE.numeral, fontSize: 12, color: da ? MATERIAL.amethyst.base : INK.faint }}><Sigil name="gem" size={10} color={da ? MATERIAL.amethyst.base : INK.faint} />{PRECO_SKIN}</span>}
      </button>
    );
  };

  const arqOriginal = tipo === 'priest' ? 'hyo' : tipo;
  return (
    <div className="relative flex justify-center" data-testid="skin-picker">
      <button onClick={(e) => { e.stopPropagation(); setAberto(a => !a); }} data-testid="skin-seta"
        className="flex items-center gap-1 px-2 py-0.5"
        style={{ background: STONE.s1, border: `1px solid ${aberto ? MATERIAL.gold.base : LINE.base}`, cursor: 'pointer' }}
        title={t('ui.skins.titulo')}>
        <span style={{ ...TYPE.label, fontSize: 11, color: aberto ? MATERIAL.gold.base : INK.dim, letterSpacing: '.12em' }}>{t('ui.skins.botao')}</span>
        <span style={{ color: aberto ? MATERIAL.gold.base : INK.dim, fontSize: 10, transform: aberto ? 'rotate(180deg)' : 'none' }}>▼</span>
      </button>
      {aberto && (
        <div className="absolute z-[50] flex flex-wrap gap-2 p-2" onClick={e => e.stopPropagation()}
          style={{ top: '100%', left: 0, marginTop: 4, background: STONE.s0, border: `1px solid ${MATERIAL.gold.dim}`, width: 'max-content', maxWidth: 300, boxShadow: '0 6px 18px rgba(0,0,0,.6)' }}>
          {item(undefined, `./sprites/allies/${arqOriginal}.png`, t('ui.skins.original'))}
          {lista.map(id => item(id, `./sprites/skins/${id}.png`, t(`avatar.skin_${id}.name`)))}
          {!liberado && <div style={{ ...TYPE.body, fontSize: 11, color: INK.faint, width: '100%' }}>{t('ui.skins.heroiTrancado')}</div>}
        </div>
      )}
    </div>
  );
};
