import {
  Dumbbell,
  EyeOff,
  FileJson,
  FileText,
  Image,
  MailX,
  MoreHorizontal,
  Printer,
  ShieldAlert,
  UserX,
  type LucideIcon,
} from "lucide-react";

/*
   Chat icon map — ported from the lucide icon names used across
   tailwind/src/assets/js/chat.js data lists (REPORT_REASONS, ATTACH_KINDS,
   EX_FORMATS) and the message attachment icons. CHAT_ICON_FALLBACK covers any
   name not present in the map.
*/

export const CHAT_ICON: Record<string, LucideIcon> = {
  "mail-x": MailX,
  "shield-alert": ShieldAlert,
  "eye-off": EyeOff,
  "user-x": UserX,
  "more-horizontal": MoreHorizontal,
  "file-text": FileText,
  image: Image,
  dumbbell: Dumbbell,
  "file-json": FileJson,
  printer: Printer,
};

export const CHAT_ICON_FALLBACK: LucideIcon = FileText;
