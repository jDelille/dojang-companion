import { useEffect, useRef, useState } from "react";
import {
  Archive,
  Ban,
  Bell,
  BellOff,
  Download,
  Flag,
  Info,
  Mail,
  MessageCircle,
  MoreVertical,
  Paperclip,
  Pencil,
  Phone,
  Pin,
  Search,
  Send,
  Trash2,
  User,
  Users,
  X,
} from "lucide-react";
import type { Conversation } from "../../../types/chat";
import { CHAT_ICON, CHAT_ICON_FALLBACK } from "./chatIcons";
import RowMenu from "../../../components/common/rowMenu";
import Toast from "../../../components/common/Toast";
import useChat, {
  avatarFor,
  dayLabel,
  datePart,
  fmtTime,
  initials,
  isOnline,
  lastLine,
  listStamp,
  nameOf,
  roleOf,
  senderName,
  timePart,
} from "./useChat";
import ChatNewChatModal from "./modal/chatNewChatModal";
import ChatGroupModal from "./modal/chatGroupModal";
import ChatProfileModal from "./modal/chatProfileModal";
import ChatArchiveModal from "./modal/chatArchiveModal";
import ChatBlockModal from "./modal/chatBlockModal";
import ChatReportModal from "./modal/chatReportModal";
import ChatAttachModal from "./modal/chatAttachModal";
import ChatCallModal from "./modal/chatCallModal";
import ChatExportModal from "./modal/chatExportModal";
import ChatDeleteModal from "./modal/chatDeleteModal";

/*
   Chat — ported from tailwind/src/chat.html and assets/js/chat.js. Conversation
   list (DMs + groups) with search, filter tabs and per-chat action menu, a
   message thread with real timestamps and a composer, plus the full modal suite:
   New Chat · New Group · Profile / Group Info · Archive · Block · Report ·
   Attach · Call · Export · Delete.
*/

const TABS = ["All", "Unread", "Groups", "Archived"] as const;

type ModalKind =
  | "new-chat"
  | "group"
  | "profile"
  | "archive"
  | "block"
  | "report"
  | "attach"
  | "call"
  | "export"
  | "delete";

const Chat = () => {
  const page = useChat();
  const { active, activeId, search, tab, filtered, counts, pendingAttach } = page;

  const [modal, setModal] = useState<ModalKind | null>(null);
  const [targetId, setTargetId] = useState<number | null>(null);
  const [draft, setDraft] = useState("");
  const msgsRef = useRef<HTMLDivElement>(null);

  const target = targetId != null ? page.byId(targetId) : null;

  const open = (kind: ModalKind, id: number | null) => {
    setTargetId(id);
    setModal(kind);
  };
  const close = () => setModal(null);

  /* Scroll the message list to the bottom whenever the active thread changes. */
  useEffect(() => {
    const el = msgsRef.current;
    if (el) el.scrollTop = el.scrollHeight;
  }, [active?.id, active?.messages.length, pendingAttach]);

  const doSend = () => {
    page.send(draft);
    setDraft("");
  };

  const menuFor = (c: Conversation) => (
    <RowMenu
      triggerClassName="conv-menu-btn"
      triggerTitle="More actions"
      trigger={<MoreVertical className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />}
    >
      <button
        type="button"
        className="dropdown-item"
        onClick={() => open("profile", c.id)}
      >
        {c.type === "group" ? (
          <Users className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        ) : (
          <User className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        )}
        {c.type === "group" ? "Group Info" : "View Profile"}
      </button>
      {c.type === "group" && (
        <button type="button" className="dropdown-item" onClick={() => open("group", c.id)}>
          <Pencil className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          Edit Group
        </button>
      )}
      <button type="button" className="dropdown-item" onClick={() => page.togglePin(c.id)}>
        <Pin className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        {c.pinned ? "Unpin Chat" : "Pin Chat"}
      </button>
      <button type="button" className="dropdown-item" onClick={() => page.toggleMute(c.id)}>
        {c.muted ? (
          <Bell className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        ) : (
          <BellOff className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        )}
        {c.muted ? "Unmute" : "Mute Notifications"}
      </button>
      <button type="button" className="dropdown-item" onClick={() => page.toggleUnread(c.id)}>
        <Mail className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        {c.unread ? "Mark as Read" : "Mark as Unread"}
      </button>
      <div className="menu-sep" />
      <button type="button" className="dropdown-item" onClick={() => open("export", c.id)}>
        <Download className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Export Chat
      </button>
      <button
        type="button"
        className="dropdown-item"
        onClick={() => (c.archived ? page.unarchive(c.id) : open("archive", c.id))}
      >
        <Archive className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        {c.archived ? "Unarchive" : "Archive Chat"}
      </button>
      <div className="menu-sep" />
      {c.type === "dm" && (
        <button
          type="button"
          className="dropdown-item danger"
          onClick={() => (c.blocked ? page.unblock(c.id) : open("block", c.id))}
        >
          <Ban className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
          {c.blocked ? "Unblock Contact" : "Block Contact"}
        </button>
      )}
      <button type="button" className="dropdown-item danger" onClick={() => open("report", c.id)}>
        <Flag className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Report
      </button>
      <button type="button" className="dropdown-item danger" onClick={() => open("delete", c.id)}>
        <Trash2 className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
        Delete Chat
      </button>
    </RowMenu>
  );

  return (
    <>
      {/* Page header */}
      <div className="flex md:items-center justify-between flex-wrap xl:flex-nowrap gap-4 mb-5">
        <div>
          <h2 className="text-xl font-black c-text">Chat</h2>
          <p className="text-sm mt-0.5 c-dim">Message members, trainers &amp; staff · Austin HQ</p>
        </div>
        <div className="flex items-center flex-wrap gap-2">
          <button
            type="button"
            className="btn-ghost flex items-center gap-2 px-3.5 py-2 text-sm"
            onClick={() => open("group", null)}
          >
            <Users className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            New Group
          </button>
          <button
            type="button"
            className="btn-gold flex items-center gap-2 px-4 py-2.5 text-sm"
            onClick={() => open("new-chat", null)}
          >
            <Pencil className="w-[14px] h-[14px] shrink-0" aria-hidden="true" />
            New Message
          </button>
        </div>
      </div>

      <div className="chat-shell">
        {/* Conversations */}
        <div className="conv-list">
          <div className="conv-head">
            <div className="relative">
              <Search
                className="search-icon absolute left-3 top-1/2 -translate-y-1/2 w-[14px] h-[14px] shrink-0"
                aria-hidden="true"
              />
              <input
                type="text"
                id="conv-search"
                className="fp-input pl-9 pr-9 py-2 text-sm"
                placeholder="Search chats or messages…"
                aria-label="Search conversations"
                value={search}
                onChange={(e) => page.setSearch(e.target.value)}
              />
              <button
                type="button"
                className={`icon-btn absolute right-2 top-1/2 -translate-y-1/2${
                  search ? "" : " hidden"
                }`}
                aria-label="Clear search"
                onClick={() => page.setSearch("")}
              >
                <X className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
              </button>
            </div>
            <div className="chat-tabs" role="tablist" aria-label="Filter conversations">
              {TABS.map((t) => (
                <button
                  key={t}
                  type="button"
                  className={t === tab ? "chat-tab active" : "chat-tab"}
                  role="tab"
                  aria-selected={t === tab}
                  onClick={() => page.setTab(t)}
                >
                  {t}
                  <span className="tab-count">{counts[t]}</span>
                </button>
              ))}
            </div>
          </div>
          <div className="conv-scroll" role="listbox" aria-label="Conversations">
            {filtered.length ? (
              filtered.map((c) => {
                const m = c.messages[c.messages.length - 1] || null;
                return (
                  <div
                    key={c.id}
                    className={`conv${c.id === activeId ? " active" : ""}`}
                    role="option"
                    tabIndex={0}
                    aria-selected={c.id === activeId}
                    aria-label={nameOf(c)}
                    onClick={() => page.setActiveId(c.id)}
                  >
                    <div className={`conv-av av ${avatarFor(c.id)}`}>
                      {c.type === "group" ? (
                        <Users className="w-[16px] h-[16px] shrink-0" aria-hidden="true" />
                      ) : (
                        initials(nameOf(c))
                      )}
                      {isOnline(c) && !c.blocked && <span className="online-dot" />}
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between gap-2">
                        <span className="text-[13px] font-bold c-text truncate">{nameOf(c)}</span>
                        <span className="text-[10px] c-dim2 shrink-0">
                          {m ? listStamp(m.at) : ""}
                        </span>
                      </div>
                      <div className="flex items-center justify-between gap-2 mt-0.5">
                        <span className="text-[11px] c-dim truncate">{lastLine(c)}</span>
                        <span className="conv-flags">
                          {c.pinned && (
                            <Pin className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                          )}
                          {c.muted && (
                            <BellOff className="w-[11px] h-[11px] shrink-0" aria-hidden="true" />
                          )}
                          {c.blocked && (
                            <Ban className="w-[11px] h-[11px] c-red shrink-0" aria-hidden="true" />
                          )}
                          {c.unread > 0 && !c.muted && (
                            <span className="unread-badge">{c.unread}</span>
                          )}
                        </span>
                      </div>
                    </div>
                    {menuFor(c)}
                  </div>
                );
              })
            ) : (
              <div className="conv-empty">
                <div className="text-[26px] opacity-30 mb-2">💬</div>
                <div className="text-xs font-bold c-text">No conversations</div>
                <div className="text-[11px] mt-1 c-dim">
                  {search ? "Nothing matches that search" : "Nothing in this tab yet"}
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Thread */}
        <div className="thread">
          {!active ? (
            <div className="empty-thread">
              <MessageCircle className="empty-ic shrink-0" aria-hidden="true" />
              <div className="text-sm font-bold">Select a conversation</div>
              <div className="text-xs mt-1">Pick a chat from the list, or start a new one</div>
              <button
                type="button"
                className="btn-ghost mt-4 px-3.5 py-2 text-xs"
                onClick={() => open("new-chat", null)}
              >
                New Message
              </button>
            </div>
          ) : (
            <>
              <div className="thread-head">
                <div className={`conv-av conv-av-sm av ${avatarFor(active.id)}`}>
                  {active.type === "group" ? (
                    <Users className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                  ) : (
                    initials(nameOf(active))
                  )}
                  {isOnline(active) && !active.blocked && <span className="online-dot" />}
                </div>
                <button
                  type="button"
                  className="thread-id"
                  aria-label={`View details for ${nameOf(active)}`}
                  onClick={() => open("profile", active.id)}
                >
                  <div className="th-name">{nameOf(active)}</div>
                  <div
                    className={`th-sub ${
                      active.blocked ? "c-red" : isOnline(active) ? "c-green" : "c-dim"
                    }`}
                  >
                    {active.blocked
                      ? "Blocked"
                      : active.type === "group"
                        ? roleOf(active)
                        : (isOnline(active) ? "Online" : "Offline") + " · " + roleOf(active)}
                  </div>
                </button>
                {active.type === "dm" && (
                  <button
                    type="button"
                    className="hbtn"
                    title="Call"
                    aria-label={`Call ${nameOf(active)}`}
                    onClick={() => open("call", active.id)}
                  >
                    <Phone className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                  </button>
                )}
                <button
                  type="button"
                  className="hbtn"
                  title="Info"
                  aria-label="Conversation details"
                  onClick={() => open("profile", active.id)}
                >
                  <Info className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                </button>
                {menuFor(active)}
              </div>

              <div className="msgs" id="msgs" ref={msgsRef}>
                {(() => {
                  let lastDate: string | null = null;
                  return active.messages.map((m, i) => {
                    const d = datePart(m.at);
                    const sep = d !== lastDate;
                    if (sep) lastDate = d;
                    const out = m.from === "me";
                    const prev = i > 0 ? active.messages[i - 1] : null;
                    const showSender =
                      active.type === "group" && !out && (!prev || prev.from !== m.from);
                    const Icon = m.attachment
                      ? CHAT_ICON[m.attachment.icon] ?? CHAT_ICON_FALLBACK
                      : null;
                    return (
                      <div key={m.id}>
                        {sep && <div className="day-sep">{dayLabel(d)}</div>}
                        <div className={`bubble ${out ? "b-out" : "b-in"}`}>
                          {showSender && <div className="b-sender">{senderName(m.from)}</div>}
                          {m.attachment && Icon ? (
                            <span className="flex items-center gap-2">
                              <Icon
                                className="w-[13px] h-[13px] shrink-0"
                                aria-hidden="true"
                              />
                              {m.attachment.name}
                            </span>
                          ) : (
                            m.text
                          )}
                          <div className="t">
                            {fmtTime(timePart(m.at))}
                            {out && (
                              <span className={`tick${m.status === "read" ? " tick-read" : ""}`}>
                                {m.status === "sent" ? "✓" : "✓✓"}
                              </span>
                            )}
                          </div>
                        </div>
                      </div>
                    );
                  });
                })()}
              </div>

              {pendingAttach && (
                <div className="att-chip">
                  {(() => {
                    const Icon = CHAT_ICON[pendingAttach.icon] ?? CHAT_ICON_FALLBACK;
                    return <Icon className="w-[13px] h-[13px] c-gold shrink-0" aria-hidden="true" />;
                  })()}
                  {pendingAttach.name}
                  <button
                    type="button"
                    className="att-x"
                    aria-label="Remove attachment"
                    onClick={page.dropAttach}
                  >
                    <X className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                  </button>
                </div>
              )}

              {active.blocked ? (
                <div className="blocked-bar">
                  <Ban className="w-[13px] h-[13px] shrink-0" aria-hidden="true" />
                  You blocked {nameOf(active)} ·{" "}
                  <button
                    type="button"
                    className="menu-link"
                    onClick={() => page.unblock(active.id)}
                  >
                    Unblock to message
                  </button>
                </div>
              ) : (
                <div className="composer">
                  <button
                    type="button"
                    className="hbtn"
                    title="Attach"
                    aria-label="Attach a file"
                    onClick={() => open("attach", null)}
                  >
                    <Paperclip className="w-[15px] h-[15px] shrink-0" aria-hidden="true" />
                  </button>
                  <input
                    id="msg-input"
                    placeholder="Type a message…"
                    autoComplete="off"
                    aria-label="Message"
                    value={draft}
                    onChange={(e) => setDraft(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        doSend();
                      }
                    }}
                  />
                  <button
                    type="button"
                    className="send-btn"
                    id="send-btn"
                    title="Send"
                    aria-label="Send message"
                    disabled={!draft.trim() && !pendingAttach}
                    onClick={doSend}
                  >
                    <Send className="send-ic shrink-0" aria-hidden="true" />
                  </button>
                </div>
              )}
            </>
          )}
        </div>
      </div>

      {/* ══════════════ MODALS ══════════════ */}
      <ChatNewChatModal
        key={modal === "new-chat" ? "new-chat-open" : "new-chat-closed"}
        open={modal === "new-chat"}
        onClose={close}
        onConfirm={page.startNewChat}
      />
      <ChatGroupModal
        key={`group-${target?.id ?? "new"}`}
        open={modal === "group"}
        target={modal === "group" ? target : null}
        allGroups={page.convos}
        onClose={close}
        onSubmit={page.saveGroup}
      />
      <ChatProfileModal
        conversation={modal === "profile" ? target : null}
        onClose={close}
        onExport={() => setModal("export")}
        onArchive={() => {
          if (target?.archived) {
            page.unarchive(target.id);
            close();
          } else {
            setModal("archive");
          }
        }}
        onReport={() => setModal("report")}
        onBlock={() => {
          if (target?.blocked) {
            page.unblock(target.id);
            close();
          } else {
            setModal("block");
          }
        }}
        onEditGroup={() => setModal("group")}
      />
      <ChatArchiveModal
        key={`archive-${target?.id ?? "none"}`}
        conversation={modal === "archive" ? target : null}
        onClose={close}
        onConfirm={page.confirmArchive}
      />
      <ChatBlockModal
        conversation={modal === "block" ? target : null}
        onClose={close}
        onConfirm={page.confirmBlock}
      />
      <ChatReportModal
        key={`report-${target?.id ?? "none"}`}
        conversation={modal === "report" ? target : null}
        onClose={close}
        onConfirm={page.submitReport}
      />
      <ChatAttachModal
        key={modal === "attach" ? "attach-open" : "attach-closed"}
        open={modal === "attach"}
        onClose={close}
        onConfirm={page.confirmAttach}
      />
      <ChatCallModal
        conversation={modal === "call" ? target : null}
        onClose={close}
        onConfirm={page.confirmCall}
      />
      <ChatExportModal
        key={`export-${target?.id ?? "none"}`}
        conversation={modal === "export" ? target : null}
        onClose={close}
        onConfirm={page.confirmExport}
      />
      <ChatDeleteModal
        conversation={modal === "delete" ? target : null}
        onClose={close}
        onConfirm={page.confirmDelete}
      />

      <Toast message={page.toast.message} visible={page.toast.visible} />
    </>
  );
};

export default Chat;
