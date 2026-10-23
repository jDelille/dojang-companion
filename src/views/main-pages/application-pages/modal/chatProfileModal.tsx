import { Archive, Ban, Download, Flag, Pencil, Users, X } from "lucide-react";
import type { Conversation } from "../../../../types/chat";
import { person } from "../../../../utils/json/chatData";
import {
  avatarFor,
  fmtJoined,
  initials,
  isOnline,
  nameOf,
  roleOf,
} from "../useChat";

/*
   View Profile / Group Info — ported from #modal-profile in tailwind/src/chat.html
   and openProfile() in assets/js/chat.js. Details, status badge, block label and
   the Edit Group primary vary with the conversation type.
*/

type ChatProfileModalProps = {
  conversation: Conversation | null;
  onClose: () => void;
  onExport: () => void;
  onArchive: () => void;
  onReport: () => void;
  onBlock: () => void;
  onEditGroup: () => void;
};

const ChatProfileModal = ({
  conversation: c,
  onClose,
  onExport,
  onArchive,
  onReport,
  onBlock,
  onEditGroup,
}: ChatProfileModalProps) => {
  const open = c !== null;
  const group = c?.type === "group";
  const p = c && !group ? person(c.personId ?? -1) : null;

  const status = c?.blocked
    ? { cls: "badge badge-absent", label: "Blocked" }
    : c && isOnline(c)
      ? { cls: "badge badge-present", label: "Online" }
      : { cls: "badge badge-inactive", label: "Offline" };

  const row = (k: string, v: string | number) => (
    <div className="detail-row" key={k}>
      <span className="k">{k}</span>
      <span className="v">{v}</span>
    </div>
  );

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
          <h3 className="text-base font-black c-text">{group ? "Group Info" : "Profile"}</h3>
          <button type="button" className="hbtn" onClick={onClose} aria-label="Close">
            <X className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          </button>
        </div>

        <div className="gold-border-card p-4 mb-4">
          <div className="flex items-center gap-3">
            <div className={`conv-av av ${c ? avatarFor(c.id) : "av-gold"}`}>
              {group ? (
                <Users className="w-[16px] h-[16px] shrink-0" aria-hidden="true" />
              ) : c ? (
                initials(nameOf(c))
              ) : (
                "—"
              )}
            </div>
            <div className="flex-1 min-w-0">
              <div className="text-sm font-black c-text truncate">{c ? nameOf(c) : "—"}</div>
              <div className="text-[11px] c-dim">
                {group ? c?.about || "No description" : c ? roleOf(c) : "—"}
              </div>
            </div>
            <span className={status.cls}>
              <span className="dot" />
              {status.label}
            </span>
          </div>
        </div>

        <div className="mb-5">
          {group && c
            ? [
                row("Members", c.members.length),
                row("Online now", c.members.filter((i) => person(i)?.online).length),
                row("Messages", c.messages.length),
                row("Muted", c.muted ? "Yes" : "No"),
                row("Archived", c.archived ? "Yes" : "No"),
                <div className="detail-row" key="People">
                  <span className="k">People</span>
                  <span className="v">
                    {c.members
                      .map((i) => person(i)?.name)
                      .filter(Boolean)
                      .join(", ") || "—"}
                  </span>
                </div>,
              ]
            : c &&
              [
                row("Role", p?.role || "—"),
                row("Phone", p?.phone || "—"),
                row("Email", p?.email || "—"),
                row("Member since", p?.joined ? fmtJoined(p.joined) : "—"),
                row("Messages", c.messages.length),
                row("Muted", c.muted ? "Yes" : "No"),
              ]}
        </div>

        <div className="flex gap-2 mb-2">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onExport}
          >
            <Download className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Export
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2"
            onClick={onArchive}
          >
            <Archive className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Archive
          </button>
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2 danger-link"
            onClick={onReport}
          >
            <Flag className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Report
          </button>
        </div>
        <div className="flex gap-2">
          <button
            type="button"
            className="btn-ghost flex-1 py-2.5 text-sm flex items-center justify-center gap-2 danger-link"
            onClick={onBlock}
          >
            <Ban className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            <span>{c?.blocked ? "Unblock" : "Block"}</span>
          </button>
          <button
            type="button"
            className={`btn-gold flex-1 py-2.5 text-sm flex items-center justify-center gap-2${
              group ? "" : " hidden"
            }`}
            aria-label="Primary action"
            onClick={onEditGroup}
          >
            <Pencil className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
            Edit Group
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChatProfileModal;
