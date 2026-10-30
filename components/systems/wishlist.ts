// ══════════════════════════════════════════════════════════════════════
// components/systems/wishlist.ts
// Chamadas para a Lista de Desejos da Steam — SO na demo (IS_DEMO).
// A build completa nao usa nada daqui.
// ══════════════════════════════════════════════════════════════════════

/** Pagina da loja do jogo completo (App ID 5187440). */
export const STEAM_STORE_URL = 'https://store.steampowered.com/app/5187440/';

/** Ultimo ato jogavel da demo: vencer ele mostra o bloco "fim da demo". */
export const DEMO_ULTIMO_ATO = 2;

/** Heroi secreto: nunca aparece como silhueta. */
export const HEROI_SECRETO = 'malachar_human';

/**
 * Abre a loja: no Electron via steam://openurl (o main.cjs manda pra
 * shell.openExternal / cliente Steam), no navegador em aba nova.
 */
export const abrirLojaSteam = (): void => {
  const w = window as unknown as { saveAPI?: { isElectron?: boolean } };
  window.open(w.saveAPI?.isElectron ? `steam://openurl/${STEAM_STORE_URL}` : STEAM_STORE_URL, '_blank');
};

/**
 * Herois do jogo completo que a demo mostra como silhueta: todos os tipos
 * que o jogador nao tem, na ordem da lista, sem o heroi secreto.
 */
export const heroisSilhueta = (todos: readonly string[], liberados: readonly string[]): string[] =>
  todos.filter(tp => tp !== HEROI_SECRETO && !liberados.includes(tp));
