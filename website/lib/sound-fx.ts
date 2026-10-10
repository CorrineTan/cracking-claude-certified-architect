/**
 * Layered Web Audio fx. Each "sound" is a mini-arrangement of multiple
 * voices (pluck, bell, pad, reverb tail) instead of a single oscillator.
 *
 *   - bloom:  bright bell + glockenspiel + warm pad (correct / tick)
 *   - wilt:   detuned saw + low pad falling (wrong)
 *   - chime:  light triangle + bell tail (un-tick / nav)
 *
 * Mute persisted in localStorage. AudioContext unlocked lazily.
 */

const MUTE_KEY = "ccaf_audio_muted_v1";

let ctx: AudioContext | null = null;
let masterGain: GainNode | null = null;
let convolver: ConvolverNode | null = null;
let unlocked = false;

function getCtx(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (ctx) return ctx;
  const C =
    (window as unknown as { AudioContext?: typeof AudioContext })
      .AudioContext ??
    (window as unknown as { webkitAudioContext?: typeof AudioContext })
      .webkitAudioContext;
  if (!C) return null;
  ctx = new C();
  // Master bus → light reverb send + dry path
  masterGain = ctx.createGain();
  masterGain.gain.value = 0.85;
  masterGain.connect(ctx.destination);

  // Synthetic IR for a tiny "garden room" reverb (no asset file)
  convolver = ctx.createConvolver();
  convolver.buffer = makeReverbIR(ctx, 1.6, 2.5);
  const verbGain = ctx.createGain();
  verbGain.gain.value = 0.25;
  convolver.connect(verbGain).connect(masterGain);
  return ctx;
}

function makeReverbIR(c: AudioContext, seconds = 1.6, decay = 2.5) {
  const length = Math.floor(c.sampleRate * seconds);
  const buf = c.createBuffer(2, length, c.sampleRate);
  for (let ch = 0; ch < 2; ch++) {
    const data = buf.getChannelData(ch);
    for (let i = 0; i < length; i++) {
      data[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / length, decay);
    }
  }
  return buf;
}

export function isMuted(): boolean {
  if (typeof window === "undefined") return false;
  try {
    return window.localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

export function setMuted(v: boolean) {
  if (typeof window === "undefined") return;
  try {
    window.localStorage.setItem(MUTE_KEY, v ? "1" : "0");
  } catch {
    // ignore
  }
}

export function unlock() {
  const c = getCtx();
  if (!c || unlocked) return;
  if (c.state === "suspended") void c.resume();
  unlocked = true;
}

/* ─── voice helpers ─────────────────────────────────────────── */

interface VoiceOptions {
  freq: number;
  start: number;       // seconds from now
  duration: number;    // gain envelope length
  gain?: number;
  type?: OscillatorType;
  /** Detune in cents — pairs of detuned oscillators sound thicker. */
  detune?: number;
  /** Send to reverb bus (0-1). Default 0.4. */
  reverbSend?: number;
  /** Lowpass cutoff in Hz (default open). */
  filter?: number;
  /** Attack envelope length (default 0.012). */
  attack?: number;
}

function voice(opts: VoiceOptions) {
  const c = getCtx();
  if (!c || !masterGain || !convolver) return;
  const now = c.currentTime;
  const startAt = now + opts.start;
  const peak = opts.gain ?? 0.16;
  const attack = opts.attack ?? 0.012;

  const osc = c.createOscillator();
  osc.type = opts.type ?? "sine";
  osc.frequency.setValueAtTime(opts.freq, startAt);
  if (opts.detune) osc.detune.setValueAtTime(opts.detune, startAt);

  const env = c.createGain();
  env.gain.setValueAtTime(0, startAt);
  env.gain.linearRampToValueAtTime(peak, startAt + attack);
  env.gain.exponentialRampToValueAtTime(0.0001, startAt + opts.duration);

  let out: AudioNode = env;
  if (opts.filter !== undefined) {
    const lp = c.createBiquadFilter();
    lp.type = "lowpass";
    lp.frequency.setValueAtTime(opts.filter, startAt);
    env.connect(lp);
    out = lp;
  }

  const dry = c.createGain();
  dry.gain.value = 1 - (opts.reverbSend ?? 0.4);
  const wet = c.createGain();
  wet.gain.value = opts.reverbSend ?? 0.4;

  osc.connect(env);
  out.connect(dry).connect(masterGain);
  out.connect(wet).connect(convolver);

  osc.start(startAt);
  osc.stop(startAt + opts.duration + 0.05);
}

/** Plucked-string-ish using lowpass + short envelope. */
function pluck(freq: number, start: number, duration = 0.45, gain = 0.18) {
  voice({
    freq,
    start,
    duration,
    type: "sawtooth",
    gain,
    filter: 2200,
    attack: 0.005,
    reverbSend: 0.35,
  });
  // sub octave for warmth
  voice({
    freq: freq / 2,
    start,
    duration: duration * 0.7,
    type: "triangle",
    gain: gain * 0.4,
    filter: 1400,
    reverbSend: 0.3,
  });
}

/** Bell tone — sine + 5th harmonic. */
function bell(freq: number, start: number, duration = 0.9, gain = 0.12) {
  voice({ freq, start, duration, type: "sine", gain, reverbSend: 0.55 });
  voice({
    freq: freq * 2.01,
    start,
    duration: duration * 0.6,
    type: "sine",
    gain: gain * 0.5,
    reverbSend: 0.6,
  });
  voice({
    freq: freq * 3.01,
    start: start + 0.005,
    duration: duration * 0.4,
    type: "sine",
    gain: gain * 0.25,
    reverbSend: 0.65,
  });
}

/** Soft pad — slow attack, two detuned saws. */
function pad(freq: number, start: number, duration = 1.0, gain = 0.08) {
  voice({
    freq,
    start,
    duration,
    type: "sawtooth",
    gain,
    detune: -8,
    filter: 800,
    attack: 0.15,
    reverbSend: 0.5,
  });
  voice({
    freq,
    start,
    duration,
    type: "sawtooth",
    gain,
    detune: 8,
    filter: 800,
    attack: 0.15,
    reverbSend: 0.5,
  });
}

/* ─── named cues ─────────────────────────────────────────── */

/**
 * Bloom — answer correct / lesson ticked.
 * Layered C major arpeggio: pluck on root, bell octave + 5th, soft pad
 * underneath, bell sparkle on top with reverb tail.
 */
export function playBloom() {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  if (!unlocked) unlock();

  // C major arpeggio
  const C5 = 523.25;
  const E5 = 659.25;
  const G5 = 783.99;
  const C6 = 1046.5;
  const E6 = 1318.51;
  const G3 = 196.0;

  // Plucked arpeggio
  pluck(C5, 0,    0.4, 0.16);
  pluck(E5, 0.08, 0.4, 0.16);
  pluck(G5, 0.16, 0.42, 0.18);
  pluck(C6, 0.24, 0.55, 0.20);

  // Bell sparkle on top
  bell(E6, 0.32, 1.4, 0.10);
  bell(G5, 0.12, 1.0, 0.08);

  // Warm pad underneath
  pad(G3, 0,     1.6, 0.10);
  pad(C5, 0.05,  1.4, 0.06);
}

/**
 * Wilt — answer wrong.
 * Detuned descending saw + low rumble, no reverb sparkle.
 */
export function playWilt() {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  if (!unlocked) unlock();

  // Falling minor — G4 → Eb4 → Bb3 with detuning sigh
  voice({
    freq: 392,
    start: 0,
    duration: 0.35,
    type: "sawtooth",
    gain: 0.12,
    detune: -10,
    filter: 1600,
    attack: 0.02,
    reverbSend: 0.2,
  });
  voice({
    freq: 311,
    start: 0.18,
    duration: 0.4,
    type: "sawtooth",
    gain: 0.12,
    detune: -15,
    filter: 1300,
    attack: 0.02,
    reverbSend: 0.2,
  });
  voice({
    freq: 233,
    start: 0.38,
    duration: 0.5,
    type: "sawtooth",
    gain: 0.13,
    detune: -20,
    filter: 1100,
    attack: 0.02,
    reverbSend: 0.25,
  });
  // Low rumble pad
  pad(98, 0,    0.9, 0.05);
  pad(82, 0.2,  0.7, 0.05);

  // Soft "thud" — short low triangle
  voice({
    freq: 130,
    start: 0,
    duration: 0.15,
    type: "triangle",
    gain: 0.15,
    filter: 600,
    attack: 0.005,
    reverbSend: 0.3,
  });
}

/**
 * Chime — un-tick / general affordance. Light triangle + bell tail.
 */
export function playChime() {
  if (isMuted()) return;
  const c = getCtx();
  if (!c) return;
  if (!unlocked) unlock();
  bell(880, 0, 0.7, 0.08);
  bell(1320, 0.04, 0.5, 0.06);
  voice({
    freq: 660,
    start: 0,
    duration: 0.3,
    type: "triangle",
    gain: 0.06,
    filter: 3500,
    reverbSend: 0.5,
  });
}
