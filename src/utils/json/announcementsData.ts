import type {
  Announcement,
  AnnouncementAudience,
  AnnouncementChannel,
  AnnouncementPriority,
  AnnouncementStatus,
  AnnouncementType,
  ExportFormat,
} from "../../types/announcements";

/*
   Announcements seed data — ported verbatim from tailwind/src/assets/js/announcements.js
   (ANNS, TYPE_META, PRIORITIES, AUDIENCES, AUD_SIZE, CHANNELS, STATUS_BADGE,
   EX_FORMATS, and domain constants). The A() factory defaults (pinned:false,
   reach:0, channels:['In-App'], expireAt:null, author, createdAt:NOW_AT,
   publishAt:null) are expanded into explicit literal objects with sequential ids.
*/

export const TODAY = "2026-07-14";
export const NOW = "11:30";
export const AUTHOR = "Admin · Austin HQ";
export const NOW_AT = TODAY + "T" + NOW;
export const MAX_TITLE = 80;
export const MAX_BODY = 400;

export const TYPES: AnnouncementType[] = ["General", "Event", "Alert", "Offer", "Closure"];

export const TYPE_META: Record<
  AnnouncementType,
  { icon: string; cls: string; tcls: string }
> = {
  General: { icon: "info", cls: "ic-gold", tcls: "t-general" },
  Event: { icon: "calendar-heart", cls: "ic-purple", tcls: "t-event" },
  Alert: { icon: "alert-triangle", cls: "ic-red", tcls: "t-alert" },
  Offer: { icon: "tag", cls: "ic-green", tcls: "t-offer" },
  Closure: { icon: "door-closed", cls: "ic-orange", tcls: "t-closure" },
};

export const PRIORITIES: AnnouncementPriority[] = ["Normal", "High", "Urgent"];

export const PRIO_CLASS: Record<AnnouncementPriority, string> = {
  Normal: "p-normal",
  High: "p-high",
  Urgent: "p-urgent",
};

export const AUDIENCES: AnnouncementAudience[] = ["Everyone", "Members", "Staff"];

export const AUD_ICON: Record<AnnouncementAudience, string> = {
  Everyone: "globe",
  Members: "users",
  Staff: "id-card",
};

export const AUD_SIZE: Record<AnnouncementAudience, number> = {
  Everyone: 1268,
  Members: 1240,
  Staff: 28,
};

export const CHANNELS: { id: AnnouncementChannel; ic: string }[] = [
  { id: "In-App", ic: "smartphone" },
  { id: "Email", ic: "mail" },
  { id: "Push", ic: "bell" },
  { id: "SMS", ic: "message-square" },
];

export const STATUSES: AnnouncementStatus[] = ["Draft", "Scheduled", "Active", "Expired"];

export const STATUS_BADGE: Record<AnnouncementStatus, string> = {
  Active: "badge-present",
  Scheduled: "badge-late",
  Expired: "badge-inactive",
  Draft: "badge-leave",
};

export const EX_FORMATS: {
  id: ExportFormat;
  ic: string;
  tint: string;
  col: string;
  label: string;
  hint: string;
}[] = [
  {
    id: "csv",
    ic: "file-spreadsheet",
    tint: "ic-green",
    col: "c-green",
    label: "CSV",
    hint: "Opens in Excel or Google Sheets",
  },
  {
    id: "json",
    ic: "file-json",
    tint: "ic-cyan",
    col: "c-cyan",
    label: "JSON",
    hint: "Structured data for integrations",
  },
  {
    id: "print",
    ic: "printer",
    tint: "ic-gold",
    col: "c-gold",
    label: "Print / PDF",
    hint: "Formatted sheet via your print dialog",
  },
];

export const meta = (t: AnnouncementType) => TYPE_META[t] || TYPE_META.General;
export const estReach = (aud: AnnouncementAudience) => AUD_SIZE[aud] || 0;

export const ANNOUNCEMENTS: Announcement[] = [
  {
    id: 1,
    title: "Independence Day Memorial Dayday Timings",
    body: "The gym will operate on reduced hours (7 AM – 12 PM) on 15 August. Plan your workouts accordingly!",
    type: "Closure",
    audience: "Everyone",
    priority: "High",
    status: "Active",
    reach: 1240,
    pinned: true,
    channels: ["In-App", "Email", "Push"],
    createdAt: "2026-07-14T09:30",
    publishAt: "2026-07-14T09:30",
    expireAt: "2026-08-16",
    author: AUTHOR,
  },
  {
    id: 2,
    title: "New HIIT Class Added — 9 PM",
    body: "By popular demand, we've added a late-evening HIIT class every Mon/Wed/Fri at 9 PM with Coach Andre.",
    type: "Event",
    audience: "Members",
    priority: "Normal",
    status: "Active",
    reach: 980,
    pinned: false,
    channels: ["In-App", "Push"],
    createdAt: "2026-07-13T10:00",
    publishAt: "2026-07-13T10:00",
    expireAt: null,
    author: AUTHOR,
  },
  {
    id: 3,
    title: "Fall Membership Offer — 25% Off",
    body: "Get 25% off on all annual memberships this month. Use code FALL25 at the front desk.",
    type: "Offer",
    audience: "Members",
    priority: "High",
    status: "Active",
    reach: 1120,
    pinned: true,
    channels: ["In-App", "Email", "SMS"],
    createdAt: "2026-07-12T12:00",
    publishAt: "2026-07-12T12:00",
    expireAt: "2026-07-31",
    author: AUTHOR,
  },
  {
    id: 4,
    title: "Equipment Maintenance — Cardio Zone",
    body: "Treadmills #3 and #5 will be under maintenance on Thursday morning. Alternatives available in the annex.",
    type: "Alert",
    audience: "Everyone",
    priority: "Normal",
    status: "Active",
    reach: 860,
    pinned: false,
    channels: ["In-App"],
    createdAt: "2026-07-11T08:15",
    publishAt: "2026-07-11T08:15",
    expireAt: null,
    author: AUTHOR,
  },
  {
    id: 5,
    title: "Staff Meeting — Monthly Review",
    body: "All department leads to attend the monthly review on Friday 5 PM in the conference room.",
    type: "General",
    audience: "Staff",
    priority: "Normal",
    status: "Active",
    reach: 28,
    pinned: false,
    channels: ["In-App", "Email"],
    createdAt: "2026-07-10T16:40",
    publishAt: "2026-07-10T16:40",
    expireAt: null,
    author: AUTHOR,
  },
  {
    id: 6,
    title: "Thanksgiving Celebration Event",
    body: "Join us for a special Thanksgiving fitness challenge and celebration on 10 November. Prizes to be won!",
    type: "Event",
    audience: "Everyone",
    priority: "Normal",
    status: "Scheduled",
    reach: 0,
    pinned: false,
    channels: ["In-App", "Email", "Push"],
    createdAt: "2026-07-09T14:00",
    publishAt: "2026-11-01T09:00",
    expireAt: "2026-11-11",
    author: AUTHOR,
  },
  {
    id: 7,
    title: "New Year Transformation Challenge",
    body: "8-week body transformation challenge launching in January. Registrations open soon!",
    type: "Offer",
    audience: "Members",
    priority: "Normal",
    status: "Scheduled",
    reach: 0,
    pinned: false,
    channels: ["In-App", "Email"],
    createdAt: "2026-07-08T11:20",
    publishAt: "2026-12-20T09:00",
    expireAt: null,
    author: AUTHOR,
  },
  {
    id: 8,
    title: "Trainer Certification Drive",
    body: "Internal certification refresher for all floor trainers. Dates and slots to be confirmed — draft pending manager sign-off.",
    type: "General",
    audience: "Staff",
    priority: "Normal",
    status: "Draft",
    reach: 0,
    pinned: false,
    channels: ["In-App"],
    createdAt: "2026-07-13T17:45",
    publishAt: null,
    expireAt: null,
    author: AUTHOR,
  },
  {
    id: 9,
    title: "Summer Hydration Reminder",
    body: "Stay hydrated! Free electrolyte water available at the counter through the summer.",
    type: "General",
    audience: "Members",
    priority: "Normal",
    status: "Expired",
    reach: 1040,
    pinned: false,
    channels: ["In-App"],
    createdAt: "2026-06-20T09:00",
    publishAt: "2026-06-20T09:00",
    expireAt: "2026-07-05",
    author: AUTHOR,
  },
];
