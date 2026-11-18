/*
 * Sound effects (Web Audio API).
 *
 *  paper.mp3   "Foley Paper Handling & Page Turning SFX" by LensPulse (Pixabay Content License)
 *  scratch.mp3 "Pen writing on paper" by freesound_community (Pixabay Content License)
 *
 * Short cues are sliced out of paper.mp3. Scratching plays a looping slice of
 * scratch.mp3 whose loudness and pitch follow how fast the foil is rubbed.
 *
 * Browsers only allow audio after a user gesture: call `unlockSound()` from
 * the first tap/click. The mute choice is remembered per device.
 */

type FileKey = "paper" | "scratch";
export type Cue = "rustle" | "unfold" | "slide" | "turn" | "turnBack";

const BASE = process.env.NEXT_PUBLIC_BASE_PATH ?? "";
const FILES: Record<FileKey, string> = {
  paper: `${BASE}/sfx/paper.mp3`,
  scratch: `${BASE}/sfx/scratch.mp3`,
};

/*
 * [start, duration] in seconds inside paper.mp3, measured from its loudness
 * envelope. The 7.15 s recording holds three separate gestures:
 *   A 0.12–0.57 s  short rustle (peak 0.38 s)
 *   B 2.83–3.50 s  full page turn, builds to a peak at 3.12 s
 *   C 5.08–5.68 s  second page turn, peak at 5.47 s
 */
const CUES: Record<Cue, [number, number]> = {
  rustle: [0.09, 0.55], // A — envelope shake
  unfold: [2.98, 0.6], // B from just before its peak — seal pops, flap opens
  slide: [5.12, 0.63], // C — cards slide out (played a little lower)
  turn: [2.88, 0.7], // B whole — sheet slides up / next page
  turnBack: [5.12, 0.63], // C — back / close
};

/* Steady stretch of scratch.mp3 (no loud pen taps) used as the scratch loop. */
const SCRATCH_LOOP: [number, number] = [12.5, 17.4];
/** Scratch loudness: gain at a slow stroke → at a fast stroke. */
const SCRATCH_GAIN_MIN = 2.2;
const SCRATCH_GAIN_MAX = 4.5;

const MUTE_KEY = "nortucommu.muted.v1";

let ctx: AudioContext | null = null;
const buffers: Partial<Record<FileKey, AudioBuffer>> = {};
const loading: Partial<Record<FileKey, Promise<void>>> = {};
let muted = readMuted();

function readMuted(): boolean {
  try {
    return typeof localStorage !== "undefined" && localStorage.getItem(MUTE_KEY) === "1";
  } catch {
    return false;
  }
}

function getContext(): AudioContext | null {
  if (ctx) return ctx;
  if (typeof window === "undefined") return null;
  const AC =
    window.AudioContext ?? (window as unknown as { webkitAudioContext?: typeof AudioContext }).webkitAudioContext;
  if (!AC) return null;
  // iOS: let Web Audio play even when the ring/silent switch is on (Safari 16.4+).
  const nav = navigator as Navigator & { audioSession?: { type: string } };
  if (nav.audioSession) nav.audioSession.type = "playback";
  ctx = new AC();
  return ctx;
}

function ready(): AudioContext | null {
  return !muted && ctx && ctx.state === "running" ? ctx : null;
}

/** Downloads and decodes a sound file (safe to call before any gesture). */
export function preloadSound(file: FileKey = "paper"): Promise<void> {
  const existing = loading[file];
  if (existing) return existing;
  const ac = getContext();
  if (!ac) return Promise.resolve();
  const promise = fetch(FILES[file])
    .then((r) => (r.ok ? r.arrayBuffer() : Promise.reject(new Error(`sfx ${r.status}`))))
    .then((data) => ac.decodeAudioData(data))
    .then((decoded) => {
      buffers[file] = decoded;
    })
    .catch(() => {
      /* sound is optional — the invite works silently */
    });
  loading[file] = promise;
  return promise;
}

/** Must run inside a tap/click handler at least once. */
export function unlockSound() {
  const ac = getContext();
  if (ac && ac.state !== "running") ac.resume().catch(() => {});
  preloadSound("paper");
}

export function playCue(cue: Cue, { volume = 0.8, rate = 1 }: { volume?: number; rate?: number } = {}) {
  const ac = ready();
  const buffer = buffers.paper;
  if (!ac || !buffer) return;
  const [start, duration] = CUES[cue];
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  src.buffer = buffer;
  src.playbackRate.value = rate;
  // Short fades so slices never click.
  const now = ac.currentTime;
  const len = duration / rate;
  gain.gain.setValueAtTime(0, now);
  gain.gain.linearRampToValueAtTime(volume, now + 0.015);
  gain.gain.setValueAtTime(volume, now + Math.max(0.02, len - 0.06));
  gain.gain.linearRampToValueAtTime(0, now + len);
  src.connect(gain).connect(ac.destination);
  src.start(now, start, duration);
}

// ── Scratch loop ───────────────────────────────────────────────────────────
let scratch: { src: AudioBufferSourceNode; gain: GainNode } | null = null;

/** Starts the (silent) scratch loop; `scratchMove` makes it audible. */
export function scratchStart() {
  const ac = ready();
  const buffer = buffers.scratch;
  if (!ac || !buffer || scratch) return;
  const [loopStart, loopEnd] = SCRATCH_LOOP;
  const src = ac.createBufferSource();
  const gain = ac.createGain();
  src.buffer = buffer;
  src.loop = true;
  src.loopStart = loopStart;
  src.loopEnd = loopEnd;
  gain.gain.value = 0;
  src.connect(gain).connect(ac.destination);
  // Random entry point so repeated scratches don't sound identical.
  src.start(0, loopStart + Math.random() * (loopEnd - loopStart - 0.5));
  scratch = { src, gain };
}

/** Call on every pointer move; intensity 0–1 (how fast the finger moves). */
export function scratchMove(intensity: number) {
  if (!ctx || !scratch) return;
  const now = ctx.currentTime;
  const i = Math.max(0, Math.min(1, intensity));
  const g = scratch.gain.gain;
  g.cancelScheduledValues(now);
  // The loop is ~11 dB quieter than paper.mp3 (RMS 0.019 vs 0.071, peak 0.097),
  // so boost it: ~2.2× slow → 4.5× fast keeps peaks under ~0.45 (no clipping).
  g.setTargetAtTime(SCRATCH_GAIN_MIN + (SCRATCH_GAIN_MAX - SCRATCH_GAIN_MIN) * i, now, 0.02); // follow the stroke
  g.setTargetAtTime(0, now + 0.09, 0.05); // fade if the finger stops moving
  scratch.src.playbackRate.setTargetAtTime(0.85 + 0.35 * i, now, 0.05);
}

/** Fades the loop out and releases it. */
export function scratchStop() {
  if (!ctx || !scratch) return;
  const { src, gain } = scratch;
  const now = ctx.currentTime;
  gain.gain.cancelScheduledValues(now);
  gain.gain.setTargetAtTime(0, now, 0.04);
  src.stop(now + 0.25);
  scratch = null;
}

export function isMuted() {
  return muted;
}

export function setMuted(value: boolean) {
  muted = value;
  if (value) scratchStop();
  try {
    localStorage.setItem(MUTE_KEY, value ? "1" : "0");
  } catch {
    /* ignore */
  }
}
