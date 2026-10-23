import { useEffect, useState } from "react";
import { UserPlus, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import {
  CHECKIN_MEMBERS,
  TRAINER_OPTIONS,
} from "../../../utils/json/checkinData";
import type { CheckInOptions } from "../useCheckin";

/*
   Manual Check-In — ported from #modal-manual in tailwind/src/checkin.html
   and openManual()/manualConfirm() in assets/js/checkin.js.

   The member list excludes expired memberships, which cannot be checked in.
   Raw markup because the header carries a gold icon tile.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

const MEMBER_OPTIONS = CHECKIN_MEMBERS.filter((member) => member.status !== "expired").map(
  (member) => ({ value: member.name, label: `${member.name} · ${member.plan}` }),
);

type ManualCheckinModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (name: string, options: CheckInOptions) => void;
};

const ManualCheckinModal = ({ open, onClose, onConfirm }: ManualCheckinModalProps) => {
  const [name, setName] = useState(MEMBER_OPTIONS[0]?.value ?? "");
  const [trainer, setTrainer] = useState("Unassigned");
  const [locker, setLocker] = useState("");
  const [notes, setNotes] = useState("");

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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <UserPlus className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Manual Check-In</h3>
          </div>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Member"
              options={MEMBER_OPTIONS}
              value={name}
              onChange={(option) => setName(option?.value ?? "")}
            />
          </div>
          <div>
            <label className="f-label">Trainer</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Trainer"
              options={toOptions(TRAINER_OPTIONS)}
              value={trainer}
              onChange={(option) => setTrainer(option?.value ?? "Unassigned")}
            />
          </div>
          <div>
            <label className="f-label">Locker</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. A-12"
              value={locker}
              onChange={(e) => setLocker(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Notes</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="Optional note"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
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
            onClick={() => onConfirm(name, { trainer, locker, notes })}
          >
            Check In
          </button>
        </div>
      </div>
    </div>
  );
};

export default ManualCheckinModal;
