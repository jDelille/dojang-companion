import type {
  Branch,
  BranchExportFormat,
  BranchManager,
  BranchStatus,
} from "../../types/branches";

/*
   Branches seed data — ported verbatim from tailwind/src/assets/js/branches.js
   (BRANCHES, MANAGERS, STATUSES, STATUS, STATUS_TINT, STATUS_COLOR,
   STATUS_HINT, AMENITIES, TRANSFER_REASONS, TODAY). The B() factory defaults
   (open 05:00, close 23:00, openingDate null, amenities Parking + Locker
   Rooms, settings) are expanded into explicit literals with the 1-based ids
   the bid counter produced.
*/

export const BRANCH_TODAY = "2026-07-14";

export const BRANCH_STATUSES: BranchStatus[] = [
  "Active",
  "Opening Soon",
  "Temporarily Closed",
];

export const BRANCH_STATUS_BADGE: Record<BranchStatus, string> = {
  Active: "badge-present",
  "Opening Soon": "badge-late",
  "Temporarily Closed": "badge-inactive",
};

/** Lucide icon name per status — mapped to components in branchIcons.ts. */
export const BRANCH_STATUS_ICON: Record<BranchStatus, string> = {
  Active: "check-circle-2",
  "Opening Soon": "clock",
  "Temporarily Closed": "pause-circle",
};

export const BRANCH_STATUS_TINT: Record<BranchStatus, string> = {
  Active: "ic-green",
  "Opening Soon": "ic-orange",
  "Temporarily Closed": "ic-red",
};

export const BRANCH_STATUS_COLOR: Record<BranchStatus, string> = {
  Active: "c-green",
  "Opening Soon": "c-orange",
  "Temporarily Closed": "c-red",
};

export const BRANCH_STATUS_HINT: Record<BranchStatus, string> = {
  Active: "Open and trading normally",
  "Opening Soon": "Not yet trading — members cannot check in",
  "Temporarily Closed": "Closed for renovation or maintenance",
};

export const AMENITIES = [
  "Swimming Pool",
  "Sauna & Steam",
  "Parking",
  "Café / Bar",
  "Crèche",
  "Physio Room",
  "Locker Rooms",
  "Group Studio",
];

export const TRANSFER_REASONS = [
  "Branch closure",
  "Member request",
  "Capacity balancing",
  "Renovation works",
  "Territory reassignment",
];

export const BRANCH_AV = [
  "av-gold",
  "av-purple",
  "av-cyan",
  "av-orange",
  "av-green",
  "av-red",
];

export const MANAGERS: BranchManager[] = [
  { id: "ST-001", name: "Nathan Reeves", phone: "(512) 555-0118", email: "nathan.m@example.com", role: "Regional Manager" },
  { id: "ST-002", name: "Jessica Ramirez", phone: "(213) 555-0122", email: "jessica.r@example.com", role: "Branch Manager" },
  { id: "ST-003", name: "Ethan Walsh", phone: "(415) 555-0133", email: "ethan.w@example.com", role: "Branch Manager" },
  { id: "ST-004", name: "Elena Castillo", phone: "(303) 555-0144", email: "elena.c@example.com", role: "Branch Manager" },
  { id: "ST-005", name: "Cameron Reid", phone: "(206) 555-0155", email: "cameron.r@example.com", role: "Branch Manager" },
  { id: "ST-006", name: "Olivia Chen", phone: "(305) 555-0166", email: "olivia.c@example.com", role: "Assistant Manager" },
  { id: "ST-007", name: "Derek Lawson", phone: "(213) 555-0155", email: "derek.l@example.com", role: "Assistant Manager" },
  { id: "ST-008", name: "Amara Osei", phone: "(303) 555-0157", email: "amara.o@example.com", role: "Operations Lead" },
];

export const BRANCHES: Branch[] = [
  {
    id: 1,
    name: "Austin — HQ",
    city: "Austin",
    address: "400 Congress Ave, Austin, TX 78701",
    managerId: "ST-001",
    phone: "(512) 555-0118",
    open: "05:00",
    close: "23:00",
    members: 1240,
    capacity: 1500,
    staff: 28,
    revenue: 84000,
    rating: 4.8,
    hq: true,
    status: "Active",
    opened: "2019-03-12",
    openingDate: null,
    amenities: [
      "Swimming Pool",
      "Sauna & Steam",
      "Parking",
      "Café / Bar",
      "Physio Room",
      "Locker Rooms",
      "Group Studio",
    ],
    settings: { signups: true, access247: true, publicVisible: true },
  },
  {
    id: 2,
    name: "Los Angeles — Silver Lake",
    city: "Los Angeles",
    address: "1247 Sunset Blvd, Los Angeles, CA 90026",
    managerId: "ST-002",
    phone: "(213) 555-0122",
    open: "05:30",
    close: "23:00",
    members: 980,
    capacity: 1200,
    staff: 22,
    revenue: 69000,
    rating: 4.6,
    hq: false,
    status: "Active",
    opened: "2020-08-01",
    openingDate: null,
    amenities: ["Sauna & Steam", "Parking", "Café / Bar", "Locker Rooms", "Group Studio"],
    settings: { signups: true, access247: false, publicVisible: true },
  },
  {
    id: 3,
    name: "San Francisco — Mission District",
    city: "San Francisco",
    address: "850 Market St, San Francisco, CA 94102",
    managerId: "ST-003",
    phone: "(415) 555-0133",
    open: "05:00",
    close: "22:30",
    members: 1120,
    capacity: 1300,
    staff: 24,
    revenue: 72000,
    rating: 4.7,
    hq: false,
    status: "Active",
    opened: "2020-11-20",
    openingDate: null,
    amenities: ["Swimming Pool", "Parking", "Café / Bar", "Crèche", "Locker Rooms"],
    settings: { signups: true, access247: false, publicVisible: true },
  },
  {
    id: 4,
    name: "Denver — LoDo",
    city: "Denver",
    address: "1600 Larimer St, Denver, CO 80202",
    managerId: "ST-004",
    phone: "(303) 555-0144",
    open: "06:00",
    close: "22:00",
    members: 640,
    capacity: 900,
    staff: 16,
    revenue: 41000,
    rating: 4.5,
    hq: false,
    status: "Active",
    opened: "2022-02-14",
    openingDate: null,
    amenities: ["Parking", "Locker Rooms", "Group Studio"],
    settings: { signups: true, access247: false, publicVisible: true },
  },
  {
    id: 5,
    name: "Seattle — Belltown",
    city: "Seattle",
    address: "2300 7th Ave, Seattle, WA 98121",
    managerId: "ST-005",
    phone: "(206) 555-0155",
    open: "05:30",
    close: "22:30",
    members: 720,
    capacity: 1000,
    staff: 18,
    revenue: 48000,
    rating: 4.6,
    hq: false,
    status: "Active",
    opened: "2023-06-05",
    openingDate: null,
    amenities: ["Sauna & Steam", "Parking", "Locker Rooms"],
    settings: { signups: true, access247: false, publicVisible: true },
  },
  {
    id: 6,
    name: "Miami — Brickell",
    city: "Miami",
    address: "700 Brickell Ave, Miami, FL 33131",
    managerId: "ST-006",
    phone: "(305) 555-0166",
    open: "05:00",
    close: "23:00",
    members: 0,
    capacity: 1100,
    staff: 12,
    revenue: 0,
    rating: 0,
    hq: false,
    status: "Opening Soon",
    opened: null,
    openingDate: "2026-08-01",
    amenities: ["Parking", "Locker Rooms"],
    settings: { signups: true, access247: false, publicVisible: true },
  },
];

/* ---------- Formatting helpers (ported verbatim) ---------- */

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export function fmtDate(iso: string | null): string {
  if (!iso) return "—";
  const p = String(iso).split("-");
  if (p.length !== 3) return iso;
  return MONTHS[Number(p[1]) - 1] + " " + p[2] + ", " + p[0];
}

export function fmt12(t: string): string {
  if (!t) return "—";
  const p = t.split(":");
  let h = Number(p[0]);
  const ap = h >= 12 ? "PM" : "AM";
  h = h % 12 || 12;
  return h + ":" + p[1] + " " + ap;
}

export const mgrName = (b: Branch): string => {
  const m = MANAGERS.find((x) => x.id === b.managerId);
  return m ? m.name : "Unassigned";
};

export function hoursOf(b: Branch): string {
  if (b.status === "Opening Soon" && b.openingDate) return "Opening " + fmtDate(b.openingDate);
  if (b.status === "Temporarily Closed") return "Temporarily closed";
  return fmt12(b.open) + " – " + fmt12(b.close);
}

export const capPct = (b: Branch): number =>
  b.capacity ? Math.round((b.members / b.capacity) * 100) : 0;

export const capClass = (p: number): string =>
  p >= 90 ? "cap-full" : p >= 70 ? "cap-warn" : "cap-ok";

/* ---------- Export ---------- */

export type BranchFormatCard = {
  id: BranchExportFormat;
  ic: string;
  tint: string;
  col: string;
  label: string;
  hint: string;
};

export const FORMATS: BranchFormatCard[] = [
  { id: "csv", ic: "file-spreadsheet", tint: "ic-green", col: "c-green", label: "CSV", hint: "Opens in Excel or Google Sheets" },
  { id: "json", ic: "file-json", tint: "ic-cyan", col: "c-cyan", label: "JSON", hint: "Structured data for integrations" },
  { id: "print", ic: "printer", tint: "ic-gold", col: "c-gold", label: "Print / PDF", hint: "Formatted sheet via your print dialog" },
];

/** CSV column spec — [header, accessor], ported verbatim from EX_COLS. */
export const EX_COLS: [string, (b: Branch) => string | number][] = [
  ["Branch", (b) => b.name],
  ["City", (b) => b.city],
  ["Address", (b) => b.address],
  ["Status", (b) => b.status],
  ["Headquarters", (b) => (b.hq ? "Yes" : "No")],
  ["Manager", (b) => mgrName(b)],
  ["Phone", (b) => b.phone],
  ["Members", (b) => b.members],
  ["Capacity", (b) => b.capacity],
  ["Capacity %", (b) => capPct(b)],
  ["Staff", (b) => b.staff],
  ["Monthly Revenue", (b) => b.revenue],
  ["Rating", (b) => b.rating || ""],
  ["Hours", (b) => hoursOf(b)],
  ["Amenities", (b) => b.amenities.join("; ")],
  ["Opened", (b) => b.opened || ""],
];
