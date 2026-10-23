import { useEffect } from "react";
import { ScanLine, X } from "lucide-react";
import type { CheckinMember } from "../../../types/checkin";
import {
  MEMBER_STATE_BADGE,
  MEMBER_STATE_LABEL,
} from "../../../utils/json/checkinData";

/*
   QR Scan Result — ported from #modal-qr in tailwind/src/checkin.html and
   openQr()/qrConfirm() in assets/js/checkin.js.

   Raw markup: the close button is absolutely positioned over a centred body
   rather than sitting in a header row.
*/

type QrScanModalProps = {
  member: CheckinMember | null;
  onClose: () => void;
  onConfirm: (member: CheckinMember) => void;
};

const QrScanModal = ({ member, onClose, onConfirm }: QrScanModalProps) => {
  const open = member !== null;

  useEffect(() => {
    if (!open) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    document.addEventListener("keydown", onKeyDown);
    return () => {
      document.body.style.overflow = previousOverflow;
      document.removeEventListener("keydown", onKeyDown);
    };
  }, [open, onClose]);

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-400 text-center">
        <button
          type="button"
          className="modal-x absolute right-5 top-5"
          onClick={onClose}
          aria-label="Close"
        >
          <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        </button>
        <div className="danger-ic ic-green-soft">
          <ScanLine className="w-6 h-6 c-green shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text mb-1">Code Scanned</h3>
        <p className="text-sm c-dim mb-4">Member identified from QR / barcode</p>
        <div className="gold-border-card p-3 mb-4 flex items-center gap-3 text-left">
          <div className={`ci-av ci-av-lg ${member?.tint ?? "av-gold-t"}`}>
            {member?.initials ?? "--"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-bold c-text">{member?.name ?? "—"}</div>
            <div className="text-[11px] c-dim">
              {member ? `${member.plan} · ${member.mid}` : "—"}
            </div>
          </div>
          <span
            className={`${member ? MEMBER_STATE_BADGE[member.status] : "badge-active"} text-[10px] font-bold px-2 py-0.5 rounded-full`}
          >
            {member ? MEMBER_STATE_LABEL[member.status] : "Active"}
          </span>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => member && onConfirm(member)}
          >
            Check In
          </button>
        </div>
      </div>
    </div>
  );
};

export default QrScanModal;
