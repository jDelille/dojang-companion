import {
  AlertTriangle,
  Bell,
  CalendarHeart,
  DoorClosed,
  FileJson,
  FileSpreadsheet,
  Globe,
  IdCard,
  Info,
  Mail,
  MessageSquare,
  Printer,
  Smartphone,
  Tag,
  Users,
  type LucideIcon,
} from "lucide-react";
import type {
  AnnouncementAudience,
  AnnouncementType,
  ExportFormat,
} from "../../types/announcements";

/*
   Announcement icon maps, ported from TYPE_META / AUD_ICON / CHANNELS /
   EX_FORMATS icon names in tailwind/src/assets/js/announcements.js. AUD_FALLBACK
   covers the template's `AUD_ICON[a.audience] || 'globe'` default.
*/

export const TYPE_ICON: Record<AnnouncementType, LucideIcon> = {
  General: Info,
  Event: CalendarHeart,
  Alert: AlertTriangle,
  Offer: Tag,
  Closure: DoorClosed,
};

export const AUD_ICON_CMP: Record<AnnouncementAudience, LucideIcon> = {
  Everyone: Globe,
  Members: Users,
  Staff: IdCard,
};

export const AUD_FALLBACK: LucideIcon = Globe;

export const CHANNEL_ICON: Record<string, LucideIcon> = {
  "In-App": Smartphone,
  Email: Mail,
  Push: Bell,
  SMS: MessageSquare,
};

export const EX_FORMAT_ICON: Record<ExportFormat, LucideIcon> = {
  csv: FileSpreadsheet,
  json: FileJson,
  print: Printer,
};
