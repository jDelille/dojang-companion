import { useEffect } from "react";
import { Trash2 } from "lucide-react";
import type { MembershipPlan } from "../../../types/membershipPlans";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete Plan — ported from #modal-del-plan in
   tailwind/src/membership-plans.html and delPlan()/confirmDeletePlan() in
   assets/js/membership-plans.js.

   Raw markup rather than components/common/Modal: the dialog has no header
   row, leading with the danger icon.
*/

type DeletePlanModalProps = {
  plan: MembershipPlan | null;
  onClose: () => void;
  onConfirm: (plan: MembershipPlan) => void;
};

const DeletePlanModal = ({ plan, onClose, onConfirm }: DeletePlanModalProps) => {
  const open = plan !== null;

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
        <h3 className="text-base font-black c-text text-center mb-1">Delete Plan?</h3>
        <p className="text-sm text-center mb-5 c-dim">
          Are you sure you want to delete{" "}
          <span className="font-semibold c-soft">{plan?.name ?? "this plan"}</span>? This action
          cannot be undone.
        </p>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => plan && onConfirm(plan)}
          >
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default DeletePlanModal;
