import {
  Banknote,
  Building2,
  Circle,
  CreditCard,
  Dumbbell,
  Landmark,
  Megaphone,
  Package,
  PlugZap,
  Scroll,
  Smartphone,
  Users,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { ExpenseCategory } from "../../types/expenses";

/*
   Category and payment-method icon maps, ported from CAT_META / METHOD_ICON in
   tailwind/src/assets/js/expenses.js. METHOD_FALLBACK covers the template's
   `METHOD_ICON[e.method] || 'circle'` default.
*/

export const EXPENSE_CAT_ICON: Record<ExpenseCategory, LucideIcon> = {
  Rent: Building2,
  Utilities: PlugZap,
  Salaries: Users,
  Equipment: Dumbbell,
  Marketing: Megaphone,
  Maintenance: Wrench,
  Supplies: Package,
};

export const METHOD_ICON: Record<string, LucideIcon> = {
  "Bank Transfer": Landmark,
  Cash: Banknote,
  Card: CreditCard,
  "Apple Pay": Smartphone,
  Check: Scroll,
};

export const METHOD_FALLBACK: LucideIcon = Circle;
