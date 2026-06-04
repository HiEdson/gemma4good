'use client';

import React from 'react';
import { useAppStore } from '@/store/useStore';
import { SplitViewLayout } from '@/components/SplitViewLayout';
import { PaperUpload } from '@/components/PaperUpload';
import { PaperViewer } from '@/components/PaperViewer';
import { ChatInterface } from '@/components/ChatInterface';

export default function Home() {
  const paperId = useAppStore((state) => state.paperId);

  return (
    <SplitViewLayout>
      {paperId ? (
        <>
          <PaperViewer />
          <ChatInterface />
        </>
      ) : (
        <PaperUpload />
      )}
    </SplitViewLayout>
  );
}
