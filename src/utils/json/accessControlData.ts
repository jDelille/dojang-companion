import type {
  AccessDevice,
  AccessEvent,
  AccessEventType,
  AccessLevel,
  Role,
} from "../../types/accessControl";

/*
   Access Control seed data — ported verbatim from
   tailwind/src/assets/js/access-control.js (DEVICES, EVENTS, ROLES, MODULES,
   LEVELS, METHOD_ICON keys, TYPE_META, LEVEL_BADGE, AV). Events keep the E()
   1-based id sequence; roles the R() sequence.
*/

export const CAPACITY = 250;

export const AV = ["av-gold", "av-purple", "av-orange", "av-cyan", "av-green", "av-red"];
export const avatarFor = (id: number) => AV[id % AV.length];

export const DEVICES: AccessDevice[] = [
  { name: "Main Entrance", type: "Turnstile", method: "RFID + Face", status: "Online", icon: "door-open", battery: 100 },
  { name: "Gym Floor", type: "Door", method: "RFID", status: "Online", icon: "scan-line", battery: 88 },
  { name: "Studio Wing", type: "Door", method: "PIN + RFID", status: "Online", icon: "key-round", battery: 62 },
  { name: "Staff Only", type: "Door", method: "Fingerprint", status: "Offline", icon: "fingerprint", battery: 0 },
];

export const EVENTS: AccessEvent[] = [
  { id: 1, name: "Ashley Bennett", door: "Main Entrance", method: "RFID", type: "Granted", time: "10:24:12 AM", reason: "" },
  { id: 2, name: "Daniel Foster", door: "Staff Only", method: "Fingerprint", type: "Granted", time: "10:22:40 AM", reason: "" },
  { id: 3, name: "Unknown Card", door: "Main Entrance", method: "RFID", type: "Denied", time: "10:21:05 AM", reason: "Invalid card" },
  { id: 4, name: "Marcus Coleman", door: "Gym Floor", method: "RFID", type: "Granted", time: "10:19:33 AM", reason: "" },
  { id: 5, name: "Megan Sullivan", door: "Main Entrance", method: "Face", type: "Exit", time: "10:18:20 AM", reason: "" },
  { id: 6, name: "Tyler Brooks", door: "Studio Wing", method: "PIN", type: "Granted", time: "10:15:47 AM", reason: "" },
  { id: 7, name: "Natalie Rivera", door: "Main Entrance", method: "RFID", type: "Denied", time: "10:12:10 AM", reason: "Membership expired" },
  { id: 8, name: "Olivia Chen", door: "Main Entrance", method: "RFID", type: "Granted", time: "10:09:55 AM", reason: "" },
  { id: 9, name: "Guest — Julian", door: "Main Entrance", method: "Day Pass QR", type: "Granted", time: "10:06:38 AM", reason: "" },
  { id: 10, name: "Ethan Walsh", door: "Gym Floor", method: "RFID", type: "Exit", time: "10:03:12 AM", reason: "" },
  { id: 11, name: "Rachel Morgan", door: "Studio Wing", method: "RFID", type: "Granted", time: "09:58:44 AM", reason: "" },
  { id: 12, name: "Tailgater", door: "Gym Floor", method: "None", type: "Denied", time: "09:55:01 AM", reason: "No credential" },
  { id: 13, name: "Cameron Boyd", door: "Staff Only", method: "Fingerprint", type: "Granted", time: "09:51:29 AM", reason: "" },
  { id: 14, name: "Jordan Blake", door: "Main Entrance", method: "Face", type: "Granted", time: "09:48:13 AM", reason: "" },
];

export const TYPE_META: Record<
  AccessEventType,
  { badge: string; cls: string; color: string; icon: string }
> = {
  Granted: { badge: "badge-present", cls: "ic-green", color: "#4ADE80", icon: "log-in" },
  Denied: { badge: "badge-absent", cls: "ic-red", color: "#F87171", icon: "shield-alert" },
  Exit: { badge: "badge-inactive", cls: "ic-cyan", color: "#22D3EE", icon: "log-out" },
};

export const MODULES = [
  "Dashboard",
  "Members",
  "Billing",
  "Classes",
  "Trainers",
  "Inventory",
  "Reports",
  "Staff",
  "Access Control",
  "Settings",
];

export const LEVELS: AccessLevel[] = ["Full", "Elevated", "Standard", "Limited"];

export const ROLES: Role[] = [
  { id: 1, name: "Super Admin", desc: "Unrestricted access to every module", level: "Full", users: 2, icon: "shield-check", perms: MODULES.slice() },
  { id: 2, name: "Branch Manager", desc: "Manage operations, staff & reports", level: "Elevated", users: 4, icon: "briefcase", perms: ["Dashboard", "Members", "Billing", "Classes", "Trainers", "Inventory", "Reports", "Staff"] },
  { id: 3, name: "Trainer", desc: "Members, classes & training tools", level: "Standard", users: 18, icon: "dumbbell", perms: ["Dashboard", "Members", "Classes", "Trainers"] },
  { id: 4, name: "Receptionist", desc: "Front desk, check-in & billing", level: "Standard", users: 6, icon: "concierge-bell", perms: ["Dashboard", "Members", "Billing"] },
  { id: 5, name: "Accountant", desc: "Financials, billing & reports only", level: "Limited", users: 3, icon: "calculator", perms: ["Dashboard", "Billing", "Reports"] },
];

export const LEVEL_BADGE: Record<AccessLevel, string> = {
  Full: "badge-active",
  Elevated: "badge-present",
  Standard: "badge-inactive",
  Limited: "badge-expired",
};

export const UNLOCK_DURATIONS = ["5 seconds", "10 seconds", "30 seconds", "1 minute"];
