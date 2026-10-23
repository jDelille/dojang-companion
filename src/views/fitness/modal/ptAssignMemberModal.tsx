import { useState } from "react";
import { X } from "lucide-react";
import type { PtSession } from "../../../types/ptSessions";
import { PT_MEMBERS, PT_TRAINERS } from "../../../utils/json/ptSessionsData";
import CommonSelect from "../../../components/common-select/commonSelect";
import { slotLabel } from "../usePtSessions";

/*
   Assign Member — ported from #modal-assign-member in
   tailwind/src/pt-sessions.html and openAssignMember()/confirmAssignMember()
   in assets/js/pt-sessions.js.
*/

const MEMBER_OPTIONS = PT_MEMBERS.map((value) => ({ value, label: value }));

type PtAssignMemberModalProps = {
  target: PtSession | null;
  onClose: () => void;
  onConfirm: (id: number, member: string) => void;
};

const PtAssignMemberModal = ({ target, onClose, onConfirm }: PtAssignMemberModalProps) => {
  const open = target !== null;
  const [member, setMember] = useState(target?.member ?? PT_MEMBERS[0]);

  const trainerName = target
    ? PT_TRAINERS.find((t) => t.id === target.trainerId)?.name
    : null;

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
      <div className="modal-box glass">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Assign Member</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {target ? `${trainerName} · ${slotLabel(target.slot)}` : "Session"}
        </div>
        <div>
          <label className="f-label">Member</label>
          <CommonSelect
            fieldClassName="py-2.5 text-sm"
            ariaLabel="Member"
            options={MEMBER_OPTIONS}
            value={member}
            onChange={(option) => setMember(option?.value ?? PT_MEMBERS[0])}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!target) return;
              onConfirm(target.id, member);
              onClose();
            }}
          >
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default PtAssignMemberModal;
