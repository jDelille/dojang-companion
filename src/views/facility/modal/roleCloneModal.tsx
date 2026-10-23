import { useState } from "react";
import { Copy, X } from "lucide-react";
import type { Role } from "../../../types/accessControl";

/*
   Clone Role — ported from #modal-clone in tailwind/src/access-control.html and
   openClone()/confirmClone() in assets/js/access-control.js.
*/

type RoleCloneModalProps = {
  role: Role | null;
  onClose: () => void;
  onConfirm: (id: number, name: string) => void;
};

const RoleCloneModal = ({ role, onClose, onConfirm }: RoleCloneModalProps) => {
  const open = role !== null;
  const [name, setName] = useState(role ? role.name + " (Copy)" : "");

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Clone Role</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {role
            ? 'Cloning "' + role.name + '" with ' + role.perms.length + " permissions"
            : "Cloning role"}
        </div>
        <div>
          <label className="f-label">New role name</label>
          <input
            type="text"
            className="fp-input py-2.5 text-sm"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!role) return;
              onConfirm(role.id, name);
              onClose();
            }}
          >
            <Copy className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Clone
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleCloneModal;
