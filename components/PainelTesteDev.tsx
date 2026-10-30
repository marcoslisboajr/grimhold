// Painel de teste (so DEV_TESTE). Ferramenta de dev: textos so em pt-BR, fora do i18n de proposito.
import React, { useState } from 'react';
import { PixelPanel, PixelButton } from './ui/Pixel';
import { ATOS, ultimaOnda } from './data/atos';
import { STARTER_CHARS } from './data/starterChars';
import { HEROIS_CORROMPIVEIS } from './chefes/lista';
import { type CfgPainelTeste, CFG_PADRAO, nivelJogadorNaOnda, nivelHeroiNaOnda, nivelRecrutaNaOnda, recrutasNaOnda, vagasNaOnda, ouroNaOnda } from './systems/painelTesteDev';
import type { AllyType } from '../types';

const CHAVE = 'grimhold_dev_painel';
const lerCfg = (): CfgPainelTeste => { try { return { ...CFG_PADRAO, ...JSON.parse(localStorage.getItem(CHAVE) || '{}') }; } catch { return CFG_PADRAO; } };
const txt = (s: number): React.CSSProperties => ({ fontFamily: 'var(--font-pixel)', fontSize: s, color: '#e8dcc0' });
const DIFS = [['easy', 'Facil'], ['normal', 'Normal'], ['hard', 'Dificil'], ['infernal', 'Infernal']] as const;

const Linha: React.FC<{ rotulo: string; children: React.ReactNode }> = ({ rotulo, children }) => (
  <div style={{ display: 'flex', gap: 6, alignItems: 'center', flexWrap: 'wrap', marginBottom: 8 }}>
    <span style={{ ...txt(16), width: 110, opacity: 0.8 }}>{rotulo}</span>{children}
  </div>
);
const Opc: React.FC<{ on: boolean; onClick: () => void; children: React.ReactNode; testid?: string }> = ({ on, onClick, children, testid }) => (
  <PixelButton active={on} onClick={onClick} data-testid={testid} style={{ padding: '2px 8px', fontSize: 15, fontFamily: 'var(--font-pixel)' }}>{children}</PixelButton>
);
const selStyle: React.CSSProperties = { ...txt(15), background: '#1b1714', border: '2px solid #4a3f33', padding: '2px 4px' };

export const PainelTesteDev: React.FC<{ onIniciar: (c: CfgPainelTeste) => void; onFechar: () => void }> = ({ onIniciar, onFechar }) => {
  const [c, setC] = useState<CfgPainelTeste>(lerCfg);
  const set = (p: Partial<CfgPainelTeste>) => setC(v => ({ ...v, ...p }));
  const ato = ATOS.find(a => a.modo === c.modo);
  const ehX = !!ato?.lutaFinal;
  const ultima = ultimaOnda(ato);   // onda do chefe final (X: 31)
  const iniciar = () => { try { localStorage.setItem(CHAVE, JSON.stringify(c)); } catch {} onIniciar(c); };
  return (
    <div data-testid="painel-teste-dev" style={{ position: 'fixed', inset: 0, zIndex: 400, background: 'rgba(7,6,10,0.8)', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
      <PixelPanel material="gold" style={{ padding: 18, width: 640, maxWidth: '95vw', maxHeight: '92vh', overflowY: 'auto' }}>
        <div style={{ ...txt(26), fontFamily: 'var(--font-pixel-display)', marginBottom: 10 }}>PAINEL DE TESTE (DEV)</div>
        <Linha rotulo="Ato">
          {ATOS.map(a => <Opc key={a.modo} on={c.modo === a.modo} testid={`ato-${a.numeral}`} onClick={() => set({ modo: a.modo, fome: a.lutaFinal ? c.fome : 0 })}>{a.numeral}</Opc>)}
        </Linha>
        <Linha rotulo="Onda inicial">
          <input data-testid="onda" type="number" min={1} max={50} value={c.onda} style={{ ...selStyle, width: 60 }}
            onChange={e => set({ onda: Math.max(1, Math.min(50, parseInt(e.target.value, 10) || 1)) })} />
          {[1, 10, 20, 29, 30, ...(ultima > 30 ? [ultima] : [])].map(n => <Opc key={n} on={c.onda === n} onClick={() => set({ onda: n })}>{n}</Opc>)}
        </Linha>
        <Linha rotulo="Dificuldade">
          {DIFS.map(([k, n]) => <Opc key={k} on={c.dificuldade === k} onClick={() => set({ dificuldade: k })}>{n}</Opc>)}
        </Linha>
        <Linha rotulo="Heroi">
          <select data-testid="heroi" value={c.heroi} style={selStyle} onChange={e => set({ heroi: e.target.value as AllyType })}>
            {STARTER_CHARS.map(h => <option key={h.type} value={h.type}>{h.type}</option>)}
          </select>
        </Linha>
        <Linha rotulo="Time pronto">
          <Opc on={c.timePronto} testid="time-pronto" onClick={() => set({ timePronto: !c.timePronto })}>{c.timePronto ? 'SIM' : 'NAO'}</Opc>
          {c.timePronto && <span style={txt(14)}>
            jog. nv {nivelJogadorNaOnda(c.onda)} · heroi nv {nivelHeroiNaOnda(c.onda)} · {Math.min(recrutasNaOnda(c.onda), vagasNaOnda(c.onda) - 1)} recrutas nv {nivelRecrutaNaOnda(c.onda)} · {vagasNaOnda(c.onda)} vagas · +{ouroNaOnda(c.onda)} ouro
          </span>}
        </Linha>
        <Linha rotulo="Muralha imortal">
          <Opc on={c.muralhaImortal} testid="muralha" onClick={() => set({ muralhaImortal: !c.muralhaImortal })}>{c.muralhaImortal ? 'SIM' : 'NAO'}</Opc>
        </Linha>
        {ehX && <>
          <Linha rotulo="Luta final">
            {[[0, `Onda ${ultima} (chefe)`], [1, 'Fome fase 1'], [2, 'Fome fase 2'], [3, 'Fome fase 3']].map(([k, n]) =>
              <Opc key={k} on={c.fome === k} testid={`fome-${k}`} onClick={() => set({ fome: k as number, onda: ultima })}>{n}</Opc>)}
          </Linha>
          <Linha rotulo="Corrompido">
            <select data-testid="corrompido" value={c.corrompido ?? ''} style={selStyle} onChange={e => set({ corrompido: e.target.value || null })}>
              <option value="">nenhum (Malachar)</option>
              {HEROIS_CORROMPIVEIS.map(h => <option key={h} value={h}>{h}</option>)}
            </select>
          </Linha>
        </>}
        <div style={{ display: 'flex', gap: 10, justifyContent: 'flex-end', marginTop: 12 }}>
          <PixelButton onClick={onFechar} style={{ padding: '4px 14px', fontFamily: 'var(--font-pixel)', fontSize: 18 }}>Fechar</PixelButton>
          <PixelButton material="gold" data-testid="iniciar-teste" onClick={iniciar} style={{ padding: '4px 14px', fontFamily: 'var(--font-pixel)', fontSize: 18 }}>Iniciar teste</PixelButton>
        </div>
        <div style={{ ...txt(13), opacity: 0.6, marginTop: 8 }}>F9 abre este painel (menu ou em jogo). So existe no npm run dev.</div>
      </PixelPanel>
    </div>
  );
};

export const BotaoAbrirPainelTeste: React.FC<{ onClick: () => void }> = ({ onClick }) => (
  <PixelButton data-testid="abrir-painel-teste" onClick={onClick} style={{ position: 'fixed', left: 8, bottom: 8, zIndex: 150, padding: '2px 8px', fontFamily: 'var(--font-pixel)', fontSize: 14 }}>Teste (F9)</PixelButton>
);

export const BotaoTentarDeNovo: React.FC<{ onda: number; onClick: () => void }> = ({ onda, onClick }) => (
  <PixelButton material="gold" data-testid="tentar-de-novo" onClick={onClick}
    style={{ position: 'fixed', left: '50%', top: 12, transform: 'translateX(-50%)', zIndex: 260, padding: '4px 16px', fontFamily: 'var(--font-pixel)', fontSize: 20 }}>
    Tentar de novo desta onda ({onda})
  </PixelButton>
);
