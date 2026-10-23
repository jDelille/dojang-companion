import { useState } from "react";
import Modal from "../../../components/common/Modal";
import { CHECKIN_MEMBERS } from "../../../utils/json/checkinData";

/*
   Bulk Check-In — ported from #modal-bulk in tailwind/src/checkin.html and
   openBulk()/bulkConfirm() in assets/js/checkin.js.

   The template pre-ticks the first five non-expired members and disables
   expired ones outright; both rules are reproduced in the initial state.
*/

/** Seeds the checked set the way openBulk() did. */
const initialSelection = () =>
  new Set(
    CHECKIN_MEMBERS.filter(
      (member, index) => member.status !== "expired" && index < 5,
    ).map((member) => member.name),
  );

type BulkCheckinModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (names: string[]) => void;
};

const BulkCheckinModal = ({ open, onClose, onConfirm }: BulkCheckinModalProps) => {
  const [selected, setSelected] = useState<Set<string>>(initialSelection);

  const toggle = (name: string) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(name)) next.delete(name);
      else next.add(name);
      return next;
    });

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Bulk Check-In"
      boxClassName="glass modal-w-400"
      closeClassName="modal-x"
      titleClassName="text-base"
    >
      <div className="flex flex-col gap-2.5 mb-5">
        {CHECKIN_MEMBERS.map((member) => {
          const disabled = member.status === "expired";
          return (
            <label
              key={member.mid}
              className="flex items-center gap-3 p-3 rounded-xl border cursor-pointer list-row"
            >
              <input
                type="checkbox"
                className="accent-yellow-500"
                checked={selected.has(member.name)}
                disabled={disabled}
                onChange={() => toggle(member.name)}
              />
              <div className={`ci-av ci-av-sm ${member.tint}`}>{member.initials}</div>
              <span className="text-sm c-text2">
                {member.name} · {member.plan}
              </span>
            </label>
          );
        })}
      </div>
      <div className="flex gap-3">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm"
          onClick={() => onConfirm([...selected])}
        >
          Check In Selected
        </button>
      </div>
    </Modal>
  );
};

export default BulkCheckinModal;
