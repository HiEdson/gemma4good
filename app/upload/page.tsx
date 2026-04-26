"use client";

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { UploadCloud, Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { useNutritionStore } from '@/store/useNutritionStore';

export default function UploadPage() {
  const [isDragging, setIsDragging] = useState(false);
  const [preview, setPreview] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const router = useRouter();
  const { addMeal } = useNutritionStore();

  const handleFile = (file: File) => {
    if (!file) return;
    setPreview(URL.createObjectURL(file));
  };

  const handleUploadClick = async () => {
    setIsProcessing(true);
    
    try {
      // Stubbing photo API analysis call
      const res = await fetch('/api/analyze-meal', { method: 'POST' });
      const { data } = await res.json();
      
      // Store locally
      if (data) {
        addMeal(data);
        setIsSuccess(true);
        setTimeout(() => {
          router.push('/dashboard');
        }, 1500);
      }
    } catch (e) {
      console.error(e);
      alert('Failed to analyze the image');
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="p-4 md:p-8 max-w-2xl mx-auto h-full flex flex-col justify-center">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-slate-800">What's on your plate?</h1>
        <p className="text-slate-500 mt-2">Snap a photo and our AI will track the nutrients automatically.</p>
      </div>

      {!preview ? (
        <label 
          className={`flex flex-col items-center justify-center w-full h-80 border-3 border-dashed rounded-3xl cursor-pointer transition-all duration-300 ${isDragging ? 'border-emerald-500 bg-emerald-50 scale-[1.02]' : 'border-slate-300 bg-slate-50 hover:bg-slate-100'}`}
          onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
          onDragLeave={() => setIsDragging(false)}
          onDrop={(e) => {
            e.preventDefault();
            setIsDragging(false);
            if (e.dataTransfer.files?.[0]) handleFile(e.dataTransfer.files[0]);
          }}
        >
          <div className="flex flex-col items-center justify-center pt-5 pb-6 text-slate-500">
            <div className="bg-white p-4 rounded-full shadow-sm mb-4">
              <UploadCloud className="w-10 h-10 text-emerald-500" />
            </div>
            <p className="mb-2 text-sm md:text-base font-semibold text-slate-700">Click to upload or drag and drop</p>
            <p className="text-xs text-slate-400">SVG, PNG, JPG or GIF (MAX. 800x400px)</p>
          </div>
          <input 
            type="file" 
            className="hidden" 
            accept="image/*"
            onChange={(e) => e.target.files?.[0] && handleFile(e.target.files[0])}
          />
        </label>
      ) : (
        <div className="space-y-6 animate-in fade-in slide-in-from-bottom-4 duration-500">
          <div className="relative rounded-3xl overflow-hidden shadow-xl ring-4 ring-emerald-50">
            <img src={preview} alt="Meal Preview" className="w-full h-64 object-cover object-center" />
            
            {/* Overlay */}
            {isSuccess && (
              <div className="absolute inset-0 bg-emerald-500/80 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10 animate-in fade-in">
                <CheckCircle2 className="w-16 h-16 mb-2" />
                <h2 className="text-xl font-bold">Meal Analysed!</h2>
                <p className="text-sm opacity-90">Redirecting to dashboard...</p>
              </div>
            )}
            {isProcessing && (
              <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white z-10">
                <Loader2 className="w-10 h-10 animate-spin mb-4 text-emerald-400" />
                <p className="text-sm font-medium">Extracting nutrition data...</p>
                <div className="mt-4 w-48 h-1.5 bg-slate-800 rounded-full overflow-hidden">
                  <div className="h-full bg-emerald-500 w-1/2 rounded-full animate-[pulse_1s_ease-in-out_infinite]" />
                </div>
              </div>
            )}
          </div>

          <div className="flex gap-4">
            <Button 
              variant="outline" 
              className="w-full h-12 text-slate-600 font-semibold"
              onClick={() => setPreview(null)}
              disabled={isProcessing || isSuccess}
            >
              Retake Photo
            </Button>
            <Button 
              className="w-full h-12 bg-emerald-600 hover:bg-emerald-700 font-semibold shadow-lg shadow-emerald-200"
              onClick={handleUploadClick}
              disabled={isProcessing || isSuccess}
            >
              Analyze Meal
            </Button>
          </div>
        </div>
      )}
    </div>
  );
}
