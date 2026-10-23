import { useState } from "react";
import { Check, X } from "lucide-react";
import type { AccessLevel, Role, RoleFormValues } from "../../../types/accessControl";
import { LEVELS } from "../../../utils/json/accessControlData";
import CommonSelect from "../../../components/common-select/commonSelect";

/*
   Add / Edit Role — ported from #modal-role-form in
   tailwind/src/access-control.html and openForm()/submitForm() in
   assets/js/access-control.js.
*/

const LEVEL_OPTIONS = LEVELS.map((value) => ({ value, label: value }));

type RoleFormModalProps = {
  open: boolean;
  target: Role | null;
  onClose: () => void;
  onSubmit: (values: RoleFormValues, editId: number | null) => boolean;
};

const RoleFormModal = ({ open, target, onClose, onSubmit }: RoleFormModalProps) => {
  const [name, setName] = useState(target?.name ?? "");
  const [desc, setDesc] = useState(target?.desc ?? "");
  const [level, setLevel] = useState<AccessLevel>(target?.level ?? "Standard");

  const submit = () => {
    const accepted = onSubmit({ name, desc, level }, target?.id ?? null);
    if (accepted) onClose();
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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-5">
          <h3 className="text-base font-black c-text">{target ? "Edit Role" : "Add Role"}</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <form
          className="space-y-4"
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <label className="f-label">Role name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Duty Manager"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Description</label>
            <textarea
              className="fp-input py-2.5 text-sm"
              rows={2}
              placeholder="What this role can do…"
              value={desc}
              onChange={(e) => setDesc(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Access level</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Access level"
              options={LEVEL_OPTIONS}
              value={level}
              onChange={(option) => setLevel((option?.value as AccessLevel) ?? "Standard")}
            />
          </div>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              {target ? "Save Changes" : "Create Role"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default RoleFormModal;
