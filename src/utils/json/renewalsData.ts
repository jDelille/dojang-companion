import type {
  RenewalBucket,
  RenewalMember,
  RenewalPeriod,
  RenewalStage,
} from "../../types/renewals";

export type StageMeta = {
  key: RenewalStage;
  short: string;
  color: string;
  icon: string;
};

export const RENEWAL_STAGES: StageMeta[] = [
  { key: "Not Contacted", short: "New", color: "#6B7280", icon: "circle" },
  { key: "Reminded", short: "SMS", color: "#22D3EE", icon: "bell" },
  { key: "Called", short: "Call", color: "#818CF8", icon: "phone" },
  { key: "Renewed", short: "Won", color: "#4ADE80", icon: "check" },
];

export const BUCKET_BADGE: Record<RenewalBucket, string> = {
  "Due Soon": "badge-late",
  Overdue: "badge-absent",
  Lapsed: "badge-inactive",
  Renewed: "badge-present",
};

export const PERIOD_OPTIONS: RenewalPeriod[] = [
  "Monthly",
  "Quarterly",
  "Annual",
  "Student",
];

export type PlanOption = { label: string; price: number; period: RenewalPeriod };

export const RENEWAL_PLAN_OPTIONS: PlanOption[] = [
  { label: "Monthly Standard — $49", price: 49, period: "Monthly" },
  { label: "Quarterly Gold — $129", price: 129, period: "Quarterly" },
  { label: "Annual Premium — $449", price: 449, period: "Annual" },
  { label: "Student Plan — $29", price: 29, period: "Student" },
];

export const PAYMENT_OPTIONS = ["Cash", "Card", "Apple Pay", "Wallet"];

export const REMINDER_CHANNELS = ["SMS", "Email", "WhatsApp"];

export const CAMPAIGN_CHANNELS = ["Email", "SMS", "WhatsApp"];

export const CAMPAIGN_AUDIENCES = [
  "All pending renewals",
  "Due Soon (30 days)",
  "Overdue",
  "Lapsed",
];

export const CAMPAIGN_OFFERS = [
  "None",
  "10% off renewal",
  "Free PT session",
  "1 month free",
];

export const DEFAULT_RENEWAL_MESSAGE =
  "Hi! Your Dreams GYM membership is expiring soon. Renew today to keep your streak going 💪";

export const RENEWAL_TAX_RATE = 0.0825;

export const RENEWAL_MEMBERS: RenewalMember[] = [
  { id: 1, name: "Marcus Coleman", plan: "Monthly Standard", period: "Monthly", days: 3, value: 49, last: "1 day ago", stage: "Reminded" },
  { id: 2, name: "Brooke Carter", plan: "Student Plan", period: "Student", days: -12, value: 29, last: "3 days ago", stage: "Called" },
  { id: 3, name: "Jessica Ramirez", plan: "Quarterly Gold", period: "Quarterly", days: 8, value: 129, last: "Never", stage: "Not Contacted" },
  { id: 4, name: "Nathan Miller", plan: "Annual Premium", period: "Annual", days: 2, value: 449, last: "2 hr ago", stage: "Called" },
  { id: 5, name: "Natalie Rivera", plan: "Monthly Standard", period: "Monthly", days: -4, value: 49, last: "Yesterday", stage: "Reminded" },
  { id: 6, name: "Ethan Walsh", plan: "Quarterly Gold", period: "Quarterly", days: 15, value: 129, last: "Never", stage: "Not Contacted" },
  { id: 7, name: "Tyler Brooks", plan: "Annual Premium", period: "Annual", days: -21, value: 449, last: "1 week ago", stage: "Called" },
  { id: 8, name: "Megan Sullivan", plan: "Monthly Standard", period: "Monthly", days: 6, value: 49, last: "4 hr ago", stage: "Renewed" },
  { id: 9, name: "Ashley Bennett", plan: "Annual Premium", period: "Annual", days: 18, value: 449, last: "Never", stage: "Not Contacted" },
  { id: 10, name: "Cameron Reid", plan: "Student Plan", period: "Student", days: -30, value: 29, last: "2 weeks ago", stage: "Not Contacted" },
  { id: 11, name: "Olivia Chen", plan: "Quarterly Gold", period: "Quarterly", days: 4, value: 129, last: "Today", stage: "Reminded" },
  { id: 12, name: "Jordan Blake", plan: "Annual Premium", period: "Annual", days: 25, value: 449, last: "2 days ago", stage: "Renewed" },
];
