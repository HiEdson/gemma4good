import { FoodItem } from '@/types/nutrition';

/**
 * Stubbed Vision API Layer
 * Replaces actual vision model inference (e.g. Gemini/GPT-4V)
 */
export async function analyzeMealImage(imageBuffer: Buffer | string): Promise<Partial<FoodItem>[]> {
  // Simulating network delay
  await new Promise((resolve) => setTimeout(resolve, 1500));
  
  // Return stubbed response mimicking a recognized meal
  return [
    { name: "grilled chicken breast", portion: "150g" },
    { name: "brown rice", portion: "200g" },
    { name: "steamed broccoli", portion: "100g" },
  ];
}
