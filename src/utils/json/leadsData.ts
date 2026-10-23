import type {
  Lead,
  LeadInterest,
  LeadSource,
  LeadStage,
  LeadTemp,
} from "../../types/leads";


export type StageMeta = { key: LeadStage; label: string; color: string };

export const STAGES: StageMeta[] = [
  { key: "New", label: "New Enquiry", color: "#22D3EE" },
  { key: "Contacted", label: "Contacted", color: "#818CF8" },
  { key: "Trial", label: "Trial Booked", color: "#D4AF37" },
  { key: "Converted", label: "Converted", color: "#4ADE80" },
];

export const TEMP_CLASS: Record<LeadTemp, string> = {
  Hot: "temp-hot",
  Warm: "temp-warm",
  Cold: "temp-cold",
};

export const SRC_ICON: Record<LeadSource, string> = {
  "Walk-in": "footprints",
  Website: "globe",
  Instagram: "instagram",
  Referral: "users",
  "Google Ads": "megaphone",
  Phone: "phone",
};

export const SOURCE_OPTIONS: LeadSource[] = [
  "Walk-in",
  "Website",
  "Instagram",
  "Referral",
  "Google Ads",
  "Phone",
];

export const INTEREST_OPTIONS: LeadInterest[] = [
  "Monthly Membership",
  "Annual Membership",
  "Personal Training",
  "Yoga Classes",
  "CrossFit",
];

export const TEMP_OPTIONS: LeadTemp[] = ["Hot", "Warm", "Cold"];

export const OWNERS = ["Olivia Chen", "Tyler Brooks", "Megan Sullivan"];

export const LEADS: Lead[] = [
  { id: 1, name: "Julian Cross", phone: "(206) 555-0140", email: "julian@email.com", interest: "Annual Membership", source: "Website", temp: "Hot", stage: "New", owner: "Olivia Chen", when: "10 min ago" },
  { id: 2, name: "Nina Kowalski", phone: "(213) 555-0143", email: "nina@email.com", interest: "Personal Training", source: "Instagram", temp: "Hot", stage: "New", owner: "Tyler Brooks", when: "25 min ago" },
  { id: 3, name: "Blake Sanders", phone: "(415) 555-0144", email: "blake@email.com", interest: "Monthly Membership", source: "Walk-in", temp: "Warm", stage: "New", owner: "Megan Sullivan", when: "1 hr ago" },
  { id: 4, name: "Erica Vaughn", phone: "(303) 555-0145", email: "erica@email.com", interest: "Yoga Classes", source: "Referral", temp: "Warm", stage: "Contacted", owner: "Olivia Chen", when: "2 hr ago" },
  { id: 5, name: "Trevor Mason", phone: "(206) 555-0146", email: "trevor@email.com", interest: "CrossFit", source: "Google Ads", temp: "Cold", stage: "Contacted", owner: "Tyler Brooks", when: "3 hr ago" },
  { id: 6, name: "Alyssa Reyes", phone: "(305) 555-0147", email: "alyssa@email.com", interest: "Annual Membership", source: "Phone", temp: "Hot", stage: "Contacted", owner: "Megan Sullivan", when: "Yesterday" },
  { id: 7, name: "Omar Haddad", phone: "(415) 555-0156", email: "omar@email.com", interest: "Personal Training", source: "Instagram", temp: "Hot", stage: "Trial", owner: "Olivia Chen", when: "Yesterday" },
  { id: 8, name: "Natalie Rivera", phone: "(206) 555-0158", email: "divya2@email.com", interest: "Monthly Membership", source: "Website", temp: "Warm", stage: "Trial", owner: "Tyler Brooks", when: "2 days ago" },
  { id: 9, name: "Logan Pratt", phone: "(305) 555-0159", email: "arjunr@email.com", interest: "Yoga Classes", source: "Walk-in", temp: "Warm", stage: "Converted", owner: "Megan Sullivan", when: "3 days ago" },
  { id: 10, name: "Paige Donovan", phone: "(512) 555-0160", email: "paige@email.com", interest: "Annual Membership", source: "Referral", temp: "Hot", stage: "Converted", owner: "Olivia Chen", when: "4 days ago" },
  { id: 11, name: "Shawn Whitaker", phone: "(213) 555-0161", email: "shawn@email.com", interest: "CrossFit", source: "Google Ads", temp: "Cold", stage: "Converted", owner: "Tyler Brooks", when: "5 days ago" },
];
