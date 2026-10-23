/* Trainer Management types — ported from tailwind/src/assets/js/trainers.js */

export type TrainerAccent =
  | "gold"
  | "indigo"
  | "orange"
  | "cyan"
  | "green"
  | "pink"
  | "amber"
  | "violet";

export type TrainerLevel = "Junior" | "Trainer" | "Certified" | "Expert" | "Senior";

/** One slot per weekday, Mon→Sun. `null` means the trainer is off that day. */
export type TrainerWeek = [
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
  string | null,
];

export type Trainer = {
  id: number;
  initials: string;
  first: string;
  last: string;
  spec: string;
  level: TrainerLevel;
  accent: TrainerAccent;
  rating: number;
  sessions: number;
  members: number;
  commission: number;
  /** Monthly commission goal, drives the card progress bar. */
  target: number;
  /** Month-over-month percentage change; 0 renders as an em dash. */
  trend: number;
  online: boolean;
  phone: string;
  email: string;
  week: TrainerWeek;
  classes: string[];
};

export type ClassSlot = {
  name: string;
  slot: string;
};

export type TrainerSort = "commission" | "rating" | "sessions" | "name";
export type TrainerView = "grid" | "list";

/** Fields the Add / Edit modal collects. */
export type TrainerFormValues = {
  first: string;
  last: string;
  phone: string;
  email: string;
  spec: string;
  level: TrainerLevel;
  commission: number;
};

export type AttendanceStatus = "present" | "late" | "absent";

export type AttendanceRow = {
  d: string;
  s: AttendanceStatus;
};
