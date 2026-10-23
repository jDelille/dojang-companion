import type {
  InventoryCategory,
  InventoryItem,
  MovementType,
  StockLevel,
  StockMovement,
} from "../../types/inventory";

/*
   Inventory seed data — ported verbatim from tailwind/src/assets/js/inventory.js
   (ITEMS, MOVES, CAT_ICON/CATS, LOCATIONS, LVL_META, MV_META). Ids follow the
   I() 1-based sequence and incoming defaults to 0.
*/

export const INVENTORY_CATS: InventoryCategory[] = [
  "Supplements",
  "Apparel",
  "Equipment",
  "Accessories",
  "Beverages",
];

export const LOCATIONS = [
  "Los Angeles Branch",
  "San Francisco Branch",
  "Denver Branch",
  "Central Warehouse",
];

export const ADJUST_TYPES = ["Add stock", "Remove stock", "Set to"];

export const ADJUST_REASONS = [
  "Restock",
  "Correction",
  "Damaged / Loss",
  "Return",
  "Stock count",
];

export const LVL_META: Record<StockLevel, { badge: string; color: string }> = {
  Healthy: { badge: "badge-present", color: "#4ADE80" },
  Low: { badge: "badge-late", color: "#FB923C" },
  Reorder: { badge: "badge-expired", color: "#F87171" },
  Out: { badge: "badge-absent", color: "#F87171" },
};

export const MV_META: Record<MovementType, { cls: string; color: string; sign: string }> = {
  in: { cls: "ic-green", color: "c-green", sign: "+" },
  out: { cls: "ic-red", color: "c-red", sign: "−" },
  adj: { cls: "ic-orange", color: "c-orange", sign: "" },
};

export const INVENTORY_ITEMS: InventoryItem[] = [
  { id: 1, name: "Whey Protein 2 lb", sku: "SUP-001", category: "Supplements", price: 54.99, onHand: 42, reorder: 15, incoming: 0 },
  { id: 2, name: "BCAA Energy 14 oz", sku: "SUP-002", category: "Supplements", price: 34.99, onHand: 8, reorder: 12, incoming: 24 },
  { id: 3, name: "Creatine Monohydrate", sku: "SUP-003", category: "Supplements", price: 24.99, onHand: 0, reorder: 10, incoming: 30 },
  { id: 4, name: "Pre-Workout 10.5 oz", sku: "SUP-004", category: "Supplements", price: 34.99, onHand: 25, reorder: 10, incoming: 0 },
  { id: 5, name: "FitPro Training Tee", sku: "APP-001", category: "Apparel", price: 24.99, onHand: 60, reorder: 20, incoming: 0 },
  { id: 6, name: "Performance Shorts", sku: "APP-002", category: "Apparel", price: 34.99, onHand: 14, reorder: 15, incoming: 0 },
  { id: 7, name: "Compression Sleeves", sku: "APP-003", category: "Apparel", price: 19.99, onHand: 6, reorder: 10, incoming: 12 },
  { id: 8, name: "Adjustable Dumbbell 45 lb", sku: "EQP-001", category: "Equipment", price: 249.99, onHand: 12, reorder: 5, incoming: 0 },
  { id: 9, name: "Resistance Band Set", sku: "EQP-002", category: "Equipment", price: 29.99, onHand: 48, reorder: 15, incoming: 0 },
  { id: 10, name: "Yoga Mat Premium", sku: "EQP-003", category: "Equipment", price: 49.99, onHand: 0, reorder: 8, incoming: 20 },
  { id: 11, name: "Lifting Straps", sku: "ACC-001", category: "Accessories", price: 12.99, onHand: 90, reorder: 25, incoming: 0 },
  { id: 12, name: "Shaker Bottle 24 oz", sku: "ACC-002", category: "Accessories", price: 12.99, onHand: 7, reorder: 20, incoming: 50 },
  { id: 13, name: "Gym Gloves Pro", sku: "ACC-003", category: "Accessories", price: 24.99, onHand: 22, reorder: 10, incoming: 0 },
  { id: 14, name: "Electrolyte Water 32 oz", sku: "BEV-001", category: "Beverages", price: 2.49, onHand: 120, reorder: 40, incoming: 0 },
  { id: 15, name: "Protein Shake RTD", sku: "BEV-002", category: "Beverages", price: 3.49, onHand: 4, reorder: 24, incoming: 48 },
  { id: 16, name: "Cold Brew Coffee", sku: "BEV-003", category: "Beverages", price: 4.49, onHand: 0, reorder: 18, incoming: 36 },
];

export const INVENTORY_MOVES: StockMovement[] = [
  { type: "in", item: "Protein Shake RTD", qty: 48, ref: "PO-2291", when: "10 min ago" },
  { type: "out", item: "Whey Protein 2 lb", qty: 3, ref: "POS Sale", when: "25 min ago" },
  { type: "in", item: "Resistance Band Set", qty: 20, ref: "PO-2288", when: "1 hr ago" },
  { type: "out", item: "FitPro Training Tee", qty: 5, ref: "POS Sale", when: "2 hr ago" },
  { type: "adj", item: "Yoga Mat Premium", qty: -2, ref: "Damage", when: "3 hr ago" },
];
