import { NextResponse } from 'next/server';
import { analyzeMealImage } from '@/lib/ai/vision';
import { matchFoodItem } from '@/lib/nutrition/matcher';
import { calculateMealTotals } from '@/lib/nutrition/calculator';
import { getLocalWeather } from '@/lib/weather/weather';
import { FoodItem, Meal } from '@/types/nutrition';

export async function POST(req: Request) {
  try {
    // In a real app, parse multipart/form-data for the image upload.
    // For this MVP, we just expect a simple ping.
    // const formData = await req.formData();
    // const image = formData.get('image');
    
    // 1. Send image to Vision model (stub)
    const detectedFoods = await analyzeMealImage("mock-buffer");
    
    // 2. Match recognized names vs localized Nutrition dict
    const hydratedItems: FoodItem[] = detectedFoods.map(food => {
      return matchFoodItem(food.name || '', food.portion || '100g');
    });
    
    // 3. Roll up macro totals
    const totals = calculateMealTotals(hydratedItems);
    
    // 4. Construct response Meal object
    const mealRecord: Meal = {
      id: crypto.randomUUID(),
      userId: 'mock-user-id', 
      createdAt: new Date().toISOString(),
      items: hydratedItems,
      imageUrl: '/placeholder-food.jpg', // mocked image path
      totals
    };

    // 5. Gather contextual parameters
    const weatherContext = await getLocalWeather();
    
    return NextResponse.json({
      success: true,
      data: mealRecord,
      context: {
        weather: weatherContext
      }
    });

  } catch (err: any) {
    console.error("Meal analysis failed:", err);
    return NextResponse.json({ success: false, error: "Analysis failed" }, { status: 500 });
  }
}
