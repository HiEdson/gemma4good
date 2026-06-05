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
  paperId: string | null;
  paperMetadata: PaperMetadata | null;
  paperFile: File | null;
  messages: Message[];
  isLoading: boolean;
  uploadProgress: number;
  voiceActive: boolean;
  currentPage: number;
  highlightedFigures: string[];

  setPaper: (id: string, metadata: PaperMetadata) => void;
  setPaperFile: (file: File) => void;
  clearPaper: () => void;
  addMessage: (message: Message) => void;
  updateMessage: (id: string, updates: Partial<Message>) => void;
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

  setPaper: (id, metadata) => set({ paperId: id, paperMetadata: metadata }),
  setPaperFile: (file) => set({ paperFile: file }),
  clearPaper: () => set({ paperId: null, paperMetadata: null, paperFile: null, messages: [] }),
  addMessage: (message) => set((state) => ({ messages: [...state.messages, message] })),
  updateMessage: (id, updates) =>
    set((state) => ({
      messages: state.messages.map((m) => (m.id === id ? { ...m, ...updates } : m)),
    })),
  clearMessages: () => set({ messages: [] }),
  setLoading: (loading) => set({ isLoading: loading }),
  setUploadProgress: (progress) => set({ uploadProgress: progress }),
  setVoiceActive: (active) => set({ voiceActive: active }),
  setCurrentPage: (page) => set({ currentPage: page }),
  setHighlightedFigures: (figures) => set({ highlightedFigures: figures }),
}));
