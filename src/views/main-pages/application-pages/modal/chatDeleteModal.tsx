import { Trash2 } from "lucide-react";
import type { Conversation } from "../../../../types/chat";
import { nameOf } from "../useChat";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Delete Chat — ported from #modal-delete in tailwind/src/chat.html and
   openDelete()/confirmDelete() in assets/js/chat.js.
*/

type ChatDeleteModalProps = {
  conversation: Conversation | null;
  onClose: () => void;
  onConfirm: (id: number) => void;
};

const ChatDeleteModal = ({ conversation: c, onClose, onConfirm }: ChatDeleteModalProps) => {
  const open = c !== null;
  const count = c?.messages.length ?? 0;

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
          <Trash2 className="w-6 h-6 c-red shrink-0" aria-hidden="true" />
        </div>
        <DialogEyebrow />
        <h3 className="text-base font-black c-text text-center mb-1">Delete Chat?</h3>
        <p className="text-sm text-center mb-4 c-dim">
          Permanently delete{" "}
          <span className="font-semibold c-text">{c ? nameOf(c) : "this chat"}</span> and all of its
          messages. This cannot be undone.
        </p>
        <div className="ctx-box mb-5">
          <span className="c-orange font-semibold">
            {count} message{count === 1 ? "" : "s"}
          </span>{" "}
          will be removed from your history.
          {c?.type === "group" ? " Other members keep their copy of this group." : ""}
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
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatDeleteModal;
