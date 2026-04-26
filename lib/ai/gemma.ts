import { NutrientTotals } from '@/types/nutrition';
import { generateRecommendationPrompt } from './promptTemplates';

/**
 * Stubbed Gemma API Layer
 * Interrogates nutrient gaps to generate human-readable insights.
 */
export async function generateNutritionalInsights(totals: NutrientTotals, targets: NutrientTotals): Promise<string[]> {
  const prompt = generateRecommendationPrompt(totals, targets);
  
  // Simulating Gemma model inference delay
  await new Promise((resolve) => setTimeout(resolve, 1200));
  
  const recommendations: string[] = [];
  
  // Simple deterministic stub based on comparisons
  if (totals.protein < targets.protein * 0.8) {
    recommendations.push("You're a bit low on protein today. Consider having Greek yogurt, lean meats, or a protein shake to hit your target.");
  }
  
  const iron = totals.micronutrients.iron || 0;
  const ironTarget = targets.micronutrients.iron || 18; // Default RDI
  if (iron < ironTarget * 0.6) {
    recommendations.push("Your iron intake is quite low. Try incorporating spinach, lentils, or red meat into your next meal.");
  }

  if (recommendations.length === 0) {
    recommendations.push("Great job! Your macronutrient and micronutrient profiles are looking balanced today.");
  }

  return recommendations;
}
