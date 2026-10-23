import { Download, Printer, X } from "lucide-react";
import type { Locker } from "../../../types/lockers";
import { code } from "../useLockers";

/*
   Locker QR Tag — ported from #modal-qr in tailwind/src/lockers.html and
   openQR()/qrDownload() in assets/js/lockers.js. The canvas markup is preserved;
   the QR bitmap was drawn by the external window.QR helper in the template.
*/

type LockerQrModalProps = {
  locker: Locker | null;
  onClose: () => void;
  onDownload: () => void;
  onPrint: () => void;
};

const LockerQrModal = ({ locker, onClose, onDownload, onPrint }: LockerQrModalProps) => {
  const open = locker !== null;

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="qr-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-380">
        <div className="flex items-center justify-between mb-4">
          <h3 id="qr-title" className="text-base font-black c-text">
            Locker QR Tag
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="qr-frame">
          <canvas width={180} height={180} role="img" aria-label="Locker QR code" />
        </div>
        <div className="text-center mb-1">
          <span className="text-sm font-black c-text font-mono">{locker ? code(locker) : "—"}</span>
        </div>
        <div className="text-[11px] text-center c-dim mb-5">
          {locker ? locker.zone + " Zone · " + locker.size + " · " + locker.status : "—"}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onDownload}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            PNG
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onPrint}
          >
            <Printer className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Print Tag
          </button>
        </div>
      </div>
    </div>
  );
};

export default LockerQrModal;
