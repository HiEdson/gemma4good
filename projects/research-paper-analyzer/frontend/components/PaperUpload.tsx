'use client';

import React, { useRef, useState } from 'react';
import { useAppStore } from '@/store/useStore';
import { apiClient } from '@/lib/api';

export const PaperUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isDragging, setIsDragging] = useState(false);

  const { setPaper, setUploadProgress, setPaperFile } = useAppStore();

  const processFile = async (file: File) => {
    if (!file.name.endsWith('.pdf')) {
      setError('Please select a PDF file');
      return;
    }
    try {
      setIsLoading(true);
      setError(null);
      setPaperFile(file);
      const response = await apiClient.uploadPaper(file);
      setPaper(response.paper_id, {
        paper_id: response.paper_id,
        filename: response.filename,
        num_pages: response.num_pages,
        num_figures: response.num_figures,
        upload_time: new Date().toISOString(),
      });
      setUploadProgress(100);
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setIsLoading(false);
    }
  };

  const handleFileSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) processFile(file);
  };

  const handleDrop = (e: React.DragEvent) => {
    e.preventDefault();
    setIsDragging(false);
    const file = e.dataTransfer.files?.[0];
    if (file) processFile(file);
  };

  return (
    <div className="w-full max-w-lg px-4">
      {/* Hero text */}
      <div className="text-center mb-10">
        <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full text-xs font-medium mb-6"
          style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
          <span className="w-1.5 h-1.5 rounded-full bg-indigo-400 animate-pulse" />
          Powered by Gemma 4 · Running locally
        </div>
        <h1 className="text-5xl font-bold tracking-tight mb-4 leading-tight">
          <span style={{ color: '#f1f5f9' }}>Understand research,</span>
          <br />
          <span className="gradient-text">deeply.</span>
        </h1>
        <p className="text-base" style={{ color: '#64748b' }}>
          Upload a paper and ask anything — figures, methods, results.
          <br />Your AI reads along with you.
        </p>
      </div>

      {/* Upload card */}
      <div
        className={`drop-zone rounded-2xl p-10 text-center cursor-pointer ${isDragging ? 'drag-over' : ''}`}
        style={{
          border: `2px dashed ${isDragging ? '#6366f1' : '#2d2f45'}`,
          background: isDragging ? 'rgba(99,102,241,0.08)' : '#0e0f1a',
        }}
        onClick={() => !isLoading && fileInputRef.current?.click()}
        onDragOver={(e) => { e.preventDefault(); setIsDragging(true); }}
        onDragLeave={() => setIsDragging(false)}
        onDrop={handleDrop}
      >
        {isLoading ? (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.15)' }}>
              <svg className="animate-spin w-6 h-6" style={{ color: '#818cf8' }} fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#94a3b8' }}>Processing paper…</p>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="w-12 h-12 mx-auto rounded-xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.12)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="2">
                <path d="M21 15v4a2 2 0 01-2 2H5a2 2 0 01-2-2v-4M17 8l-5-5-5 5M12 3v12" strokeLinecap="round" strokeLinejoin="round" />
              </svg>
            </div>
            <div>
              <p className="font-medium text-sm" style={{ color: '#e2e8f0' }}>Drop your PDF here</p>
              <p className="text-xs mt-1" style={{ color: '#475569' }}>or click to browse</p>
            </div>
          </div>
        )}
      </div>

      <input ref={fileInputRef} type="file" accept=".pdf" onChange={handleFileSelect} className="hidden" disabled={isLoading} />

      {error && (
        <div className="mt-4 px-4 py-3 rounded-lg text-sm flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.2)', color: '#fca5a5' }}>
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Feature hints */}
      <div className="mt-8 grid grid-cols-3 gap-3">
        {[
          { icon: '📄', label: 'Page-level context' },
          { icon: '📊', label: 'Figure detection' },
          { icon: '🔍', label: 'Semantic search' },
        ].map((f) => (
          <div key={f.label} className="text-center p-3 rounded-xl"
            style={{ background: '#0e0f1a', border: '1px solid #1e2035' }}>
            <div className="text-lg mb-1">{f.icon}</div>
            <p className="text-xs" style={{ color: '#475569' }}>{f.label}</p>
          </div>
        ))}
      </div>
    </div>
  );
};
