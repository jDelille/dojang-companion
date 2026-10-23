import { useEffect } from "react";
import { LogOut } from "lucide-react";
import type { CheckinLogEntry } from "../../../types/checkin";

/*
   Check Out Member — ported from #modal-checkout in
   tailwind/src/checkin.html and openCheckout()/checkoutConfirm() in
   assets/js/checkin.js.

   Raw markup: a centred confirm with no header row.
*/

type CheckoutConfirmModalProps = {
  entry: CheckinLogEntry | null;
  onClose: () => void;
  onConfirm: (entry: CheckinLogEntry) => void;
};

const CheckoutConfirmModal = ({ entry, onClose, onConfirm }: CheckoutConfirmModalProps) => {
  const open = entry !== null;

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
        <div className="danger-ic c-red">
          <LogOut className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text mb-1">Check Out Member?</h3>
        <p className="text-sm c-dim mb-5">
          Mark <span className="font-semibold c-text">{entry?.name ?? "this member"}</span> as
          checked out and free their locker.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => entry && onConfirm(entry)}
          >
            Check Out
          </button>
        </div>
      </div>
    </div>
  );
};

export default CheckoutConfirmModal;
