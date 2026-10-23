/* Branches types — ported from tailwind/src/assets/js/branches.js */

export type BranchStatus = "Active" | "Opening Soon" | "Temporarily Closed";

export type BranchSettings = {
  signups: boolean;
  access247: boolean;
  publicVisible: boolean;
};

export type BranchManager = {
  id: string;
  name: string;
  phone: string;
  email: string;
  role: string;
};

export type Branch = {
  id: number;
  name: string;
  city: string;
  address: string;
  managerId: string | null;
  phone: string;
  /** "05:00" 24h clock. */
  open: string;
  /** "23:00" 24h clock. */
  close: string;
  members: number;
  capacity: number;
  staff: number;
  revenue: number;
  rating: number;
  hq: boolean;
  status: BranchStatus;
  /** ISO date the branch opened, or null when not open yet. */
  opened: string | null;
  /** ISO date a not-yet-open branch is scheduled to open. */
  openingDate: string | null;
  amenities: string[];
  settings: BranchSettings;
};

export type BranchSortKey = "name" | "members" | "revenue" | "capacity" | "rating";

export type BranchView = "grid" | "list";

/** Fields the Add / Edit Branch modal collects. */
export type BranchFormValues = {
  name: string;
  city: string;
  address: string;
  managerId: string;
  phone: string;
  capacity: string;
  open: string;
  close: string;
  status: BranchStatus;
  hq: boolean;
};

/** Per-field validation messages the Add / Edit Branch modal renders. */
export type BranchFormErrors = {
  name?: string;
  city?: string;
  address?: string;
  phone?: string;
  capacity?: string;
  close?: string;
};

/** Fields the Branch Settings modal collects. */
export type BranchSettingsValues = {
  capacity: string;
  open: string;
  close: string;
  amenities: string[];
  signups: boolean;
  access247: boolean;
  publicVisible: boolean;
};

export type BranchSettingsErrors = {
  capacity?: string;
  close?: string;
};

/** Fields the Transfer Members modal collects. */
export type BranchTransferValues = {
  fromId: number;
  toId: number;
  count: number;
  reason: string;
};

export type BranchTransferErrors = {
  to?: string;
  count?: string;
};

export type BranchExportFormat = "csv" | "json" | "print";

export type BranchExportScope = "filtered" | "all";
