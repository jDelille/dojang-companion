import { useEffect, useState } from "react";
import { Edit2, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { DayPass, PassStatus, PassTypeName } from "../../../types/dayPasses";
import { PASS_STATUS_OPTIONS, PASS_TYPES } from "../../../utils/json/dayPassesData";
import { moneyWhole } from "../../../utils/formatUtils";
import type { EditPassInput } from "../useDayPasses";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Edit Pass — ported from #modal-edit in tailwind/src/day-passes.html and
   openEdit()/saveEdit() in assets/js/day-passes.js.

   Seeded from the pass on mount; the page keys this by pass id.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const TYPE_OPTIONS = PASS_TYPES.map((type) => ({
  value: type.name,
  label: `${type.name} — ${type.fee ? moneyWhole(type.fee) : "Free"}`,
}));

type EditPassModalProps = {
  pass: DayPass | null;
  onClose: () => void;
  onSave: (input: EditPassInput) => void;
};

const EditPassModal = ({ pass, onClose, onSave }: EditPassModalProps) => {
  const open = pass !== null;
  const [name, setName] = useState(pass?.name ?? "");
  const [phone, setPhone] = useState(pass && pass.phone !== "—" ? pass.phone : "");
  const [ref, setRef] = useState(pass?.ref ?? "");
  const [type, setType] = useState<PassTypeName>(pass?.type ?? PASS_TYPES[0].name);
  const [status, setStatus] = useState<PassStatus>(pass?.status ?? "Active");

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
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box ic-gold ic-38">
              <Edit2 className="w-[17px] h-[17px] c-gold shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Edit Pass</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Guest Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Phone</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Referred By</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Member name"
              value={ref}
              onChange={(e) => setRef(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Pass Type</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Pass type"
              options={TYPE_OPTIONS}
              value={type}
              onChange={(option) =>
                setType((option?.value as PassTypeName) ?? PASS_TYPES[0].name)
              }
            />
          </div>
          <div>
            <label className="f-label">Status</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Status"
              options={toOptions(PASS_STATUS_OPTIONS)}
              value={status}
              onChange={(option) => setStatus((option?.value as PassStatus) ?? "Active")}
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() =>
              pass && onSave({ id: pass.id, name, phone, ref, type, status })
            }
          >
            Save Changes
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditPassModal;
