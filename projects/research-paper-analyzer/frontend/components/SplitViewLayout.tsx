import React from 'react';
import { useAppStore } from '@/store/useStore';

export const SplitViewLayout: React.FC<{
  children: React.ReactNode;
}> = ({ children }) => {
  const paperId = useAppStore((state) => state.paperId);

  return (
    <div className="h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="px-6 py-4">
          <h1 className="text-2xl font-bold text-gray-900">
            Research Paper Analyzer
          </h1>
        </div>
      </header>

      <main className="h-[calc(100vh-73px)] overflow-hidden">
        {paperId ? (
          <div className="grid grid-cols-2 gap-4 h-full p-4">
            {/* Left: Paper Viewer */}
            <div className="bg-white rounded-lg shadow overflow-auto">
              {children}
            </div>

            {/* Right: Chat Interface */}
            <div className="bg-white rounded-lg shadow flex flex-col">
              {children}
            </div>
          </div>
        ) : (
          <div className="flex items-center justify-center h-full">
            {children}
          </div>
        )}
      </main>
    </div>
  );
};
