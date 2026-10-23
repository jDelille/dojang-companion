/* Calendar app types — ported from tailwind/src/assets/js/calendar-app.js */

export type EventType = "Class" | "Event" | "Shift" | "Reminder";

export type ReminderChannel = "Push" | "Email" | "SMS";

export type Reminder = {
  minutes: number;
  channel: ReminderChannel;
};

export type CalendarEvent = {
  id: number;
  /** ISO 'YYYY-MM-DD' */
  date: string;
  /** 'HH:mm' */
  start: string;
  /** 'HH:mm' or null */
  end: string | null;
  title: string;
  type: EventType;
  location: string;
  trainer: string;
  capacity: number | null;
  notes: string;
  seriesId: string | null;
  reminder: Reminder | null;
};

/** Fields the Add / Edit Event modal collects. */
export type EventFormValues = {
  title: string;
  type: EventType;
  date: string;
  start: string;
  end: string;
  location: string;
  trainer: string;
  capacity: number | null;
  notes: string;
};

/** Fields the Schedule (recurring) modal collects. */
export type ScheduleFormValues = {
  title: string;
  type: EventType;
  dows: number[];
  from: string;
  until: string;
  start: string;
  end: string;
  location: string;
  trainer: string;
};

export type DeleteScope = "one" | "future" | "all";

export type ExportFormat = "ics" | "csv" | "json" | "print";
export type ExportScope = "day" | "month" | "filtered" | "all";
