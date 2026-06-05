'use client';

import React from 'react';
import { useAppStore } from '@/store/useStore';

export const SplitViewLayout: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const { paperId, paperMetadata, clearPaper } = useAppStore();

  return (
    <div className="h-screen flex flex-col" style={{ background: '#080912' }}>
      {/* Header */}
      <header style={{ background: '#0e0f1a', borderBottom: '1px solid #1e2035' }} className="flex-shrink-0">
        <div className="px-6 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3">
            {/* Logo mark */}
            <div className="w-8 h-8 rounded-lg flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
                <path d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
              </svg>
            </div>
            <span className="font-semibold text-white text-sm tracking-tight">PaperMind</span>
            <span className="text-xs px-2 py-0.5 rounded-full font-medium"
              style={{ background: 'rgba(99,102,241,0.15)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.25)' }}>
              Gemma 4
            </span>
          </div>

          {paperId && paperMetadata && (
            <div className="flex items-center gap-4">
              <div className="flex items-center gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
                <span className="text-sm truncate max-w-xs" style={{ color: '#94a3b8' }}>
                  {paperMetadata.filename}
                </span>
              </div>
              <button
                onClick={clearPaper}
                className="text-xs px-3 py-1.5 rounded-lg transition-colors"
                style={{ background: '#1e2035', color: '#94a3b8', border: '1px solid #2d2f45' }}
                onMouseOver={(e) => (e.currentTarget.style.color = '#f1f5f9')}
                onMouseOut={(e) => (e.currentTarget.style.color = '#94a3b8')}
              >
                New Paper
              </button>
            </div>
          )}
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1 overflow-hidden">
        {paperId ? (
          <div className="grid h-full" style={{ gridTemplateColumns: '1fr 1fr', gap: '1px', background: '#1e2035' }}>
            {children}
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
