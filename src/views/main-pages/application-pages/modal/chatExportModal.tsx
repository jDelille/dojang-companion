import { useState } from "react";
import { Check, Download, X } from "lucide-react";
import type { Conversation, ExportFormat } from "../../../../types/chat";
import { EX_FORMATS, TODAY } from "../../../../utils/json/chatData";
import { CHAT_ICON, CHAT_ICON_FALLBACK } from "../chatIcons";
import { nameOf } from "../useChat";

/*
   Export Chat — ported from #modal-export in tailwind/src/chat.html and
   openExport()/confirmExport() in assets/js/chat.js.
*/

const slugify = (s: string) =>
  s.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-|-$/g, "");

type ChatExportModalProps = {
  conversation: Conversation | null;
  onClose: () => void;
  onConfirm: (id: number, format: ExportFormat) => void;
};

const ChatExportModal = ({ conversation: c, onClose, onConfirm }: ChatExportModalProps) => {
  const open = c !== null;
  const [format, setFormat] = useState<ExportFormat>("txt");

  const count = c?.messages.length ?? 0;
  const context = c ? nameOf(c) + " · " + count + " messages" : "Chat";
  const f = EX_FORMATS.find((x) => x.id === format);
  const slug = c ? slugify(nameOf(c)) : "";
  const summary = c
    ? count +
      " message" +
      (count === 1 ? "" : "s") +
      " · " +
      (f?.label ?? "") +
      (format === "print"
        ? " · opens your print dialog"
        : " · chat-" + slug + "-" + TODAY + "." + format)
    : "—";

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
          <h3 className="text-base font-black c-text">Export Chat</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>
        <div className="ctx-box mb-4">{context}</div>
        <div className="mb-4">
          <span className="f-label">Format</span>
          <div className="space-y-2" role="radiogroup" aria-label="Export format">
            {EX_FORMATS.map((o) => {
              const Icon = CHAT_ICON[o.ic] ?? CHAT_ICON_FALLBACK;
              const sel = o.id === format;
              return (
                <button
                  key={o.id}
                  type="button"
                  className={`opt-card${sel ? " sel" : ""}`}
                  role="radio"
                  aria-checked={sel}
                  onClick={() => setFormat(o.id)}
                >
                  <span className={`opt-ic ${o.tint}`}>
                    <Icon className={`w-[15px] h-[15px] ${o.col} shrink-0`} aria-hidden="true" />
                  </span>
                  <span className="flex-1">
                    <span className="block text-[13px] font-bold c-text">{o.label}</span>
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
        </div>
        <div className="ctx-box mb-5">{summary}</div>
        <div className="flex gap-3">
          <button type="button" className="btn-ghost flex-1 py-2.5 text-sm" onClick={onClose}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={() => {
              if (!c) return;
              onConfirm(c.id, format);
              onClose();
            }}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Download
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatExportModal;
