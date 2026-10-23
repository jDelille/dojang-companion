/* Equipment types — ported from tailwind/src/assets/js/equipment.js */

export type EquipmentCategory = "Cardio" | "Strength" | "Free Weights" | "Functional";

export type EquipmentStatus =
  | "Operational"
  | "Maintenance"
  | "Service Due"
  | "Out of Order";

export type ServiceRecord = {
  date: string;
  action: string;
  note: string;
};

export type Equipment = {
  id: number;
  name: string;
  category: EquipmentCategory;
  /** Asset tag, e.g. "EQ-001". */
  asset: string;
  qty: number;
  /** Health percentage, 0–100. */
  condition: number;
  lastService: string;
  nextService: string;
  status: EquipmentStatus;
  location: string;
  history: ServiceRecord[];
};

export type EquipmentView = "grid" | "list";

/** Fields the Add / Edit Equipment modal collects. */
export type EquipmentFormValues = {
  name: string;
  category: EquipmentCategory;
  asset: string;
  qty: number;
  condition: number;
  location: string;
  status: EquipmentStatus;
};

/** Fields the Log Maintenance modal collects. */
export type MaintenanceValues = {
  type: string;
  condition: number;
  next: Date | null;
  note: string;
};
