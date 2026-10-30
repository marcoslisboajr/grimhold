import React, { useState } from 'react';
import { GameCanvas } from './components/GameCanvas';
import { GameStatus } from './types';
import { useLanguage } from './i18n/useLanguage';
import { PixelAmostra } from './components/ui/PixelAmostra';

function App() {
  const [status, setStatus] = useState<GameStatus>(GameStatus.MENU);
  // Assina a troca de idioma: re-renderiza a arvore inteira pra que os
  // getters dos arquivos de dados sejam lidos de novo (sem remontar, pra
  // nao perder o estado da run em andamento).
  useLanguage();

  // Vitrine dos primitivos pixel (B1b): ?amostra=pixel, so no dev.
  // Na build o Vite apaga o bloco (import.meta.env.DEV = false).
  if (import.meta.env.DEV && new URLSearchParams(window.location.search).get('amostra') === 'pixel') {
    return <PixelAmostra />;
  }

  return (
    // bg matches body bg so letterbox bars (if any) are invisible
    <div
      className="no-select"
      style={{
        width: '100vw',
        height: '100dvh',
        background: '#0d0b18',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        overflow: 'hidden',
      }}
    >
      <GameCanvas status={status} setStatus={setStatus} />
    </div>
  );
}

export default App;
