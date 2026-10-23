import { useCallback, useEffect, useRef, useState } from "react";
import useLatestRef from "./useLatestRef";


/** Poll interval; a barcode does not need 60fps to be read. */
const TICK_MS = 320;
/** One frame is not one scan — the same code lingers for many frames. */
const DEBOUNCE_MS = 1200;

const FORMATS = ["qr_code", "ean_13", "code_128", "code_39", "upc_a"];

type BarcodeDetectorLike = {
  detect: (source: HTMLVideoElement) => Promise<{ rawValue: string }[]>;
};
type BarcodeDetectorCtor = new (opts: {
  formats: string[];
}) => BarcodeDetectorLike;

const detectorCtor = (): BarcodeDetectorCtor | null =>
  (window as unknown as { BarcodeDetector?: BarcodeDetectorCtor })
    .BarcodeDetector ?? null;

export type CamTone = "is-good" | "is-bad" | undefined;

export type PosCamera = {
 
  videoRef: React.RefObject<HTMLVideoElement | null>;
  /** Plain values, safe to read in render. */
  state: { status: string; tone: CamTone };
  flip: () => void;
};

export function useCamera(
  active: boolean,
  onHit: (raw: string) => void,
): PosCamera {
  const videoRef = useRef<HTMLVideoElement | null>(null);
  const [facing, setFacing] = useState<"environment" | "user">("environment");
  const [status, setStatus] = useState("Starting camera…");
  const [tone, setTone] = useState<CamTone>(undefined);

  // Read inside the polling loop so a new handler never restarts the stream.
  const hitRef = useLatestRef(onHit);

  const say = useCallback((msg: string, next?: CamTone) => {
    setStatus(msg);
    setTone(next);
  }, []);

  const flip = useCallback(
    () => setFacing((f) => (f === "environment" ? "user" : "environment")),
    [],
  );

  useEffect(() => {
    if (!active) return;

    let stream: MediaStream | null = null;
    let timer: ReturnType<typeof setInterval> | null = null;
    let detector: BarcodeDetectorLike | null = null;
    let last = 0;
    let cancelled = false;

    const tick = () => {
      const video = videoRef.current;
      if (!detector || !video || video.readyState !== 4) return;
      detector
        .detect(video)
        .then((codes) => {
          if (cancelled || !codes?.length) return;
          const now = Date.now();
          if (now - last < DEBOUNCE_MS) return;
          last = now;
          hitRef.current(codes[0].rawValue);
        })
        .catch(() => {
          /* transient per-frame decode errors are normal */
        });
    };

    const stop = () => {
      if (timer) clearInterval(timer);
      timer = null;
      stream?.getTracks().forEach((t) => t.stop());
      stream = null;
      if (videoRef.current) videoRef.current.srcObject = null;
      detector = null;
    };

    if (!navigator.mediaDevices?.getUserMedia) {
    
      const t = setTimeout(
        () => say("Camera unavailable — type the code below", "is-bad"),
        0,
      );
      return () => {
        clearTimeout(t);
        stop();
      };
    }

    navigator.mediaDevices
      .getUserMedia({ video: { facingMode: facing }, audio: false })
      .then((s) => {
        if (cancelled) {
          s.getTracks().forEach((t) => t.stop());
          return;
        }
        stream = s;
        const video = videoRef.current;
        if (!video) return;
        video.srcObject = s;
        return video.play();
      })
      .then(() => {
        if (cancelled || !stream) return;
        const Ctor = detectorCtor();
        if (!Ctor) {
          say("Preview only — this browser cannot detect codes", "is-bad");
          return;
        }
        try {
          detector = new Ctor({ formats: FORMATS });
        } catch {
          detector = null;
          say("Detector unavailable — type the code", "is-bad");
          return;
        }
        say("Scanning…");
        timer = setInterval(tick, TICK_MS);
      })
      .catch((err: DOMException) => {
        if (cancelled) return;
        const denied = err?.name === "NotAllowedError" || err?.name === "SecurityError";
        say(denied ? "Camera permission denied" : "No camera found", "is-bad");
      });
    return () => {
      cancelled = true;
      stop();
    };
  }, [active, facing, say, hitRef]);

  return { videoRef, state: { status, tone }, flip };
}

export default useCamera;
