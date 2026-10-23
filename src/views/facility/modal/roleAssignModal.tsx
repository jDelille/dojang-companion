import { useState } from "react";
import { X } from "lucide-react";
import type { Role } from "../../../types/accessControl";
import { MODULES } from "../../../utils/json/accessControlData";

/*
   Assign Permissions — ported from #modal-assign in
   tailwind/src/access-control.html and openAssign()/confirmAssign() in
   assets/js/access-control.js.
*/

type RoleAssignModalProps = {
  role: Role | null;
  onClose: () => void;
  onConfirm: (id: number, perms: string[]) => void;
};

const RoleAssignModal = ({ role, onClose, onConfirm }: RoleAssignModalProps) => {
  const open = role !== null;
  const [perms, setPerms] = useState<string[]>(role?.perms ?? []);

  const toggle = (module: string, checked: boolean) => {
    setPerms((prev) =>
      checked ? [...prev, module] : prev.filter((p) => p !== module),
    );
  };

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
      <div className="modal-box glass modal-w-560">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Assign Permissions</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">{role ? role.name + " · " + role.level : "Role"}</div>
        <div className="perm-grid mb-5">
          {MODULES.map((m) => (
            <label key={m} className="perm-item">
              <input
                type="checkbox"
                value={m}
                checked={perms.indexOf(m) > -1}
                onChange={(e) => toggle(m, e.target.checked)}
              />
              <span>{m}</span>
            </label>
          ))}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!role) return;
              onConfirm(role.id, perms);
              onClose();
            }}
          >
            Save Permissions
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleAssignModal;
