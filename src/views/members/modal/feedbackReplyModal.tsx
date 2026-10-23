import { useState } from "react";
import { Send } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { FeedbackEntry } from "../../../types/feedback";

/*
   Reply to Feedback — ported from #modal-reply in tailwind/src/feedback.html
   and openReply()/sendReply() in assets/js/feedback.js.

   Seeded from the entry on mount; the page keys this by entry id.
*/

type FeedbackReplyModalProps = {
  entry: FeedbackEntry | null;
  onClose: () => void;
  onSend: (entry: FeedbackEntry, text: string) => void;
};

const FeedbackReplyModal = ({ entry, onClose, onSend }: FeedbackReplyModalProps) => {
  const [text, setText] = useState(entry?.reply ?? "");

  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title="Reply to Feedback"
      boxClassName="glass"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className="p-3 rounded-xl mb-4 text-[13px] c-dim ctx-box">
        {entry ? `"${entry.text}" — ${entry.name}` : "—"}
      </div>
      <textarea
        className="fp-input py-2.5 text-sm"
        rows={4}
        placeholder="Write a response to the member…"
        value={text}
        onChange={(e) => setText(e.target.value)}
      />
      <div className="flex gap-3 mt-4">
        <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
          Cancel
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
          onClick={() => entry && onSend(entry, text.trim())}
        >
          <Send className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Send Reply
        </button>
      </div>
    </Modal>
  );
};

export default FeedbackReplyModal;
