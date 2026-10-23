import { useState } from "react";
import { AlertCircle, Check, MessageCircle, X } from "lucide-react";
import { PEOPLE } from "../../../../utils/json/chatData";
import { avatarFor, initials } from "../useChat";

/*
   New Message — ported from #modal-new-chat in tailwind/src/chat.html and
   openNewChat()/confirmNewChat() in assets/js/chat.js.
*/

type ChatNewChatModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (personId: number) => void;
};

const ChatNewChatModal = ({ open, onClose, onConfirm }: ChatNewChatModalProps) => {
  const [query, setQuery] = useState("");
  const [pick, setPick] = useState<number | null>(null);
  const [err, setErr] = useState("");

  const q = query.trim().toLowerCase();
  const list = PEOPLE.filter(
    (p) => !q || p.name.toLowerCase().includes(q) || p.role.toLowerCase().includes(q),
  );

  const submit = () => {
    if (!pick) {
      setErr("Choose someone to message");
      return;
    }
    onConfirm(pick);
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
      <div className="modal-box glass modal-w-420">
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-base font-black c-text">New Message</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="mb-3">
          <label className="f-label" htmlFor="nc-search">
            To
          </label>
          <input
            type="text"
            id="nc-search"
            className="fp-input py-2.5 text-sm"
            placeholder="Search members, trainers or staff…"
            autoComplete="off"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
        </div>
        <div className="person-scroll mb-3" role="radiogroup" aria-label="People">
          {list.length ? (
            list.map((p) => {
              const on = pick === p.id;
              return (
                <button
                  key={p.id}
                  type="button"
                  className={`person-opt${on ? " sel" : ""}`}
                  role="radio"
                  aria-checked={on}
                  onClick={() => {
                    setPick(p.id);
                    setErr("");
                  }}
                >
                  <span className={`p-av av ${avatarFor(p.id)}`}>
                    {initials(p.name)}
                    {p.online && <span className="online-dot" />}
                  </span>
                  <span className="flex-1 min-w-0">
                    <span className="block text-[13px] font-semibold c-text truncate">
                      {p.name}
                    </span>
                    <span className="block text-[11px] c-dim truncate">{p.role}</span>
                  </span>
                  <Check
                    className={`w-[15px] h-[15px] c-gold shrink-0${on ? "" : " opacity-0"}`}
                    aria-hidden="true"
                  />
                </button>
              );
            })
          ) : (
            <div className="text-xs c-dim text-center py-6">No people match “{query}”</div>
          )}
        </div>
        <div className={`f-error mb-3${err ? " show" : ""}`}>
          <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
          <span>{err}</span>
        </div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={submit}
          >
            <MessageCircle className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Start Chat
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatNewChatModal;
