import { useEffect, useState } from "react";
import { Check, CheckCircle2, X } from "lucide-react";
import type { FeedbackEntry } from "../../../types/feedback";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Resolve Feedback — ported from #modal-resolve in tailwind/src/feedback.html
   and openResolve()/confirmResolve() in assets/js/feedback.js.
*/

type FeedbackResolveModalProps = {
  entry: FeedbackEntry | null;
  onClose: () => void;
  onResolve: (entry: FeedbackEntry, note: string) => void;
};

const FeedbackResolveModal = ({ entry, onClose, onResolve }: FeedbackResolveModalProps) => {
  const open = entry !== null;
  const [note, setNote] = useState("");

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
            <div className="icon-box ic-green ic-38">
              <CheckCircle2 className="w-[17px] h-[17px] c-green shrink-0" aria-hidden="true" />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Resolve Feedback</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="p-3 rounded-xl mb-4 text-[13px] c-dim ctx-box">
          {entry ? `"${entry.text}" — ${entry.name}` : "—"}
        </div>
        <div>
          <label className="f-label">Resolution Note (optional)</label>
          <textarea
            className="fp-input py-2.5 text-sm"
            rows={3}
            placeholder="How was this resolved?"
            value={note}
            onChange={(e) => setNote(e.target.value)}
          />
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => entry && onResolve(entry, note)}
          >
            <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Mark Resolved
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackResolveModal;
