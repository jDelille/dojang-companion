/* Workout Plans types — ported from tailwind/src/assets/js/workouts.js */

export type WorkoutGoal =
  | "Muscle Gain"
  | "Fat Loss"
  | "Strength"
  | "Endurance"
  | "Mobility";

export type WorkoutLevel = "Beginner" | "Intermediate" | "Advanced";

export type Exercise = {
  name: string;
  /** Numeric for real exercises; "—" in the empty-state placeholder row. */
  sets: number | string;
  reps: string;
};

export type WorkoutPlan = {
  id: number;
  name: string;
  goal: WorkoutGoal;
  level: WorkoutLevel;
  /** Seven 0/1 flags, Mon→Sun. */
  days: number[];
  weeks: number;
  assigned: number;
  exercisesCount: number;
  sample: Exercise[];
};

/** Fields the New / Edit Plan modal collects. */
export type WorkoutFormValues = {
  name: string;
  goal: WorkoutGoal;
  level: WorkoutLevel;
  weeks: number;
  days: number[];
};
