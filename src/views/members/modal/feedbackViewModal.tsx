import { Check, CheckCircle2, Clock, Reply, Tag, User, UserPlus } from "lucide-react";
import Modal from "../../../components/common/Modal";
import type { FeedbackEntry } from "../../../types/feedback";
import { FEEDBACK_TYPE_META } from "../../../utils/json/feedbackData";
import { initials } from "../../../utils/formatUtils";
import leadAvatar from "../leadAvatar";
import Stars from "../stars";
import FEEDBACK_TYPE_ICON from "../feedbackTypeIcon";

/*
   Feedback Details — ported from #modal-view in tailwind/src/feedback.html
   and openView() in assets/js/feedback.js.
*/

type FeedbackViewModalProps = {
  entry: FeedbackEntry | null;
  onClose: () => void;
  onReply: (entry: FeedbackEntry) => void;
  onAssign: (entry: FeedbackEntry) => void;
  onResolve: (entry: FeedbackEntry) => void;
};

const FeedbackViewModal = ({
  entry,
  onClose,
  onReply,
  onAssign,
  onResolve,
}: FeedbackViewModalProps) => {
  const meta = entry ? FEEDBACK_TYPE_META[entry.type] : null;
  const TypeIcon = entry ? FEEDBACK_TYPE_ICON[entry.type] : null;

  return (
    <Modal
      open={entry !== null}
      onClose={onClose}
      title="Feedback Details"
      boxClassName="glass modal-w-480"
      titleClassName="text-base"
      headerClassName="mb-4"
    >
      <div className="gold-border-card p-4 mb-4">
        <div className="flex items-center gap-3 mb-3">
          <div className={`fb-av av ${entry ? leadAvatar(entry.id) : "av-gold"}`}>
            {entry ? initials(entry.name) : "--"}
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-sm font-black c-text">{entry?.name ?? "—"}</div>
            <div className="text-[11px] c-dim">
              {/* "Reviews" -> "Review", as the template stripped the plural. */}
              {entry ? `${entry.type.replace(/s$/, "")} · ${entry.when}` : "—"}
            </div>
          </div>
          <span className={`badge ${meta?.badge ?? "badge-present"}`}>
            {TypeIcon && <TypeIcon className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />}
            {meta?.label ?? "—"}
          </span>
        </div>
        <div className="flex items-center gap-0.5 mb-2">
          {entry && entry.rating > 0 && <Stars value={entry.rating} size={14} />}
        </div>
        <p className="text-[13px] c-dim leading-relaxed">{entry?.text ?? ""}</p>
        <div className="flex items-center gap-2 mt-3">
          <span className="topic-pill">
            <Tag className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
            {entry?.topic ?? "—"}
          </span>
          <span className={`topic-pill ${entry?.resolved ? "tp-green" : "tp-orange"}`}>
            {entry?.resolved ? (
              <CheckCircle2 className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
            ) : (
              <Clock className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
            )}
            {entry?.resolved ? "Resolved" : "Open"}
          </span>
          {entry?.assignee && (
            <span className="topic-pill">
              <User className="w-[10px] h-[10px] shrink-0" aria-hidden="true" />
              {entry.assignee}
            </span>
          )}
        </div>
        {entry?.reply && (
          <div className="reply-box">
            <div className="text-[10px] font-black uppercase tracking-wider c-gold mb-1">
              Staff Reply
            </div>
            <div className="text-[12px] c-text2">{entry.reply}</div>
          </div>
        )}
      </div>
      <div className="flex gap-2">
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => entry && onReply(entry)}
        >
          <Reply className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Reply
        </button>
        <button
          type="button"
          className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => entry && onAssign(entry)}
        >
          <UserPlus className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Assign
        </button>
        <button
          type="button"
          className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-1.5"
          onClick={() => entry && onResolve(entry)}
        >
          <Check className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
          Resolve
        </button>
      </div>
    </Modal>
  );
};

export default FeedbackViewModal;
