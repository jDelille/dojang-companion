import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete confirm — ported from #modal-del in tailwind/src/offers.html and
   openDel()/confirmDel() in assets/js/offers.js.

   Raw markup rather than components/common/Modal: this dialog has no header
   row, leading instead with a centred icon and heading.
*/

type DeleteCouponModalProps = {
  code: string | null;
  onClose: () => void;
  onConfirm: (code: string) => void;
};

const DeleteCouponModal = ({ code, onClose, onConfirm }: DeleteCouponModalProps) => {
  const open = code !== null;

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
      <div className="modal-box">
        <div className="text-center">
          <div className="w-14 h-14 rounded-2xl flex items-center justify-center mx-auto mb-3 badge-red-custom">
            <Trash2 className="w-[24px] h-[24px] c-red shrink-0" aria-hidden="true" />
          </div>
          <DialogEyebrow />
          <h3 className="text-lg font-black c-text mb-1">Delete Coupon?</h3>
          <p className="text-sm c-dim mb-5">
            Delete <span className="c-gold font-bold font-mono">{code ?? "—"}</span> permanently?
            This cannot be undone.
          </p>
        </div>
        <div className="flex gap-2">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
            onClick={() => code && onConfirm(code)}
          >
            <Trash2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteCouponModal;
