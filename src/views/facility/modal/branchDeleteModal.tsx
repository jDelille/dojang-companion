import { useState } from "react";
import { AlertCircle, Trash2 } from "lucide-react";
import type { Branch } from "../../../types/branches";

/*
   Delete Branch — ported from #modal-delete in tailwind/src/branches.html and
   openDelete()/confirmDelete() in assets/js/branches.js. When the branch has
   members the user must type its exact name; those members are absorbed into
   the HQ by the hook. The HQ-lock guard is handled before the modal opens.
*/

type BranchDeleteModalProps = {
  branch: Branch | null;
  hqName: string | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const BranchDeleteModal = ({ branch, hqName, onClose, onConfirm }: BranchDeleteModalProps) => {
  const open = branch !== null;
  const needsConfirm = !!branch && branch.members > 0;
  const [typed, setTyped] = useState("");
  const [error, setError] = useState("");

  const confirm = () => {
    if (!branch) return;
    if (branch.members > 0) {
      if (typed.trim().toLowerCase() !== branch.name.toLowerCase()) {
        setError("Type “" + branch.name + "” exactly to confirm");
        return;
      }
    }
    onConfirm(branch.id);
    onClose();
  };

  return (
    <div
      className={open ? "modal-overlay open" : "modal-overlay"}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
      role="dialog"
      aria-modal="true"
      aria-labelledby="dl-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-420">
        <div className="confirm-ic danger">
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <h3 id="dl-title" className="text-base font-black c-text text-center mb-1">
          Delete Branch?
        </h3>
        <p className="text-sm text-center mb-4 c-dim">
          Permanently remove{" "}
          <span className="font-semibold c-text">{branch?.name ?? "this branch"}</span> from
          Dreams GYM. This cannot be undone.
        </p>
        <div className={`ctx-box mb-4${needsConfirm ? "" : " hidden"}`}>
          {needsConfirm && branch && (
            <>
              <span className="c-orange font-semibold">Heads up:</span>{" "}
              {branch.members.toLocaleString("en-US")} members and {branch.staff} staff are
              attached to this branch. They will be reassigned to{" "}
              {hqName ?? "the headquarters"}. Transfer them manually first if you want a different
              destination.
            </>
          )}
        </div>
        <div className={`mb-5${needsConfirm ? "" : " hidden"}`}>
          <label className="f-label" htmlFor="del-confirm">
            Type the branch name to confirm
          </label>
          <input
            type="text"
            id="del-confirm"
            className={`fp-input py-2.5 text-sm${error ? " invalid" : ""}`}
            placeholder="Branch name"
            autoComplete="off"
            aria-invalid={error ? "true" : "false"}
            value={typed}
            onChange={(e) => setTyped(e.target.value)}
          />
          <div className={`f-error${error ? " show" : ""}`}>
            <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
            <span>{error}</span>
          </div>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-danger flex-1 py-2.5 text-sm" onClick={confirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchDeleteModal;
