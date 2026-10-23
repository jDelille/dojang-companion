import type { DayPass, PassStatus, PassType } from "../../types/dayPasses";

export const PASS_STATUS_BADGE: Record<PassStatus, string> = {
  Active: "badge-present",
  Used: "badge-inactive",
  Converted: "badge-active",
};

export const PASS_TYPES: PassType[] = [
  { name: "Day Pass", fee: 20, icon: "sun", desc: "Single full-day entry" },
  { name: "Trial Pass", fee: 0, icon: "gift", desc: "Free first visit for leads" },
  { name: "Guest Pass", fee: 15, icon: "users", desc: "Member-invited guest" },
  { name: "Class Drop-in", fee: 25, icon: "calendar-check", desc: "One group class" },
  { name: "Weekly Pass", fee: 60, icon: "calendar-days", desc: "7 consecutive days" },
];

export const PAYMENT_OPTIONS = ["Cash", "Card", "Apple Pay", "Wallet"];

export const PASS_STATUS_OPTIONS: PassStatus[] = ["Active", "Used", "Converted"];

export const CONVERT_PLANS = [
  { label: "Monthly Standard — $49", price: 49 },
  { label: "Quarterly Gold — $129", price: 129 },
  { label: "Annual Premium — $449", price: 449 },
  { label: "Student Plan — $29", price: 29 },
];

export const RENEW_DURATIONS = [
  { label: "1 more day — $20", price: 20 },
  { label: "3 days — $45", price: 45 },
  { label: "1 week — $60", price: 60 },
];

export const PASS_TAX_RATE = 0.0825;

export const DAY_PASSES: DayPass[] = [
  { id: 1, code: "DP-7202", name: "Julian Cross", phone: "(512) 555-0118", type: "Day Pass", checkin: "10:24 AM", status: "Active", ref: "Ashley Bennett", fee: 20 },
  { id: 2, code: "DP-7203", name: "Nina Kowalski", phone: "(213) 555-0119", type: "Trial Pass", checkin: "09:58 AM", status: "Active", ref: "", fee: 0 },
  { id: 3, code: "DP-7204", name: "Blake Sanders", phone: "(415) 555-0120", type: "Guest Pass", checkin: "09:15 AM", status: "Active", ref: "Jessica Ramirez", fee: 15 },
  { id: 4, code: "DP-7205", name: "Erica Vaughn", phone: "(303) 555-0121", type: "Class Drop-in", checkin: "08:40 AM", status: "Used", ref: "", fee: 25 },
  { id: 5, code: "DP-7206", name: "Trevor Mason", phone: "(206) 555-0122", type: "Day Pass", checkin: "08:05 AM", status: "Used", ref: "", fee: 20 },
  { id: 6, code: "DP-7207", name: "Alyssa Reyes", phone: "(305) 555-0123", type: "Trial Pass", checkin: "Yesterday", status: "Converted", ref: "Marcus Coleman", fee: 0 },
  { id: 7, code: "DP-7208", name: "Omar Haddad", phone: "(512) 555-0124", type: "Weekly Pass", checkin: "Yesterday", status: "Active", ref: "", fee: 60 },
  { id: 8, code: "DP-7209", name: "Paige Donovan", phone: "(213) 555-0125", type: "Guest Pass", checkin: "Yesterday", status: "Converted", ref: "Megan Sullivan", fee: 15 },
  { id: 9, code: "DP-7210", name: "Shawn Whitaker", phone: "(415) 555-0126", type: "Day Pass", checkin: "Yesterday", status: "Used", ref: "", fee: 20 },
];
