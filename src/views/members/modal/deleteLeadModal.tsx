import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { Lead } from "../../../types/leads";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete Lead — ported from #modal-delete in tailwind/src/leads.html and
   openDelete()/confirmDelete() in assets/js/leads.js.

   Raw markup rather than components/common/Modal: the dialog is centred with
   no header row, leading with the danger icon.
*/

type DeleteLeadModalProps = {
  lead: Lead | null;
  onClose: () => void;
  onConfirm: (lead: Lead) => void;
};

const DeleteLeadModal = ({ lead, onClose, onConfirm }: DeleteLeadModalProps) => {
  const open = lead !== null;

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
      <div className="modal-box glass modal-w-400">
        <div className="text-center">
          <div className="danger-ic">
            <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
          </div>
          <DialogEyebrow />
          <h3 className="text-base font-black c-text mb-1">Delete Lead?</h3>
          <p className="text-sm c-dim mb-5">
            This permanently removes{" "}
            <span className="font-semibold c-text">{lead?.name ?? "this lead"}</span> from your
            pipeline. This action cannot be undone.
          </p>
          <div className="flex gap-3">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="button"
              className="btn-danger flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
              onClick={() => lead && onConfirm(lead)}
            >
              <Trash2 className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Delete Lead
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default DeleteLeadModal;
