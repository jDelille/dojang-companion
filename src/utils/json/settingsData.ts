import type {
  ApiKey,
  Backup,
  Invoice,
  NotificationKey,
  Session,
  SettingsModel,
  SettingsSection,
  SettingsTab,
} from "../../types/settings";

/*
   Settings seed data — ported verbatim from tailwind/src/assets/js/settings.js
   (domain constants, DEFAULTS, SESSIONS, INVOICES, API_KEYS, BACKUPS, and the
   appearance option lists). Every default field value the JS holds is preserved.
*/

export const TODAY = "2026-07-14";

export const SECTIONS: SettingsSection[] = [
  "profile",
  "business",
  "notifications",
  "security",
  "billing",
  "appearance",
  "smtp",
  "data",
];

export const SECTION_LABEL: Record<SettingsSection, string> = {
  profile: "Profile",
  business: "Business",
  notifications: "Notifications",
  security: "Security",
  billing: "Billing",
  appearance: "Appearance",
  smtp: "API & Email",
  data: "Data",
};

/** Which nav tab owns each model section, for the dirty dots. */
export const SECTION_TAB: Record<SettingsSection, SettingsTab> = {
  profile: "profile",
  business: "business",
  notifications: "notifications",
  security: "security",
  billing: "billing",
  appearance: "appearance",
  smtp: "api",
  data: "data",
};

export const CURRENCIES = [
  "$ USD — US Dollar",
  "€ EUR — Euro",
  "£ GBP — Pound Sterling",
  "$ CAD — Canadian Dollar",
  "$ AUD — Australian Dollar",
];

export const TIMEZONES = [
  "ET (GMT-5:00)",
  "CT (GMT-6:00)",
  "MT (GMT-7:00)",
  "PT (GMT-8:00)",
  "AKT (GMT-9:00)",
  "HT (GMT-10:00)",
];

export const TIMEOUTS = [
  { value: "15", label: "15 minutes" },
  { value: "30", label: "30 minutes" },
  { value: "60", label: "1 hour" },
  { value: "480", label: "8 hours" },
  { value: "0", label: "Never" },
];

export const ENCRYPTIONS = ["TLS", "SSL", "None"];

export const THEMES = [
  { id: "dark", label: "Default", sw: "sw-dark" },
  { id: "charcoal", label: "Charcoal", sw: "sw-charcoal" },
  { id: "grey", label: "Gray", sw: "sw-grey" },
  { id: "white", label: "Pure", sw: "sw-white" },
  { id: "stone", label: "Stone", sw: "sw-stone" },
  { id: "slate", label: "Slate", sw: "sw-slate" },
  { id: "midnight", label: "Midnight", sw: "sw-midnight" },
  { id: "emerald", label: "Emerald", sw: "sw-emerald" },
  { id: "violet", label: "Violet", sw: "sw-violet" },
  { id: "amber", label: "Amber", sw: "sw-amber" },
  { id: "rose", label: "Rose", sw: "sw-rose" },
];

export const ACCENTS = [
  { id: "gold", cls: "ac-gold" },
  { id: "emerald", cls: "ac-emerald" },
  { id: "royal", cls: "ac-royal" },
  { id: "cyan", cls: "ac-cyan" },
  { id: "ruby", cls: "ac-ruby" },
  { id: "amber", cls: "ac-amber" },
  { id: "violet", cls: "ac-violet" },
];

export const AV_COLORS = ["av-gold", "av-purple", "av-orange", "av-cyan", "av-green", "av-red"];

export const NOTIF_DEFS: { key: NotificationKey; label: string; desc: string }[] = [
  { key: "newMembers", label: "New Member Registrations", desc: "When a new member signs up" },
  { key: "payments", label: "Payment Received", desc: "Successful payments & renewals" },
  { key: "lowStock", label: "Low Stock Alerts", desc: "When products fall below reorder level" },
  { key: "expiries", label: "Membership Expiries", desc: "Upcoming and lapsed memberships" },
  { key: "bookings", label: "Class Bookings", desc: "When members book or cancel classes" },
  { key: "dailyEmail", label: "Daily Summary Email", desc: "End-of-day revenue & activity digest" },
  { key: "marketing", label: "Marketing Updates", desc: "Product news and feature announcements" },
];

export const PLANS = [
  { id: "Starter", price: 49, ic: "zap", tint: "ic-cyan", col: "c-cyan", hint: "Up to 300 members · 1 branch" },
  { id: "Growth", price: 99, ic: "trending-up", tint: "ic-purple", col: "c-purple", hint: "Up to 1,000 members · 3 branches" },
  { id: "Enterprise", price: 199, ic: "crown", tint: "ic-gold", col: "c-gold", hint: "Unlimited members · 6 branches · Priority support" },
];

export const KEY_SCOPES = [
  { id: "read", label: "Read", hint: "View members, classes and reports" },
  { id: "write", label: "Write", hint: "Create and update records" },
  { id: "billing", label: "Billing", hint: "Access invoices and payments" },
];

export const KEY_EXPIRY = [
  { value: "30", label: "30 days" },
  { value: "90", label: "90 days" },
  { value: "365", label: "1 year" },
  { value: "0", label: "Never expires" },
];

export const EX_FORMATS = [
  { id: "json", ic: "file-json", tint: "ic-cyan", col: "c-cyan", label: "JSON", hint: "Re-importable configuration file" },
  { id: "csv", ic: "file-spreadsheet", tint: "ic-green", col: "c-green", label: "CSV", hint: "Flat key/value list for spreadsheets" },
];

export const IMPORT_MODES = [
  { id: "merge", ic: "git-merge", tint: "ic-gold", col: "c-gold", label: "Merge", hint: "Only overwrite keys present in the file" },
  { id: "replace", ic: "replace", tint: "ic-orange", col: "c-orange", label: "Replace", hint: "Reset everything, then apply the file" },
];

export const MODES = [
  { id: "light", label: "Light", sub: "Default", icon: "sun" },
  { id: "dark", label: "Dark", sub: "Deep & focused", icon: "moon" },
  { id: "system", label: "System", sub: "Match device", icon: "monitor" },
];

export const SIDEBARS = [
  { id: "auto", label: "Auto", sub: "Match theme", icon: "contrast" },
  { id: "dark", label: "Dark", sub: "Deep charcoal", icon: "moon" },
  { id: "light", label: "Light", sub: "Clean white", icon: "sun" },
  { id: "accent", label: "Accent", sub: "Brand colour", icon: "palette" },
];

export const HEADERS = [
  { id: "auto", label: "Auto", sub: "Match theme", icon: "contrast" },
  { id: "glass", label: "Glass", sub: "Blurred & layered", icon: "layers" },
  { id: "solid", label: "Default", sub: "Opaque fill", icon: "square" },
  { id: "transparent", label: "Transparent", sub: "No background", icon: "eye" },
  { id: "bordered", label: "Bordered", sub: "Hairline rule", icon: "panel-top" },
];

export const WIDTH_SEG = [
  { id: "full", label: "Full" },
  { id: "wide", label: "Wide" },
  { id: "boxed", label: "Boxed" },
];

export const RADIUS_SEG = [
  { id: "sharp", label: "Sharp" },
  { id: "small", label: "Small" },
  { id: "default", label: "Default" },
  { id: "large", label: "Large" },
];

export const FONT_SEG = [
  { id: "small", label: "Small" },
  { id: "default", label: "Default" },
  { id: "large", label: "Large" },
];

export const AP_LABEL: Record<string, string> = {
  mode: "Theme mode",
  accent: "Accent",
  theme: "Surface tint",
  sidebar: "Sidebar",
  header: "Header",
  fixedHeader: "Fixed header",
  width: "Layout width",
  radius: "Border radius",
  font: "Font size",
  animations: "Animations",
  compact: "Compact mode",
};

/** The API tab owns two model sections; Data owns one. */
export const tabSection = (tab: SettingsTab): SettingsSection =>
  tab === "api" ? "smtp" : (SECTIONS as string[]).indexOf(tab) >= 0 ? (tab as SettingsSection) : "profile";

/* ---------- Factory defaults ---------- */
export const DEFAULTS: SettingsModel = {
  profile: {
    name: "Nathan Reeves",
    email: "nathan@example.com",
    phone: "(512) 555-0118",
    role: "Super Admin",
    bio: "Gym owner & fitness enthusiast running Dreams GYM across 6 branches.",
    avatar: "av-gold",
    photo: "",
  },
  business: {
    gymName: "Dreams GYM",
    ein: "47-1234567",
    email: "hello@example.com",
    phone: "1-800-555-0199",
    currency: CURRENCIES[0],
    timezone: TIMEZONES[0],
    address: "400 Congress Ave, Austin, TX 78701",
  },
  notifications: {
    newMembers: true,
    payments: true,
    lowStock: true,
    expiries: true,
    bookings: false,
    dailyEmail: true,
    marketing: false,
  },
  security: { twoFactor: true, loginAlerts: true, timeout: "30" },
  billing: {
    plan: "Enterprise",
    card: { last4: "4821", exp: "09/28", bank: "Chase", name: "Nathan Reeves" },
  },
  appearance: {
    mode: "light",
    accent: "gold",
    theme: "dark",
    sidebar: "auto",
    header: "auto",
    fixedHeader: true,
    width: "full",
    radius: "default",
    font: "default",
    animations: true,
    compact: false,
    autoCollapse: true,
  },
  smtp: {
    host: "smtp.sendgrid.net",
    port: 587,
    user: "apikey",
    from: "no-reply@example.com",
    encryption: "TLS",
  },
  data: { autoBackup: true },
};

/* ---------- Non-versioned side data ---------- */
export const SESSIONS: Session[] = [
  { id: 1, device: "Chrome · Windows 11", where: "Austin, TX", ip: "103.21.44.8", last: "Active now", current: true },
  { id: 2, device: "Safari · iPhone 15", where: "Austin, TX", ip: "103.21.44.9", last: "2 hours ago", current: false },
  { id: 3, device: "Firefox · macOS", where: "Los Angeles, IN", ip: "49.36.12.77", last: "Yesterday", current: false },
];

export const INVOICES: Invoice[] = [
  { id: "INV-2026-07", date: "2026-07-01", amount: 199, status: "Paid" },
  { id: "INV-2026-06", date: "2026-06-01", amount: 199, status: "Paid" },
  { id: "INV-2026-05", date: "2026-05-01", amount: 199, status: "Paid" },
  { id: "INV-2026-04", date: "2026-04-01", amount: 99, status: "Paid" },
  { id: "INV-2026-03", date: "2026-03-01", amount: 99, status: "Refunded" },
];

export const API_KEYS: ApiKey[] = [
  { id: 1, name: "Website booking widget", prefix: "fp_live_a91c", scopes: ["read"], created: "2026-05-12", lastUsed: "2026-07-13", expires: "2027-05-12" },
  { id: 2, name: "Zapier automation", prefix: "fp_live_7d40", scopes: ["read", "write"], created: "2026-06-02", lastUsed: "2026-07-10", expires: null },
];

export const BACKUPS: Backup[] = [
  { id: 1, name: "Nightly backup", at: "2026-07-14T02:00", size: "48 KB", auto: true },
  { id: 2, name: "Nightly backup", at: "2026-07-13T02:00", size: "47 KB", auto: true },
  { id: 3, name: "Before plan change", at: "2026-07-09T16:24", size: "46 KB", auto: false },
];

export const DEL_PHRASE = "DELETE";

/* ---------- Formatting helpers ---------- */
const MON_SHORT = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

export const fmtDate = (s: string | null | undefined): string => {
  if (!s) return "—";
  const p = String(s).split("T")[0].split("-");
  return Number(p[2]) + " " + MON_SHORT[Number(p[1]) - 1] + " " + p[0];
};

export const fmtDateTime = (s: string | null | undefined): string =>
  s ? fmtDate(s) + " · " + (String(s).split("T")[1] || "") : "—";

export const inr = (n: number): string => "$" + Number(n || 0).toLocaleString("en-US");

export const initials = (n: string): string =>
  String(n || "")
    .trim()
    .split(/\s+/)
    .slice(0, 2)
    .map((w) => w[0] || "")
    .join("")
    .toUpperCase() || "?";
