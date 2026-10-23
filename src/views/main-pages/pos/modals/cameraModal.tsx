import { useCallback, useState } from "react";
import { Check, Loader, SwitchCamera, TriangleAlert } from "lucide-react";
import PosModal from "../posModal";
import useCamera, { type CamTone } from "../../../../hooks/useCamera";
import { findByCode } from "../posUtils";
import { spawnRipple } from "../ripple";

/*
   Camera Scanner, ported from #modal-camera and the CAMERA block in
   tailwind/src/pos.html and assets/js/pos.js.

   useCamera owns the stream and releases every track when `open` goes false —
   which happens on the X, on Esc and on a click outside alike, because they
   all route through the same onClose. A camera light left on behind a closed
   modal looks like the app is spying.

   BarcodeDetector is not in every browser, so the manual field is always
   present: a register must never be left with no way to enter a code.
*/

type CameraModalProps = {
  open: boolean;
  onClose: () => void;
  onAdd: (id: number) => void;
  onError: () => void;
  onToast: (msg: string) => void;
};

const CameraModal = ({
  open,
  onClose,
  onAdd,
  onError,
  onToast,
}: CameraModalProps) => {
  const [manual, setManual] = useState("");
  const [hit, setHit] = useState<{ status: string; tone: CamTone; msg: string } | null>(
    null,
  );

  /*
     Decoding is reported through state rather than by calling back into the
     camera hook, so the handler passed to useCamera never needs to close over
     it — useCamera keeps the callback in a latest-ref and the stream is not
     torn down between renders.
  */
  const handleHit = useCallback(
    (raw: string) => {
      const p = findByCode(raw);
      if (!p) {
        onError();
        setHit({
          status: "Unknown code: " + String(raw).slice(0, 18),
          tone: "is-bad",
          msg: "No product matches that code",
        });
        return;
      }
      onAdd(p.id);
      setHit({
        status: "Added " + p.name,
        tone: "is-good",
        msg: p.emoji + " " + p.name,
      });
    },
    [onAdd, onError],
  );

  const { videoRef, state: camState, flip } = useCamera(open, handleHit);

  // A decode overrides whatever the camera itself last reported.
  const status = hit?.status ?? camState.status;
  const tone = hit?.tone ?? camState.tone;
  const message = hit?.msg ?? "";

  const StatusIcon =
    tone === "is-bad" ? TriangleAlert : tone === "is-good" ? Check : Loader;

  const submitManual = () => {
    const v = manual.trim();
    if (!v) {
      onError();
      onToast("Enter a code first");
      return;
    }
    handleHit(v);
    setManual("");
  };

  return (
    <PosModal
      open={open}
      onClose={onClose}
      title="Camera Scanner"
      boxClassName="modal-sm2"
    >
      <div className="text-[12px] t-muted mb-3">
        Point the camera at a barcode or QR code — the sale line is added
        automatically.
      </div>
      <div className="cam-stage">
        {/* muted + playsInline are required for autoplay on iOS Safari */}
        <video ref={videoRef} className="cam-video" playsInline muted />
        <div className="cam-frame">
          <span className="cam-laser" />
        </div>
        <div className="cam-msg">{message}</div>
      </div>
      <div className="flex items-center justify-between gap-2 mt-3">
        <span className={`pill-chip${tone ? " " + tone : ""}`}>
          <StatusIcon className="ic-12" aria-hidden="true" />
          {status}
        </span>
        <div className="flex items-center gap-2">
          <button
            type="button"
            className="btn-ghost ripple px-3 py-2 text-xs flex items-center gap-1.5"
            onClick={(e) => {
              spawnRipple(e);
              flip();
            }}
          >
            <SwitchCamera className="ic-14" aria-hidden="true" />
            Flip
          </button>
          <button
            type="button"
            className="btn-ghost ripple px-3 py-2 text-xs"
            onClick={onClose}
          >
            Close
          </button>
        </div>
      </div>
      <div className="cam-manual">
        <label className="mini-label" htmlFor="cam-code">
          Enter a code manually
        </label>
        <div className="flex gap-2">
          <input
            id="cam-code"
            type="text"
            className="fp-input py-2 text-xs flex-1"
            placeholder="e.g. COKE-330 or 8901234567890"
            value={manual}
            onChange={(e) => setManual(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") submitManual();
            }}
          />
          <button
            type="button"
            className="btn-gold ripple px-3 py-2 text-xs shrink-0"
            onClick={(e) => {
              spawnRipple(e);
              submitManual();
            }}
          >
            Add
          </button>
        </div>
      </div>
    </PosModal>
  );
};

export default CameraModal;
