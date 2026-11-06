import { useState } from "react";
import { Archive } from "lucide-react";
import type { Conversation } from "../../../../types/chat";
import { nameOf } from "../useChat";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Archive Chat — ported from #modal-archive in tailwind/src/chat.html and
   openArchive()/confirmArchive() in assets/js/chat.js.
*/

type ChatArchiveModalProps = {
  conversation: Conversation | null;
  onClose: () => void;
  onConfirm: (id: number, mute: boolean) => void;
};

const ChatArchiveModal = ({ conversation: c, onClose, onConfirm }: ChatArchiveModalProps) => {
  const open = c !== null;
  const [mute, setMute] = useState(c?.muted ?? false);

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
        <div className="confirm-ic warn">
          <Archive className="w-6 h-6 c-orange shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Archive Chat?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          <span className="font-semibold c-text">{c ? nameOf(c) : "This chat"}</span> moves to the
          Archived tab. Messages are kept, and a new message brings it back.
        </p>
        <label className="flex items-center gap-2.5 text-[13px] c-text2 cursor-pointer mb-5">
          <input
            type="checkbox"
            id="ar-mute"
            className="cbx"
            checked={mute}
            onChange={(e) => setMute(e.target.checked)}
          />
          Mute notifications too
        </label>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!c) return;
              onConfirm(c.id, mute);
              onClose();
            }}
          >
            <Archive className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Archive
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatArchiveModal;
