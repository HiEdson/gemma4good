import { NutrientTotals } from '@/types/nutrition';

export function generateRecommendationPrompt(current: NutrientTotals, target: NutrientTotals): string {
  return `
You are an expert AI nutritionist. DO NOT provide medical diagnoses.
Compare the user's current intake against their targets:
Current calories: ${current.calories} (Target: ${target.calories})
Current protein: ${current.protein}g (Target: ${target.protein}g)
Current iron: ${current.micronutrients.iron || 0}mg (Target: ${target.micronutrients.iron || 18}mg)

Generate a short, friendly encouraging recommendation about missing nutrients and suggest specific foods to compensate.
Limit your response to 2 sentences.
  `.trim();
}
