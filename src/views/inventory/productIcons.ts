import {
  CupSoda,
  Dumbbell,
  Package,
  Pill,
  Shirt,
  Watch,
  type LucideIcon,
} from "lucide-react";
import type { ProductCategory } from "../../types/products";

/*
   Category icon map, ported from CAT_ICON in
   tailwind/src/assets/js/products.js. PRODUCT_CAT_FALLBACK covers the
   template's `CAT_ICON[p.category] || 'package'` default.
*/

export const PRODUCT_CAT_ICON: Record<ProductCategory, LucideIcon> = {
  Supplements: Pill,
  Apparel: Shirt,
  Equipment: Dumbbell,
  Accessories: Watch,
  Beverages: CupSoda,
};

export const PRODUCT_CAT_FALLBACK: LucideIcon = Package;
