import { FoodItem } from '@/types/nutrition';

// Mocked DB Dictionary for MVP
const MOCK_NUTRITION_DB: Record<string, Omit<FoodItem, 'id' | 'name' | 'portion'>> = {
  "grilled chicken breast": {
    calories: 165,
    protein: 31,
    carbs: 0,
    fats: 3.6,
    micronutrients: { iron: 1.0, b12: 0.3 }
  },
  "brown rice": {
    calories: 111,
    protein: 2.6,
    carbs: 23,
    fats: 0.9,
    micronutrients: { magnesium: 43, iron: 0.4 }
  },
  "steamed broccoli": {
    calories: 34,
    protein: 2.8,
    carbs: 6.6,
    fats: 0.4,
    micronutrients: { vitaminC: 89, iron: 0.7 }
  }
};

/**
 * Matches a detected food name to a database entry and calculates exact nutrition based on portion.
 */
export function matchFoodItem(name: string, portion: string): FoodItem {
  // Normalize string for rudimentary fuzzy match
  const nName = name.toLowerCase().trim();
  const dbEntry = MOCK_NUTRITION_DB[nName];
  
  if (!dbEntry) {
    // Return empty fallback if not found
    return {
      id: crypto.randomUUID(),
      name,
      portion,
      calories: 0,
      protein: 0,
      carbs: 0,
      fats: 0,
      micronutrients: {}
    };
  }
  
  // Note: For MVP, we pass the 100g base values forward without complex portion grammar parsing
  // In a real app, '150g' would multiply these bases by 1.5
  const mockMultiplier = parseInt(portion) ? parseInt(portion) / 100 : 1;

  return {
    id: crypto.randomUUID(),
    name,
    portion,
    calories: parseFloat((dbEntry.calories * mockMultiplier).toFixed(1)),
    protein: parseFloat((dbEntry.protein * mockMultiplier).toFixed(1)),
    carbs: parseFloat((dbEntry.carbs * mockMultiplier).toFixed(1)),
    fats: parseFloat((dbEntry.fats * mockMultiplier).toFixed(1)),
    micronutrients: Object.fromEntries(
      Object.entries(dbEntry.micronutrients || {}).map(([k, v]) => [k, parseFloat((v * mockMultiplier).toFixed(2))])
    )
  };
}
