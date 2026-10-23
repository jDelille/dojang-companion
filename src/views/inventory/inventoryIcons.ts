import {
  ArrowDownLeft,
  ArrowUpRight,
  CupSoda,
  Dumbbell,
  Package,
  Pill,
  Settings2,
  Shirt,
  Watch,
  type LucideIcon,
} from "lucide-react";
import type { InventoryCategory, MovementType } from "../../types/inventory";

/*
   Category and movement icon maps, ported from CAT_ICON / MV_META in
   tailwind/src/assets/js/inventory.js. CAT_FALLBACK covers the template's
   `CAT_ICON[it.category] || 'package'` default.
*/

export const INVENTORY_CAT_ICON: Record<InventoryCategory, LucideIcon> = {
  Supplements: Pill,
  Apparel: Shirt,
  Equipment: Dumbbell,
  Accessories: Watch,
  Beverages: CupSoda,
};

export const CAT_FALLBACK: LucideIcon = Package;

export const MOVE_ICON: Record<MovementType, LucideIcon> = {
  in: ArrowDownLeft,
  out: ArrowUpRight,
  adj: Settings2,
};
