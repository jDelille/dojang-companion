/* Inventory types — ported from tailwind/src/assets/js/inventory.js */

export type InventoryCategory =
  | "Supplements"
  | "Apparel"
  | "Equipment"
  | "Accessories"
  | "Beverages";

export type StockLevel = "Healthy" | "Low" | "Reorder" | "Out";

export type InventoryItem = {
  id: number;
  name: string;
  sku: string;
  category: InventoryCategory;
  price: number;
  onHand: number;
  reorder: number;
  incoming: number;
};

export type MovementType = "in" | "out" | "adj";

export type StockMovement = {
  type: MovementType;
  item: string;
  qty: number;
  ref: string;
  when: string;
};

/** Fields the Add / Edit Inventory Item modal collects. */
export type InventoryFormValues = {
  name: string;
  sku: string;
  category: InventoryCategory;
  price: number;
  onHand: number;
  reorder: number;
};

/** Fields the Stock Adjustment modal collects. */
export type AdjustmentValues = {
  type: string;
  qty: number;
  reason: string;
};

/** Fields the Transfer Stock modal collects. */
export type TransferValues = {
  to: string;
  qty: number;
};
