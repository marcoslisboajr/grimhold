// Desenho da luta final do Ato X (Etapa 3b): so le fome.estado() e desenha — nenhuma regra aqui.
// Vermelho da Fome (tint + pulso na batida), tremor de tela, aviso e tentaculo que agarra, aviso de
// fileira e o Verme brotando do chao em pontos seguidos (da direita para a esquerda, vista de cima:
// monte -> boca -> volta; sprites de scripts/sprites-fome.py). Aviso desenhado por CSS (sem arte nova).
import React from 'react';
import * as fome from './chefes/fome';
import { CANVAS_WIDTH, CANVAS_HEIGHT, GRID_CELL_HEIGHT } from './systems/combat';

const VERME_QUADROS = 9, VERME_PONTOS = 7, VERME_DUR = 700;   // cada ponto: sobe e desce em 700 ms
const AGARRA_CRESCE = 300;

interface Props { agora: () => number; tremerAlvo: React.RefObject<HTMLDivElement | null> }

export function CamadaFome({ agora, tremerAlvo }: Props) {
  const [, setTique] = React.useState(0);
  React.useEffect(() => {
    let vivo = true;
    const id = setInterval(() => {
      if (!vivo) return;
      setTique(t => (t + 1) % 1e6);
      const s = fome.estado();
      const el = tremerAlvo.current;
      if (el) el.style.translate = s.tremor ? `${Math.round((Math.random() - 0.5) * 8)}px ${Math.round((Math.random() - 0.5) * 8)}px` : '';
    }, 50);
    return () => { vivo = false; clearInterval(id); if (tremerAlvo.current) tremerAlvo.current.style.translate = ''; };
  }, [tremerAlvo]);

  const s = fome.estado();
  if (s.fase === 'inativa') return null;
  const t = agora();
  const pulso = Math.max(0, 1 - (t - s.batida) / 500);   // 0..1 logo depois da batida
  const itens: React.ReactNode[] = [];

  if (s.agarra) {
    const g = s.agarra;
    if (t < g.avisoAte) {
      const k = 1 - (g.avisoAte - t) / 1000;
      itens.push(<div key="ag-aviso" style={{ position: 'absolute', left: g.x - 40, top: g.y + 10, width: 80, height: 34, borderRadius: '50%',
        border: '2px solid rgba(248,113,113,0.9)', background: `rgba(185,28,28,${0.15 + 0.35 * k})`, boxShadow: '0 0 12px rgba(220,38,38,0.8)' }} />);
    } else {
      const q = Math.min(4, 1 + Math.floor((t - g.avisoAte) / (AGARRA_CRESCE / 3)));
      itens.push(<img key="ag" src={`./sprites/enemies/fome_agarra_${q}.png`} alt="" draggable={false}
        style={{ position: 'absolute', left: g.x - 27, top: g.y - 150, width: 54, height: 192, imageRendering: 'pixelated' }} />);
    }
  }

  if (s.verme) {
    const v = s.verme;
    if (t < v.avisoAte) {
      const k = 1 - (v.avisoAte - t) / 1500;
      itens.push(<div key="ve-aviso" style={{ position: 'absolute', left: 0, top: v.y - GRID_CELL_HEIGHT / 2, width: CANVAS_WIDTH, height: GRID_CELL_HEIGHT,
        background: `rgba(185,28,28,${0.12 + 0.28 * k * (0.6 + 0.4 * Math.sin(t / 60))})`, borderTop: '2px dashed rgba(248,113,113,0.8)', borderBottom: '2px dashed rgba(248,113,113,0.8)' }} />);
    } else {
      const passo = (v.ate - v.avisoAte) / VERME_PONTOS;
      for (let i = 0; i < VERME_PONTOS; i++) {
        const t0 = v.avisoAte + i * passo;
        const d = t - t0;
        if (d < 0 || d > VERME_DUR) continue;
        const meio = VERME_DUR / 2;
        const q = Math.max(1, Math.min(VERME_QUADROS, 1 + Math.floor((d < meio ? d : VERME_DUR - d) / meio * (VERME_QUADROS - 1))));
        const x = CANVAS_WIDTH - 90 - i * ((CANVAS_WIDTH - 120) / (VERME_PONTOS - 1));
        itens.push(<img key={`ve-${i}`} src={`./sprites/enemies/fome_verme_${q}.png`} alt="" draggable={false}
          style={{ position: 'absolute', left: x - 66, top: v.y - 70, width: 132, height: 105, imageRendering: 'pixelated' }} />);
      }
    }
  }

  const tint = Math.min(0.6, s.tint + pulso * 0.12);
  return (
    <div className="absolute inset-0 pointer-events-none" style={{ zIndex: 25, width: CANVAS_WIDTH, height: CANVAS_HEIGHT }}>
      <div style={{ position: 'absolute', inset: 0, background: `radial-gradient(ellipse at center, rgba(120,0,20,${tint * 0.5}) 0%, rgba(90,0,15,${tint}) 100%)`,
        opacity: s.fase === 'transicao' ? Math.min(1, 0.5 + pulso) : 1 }} />
      {itens}
    </div>
  );
}
