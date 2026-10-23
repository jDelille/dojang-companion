import {
  Bell,
  Calendar,
  CalendarMinus,
  CalendarOff,
  CalendarX,
  Dumbbell,
  FileJson,
  FileSpreadsheet,
  Mail,
  MessageSquare,
  Printer,
  Sparkles,
  Smartphone,
  UserCheck,
  type LucideIcon,
} from "lucide-react";
import type { DeleteScope, EventType, ExportFormat, ReminderChannel } from "../../../types/calendarApp";

/*
   Icon maps for the Calendar page — ported from TYPE_META / CHANNELS / FORMATS
   in tailwind/src/assets/js/calendar-app.js and the inline del-scope option
   icons in openDelete().
*/

export const TYPE_ICON: Record<EventType, LucideIcon> = {
  Class: Dumbbell,
  Event: Sparkles,
  Shift: UserCheck,
  Reminder: Bell,
};

export const CHANNEL_ICON: Record<ReminderChannel, LucideIcon> = {
  Push: Smartphone,
  Email: Mail,
  SMS: MessageSquare,
};

export const FORMAT_ICON: Record<ExportFormat, LucideIcon> = {
  ics: Calendar,
  csv: FileSpreadsheet,
  json: FileJson,
  print: Printer,
};

export const DEL_SCOPE_ICON: Record<DeleteScope, LucideIcon> = {
  one: CalendarX,
  future: CalendarMinus,
  all: CalendarOff,
};
