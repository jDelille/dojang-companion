import { useCallback, useMemo, useRef, useState } from "react";
import type {
  Attachment,
  ChatMessage,
  ChatTab,
  Conversation,
} from "../../../types/chat";
import {
  CONVERSATIONS,
  DOW_SHORT,
  MON_SHORT,
  NOW,
  TODAY,
  person,
} from "../../../utils/json/chatData";
import useToast from "../../../hooks/useToast";

/*
   Chat state — ported from tailwind/src/assets/js/chat.js. Owns the conversation
   list, the active conversation id, the search query, the filter tab, the
   composer text and pending attachment, and drives send + the simulated reply.
   Every mutation reproduces the exact toast() string from the template.
*/

const AV = ["av-gold", "av-purple", "av-orange", "av-cyan", "av-green", "av-red"];

export const initials = (n: string): string =>
  String(n || "")
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0])
    .join("")
    .toUpperCase();

export const avatarFor = (id: number): string => AV[id % AV.length];

export const datePart = (at: string): string => String(at).split("T")[0];
export const timePart = (at: string): string => String(at).split("T")[1] || "00:00";

export function fmtTime(t: string): string {
  const p = String(t).split(":");
  let h = parseInt(p[0], 10);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + p[1] + " " + ap;
}

const parseIso = (s: string) => {
  const p = s.split("-").map(Number);
  return { y: p[0], m: p[1] - 1, d: p[2] };
};

const addDaysIso = (s: string, n: number): string => {
  const p = parseIso(s);
  const d = new Date(p.y, p.m, p.d);
  d.setDate(d.getDate() + n);
  return (
    d.getFullYear() +
    "-" +
    String(d.getMonth() + 1).padStart(2, "0") +
    "-" +
    String(d.getDate()).padStart(2, "0")
  );
};

const YESTERDAY = addDaysIso(TODAY, -1);

export function dayLabel(date: string): string {
  if (date === TODAY) return "Today";
  if (date === YESTERDAY) return "Yesterday";
  const p = parseIso(date);
  const dow = new Date(p.y, p.m, p.d).getDay();
  if (date > addDaysIso(TODAY, -7)) return DOW_SHORT[dow];
  return p.d + " " + MON_SHORT[p.m] + " " + p.y;
}

export function listStamp(at: string): string {
  if (!at) return "";
  const d = datePart(at);
  if (d === TODAY) return fmtTime(timePart(at));
  return dayLabel(d);
}

export function fmtJoined(s: string): string {
  const p = parseIso(s);
  return p.d + " " + MON_SHORT[p.m] + " " + p.y;
}

export const nameOf = (c: Conversation): string =>
  c.type === "group" ? c.name || "Unknown" : person(c.personId ?? -1)?.name || "Unknown";

export const roleOf = (c: Conversation): string =>
  c.type === "group" ? c.members.length + " members" : person(c.personId ?? -1)?.role || "";

export const isOnline = (c: Conversation): boolean =>
  c.type === "group"
    ? c.members.some((id) => person(id)?.online)
    : !!person(c.personId ?? -1)?.online;

export const senderName = (from: number | "me"): string =>
  from === "me" ? "You" : person(from)?.name || "Unknown";

const lastMsg = (c: Conversation): ChatMessage | null =>
  c.messages[c.messages.length - 1] || null;

export function lastLine(c: Conversation): string {
  const m = lastMsg(c);
  if (!m) return "No messages yet";
  const who =
    c.type === "group" && m.from !== "me"
      ? senderName(m.from).split(" ")[0] + ": "
      : m.from === "me"
        ? "You: "
        : "";
  return who + (m.attachment ? "📎 " + m.attachment.name : m.text);
}

const REPLIES = ["Got it! 👍", "Sure, will do.", "Thanks for the update.", "Noted 🙏", "On it!"];

export function useChat() {
  const { message, visible, showToast } = useToast();

  const [convos, setConvos] = useState<Conversation[]>(() =>
    CONVERSATIONS.map((c) => ({ ...c, messages: c.messages.slice() })),
  );
  const [activeId, setActiveId] = useState(1);
  const [search, setSearch] = useState("");
  const [tab, setTab] = useState<ChatTab>("All");
  const [pendingAttach, setPendingAttach] = useState<Attachment | null>(null);

  const midRef = useRef(25);
  const cidRef = useRef(10);
  const replyTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const nextMid = () => {
    const id = midRef.current;
    midRef.current += 1;
    return id;
  };
  const nextCid = () => {
    const id = cidRef.current;
    cidRef.current += 1;
    return id;
  };

  const byId = useCallback(
    (id: number) => convos.find((c) => c.id === id) ?? null,
    [convos],
  );

  const inTab = useCallback((c: Conversation, t: ChatTab): boolean => {
    if (t === "Archived") return c.archived;
    if (c.archived) return false;
    if (t === "Unread") return c.unread > 0;
    if (t === "Groups") return c.type === "group";
    return true;
  }, []);

  const matches = useCallback(
    (c: Conversation): boolean => {
      const q = search.trim().toLowerCase();
      if (!q) return true;
      return (
        nameOf(c).toLowerCase().includes(q) ||
        roleOf(c).toLowerCase().includes(q) ||
        c.messages.some(
          (m) =>
            m.text.toLowerCase().includes(q) ||
            (m.attachment !== null && m.attachment.name.toLowerCase().includes(q)),
        )
      );
    },
    [search],
  );

  const filtered = useMemo(
    () =>
      convos
        .filter((c) => inTab(c, tab) && matches(c))
        .sort((a, b) => {
          if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
          const am = lastMsg(a);
          const bm = lastMsg(b);
          return String(bm ? bm.at : "").localeCompare(String(am ? am.at : ""));
        }),
    [convos, tab, matches, inTab],
  );

  const counts = useMemo(
    () => ({
      All: convos.filter((c) => inTab(c, "All")).length,
      Unread: convos.filter((c) => inTab(c, "Unread")).length,
      Groups: convos.filter((c) => inTab(c, "Groups")).length,
      Archived: convos.filter((c) => inTab(c, "Archived")).length,
    }),
    [convos, inTab],
  );

  const active = byId(activeId);

  /* Opening a conversation clears its unread badge. */
  const openConversation = useCallback((id: number) => {
    setActiveId(id);
    setPendingAttach(null);
    setConvos((prev) => prev.map((c) => (c.id === id ? { ...c, unread: 0 } : c)));
  }, []);

  /* ---------- Send + simulated reply ---------- */
  const send = useCallback(
    (text: string) => {
      const c = byId(activeId);
      if (!c || c.blocked) return;
      const trimmed = text.trim();
      const attach = pendingAttach;
      if (!trimmed && !attach) return;

      const outgoing: ChatMessage = {
        id: nextMid(),
        from: "me",
        text: trimmed || (attach ? attach.name : ""),
        at: TODAY + "T" + NOW,
        status: "sent",
        attachment: attach,
      };
      const target = c.id;
      setPendingAttach(null);
      setConvos((prev) =>
        prev.map((x) => (x.id === target ? { ...x, messages: [...x.messages, outgoing] } : x)),
      );

      /* Delivered → read on the outgoing bubble. */
      setTimeout(() => {
        setConvos((prev) =>
          prev.map((x) => {
            if (x.id !== target) return x;
            const msgs = x.messages.slice();
            const last = msgs[msgs.length - 1];
            if (last && last.from === "me") msgs[msgs.length - 1] = { ...last, status: "read" };
            return { ...x, messages: msgs };
          }),
        );
      }, 700);

      if (replyTimer.current) clearTimeout(replyTimer.current);
      replyTimer.current = setTimeout(() => {
        setConvos((prev) =>
          prev.map((x) => {
            if (x.id !== target || x.blocked) return x;
            const responder =
              x.type === "group"
                ? x.members[(x.messages.length + x.id) % x.members.length]
                : (x.personId ?? -1);
            const reply = REPLIES[(x.messages.length + x.id) % REPLIES.length];
            const replyMsg: ChatMessage = {
              id: nextMid(),
              from: responder,
              text: reply,
              at: TODAY + "T" + NOW,
              status: "read",
              attachment: null,
            };
            const isActive = x.id === activeId;
            return {
              ...x,
              messages: [...x.messages, replyMsg],
              unread: isActive || x.muted ? x.unread : x.unread + 1,
            };
          }),
        );
      }, 1400);
    },
    [activeId, byId, pendingAttach],
  );

  const dropAttach = useCallback(() => {
    setPendingAttach(null);
    showToast("Attachment removed");
  }, [showToast]);

  /* ---------- Menu actions ---------- */
  const togglePin = useCallback(
    (id: number) => {
      const c = byId(id);
      if (!c) return;
      const pinned = !c.pinned;
      setConvos((prev) => prev.map((x) => (x.id === id ? { ...x, pinned } : x)));
      showToast(nameOf(c) + (pinned ? " pinned" : " unpinned"));
    },
    [byId, showToast],
  );

  const toggleMute = useCallback(
    (id: number) => {
      const c = byId(id);
      if (!c) return;
      const muted = !c.muted;
      setConvos((prev) => prev.map((x) => (x.id === id ? { ...x, muted } : x)));
      showToast(nameOf(c) + (muted ? " muted" : " unmuted"));
    },
    [byId, showToast],
  );

  const toggleUnread = useCallback(
    (id: number) => {
      const c = byId(id);
      if (!c) return;
      if (c.unread) {
        setConvos((prev) => prev.map((x) => (x.id === id ? { ...x, unread: 0 } : x)));
        showToast(nameOf(c) + " marked as read");
      } else {
        setConvos((prev) => prev.map((x) => (x.id === id ? { ...x, unread: 1 } : x)));
        if (activeId === id) setActiveId(0);
        showToast(nameOf(c) + " marked as unread");
      }
    },
    [byId, activeId, showToast],
  );

  const unarchive = useCallback(
    (id: number) => {
      const c = byId(id);
      if (!c) return;
      setConvos((prev) => prev.map((x) => (x.id === id ? { ...x, archived: false } : x)));
      showToast(nameOf(c) + " restored to Inbox");
    },
    [byId, showToast],
  );

  const confirmArchive = useCallback(
    (id: number, mute: boolean) => {
      const c = byId(id);
      if (!c) return;
      setConvos((prev) =>
        prev.map((x) => (x.id === id ? { ...x, archived: true, muted: mute } : x)),
      );
      if (activeId === id) setActiveId(0);
      showToast(nameOf(c) + " archived" + (mute ? " and muted" : ""));
    },
    [byId, activeId, showToast],
  );

  const unblock = useCallback(
    (id: number) => {
      const c = byId(id);
      if (!c) return;
      setConvos((prev) => prev.map((x) => (x.id === id ? { ...x, blocked: false } : x)));
      showToast(nameOf(c) + " unblocked");
    },
    [byId, showToast],
  );

  const confirmBlock = useCallback(
    (id: number) => {
      const c = byId(id);
      if (!c) return;
      if (replyTimer.current) clearTimeout(replyTimer.current);
      setConvos((prev) => prev.map((x) => (x.id === id ? { ...x, blocked: true } : x)));
      showToast(nameOf(c) + " blocked");
    },
    [byId, showToast],
  );

  const submitReport = useCallback(
    (id: number, reason: string, alsoBlock: boolean) => {
      const c = byId(id);
      if (!c) return;
      const block = alsoBlock && c.type === "dm";
      if (block) setConvos((prev) => prev.map((x) => (x.id === id ? { ...x, blocked: true } : x)));
      showToast("Report submitted · " + reason + (block ? " · " + nameOf(c) + " blocked" : ""));
    },
    [byId, showToast],
  );

  const confirmDelete = useCallback(
    (id: number) => {
      const c = byId(id);
      if (!c) return;
      const name = nameOf(c);
      const remaining = convos.filter((x) => x.id !== id);
      setConvos(remaining);
      if (activeId === id) {
        const next = remaining.filter((x) => inTab(x, tab) && matches(x))[0];
        setActiveId(next ? next.id : 0);
      }
      showToast("“" + name + "” deleted");
    },
    [byId, convos, activeId, tab, matches, inTab, showToast],
  );

  const confirmAttach = useCallback(
    (kind: string, name: string, icon: string) => {
      setPendingAttach({ kind, name, icon });
      showToast(kind + " attached — add a note or send");
    },
    [showToast],
  );

  const confirmCall = useCallback(
    (id: number) => {
      const c = byId(id);
      if (!c) return;
      showToast("Calling " + nameOf(c) + "…");
    },
    [byId, showToast],
  );

  const confirmExport = useCallback(
    (id: number, format: string) => {
      const c = byId(id);
      if (!c) return;
      if (!c.messages.length) {
        showToast("This chat has no messages to export");
        return;
      }
      if (format === "print") {
        showToast("Transcript sent to printer");
        return;
      }
      showToast(c.messages.length + " messages exported as " + format.toUpperCase());
    },
    [byId, showToast],
  );

  const startNewChat = useCallback(
    (personId: number) => {
      const p = person(personId);
      const existing = convos.find((x) => x.type === "dm" && x.personId === personId);
      if (existing) {
        setConvos((prev) =>
          prev.map((x) => (x.id === existing.id ? { ...x, archived: false } : x)),
        );
        setActiveId(existing.id);
        showToast("Opened your chat with " + (p?.name ?? "contact"));
      } else {
        const created: Conversation = {
          id: nextCid(),
          type: "dm",
          personId,
          about: "",
          members: [],
          pinned: false,
          muted: false,
          archived: false,
          blocked: false,
          unread: 0,
          messages: [],
        };
        setConvos((prev) => [...prev, created]);
        setActiveId(created.id);
        showToast("Started a chat with " + (p?.name ?? "contact"));
      }
      setTab("All");
    },
    [convos, showToast],
  );

  const saveGroup = useCallback(
    (editId: number | null, name: string, about: string, members: number[]) => {
      if (editId != null) {
        setConvos((prev) =>
          prev.map((x) =>
            x.id === editId ? { ...x, name, about, members: members.slice() } : x,
          ),
        );
        setActiveId(editId);
        showToast("“" + name + "” updated");
      } else {
        const created: Conversation = {
          id: nextCid(),
          type: "group",
          name,
          about,
          members: members.slice(),
          pinned: false,
          muted: false,
          archived: false,
          blocked: false,
          unread: 0,
          messages: [],
        };
        setConvos((prev) => [...prev, created]);
        setActiveId(created.id);
        setTab("All");
        showToast("“" + name + "” created with " + members.length + " members");
      }
    },
    [showToast],
  );

  return {
    convos,
    active,
    activeId,
    setActiveId: openConversation,
    search,
    setSearch,
    tab,
    setTab,
    pendingAttach,
    filtered,
    counts,
    byId,
    send,
    dropAttach,
    togglePin,
    toggleMute,
    toggleUnread,
    unarchive,
    confirmArchive,
    unblock,
    confirmBlock,
    submitReport,
    confirmDelete,
    confirmAttach,
    confirmCall,
    confirmExport,
    startNewChat,
    saveGroup,
    toast: { message, visible },
  };
}

export default useChat;
