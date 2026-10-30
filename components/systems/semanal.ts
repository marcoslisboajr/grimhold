// ══════════════════════════════════════════════════════════════════════
// components/systems/semanal.ts — Desafio Semanal com seed
//
// A seed e a semana ISO ("2026-W38"): todo mundo no mundo joga a mesma run
// na mesma semana, sem servidor. Um RNG proprio (mulberry32) alimenta so o
// que DEFINE a run — inimigos/elites (createEnemy), cartas oferecidas
// (level-up), gacha e encontros. Efeitos visuais continuam no Math.random.
// Regras fixas: heroi sorteado entre os desbloqueados, Normal, Ato I, sem
// reliquia. Placar LOCAL por semana (melhor pontuacao); tentativas ilimitadas.
// Placar online (Steamworks) fica pro roadmap.
// ══════════════════════════════════════════════════════════════════════
import { storage } from './storage';

/** mulberry32 — 32 bits, rapido, bom o bastante pra jogo */
export const mulberry32 = (seed: number) => () => {
  seed = (seed + 0x6D2B79F5) | 0;
  let t = Math.imul(seed ^ (seed >>> 15), 1 | seed);
  t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
  return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
};

/** hash de string → uint32 (FNV-1a) */
export const hashStr = (s: string) => {
  let h = 0x811c9dc5;
  for (let i = 0; i < s.length; i++) { h ^= s.charCodeAt(i); h = Math.imul(h, 0x01000193); }
  return h >>> 0;
};

/** Semana ISO 8601 da data (UTC), ex.: "2026-W38". Vira na segunda 00:00 UTC. */
export const semanaISO = (d = new Date()) => {
  const x = new Date(Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()));
  const dia = x.getUTCDay() || 7;            // dom=7
  x.setUTCDate(x.getUTCDate() + 4 - dia);    // quinta da mesma semana
  const ano = x.getUTCFullYear();
  const jan1 = new Date(Date.UTC(ano, 0, 1));
  const n = Math.ceil((((x.getTime() - jan1.getTime()) / 86400000) + 1) / 7);
  return `${ano}-W${String(n).padStart(2, '0')}`;
};

/** Heroi da semana: indice deterministico na lista ORDENADA de desbloqueados (lista igual → heroi igual) */
export const heroiDaSemana = (semana: string, desbloqueados: string[]) => {
  const lista = [...desbloqueados].sort();
  if (!lista.length) return 'mage';
  return lista[hashStr(semana + ':heroi') % lista.length];
};

export interface RegistroSemanal { score: number; wave: number; duration: number; heroType: string; result: 'victory' | 'defeat'; data: string }
export interface PlacarSemanal { [semana: string]: { tentativas: number; melhor: RegistroSemanal | null } }
const CHAVE = 'grimhold_semanal';

export const lerPlacarSemanal = (): PlacarSemanal => { try { return JSON.parse(storage.get(CHAVE) ?? '{}'); } catch { return {}; } };

/** Registra uma tentativa; devolve true se foi o novo melhor da semana */
export const registrarSemanal = (semana: string, r: RegistroSemanal): boolean => {
  const p = lerPlacarSemanal();
  const s = p[semana] ?? { tentativas: 0, melhor: null };
  s.tentativas += 1;
  const novo = !s.melhor || r.score > s.melhor.score;
  if (novo) s.melhor = r;
  p[semana] = s;
  try { storage.set(CHAVE, JSON.stringify(p)); } catch { /* sem storage */ }
  return novo;
};
