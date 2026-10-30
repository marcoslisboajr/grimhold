// ══════════════════════════════════════════════════════════════════════
// components/LanguageSelect.tsx — seletor de idioma.
// Versao pixel: botoes de madeira (ui/Pixel), o ativo aceso em ouro.
// ══════════════════════════════════════════════════════════════════════

import React from 'react';
import { INK, MATERIAL } from './data/materials';
import { PixelButton } from './ui/Pixel';
import { PixelIcon } from './ui/PixelIcon';
import { useLanguage } from '../i18n/useLanguage';
import { t } from '../i18n';

interface Props {
  /** Mostra o cabeçalho "Language / Idioma". Default: true. */
  showLabel?: boolean;
  className?: string;
}

export const LanguageSelect: React.FC<Props> = ({ showLabel = true, className }) => {
  const { lang, setLang, languages } = useLanguage();

  return (
    <div className={className} style={{ fontFamily: 'var(--font-pixel)' }}>
      {showLabel && (
        <div style={{ fontSize: 14, letterSpacing: '0.16em', textTransform: 'uppercase', color: INK.faint, marginBottom: 8 }}>
          {t('ui.language.label')}
        </div>
      )}
      <div className="flex flex-col gap-2">
        {languages.map(l => {
          const active = l.code === lang;
          return (
            <PixelButton key={l.code} material={active ? 'gold' : 'neutral'} active={active} onClick={() => setLang(l.code)}
              className="flex items-center justify-between gap-4 text-left" style={{ padding: '7px 12px' }}>
              <div>
                <div style={{ fontFamily: 'var(--font-pixel-display)', fontSize: 19, lineHeight: 1 }}>{l.native}</div>
                <div style={{ fontSize: 14, marginTop: 2, opacity: 0.75 }}>{l.label}</div>
              </div>
              {/* marca do idioma ativo — largura fixa pra não mexer no layout */}
              <span className="flex-shrink-0 flex items-center justify-center" style={{ width: 18 }}>
                {active && <PixelIcon name="check" size={16} />}
              </span>
            </PixelButton>
          );
        })}
      </div>
      <div style={{ fontSize: 14, color: INK.ghost, marginTop: 6 }}>
        {t('ui.language.fallbackNote')}
      </div>
    </div>
  );
};

export default LanguageSelect;
