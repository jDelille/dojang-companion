import { useEffect, useState } from "react";
import { MessageSquarePlus, Star, X } from "lucide-react";
import CommonSelect from "../../../components/common-select/commonSelect";
import type { FeedbackEntry, FeedbackType } from "../../../types/feedback";
import { FEEDBACK_TYPE_OPTIONS } from "../../../utils/json/feedbackData";
import type { FeedbackFormInput } from "../useFeedback";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Add / Edit Feedback — ported from #modal-edit in tailwind/src/feedback.html
   and openAdd()/openEdit()/saveEdit() in assets/js/feedback.js.

   The star picker is a five-glyph row where clicking position N fills 1..N,
   matching setPicker(). Raw markup because the header carries a gold tile.
*/

const toOptions = (values: readonly string[]) =>
  values.map((value) => ({ value, label: value }));

type FeedbackEditModalProps = {
  open: boolean;
  /** The entry being edited, or null when adding. */
  entry: FeedbackEntry | null;
  onClose: () => void;
  onSave: (input: FeedbackFormInput) => void;
  /** Called instead of onSave when the name is blank. */
  onInvalid: () => void;
};

const FeedbackEditModal = ({
  open,
  entry,
  onClose,
  onSave,
  onInvalid,
}: FeedbackEditModalProps) => {
  const [name, setName] = useState(entry?.name ?? "");
  const [type, setType] = useState<FeedbackType>(entry?.type ?? "Reviews");
  const [topic, setTopic] = useState(entry?.topic ?? "");
  const [text, setText] = useState(entry?.text ?? "");
  const [resolved, setResolved] = useState(entry?.resolved ?? false);
  /* A new entry starts at five stars, as openAdd() did. */
  const [rating, setRating] = useState(entry?.rating ?? 5);

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

  const save = () => {
    const trimmed = name.trim();
    // saveEdit() toasted "Enter a member name" and kept the modal open.
    if (!trimmed) {
      onInvalid();
      return;
    }
    onSave({ id: entry?.id ?? null, name: trimmed, type, topic, rating, text, resolved });
    onClose();
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
      <div className="modal-box glass modal-w-480">
        <div className="flex items-center justify-between mb-5">
          <div className="flex items-center gap-2.5">
            <div className="icon-box grad-gold ic-38">
              <MessageSquarePlus
                className="w-[17px] h-[17px] t-ink shrink-0"
                aria-hidden="true"
              />
            </div>
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">
              {entry ? "Edit Feedback" : "Add Feedback"}
            </h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="grid grid-cols-2 gap-3">
          <div className="col-span-2">
            <label className="f-label">Member Name</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Ashley Bennett"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>
          <div>
            <label className="f-label">Type</label>
            <CommonSelect
              fieldClassName="py-2.5 text-sm"
              ariaLabel="Type"
              options={toOptions(FEEDBACK_TYPE_OPTIONS)}
              value={type}
              onChange={(option) => setType((option?.value as FeedbackType) ?? "Reviews")}
            />
          </div>
          <div>
            <label className="f-label">Topic</label>
            <input
              type="text"
              className="fp-input py-2.5 text-sm"
              placeholder="e.g. Trainers"
              value={topic}
              onChange={(e) => setTopic(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="f-label">Rating</label>
            <div className="star-pick">
              {[1, 2, 3, 4, 5].map((value) => (
                <Star
                  key={value}
                  className={value <= rating ? "on" : undefined}
                  onClick={() => setRating(value)}
                />
              ))}
            </div>
          </div>
          <div className="col-span-2">
            <label className="f-label">Feedback</label>
            <textarea
              className="fp-input py-2.5 text-sm"
              rows={3}
              placeholder="Member's feedback…"
              value={text}
              onChange={(e) => setText(e.target.value)}
            />
          </div>
          <div className="col-span-2">
            <label className="flex items-center gap-2 text-xs c-dim cursor-pointer">
              <input
                type="checkbox"
                className="w-4 h-4 accent-[#D4AF37]"
                checked={resolved}
                onChange={(e) => setResolved(e.target.checked)}
              />
              Mark as resolved
            </label>
          </div>
        </div>
        <div className="flex gap-3 mt-5">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button type="button" className="btn-gold flex-1 py-2.5 text-sm" onClick={save}>
            Save Feedback
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeedbackEditModal;
