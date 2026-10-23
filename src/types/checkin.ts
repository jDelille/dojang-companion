
export type MembershipState = "active" | "expiring" | "expired";

export type CheckinMember = {
  initials: string;
  name: string;
  plan: string;
  phone: string;
  mid: string;
  status: MembershipState;
  tint: string;
};

export type LogStatus = "In Gym" | "Expiring" | "Denied" | "Checked Out";

export type CheckinLogEntry = {
  id: number;
  initials: string;
  tint: string;
  name: string;
  plan: string;
  time: string;
  status: LogStatus;
  trainer: string;
  locker: string;
  notes: string;
};

export type TrafficHour = {
  h: string;
  pct: number;
  peak?: boolean;
};
