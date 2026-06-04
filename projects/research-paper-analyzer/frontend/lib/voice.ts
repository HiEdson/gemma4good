// Web Speech API utilities

export interface SpeechRecognitionEvent extends Event {
  results: SpeechRecognitionResultList;
  isFinal: boolean;
}

export interface SpeechRecognitionResultList {
  length: number;
  item(index: number): SpeechRecognitionResult;
  [index: number]: SpeechRecognitionResult;
}

export interface SpeechRecognitionResult {
  length: number;
  isFinal: boolean;
  item(index: number): SpeechRecognitionAlternative;
  [index: number]: SpeechRecognitionAlternative;
}

export interface SpeechRecognitionAlternative {
  transcript: string;
  confidence: number;
}

const SpeechRecognition = typeof window !== 'undefined'
  ? (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition
  : null;

export const voiceUtils = {
  isSupported(): boolean {
    return SpeechRecognition !== null;
  },

  createRecognizer() {
    if (!SpeechRecognition) {
      throw new Error('Speech Recognition not supported');
    }

    const recognition = new SpeechRecognition();
    recognition.continuous = false;
    recognition.interimResults = true;
    recognition.lang = 'en-US';

    return recognition;
  },

  startListening(
    onTranscript: (transcript: string, isFinal: boolean) => void,
    onError: (error: string) => void
  ): (() => void) {
    const recognition = voiceUtils.createRecognizer();

    recognition.onstart = () => {
      console.log('Speech recognition started');
    };

    recognition.onresult = (event: any) => {
      let interimTranscript = '';

      for (let i = event.resultIndex; i < event.results.length; i++) {
        const transcript = event.results[i][0].transcript;

        if (event.results[i].isFinal) {
          onTranscript(transcript, true);
        } else {
          interimTranscript += transcript;
        }
      }

      if (interimTranscript) {
        onTranscript(interimTranscript, false);
      }
    };

    recognition.onerror = (event: any) => {
      onError(`Error: ${event.error}`);
    };

    recognition.onend = () => {
      console.log('Speech recognition ended');
    };

    recognition.start();

    return () => {
      recognition.abort();
    };
  },

  speak(text: string): void {
    if (typeof window === 'undefined') return;

    const utterance = new SpeechSynthesisUtterance(text);
    utterance.rate = 0.9;
    utterance.pitch = 1;
    utterance.volume = 1;

    window.speechSynthesis.cancel();
    window.speechSynthesis.speak(utterance);
  },

  stopSpeaking(): void {
    if (typeof window !== 'undefined') {
      window.speechSynthesis.cancel();
    }
  },
};
