import { Ban } from "lucide-react";
import type { Conversation } from "../../../../types/chat";
import { nameOf } from "../useChat";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Block Contact — ported from #modal-block in tailwind/src/chat.html and
   openBlock()/confirmBlock() in assets/js/chat.js.
*/

type ChatBlockModalProps = {
  conversation: Conversation | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ChatBlockModal = ({ conversation: c, onClose, onConfirm }: ChatBlockModalProps) => {
  const open = c !== null;

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
        <div className="confirm-ic danger">
          <Ban className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Block Contact?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          <span className="font-semibold c-text">{c ? nameOf(c) : "This contact"}</span> will not be
          able to message you, and you cannot send to them until you unblock.
        </p>
        <div className="ctx-box mb-5">
          Existing messages stay in your history. You can unblock at any time from the chat menu.
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-danger flex-1 py-2.5 text-sm"
            onClick={() => {
              if (!c) return;
              onConfirm(c.id);
              onClose();
            }}
          >
            Block
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatBlockModal;
