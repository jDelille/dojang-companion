/* Chat types — ported from tailwind/src/assets/js/chat.js */

export type Person = {
  id: number;
  name: string;
  role: string;
  online: boolean;
  phone: string;
  email: string;
  joined: string;
};

export type MessageStatus = "sent" | "read";

export type Attachment = {
  kind: string;
  name: string;
  icon: string;
};

export type ChatMessage = {
  id: number;
  /** Sender person id, or "me" for outgoing. */
  from: number | "me";
  text: string;
  /** Datetime string "YYYY-MM-DDTHH:MM". */
  at: string;
  status: MessageStatus;
  attachment: Attachment | null;
};

export type ConversationType = "dm" | "group";

export type Conversation = {
  id: number;
  type: ConversationType;
  /** DM only — links to a Person. */
  personId?: number;
  /** Group only. */
  name?: string;
  about: string;
  members: number[];
  pinned: boolean;
  muted: boolean;
  archived: boolean;
  blocked: boolean;
  unread: number;
  messages: ChatMessage[];
};

export type ChatTab = "All" | "Unread" | "Groups" | "Archived";

export type ExportFormat = "txt" | "json" | "print";
