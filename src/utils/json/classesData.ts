import type { ClassCategory, GymClass, TimetableDay } from "../../types/classes";

/*
   Class Schedule seed data — ported verbatim from the CLASSES array and the
   DAYS / CAT constants in tailwind/src/assets/js/classes.js. Ids follow the
   C() 1-based sequence and every class starts uncancelled.
*/

export const TIMETABLE_DAYS: TimetableDay[] = [
  { dow: "Mon", date: 13, today: true },
  { dow: "Tue", date: 14, today: false },
  { dow: "Wed", date: 15, today: false },
  { dow: "Thu", date: 16, today: false },
  { dow: "Fri", date: 17, today: false },
  { dow: "Sat", date: 18, today: false },
  { dow: "Sun", date: 19, today: false },
];

export const CLASS_CATEGORIES: ClassCategory[] = [
  "Yoga",
  "HIIT",
  "Strength",
  "Cardio",
  "Zumba",
];

export const CLASS_TRAINERS = [
  "Rachel Morgan",
  "Andre Jackson",
  "Cameron Boyd",
  "Lauren Hayes",
  "Daniel Foster",
];

/** The Assign Trainer modal offers one extra name over the edit form. */
export const ASSIGN_TRAINERS = [...CLASS_TRAINERS, "Hannah Pierce"];

export const BOOK_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Jessica Ramirez",
  "Tyler Brooks",
  "Megan Sullivan",
  "Walk-in Guest",
];

export const BOOK_PAYMENTS = ["Included", "Cash", "Card", "Apple Pay"];

export const CLASS_REPEATS = [
  "This week only",
  "Weekly (4 weeks)",
  "Weekly (ongoing)",
];

export const DAY_OPTIONS = [
  { value: "0", label: "Monday" },
  { value: "1", label: "Tuesday" },
  { value: "2", label: "Wednesday" },
  { value: "3", label: "Thursday" },
  { value: "4", label: "Friday" },
  { value: "5", label: "Saturday" },
  { value: "6", label: "Sunday" },
];

const C = (
  id: number,
  day: number,
  time: string,
  dur: string,
  name: string,
  cat: ClassCategory,
  trainer: string,
  room: string,
  booked: number,
  cap: number,
): GymClass => ({ id, day, time, dur, name, cat, trainer, room, booked, cap, cancelled: false });

export const CLASSES: GymClass[] = [
  C(1, 0, "06:00 AM", "60 min", "Sunrise Yoga", "Yoga", "Rachel Morgan", "Studio A", 18, 20),
  C(2, 0, "08:00 AM", "45 min", "HIIT Burn", "HIIT", "Andre Jackson", "Studio B", 24, 24),
  C(3, 0, "06:00 PM", "60 min", "Power Strength", "Strength", "Cameron Boyd", "Main Floor", 12, 18),
  C(4, 1, "07:00 AM", "50 min", "Spin Cardio", "Cardio", "Lauren Hayes", "Spin Room", 15, 20),
  C(5, 1, "05:30 PM", "55 min", "Zumba Party", "Zumba", "Daniel Foster", "Studio A", 30, 30),
  C(6, 2, "06:30 AM", "60 min", "Vinyasa Flow", "Yoga", "Rachel Morgan", "Studio A", 10, 20),
  C(7, 2, "07:30 AM", "45 min", "Tabata HIIT", "HIIT", "Andre Jackson", "Studio B", 20, 24),
  C(8, 2, "06:00 PM", "60 min", "Deadlift Clinic", "Strength", "Cameron Boyd", "Main Floor", 8, 15),
  C(9, 3, "08:00 AM", "50 min", "Endurance Ride", "Cardio", "Lauren Hayes", "Spin Room", 18, 20),
  C(10, 3, "06:30 PM", "55 min", "Dance Cardio", "Zumba", "Daniel Foster", "Studio A", 22, 28),
  C(11, 4, "06:00 AM", "60 min", "Morning Yoga", "Yoga", "Rachel Morgan", "Studio A", 16, 20),
  C(12, 4, "05:00 PM", "45 min", "Fat Burn HIIT", "HIIT", "Andre Jackson", "Studio B", 24, 24),
  C(13, 4, "07:00 PM", "60 min", "Barbell Strength", "Strength", "Cameron Boyd", "Main Floor", 14, 18),
  C(14, 5, "09:00 AM", "75 min", "Weekend Flow", "Yoga", "Rachel Morgan", "Studio A", 12, 25),
  C(15, 5, "10:30 AM", "45 min", "Bootcamp HIIT", "HIIT", "Andre Jackson", "Outdoor", 19, 30),
  C(16, 5, "05:00 PM", "60 min", "Zumba Fiesta", "Zumba", "Daniel Foster", "Studio A", 28, 30),
  C(17, 6, "09:00 AM", "60 min", "Restorative Yoga", "Yoga", "Rachel Morgan", "Studio A", 9, 20),
  C(18, 6, "11:00 AM", "50 min", "Sunday Spin", "Cardio", "Lauren Hayes", "Spin Room", 14, 20),
];
