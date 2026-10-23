/* Class Schedule types — ported from tailwind/src/assets/js/classes.js */

export type ClassCategory = "Yoga" | "HIIT" | "Strength" | "Cardio" | "Zumba";

export type GymClass = {
  id: number;
  /** 0 = Monday … 6 = Sunday. */
  day: number;
  time: string;
  dur: string;
  name: string;
  cat: ClassCategory;
  trainer: string;
  room: string;
  booked: number;
  cap: number;
  cancelled: boolean;
};

export type TimetableDay = {
  dow: string;
  date: number;
  today: boolean;
};

/** Fields the Add / Edit Class modal collects. */
export type ClassFormValues = {
  name: string;
  cat: ClassCategory;
  trainer: string;
  day: number;
  time: string;
  dur: string;
  room: string;
  cap: number;
};
