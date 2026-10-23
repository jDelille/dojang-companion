/*
   Shared types for the Referrals page.

   Mirrors the records built by R() in tailwind/src/assets/js/referrals.js.
*/

export type ReferralStatus = "Invited" | "Signed Up" | "Converted" | "Expired";

export type Referral = {
  id: number;
  /** The friend who was referred. */
  friend: string;
  /** The member who referred them. */
  by: string;
  date: string;
  status: ReferralStatus;
  phone: string;
  /** Credit paid out; only converted referrals earn one. */
  reward: number;
};

/** Aggregated per referring member for the Top Referrers panel. */
export type TopReferrer = {
  name: string;
  total: number;
  conv: number;
  earned: number;
};
