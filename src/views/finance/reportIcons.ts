import {
  DollarSign,
  Settings,
  ShoppingCart,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { ReportCategory } from "../../types/reports";

/*
   Category → icon map, ported from the CAT_META constant in
   tailwind/src/assets/js/reports.js.
*/

export const REPORT_CAT_ICON: Record<ReportCategory, LucideIcon> = {
  Financial: DollarSign,
  Sales: ShoppingCart,
  Members: Users,
  Operations: Settings,
};

export default REPORT_CAT_ICON;
