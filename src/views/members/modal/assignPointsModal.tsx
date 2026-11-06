import { useEffect, useState } from "react";
import { Coins, Plus, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { LoyaltyMember } from "../../../types/rewards";
import { ASSIGN_REASONS } from "../../../utils/json/rewardsData";
import { number } from "../../../utils/formatUtils";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Assign Points — ported from #modal-assign in tailwind/src/rewards.html and
   openAssign()/updateAssignBalance()/confirmAssign() in
   assets/js/rewards.js.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type AssignPointsModalProps = {
  open: boolean;
  members: LoyaltyMember[];
  onClose: () => void;
  onAssign: (member: LoyaltyMember, points: number, reason: string) => void;
};

const AssignPointsModal = ({
  open,
  members,
  onClose,
  onAssign,
}: AssignPointsModalProps) => {
  const [name, setName] = useState(members[0]?.name ?? "");
  const [points, setPoints] = useState("100");
  const [reason, setReason] = useState(ASSIGN_REASONS[0]);

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

  const member = members.find((item) => item.name === name);
  const memberOptions = members.map((item) => ({
    value: item.name,
    label: `${item.name} (${number(item.pts)} pts)`,
  }));

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
            <div className="icon-box grad-gold ic-38">
              <Coins className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Assign Points</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-3">
          <div>
            <label className="f-label">Member</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Member"
              options={memberOptions}
              value={name}
              onChange={(option) => setName(option?.value ?? members[0]?.name ?? "")}
            />
          </div>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="f-label">Points to Add</label>
              <input
                type="number"
                className="fp-input py-2.5 text-sm"
                value={points}
                onChange={(e) => setPoints(e.target.value)}
              />
            </div>
            <div>
              <label className="f-label">Reason</label>
              <CommonSelect
                fieldClassName="py-2.5 text-sm"
                ariaLabel="Reason"
                options={toOptions(ASSIGN_REASONS)}
                value={reason}
                onChange={(option) => setReason(option?.value ?? ASSIGN_REASONS[0])}
              />
            </div>
          </div>
        </div>
        <div className="text-[11px] mt-3 c-dim">
          Current balance: <b className="c-gold">{number(member?.pts ?? 0)} pts</b>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => member && onAssign(member, Number(points) || 0, reason)}
          >
            <Plus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign Points
          </button>
        </div>
      </div>
    </div>
  );
};

export default AssignPointsModal;
