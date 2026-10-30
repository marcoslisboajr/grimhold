// components/systems/steam.ts
// ─────────────────────────────────────────────────────────────────────────
// Ponte para as conquistas da Steam.
// Fora do Electron/Steam (navegador, itch.io) isto é um NO-OP silencioso —
// nunca lança erro, nunca quebra o jogo. A ponte real (window.steamAPI) é
// injetada pelo preload.cjs do Electron.
// ─────────────────────────────────────────────────────────────────────────

declare global {
  interface Window {
    steamAPI?: {
      unlockAchievement: (id: string) => void;
      /** Idioma do jogo na Steam ('english', 'brazilian', 'schinese'...). */
      getGameLanguage?: () => Promise<string | null>;
    };
  }
}

/**
 * Desbloqueia a conquista correspondente na Steam.
 * @param id  Mesmo id usado no jogo (ex: 'wave_5'). Deve ser idêntico ao
 *            "API Name" configurado no partner site da Steamworks.
 */
export function unlockSteamAchievement(id: string): void {
  try {
    if (typeof window !== 'undefined' && window.steamAPI) {
      window.steamAPI.unlockAchievement(id);
    }
  } catch {
    /* ignore — jogo segue normal sem Steam */
  }
}

/**
 * Idioma configurado pra este jogo na Steam.
 * Fora da Steam devolve null — o i18n cai na detecção do navegador.
 */
export async function getSteamLanguage(): Promise<string | null> {
  try {
    if (typeof window !== 'undefined' && window.steamAPI?.getGameLanguage) {
      return await window.steamAPI.getGameLanguage();
    }
  } catch {
    /* ignore — jogo segue normal sem Steam */
  }
  return null;
}

export {};
