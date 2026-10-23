import type {
  Locker,
  LockerSize,
  LockerStatus,
  LockerZone,
  Member,
} from "../../types/lockers";

/*
   Locker Management seed data — ported verbatim from the build() factory and
   the domain constants in tailwind/src/assets/js/lockers.js. The 84 lockers are
   the deterministic layout that build() produced, expanded to explicit literals
   with their sequential numeric ids. Lookup maps (STATE_CLASS, STATE_BADGE,
   TINT, ICON_COLOR, DEPOSIT, STATUS_HINT, etc.) follow.
*/

export const TODAY = "2026-07-14";

export const STATUSES: LockerStatus[] = ["Available", "Occupied", "Reserved", "Maintenance"];
export const ZONES: LockerZone[] = ["Men's", "Women's", "Premium"];
export const SIZES: LockerSize[] = ["Small", "Medium", "Large", "XL"];
export const KEY_TYPES = ["Key & Lock", "Digital PIN", "RFID Band"];
export const TECHS = ["Corey Doyle", "Kevin Barnes", "Facilities Team", "External Vendor"];
export const DEPOSIT: Record<LockerSize, number> = { Small: 15, Medium: 25, Large: 40, XL: 75 };

export const STATE_CLASS: Record<LockerStatus, string> = {
  Available: "lk-available",
  Occupied: "lk-occupied",
  Reserved: "lk-reserved",
  Maintenance: "lk-maintenance",
};
export const STATE_BADGE: Record<LockerStatus, string> = {
  Available: "badge-present",
  Occupied: "badge-active",
  Reserved: "badge-leave",
  Maintenance: "badge-late",
};
/** Icon-name strings — resolved to lucide components in lockersIcons.ts. */
export const ICON: Record<LockerStatus, string> = {
  Available: "lock-open",
  Occupied: "lock",
  Reserved: "clock",
  Maintenance: "wrench",
};
export const TINT: Record<LockerStatus, string> = {
  Available: "ic-green",
  Occupied: "ic-gold",
  Reserved: "ic-purple",
  Maintenance: "ic-orange",
};
export const ICON_COLOR: Record<LockerStatus, string> = {
  Available: "c-green",
  Occupied: "c-gold",
  Reserved: "c-purple",
  Maintenance: "c-orange",
};

export const STATUS_HINT: Record<LockerStatus, string> = {
  Available: "Free to assign — clears any member",
  Occupied: "In use by a member (needs an assignment)",
  Reserved: "Held for a member, key not collected",
  Maintenance: "Out of service for repair",
};

export const MEMBERS: Member[] = [
  { id: "FP-1042", name: "Ashley Bennett" }, { id: "FP-1087", name: "Marcus Coleman" },
  { id: "FP-1103", name: "Sofia Delgado" }, { id: "FP-1156", name: "Tyler Brooks" },
  { id: "FP-1198", name: "Megan Sullivan" }, { id: "FP-1204", name: "Ethan Walsh" },
  { id: "FP-1251", name: "Olivia Chen" }, { id: "FP-1289", name: "Cameron Reid" },
  { id: "FP-1310", name: "Amara Osei" }, { id: "FP-1344", name: "Derek Lawson" },
  { id: "FP-1372", name: "Tara Lindqvist" }, { id: "FP-1401", name: "Bryce Sutton" },
];

export const DURATIONS = [
  { value: "1", label: "1 month" },
  { value: "3", label: "3 months" },
  { value: "6", label: "6 months" },
  { value: "12", label: "12 months" },
  { value: "custom", label: "Custom date" },
];

export const RELEASE_REASONS = [
  "Membership ended",
  "Member requested",
  "Expired / not renewed",
  "Transferred to another locker",
  "Admin override",
];

export const ISSUES = [
  "Lock jammed",
  "Key lost / replaced",
  "Door damaged",
  "Hinge repair",
  "Routine inspection",
  "Deep clean",
  "Back in service",
];

export const LOCKERS: Locker[] = [
  { id: 1, num: "01", zone: "Men's", size: "Large", status: "Available", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 2, num: "02", zone: "Men's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Ashley Bennett", memberId: "FP-1042", since: "2026-06-17", expiry: "2027-03-17", notes: "", history: [] },
  { id: 3, num: "03", zone: "Men's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Marcus Coleman", memberId: "FP-1087", since: "2026-06-04", expiry: "2026-09-04", notes: "", history: [] },
  { id: 4, num: "04", zone: "Men's", size: "Large", status: "Available", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 5, num: "05", zone: "Men's", size: "Medium", status: "Reserved", key: "RFID Band", deposit: 25, member: "Sofia Delgado", memberId: "FP-1103", since: "2026-05-09", expiry: "2027-02-09", notes: "", history: [] },
  { id: 6, num: "06", zone: "Men's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Tyler Brooks", memberId: "FP-1156", since: "2026-04-26", expiry: "2026-07-26", notes: "", history: [] },
  { id: 7, num: "07", zone: "Men's", size: "Large", status: "Available", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 8, num: "08", zone: "Men's", size: "Medium", status: "Maintenance", key: "RFID Band", deposit: 25, member: null, memberId: null, since: null, expiry: null, notes: "Lock jammed — awaiting spare part", history: [{ date: "2026-07-13", action: "Reported Faulty", note: "Lock jammed — awaiting spare part", tech: "Corey Doyle" }] },
  { id: 9, num: "09", zone: "Men's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Megan Sullivan", memberId: "FP-1198", since: "2026-06-16", expiry: "2026-09-16", notes: "", history: [] },
  { id: 10, num: "10", zone: "Men's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Ethan Walsh", memberId: "FP-1204", since: "2026-06-03", expiry: "2026-12-03", notes: "", history: [] },
  { id: 11, num: "11", zone: "Men's", size: "Medium", status: "Available", key: "RFID Band", deposit: 25, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 12, num: "12", zone: "Men's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Olivia Chen", memberId: "FP-1251", since: "2026-05-08", expiry: "2026-08-08", notes: "", history: [] },
  { id: 13, num: "13", zone: "Men's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Cameron Reid", memberId: "FP-1289", since: "2026-04-25", expiry: "2026-10-25", notes: "", history: [] },
  { id: 14, num: "14", zone: "Men's", size: "Medium", status: "Available", key: "RFID Band", deposit: 25, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 15, num: "15", zone: "Men's", size: "Small", status: "Reserved", key: "Key & Lock", deposit: 15, member: "Amara Osei", memberId: "FP-1310", since: "2026-06-28", expiry: "2026-09-28", notes: "", history: [] },
  { id: 16, num: "16", zone: "Men's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Derek Lawson", memberId: "FP-1344", since: "2026-06-15", expiry: "2026-12-15", notes: "", history: [] },
  { id: 17, num: "17", zone: "Men's", size: "Medium", status: "Available", key: "RFID Band", deposit: 25, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 18, num: "18", zone: "Men's", size: "Small", status: "Maintenance", key: "Key & Lock", deposit: 15, member: null, memberId: null, since: null, expiry: null, notes: "Lock jammed — awaiting spare part", history: [{ date: "2026-07-03", action: "Reported Faulty", note: "Lock jammed — awaiting spare part", tech: "Facilities Team" }] },
  { id: 19, num: "19", zone: "Men's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Tara Lindqvist", memberId: "FP-1372", since: "2026-05-07", expiry: "2026-11-07", notes: "", history: [] },
  { id: 20, num: "20", zone: "Men's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Bryce Sutton", memberId: "FP-1401", since: "2026-04-24", expiry: "2027-01-24", notes: "", history: [] },
  { id: 21, num: "21", zone: "Men's", size: "Small", status: "Available", key: "Key & Lock", deposit: 15, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 22, num: "22", zone: "Men's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Ashley Bennett", memberId: "FP-1042", since: "2026-06-27", expiry: "2026-12-27", notes: "", history: [] },
  { id: 23, num: "23", zone: "Men's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Marcus Coleman", memberId: "FP-1087", since: "2026-06-14", expiry: "2027-03-14", notes: "", history: [] },
  { id: 24, num: "24", zone: "Men's", size: "Small", status: "Available", key: "Key & Lock", deposit: 15, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 25, num: "25", zone: "Men's", size: "Large", status: "Reserved", key: "Digital PIN", deposit: 40, member: "Sofia Delgado", memberId: "FP-1103", since: "2026-05-19", expiry: "2026-11-19", notes: "", history: [] },
  { id: 26, num: "26", zone: "Men's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Tyler Brooks", memberId: "FP-1156", since: "2026-05-06", expiry: "2027-02-06", notes: "", history: [] },
  { id: 27, num: "27", zone: "Men's", size: "Small", status: "Available", key: "Key & Lock", deposit: 15, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 28, num: "28", zone: "Men's", size: "Large", status: "Maintenance", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "Lock jammed — awaiting spare part", history: [{ date: "2026-07-13", action: "Reported Faulty", note: "Lock jammed — awaiting spare part", tech: "Corey Doyle" }] },
  { id: 29, num: "29", zone: "Men's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Megan Sullivan", memberId: "FP-1198", since: "2026-06-26", expiry: "2027-03-26", notes: "", history: [] },
  { id: 30, num: "30", zone: "Men's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Ethan Walsh", memberId: "FP-1204", since: "2026-06-13", expiry: "2026-09-13", notes: "", history: [] },
  { id: 31, num: "31", zone: "Women's", size: "Large", status: "Available", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 32, num: "32", zone: "Women's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Olivia Chen", memberId: "FP-1251", since: "2026-05-18", expiry: "2027-02-18", notes: "", history: [] },
  { id: 33, num: "33", zone: "Women's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Cameron Reid", memberId: "FP-1289", since: "2026-05-05", expiry: "2026-08-05", notes: "", history: [] },
  { id: 34, num: "34", zone: "Women's", size: "Large", status: "Available", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 35, num: "35", zone: "Women's", size: "Medium", status: "Reserved", key: "RFID Band", deposit: 25, member: "Amara Osei", memberId: "FP-1310", since: "2026-07-08", expiry: "2027-04-08", notes: "", history: [] },
  { id: 36, num: "36", zone: "Women's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Derek Lawson", memberId: "FP-1344", since: "2026-06-25", expiry: "2026-09-25", notes: "", history: [] },
  { id: 37, num: "37", zone: "Women's", size: "Large", status: "Available", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 38, num: "38", zone: "Women's", size: "Medium", status: "Maintenance", key: "RFID Band", deposit: 25, member: null, memberId: null, since: null, expiry: null, notes: "Lock jammed — awaiting spare part", history: [{ date: "2026-07-03", action: "Reported Faulty", note: "Lock jammed — awaiting spare part", tech: "Facilities Team" }] },
  { id: 39, num: "39", zone: "Women's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Tara Lindqvist", memberId: "FP-1372", since: "2026-05-17", expiry: "2026-08-17", notes: "", history: [] },
  { id: 40, num: "40", zone: "Women's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Bryce Sutton", memberId: "FP-1401", since: "2026-05-04", expiry: "2026-11-04", notes: "", history: [] },
  { id: 41, num: "41", zone: "Women's", size: "Medium", status: "Available", key: "RFID Band", deposit: 25, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 42, num: "42", zone: "Women's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Ashley Bennett", memberId: "FP-1042", since: "2026-07-07", expiry: "2026-10-07", notes: "", history: [] },
  { id: 43, num: "43", zone: "Women's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Marcus Coleman", memberId: "FP-1087", since: "2026-06-24", expiry: "2026-12-24", notes: "", history: [] },
  { id: 44, num: "44", zone: "Women's", size: "Medium", status: "Available", key: "RFID Band", deposit: 25, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 45, num: "45", zone: "Women's", size: "Small", status: "Reserved", key: "Key & Lock", deposit: 15, member: "Sofia Delgado", memberId: "FP-1103", since: "2026-05-29", expiry: "2026-08-29", notes: "", history: [] },
  { id: 46, num: "46", zone: "Women's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Tyler Brooks", memberId: "FP-1156", since: "2026-05-16", expiry: "2026-11-16", notes: "", history: [] },
  { id: 47, num: "47", zone: "Women's", size: "Medium", status: "Available", key: "RFID Band", deposit: 25, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 48, num: "48", zone: "Women's", size: "Small", status: "Maintenance", key: "Key & Lock", deposit: 15, member: null, memberId: null, since: null, expiry: null, notes: "Lock jammed — awaiting spare part", history: [{ date: "2026-07-13", action: "Reported Faulty", note: "Lock jammed — awaiting spare part", tech: "Corey Doyle" }] },
  { id: 49, num: "49", zone: "Women's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Megan Sullivan", memberId: "FP-1198", since: "2026-07-06", expiry: "2027-01-06", notes: "", history: [] },
  { id: 50, num: "50", zone: "Women's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Ethan Walsh", memberId: "FP-1204", since: "2026-06-23", expiry: "2027-03-23", notes: "", history: [] },
  { id: 51, num: "51", zone: "Women's", size: "Small", status: "Available", key: "Key & Lock", deposit: 15, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 52, num: "52", zone: "Women's", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Olivia Chen", memberId: "FP-1251", since: "2026-05-28", expiry: "2026-11-28", notes: "", history: [] },
  { id: 53, num: "53", zone: "Women's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Cameron Reid", memberId: "FP-1289", since: "2026-05-15", expiry: "2027-02-15", notes: "", history: [] },
  { id: 54, num: "54", zone: "Women's", size: "Small", status: "Available", key: "Key & Lock", deposit: 15, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 55, num: "55", zone: "Women's", size: "Large", status: "Reserved", key: "Digital PIN", deposit: 40, member: "Amara Osei", memberId: "FP-1310", since: "2026-04-19", expiry: "2026-10-19", notes: "", history: [] },
  { id: 56, num: "56", zone: "Women's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Derek Lawson", memberId: "FP-1344", since: "2026-07-05", expiry: "2027-04-05", notes: "", history: [] },
  { id: 57, num: "57", zone: "Women's", size: "Small", status: "Available", key: "Key & Lock", deposit: 15, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 58, num: "58", zone: "Women's", size: "Large", status: "Maintenance", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "Lock jammed — awaiting spare part", history: [{ date: "2026-07-03", action: "Reported Faulty", note: "Lock jammed — awaiting spare part", tech: "Facilities Team" }] },
  { id: 59, num: "59", zone: "Women's", size: "Medium", status: "Occupied", key: "RFID Band", deposit: 25, member: "Tara Lindqvist", memberId: "FP-1372", since: "2026-05-27", expiry: "2027-02-27", notes: "", history: [] },
  { id: 60, num: "60", zone: "Women's", size: "Small", status: "Occupied", key: "Key & Lock", deposit: 15, member: "Bryce Sutton", memberId: "FP-1401", since: "2026-05-14", expiry: "2026-08-14", notes: "", history: [] },
  { id: 61, num: "61", zone: "Premium", size: "XL", status: "Available", key: "Digital PIN", deposit: 75, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 62, num: "62", zone: "Premium", size: "Large", status: "Occupied", key: "RFID Band", deposit: 40, member: "Ashley Bennett", memberId: "FP-1042", since: "2026-04-18", expiry: "2027-01-18", notes: "", history: [] },
  { id: 63, num: "63", zone: "Premium", size: "XL", status: "Occupied", key: "Key & Lock", deposit: 75, member: "Marcus Coleman", memberId: "FP-1087", since: "2026-07-04", expiry: "2026-10-04", notes: "", history: [] },
  { id: 64, num: "64", zone: "Premium", size: "Large", status: "Available", key: "Digital PIN", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 65, num: "65", zone: "Premium", size: "XL", status: "Reserved", key: "RFID Band", deposit: 75, member: "Sofia Delgado", memberId: "FP-1103", since: "2026-06-08", expiry: "2027-03-08", notes: "", history: [] },
  { id: 66, num: "66", zone: "Premium", size: "Large", status: "Occupied", key: "Key & Lock", deposit: 40, member: "Tyler Brooks", memberId: "FP-1156", since: "2026-05-26", expiry: "2026-08-26", notes: "", history: [] },
  { id: 67, num: "67", zone: "Premium", size: "XL", status: "Available", key: "Digital PIN", deposit: 75, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 68, num: "68", zone: "Premium", size: "Large", status: "Maintenance", key: "RFID Band", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "Lock jammed — awaiting spare part", history: [{ date: "2026-07-13", action: "Reported Faulty", note: "Lock jammed — awaiting spare part", tech: "Corey Doyle" }] },
  { id: 69, num: "69", zone: "Premium", size: "XL", status: "Occupied", key: "Key & Lock", deposit: 75, member: "Megan Sullivan", memberId: "FP-1198", since: "2026-04-17", expiry: "2026-07-17", notes: "", history: [] },
  { id: 70, num: "70", zone: "Premium", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Ethan Walsh", memberId: "FP-1204", since: "2026-07-03", expiry: "2027-01-03", notes: "", history: [] },
  { id: 71, num: "71", zone: "Premium", size: "XL", status: "Available", key: "RFID Band", deposit: 75, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 72, num: "72", zone: "Premium", size: "Large", status: "Occupied", key: "Key & Lock", deposit: 40, member: "Olivia Chen", memberId: "FP-1251", since: "2026-06-07", expiry: "2026-09-07", notes: "", history: [] },
  { id: 73, num: "73", zone: "Premium", size: "XL", status: "Occupied", key: "Digital PIN", deposit: 75, member: "Cameron Reid", memberId: "FP-1289", since: "2026-05-25", expiry: "2026-11-25", notes: "", history: [] },
  { id: 74, num: "74", zone: "Premium", size: "Large", status: "Available", key: "RFID Band", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 75, num: "75", zone: "Premium", size: "XL", status: "Reserved", key: "Key & Lock", deposit: 75, member: "Amara Osei", memberId: "FP-1310", since: "2026-04-29", expiry: "2026-07-29", notes: "", history: [] },
  { id: 76, num: "76", zone: "Premium", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Derek Lawson", memberId: "FP-1344", since: "2026-04-16", expiry: "2026-10-16", notes: "", history: [] },
  { id: 77, num: "77", zone: "Premium", size: "XL", status: "Available", key: "RFID Band", deposit: 75, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 78, num: "78", zone: "Premium", size: "Large", status: "Maintenance", key: "Key & Lock", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "Lock jammed — awaiting spare part", history: [{ date: "2026-07-03", action: "Reported Faulty", note: "Lock jammed — awaiting spare part", tech: "Facilities Team" }] },
  { id: 79, num: "79", zone: "Premium", size: "XL", status: "Occupied", key: "Digital PIN", deposit: 75, member: "Tara Lindqvist", memberId: "FP-1372", since: "2026-06-06", expiry: "2026-12-06", notes: "", history: [] },
  { id: 80, num: "80", zone: "Premium", size: "Large", status: "Occupied", key: "RFID Band", deposit: 40, member: "Bryce Sutton", memberId: "FP-1401", since: "2026-05-24", expiry: "2027-02-24", notes: "", history: [] },
  { id: 81, num: "81", zone: "Premium", size: "XL", status: "Available", key: "Key & Lock", deposit: 75, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
  { id: 82, num: "82", zone: "Premium", size: "Large", status: "Occupied", key: "Digital PIN", deposit: 40, member: "Ashley Bennett", memberId: "FP-1042", since: "2026-04-28", expiry: "2026-10-28", notes: "", history: [] },
  { id: 83, num: "83", zone: "Premium", size: "XL", status: "Occupied", key: "RFID Band", deposit: 75, member: "Marcus Coleman", memberId: "FP-1087", since: "2026-04-15", expiry: "2027-01-15", notes: "", history: [] },
  { id: 84, num: "84", zone: "Premium", size: "Large", status: "Available", key: "Key & Lock", deposit: 40, member: null, memberId: null, since: null, expiry: null, notes: "", history: [] },
];
