'use client';

import React, { useRef, useEffect, useState } from 'react';
import { useAppStore, Message } from '@/store/useStore';
import { apiClient } from '@/lib/api';

export const ChatInterface: React.FC = () => {
  const inputRef = useRef<HTMLInputElement>(null);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const [inputValue, setInputValue] = useState('');
  const [error, setError] = useState<string | null>(null);

  const { paperId, messages, isLoading, addMessage, updateMessage, setLoading, setHighlightedFigures } = useAppStore();

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  const handleSend = async (query: string) => {
    if (!paperId || !query.trim() || isLoading) return;

    setInputValue('');
    setError(null);

    const userMsg: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: query,
      timestamp: new Date(),
    };
    addMessage(userMsg);

    // Add empty assistant message to fill in as chunks arrive
    const assistantId = (Date.now() + 1).toString();
    addMessage({ id: assistantId, role: 'assistant', content: '', timestamp: new Date() });
    setLoading(true);

    let full = '';
    try {
      await apiClient.queryPaperStream(
        paperId,
        query,
        3,
        (chunk: string) => {
          full += chunk;
          updateMessage(assistantId, { content: full });
        },
        (err: Error) => {
          setError(err.message);
          updateMessage(assistantId, { content: `Error: ${err.message}` });
        }
      );

      if (full) {
        updateMessage(assistantId, {
          content: full,
          referencedFigures: extractFigureRefs(full),
          referencedPages: extractPageRefs(full),
        });
        setHighlightedFigures(extractFigureRefs(full));
      }
    } catch (err) {
      const msg = err instanceof Error ? err.message : 'Query failed';
      setError(msg);
      updateMessage(assistantId, { content: `Error: ${msg}` });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col h-full" style={{ background: '#080912' }}>
      {/* Header */}
      <div className="flex-shrink-0 px-5 py-4 flex items-center gap-3" style={{ borderBottom: '1px solid #1e2035' }}>
        <div className="w-7 h-7 rounded-lg flex items-center justify-center flex-shrink-0"
          style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
          <span className="text-white text-xs font-bold">G</span>
        </div>
        <div>
          <p className="text-sm font-medium" style={{ color: '#e2e8f0' }}>Ask Gemma</p>
          <p className="text-xs" style={{ color: '#475569' }}>Gemma 4 12B · local inference</p>
        </div>
        <div className="ml-auto flex items-center gap-1.5">
          <span className="w-1.5 h-1.5 rounded-full bg-emerald-400" />
          <span className="text-xs" style={{ color: '#475569' }}>ready</span>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-5 py-4 space-y-4">
        {messages.length === 0 && (
          <div className="flex flex-col items-center justify-center h-full gap-3 text-center">
            <div className="w-12 h-12 rounded-2xl flex items-center justify-center"
              style={{ background: 'rgba(99,102,241,0.1)', border: '1px solid rgba(99,102,241,0.2)' }}>
              <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="#818cf8" strokeWidth="1.8">
                <path d="M21 15a2 2 0 01-2 2H7l-4 4V5a2 2 0 012-2h14a2 2 0 012 2z" />
              </svg>
            </div>
            <p className="text-sm font-medium" style={{ color: '#475569' }}>Ask anything about this paper</p>
          </div>
        )}

        {messages.map((msg) => (
          <MessageBubble key={msg.id} msg={msg} />
        ))}

        {isLoading && messages[messages.length - 1]?.role === 'assistant' && messages[messages.length - 1]?.content === '' && (
          <div className="flex items-start gap-3">
            <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center"
              style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}>
              <span className="text-white text-xs font-bold">G</span>
            </div>
            <div className="px-4 py-3 rounded-2xl rounded-tl-sm" style={{ background: '#0e0f1a', border: '1px solid #1e2035' }}>
              <div className="flex gap-1.5 items-center h-4">
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#6366f1' }} />
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#6366f1' }} />
                <span className="typing-dot w-1.5 h-1.5 rounded-full" style={{ background: '#6366f1' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Error */}
      {error && (
        <div className="flex-shrink-0 mx-5 mb-2 px-3 py-2 rounded-lg text-xs flex items-center gap-2"
          style={{ background: 'rgba(239,68,68,0.08)', border: '1px solid rgba(239,68,68,0.15)', color: '#fca5a5' }}>
          <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2">
            <circle cx="12" cy="12" r="10" /><line x1="12" y1="8" x2="12" y2="12" /><line x1="12" y1="16" x2="12.01" y2="16" />
          </svg>
          {error}
        </div>
      )}

      {/* Input */}
      <div className="flex-shrink-0 px-5 py-4" style={{ borderTop: '1px solid #1e2035' }}>
        <div className="flex gap-2 items-center">
          <input
            ref={inputRef}
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') handleSend(inputValue); }}
            placeholder="Ask about the paper…"
            disabled={isLoading || !paperId}
            className="flex-1 px-4 py-2.5 rounded-xl text-sm outline-none transition-all"
            style={{
              background: '#0e0f1a',
              border: '1px solid #2d2f45',
              color: '#e2e8f0',
            }}
            onFocus={(e) => (e.target.style.borderColor = '#6366f1')}
            onBlur={(e) => (e.target.style.borderColor = '#2d2f45')}
          />
          <button
            onClick={() => handleSend(inputValue)}
            disabled={isLoading || !paperId || !inputValue.trim()}
            className="btn-glow w-10 h-10 rounded-xl flex items-center justify-center flex-shrink-0 transition-all disabled:opacity-40 disabled:shadow-none"
            style={{ background: 'linear-gradient(135deg, #6366f1, #8b5cf6)' }}
          >
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="white" strokeWidth="2.5">
              <line x1="22" y1="2" x2="11" y2="13" />
              <polygon points="22 2 15 22 11 13 2 9 22 2" />
            </svg>
          </button>
        </div>
      </div>
    </div>
  );
};

function MessageBubble({ msg }: { msg: Message }) {
  const isUser = msg.role === 'user';
  return (
    <div className={`flex items-start gap-3 ${isUser ? 'flex-row-reverse' : ''}`}>
      {/* Avatar */}
      <div className="w-7 h-7 rounded-lg flex-shrink-0 flex items-center justify-center text-xs font-bold"
        style={isUser
          ? { background: '#1e2035', color: '#818cf8', border: '1px solid #2d2f45' }
          : { background: 'linear-gradient(135deg, #6366f1, #8b5cf6)', color: 'white' }}>
        {isUser ? 'U' : 'G'}
      </div>

      {/* Bubble */}
      <div className={`max-w-xs lg:max-w-sm xl:max-w-md ${isUser ? 'items-end' : 'items-start'} flex flex-col gap-1`}>
        <div
          className={`px-4 py-2.5 rounded-2xl text-sm leading-relaxed ${isUser ? 'rounded-tr-sm' : 'rounded-tl-sm'}`}
          style={isUser
            ? { background: '#6366f1', color: 'white' }
            : { background: '#0e0f1a', border: '1px solid #1e2035', color: '#d1d5db' }}>
          {msg.content || <span style={{ opacity: 0.4 }}>…</span>}
        </div>
        {msg.referencedFigures && msg.referencedFigures.length > 0 && (
          <div className="flex flex-wrap gap-1">
            {msg.referencedFigures.map((f) => (
              <span key={f} className="text-xs px-2 py-0.5 rounded-full"
                style={{ background: 'rgba(99,102,241,0.1)', color: '#818cf8', border: '1px solid rgba(99,102,241,0.2)' }}>
                {f}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}

function extractFigureRefs(text: string): string[] {
  const matches = text.matchAll(/(?:Figure|Fig\.?)\s+(\d+)/gi);
  return [...new Set(Array.from(matches, (m) => `fig_${m[1]}`))];
}

function extractPageRefs(text: string): number[] {
  const matches = text.matchAll(/(?:page|p\.?)\s+(\d+)/gi);
  return [...new Set(Array.from(matches, (m) => parseInt(m[1], 10)))];
}
