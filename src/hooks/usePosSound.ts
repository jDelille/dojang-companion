import { useCallback, useEffect, useRef, useState } from "react";
import useLatestRef from "./useLatestRef";
import { SOUND_KEY } from "../views/main-pages/pos/posData";


export type SfxName =
  | "add"
  | "remove"
  | "qty-up"
  | "qty-down"
  | "success"
  | "error"
  | "scan";
type Part = [number, number, number, OscillatorType];

const SFX: Record<SfxName, { gain: number; parts: Part[] }> = {
  add: { gain: 0.06, parts: [[880, 0, 0.07, "triangle"], [1320, 0.06, 0.09, "triangle"]] },
  remove: { gain: 0.05, parts: [[660, 0, 0.07, "sine"], [440, 0.06, 0.1, "sine"]] },
  "qty-up": { gain: 0.04, parts: [[1046, 0, 0.05, "triangle"]] },
  "qty-down": { gain: 0.04, parts: [[784, 0, 0.05, "triangle"]] },
  success: {
    gain: 0.06,
    parts: [
      [523, 0, 0.09, "sine"],
      [659, 0.09, 0.09, "sine"],
      [784, 0.18, 0.09, "sine"],
      [1046, 0.27, 0.22, "sine"],
    ],
  },
  error: { gain: 0.05, parts: [[220, 0, 0.1, "sawtooth"], [180, 0.13, 0.16, "sawtooth"]] },
  scan: { gain: 0.05, parts: [[2000, 0, 0.06, "square"]] },
};

const readMuted = (): boolean => {
  try {
    return localStorage.getItem(SOUND_KEY) === "off";
  } catch {
    return false;
  }
};

export type PosSound = {
  muted: boolean;
  sfx: (name: SfxName) => void;
  toggleMuted: () => boolean;
};

export function usePosSound(): PosSound {
  const [muted, setMuted] = useState(readMuted);
  const ctxRef = useRef<AudioContext | null>(null);
  const mutedRef = useLatestRef(muted);
  const ctx = useCallback((): AudioContext | null => {
    const AC =
      window.AudioContext ||
      (window as unknown as { webkitAudioContext?: typeof AudioContext })
        .webkitAudioContext;
    if (!AC) return null;
    if (!ctxRef.current) {
      try {
        ctxRef.current = new AC();
      } catch {
        return null;
      }
    }
    if (ctxRef.current.state === "suspended") void ctxRef.current.resume();
    return ctxRef.current;
  }, []);

  const sfx = useCallback(
    (name: SfxName) => {
      if (mutedRef.current) return;
      const def = SFX[name];
      if (!def) return;
      const ac = ctx();
      if (!ac) return;

      const t0 = ac.currentTime;
      def.parts.forEach(([freq, offset, dur, wave]) => {
        const osc = ac.createOscillator();
        const gain = ac.createGain();
        const start = t0 + offset;
        const end = start + dur;
        osc.type = wave;
        osc.frequency.setValueAtTime(freq, start);
        gain.gain.setValueAtTime(0, start);
        gain.gain.linearRampToValueAtTime(def.gain, start + 0.01);
        gain.gain.exponentialRampToValueAtTime(0.0001, end);
        osc.connect(gain);
        gain.connect(ac.destination);
        osc.start(start);
        osc.stop(end + 0.02);
      });
    },
    [ctx, mutedRef],
  );

  const toggleMuted = useCallback((): boolean => {
    const next = !mutedRef.current;
    mutedRef.current = next;
    setMuted(next);
    try {
      localStorage.setItem(SOUND_KEY, next ? "off" : "on");
    } catch {
      /* preference simply will not persist */
    }
    /* Confirm audibly that sound is back — mutedRef is already updated. */
    if (!next) sfx("add");
    return next;
  }, [sfx, mutedRef]);

  // An AudioContext left open holds an audio device handle after unmount.
  useEffect(
    () => () => {
      void ctxRef.current?.close();
      ctxRef.current = null;
    },
    [],
  );

  return { muted, sfx, toggleMuted };
}

export default usePosSound;
