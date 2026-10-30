// Numeros puros de sinergia/combo (docs/propostas-sinergias.md §3.3–3.5). O useMemo de sinergias do
// GameCanvas le daqui; os textos synergy.* / combo.* das 3 linguas repetem estes numeros.

/** Nivel 0..4 pela contagem de copias (1/2/3/4). */
export const nivelPorCopias = (n: number): number => Math.max(0, Math.min(4, n));

// ── Arqueira (Patrulha): multiplicador da recarga ───────────────────────
export const archerCooldownMult = (n: number): number =>
  n >= 4 ? 0.45 : n >= 3 ? 0.62 : n >= 2 ? 0.78 : n >= 1 ? 0.90 : 1;

// ── Mago (Circulo Arcano) ───────────────────────────────────────────────
export const mageDamageMult = (n: number): number =>
  n >= 4 ? 1.85 : n >= 3 ? 1.45 : n >= 2 ? 1.25 : n >= 1 ? 1.12 : 1;
export const MAGE_SOBRECARGA_CHANCE = 0.25;

// ── Paladino (Vanguarda Sagrada) ────────────────────────────────────────
/** Bonus extra contra mortos-vivos e demonios (somado a 1). */
export const paladinUndeadBonus = (n: number): number =>
  n >= 4 ? 2.00 : n >= 3 ? 1.20 : n >= 2 ? 0.75 : n >= 1 ? 0.40 : 0;
/** Bonus universal de dano do Paladino (multiplicador). */
export const paladinBaseDmgMult = (n: number): number =>
  n >= 4 ? 1.35 : n >= 3 ? 1.25 : n >= 2 ? 1.16 : n >= 1 ? 1.08 : 1;
export const PALADINO_CASTIGO_MS = 1000;

// ── Senhor do Pavor (Convenio do Vazio): 2/3/4 copias ───────────────────
export const dreadBonusDmgMult = (n: number): number =>
  n >= 4 ? 2.10 : n >= 3 ? 1.60 : n >= 2 ? 1.30 : 1;

// ── Fome Sombria (dreadlord + warlock), limiares 2/4 ────────────────────
export const darkHungerDmg = (tier: number): number => (tier >= 2 ? 1.60 : tier >= 1 ? 1.35 : 1);

// ── Combos de tipo unico (Ninhada Umbral / Pira do Coven / Motor do Tumulto), niveis 1/2/3 ──
export const comboSoloDmg = (tier: number): number => (tier >= 3 ? 1.80 : tier >= 2 ? 1.45 : tier >= 1 ? 1.20 : 1);

// ── Cacada Fantasma T3: explosao do marcado ─────────────────────────────
export const CACADA_EXPLOSAO_PCT = 1.5;      // 150% do HP maximo do marcado
export const CACADA_EXPLOSAO_TETO_GOLPE = 3; // no maximo 3x o dano do golpe que matou

// ── Cacada Selvagem (bard + archer + druid, 3/5) — fundida com a Balada de Sangue ──
export const wildHuntTier = (bard: number, archer: number, druid: number): number => {
  if (bard < 1 || archer < 1 || druid < 1) return 0;
  const t = bard + archer + druid;
  return t >= 5 ? 2 : t >= 3 ? 1 : 0;
};
/** Arqueira e Druida: dano. */
export const wildHuntDmg = (tier: number): number => (tier >= 2 ? 1.35 : tier >= 1 ? 1.18 : 1);
/** Arqueira e Druida: multiplicador de recarga (+15% Vel. Ataque no T2). */
export const wildHuntCooldown = (tier: number): number => (tier >= 2 ? 1 / 1.15 : 1);
/** Aliados na aura do Bardo: dano extra (somado a 1). */
export const wildHuntAuraDmg = (tier: number): number => (tier >= 2 ? 0.25 : tier >= 1 ? 0.12 : 0);

// ── Baluarte de Ferro e Gelo (paladin + frost_warden, 2/4) ──────────────
export const bulwarkTier = (paladin: number, frost: number): number => {
  if (paladin < 1 || frost < 1) return 0;
  const t = paladin + frost;
  return t >= 4 ? 2 : t >= 2 ? 1 : 0;
};
export const bulwarkDmgRed = (tier: number): number => (tier >= 2 ? 0.30 : tier >= 1 ? 0.15 : 0);
/** Placas de Gelo: multiplicador de passo extra (1 - 0,15 no T1+). */
export const bulwarkPlacaMult = (tier: number): number => (tier >= 1 ? 0.85 : 1);
/** Muralha Glacial: ms extras de congelamento (T2). A muralha e instantanea no codigo (congela 1,5s ao
 *  surgir), entao o "+3s de duracao" da proposta virou +1s de congelamento. */
export const bulwarkMuralhaExtraMs = (tier: number): number => (tier >= 2 ? 1000 : 0);

// ── Pacto Praguejado: amplificacao da Praga do Bruxo (nunca abaixo da base 1,25) ──
export const HEX_AMP_BASE = 1.25;
export const hexboundHexAmp = (tier: number): number =>
  Math.max(HEX_AMP_BASE, tier >= 3 ? 1.45 : tier >= 2 ? 1.30 : tier >= 1 ? 1.20 : 1);

// ── Bobo (Corte do Bobo), 1..4 copias ───────────────────────────────────
export const jesterBallCooldown = (n: number): number => (n >= 1 ? 0.80 : 1);   // ciclo de bolas 20% mais rapido
export const jesterDmgMult = (n: number): number => (n >= 4 ? 1.80 : n >= 3 ? 1.60 : n >= 2 ? 1.30 : 1);
/** A cada quantos ataques as 3 bolas disparam juntas (0 = nunca). */
export const jesterTriploIntervalo = (n: number): number => (n >= 4 ? 2 : n >= 2 ? 5 : 0);

// ── Morrigan (Coven de Almas), 1..4 copias ──────────────────────────────
/** Dano extra por alma, somado ao da Morrigan (base 2%, Colheita Amarga 3%). */
export const morriganAlmaBonus = (n: number): number => (n >= 1 ? 0.01 : 0);
export const morriganConsumidorBonus = (n: number): number => (n >= 2 ? 0.25 : 0.15);
/** Modo Devorar a cada N almas (0 = desligado). */
export const morriganDevorarAlmas = (n: number): number => (n >= 3 ? 8 : 0);
export const morriganDevorarMs = (n: number): number => (n >= 4 ? 8000 : 5000);
export const morriganDevorarCura = (n: number): number => (n >= 4 ? 1 : 0);

// ── Vex (Passo Fantasma), 1..4 copias ───────────────────────────────────
/** Investida de Sai a cada N ataques (base 5). */
export const vexDashInterval = (n: number): number => (n >= 4 ? 1 : n >= 3 ? 2 : n >= 2 ? 3 : n >= 1 ? 4 : 5);
export const vexDashDmgMult = (n: number): number => (n >= 4 ? 2.20 : n >= 3 ? 1.60 : n >= 2 ? 1.25 : 1);
export const vexBlinkMs = (n: number): number => (n >= 3 ? 900 : 600);
export const vexIntocavel = (n: number): boolean => n >= 4;
