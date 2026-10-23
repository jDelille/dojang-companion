import type { MembershipPlan, PlanCategory, PlanStatus } from "../../types/membershipPlans";

export const PLAN_STATUS_BADGE: Record<PlanStatus, string> = {
  Active: "badge-active",
  Inactive: "badge-inactive",
};

export const CATEGORY_OPTIONS: PlanCategory[] = [
  "Gym",
  "Fitness Class",
  "Personal Training",
  "Aquatics",
];

export const PLAN_STATUS_OPTIONS: PlanStatus[] = ["Active", "Inactive"];

export const ASSIGN_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Jessica Ramirez",
  "Brooke Carter",
  "Walk-in Customer",
];
export const RENEW_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Jessica Ramirez",
  "Brooke Carter",
];

export const PAYMENT_OPTIONS = ["Cash", "Card", "Apple Pay", "Wallet"];

export const PLAN_KPIS = {
  totalPlans: 10,
  subscribers: "1,842",
  monthlyRecurring: "$74.8K",
  mostPopular: "Annual",
};

export const DEFAULT_PLAN_EMOJI = "⭐";

export const DEFAULT_PLAN_FEATURE = "Gym access";

export const MEMBERSHIP_PLANS: MembershipPlan[] = [
  { id: 1, name: "Monthly", emoji: "⭐", cat: "Gym", price: 49, dur: "1 month", members: 412, status: "Active", feat: ["Full gym access", "1 group class/wk", "Locker"] },
  { id: 2, name: "Quarterly", emoji: "🏆", cat: "Gym", price: 129, dur: "3 months", members: 286, status: "Active", feat: ["Full gym access", "Unlimited classes", "Locker", "1 PT session"] },
  { id: 3, name: "Half-Yearly", emoji: "🥇", cat: "Gym", price: 239, dur: "6 months", members: 174, status: "Active", feat: ["Full gym access", "Unlimited classes", "Locker", "Diet plan"] },
  { id: 4, name: "Annual Premium", emoji: "👑", cat: "Gym", price: 449, dur: "12 months", members: 503, status: "Active", feat: ["All access", "Unlimited classes", "Premium locker", "4 PT sessions", "Diet plan"] },
  { id: 5, name: "Personal Training", emoji: "💪", cat: "Personal Training", price: 499, dur: "10 sessions", members: 96, status: "Active", feat: ["1-on-1 coaching", "Custom workout", "Progress tracking"] },
  { id: 6, name: "Yoga", emoji: "🧘", cat: "Fitness Class", price: 75, dur: "5 classes", members: 142, status: "Active", feat: ["Guided sessions", "Breathwork", "Flexibility"] },
  { id: 7, name: "CrossFit", emoji: "🤸", cat: "Fitness Class", price: 109, dur: "1 month", members: 88, status: "Active", feat: ["WOD access", "Coach-led", "Community events"] },
  { id: 8, name: "Zumba", emoji: "💃", cat: "Fitness Class", price: 59, dur: "1 month", members: 120, status: "Active", feat: ["Dance fitness", "High energy", "All levels"] },
  { id: 9, name: "Swimming", emoji: "🏊", cat: "Aquatics", price: 89, dur: "1 month", members: 64, status: "Inactive", feat: ["Pool access", "Lane booking", "Locker"] },
  { id: 10, name: "Student", emoji: "🎓", cat: "Gym", price: 29, dur: "1 month", members: 57, status: "Active", feat: ["Off-peak access", "Valid student ID", "Locker"] },
];
