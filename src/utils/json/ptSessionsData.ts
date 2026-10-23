import type { PtSession, PtTrainer } from "../../types/ptSessions";

/*
   PT Sessions seed data — ported verbatim from tailwind/src/assets/js/pt-sessions.js.
   TIMES repeats (06:00 appears as both AM and PM), so slots are keyed by index
   throughout, never by the time string.
*/

export const TIMES = [
  "06:00",
  "07:00",
  "08:00",
  "09:00",
  "10:00",
  "11:00",
  "05:00",
  "06:00",
  "07:00",
  "08:00",
];

export const AMPM = ["AM", "AM", "AM", "AM", "AM", "AM", "PM", "PM", "PM", "PM"];

export const FOCUS = ["Strength", "Fat Loss", "Mobility", "Powerlifting", "General"];

export const DURATIONS = ["60 min", "45 min", "90 min"];

export const FEE_BY_DUR: Record<string, number> = {
  "45 min": 40,
  "60 min": 50,
  "90 min": 70,
};

export const PT_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Tyler Brooks",
  "Megan Sullivan",
  "Natalie Rivera",
  "Jessica Ramirez",
  "Omar Haddad",
  "Nathan Miller",
  "Ethan Walsh",
];

/*
   Avatar palette — the template indexes this by trainer id modulo 5
   (avatarFor in pt-sessions.js), not by the shared hash helper, so the
   rendered colours stay identical.
*/
const AV = ["av-gold", "av-purple", "av-orange", "av-cyan", "av-green"];

export const ptAvatarFor = (id: number): string => AV[id % AV.length];

/** Trainer ids are 0-based here, matching the tid++ sequence. */
export const PT_TRAINERS: PtTrainer[] = [
  { id: 0, name: "Daniel Foster", specialty: "Strength & Powerlifting" },
  { id: 1, name: "Rachel Morgan", specialty: "Yoga & Mobility" },
  { id: 2, name: "Andre Jackson", specialty: "HIIT & Conditioning" },
  { id: 3, name: "Cameron Boyd", specialty: "Bodybuilding" },
];

export const PT_SESSIONS: PtSession[] = [
  { id: 1, trainerId: 0, slot: 0, member: "Ashley Bennett", focus: "Strength", duration: "60 min", status: "scheduled" },
  { id: 2, trainerId: 0, slot: 3, member: "Tyler Brooks", focus: "Powerlifting", duration: "90 min", status: "scheduled" },
  { id: 3, trainerId: 0, slot: 6, member: "Omar Haddad", focus: "Strength", duration: "60 min", status: "completed" },
  { id: 4, trainerId: 1, slot: 1, member: "Jessica Ramirez", focus: "Mobility", duration: "45 min", status: "scheduled" },
  { id: 5, trainerId: 1, slot: 4, member: "Natalie Rivera", focus: "Mobility", duration: "60 min", status: "completed" },
  { id: 6, trainerId: 2, slot: 2, member: "Marcus Coleman", focus: "Fat Loss", duration: "60 min", status: "scheduled" },
  { id: 7, trainerId: 2, slot: 7, member: "Megan Sullivan", focus: "Fat Loss", duration: "45 min", status: "scheduled" },
  { id: 8, trainerId: 2, slot: 8, member: "Nathan Miller", focus: "General", duration: "60 min", status: "cancelled" },
  { id: 9, trainerId: 3, slot: 5, member: "Ethan Walsh", focus: "Strength", duration: "60 min", status: "scheduled" },
];
