

export type RenewalStage = "Not Contacted" | "Reminded" | "Called" | "Renewed";
export type RenewalPeriod = "Monthly" | "Quarterly" | "Annual" | "Student";
export type RenewalBucket = "Due Soon" | "Overdue" | "Lapsed" | "Renewed";

export type RenewalMember = {
  id: number;
  name: string;
  plan: string;
  period: RenewalPeriod;
  days: number;
  value: number;
  last: string;
  stage: RenewalStage;
};
