import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { Reward } from "../../../types/rewards";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete Reward — ported from #modal-delete in tailwind/src/rewards.html and
   openDelete()/confirmDelete() in assets/js/rewards.js.
*/

type DeleteRewardModalProps = {
  reward: Reward | null;
  onClose: () => void;
  onConfirm: (reward: Reward) => void;
};

const DeleteRewardModal = ({ reward, onClose, onConfirm }: DeleteRewardModalProps) => {
  const open = reward !== null;

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
      <div className="modal-box glass modal-w-380">
        <div className="danger-ic">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Delete Reward?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Remove <span className="font-semibold c-text">{reward?.name ?? "this reward"}</span>{" "}
          from the catalog? This action cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => reward && onConfirm(reward)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeleteRewardModal;
