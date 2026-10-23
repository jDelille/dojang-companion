import { KeyRound, Pencil, Users, X } from "lucide-react";
import type { Role } from "../../../types/accessControl";
import { LEVEL_BADGE, MODULES } from "../../../utils/json/accessControlData";

/*
   View Permissions — ported from #modal-view in
   tailwind/src/access-control.html and openView() in
   assets/js/access-control.js.
*/

type RoleViewModalProps = {
  role: Role | null;
  onClose: () => void;
  onAssign: () => void;
  onEdit: () => void;
};

const RoleViewModal = ({ role, onClose, onAssign, onEdit }: RoleViewModalProps) => {
  const open = role !== null;

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
          <div>
            <h3 className="text-base font-black c-text">{role?.name ?? "Role"}</h3>
            <span className={`badge ${role ? LEVEL_BADGE[role.level] : "badge-active"} mt-1`}>
              {role?.level ?? "Level"}
            </span>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <p className="text-sm c-dim mb-3">{role?.desc ?? "—"}</p>
        <div className="ctx-box mb-4 flex items-center gap-2">
          <Users className="w-[13px] h-[13px] c-gold shrink-0" aria-hidden="true" />
          <span>{(role?.users ?? 0) + " users"}</span>
        </div>
        <div className="mb-5 scrollbox-y-40vh">
          {role && role.perms.length ? (
            MODULES.map((m) => {
              const allowed = role.perms.indexOf(m) > -1;
              return (
                <div key={m} className="detail-row">
                  <span className="k">{m}</span>
                  <span className={`v ${allowed ? "c-green" : "c-dim2"}`}>
                    {allowed ? "Allowed" : "No access"}
                  </span>
                </div>
              );
            })
          ) : (
            <p className="text-xs c-dim text-center py-4">No permissions assigned</p>
          )}
        </div>
        <div className="flex gap-3">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onAssign}
          >
            <KeyRound className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onEdit}
          >
            <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit
          </button>
        </div>
      </div>
    </div>
  );
};

export default RoleViewModal;
