'use client';

import React, { useRef } from 'react';
import { useAppStore } from '@/store/useStore';
import { apiClient } from '@/lib/api';

export const PaperUpload: React.FC = () => {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [error, setError] = React.useState<string | null>(null);
  const [isLoading, setIsLoading] = React.useState(false);

  const { setPaper, setUploadProgress, setPaperFile } = useAppStore();

  const handleFileSelect = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

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

  return (
    <div className="w-full max-w-md mx-auto p-8">
      <div className="text-center">
        <h2 className="text-3xl font-bold mb-4 text-gray-900">
          Upload Research Paper
        </h2>
        <p className="text-gray-600 mb-8">
          Select a PDF to begin interactive analysis with AI
        </p>

        <div
          className="border-2 border-dashed border-gray-300 rounded-lg p-12 cursor-pointer hover:border-blue-500 transition-colors"
          onClick={() => fileInputRef.current?.click()}
        >
          <svg
            className="mx-auto mb-4 w-12 h-12 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 4v16m8-8H4"
            />
          </svg>
          <p className="text-gray-500">
            Click or drag PDF file here
          </p>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept=".pdf"
          onChange={handleFileSelect}
          className="hidden"
          disabled={isLoading}
        />

        {isLoading && (
          <div className="mt-4">
            <div className="bg-blue-100 rounded-full h-2 w-full overflow-hidden">
              <div className="bg-blue-500 h-full" style={{ width: '100%' }} />
            </div>
            <p className="text-sm text-gray-500 mt-2">Processing...</p>
          </div>
        )}

        {error && (
          <div className="mt-4 p-4 bg-red-50 border border-red-200 rounded text-red-700 text-sm">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
