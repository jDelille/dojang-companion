import { useEffect } from "react";
import { CheckCircle, ScanLine } from "lucide-react";
import type { Member } from "../../../types/members";

/*
   Check In Member — ported from #modal-checkin in tailwind/src/members.html
   and openCheckin()/confirmCheckin() in assets/js/members.js.

   Raw markup rather than components/common/Modal: the dialog is centred with
   no header row, leading with the gold icon.
*/

type CheckinMemberModalProps = {
  member: Member | null;
  onClose: () => void;
  onConfirm: (member: Member) => void;
};

const CheckinMemberModal = ({ member, onClose, onConfirm }: CheckinMemberModalProps) => {
  const open = member !== null;

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
      <div className="modal-box modal-w-400">
        <div className="text-center">
          <div className="gold-ic">
            <ScanLine className="w-6 h-6 c-gold shrink-0" aria-hidden="true" />
          </div>
          <h3 className="text-base font-black c-text mb-1">Check In Member</h3>
          <div className="text-sm font-bold c-text">
            {member ? `${member.first} ${member.last}` : "—"}
          </div>
          <div className="text-xs c-dim mb-5">
            {member ? `${member.id} · ${member.planLabel}` : "—"}
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
              <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Confirm Check-in
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default CheckinMemberModal;
