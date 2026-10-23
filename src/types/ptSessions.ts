/* PT Sessions types — ported from tailwind/src/assets/js/pt-sessions.js */

export type SessionStatus = "scheduled" | "completed" | "cancelled";

export type PtTrainer = {
  id: number;
  name: string;
  specialty: string;
};

export type PtSession = {
  id: number;
  trainerId: number;
  /** Index into the TIMES / AMPM arrays — times repeat, so the index is the key. */
  slot: number;
  member: string;
  focus: string;
  duration: string;
  status: SessionStatus;
};

/** Fields the Book / Edit Session modal collects. */
export type PtSessionFormValues = {
  member: string;
  trainerId: number;
  /** -1 when no open slot is selectable. */
  slot: number;
  focus: string;
  duration: string;
};
