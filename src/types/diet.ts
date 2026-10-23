/* Diet Plans types — ported from tailwind/src/assets/js/diet.js */

export type DietGoal = "Weight Loss" | "Muscle Gain" | "Maintenance" | "Keto";

export type DietType = "Vegetarian" | "Non-Vegetarian" | "Vegan";

export type MealSlot = "Breakfast" | "Lunch" | "Snack" | "Dinner";

export type Meal = {
  slot: MealSlot;
  name: string;
  kcal: number;
};

export type DietPlan = {
  id: number;
  name: string;
  goal: DietGoal;
  type: DietType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
  assigned: number;
  meals: Meal[];
};

/** Fields the New / Edit Diet Plan modal collects. */
export type DietFormValues = {
  name: string;
  goal: DietGoal;
  type: DietType;
  calories: number;
  protein: number;
  carbs: number;
  fat: number;
};
