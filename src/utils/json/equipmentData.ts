import type {
  Equipment,
  EquipmentCategory,
  EquipmentStatus,
} from "../../types/equipment";

/*
   Equipment seed data — ported verbatim from tailwind/src/assets/js/equipment.js
   (EQUIPMENT, CAT_ICON, STATUSES, LOCATIONS, STATUS). Ids follow the E()
   1-based sequence, and each record seeds the single "Routine Service" history
   entry that E() created from lastService.
*/

export const EQ_TODAY = "Jul 14, 2026";

export const EQ_CATS: EquipmentCategory[] = [
  "Cardio",
  "Strength",
  "Free Weights",
  "Functional",
];

export const EQ_STATUSES: EquipmentStatus[] = [
  "Operational",
  "Maintenance",
  "Service Due",
  "Out of Order",
];

export const EQ_LOCATIONS = [
  "Cardio Zone",
  "Strength Zone",
  "Free Weights Area",
  "Functional Area",
  "Storage",
];

export const EQ_STATUS_BADGE: Record<EquipmentStatus, string> = {
  Operational: "badge-present",
  Maintenance: "badge-late",
  "Service Due": "badge-expired",
  "Out of Order": "badge-absent",
};

export const MAINTENANCE_TYPES = [
  "Mark Serviced",
  "Send to Maintenance",
  "Report Out of Order",
  "Log Repair",
];

const E = (
  id: number,
  name: string,
  category: EquipmentCategory,
  asset: string,
  qty: number,
  condition: number,
  lastService: string,
  nextService: string,
  status: EquipmentStatus,
  location: string,
): Equipment => ({
  id,
  name,
  category,
  asset,
  qty,
  condition,
  lastService,
  nextService,
  status,
  location,
  history: [
    { date: lastService, action: "Routine Service", note: "Scheduled maintenance completed" },
  ],
});

export const EQUIPMENT: Equipment[] = [
  E(1, "Treadmill Pro X9", "Cardio", "EQ-001", 8, 92, "Jun 12, 2026", "Sep 12, 2026", "Operational", "Cardio Zone"),
  E(2, "Elliptical Trainer E5", "Cardio", "EQ-002", 6, 78, "May 02, 2026", "Aug 02, 2026", "Operational", "Cardio Zone"),
  E(3, "Spin Bike SB-300", "Cardio", "EQ-003", 12, 45, "Jan 10, 2026", "Jul 10, 2026", "Service Due", "Cardio Zone"),
  E(4, "Rowing Machine R7", "Cardio", "EQ-004", 4, 30, "Feb 20, 2026", "Jun 20, 2026", "Maintenance", "Cardio Zone"),
  E(5, "Leg Press Machine", "Strength", "EQ-005", 3, 88, "Jun 15, 2026", "Dec 15, 2026", "Operational", "Strength Zone"),
  E(6, "Cable Crossover", "Strength", "EQ-006", 2, 95, "Jul 01, 2026", "Jan 01, 2027", "Operational", "Strength Zone"),
  E(7, "Smith Machine", "Strength", "EQ-007", 2, 62, "Mar 18, 2026", "Jul 18, 2026", "Service Due", "Strength Zone"),
  E(8, "Lat Pulldown", "Strength", "EQ-008", 3, 0, "Apr 05, 2026", "Jul 05, 2026", "Out of Order", "Strength Zone"),
  E(9, "Olympic Barbell 45 lb", "Free Weights", "EQ-009", 15, 84, "May 22, 2026", "Nov 22, 2026", "Operational", "Free Weights Area"),
  E(10, "Dumbbell Set 5–100 lb", "Free Weights", "EQ-010", 20, 90, "Jun 30, 2026", "Dec 30, 2026", "Operational", "Free Weights Area"),
  E(11, "Kettlebell Rack", "Free Weights", "EQ-011", 5, 70, "Apr 11, 2026", "Aug 11, 2026", "Operational", "Free Weights Area"),
  E(12, "Battle Ropes", "Functional", "EQ-012", 6, 55, "Feb 08, 2026", "Jul 08, 2026", "Service Due", "Functional Area"),
  E(13, "Plyo Box Set", "Functional", "EQ-013", 8, 82, "Jun 14, 2026", "Dec 14, 2026", "Operational", "Functional Area"),
  E(14, "TRX Suspension", "Functional", "EQ-014", 10, 40, "Feb 25, 2026", "Jun 25, 2026", "Maintenance", "Functional Area"),
];
