import { FoodItem, NutrientTotals } from '@/types/nutrition';

/**
 * Aggregates all food items into a total nutrient summary for the meal
 */
export function calculateMealTotals(items: FoodItem[]): NutrientTotals {
  const totals: NutrientTotals = {
    calories: 0,
    protein: 0,
    carbs: 0,
    fats: 0,
    micronutrients: {}
  };

  items.forEach(item => {
    totals.calories += item.calories;
    totals.protein += item.protein;
    totals.carbs += item.carbs;
    totals.fats += item.fats;

    if (item.micronutrients) {
      for (const [key, val] of Object.entries(item.micronutrients)) {
        totals.micronutrients[key] = (totals.micronutrients[key] || 0) + val;
      }
    }
  });

  return {
    calories: Math.round(totals.calories),
    protein: Math.round(totals.protein * 10) / 10,
    carbs: Math.round(totals.carbs * 10) / 10,
    fats: Math.round(totals.fats * 10) / 10,
    micronutrients: totals.micronutrients
  };
}
