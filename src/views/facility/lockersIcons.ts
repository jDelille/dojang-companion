import {
  Clock,
  FileJson,
  FileSpreadsheet,
  Lock,
  LockOpen,
  Printer,
  Wrench,
  type LucideIcon,
} from "lucide-react";
import type { LockerStatus } from "../../types/lockers";

/*
   Locker status icon map, ported from the ICON object in
   tailwind/src/assets/js/lockers.js, plus the export-format icons from FORMATS.
   LOCKER_ICON_FALLBACK covers unexpected status strings the way the template's
   direct lookup would otherwise fail.
*/

export const LOCKER_ICON: Record<LockerStatus, LucideIcon> = {
  Available: LockOpen,
  Occupied: Lock,
  Reserved: Clock,
  Maintenance: Wrench,
};

export const LOCKER_ICON_FALLBACK: LucideIcon = Lock;

/** Icon strings on the Export modal's FORMATS list. */
export const EXPORT_FORMAT_ICON: Record<string, LucideIcon> = {
  "file-spreadsheet": FileSpreadsheet,
  "file-json": FileJson,
  printer: Printer,
};
