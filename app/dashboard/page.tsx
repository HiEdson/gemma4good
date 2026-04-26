"use client";

import { useEffect, useState } from 'react';
import { useNutritionStore } from '@/store/useNutritionStore';
import { generateNutritionalInsights } from '@/lib/ai/gemma';
import { calculateRDI } from '@/lib/nutrition/rdi';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Info, Sparkles, TrendingUp } from 'lucide-react';
import { User, UserDailyTarget } from '@/types/user';

export default function DashboardPage() {
  const { dailyTotals, recommendations, setRecommendations, meals } = useNutritionStore();
  const [target, setTarget] = useState<UserDailyTarget | null>(null);
  const [loadingInsights, setLoadingInsights] = useState(false);

  // Mock a user context
  useEffect(() => {
    const mockUser: User = {
      id: "1", age: 28, gender: "female", weight: 65, goals: "maintain", createdAt: new Date().toISOString()
    };
    setTarget(calculateRDI(mockUser));
  }, []);

  // Poll Gemma when totals change
  useEffect(() => {
    if (target && (dailyTotals.calories > 0)) {
      setLoadingInsights(true);
      generateNutritionalInsights(dailyTotals, target).then(recs => {
        setRecommendations(recs);
        setLoadingInsights(false);
      });
    }
  }, [dailyTotals, target, setRecommendations]);

  if (!target) return <div className="p-8 text-center text-slate-500">Loading profile...</div>;

  const getPercent = (val: number, max: number) => Math.min(100, Math.round((val / max) * 100));

  return (
    <div className="p-4 md:p-8 max-w-5xl mx-auto space-y-6">
      <header>
        <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-emerald-600 to-teal-600">
          Today's Overview
        </h1>
        <p className="text-slate-500 mt-2">Track your nutritional progress backed by AI insights.</p>
      </header>

      {/* Recommendations & Insights */}
      {recommendations.length > 0 && (
        <Card className="border-none shadow-lg bg-gradient-to-br from-emerald-50 to-teal-50">
          <CardHeader className="pb-3">
            <CardTitle className="text-emerald-800 flex items-center gap-2 text-lg">
              <Sparkles className="h-5 w-5 text-emerald-600" />
              AI Insights
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {recommendations.map((rec, i) => (
              <Alert key={i} className="bg-white/60 border-emerald-100 text-emerald-900 shadow-sm backdrop-blur-sm">
                <Info className="h-4 w-4 text-emerald-600" />
                <AlertTitle className="font-semibold text-emerald-800">Recommendation</AlertTitle>
                <AlertDescription className="text-slate-700 leading-relaxed text-sm">
                  {rec}
                </AlertDescription>
              </Alert>
            ))}
            {loadingInsights && <p className="text-xs text-emerald-500 animate-pulse">Updating insights...</p>}
          </CardContent>
        </Card>
      )}

      {/* Main Macros Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <MacroCard title="Calories" current={dailyTotals.calories} max={target.calories} unit="kcal" />
        <MacroCard title="Protein" current={dailyTotals.protein} max={target.protein} unit="g" color="bg-blue-500" />
        <MacroCard title="Carbs" current={dailyTotals.carbs} max={target.carbs} unit="g" color="bg-orange-500" />
        <MacroCard title="Fats" current={dailyTotals.fats} max={target.fats} unit="g" color="bg-yellow-500" />
      </div>

      {/* Recent Uploads */}
      <h2 className="text-xl font-semibold pt-6 text-slate-800">Recent Meals</h2>
      {meals.length === 0 ? (
        <div className="text-center p-12 border-2 border-dashed border-slate-200 rounded-2xl bg-slate-50">
          <p className="text-slate-500">No meals logged today. Head to the Upload tab to snap a photo!</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {meals.map(meal => (
            <Card key={meal.id} className="overflow-hidden border-slate-100 shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 space-y-4">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-semibold text-slate-800">Analyzed Meal</h3>
                    <p className="text-xs text-slate-500">{new Date(meal.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</p>
                  </div>
                  <div className="text-right">
                    <span className="inline-block px-2 py-1 bg-emerald-100 text-emerald-700 text-xs font-bold rounded-full">{meal.totals.calories} kcal</span>
                  </div>
                </div>
                <ul className="space-y-1 text-sm text-slate-600">
                  {meal.items.map((item, idx) => (
                    <li key={idx} className="flex justify-between border-b border-slate-50 pb-1 last:border-0 last:pb-0">
                      <span className="capitalize">{item.name} <span className="text-xs text-slate-400">({item.portion})</span></span>
                      <span className="text-slate-400">{item.calories}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </Card>
          ))}
        </div>
      )}
    </div>
  );

  function MacroCard({ title, current, max, unit, color = "bg-emerald-500" }: any) {
    const pct = getPercent(current, max);
    return (
      <Card className="border-slate-100 shadow-sm relative overflow-hidden group">
        <div className="absolute inset-x-0 bottom-0 h-1 bg-slate-100">
          <div className={`h-full ${color} transition-all duration-1000 ease-out`} style={{ width: `${pct}%` }} />
        </div>
        <CardContent className="p-5">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-sm font-medium text-slate-500 uppercase tracking-wider">{title}</h3>
            <TrendingUp className="h-4 w-4 text-slate-300" />
          </div>
          <div className="flex items-baseline gap-2">
            <span className="text-3xl font-black text-slate-800">{current}</span>
            <span className="text-sm font-medium text-slate-400">/ {max} {unit}</span>
          </div>
        </CardContent>
      </Card>
    );
  }
}
