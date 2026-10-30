import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';
import './index.css';
// i18n ANTES de qualquer import de dados: o init do i18next e sincrono,
// entao t() ja funciona quando os arquivos de dados forem carregados.
import { detectSteamLanguage } from './i18n';

// --- OVERRIDE LOCALSTORAGE FOR ELECTRON SAVE SUPPORT (STEAM CLOUD) ---
if ((window as any).saveAPI && (window as any).saveAPI.isElectron) {
  try {
    const initialData = (window as any).saveAPI.loadAllSync();
    if (initialData && typeof initialData === 'object') {
      Object.entries(initialData).forEach(([key, value]) => {
        localStorage.setItem(key, value as string);
      });
    }
  } catch (e) {
    console.error('Failed to load initial Electron save:', e);
  }

  const originalSetItem = localStorage.setItem;
  localStorage.setItem = function (key: string, value: string) {
    originalSetItem.apply(this, [key, value]);
    if (key) {
      (window as any).saveAPI.saveKeyAsync(key, value);
    }
  };

  const originalRemoveItem = localStorage.removeItem;
  localStorage.removeItem = function (key: string) {
    originalRemoveItem.apply(this, [key]);
    (window as any).saveAPI.deleteKeyAsync(key);
  };
}

// Se o jogador nunca escolheu idioma na mao, adota o da Steam (async).
void detectSteamLanguage();

ReactDOM.createRoot(document.getElementById('root')!).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>
);
