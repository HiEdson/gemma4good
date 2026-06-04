'use client';

import React, { useEffect, useState } from 'react';
import { useAppStore } from '@/store/useStore';
import { apiClient } from '@/lib/api';

export const PaperViewer: React.FC = () => {
  const { paperId, paperMetadata, currentPage, setCurrentPage } = useAppStore();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [numPages, setNumPages] = useState(0);
  const canvasRef = React.useRef<HTMLCanvasElement>(null);

  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // For now, we'll display a placeholder since react-pdf requires complex setup
  // In production, implement with pdfjs or react-pdf

  if (!paperId || !paperMetadata) {
    return (
      <div className="flex items-center justify-center h-full text-gray-500">
        No paper loaded
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="border-b p-4 bg-gray-50">
        <h2 className="font-semibold text-gray-900">
          {paperMetadata.filename}
        </h2>
        <p className="text-sm text-gray-600">
          Pages: {paperMetadata.num_pages} | Figures: {paperMetadata.num_figures}
        </p>
      </div>

      {/* PDF Viewer Area */}
      <div className="flex-1 overflow-auto bg-gray-100 p-4 flex items-center justify-center">
        <div className="bg-white rounded-lg shadow-lg p-8 max-w-2xl text-center">
          <svg
            className="mx-auto mb-4 w-16 h-16 text-gray-400"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7a2 2 0 00-2 2v14a2 2 0 002 2z"
            />
          </svg>
          <h3 className="font-semibold text-gray-900 mb-2">PDF Viewer</h3>
          <p className="text-gray-600 text-sm mb-4">
            Paper viewer will display here with figure highlighting
          </p>
          <p className="text-xs text-gray-500">
            Currently showing {paperMetadata.num_pages} pages
          </p>

          {/* Pagination example */}
          <div className="mt-4 flex justify-center gap-2">
            <button
              onClick={() => setCurrentPage(Math.max(1, currentPage - 1))}
              disabled={currentPage === 1}
              className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
            >
              ← Prev
            </button>
            <span className="px-3 py-1 text-sm text-gray-600">
              Page {currentPage} / {paperMetadata.num_pages}
            </span>
            <button
              onClick={() => setCurrentPage(Math.min(paperMetadata.num_pages, currentPage + 1))}
              disabled={currentPage === paperMetadata.num_pages}
              className="px-3 py-1 bg-gray-200 rounded text-sm disabled:opacity-50"
            >
              Next →
            </button>
          </div>
        </div>
      </div>

      {/* Footer - Status */}
      {error && (
        <div className="border-t p-4 bg-red-50 text-red-700 text-sm">
          {error}
        </div>
      )}
    </div>
  );
};
