export interface User {
  id: string;
  age: number;
  gender: "male" | "female" | "other";
  weight: number; // in kg
  goals: "lose_weight" | "maintain" | "build_muscle";
  createdAt: string;
}

export interface UserDailyTarget {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  micronutrients: Record<string, number>;
}
