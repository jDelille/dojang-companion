import type { CalendarEvent, EventType, ExportFormat } from "../../types/calendarApp";

/*
   Calendar app seed data — ported verbatim from tailwind/src/assets/js/calendar-app.js
   (EVENTS, TYPES, TYPE_META, MONTHS, MON_SHORT, DOW_SHORT, LOCATIONS, TRAINERS,
   REMIND_OPTS, CHANNELS, FORMATS, EX_COLS). Ids follow the E() 1-based sequence.
*/

export const TODAY = "2026-07-14"; /* the template's "today" */

export const TYPES: EventType[] = ["Class", "Event", "Shift", "Reminder"];

export type TypeMeta = {
  cls: string;
  icon: string;
  tint: string;
  col: string;
  badge: string;
};

export const TYPE_META: Record<EventType, TypeMeta> = {
  Class: { cls: "t-class", icon: "dumbbell", tint: "ic-gold", col: "c-gold", badge: "badge-active" },
  Event: { cls: "t-event", icon: "sparkles", tint: "ic-purple", col: "c-purple", badge: "badge-leave" },
  Shift: { cls: "t-shift", icon: "user-check", tint: "ic-cyan", col: "c-cyan", badge: "badge-active" },
  Reminder: { cls: "t-reminder", icon: "bell", tint: "ic-orange", col: "c-orange", badge: "badge-late" },
};

export const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];
export const MON_SHORT = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
export const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const LOCATIONS = [
  "Studio A", "Studio B", "Main Floor", "Cardio Zone", "Outdoor",
  "Lounge", "Lobby", "Front Desk", "Office", "Admin", "HQ",
];

export const TRAINERS = [
  "Unassigned", "Damon Ellis", "Ashley Bennett", "Derek Lawson",
  "Jessica Ramirez", "Amara Osei", "Facilities Team", "Admin Team",
];

export const REMIND_OPTS = [
  { value: "5", label: "5 minutes before" },
  { value: "15", label: "15 minutes before" },
  { value: "30", label: "30 minutes before" },
  { value: "60", label: "1 hour before" },
  { value: "120", label: "2 hours before" },
  { value: "1440", label: "1 day before" },
];

export type ChannelMeta = { id: "Push" | "Email" | "SMS"; ic: string; tint: string; col: string; hint: string };
export const CHANNELS: ChannelMeta[] = [
  { id: "Push", ic: "smartphone", tint: "ic-gold", col: "c-gold", hint: "In-app push notification" },
  { id: "Email", ic: "mail", tint: "ic-cyan", col: "c-cyan", hint: "Sent to the owner's inbox" },
  { id: "SMS", ic: "message-square", tint: "ic-purple", col: "c-purple", hint: "Text message to the owner" },
];

export type FormatMeta = { id: ExportFormat; ic: string; tint: string; col: string; label: string; hint: string };
export const FORMATS: FormatMeta[] = [
  { id: "ics", ic: "calendar", tint: "ic-gold", col: "c-gold", label: "iCalendar (.ics)", hint: "Import into Google, Apple or Outlook" },
  { id: "csv", ic: "file-spreadsheet", tint: "ic-green", col: "c-green", label: "CSV", hint: "Opens in Excel or Google Sheets" },
  { id: "json", ic: "file-json", tint: "ic-cyan", col: "c-cyan", label: "JSON", hint: "Structured data for integrations" },
  { id: "print", ic: "printer", tint: "ic-purple", col: "c-purple", label: "Print / PDF", hint: "Formatted sheet via your print dialog" },
];

/** Column set used by the CSV export — [header, accessor]. */
export const EX_COLS: [string, (e: CalendarEvent) => string][] = [
  ["Date", (e) => e.date],
  ["Day", (e) => DOW_SHORT[weekdayOfIso(e.date)]],
  ["Start", (e) => e.start],
  ["End", (e) => e.end || ""],
  ["Title", (e) => e.title],
  ["Type", (e) => e.type],
  ["Location", (e) => e.location],
  ["Trainer", (e) => e.trainer || ""],
  ["Capacity", (e) => (e.capacity ? String(e.capacity) : "")],
  ["Reminder", (e) => (e.reminder ? e.reminder.minutes + "m " + e.reminder.channel : "")],
  ["Series", (e) => (e.seriesId ? "Yes" : "No")],
  ["Notes", (e) => e.notes || ""],
];

/* ---------- Date helpers (all dates are ISO 'YYYY-MM-DD') ---------- */
export const pad = (n: number) => String(n).padStart(2, "0");
export const iso = (y: number, m: number, d: number) => y + "-" + pad(m + 1) + "-" + pad(d); /* m is 0-indexed */
export const parseIso = (s: string) => {
  const p = s.split("-").map(Number);
  return { y: p[0], m: p[1] - 1, d: p[2] };
};
export const daysInMonth = (y: number, m: number) => new Date(y, m + 1, 0).getDate();
export const firstWeekday = (y: number, m: number) => new Date(y, m, 1).getDay();
export const weekdayOfIso = (s: string) => {
  const p = parseIso(s);
  return new Date(p.y, p.m, p.d).getDay();
};
export function addDaysIso(s: string, n: number): string {
  const p = parseIso(s);
  const d = new Date(p.y, p.m, p.d);
  d.setDate(d.getDate() + n);
  return iso(d.getFullYear(), d.getMonth(), d.getDate());
}
export function fmtDateLong(s: string | null): string {
  if (!s) return "—";
  const p = parseIso(s);
  return DOW_SHORT[weekdayOfIso(s)] + ", " + MON_SHORT[p.m] + " " + p.d + ", " + p.y;
}
export function fmtDateShort(s: string | null): string {
  if (!s) return "—";
  const p = parseIso(s);
  return MON_SHORT[p.m] + " " + p.d + ", " + p.y;
}
export function fmtTime(t: string | null | undefined): string {
  if (!t) return "—";
  const p = String(t).split(":");
  let h = parseInt(p[0], 10);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + p[1] + " " + ap;
}
export const toMin = (t: string) => {
  const p = t.split(":");
  return Number(p[0]) * 60 + Number(p[1]);
};
export function fmtDur(a: string, b: string): string {
  const n = toMin(b) - toMin(a);
  if (n <= 0) return "—";
  const h = Math.floor(n / 60);
  const m = n % 60;
  return (h ? h + "h" : "") + (h && m ? " " : "") + (m ? m + "m" : "");
}
export const addMin = (t: string, n: number): string => {
  let v = toMin(t) + n;
  v = ((v % 1440) + 1440) % 1440;
  return pad(Math.floor(v / 60)) + ":" + pad(v % 60);
};

export const remindLabel = (mins: number): string => {
  const o = REMIND_OPTS.find((x) => Number(x.value) === Number(mins));
  return o ? o.label : mins + " minutes before";
};

/* ---------- Seed events ---------- */
export const EVENTS: CalendarEvent[] = [
  { id: 1, date: "2026-07-01", start: "06:00", end: "07:00", title: "Sunrise Yoga", type: "Class", location: "Studio A", trainer: "Ashley Bennett", capacity: 20, notes: "", seriesId: null, reminder: null },
  { id: 2, date: "2026-07-01", start: "18:00", end: "19:00", title: "Power Strength", type: "Class", location: "Main Floor", trainer: "Damon Ellis", capacity: 16, notes: "", seriesId: null, reminder: null },
  { id: 3, date: "2026-07-03", start: "08:00", end: "09:00", title: "HIIT Burn", type: "Class", location: "Studio B", trainer: "Derek Lawson", capacity: 18, notes: "", seriesId: null, reminder: null },
  { id: 4, date: "2026-07-03", start: "10:00", end: "10:30", title: "Staff Standup", type: "Event", location: "Office", trainer: "Admin Team", capacity: null, notes: "", seriesId: null, reminder: null },
  { id: 5, date: "2026-07-05", start: "17:30", end: "18:30", title: "Zumba Party", type: "Class", location: "Studio A", trainer: "Jessica Ramirez", capacity: 30, notes: "", seriesId: null, reminder: null },
  { id: 6, date: "2026-07-07", start: "09:00", end: "11:00", title: "Equipment Service", type: "Reminder", location: "Cardio Zone", trainer: "Facilities Team", capacity: null, notes: "", seriesId: null, reminder: null },
  { id: 7, date: "2026-07-10", start: "07:00", end: "15:00", title: "Trainer Shift — Andre", type: "Shift", location: "Main Floor", trainer: "Damon Ellis", capacity: null, notes: "", seriesId: null, reminder: null },
  { id: 8, date: "2026-07-12", start: "16:00", end: "18:00", title: "Member Meetup", type: "Event", location: "Lounge", trainer: "Admin Team", capacity: null, notes: "", seriesId: null, reminder: null },
  { id: 9, date: "2026-07-14", start: "06:30", end: "07:30", title: "Vinyasa Flow", type: "Class", location: "Studio A", trainer: "Ashley Bennett", capacity: 22, notes: "", seriesId: null, reminder: null },
  { id: 10, date: "2026-07-14", start: "09:00", end: "17:00", title: "Reception Shift", type: "Shift", location: "Front Desk", trainer: "Amara Osei", capacity: null, notes: "", seriesId: null, reminder: null },
  { id: 11, date: "2026-07-14", start: "18:00", end: "19:30", title: "Nutrition Seminar", type: "Event", location: "Studio B", trainer: "Jessica Ramirez", capacity: 40, notes: "", seriesId: null, reminder: null },
  { id: 12, date: "2026-07-14", start: "20:00", end: "20:30", title: "Renewal Reminders", type: "Reminder", location: "Admin", trainer: "Admin Team", capacity: null, notes: "", seriesId: null, reminder: { minutes: 30, channel: "Email" } },
  { id: 13, date: "2026-07-18", start: "10:30", end: "11:30", title: "Bootcamp HIIT", type: "Class", location: "Outdoor", trainer: "Derek Lawson", capacity: 25, notes: "", seriesId: null, reminder: null },
  { id: 14, date: "2026-07-20", start: "11:00", end: "13:00", title: "Founder Visit", type: "Event", location: "HQ", trainer: "Admin Team", capacity: null, notes: "", seriesId: null, reminder: null },
  { id: 15, date: "2026-07-22", start: "19:00", end: "21:00", title: "Membership Drive", type: "Event", location: "Lobby", trainer: "Admin Team", capacity: null, notes: "", seriesId: null, reminder: null },
  { id: 16, date: "2026-07-25", start: "06:00", end: "07:00", title: "Morning Yoga", type: "Class", location: "Studio A", trainer: "Ashley Bennett", capacity: 20, notes: "", seriesId: null, reminder: null },
  { id: 17, date: "2026-07-28", start: "09:00", end: "09:30", title: "Payroll Cutoff", type: "Reminder", location: "Admin", trainer: "Admin Team", capacity: null, notes: "", seriesId: null, reminder: null },
  { id: 18, date: "2026-07-31", start: "17:00", end: "18:30", title: "Month-End Review", type: "Event", location: "Office", trainer: "Admin Team", capacity: null, notes: "", seriesId: null, reminder: null },
  /* Spill into the next month so navigation clearly carries real data */
  { id: 19, date: "2026-08-03", start: "06:00", end: "07:00", title: "Sunrise Yoga", type: "Class", location: "Studio A", trainer: "Ashley Bennett", capacity: 20, notes: "", seriesId: null, reminder: null },
  { id: 20, date: "2026-08-05", start: "18:00", end: "19:00", title: "Power Strength", type: "Class", location: "Main Floor", trainer: "Damon Ellis", capacity: 16, notes: "", seriesId: null, reminder: null },
  { id: 21, date: "2026-06-26", start: "17:00", end: "18:00", title: "Quarter Close", type: "Event", location: "Office", trainer: "Admin Team", capacity: null, notes: "", seriesId: null, reminder: null },
];
