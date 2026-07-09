// Subtle UI sound, synthesized with Web Audio (no asset files). Off by default,
// toggled in the top nav, persisted in localStorage. The AudioContext is created
// lazily on the first real gesture (browsers block audio before that), and every
// entry point is SSR-guarded. Play only on explicit actions, never on route load.

const KEY = "hububb-sound";

let ctx: AudioContext | null = null;
function audio(): AudioContext | null {
  if (typeof window === "undefined") return null;
  if (!ctx) {
    const AC =
      window.AudioContext ??
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    ctx = new AC();
  }
  if (ctx.state === "suspended") void ctx.resume();
  return ctx;
}

// --- enabled store (useSyncExternalStore-compatible, mirrors the sidebar store) ---
const listeners = new Set<() => void>();

export function isSoundEnabled(): boolean {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(KEY) === "1";
}
export function setSoundEnabled(on: boolean): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(KEY, on ? "1" : "0");
  for (const l of listeners) l();
}
export function subscribeSound(cb: () => void): () => void {
  listeners.add(cb);
  return () => {
    listeners.delete(cb);
  };
}

// --- synthesis ---
function tone(freq: number, startMs: number, durMs: number, gain = 0.06): void {
  const ac = audio();
  if (!ac) return;
  const t0 = ac.currentTime + startMs / 1000;
  const dur = durMs / 1000;
  const osc = ac.createOscillator();
  const g = ac.createGain();
  osc.type = "triangle";
  osc.frequency.value = freq;
  g.gain.setValueAtTime(0.0001, t0);
  g.gain.exponentialRampToValueAtTime(gain, t0 + 0.01);
  g.gain.exponentialRampToValueAtTime(0.0001, t0 + dur);
  osc.connect(g).connect(ac.destination);
  osc.start(t0);
  osc.stop(t0 + dur + 0.02);
}

const sounds = {
  press() {
    tone(660, 0, 90);
  },
  advance() {
    tone(523.25, 0, 120);
    tone(783.99, 60, 140);
  },
  success() {
    tone(523.25, 0, 120);
    tone(659.25, 90, 120);
    tone(783.99, 180, 220);
  },
};

export type SoundName = keyof typeof sounds;

// Play a named sound, but only when the user has enabled sound. Safe to call
// anywhere (no-ops on the server and when muted).
export function playSound(name: SoundName): void {
  if (typeof window === "undefined" || !isSoundEnabled()) return;
  try {
    sounds[name]();
  } catch {
    /* audio unavailable, ignore */
  }
}
