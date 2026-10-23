import type { DietGoal, DietPlan, DietType } from "../../types/diet";

/*
   Diet Plans seed data — ported verbatim from the PLANS array and the
   GOAL_ICON / TYPES / TYPE / MEMBERS constants in tailwind/src/assets/js/diet.js.
   Ids follow the P() 1-based sequence.
*/

export const DIET_GOALS: DietGoal[] = [
  "Weight Loss",
  "Muscle Gain",
  "Maintenance",
  "Keto",
];

export const DIET_TYPES: DietType[] = ["Vegetarian", "Non-Vegetarian", "Vegan"];

/** Diet type → badge class, from the TYPE map. */
export const TYPE_BADGE: Record<DietType, string> = {
  Vegetarian: "badge-present",
  "Non-Vegetarian": "badge-late",
  Vegan: "badge-active",
};

/** Macro segment colours (protein / carbs / fat). */
export const P_COL = "#F4D03F";
export const C_COL = "#22D3EE";
export const F_COL = "#FB923C";

export const DIET_MEMBERS = [
  "Ashley Bennett",
  "Marcus Coleman",
  "Tyler Brooks",
  "Megan Sullivan",
  "Natalie Rivera",
  "Jessica Ramirez",
];

export const DIET_PLANS: DietPlan[] = [
  {
    id: 1,
    name: "Lean Cut 1600",
    goal: "Weight Loss",
    type: "Non-Vegetarian",
    calories: 1600,
    protein: 140,
    carbs: 120,
    fat: 45,
    assigned: 62,
    meals: [
      { slot: "Breakfast", name: "Egg whites + oats", kcal: 340 },
      { slot: "Lunch", name: "Grilled chicken salad", kcal: 480 },
      { slot: "Snack", name: "Greek yogurt + berries", kcal: 220 },
      { slot: "Dinner", name: "Fish + steamed veggies", kcal: 560 },
    ],
  },
  {
    id: 2,
    name: "Mass Builder 3000",
    goal: "Muscle Gain",
    type: "Non-Vegetarian",
    calories: 3000,
    protein: 210,
    carbs: 320,
    fat: 90,
    assigned: 38,
    meals: [
      { slot: "Breakfast", name: "Oats, whey & banana", kcal: 650 },
      { slot: "Lunch", name: "Chicken, rice & dal", kcal: 820 },
      { slot: "Snack", name: "Peanut butter toast", kcal: 480 },
      { slot: "Dinner", name: "Beef, potato & greens", kcal: 1050 },
    ],
  },
  {
    id: 3,
    name: "Veg Shred 1800",
    goal: "Weight Loss",
    type: "Vegetarian",
    calories: 1800,
    protein: 110,
    carbs: 180,
    fat: 55,
    assigned: 44,
    meals: [
      { slot: "Breakfast", name: "Paneer bhurji + roti", kcal: 420 },
      { slot: "Lunch", name: "Rajma rice bowl", kcal: 560 },
      { slot: "Snack", name: "Sprouts chaat", kcal: 240 },
      { slot: "Dinner", name: "Tofu stir-fry", kcal: 580 },
    ],
  },
  {
    id: 4,
    name: "Balanced Maintain",
    goal: "Maintenance",
    type: "Non-Vegetarian",
    calories: 2200,
    protein: 150,
    carbs: 230,
    fat: 70,
    assigned: 51,
    meals: [
      { slot: "Breakfast", name: "Poha + eggs", kcal: 480 },
      { slot: "Lunch", name: "Chicken wrap", kcal: 620 },
      { slot: "Snack", name: "Fruit & nuts", kcal: 320 },
      { slot: "Dinner", name: "Grilled fish + quinoa", kcal: 780 },
    ],
  },
  {
    id: 5,
    name: "Keto Kickstart",
    goal: "Keto",
    type: "Non-Vegetarian",
    calories: 1900,
    protein: 130,
    carbs: 40,
    fat: 140,
    assigned: 29,
    meals: [
      { slot: "Breakfast", name: "Avocado & eggs", kcal: 520 },
      { slot: "Lunch", name: "Chicken & cheese salad", kcal: 640 },
      { slot: "Snack", name: "Almonds & cheese", kcal: 300 },
      { slot: "Dinner", name: "Salmon & butter greens", kcal: 440 },
    ],
  },
  {
    id: 6,
    name: "Vegan Power 2400",
    goal: "Muscle Gain",
    type: "Vegan",
    calories: 2400,
    protein: 130,
    carbs: 300,
    fat: 70,
    assigned: 22,
    meals: [
      { slot: "Breakfast", name: "Tofu scramble + toast", kcal: 560 },
      { slot: "Lunch", name: "Chickpea buddha bowl", kcal: 720 },
      { slot: "Snack", name: "Protein smoothie", kcal: 380 },
      { slot: "Dinner", name: "Lentil curry + rice", kcal: 740 },
    ],
  },
  {
    id: 7,
    name: "Slim & Trim 1400",
    goal: "Weight Loss",
    type: "Vegetarian",
    calories: 1400,
    protein: 95,
    carbs: 130,
    fat: 40,
    assigned: 55,
    meals: [
      { slot: "Breakfast", name: "Veg smoothie bowl", kcal: 300 },
      { slot: "Lunch", name: "Quinoa veg salad", kcal: 420 },
      { slot: "Snack", name: "Roasted chana", kcal: 180 },
      { slot: "Dinner", name: "Moong dal soup + salad", kcal: 500 },
    ],
  },
  {
    id: 8,
    name: "Athlete Fuel 2800",
    goal: "Maintenance",
    type: "Non-Vegetarian",
    calories: 2800,
    protein: 180,
    carbs: 300,
    fat: 85,
    assigned: 33,
    meals: [
      { slot: "Breakfast", name: "Pancakes & whey", kcal: 640 },
      { slot: "Lunch", name: "Turkey rice bowl", kcal: 780 },
      { slot: "Snack", name: "Trail mix", kcal: 400 },
      { slot: "Dinner", name: "Steak & sweet potato", kcal: 980 },
    ],
  },
  {
    id: 9,
    name: "Green Keto Veg",
    goal: "Keto",
    type: "Vegetarian",
    calories: 1700,
    protein: 90,
    carbs: 35,
    fat: 130,
    assigned: 18,
    meals: [
      { slot: "Breakfast", name: "Cheese omelette", kcal: 460 },
      { slot: "Lunch", name: "Paneer & avocado bowl", kcal: 620 },
      { slot: "Snack", name: "Walnuts & cheese", kcal: 280 },
      { slot: "Dinner", name: "Mushroom butter masala", kcal: 340 },
    ],
  },
];
