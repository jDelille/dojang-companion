import type { Referral, ReferralStatus } from "../../types/referrals";

/*
   Seed data and lookup maps for the Referrals page.

   Ported verbatim from tailwind/src/assets/js/referrals.js, where REFERRALS
   was built by an R() factory that assigned sequential ids and set the reward
   only for converted rows.
*/

/** Credit paid per conversion. */
export const REFERRAL_REWARD = 50;

export const REFERRAL_STATUS_BADGE: Record<ReferralStatus, string> = {
  Invited: "badge-late",
  "Signed Up": "badge-active",
  Converted: "badge-present",
  Expired: "badge-inactive",
};

export const REFERRAL_STATUS_OPTIONS: ReferralStatus[] = [
  "Invited",
  "Signed Up",
  "Converted",
  "Expired",
];

/** Members who can refer, used by the add / edit / invite modals. */
export const REFERRING_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Jessica Ramirez",
  "Tyler Brooks",
  "Megan Sullivan",
];

export const INVITE_CHANNELS = ["WhatsApp", "SMS", "Email"];

export const PAYOUT_OPTIONS = ["Account Credit", "Cash", "Apple Pay", "Free Month"];

export const EXPORT_FORMATS = ["CSV", "Excel", "PDF"];

/** The shared code shown in the program banner. */
export const REFERRAL_CODE = "FITFRIEND";

export const DEFAULT_INVITE_MESSAGE =
  "Join me at Dreams GYM with code FITFRIEND and get 20% off your first plan! 💪";

export const REFERRALS: Referral[] = [
  { id: 1, friend: "Julian Cross", by: "Ashley Bennett", date: "Jul 14, 2026", status: "Converted", phone: "—", reward: 50 },
  { id: 2, friend: "Nina Kowalski", by: "Ashley Bennett", date: "Jul 13, 2026", status: "Signed Up", phone: "—", reward: 0 },
  { id: 3, friend: "Blake Sanders", by: "Jessica Ramirez", date: "Jul 13, 2026", status: "Converted", phone: "—", reward: 50 },
  { id: 4, friend: "Erica Vaughn", by: "Marcus Coleman", date: "Jul 12, 2026", status: "Invited", phone: "—", reward: 0 },
  { id: 5, friend: "Trevor Mason", by: "Tyler Brooks", date: "Jul 11, 2026", status: "Converted", phone: "—", reward: 50 },
  { id: 6, friend: "Alyssa Reyes", by: "Ashley Bennett", date: "Jul 11, 2026", status: "Signed Up", phone: "—", reward: 0 },
  { id: 7, friend: "Omar Haddad", by: "Megan Sullivan", date: "Jul 10, 2026", status: "Converted", phone: "—", reward: 50 },
  { id: 8, friend: "Paige Donovan", by: "Jessica Ramirez", date: "Jul 09, 2026", status: "Invited", phone: "—", reward: 0 },
  { id: 9, friend: "Shawn Whitaker", by: "Tyler Brooks", date: "Jul 08, 2026", status: "Converted", phone: "—", reward: 50 },
  { id: 10, friend: "Simone Archer", by: "Marcus Coleman", date: "Jul 07, 2026", status: "Expired", phone: "—", reward: 0 },
  { id: 11, friend: "Ian Mercer", by: "Ashley Bennett", date: "Jul 06, 2026", status: "Converted", phone: "—", reward: 50 },
  { id: 12, friend: "Claire Dawson", by: "Megan Sullivan", date: "Jul 05, 2026", status: "Signed Up", phone: "—", reward: 0 },
];
