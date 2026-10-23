import { Phone, PhoneCall } from "lucide-react";
import type { Conversation } from "../../../../types/chat";
import { person } from "../../../../utils/json/chatData";
import { nameOf } from "../useChat";

/*
   Start Call — ported from #modal-call in tailwind/src/chat.html and
   openCall()/confirmCall() in assets/js/chat.js.
*/

type ChatCallModalProps = {
  conversation: Conversation | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ChatCallModal = ({ conversation: c, onClose, onConfirm }: ChatCallModalProps) => {
  const open = c !== null;
  const p = c ? person(c.personId ?? -1) : null;

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
      <div className="modal-box glass modal-w-380">
        <div className="confirm-ic warn">
          <PhoneCall className="w-6 h-6 c-gold shrink-0" aria-hidden="true" />
        </div>
        <h3 className="text-base font-black c-text text-center mb-1">Start Call?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          Place a voice call to{" "}
          <span className="font-semibold c-text">{c ? nameOf(c) : "this contact"}</span>.
        </p>
        <div className="ctx-box mb-5">
          {p ? (p.phone || "—") + " · " + (p.online ? "Online now" : "Currently offline") : "—"}
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!c) return;
              onConfirm(c.id);
              onClose();
            }}
          >
            <Phone className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Call
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatCallModal;
