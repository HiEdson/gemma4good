'use client';

import React, { useRef, useEffect } from 'react';
import { useAppStore, Message } from '@/store/useStore';
import { apiClient } from '@/lib/api';
import { VoiceInput } from './VoiceInput';

export const ChatInterface: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);

  const {
    paperId,
    messages,
    isLoading,
    addMessage,
    setLoading,
    setHighlightedFigures,
  } = useAppStore();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSendQuery = async (query: string) => {
    if (!paperId || !query.trim()) return;

    setInputValue('');
    setError(null);

    // Add user message
    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    addMessage(userMessage);

    // Start loading
    setLoading(true);

    try {
      let fullResponse = '';

      await apiClient.queryPaperStream(
        paperId,
        query,
        3,
        (chunk) => {
          fullResponse += chunk;

          // Update the last message with streamed content
          if (messages.length > 0) {
            const lastMsg = messages[messages.length - 1];
            if (lastMsg.role === 'assistant') {
              // Update existing assistant message
              addMessage({
                ...lastMsg,
                content: fullResponse,
              });
            }
          }
        },
        (err) => {
          setError(err.message);
        }
      );

      // Add final assistant message if not already added
      if (fullResponse) {
        const assistantMessage: Message = {
          id: (Date.now() + 1).toString(),
          role: 'assistant',
          content: fullResponse,
          timestamp: new Date(),
          referencedFigures: extractFigureReferences(fullResponse),
          referencedPages: extractPageReferences(fullResponse),
        };
        addMessage(assistantMessage);

        // Highlight referenced figures
        setHighlightedFigures(assistantMessage.referencedFigures || []);
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Query failed');
    } finally {
      setLoading(false);
    }
  };

  const handleVoiceTranscript = (transcript: string) => {
    setInputValue(transcript);
  };

  return (
    <div className="flex flex-col h-full bg-white rounded-lg overflow-hidden">
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-8">
            Ask questions about the paper to get started
          </div>
        )}

        {messages.map((msg) => (
          <div
            key={msg.id}
            className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-xs lg:max-w-md px-4 py-2 rounded-lg ${
                msg.role === 'user'
                  ? 'bg-blue-500 text-white'
                  : 'bg-gray-100 text-gray-900'
              }`}
            >
              <p className="text-sm">{msg.content}</p>
              {msg.referencedFigures && msg.referencedFigures.length > 0 && (
                <p className="text-xs mt-2 opacity-75">
                  Figures: {msg.referencedFigures.join(', ')}
                </p>
              )}
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-gray-100 px-4 py-2 rounded-lg">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-100" />
                <div className="w-2 h-2 bg-gray-400 rounded-full animate-pulse delay-200" />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="px-4 py-2 bg-red-50 border-t border-red-200 text-red-700 text-sm">
          {error}
        </div>
      )}

      {/* Input */}
      <div className="border-t p-4 space-y-3">
        <div className="flex gap-2">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={(e) => {
              if (e.key === 'Enter' && !isLoading) {
                handleSendQuery(inputValue);
              }
            }}
            placeholder="Ask about the paper..."
            className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
            disabled={isLoading || !paperId}
          />
          <button
            onClick={() => handleSendQuery(inputValue)}
            disabled={isLoading || !paperId}
            className="px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50"
          >
            Send
          </button>
        </div>

        <VoiceInput onTranscript={handleVoiceTranscript} />
      </div>
    </div>
  );
};

function extractFigureReferences(text: string): string[] {
  const figPattern = /(?:Figure|Fig\.?)\s+(\d+)/gi;
  const matches = text.matchAll(figPattern);
  const figures = Array.from(matches, (m) => `fig_${m[1]}`);
  return [...new Set(figures)];
}

function extractPageReferences(text: string): number[] {
  const pagePattern = /(?:page|p\.?)\s+(\d+)/gi;
  const matches = text.matchAll(pagePattern);
  const pages = Array.from(matches, (m) => parseInt(m[1], 10));
  return [...new Set(pages)];
}
