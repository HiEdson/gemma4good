export interface FoodItem {
  id: string;
  name: string;
  portion: string; // e.g. "200g", "1 cup"
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  micronutrients?: Record<string, number>; // e.g. { iron: 1.5, vitaminC: 12 }
}

export interface Meal {
  id: string;
  userId: string;
  createdAt: string; // ISO String
  items: FoodItem[];
  imageUrl?: string;
  totals: NutrientTotals;
}

export interface NutrientTotals {
  calories: number;
  protein: number;
  carbs: number;
  fats: number;
  micronutrients: Record<string, number>;
}
