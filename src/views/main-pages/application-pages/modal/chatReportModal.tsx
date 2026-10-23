import { useState } from "react";
import { AlertCircle, Check, Flag, X } from "lucide-react";
import type { Conversation } from "../../../../types/chat";
import { REPORT_REASONS } from "../../../../utils/json/chatData";
import { CHAT_ICON, CHAT_ICON_FALLBACK } from "../chatIcons";
import { nameOf, roleOf } from "../useChat";

/*
   Report Conversation — ported from #modal-report in tailwind/src/chat.html and
   openReport()/submitReport() in assets/js/chat.js.
*/

type ChatReportModalProps = {
  conversation: Conversation | null;
  onClose: () => void;
  onConfirm: (id: number, reason: string, alsoBlock: boolean) => void;
};

const ChatReportModal = ({ conversation: c, onClose, onConfirm }: ChatReportModalProps) => {
  const open = c !== null;
  const [reason, setReason] = useState<string | null>(null);
  const [details, setDetails] = useState("");
  const [alsoBlock, setAlsoBlock] = useState(false);
  const [reasonErr, setReasonErr] = useState("");
  const [detailsErr, setDetailsErr] = useState("");

  const context = c
    ? nameOf(c) + " · " + c.messages.length + " messages · " + (c.type === "group" ? "Group" : roleOf(c))
    : "Chat";

  const submit = () => {
    let ok = true;
    if (!reason) {
      setReasonErr("Choose a reason");
      ok = false;
    } else setReasonErr("");
    const d = details.trim();
    if (reason === "Other" && d.length < 10) {
      setDetailsErr("Please describe the issue (at least 10 characters)");
      ok = false;
    } else if (d.length > 0 && d.length < 5) {
      setDetailsErr("Add a little more detail");
      ok = false;
    } else setDetailsErr("");

    if (!ok || !c || !reason) return;
    onConfirm(c.id, reason, alsoBlock && c.type === "dm");
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
      <div className="modal-box glass modal-w-460">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">Report Conversation</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">{context}</div>
        <form
          className="space-y-4"
          noValidate
          onSubmit={(e) => {
            e.preventDefault();
            submit();
          }}
        >
          <div>
            <span className="f-label">Reason</span>
            <div className="space-y-2" role="radiogroup" aria-label="Report reason">
              {REPORT_REASONS.map((o) => {
                const Icon = CHAT_ICON[o.ic] ?? CHAT_ICON_FALLBACK;
                const sel = o.id === reason;
                return (
                  <button
                    key={o.id}
                    type="button"
                    className={`opt-card${sel ? " sel" : ""}`}
                    role="radio"
                    aria-checked={sel}
                    onClick={() => {
                      setReason(o.id);
                      setReasonErr("");
                    }}
                  >
                    <span className={`opt-ic ${o.tint}`}>
                      <Icon className={`w-[15px] h-[15px] ${o.col} shrink-0`} aria-hidden="true" />
                    </span>
                    <span className="flex-1">
                      <span className="block text-[13px] font-bold c-text">{o.id}</span>
                      <span className="block text-[11px] c-dim">{o.hint}</span>
                    </span>
                    <Check
                      className={`w-[15px] h-[15px] c-gold shrink-0${sel ? "" : " opacity-0"}`}
                      aria-hidden="true"
                    />
                  </button>
                );
              })}
            </div>
            <div className={`f-error${reasonErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{reasonErr}</span>
            </div>
          </div>
          <div>
            <label className="f-label" htmlFor="rp-details">
              Details
            </label>
            <textarea
              id="rp-details"
              className="fp-input py-2.5 text-sm"
              rows={3}
              placeholder="Add anything that helps the admin team review this…"
              value={details}
              onChange={(e) => setDetails(e.target.value)}
            />
            <div className={`f-error${detailsErr ? " show" : ""}`}>
              <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
              <span>{detailsErr}</span>
            </div>
          </div>
          <label
            className={`flex items-center gap-2.5 text-[13px] c-text2 cursor-pointer${
              c?.type === "dm" ? "" : " hidden"
            }`}
          >
            <input
              type="checkbox"
              id="rp-block"
              className="cbx"
              checked={alsoBlock}
              onChange={(e) => setAlsoBlock(e.target.checked)}
            />
            Also block this contact
          </label>
          <div className="flex gap-3 pt-1">
            <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
              Cancel
            </button>
            <button
              type="submit"
              className="btn-danger flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            >
              <Flag className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              Submit Report
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default ChatReportModal;
