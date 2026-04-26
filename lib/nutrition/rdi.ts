import { User, UserDailyTarget } from '@/types/user';

/**
 * Returns generic RDIs based on Age and Gender.
 * Note: MVP mocked targets.
 */
export function calculateRDI(user: User): UserDailyTarget {
  let calories = 2000;
  let protein = 50;
  let iron = 8;
  
  if (user.gender === 'male') {
    calories = 2500;
    protein = 60;
    iron = 8;
  } else if (user.gender === 'female') {
    calories = 2000;
    protein = 46;
    iron = user.age >= 19 && user.age <= 50 ? 18 : 8; // Menstruating females need more iron
  }

  // Activity/Goal modifier
  if (user.goals === 'lose_weight') {
    calories *= 0.8;
  } else if (user.goals === 'build_muscle') {
    calories *= 1.1;
    protein *= 1.5; // High protein needed
  }

  return {
    calories: Math.round(calories),
    protein: Math.round(protein),
    carbs: Math.round(calories * 0.5 / 4), // 50% carbs (4 cal/g)
    fats: Math.round(calories * 0.3 / 9),  // 30% fats (9 cal/g)
    micronutrients: {
      iron,
      vitaminC: 90,
      magnesium: 400
    }
  };
}
