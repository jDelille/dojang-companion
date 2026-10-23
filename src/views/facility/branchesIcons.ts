import {
  CheckCircle2,
  Clock,
  FileJson,
  FileSpreadsheet,
  PauseCircle,
  Printer,
  type LucideIcon,
} from "lucide-react";
import type { BranchExportFormat, BranchStatus } from "../../types/branches";

/*
   Status and export-format icon maps, ported from STATUS_ICON and the FORMATS
   table in tailwind/src/assets/js/branches.js.
*/

export const BRANCH_STATUS_ICON: Record<BranchStatus, LucideIcon> = {
  Active: CheckCircle2,
  "Opening Soon": Clock,
  "Temporarily Closed": PauseCircle,
};

export const BRANCH_FORMAT_ICON: Record<BranchExportFormat, LucideIcon> = {
  csv: FileSpreadsheet,
  json: FileJson,
  print: Printer,
};
