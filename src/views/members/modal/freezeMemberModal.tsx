import { useState } from "react";
import { Snowflake } from "lucide-react";
import Modal from "../../../components/common/Modal";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { Member } from "../../../types/members";

/*
   Freeze Membership — ported from #modal-freeze in tailwind/src/members.html
   and openFreeze()/confirmFreeze() in assets/js/members.js.

   Duration and reason are collected exactly as the template did; neither
   feeds the confirmation, which only flips the status.
*/

const DURATION_OPTIONS = ["1 week", "2 weeks", "1 month", "2 months", "3 months"].map(
  (value) => ({ value, label: value }),
);

type FreezeMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onConfirm: (member: Member) => void;
};

const FreezeMemberModal = ({ member, onClose, onConfirm }: FreezeMemberModalProps) => {
  const [duration, setDuration] = useState("1 week");
  const [reason, setReason] = useState("");

  return (
    <Modal
      open={member !== null}
      onClose={onClose}
      title="Freeze Membership"
      boxClassName="modal-w-400"
      closeClassName="modal-x"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-3 mb-4">
        <div className="text-sm font-bold c-text">
          {member ? `${member.first} ${member.last}` : "—"}
        </div>
        <div className="text-[11px] c-dim">
          {member ? `${member.id} · ${member.planLabel}` : "—"}
        </div>
      </div>
      <div className="mb-3">
        <label className="f-label">Freeze Duration</label>
        <CommonSelect
          ariaLabel="Freeze duration"
          options={DURATION_OPTIONS}
          value={duration}
          onChange={(option) => setDuration(option?.value ?? "1 week")}
        />
      </div>
      <div className="mb-4">
        <label className="f-label">Reason (optional)</label>
        <textarea
          className="fp-input"
          rows={2}
          placeholder="Travel, medical, etc."
          value={reason}
          onChange={(e) => setReason(e.target.value)}
        />
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => member && onConfirm(member)}
        >
          <Snowflake className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Freeze Membership
        </button>
      </div>
    </Modal>
  );
};

export default FreezeMemberModal;
