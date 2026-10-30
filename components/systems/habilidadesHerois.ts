// ═════════════════════════════════════════════════════════════════
// systems/habilidadesHerois.ts — logica pura das habilidades da arvore que antes so
// marcavam um flag nunca lido (auditoria 28/09/2026). O GameCanvas chama daqui; os
// tempos sao sempre do relogio do jogo (virtualTimeRef), nunca Date.now().
// ═════════════════════════════════════════════════════════════════

// ── Krash (Mago) — Singularidade ───────────────────────────────────
export const SINGULARIDADE_DANO = 300;
export const SINGULARIDADE_MIN_INIMIGOS = 5;
/** Quanto do caminho ate o centro cada inimigo anda (1 = chega no centro). */
export const SINGULARIDADE_FRACAO = 0.7;
/** Teto do deslocamento de um inimigo, em px. */
export const SINGULARIDADE_MAX_PUXAO = 220;

export interface AlvoPuxao { x: number; chefe: boolean; parado?: boolean }

/** Centro horizontal (media) dos inimigos. Puxa so em x: as fileiras (lane) nao mudam. */
export const centroSingularidade = (alvos: AlvoPuxao[]): number =>
  alvos.length ? alvos.reduce((s, a) => s + a.x, 0) / alvos.length : 0;

/** Novo x de cada alvo. Chefes e inimigos parados (tentaculos) nao se movem. */
export const puxarParaCentro = (alvos: AlvoPuxao[], centro = centroSingularidade(alvos)): number[] =>
  alvos.map(a => {
    if (a.chefe || a.parado) return a.x;
    const d = centro - a.x;
    const passo = Math.sign(d) * Math.min(Math.abs(d) * SINGULARIDADE_FRACAO, SINGULARIDADE_MAX_PUXAO);
    return a.x + passo;
  });

// ── Krash (Mago) — Turbo de Mana ───────────────────────────────────
export const TURBO_MIN_INIMIGOS = 5;
export const TURBO_DURACAO_MS = 8000;
export const TURBO_CADENCIA = 3;   // 3x a cadencia (intervalo / 3)

export const turboDeveAtivar = (usadoNestaOnda: boolean, inimigosVivos: number): boolean =>
  !usadoNestaOnda && inimigosVivos >= TURBO_MIN_INIMIGOS;

// ── Ikan (Necromante) — Ascensao do Lich ───────────────────────────
export const LICH_ONDA_MIN = 15;
export const LICH_LIMITE = 8;

/** Na virada de onda: a primeira onda 15+ da run vira a onda do Lich. */
export const lichAtivaNaOnda = (onda: number, jaUsadaNaRun: boolean): boolean => !jaUsadaNaRun && onda >= LICH_ONDA_MIN;

/** Num abate: ergue se for a onda do Lich, ainda cabe no limite dele e no teto geral de minions. */
export const lichErgue = (ondaDoLich: number | undefined, ondaAtual: number, erguidos: number, minionsVivos: number, tetoMinions = 10): boolean =>
  ondaDoLich === ondaAtual && erguidos < LICH_LIMITE && minionsVivos < tetoMinions;

// ── Hyo (Sacerdote) — Ressurreicao ─────────────────────────────────
export const RESSURREICAO_HP = 0.5;

/** O Sacerdote (heroi, indice 0) salva um aliado que cairia, uma vez por run; nao a si mesmo. */
export const ressurreicaoSalva = (indiceQueCai: number, indiceSacerdote: number, usada: boolean): boolean =>
  !usada && indiceSacerdote >= 0 && indiceQueCai !== indiceSacerdote;

// ── Sonetto (Bardo) — Obra-Prima ───────────────────────────────────
export const OBRA_PRIMA_DURACAO_MS = 15000;
export const OBRA_PRIMA_DANO = 1.5;
export const OBRA_PRIMA_CADENCIA = 1.5;   // +50% velocidade de ataque (intervalo / 1,5)

export const obraPrimaNaOnda = (onda: number): boolean => onda > 0 && onda % 10 === 0;
export const obraPrimaAtiva = (ate: number | undefined, agora: number): boolean => (ate ?? 0) > agora;
