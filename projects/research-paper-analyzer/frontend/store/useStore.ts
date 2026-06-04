import { create } from 'zustand';

export interface Message {
  id: string;
  role: 'user' | 'assistant';
  content: string;
  timestamp: Date;
  referencedFigures?: string[];
  referencedPages?: number[];
}

export interface PaperMetadata {
  paper_id: string;
  filename: string;
  num_pages: number;
  num_figures: number;
  upload_time: string;
}

export interface AppState {
  // Paper state
  paperId: string | null;
  paperMetadata: PaperMetadata | null;
  paperFile: File | null;

  // Chat state
  messages: Message[];
  isLoading: boolean;
  uploadProgress: number;

  // UI state
  voiceActive: boolean;
  currentPage: number;
  highlightedFigures: string[];

  // Actions
  setPaper: (id: string, metadata: PaperMetadata) => void;
  setPaperFile: (file: File) => void;
  clearPaper: () => void;
  addMessage: (message: Message) => void;
  clearMessages: () => void;
  setLoading: (loading: boolean) => void;
  setUploadProgress: (progress: number) => void;
  setVoiceActive: (active: boolean) => void;
  setCurrentPage: (page: number) => void;
  setHighlightedFigures: (figures: string[]) => void;
}

export const useAppStore = create<AppState>((set) => ({
  paperId: null,
  paperMetadata: null,
  paperFile: null,
  messages: [],
  isLoading: false,
  uploadProgress: 0,
  voiceActive: false,
  currentPage: 1,
  highlightedFigures: [],

  setPaper: (id, metadata) =>
    set({ paperId: id, paperMetadata: metadata }),

  setPaperFile: (file) =>
    set({ paperFile: file }),

  clearPaper: () =>
    set({
      paperId: null,
      paperMetadata: null,
      paperFile: null,
      messages: [],
    }),

  addMessage: (message) =>
    set((state) => ({
      messages: [...state.messages, message],
    })),

  clearMessages: () =>
    set({ messages: [] }),

  setLoading: (loading) =>
    set({ isLoading: loading }),

  setUploadProgress: (progress) =>
    set({ uploadProgress: progress }),

  setVoiceActive: (active) =>
    set({ voiceActive: active }),

  setCurrentPage: (page) =>
    set({ currentPage: page }),

  setHighlightedFigures: (figures) =>
    set({ highlightedFigures: figures }),
}));
