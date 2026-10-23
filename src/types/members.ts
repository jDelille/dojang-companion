

export type MemberStatus = "Active" | "Expiring" | "Expired" | "Frozen";

export type PlanLabel =
  | "Annual Premium"
  | "Quarterly Gold"
  | "Monthly Standard"
  | "Student Plan";

export type PayMethod = "Cash" | "Card" | "Apple Pay" | "Wallet";

export type Member = {
  id: string;
  first: string;
  last: string;
  phone: string;
  email: string;
  planLabel: PlanLabel;
  trainer: string;
  checkins: number;
  status: MemberStatus;
  expiry: string;
  expiresDisp: string;
  av: string;
  ini: string;
};
