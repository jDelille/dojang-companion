import type { WorkoutGoal, WorkoutLevel, WorkoutPlan } from "../../types/workouts";

/*
   Workout Plans seed data — ported verbatim from the PLANS array and the
   GOAL / LEVELS / DOW / MEMBERS constants in tailwind/src/assets/js/workouts.js.
   Ids follow the P() 1-based sequence.
*/

/** Hero gradients per goal, from the GOAL map. */
export const GOAL_GRADIENT: Record<WorkoutGoal, string> = {
  "Muscle Gain": "linear-gradient(135deg,#D4AF37,#B8860B)",
  "Fat Loss": "linear-gradient(135deg,#FB923C,#EF4444)",
  Strength: "linear-gradient(135deg,#F4D03F,#D4AF37)",
  Endurance: "linear-gradient(135deg,#22D3EE,#0891B2)",
  Mobility: "linear-gradient(135deg,#818CF8,#6366F1)",
};

export const WORKOUT_GOALS: WorkoutGoal[] = [
  "Muscle Gain",
  "Fat Loss",
  "Strength",
  "Endurance",
  "Mobility",
];

export const WORKOUT_LEVELS: WorkoutLevel[] = ["Beginner", "Intermediate", "Advanced"];

/** Level → badge class, from the LEVEL map. */
export const LEVEL_BADGE: Record<WorkoutLevel, string> = {
  Beginner: "badge-present",
  Intermediate: "badge-late",
  Advanced: "badge-absent",
};

/** Day initials, Mon→Sun — note both Tue and Thu render as "T". */
export const DOW = ["M", "T", "W", "T", "F", "S", "S"];

export const WORKOUT_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Tyler Brooks",
  "Megan Sullivan",
  "Natalie Rivera",
  "Jessica Ramirez",
];

export const WORKOUT_PLANS: WorkoutPlan[] = [
  {
    id: 1,
    name: "Hypertrophy Builder",
    goal: "Muscle Gain",
    level: "Intermediate",
    days: [1, 1, 1, 1, 1, 0, 0],
    weeks: 8,
    assigned: 34,
    exercisesCount: 42,
    sample: [
      { name: "Barbell Bench Press", sets: 4, reps: "8–10" },
      { name: "Incline Dumbbell Press", sets: 3, reps: "10–12" },
      { name: "Cable Fly", sets: 3, reps: "12–15" },
      { name: "Tricep Pushdown", sets: 3, reps: "12" },
    ],
  },
  {
    id: 2,
    name: "Shred & Burn",
    goal: "Fat Loss",
    level: "Beginner",
    days: [1, 0, 1, 0, 1, 1, 0],
    weeks: 6,
    assigned: 58,
    exercisesCount: 30,
    sample: [
      { name: "Jump Rope", sets: 5, reps: "60s" },
      { name: "Goblet Squat", sets: 3, reps: "15" },
      { name: "Mountain Climbers", sets: 4, reps: "30s" },
      { name: "Burpees", sets: 3, reps: "12" },
    ],
  },
  {
    id: 3,
    name: "Powerlifting 5x5",
    goal: "Strength",
    level: "Advanced",
    days: [1, 0, 1, 0, 1, 0, 0],
    weeks: 12,
    assigned: 21,
    exercisesCount: 18,
    sample: [
      { name: "Back Squat", sets: 5, reps: "5" },
      { name: "Deadlift", sets: 5, reps: "5" },
      { name: "Overhead Press", sets: 5, reps: "5" },
      { name: "Barbell Row", sets: 5, reps: "5" },
    ],
  },
  {
    id: 4,
    name: "Marathon Prep",
    goal: "Endurance",
    level: "Intermediate",
    days: [1, 1, 1, 1, 1, 1, 0],
    weeks: 10,
    assigned: 15,
    exercisesCount: 24,
    sample: [
      { name: "Tempo Run", sets: 1, reps: "40 min" },
      { name: "Interval Sprints", sets: 8, reps: "400m" },
      { name: "Core Circuit", sets: 3, reps: "15" },
      { name: "Cooldown Stretch", sets: 1, reps: "10 min" },
    ],
  },
  {
    id: 5,
    name: "Mobility Flow",
    goal: "Mobility",
    level: "Beginner",
    days: [0, 1, 0, 1, 0, 1, 0],
    weeks: 4,
    assigned: 27,
    exercisesCount: 20,
    sample: [
      { name: "Cat-Cow Stretch", sets: 2, reps: "10" },
      { name: "Hip Opener", sets: 2, reps: "30s" },
      { name: "Thoracic Rotation", sets: 2, reps: "12" },
      { name: "Deep Squat Hold", sets: 3, reps: "45s" },
    ],
  },
  {
    id: 6,
    name: "Lean Machine",
    goal: "Fat Loss",
    level: "Advanced",
    days: [1, 1, 1, 1, 1, 0, 0],
    weeks: 8,
    assigned: 41,
    exercisesCount: 38,
    sample: [
      { name: "HIIT Sprints", sets: 6, reps: "30s" },
      { name: "Kettlebell Swing", sets: 4, reps: "20" },
      { name: "Box Jumps", sets: 4, reps: "12" },
      { name: "Battle Ropes", sets: 3, reps: "40s" },
    ],
  },
  {
    id: 7,
    name: "Beginner Full Body",
    goal: "Muscle Gain",
    level: "Beginner",
    days: [1, 0, 1, 0, 1, 0, 0],
    weeks: 6,
    assigned: 72,
    exercisesCount: 24,
    sample: [
      { name: "Leg Press", sets: 3, reps: "12" },
      { name: "Lat Pulldown", sets: 3, reps: "12" },
      { name: "Chest Press Machine", sets: 3, reps: "12" },
      { name: "Plank", sets: 3, reps: "45s" },
    ],
  },
  {
    id: 8,
    name: "Athlete Strength",
    goal: "Strength",
    level: "Intermediate",
    days: [1, 1, 0, 1, 1, 0, 0],
    weeks: 10,
    assigned: 19,
    exercisesCount: 32,
    sample: [
      { name: "Front Squat", sets: 4, reps: "6" },
      { name: "Power Clean", sets: 5, reps: "3" },
      { name: "Weighted Pull-up", sets: 4, reps: "6" },
      { name: "Nordic Curl", sets: 3, reps: "8" },
    ],
  },
  {
    id: 9,
    name: "Cardio Endurance",
    goal: "Endurance",
    level: "Beginner",
    days: [1, 0, 1, 0, 1, 1, 0],
    weeks: 6,
    assigned: 33,
    exercisesCount: 16,
    sample: [
      { name: "Steady Cycle", sets: 1, reps: "30 min" },
      { name: "Rowing Intervals", sets: 5, reps: "500m" },
      { name: "Incline Walk", sets: 1, reps: "20 min" },
      { name: "Core Hold", sets: 3, reps: "30s" },
    ],
  },
];
