// ══════════════════════════════════════════════════════════════════════
// components/MapSelectOverlay.tsx — escolha de mapa do Infinito, do Guardiao
// Solitario (sobre o Infinito), do Pacifista e do Randomizador (29/09).
// O mapa e SO visual (fundo + objetos altos da arena, com as pegadas deles);
// os inimigos continuam os do modo. Miniaturas = os bg_act<N>_field.png do
// jogo reduzidos (sem arte nova). Tudo pixel: PixelPanel/PixelButton/INK.
// ══════════════════════════════════════════════════════════════════════
import React from 'react';
import { PixelPanel, PixelButton } from './ui/Pixel';
import { PixelIcon } from './ui/PixelIcon';
import { INK, STONE, MATERIAL } from './systems/materials';
import { ATOS } from './data/atos';
import { MAPAS_ATOS, type EscolhaMapa } from './systems/endless';
import { t } from '../i18n';

interface MapSelectOverlayProps {
  /** modo da run: 'endless' (tambem o Solitario), 'pacifist' ou 'randomizer' — muda o texto de "seguir as ondas" */
  modo: string;
  /** modos de ato cujo mapa esta liberado */
  liberados: string[];
  inicial: EscolhaMapa;
  onConfirm: (escolha: EscolhaMapa) => void;
  onBack: () => void;
}

const THUMB_W = 176, THUMB_H = 99;   // 1250x900 do campo reduzido, recortado 16:9 (pixelated)

export const MapSelectOverlay: React.FC<MapSelectOverlayProps> = ({ modo, liberados, inicial, onConfirm, onBack }) => {
  const mapas = MAPAS_ATOS();
  const [escolha, setEscolha] = React.useState<EscolhaMapa>(
    inicial === 'seguir' || inicial === 'aleatorio' || liberados.includes(inicial) ? inicial : 'seguir');
  const ehRand = modo === 'randomizer';

  const opcaoExtra = (id: 'seguir' | 'aleatorio', icone: string, titulo: string, desc: string) => {
    const on = escolha === id;
    return (
      <button key={id} data-testid={`mapa-${id}`} onClick={() => setEscolha(id)} className="gh-cell text-left"
        style={{ padding: 0, background: 'none', cursor: 'pointer' }}>
        <PixelPanel material={on ? 'gold' : 'neutral'} hi={on} className="flex items-center gap-3" style={{ padding: '10px 14px', minHeight: 76 }}>
          <PixelIcon name={icone} size={40} />
          <div className="flex flex-col gap-1">
            <span className="pixel-display" style={{ fontSize: 26, lineHeight: 1, color: on ? MATERIAL.gold.base : INK.base, letterSpacing: '.06em' }}>{titulo}</span>
            <span className="pixel-text" style={{ fontSize: 15, color: INK.dim, lineHeight: 1.25 }}>{desc}</span>
          </div>
        </PixelPanel>
      </button>
    );
  };

  return (
    <div className="fixed inset-0 z-[250] flex items-center justify-center" data-testid="mapa-select"
      style={{ background: STONE.s0, backgroundImage: 'url(./ui/pixel/menu_bg.png)', backgroundSize: 'cover', backgroundPosition: 'center bottom', imageRendering: 'pixelated' }}>
      <div className="absolute inset-0 pointer-events-none" style={{ background: 'rgba(7,6,10,0.66)' }} />
      <div className="relative z-10 flex flex-col items-center gap-6 px-4 w-full overflow-y-auto py-8" style={{ maxWidth: 'min(96vw, 1120px)', maxHeight: '100vh' }}>
        <div className="text-center">
          <div className="pixel-text" style={{ fontSize: 15, letterSpacing: '.34em', color: INK.faint, marginBottom: 8 }}>
            {t(ehRand ? 'ui.mapSelect.eyebrowRandomizer' : modo === 'pacifist' ? 'ui.mapSelect.eyebrowPacifist' : 'ui.mapSelect.eyebrowEndless')}
          </div>
          <h2 className="pixel-display" style={{ letterSpacing: '.12em', fontSize: 'clamp(1.8rem, 4vw, 3.2rem)', color: INK.base, lineHeight: 1, margin: 0 }}>
            {t('ui.mapSelect.title')}
          </h2>
          <div className="pixel-text" style={{ fontSize: 15, color: INK.dim, marginTop: 8 }}>{t('ui.mapSelect.hint')}</div>
        </div>

        <div className="grid gap-3 w-full" style={{ gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))' }}>
          {opcaoExtra('seguir', 'spiral', t('ui.mapSelect.follow'), t(ehRand ? 'ui.mapSelect.followDescRandomizer' : 'ui.mapSelect.followDesc'))}
          {opcaoExtra('aleatorio', 'dice', t('ui.mapSelect.random'), t('ui.mapSelect.randomDesc'))}
        </div>

        <div className="grid gap-3 w-full" style={{ gridTemplateColumns: `repeat(auto-fill, minmax(${THUMB_W + 24}px, 1fr))` }}>
          {mapas.map(m => {
            const a = ATOS.find(x => x.modo === m)!;
            const livre = liberados.includes(m);
            const on = escolha === m;
            const tx = a.textos ?? `act${a.numero}`;
            return (
              <button key={m} data-testid={`mapa-${m}`} disabled={!livre} onClick={() => livre && setEscolha(m)}
                className={livre ? 'gh-cell' : ''} style={{ padding: 0, background: 'none', cursor: livre ? 'pointer' : 'not-allowed' }}>
                <PixelPanel material={on ? 'gold' : livre ? a.selecao.material : 'neutral'} hi={on} className="flex flex-col items-center gap-2" style={{ padding: 8 }}>
                  <div className="relative" style={{ width: THUMB_W, height: THUMB_H, overflow: 'hidden', background: '#07060a',
                    backgroundImage: `url(./sprites/arena/bg_act${a.numero}_field.png)`, backgroundSize: `${Math.round(THUMB_H * 1250 / 900)}px ${THUMB_H}px`,
                    backgroundPosition: 'center', imageRendering: 'pixelated', filter: livre ? undefined : 'grayscale(1) brightness(0.35)' }}>
                    {!livre && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <PixelIcon name="lock" size={40} />
                      </div>
                    )}
                  </div>
                  <span className="pixel-display" style={{ fontSize: 22, lineHeight: 1, color: on ? MATERIAL.gold.base : livre ? INK.base : INK.ghost, letterSpacing: '.06em' }}>
                    {t(`ui.actSelect.${tx}.title`)}
                  </span>
                  <span className="pixel-text" style={{ fontSize: 13, lineHeight: 1.1, color: livre ? INK.dim : INK.ghost, minHeight: 15 }}>
                    {livre ? t(`ui.actSelect.${tx}.subtitle`) : t('ui.mapSelect.locked')}
                  </span>
                </PixelPanel>
              </button>
            );
          })}
        </div>

        <div className="flex gap-4 items-center">
          <PixelButton material="bone" onClick={onBack} className="pixel-display" style={{ fontSize: 22, padding: '6px 22px' }}>{t('ui.mapSelect.back')}</PixelButton>
          <PixelButton material="gold" active data-testid="mapa-confirmar" onClick={() => onConfirm(escolha)} className="pixel-display" style={{ fontSize: 24, padding: '6px 28px' }}>{t('ui.mapSelect.confirm')}</PixelButton>
        </div>
      </div>
    </div>
  );
};
