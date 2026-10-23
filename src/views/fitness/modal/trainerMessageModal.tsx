import { useState } from "react";
import { X } from "lucide-react";
import type { Trainer } from "../../../types/trainers";
import { fullName } from "../useTrainers";

/*
   Send Message — ported from #modal-message in tailwind/src/trainers.html and
   openMessage()/confirmMessage() in assets/js/trainers.js. The context line
   prefers the trainer's email and falls back to the phone number.
*/

type TrainerMessageModalProps = {
  trainer: Trainer | null;
  onClose: () => void;
  /** Returns true when the message was sent, so the modal can close. */
  onConfirm: (id: number, text: string) => boolean;
};

const TrainerMessageModal = ({ trainer, onClose, onConfirm }: TrainerMessageModalProps) => {
  const open = trainer !== null;
  const [text, setText] = useState("");

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
      <div className="modal-box">
        <div className="flex items-center justify-between mb-4">
          <h3 className="font-black c-text text-lg">Send Message</h3>
          <button type="button" className="modal-x" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">
          {trainer
            ? "To: " + fullName(trainer) + " · " + (trainer.email || trainer.phone)
            : "To: Trainer"}
        </div>
        <div>
          <label className="f-label">Message</label>
          <textarea
            className="fp-input"
            rows={4}
            placeholder="Type your message…"
            value={text}
            onChange={(e) => setText(e.target.value)}
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
              if (!trainer) return;
              if (onConfirm(trainer.id, text)) onClose();
            }}
          >
            Send
          </button>
        </div>
      </div>
    </div>
  );
};

export default TrainerMessageModal;
