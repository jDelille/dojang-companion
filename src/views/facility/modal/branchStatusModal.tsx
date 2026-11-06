import { useState } from "react";
import { AlertCircle, Check, X } from "lucide-react";
import type { Branch, BranchStatus } from "../../../types/branches";
import {
  BRANCH_STATUSES,
  BRANCH_STATUS_COLOR,
  BRANCH_STATUS_HINT,
  BRANCH_STATUS_TINT,
} from "../../../utils/json/branchesData";
import { BRANCH_STATUS_ICON_CMP } from "../branchIcons";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Change Branch Status — ported from #modal-status in tailwind/src/branches.html
   and openStatus()/pickStatus()/confirmStatus() in assets/js/branches.js. The
   status choices are a custom radio group of option cards. The HQ-must-stay-
   Active guard lives in the hook and returns false to keep the modal open.
*/

type BranchStatusModalProps = {
  branch: Branch | null;
  onClose: () => void;
  onConfirm: (branchId: number, status: BranchStatus) => boolean;
};

const BranchStatusModal = ({ branch, onClose, onConfirm }: BranchStatusModalProps) => {
  const open = branch !== null;
  const [pending, setPending] = useState<BranchStatus>(branch?.status ?? "Active");
  const [error, setError] = useState("");

  const confirm = () => {
    if (!branch) return;
    if (!pending) {
      setError("Choose a status");
      return;
    }
    if (pending === branch.status) {
      onClose();
      return;
    }
    setError("");
    const ok = onConfirm(branch.id, pending);
    if (ok) onClose();
    else setError("The headquarters must stay active — set another branch as HQ first");
  };

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="st-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-4">
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 id="st-title" className="text-base font-black c-text">
              Change Branch Status
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {branch ? branch.name + " · currently " + branch.status : "Branch"}
        </div>
        <div className="space-y-2 mb-4" role="radiogroup" aria-label="New status">
          {BRANCH_STATUSES.map((s) => {
            const on = s === pending;
            const Icon = BRANCH_STATUS_ICON_CMP[s];
            return (
              <button
                key={s}
                type="button"
                className={on ? "opt-card sel" : "opt-card"}
                role="radio"
                aria-checked={on}
                onClick={() => {
                  setPending(s);
                  setError("");
                }}
              >
                <span className={`opt-ic ${BRANCH_STATUS_TINT[s]}`}>
                  <Icon
                    className={`w-[15px] h-[15px] ${BRANCH_STATUS_COLOR[s]} shrink-0`}
                    aria-hidden="true"
                  />
                </span>
                <span className="flex-1">
                  <span className="block text-[13px] font-bold c-text">{s}</span>
                  <span className="block text-[11px] c-dim">{BRANCH_STATUS_HINT[s]}</span>
                </span>
                <Check
                  className={`w-[15px] h-[15px] c-gold shrink-0${on ? "" : " opacity-0"}`}
                  aria-hidden="true"
                />
              </button>
            );
          })}
        </div>
        <div className={`f-error mb-3${error ? " show" : ""}`}>
          <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
          <span>{error}</span>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={confirm}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Update Status
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchStatusModal;
