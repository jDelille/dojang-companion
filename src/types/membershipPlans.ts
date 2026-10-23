

export type PlanStatus = "Active" | "Inactive";

export type PlanCategory = "Gym" | "Fitness Class" | "Personal Training" | "Aquatics";

export type MembershipPlan = {
  id: number;
  name: string;
  emoji: string;
  cat: PlanCategory;
  price: number;
  dur: string;
  members: number;
  status: PlanStatus;
  feat: string[];
};
export type PlanSort = "pop" | "low" | "high";

export type PlanCardView = "grid" | "list";
