import { useEffect, useState } from "react";
import { CheckCircle, UserPlus, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { FeedbackEntry, FeedbackPriority } from "../../../types/feedback";
import { ASSIGNEE_OPTIONS, PRIORITY_OPTIONS } from "../../../utils/json/feedbackData";

/*
   Assign Feedback — ported from #modal-assign in tailwind/src/feedback.html
   and openAssign()/confirmAssign() in assets/js/feedback.js.

   Complaints default to High priority, everything else to Medium.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type FeedbackAssignModalProps = {
  entry: FeedbackEntry | null;
  onClose: () => void;
  onAssign: (entry: FeedbackEntry, assignee: string, priority: FeedbackPriority) => void;
};

const FeedbackAssignModal = ({ entry, onClose, onAssign }: FeedbackAssignModalProps) => {
  const open = entry !== null;
  const [staff, setStaff] = useState(ASSIGNEE_OPTIONS[0]);
  const [priority, setPriority] = useState<FeedbackPriority>(
    entry?.type === "Complaints" ? "High" : "Medium",
  );

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
            <div className="icon-box grad-gold ic-38">
              <UserPlus className="w-[17px] h-[17px] t-ink shrink-0" aria-hidden="true" />
            </div>
            <h3 className="text-base font-black c-text">Assign Feedback</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-dim ctx-box">
          {entry ? `"${entry.text}" — ${entry.name}` : "—"}
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="f-label">Assign To</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Assign to"
              options={toOptions(ASSIGNEE_OPTIONS)}
              value={staff}
              onChange={(option) => setStaff(option?.value ?? ASSIGNEE_OPTIONS[0])}
            />
          </div>
          <div>
            <label className="f-label">Priority</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Priority"
              options={toOptions(PRIORITY_OPTIONS)}
              value={priority}
              onChange={(option) =>
                setPriority((option?.value as FeedbackPriority) ?? "Medium")
              }
            />
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => entry && onAssign(entry, staff, priority)}
          >
            <CheckCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Assign
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackAssignModal;
