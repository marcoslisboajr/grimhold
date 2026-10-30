// ══════════════════════════════════════════════════════════════════════
// systems/audio.ts
// Sistema de som do Grimhold — gerado por Web Audio API, sem arquivos.
// Uso: import { GrimholdAudio } from './systems/audio';
//      GrimholdAudio.play('levelUp');
// ══════════════════════════════════════════════════════════════════════

// ---------------------------------------------------------------------------
// Singleton AudioContext
// ---------------------------------------------------------------------------

let _ctx: AudioContext | null = null;
let _masterGainNode: GainNode | null = null;

function getCtx(): AudioContext | null {
  if (typeof window === 'undefined') return null;
  if (!_ctx) {
    try {
      _ctx = new (window.AudioContext || (window as any).webkitAudioContext)();
      // Single master GainNode — setVolume updates this in real-time
      _masterGainNode = _ctx.createGain();
      _masterGainNode.gain.value = _masterVolume;
      _masterGainNode.connect(_ctx.destination);
    } catch {
      return null;
    }
  }
  if (_ctx.state === 'suspended') _ctx.resume();
  return _ctx;
}

// ---------------------------------------------------------------------------
// Master volume (0–1)
// ---------------------------------------------------------------------------

let _masterVolume = 0.5;

export const GrimholdAudio = {
  setVolume(v: number) {
    _masterVolume = Math.max(0, Math.min(1, v));
    // Update GainNode immediately — silences all currently playing sounds too
    if (_masterGainNode) {
      _masterGainNode.gain.setTargetAtTime(_masterVolume, _masterGainNode.context.currentTime, 0.005);
    }
  },
  getVolume() { return _masterVolume; },

  play(sound: SoundName, opts: { volume?: number } = {}) {
    const ctx = getCtx();
    if (!ctx) return;
    if (_masterVolume <= 0) return; // fast exit when muted
    const vol = _masterVolume * (opts.volume ?? 1);
    if (vol <= 0) return;
    SOUNDS[sound]?.(ctx, vol);
  },
};

// ---------------------------------------------------------------------------
// Sound name registry
// ---------------------------------------------------------------------------

type SoundName =
  | 'levelUp'
  | 'waveComplete'
  | 'bossSpawn'
  | 'bossDeath'
  | 'barrierHit'
  | 'barrierCritical'
  | 'goldEarned'
  | 'shopBuy'
  | 'allyPlace'
  | 'allyAttack'
  | 'spellCast'
  | 'gameOver'
  | 'victory'
  | 'cardSelect'
  | 'treasure';

// ---------------------------------------------------------------------------
// Helper primitives
// ---------------------------------------------------------------------------

function osc(ctx: AudioContext, type: OscillatorType, freq: number, duration: number,
  gainStart: number, gainEnd: number, dest: AudioNode, startOffset = 0) {
  const o = ctx.createOscillator();
  const g = ctx.createGain();
  o.type = type;
  o.frequency.setValueAtTime(freq, ctx.currentTime + startOffset);
  g.gain.setValueAtTime(gainStart, ctx.currentTime + startOffset);
  g.gain.exponentialRampToValueAtTime(Math.max(0.0001, gainEnd), ctx.currentTime + startOffset + duration);
  o.connect(g);
  g.connect(dest);
  o.start(ctx.currentTime + startOffset);
  o.stop(ctx.currentTime + startOffset + duration);
}

function noise(ctx: AudioContext, duration: number, gain: number, dest: AudioNode, startOffset = 0) {
  const bufSize = ctx.sampleRate * duration;
  const buf = ctx.createBuffer(1, bufSize, ctx.sampleRate);
  const data = buf.getChannelData(0);
  for (let i = 0; i < bufSize; i++) data[i] = Math.random() * 2 - 1;
  const src = ctx.createBufferSource();
  src.buffer = buf;
  const g = ctx.createGain();
  g.gain.setValueAtTime(gain, ctx.currentTime + startOffset);
  g.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + startOffset + duration);
  src.connect(g);
  g.connect(dest);
  src.start(ctx.currentTime + startOffset);
}

function masterGain(ctx: AudioContext, vol: number): GainNode {
  const g = ctx.createGain();
  g.gain.value = vol;
  // Connect to master gain node so setVolume() affects all sounds in real-time
  g.connect(_masterGainNode ?? ctx.destination);
  return g;
}

// ---------------------------------------------------------------------------
// Sound definitions
// ---------------------------------------------------------------------------

const SOUNDS: Record<SoundName, (ctx: AudioContext, vol: number) => void> = {

  // ── Treasure — recompensa de gacha (jingle rico: arpejo + sino + brilho) ─
  treasure(ctx, vol) {
    const dest = masterGain(ctx, vol);
    const notes = [523, 659, 784, 1047, 1319]; // C5 E5 G5 C6 E6 — arpejo ascendente
    notes.forEach((freq, i) => {
      osc(ctx, 'triangle', freq, 0.4, 0.5, 0.001, dest, i * 0.07);
      osc(ctx, 'sine', freq * 2, 0.25, 0.18, 0.001, dest, i * 0.07);
    });
    // sino sustentado + cauda de brilho
    osc(ctx, 'sine', 1047, 0.7, 0.35, 0.001, dest, 0.35);
    osc(ctx, 'sine', 2093, 0.55, 0.22, 0.001, dest, 0.4);
    osc(ctx, 'sine', 3136, 0.45, 0.14, 0.001, dest, 0.5);
  },

  // ── Level Up — ascending arpeggio, triumphant ─────────────────────────
  levelUp(ctx, vol) {
    const dest = masterGain(ctx, vol);
    const notes = [523, 659, 784, 1047];
    notes.forEach((freq, i) => {
      osc(ctx, 'sine', freq, 0.25, 0.4, 0.001, dest, i * 0.1);
      osc(ctx, 'triangle', freq * 2, 0.15, 0.15, 0.001, dest, i * 0.1);
    });
    // Sparkle
    osc(ctx, 'sine', 2093, 0.3, 0.2, 0.001, dest, 0.42);
  },

  // ── Wave Complete — short satisfying chime ────────────────────────────
  waveComplete(ctx, vol) {
    const dest = masterGain(ctx, vol * 0.7);
    osc(ctx, 'sine',     784, 0.15, 0.3, 0.001, dest, 0);
    osc(ctx, 'sine',     988, 0.15, 0.25, 0.001, dest, 0.12);
    osc(ctx, 'triangle', 1319, 0.2, 0.2, 0.001, dest, 0.24);
  },

  // ── Boss Spawn — ominous low rumble + horn ────────────────────────────
  bossSpawn(ctx, vol) {
    const dest = masterGain(ctx, vol);
    // Low rumble
    osc(ctx, 'sawtooth', 55,  0.8, 0.5, 0.001, dest, 0);
    osc(ctx, 'sawtooth', 58,  0.8, 0.4, 0.001, dest, 0);
    // Horn
    osc(ctx, 'square',   110, 0.5, 0.3, 0.001, dest, 0.3);
    osc(ctx, 'square',   146, 0.5, 0.25, 0.001, dest, 0.5);
    osc(ctx, 'square',   110, 0.5, 0.2, 0.001, dest, 0.8);
    // Noise burst
    noise(ctx, 0.3, 0.15, dest, 0);
  },

  // ── Boss Death — dramatic descending + explosion ──────────────────────
  bossDeath(ctx, vol) {
    const dest = masterGain(ctx, vol);
    noise(ctx, 0.5, 0.4, dest, 0);
    osc(ctx, 'sawtooth', 220, 0.4, 0.3, 0.001, dest, 0);
    osc(ctx, 'sawtooth', 110, 0.4, 0.25, 0.001, dest, 0.1);
    osc(ctx, 'sawtooth', 55,  0.4, 0.2, 0.001, dest, 0.3);
    // Victory chord
    osc(ctx, 'sine', 523, 0.3, 0.3, 0.001, dest, 0.5);
    osc(ctx, 'sine', 659, 0.3, 0.25, 0.001, dest, 0.55);
    osc(ctx, 'sine', 784, 0.3, 0.2, 0.001, dest, 0.6);
  },

  // ── Barrier Hit — dull thud, urgent ──────────────────────────────────
  barrierHit(ctx, vol) {
    const dest = masterGain(ctx, vol * 0.6);
    noise(ctx, 0.12, 0.4, dest, 0);
    osc(ctx, 'sine', 80, 0.12, 0.5, 0.001, dest, 0);
  },

  // ── Barrier Critical (low HP) — alarming ─────────────────────────────
  barrierCritical(ctx, vol) {
    const dest = masterGain(ctx, vol);
    osc(ctx, 'square', 220, 0.1, 0.4, 0.001, dest, 0);
    osc(ctx, 'square', 196, 0.1, 0.35, 0.001, dest, 0.12);
    osc(ctx, 'square', 220, 0.1, 0.3, 0.001, dest, 0.24);
    noise(ctx, 0.08, 0.2, dest, 0);
  },

  // ── Gold Earned — bright coin ─────────────────────────────────────────
  goldEarned(ctx, vol) {
    const dest = masterGain(ctx, vol * 0.5);
    osc(ctx, 'sine', 1319, 0.08, 0.3, 0.001, dest, 0);
    osc(ctx, 'sine', 1568, 0.08, 0.2, 0.001, dest, 0.05);
  },

  // ── Shop Buy — satisfying click + shimmer ─────────────────────────────
  shopBuy(ctx, vol) {
    const dest = masterGain(ctx, vol * 0.6);
    osc(ctx, 'sine',     523, 0.12, 0.25, 0.001, dest, 0);
    osc(ctx, 'triangle', 784, 0.12, 0.2, 0.001, dest, 0.08);
    osc(ctx, 'sine',     1047, 0.1, 0.15, 0.001, dest, 0.16);
  },

  // ── Ally Place — whoosh + thud ────────────────────────────────────────
  allyPlace(ctx, vol) {
    const dest = masterGain(ctx, vol * 0.55);
    noise(ctx, 0.08, 0.2, dest, 0);
    osc(ctx, 'sine', 150, 0.12, 0.3, 0.001, dest, 0.04);
    osc(ctx, 'sine', 200, 0.1, 0.15, 0.001, dest, 0.0);
  },

  // ── Ally Attack — soft click (used with cooldown to avoid spam) ───────
  allyAttack(ctx, vol) {
    const dest = masterGain(ctx, vol * 0.25);
    noise(ctx, 0.04, 0.15, dest, 0);
    osc(ctx, 'sine', 400 + Math.random() * 200, 0.04, 0.08, 0.001, dest, 0);
  },

  // ── Spell Cast — magical swoosh ───────────────────────────────────────
  spellCast(ctx, vol) {
    const dest = masterGain(ctx, vol * 0.5);
    const freq = 300 + Math.random() * 400;
    osc(ctx, 'sine', freq, 0.15, 0.2, 0.001, dest, 0);
    osc(ctx, 'sine', freq * 1.5, 0.12, 0.12, 0.001, dest, 0.05);
    noise(ctx, 0.1, 0.08, dest, 0);
  },

  // ── Game Over — descending tragic ────────────────────────────────────
  gameOver(ctx, vol) {
    const dest = masterGain(ctx, vol);
    const notes = [392, 330, 262, 196];
    notes.forEach((freq, i) => {
      osc(ctx, 'sine',     freq, 0.4, 0.3, 0.001, dest, i * 0.25);
      osc(ctx, 'triangle', freq, 0.3, 0.15, 0.001, dest, i * 0.25);
    });
    noise(ctx, 0.3, 0.15, dest, 1.0);
  },

  // ── Victory — full fanfare ────────────────────────────────────────────
  victory(ctx, vol) {
    const dest = masterGain(ctx, vol);
    const melody = [523, 523, 659, 523, 784, 740, 523, 659, 523, 988, 880];
    const times  = [0, 0.2, 0.4, 0.6, 0.8, 1.0, 1.2, 1.35, 1.5, 1.7, 1.9];
    melody.forEach((freq, i) => {
      osc(ctx, 'triangle', freq, 0.18, 0.4, 0.001, dest, times[i]);
      osc(ctx, 'sine',     freq, 0.18, 0.2, 0.001, dest, times[i]);
    });
  },

  // ── Card Select — satisfying whoosh ───────────────────────────────────
  cardSelect(ctx, vol) {
    const dest = masterGain(ctx, vol * 0.65);
    noise(ctx, 0.06, 0.15, dest, 0);
    osc(ctx, 'sine', 600, 0.1, 0.15, 0.001, dest, 0);
    osc(ctx, 'sine', 900, 0.1, 0.1, 0.001, dest, 0.05);
    osc(ctx, 'sine', 1200, 0.08, 0.05, 0.001, dest, 0.1);
  },
};
