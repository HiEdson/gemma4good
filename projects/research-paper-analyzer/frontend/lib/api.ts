const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000';

export interface UploadResponse {
  paper_id: string;
  filename: string;
  num_pages: number;
  num_figures: number;
  message: string;
}

export interface PaperData {
  paper_id: string;
  filename: string;
  num_pages: number;
  num_figures: number;
  pages: any[];
  figures: any[];
}

export const apiClient = {
  async uploadPaper(file: File): Promise<UploadResponse> {
    const formData = new FormData();
    formData.append('file', file);

    const response = await fetch(`${API_BASE_URL}/upload`, {
      method: 'POST',
      body: formData,
    });

    if (!response.ok) {
      throw new Error('Failed to upload paper');
    }

    return response.json();
  },

  async getPaper(paperId: string): Promise<PaperData> {
    const response = await fetch(`${API_BASE_URL}/paper/${paperId}`);

    if (!response.ok) {
      throw new Error('Failed to fetch paper');
    }

    return response.json();
  },

  async listPapers(): Promise<any[]> {
    const response = await fetch(`${API_BASE_URL}/papers`);

    if (!response.ok) {
      throw new Error('Failed to list papers');
    }

    return response.json();
  },

  async queryPaper(
    paperId: string,
    query: string,
    topK: number = 3
  ): Promise<EventSource | null> {
    // Note: This returns an EventSource for streaming responses
    // The caller should handle streaming with SSE
    return new EventSource(
      `${API_BASE_URL}/query/${paperId}?query=${encodeURIComponent(query)}&top_k=${topK}`
    );
  },

  async queryPaperStream(
    paperId: string,
    query: string,
    topK: number = 3,
    onChunk: (chunk: string) => void,
    onError: (error: Error) => void
  ): Promise<void> {
    try {
      const response = await fetch(`${API_BASE_URL}/query/${paperId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          paper_id: paperId,
          query,
          top_k: topK,
        }),
      });

      if (!response.ok) {
        throw new Error('Failed to query paper');
      }

      if (!response.body) {
        throw new Error('No response body');
      }

      const reader = response.body.getReader();
      const decoder = new TextDecoder();

      while (true) {
        const { done, value } = await reader.read();

        if (done) break;

        const chunk = decoder.decode(value, { stream: true });

        // Parse SSE format
        const lines = chunk.split('\n');
        for (const line of lines) {
          if (line.startsWith('data: ')) {
            const data = line.slice(6);
            onChunk(data);
          }
        }
      }
    } catch (error) {
      onError(error instanceof Error ? error : new Error(String(error)));
    }
  },
};
