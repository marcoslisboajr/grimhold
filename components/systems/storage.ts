// ══════════════════════════════════════════════════════════════════════
// components/systems/storage.ts
// Unified persistence layer.
//
// Web / itch.io  → plain localStorage (unchanged behaviour).
// Electron/Steam → localStorage for fast synchronous reads, MIRRORED to a
//                  physical save.json (via window.saveAPI) so Steam Cloud
//                  can sync it across machines.
//
// The public API is synchronous and a drop-in match for localStorage's
// getItem / setItem / removeItem, so call sites don't have to change shape.
// ══════════════════════════════════════════════════════════════════════

import { SAVE_PREFIX } from './build';

interface SaveAPI {
  isElectron: boolean;
  loadAllSync: () => Record<string, string>;
  saveKeyAsync: (key: string, value: string) => void;
  deleteKeyAsync: (key: string) => void;
}

declare global {
  interface Window {
    saveAPI?: SaveAPI;
  }
}

const api: SaveAPI | undefined =
  typeof window !== 'undefined' ? window.saveAPI : undefined;

const isElectron = !!api?.isElectron;

// ── One-time reconciliation on first load in Electron ──────────────────
// If Steam Cloud delivered a save.json (e.g. from another PC), pull any
// keys it has into localStorage so synchronous reads see them. localStorage
// wins only for keys the file doesn't have, so cloud data is never lost.
let reconciled = false;
function reconcileOnce(): void {
  if (reconciled || !isElectron || !api) return;
  reconciled = true;
  try {
    const fileData = api.loadAllSync() || {};
    for (const [k, v] of Object.entries(fileData)) {
      // Only fill in keys localStorage is missing; don't clobber newer local writes.
      if (localStorage.getItem(k) === null && typeof v === 'string') {
        localStorage.setItem(k, v);
      }
    }
    // Push any local-only keys up into the file so the cloud has them too.
    for (let i = 0; i < localStorage.length; i++) {
      const k = localStorage.key(i);
      if (k === null) continue;
      if (!(k in fileData)) {
        const val = localStorage.getItem(k);
        if (val !== null) api.saveKeyAsync(k, val);
      }
    }
  } catch (e) {
    console.error('[storage] reconcile failed:', e);
  }
}

export const storage = {
  get(key: string): string | null {
    reconcileOnce();
    try {
      return localStorage.getItem(SAVE_PREFIX + key);
    } catch {
      return null;
    }
  },

  set(key: string, value: string): void {
    reconcileOnce();
    try {
      localStorage.setItem(SAVE_PREFIX + key, value);
    } catch (e) {
      console.error('[storage] localStorage.set failed:', e);
    }
    // Mirror to the physical save for Steam Cloud.
    if (isElectron && api) {
      try {
        api.saveKeyAsync(SAVE_PREFIX + key, value);
      } catch (e) {
        console.error('[storage] cloud mirror failed:', e);
      }
    }
  },

  remove(key: string): void {
    reconcileOnce();
    try {
      localStorage.removeItem(SAVE_PREFIX + key);
    } catch { /* ignore */ }
    if (isElectron && api) {
      try {
        api.deleteKeyAsync(SAVE_PREFIX + key);
      } catch (e) {
        console.error('[storage] cloud delete failed:', e);
      }
    }
  },
};
