import {
  Briefcase,
  Check,
  ConciergeBell,
  Dumbbell,
  Moon,
  Plane,
  Salad,
  SprayCan,
  Users,
  type LucideIcon,
} from "lucide-react";
import type { AttendanceMark, StaffDept } from "../../types/staff";

/*
   Department and attendance-glyph icon maps, ported from DEPT_ICON and the
   glyph lookup in tailwind/src/assets/js/staff.js. DEPT_FALLBACK covers the
   template's `DEPT_ICON[s.dept] || 'users'` default.
*/

export const DEPT_ICON: Record<StaffDept, LucideIcon> = {
  Training: Dumbbell,
  Reception: ConciergeBell,
  Management: Briefcase,
  Housekeeping: SprayCan,
  Nutrition: Salad,
};

export const DEPT_FALLBACK: LucideIcon = Users;

export const ATTENDANCE_GLYPH: Record<AttendanceMark, LucideIcon> = {
  present: Check,
  leave: Plane,
  off: Moon,
};
