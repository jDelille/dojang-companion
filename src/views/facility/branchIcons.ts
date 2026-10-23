import {
  CircleCheckBig,
  Clock,
  CirclePause,
  FileSpreadsheet,
  FileJson,
  Printer,
  type LucideIcon,
} from "lucide-react";
import type { BranchExportFormat, BranchStatus } from "../../types/branches";

/*
   Status and export-format icon maps, ported from STATUS_ICON and the FORMATS
   `ic` values in tailwind/src/assets/js/branches.js. Lucide renamed
   check-circle-2 -> CircleCheckBig and pause-circle -> CirclePause.
*/

export const BRANCH_STATUS_ICON_CMP: Record<BranchStatus, LucideIcon> = {
  Active: CircleCheckBig,
  "Opening Soon": Clock,
  "Temporarily Closed": CirclePause,
};

export const BRANCH_FORMAT_ICON: Record<BranchExportFormat, LucideIcon> = {
  csv: FileSpreadsheet,
  json: FileJson,
  print: Printer,
};
