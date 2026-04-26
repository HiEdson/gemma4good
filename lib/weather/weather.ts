export interface WeatherData {
  uvIndex: number;
  sunlightLevel: 'low' | 'medium' | 'high';
}

/**
 * Stubbed Weather Integration
 * Returns mock UV index and sunlight for Vitamin D recommendations.
 */
export async function getLocalWeather(lat?: number, lon?: number): Promise<WeatherData> {
  // Simulating network delay
  await new Promise((resolve) => setTimeout(resolve, 500));
  
  // Return stubbed cloudy weather (low sunlight) to trigger a Vitamin D recommendation
  return {
    uvIndex: 2,
    sunlightLevel: 'low'
  };
}
