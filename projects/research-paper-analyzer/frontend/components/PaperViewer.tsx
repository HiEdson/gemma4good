'use client';

import React from 'react';
import { useAppStore } from '@/store/useStore';

const QUICK_PROMPTS = [
  'What is the main contribution?',
  'Summarize the methodology',
  'What do the key figures show?',
  'What are the main results?',
];

export const PaperViewer: React.FC = () => {
  const { paperMetadata, currentPage, setCurrentPage } = useAppStore();

  if (!paperMetadata) return null;

  const pages = Array.from({ length: paperMetadata.num_pages }, (_, i) => i + 1);

  return (
    <div className="h-full flex flex-col overflow-hidden" style={{ background: '#080912' }}>
      {/* Paper title bar */}
      <div className="flex-shrink-0 px-5 py-4" style={{ borderBottom: '1px solid #1e2035' }}>
        <div className="flex items-start gap-3">
          <div className="w-9 h-10 rounded-lg flex items-center justify-center flex-shrink-0 mt-0.5"
            style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
              <path d="M14 2H6a2 2 0 00-2 2v16a2 2 0 002 2h12a2 2 0 002-2V8z" />
              <polyline points="14 2 14 8 20 8" />
            </svg>
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium leading-tight truncate" style={{ color: '#e2e8f0' }}>
              {paperMetadata.filename}
            </p>
            <div className="flex items-center gap-3 mt-1">
              <span className="text-xs" style={{ color: '#475569' }}>{paperMetadata.num_pages} pages</span>
              <span style={{ color: '#1e2035' }}>·</span>
              <span className="text-xs" style={{ color: '#475569' }}>{paperMetadata.num_figures} figures detected</span>
            </div>
          </div>
        </div>
      </div>

      {/* Stats row */}
      <div className="flex-shrink-0 grid grid-cols-3 gap-px" style={{ borderBottom: '1px solid #1e2035', background: '#1e2035' }}>
        {[
          { label: 'Pages', value: paperMetadata.num_pages },
          { label: 'Figures', value: paperMetadata.num_figures },
          { label: 'Indexed', value: '✓' },
        ].map((stat) => (
          <div key={stat.label} className="text-center py-3" style={{ background: '#080912' }}>
            <p className="text-base font-semibold" style={{ color: '#f1f5f9' }}>{stat.value}</p>
            <p className="text-xs mt-0.5" style={{ color: '#475569' }}>{stat.label}</p>
          </div>
        ))}
      </div>

      {/* Page navigator */}
      <div className="flex-shrink-0 px-5 py-4" style={{ borderBottom: '1px solid #1e2035' }}>
        <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: '#475569' }}>
          Pages
        </p>
        <div className="flex flex-wrap gap-1.5">
          {pages.map((p) => (
            <button
              key={p}
              onClick={() => setCurrentPage(p)}
              className="w-8 h-8 rounded-lg text-xs font-medium transition-all"
              style={
                p === currentPage
                  ? { background: '#6366f1', color: 'white' }
                  : { background: '#0e0f1a', color: '#475569', border: '1px solid #1e2035' }
              }
            >
              {p}
            </button>
          ))}
        </div>
      </div>

      {/* Quick prompts */}
      <div className="flex-1 px-5 py-4 overflow-y-auto">
        <p className="text-xs font-medium mb-3 uppercase tracking-wider" style={{ color: '#475569' }}>
          Quick questions
        </p>
        <div className="space-y-2">
          {QUICK_PROMPTS.map((prompt) => (
            <QuickPromptButton key={prompt} prompt={prompt} />
          ))}
        </div>

        <div className="mt-6 p-4 rounded-xl" style={{ background: '#0e0f1a', border: '1px solid #1e2035' }}>
          <div className="flex items-center gap-2 mb-2">
            <div className="w-5 h-5 rounded flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <span className="text-xs font-medium" style={{ color: '#94a3b8' }}>Gemma 4 · Local</span>
            <span className="ml-auto w-1.5 h-1.5 rounded-full bg-emerald-400" />
          </div>
          <p className="text-xs leading-relaxed" style={{ color: '#475569' }}>
            Running fully on your machine. No data leaves your computer.
          </p>
        </div>
      </div>
    </div>
  );
};

function QuickPromptButton({ prompt }: { prompt: string }) {
  const { paperId, addMessage, updateMessage, setLoading } = useAppStore();
  const { apiClient } = require('@/lib/api');

  const handleClick = async () => {
    if (!paperId) return;

    const userMsg = {
      id: Date.now().toString(),
      role: 'user' as const,
      content: prompt,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    const assistantId = (Date.now() + 1).toString();
    addMessage({ id: assistantId, role: 'assistant', content: '', timestamp: new Date() });
    setLoading(true);

    let full = '';
    try {
      await apiClient.queryPaperStream(paperId, prompt, 3,
        (chunk: string) => {
          full += chunk;
          updateMessage(assistantId, { content: full });
        },
        () => {}
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      className="w-full text-left px-3 py-2.5 rounded-lg text-sm transition-all group"
      style={{ background: '#0e0f1a', border: '1px solid #1e2035', color: '#94a3b8' }}
      onMouseOver={(e) => {
        e.currentTarget.style.borderColor = '#6366f1';
        e.currentTarget.style.color = '#e2e8f0';
      }}
      onMouseOut={(e) => {
        e.currentTarget.style.borderColor = '#1e2035';
        e.currentTarget.style.color = '#94a3b8';
      }}
    >
      {prompt}
    </button>
  );
}
