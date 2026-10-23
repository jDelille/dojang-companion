/* Locker Management types — ported from tailwind/src/assets/js/lockers.js */

export type LockerStatus = "Available" | "Occupied" | "Reserved" | "Maintenance";

export type LockerZone = "Men's" | "Women's" | "Premium";

export type LockerSize = "Small" | "Medium" | "Large" | "XL";

export type LockerHistoryEntry = {
  /** ISO date, e.g. "2026-07-01". */
  date: string;
  action: string;
  note: string;
  tech: string;
};

export type Locker = {
  id: number;
  /** Zero-padded display number, e.g. "01". */
  num: string;
  zone: LockerZone;
  size: LockerSize;
  status: LockerStatus;
  key: string;
  deposit: number;
  member: string | null;
  memberId: string | null;
  /** ISO date or null. */
  since: string | null;
  /** ISO date or null. */
  expiry: string | null;
  notes: string;
  history: LockerHistoryEntry[];
};

export type Member = { id: string; name: string };

/** Fields the Add / Edit Locker modal collects. */
export type LockerFormValues = {
  start: string;
  count: string;
  zone: LockerZone;
  size: LockerSize;
  key: string;
  deposit: string;
  status: LockerStatus;
  notes: string;
};

/** Per-field validation errors on the Add / Edit form. */
export type LockerFormErrors = {
  start?: string;
  count?: string;
  deposit?: string;
};

/** Fields the Assign Locker modal collects. */
export type AssignValues = {
  member: string;
  memberId: string | null;
  from: Date | null;
  until: Date | null;
  reserve: boolean;
};

export type AssignErrors = {
  member?: string;
  from?: string;
  until?: string;
};

/** Fields the Maintenance modal collects. */
export type MaintenanceValues = {
  type: string;
  tech: string;
  due: Date | null;
  note: string;
};

export type MaintenanceErrors = {
  due?: string;
  note?: string;
};

export type LockerView = "map" | "list";
export type SortKey = "num" | "status" | "zone" | "member" | "expiry";
export type SortDir = "asc" | "desc";
export type ExportFormat = "csv" | "json" | "print";
