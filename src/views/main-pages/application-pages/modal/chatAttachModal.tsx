import { useState } from "react";
import { AlertCircle, Check, Paperclip, X } from "lucide-react";
import { ATTACH_KINDS } from "../../../../utils/json/chatData";
import { CHAT_ICON, CHAT_ICON_FALLBACK } from "../chatIcons";
import DialogEyebrow from "@/components/common/DialogEyebrow";

/*
   Attach — ported from #modal-attach in tailwind/src/chat.html and
   openAttach()/confirmAttach() in assets/js/chat.js.
*/

type ChatAttachModalProps = {
  open: boolean;
  onClose: () => void;
  onConfirm: (kind: string, name: string, icon: string) => void;
};

const ChatAttachModal = ({ open, onClose, onConfirm }: ChatAttachModalProps) => {
  const [kind, setKind] = useState("Document");
  const [name, setName] = useState("");
  const [err, setErr] = useState("");

  const active = ATTACH_KINDS.find((k) => k.id === kind) ?? ATTACH_KINDS[0];

  const submit = () => {
    const n = name.trim();
    if (!n) {
      setErr("Enter a file name");
      return;
    }
    if (n.length < 3) {
      setErr("File name is too short");
      return;
    }
    onConfirm(kind, n, active.ic);
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
          <div className="min-w-0">
            <DialogEyebrow />
            <h3 className="text-base font-black c-text">Attach</h3>
          </div>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="space-y-2 mb-4" role="radiogroup" aria-label="Attachment type">
          {ATTACH_KINDS.map((o) => {
            const Icon = CHAT_ICON[o.ic] ?? CHAT_ICON_FALLBACK;
            const sel = o.id === kind;
            return (
              <button
                key={o.id}
                type="button"
                className={`opt-card${sel ? " sel" : ""}`}
                role="radio"
                aria-checked={sel}
                onClick={() => setKind(o.id)}
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
        <div className="mb-5">
          <label className="f-label" htmlFor="at-name">
            File name
          </label>
          <input
            type="text"
            id="at-name"
            className="fp-input py-2.5 text-sm"
            placeholder={"e.g. " + active.ph}
            autoComplete="off"
            value={name}
            onChange={(e) => setName(e.target.value)}
          />
          <div className={`f-error${err ? " show" : ""}`}>
            <AlertCircle className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
            <span>{err}</span>
          </div>
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
            <Paperclip className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Attach
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatAttachModal;
