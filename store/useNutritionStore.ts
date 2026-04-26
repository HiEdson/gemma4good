import { create } from 'zustand';
import { Meal, NutrientTotals } from '@/types/nutrition';

interface NutritionState {
  meals: Meal[];
  dailyTotals: NutrientTotals;
  recommendations: string[];
  isLoading: boolean;
  
  // Actions
  addMeal: (meal: Meal) => void;
  setRecommendations: (recs: string[]) => void;
  setLoading: (loading: boolean) => void;
  resetDailyTotals: () => void;
}

const defaultTotals: NutrientTotals = {
  calories: 0,
  protein: 0,
  carbs: 0,
  fats: 0,
  micronutrients: {}
};

export const useNutritionStore = create<NutritionState>((set) => ({
  meals: [],
  dailyTotals: { ...defaultTotals },
  recommendations: [],
  isLoading: false,

  addMeal: (meal) => set((state) => {
    const newTotals = { ...state.dailyTotals };
    newTotals.calories += meal.totals.calories;
    newTotals.protein += meal.totals.protein;
    newTotals.carbs += meal.totals.carbs;
    newTotals.fats += meal.totals.fats;
    
    // Aggregate micronutrients safely
    for (const [key, val] of Object.entries(meal.totals.micronutrients)) {
      newTotals.micronutrients[key] = (newTotals.micronutrients[key] || 0) + val;
    }
    
    return {
      meals: [meal, ...state.meals], // Prepend to show latest first
      dailyTotals: newTotals
    };
  }),

  setRecommendations: (recs) => set(() => ({ recommendations: recs })),
  
  setLoading: (loading) => set(() => ({ isLoading: loading })),
  
  resetDailyTotals: () => set(() => ({
    meals: [],
    dailyTotals: { ...defaultTotals },
    recommendations: []
  }))
}));
