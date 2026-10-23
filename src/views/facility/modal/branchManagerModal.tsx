import { useState } from "react";
import { AlertCircle, Check, UserCheck, X } from "lucide-react";
import type { Branch } from "../../../types/branches";
import { MANAGERS, mgrName } from "../../../utils/json/branchesData";
import { avClass, initials } from "../useBranches";

/*
   Assign Manager — ported from #modal-manager in tailwind/src/branches.html and
   openManager()/renderManagerList()/confirmManager() in assets/js/branches.js.
   The manager list is a custom radio group of buttons, filtered live by the
   search box, seeded from the branch's current manager.
*/

type BranchManagerModalProps = {
  branch: Branch | null;
  branches: Branch[];
  onClose: () => void;
  onConfirm: (branchId: number, managerId: string) => void;
};

const BranchManagerModal = ({
  branch,
  branches,
  onClose,
  onConfirm,
}: BranchManagerModalProps) => {
  const open = branch !== null;
  const [query, setQuery] = useState("");
  const [pending, setPending] = useState<string | null>(branch?.managerId ?? null);
  const [error, setError] = useState("");

  const q = query.trim().toLowerCase();
  const list = MANAGERS.filter(
    (m) =>
      !q ||
      m.name.toLowerCase().includes(q) ||
      m.role.toLowerCase().includes(q) ||
      m.id.toLowerCase().includes(q),
  );

  const pick = (id: string) => {
    setPending(id);
    setError("");
  };

  const confirm = () => {
    if (!branch) return;
    if (!pending) {
      setError("Choose a manager to assign");
      return;
    }
    onConfirm(branch.id, pending);
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
      aria-labelledby="mg-title"
      aria-hidden={!open}
    >
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-4">
          <h3 id="mg-title" className="text-base font-black c-text">
            Assign Manager
          </h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {branch ? branch.name + " · currently " + mgrName(branch) : "Branch"}
        </div>
        <div className="mb-3">
          <label className="f-label" htmlFor="mg-search">
            Choose a manager
          </label>
          <input
            type="text"
            id="mg-search"
            className="fp-input py-2.5 text-sm"
            placeholder="Search staff…"
            autoComplete="off"
            aria-label="Search managers"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="mgr-scroll mb-3" role="radiogroup" aria-label="Available managers">
          {list.length === 0 ? (
            <div className="text-xs c-dim text-center py-6">No staff match “{query}”</div>
          ) : (
            list.map((m) => {
              const at = branches.find((b) => b.managerId === m.id && b.id !== branch?.id);
              const on = m.id === pending;
              return (
                <button
                  key={m.id}
                  type="button"
                  className={on ? "mgr-opt sel" : "mgr-opt"}
                  role="radio"
                  aria-checked={on}
                  onClick={() => pick(m.id)}
                >
                  <span className={`br-avatar ${avClass(m.name)}`}>{initials(m.name)}</span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold c-text truncate">
                      {m.name}
                    </span>
                    <span className="block text-[11px] c-dim truncate">
                      {m.role + (at ? " · managing " + at.city : " · available")}
                    </span>
                  </span>
                  <Check
                    className={`w-[15px] h-[15px] c-gold shrink-0${on ? "" : " opacity-0"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })
          )}
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
            <UserCheck className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default BranchManagerModal;
