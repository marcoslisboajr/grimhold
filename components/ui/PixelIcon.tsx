// ══════════════════════════════════════════════════════════════════════
// components/ui/PixelIcon.tsx — icone pixel (Time Fantasy Icons) exportado
// por scripts/icones-pixel.py para public/ui/pixel/icons/<nome>.png (64 px).
// Substitui o <Sigil> (SVG de linha) onde a UI e pixel. Nomes validos:
// ver ICONES no script.
// ══════════════════════════════════════════════════════════════════════
import React from 'react';

export interface PixelIconProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  name: string;
  size?: number;
}

export const PixelIcon: React.FC<PixelIconProps> = ({ name, size = 32, style, ...rest }) => (
  <img src={`./ui/pixel/icons/${name}.png`} width={size} height={size} alt="" draggable={false}
    style={{ imageRendering: 'pixelated', display: 'inline-block', verticalAlign: 'middle', ...style }} {...rest} />
);
