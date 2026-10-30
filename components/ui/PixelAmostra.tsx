// ══════════════════════════════════════════════════════════════════════
// components/ui/PixelAmostra.tsx — vitrine DEV dos primitivos pixel.
// Abre com http://localhost:3000/?amostra=pixel (so no `npm run dev`; a
// build de producao nao inclui este componente — ver App.tsx).
// Serve pra aprovar moldura, botao, barra e fonte ANTES de trocar a HUD.
// ══════════════════════════════════════════════════════════════════════
import React, { useState } from 'react';
import { PixelPanel, PixelButton, PixelBar } from './Pixel';
import { MATERIAL, INK, STONE, type MaterialName } from '../systems/materials';

const MATS = Object.keys(MATERIAL) as MaterialName[];

export const PixelAmostra: React.FC = () => {
  const [ativo, setAtivo] = useState<MaterialName>('ember');
  const [hp, setHp] = useState(0.72);
  return (
    <div style={{ width: '100vw', height: '100dvh', overflow: 'auto', background: STONE.s0, padding: 24, color: INK.base }}>
      <div className="pixel-display" style={{ fontSize: 56, lineHeight: 1, marginBottom: 4, color: '#dcd2c4' }}>GRIMHOLD</div>
      <div className="pixel-text" style={{ fontSize: 18, color: INK.dim, marginBottom: 24 }}>amostra dos primitivos pixel — Jersey 10 (título) e Jersey 15 (texto)</div>

      <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 20, maxWidth: 1100 }}>
        {/* Painel neutro com texto */}
        <PixelPanel style={{ padding: 8 }}>
          <div className="pixel-text" style={{ fontSize: 14, letterSpacing: '0.14em', color: INK.faint, textTransform: 'uppercase' }}>Integridade da barreira</div>
          <div className="pixel-display" style={{ fontSize: 34, color: INK.base }}>{Math.round(hp * 100)} / 100</div>
          <PixelBar value={hp} material="slate" height={14} />
          <div style={{ display: 'flex', gap: 8, marginTop: 10 }}>
            <PixelButton material="oxblood" onClick={() => setHp(v => Math.max(0, v - 0.1))} style={{ fontSize: 16 }}>Dano</PixelButton>
            <PixelButton material="verdigris" onClick={() => setHp(v => Math.min(1, v + 0.1))} style={{ fontSize: 16 }}>Reparar</PixelButton>
          </div>
        </PixelPanel>

        {/* Painel do chefe */}
        <PixelPanel material="oxblood" style={{ padding: 8 }}>
          <div className="pixel-text" style={{ fontSize: 14, letterSpacing: '0.14em', color: MATERIAL.gold.base, textTransform: 'uppercase' }}>☠ Zog'Krix</div>
          <PixelBar value={0.43} material="oxblood" height={16} style={{ marginTop: 6 }} />
          <div className="pixel-text" style={{ fontSize: 13, color: INK.dim, marginTop: 6 }}>Rei Goblin · Coroa de Ossos em 4 s</div>
        </PixelPanel>

        {/* Botoes por material */}
        <PixelPanel material="gold" hi style={{ padding: 8 }}>
          <div className="pixel-text" style={{ fontSize: 14, letterSpacing: '0.14em', color: INK.faint, textTransform: 'uppercase', marginBottom: 6 }}>Botões</div>
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6 }}>
            {MATS.map(m => (
              <PixelButton key={m} material={m} active={ativo === m} onClick={() => setAtivo(m)} style={{ fontSize: 15 }}>{m}</PixelButton>
            ))}
          </div>
          <PixelButton material="ember" disabled style={{ fontSize: 15, marginTop: 8 }}>desabilitado</PixelButton>
        </PixelPanel>

        {/* Painel de cada material */}
        {MATS.map(m => (
          <PixelPanel key={m} material={m} style={{ padding: 8, minHeight: 90 }}>
            <div className="pixel-text" style={{ fontSize: 15, color: MATERIAL[m].base, textTransform: 'uppercase', letterSpacing: '0.12em' }}>{m}</div>
            <div className="pixel-text" style={{ fontSize: 14, color: INK.dim }}>painel · acento na moldura</div>
            <PixelBar value={0.6} material={m} height={10} style={{ marginTop: 6 }} />
          </PixelPanel>
        ))}

        {/* Barra de feiticos (mock da HUD de baixo) */}
        <PixelPanel style={{ padding: 6, gridColumn: 'span 3', display: 'flex', gap: 8, alignItems: 'center' }}>
          {['Meteoro', 'Congelar', 'Reparar', 'Grito'].map((s, i) => (
            <PixelPanel key={s} material={i === 0 ? 'ember' : i === 1 ? 'frost' : i === 2 ? 'verdigris' : 'gold'} hi={i === 0} style={{ width: 84, height: 64, padding: 4, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
              <div className="pixel-display" style={{ fontSize: 22 }}>{['☄', '❄', '⚒', '⚔'][i]}</div>
              <div className="pixel-text" style={{ fontSize: 12, color: INK.dim }}>{s}</div>
            </PixelPanel>
          ))}
          <div style={{ flex: 1 }} />
          <div className="pixel-display" style={{ fontSize: 30, color: MATERIAL.gold.base }}>⛁ 1.240</div>
          <PixelButton material="gold" style={{ fontSize: 16 }}>Loja</PixelButton>
          <PixelButton material="neutral" style={{ fontSize: 16 }}>⏸</PixelButton>
        </PixelPanel>
      </div>
    </div>
  );
};
