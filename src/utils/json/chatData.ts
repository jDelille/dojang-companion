import type { Conversation, ExportFormat, Person } from "../../types/chat";

/*
   Chat seed data — ported verbatim from tailwind/src/assets/js/chat.js
   (PEOPLE, CONVOS, REPORT_REASONS, ATTACH_KINDS, EX_FORMATS and constants).
   The M() and C() factory defaults (message: id/status:'read'/attachment:null;
   convo: type:'dm'/pinned/muted/archived/blocked:false, unread:0, about:'',
   members:[], messages:[]) are expanded into explicit literals with sequential
   numeric ids following the mid/cid 1-based sequence.
*/

export const TODAY = "2026-07-14";
export const NOW = "10:20";
export const AV = ["av-gold", "av-purple", "av-orange", "av-cyan", "av-green", "av-red"];
export const MON_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];
export const DOW_SHORT = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export const REPORT_REASONS = [
  { id: "Spam", ic: "mail-x", tint: "ic-orange", col: "c-orange", hint: "Unsolicited or repetitive messages" },
  { id: "Harassment", ic: "shield-alert", tint: "ic-red", col: "c-red", hint: "Abusive, threatening or unwelcome contact" },
  { id: "Inappropriate content", ic: "eye-off", tint: "ic-purple", col: "c-purple", hint: "Offensive or explicit material" },
  { id: "Impersonation", ic: "user-x", tint: "ic-cyan", col: "c-cyan", hint: "Pretending to be someone else" },
  { id: "Other", ic: "more-horizontal", tint: "ic-gold", col: "c-gold", hint: "Something else — please describe" },
];

export const ATTACH_KINDS = [
  { id: "Document", ic: "file-text", tint: "ic-gold", col: "c-gold", hint: "PDF, doc or spreadsheet", ph: "diet-plan-july.pdf" },
  { id: "Photo", ic: "image", tint: "ic-purple", col: "c-purple", hint: "Image from your device", ph: "progress-photo.jpg" },
  { id: "Workout Plan", ic: "dumbbell", tint: "ic-cyan", col: "c-cyan", hint: "Share a saved plan", ph: "strength-8-week.plan" },
];

export const EX_FORMATS: {
  id: ExportFormat;
  ic: string;
  tint: string;
  col: string;
  label: string;
  hint: string;
}[] = [
  { id: "txt", ic: "file-text", tint: "ic-gold", col: "c-gold", label: "Plain text (.txt)", hint: "Readable transcript" },
  { id: "json", ic: "file-json", tint: "ic-cyan", col: "c-cyan", label: "JSON", hint: "Structured data for integrations" },
  { id: "print", ic: "printer", tint: "ic-purple", col: "c-purple", label: "Print / PDF", hint: "Formatted sheet via your print dialog" },
];

export const PEOPLE: Person[] = [
  { id: 1, name: "Daniel Foster", role: "Head Trainer", online: true, phone: "(415) 555-0108", email: "daniel.f@example.com", joined: "2021-04-12" },
  { id: 2, name: "Rachel Morgan", role: "Yoga Instructor", online: true, phone: "(303) 555-0109", email: "rachel.m@example.com", joined: "2022-01-08" },
  { id: 3, name: "Ashley Bennett", role: "Member · Gold", online: false, phone: "(206) 555-0110", email: "ashley.b@example.com", joined: "2024-06-21" },
  { id: 4, name: "Andre Jackson", role: "HIIT Coach", online: true, phone: "(305) 555-0111", email: "andre.j@example.com", joined: "2023-02-14" },
  { id: 5, name: "Front Desk", role: "Reception Team", online: true, phone: "(512) 555-0112", email: "reception@example.com", joined: "2019-03-12" },
  { id: 6, name: "Jordan Blake", role: "Branch Manager", online: false, phone: "(213) 555-0113", email: "jordan.b@example.com", joined: "2020-09-30" },
  { id: 7, name: "Olivia Chen", role: "Nutritionist", online: false, phone: "(415) 555-0114", email: "olivia.c@example.com", joined: "2023-07-19" },
  { id: 8, name: "Tyler Brooks", role: "Member · Platinum", online: true, phone: "(303) 555-0115", email: "tyler.b@example.com", joined: "2023-11-02" },
  { id: 9, name: "Megan Sullivan", role: "Member · Silver", online: false, phone: "(206) 555-0116", email: "megan.s@example.com", joined: "2025-01-15" },
  { id: 10, name: "Amara Osei", role: "Operations Lead", online: true, phone: "(305) 555-0117", email: "amara.o@example.com", joined: "2022-05-06" },
];

export const CONVERSATIONS: Conversation[] = [
  {
    id: 1,
    type: "dm",
    personId: 1,
    about: "",
    members: [],
    pinned: false,
    muted: false,
    archived: false,
    blocked: false,
    unread: 2,
    messages: [
      { id: 1, from: 1, text: "Morning! Client schedule updated for this week.", at: TODAY + "T09:02", status: "read", attachment: null },
      { id: 2, from: "me", text: "Great, thanks Daniel. Any changes to the PT slots?", at: TODAY + "T09:04", status: "read", attachment: null },
      { id: 3, from: 1, text: "Yes — moved the 6 AM strength session to 7 AM.", at: TODAY + "T09:05", status: "read", attachment: null },
      { id: 4, from: 1, text: "Also added two new members to your batch.", at: TODAY + "T09:05", status: "read", attachment: null },
    ],
  },
  {
    id: 2,
    type: "dm",
    personId: 2,
    about: "",
    members: [],
    pinned: false,
    muted: false,
    archived: false,
    blocked: false,
    unread: 1,
    messages: [
      { id: 5, from: 2, text: "Can we add a 7 AM yoga slot on weekends?", at: TODAY + "T08:40", status: "read", attachment: null },
      { id: 6, from: "me", text: "Sure, I'll check studio availability.", at: TODAY + "T08:45", status: "read", attachment: null },
      { id: 7, from: 2, text: "Perfect, members have been asking for it 🙏", at: TODAY + "T08:46", status: "read", attachment: null },
    ],
  },
  {
    id: 3,
    type: "dm",
    personId: 3,
    about: "",
    members: [],
    pinned: false,
    muted: false,
    archived: false,
    blocked: false,
    unread: 0,
    messages: [
      { id: 8, from: 3, text: "Hi, my membership renews next week right?", at: "2026-07-13T16:20", status: "read", attachment: null },
      { id: 9, from: "me", text: "Yes Ashley, it renews on 21 July. Want auto-pay?", at: "2026-07-13T16:24", status: "read", attachment: null },
      { id: 10, from: 3, text: "Yes please, set it up. Thank you!", at: "2026-07-13T16:26", status: "read", attachment: null },
    ],
  },
  {
    id: 4,
    type: "group",
    name: "Trainers — Austin HQ",
    about: "Shift swaps, class cover and floor updates",
    members: [1, 2, 4, 10],
    pinned: false,
    muted: false,
    archived: false,
    blocked: false,
    unread: 3,
    messages: [
      { id: 11, from: 4, text: "Can anyone cover the 5 PM HIIT tomorrow?", at: TODAY + "T10:02", status: "read", attachment: null },
      { id: 12, from: 1, text: "I can take it if nobody else does.", at: TODAY + "T10:06", status: "read", attachment: null },
      { id: 13, from: 2, text: "Thanks Daniel 🙌", at: TODAY + "T10:08", status: "read", attachment: null },
      { id: 14, from: 10, text: "Logged it on the roster.", at: TODAY + "T10:12", status: "read", attachment: null },
    ],
  },
  {
    id: 5,
    type: "dm",
    personId: 4,
    about: "",
    members: [],
    pinned: false,
    muted: false,
    archived: false,
    blocked: false,
    unread: 0,
    messages: [
      { id: 15, from: "me", text: "Andre, can you cover the 5 PM class tomorrow?", at: "2026-07-13T11:00", status: "read", attachment: null },
      { id: 16, from: 4, text: "Yep, I got it. 💪", at: "2026-07-13T11:04", status: "read", attachment: null },
    ],
  },
  {
    id: 6,
    type: "dm",
    personId: 5,
    about: "",
    members: [],
    pinned: false,
    muted: false,
    archived: false,
    blocked: false,
    unread: 5,
    messages: [
      { id: 17, from: 5, text: "New walk-in enquiry at the counter.", at: TODAY + "T10:10", status: "read", attachment: null },
      { id: 18, from: 5, text: "Also, whey protein stock is low.", at: TODAY + "T10:12", status: "read", attachment: null },
      { id: 19, from: 5, text: "Locker #14 key returned.", at: TODAY + "T10:15", status: "read", attachment: null },
    ],
  },
  {
    id: 7,
    type: "group",
    name: "Front Desk Ops",
    about: "Daily reception handover",
    members: [5, 6, 10],
    pinned: false,
    muted: false,
    archived: false,
    blocked: false,
    unread: 0,
    messages: [
      { id: 20, from: 6, text: "Handover notes are in the shared drive.", at: "2026-07-12T18:30", status: "read", attachment: null },
      { id: 21, from: 5, text: "Got it, thanks!", at: "2026-07-12T18:35", status: "read", attachment: null },
    ],
  },
  {
    id: 8,
    type: "dm",
    personId: 6,
    about: "",
    members: [],
    pinned: false,
    muted: false,
    archived: false,
    blocked: false,
    unread: 0,
    messages: [
      { id: 22, from: 6, text: "Monthly report is ready for review.", at: "2026-07-12T09:15", status: "read", attachment: null },
      { id: 23, from: "me", text: "Thanks, I'll go through it today.", at: "2026-07-12T09:40", status: "read", attachment: null },
    ],
  },
  {
    id: 9,
    type: "dm",
    personId: 7,
    about: "",
    members: [],
    pinned: false,
    muted: false,
    archived: true,
    blocked: false,
    unread: 0,
    messages: [
      { id: 24, from: 7, text: "Sent the updated diet plans for 3 members.", at: "2026-07-11T14:05", status: "read", attachment: null },
    ],
  },
];

export const person = (id: number): Person | undefined => PEOPLE.find((p) => p.id === id);
