'use client';

import React from 'react';
import { voiceUtils } from '@/lib/voice';
import { useAppStore } from '@/store/useStore';

interface VoiceInputProps {
  onTranscript: (transcript: string) => void;
}

export const VoiceInput: React.FC<VoiceInputProps> = ({ onTranscript }) => {
  const [isListening, setIsListening] = React.useState(false);
  const [transcript, setTranscript] = React.useState('');
  const [error, setError] = React.useState<string | null>(null);
  const stopListeningRef = React.useRef<(() => void) | null>(null);
  const { setVoiceActive } = useAppStore();

  const isSupported = React.useMemo(() => voiceUtils.isSupported(), []);

  const handleStartListening = () => {
    if (!isSupported) {
      setError('Voice input not supported in this browser');
      return;
    }

    try {
      setIsListening(true);
      setError(null);
      setTranscript('');
      setVoiceActive(true);

      stopListeningRef.current = voiceUtils.startListening(
        (text, isFinal) => {
          setTranscript(text);
          if (isFinal) {
            onTranscript(text);
            setIsListening(false);
            setVoiceActive(false);
          }
        },
        (err) => {
          setError(err);
          setIsListening(false);
          setVoiceActive(false);
        }
      );
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Voice input failed');
      setIsListening(false);
      setVoiceActive(false);
    }
  };

  const handleStopListening = () => {
    if (stopListeningRef.current) {
      stopListeningRef.current();
    }
    setIsListening(false);
    setVoiceActive(false);
  };

  const handleSpeak = () => {
    // This would speak the last assistant message if we had it
    voiceUtils.speak('Voice input feature is ready');
  };

  if (!isSupported) {
    return null;
  }

  return (
    <div className="flex items-center gap-2">
      <button
        onClick={isListening ? handleStopListening : handleStartListening}
        className={`px-3 py-2 rounded-lg text-sm font-medium transition-colors ${
          isListening
            ? 'bg-red-500 text-white hover:bg-red-600'
            : 'bg-gray-200 text-gray-700 hover:bg-gray-300'
        }`}
      >
        {isListening ? '🛑 Stop' : '🎤 Voice'}
      </button>

      {transcript && (
        <div className="flex-1 text-sm text-gray-600 truncate">
          {transcript}
        </div>
      )}

      {error && (
        <div className="text-sm text-red-600">{error}</div>
      )}

      <button
        onClick={handleSpeak}
        className="px-3 py-2 rounded-lg text-sm font-medium bg-gray-200 text-gray-700 hover:bg-gray-300"
        title="Speak"
      >
        🔊
      </button>
    </div>
  );
};
