'use client';

import React, { createContext, useContext, useState, useCallback, ReactNode } from 'react';

interface ChatStateContextType {
  // Loading states
  loading: boolean;
  setLoading: (loading: boolean) => void;
  
  // Streaming states
  streamingMessage: string;
  setStreamingMessage: (message: string) => void;
  
  // Artifact generation states
  isGeneratingArtifact: boolean;
  setIsGeneratingArtifact: (generating: boolean) => void;
  
  artifactLoadingInfo: { operation: string; title?: string; type?: string } | null;
  setArtifactLoadingInfo: (info: { operation: string; title?: string; type?: string } | null) => void;
  
  streamingArtifactCode: string;
  setStreamingArtifactCode: (code: string) => void;
  
  // Thinking accordion state
  thinkingExpanded: Record<number, boolean>;
  setThinkingExpanded: (expanded: Record<number, boolean>) => void;
  toggleThinking: (messageIndex: number) => void;
  
  // Reset all states (called when starting new conversation or clearing chat)
  resetChatState: () => void;
}

const ChatStateContext = createContext<ChatStateContextType | undefined>(undefined);

export function ChatStateProvider({ children }: { children: ReactNode }) {
  // Loading states
  const [loading, setLoading] = useState(false);
  
  // Streaming states
  const [streamingMessage, setStreamingMessage] = useState('');
  
  // Artifact generation states
  const [isGeneratingArtifact, setIsGeneratingArtifact] = useState(false);
  const [artifactLoadingInfo, setArtifactLoadingInfo] = useState<{ operation: string; title?: string; type?: string } | null>(null);
  const [streamingArtifactCode, setStreamingArtifactCode] = useState('');
  
  // Thinking accordion state
  const [thinkingExpanded, setThinkingExpanded] = useState<Record<number, boolean>>({});
  
  const toggleThinking = useCallback((messageIndex: number) => {
    setThinkingExpanded(prev => ({
      ...prev,
      [messageIndex]: !prev[messageIndex],
    }));
  }, []);
  
  const resetChatState = useCallback(() => {
    setLoading(false);
    setStreamingMessage('');
    setIsGeneratingArtifact(false);
    setArtifactLoadingInfo(null);
    setStreamingArtifactCode('');
    setThinkingExpanded({});
  }, []);
  
  const value: ChatStateContextType = {
    loading,
    setLoading,
    streamingMessage,
    setStreamingMessage,
    isGeneratingArtifact,
    setIsGeneratingArtifact,
    artifactLoadingInfo,
    setArtifactLoadingInfo,
    streamingArtifactCode,
    setStreamingArtifactCode,
    thinkingExpanded,
    setThinkingExpanded,
    toggleThinking,
    resetChatState,
  };
  
  return (
    <ChatStateContext.Provider value={value}>
      {children}
    </ChatStateContext.Provider>
  );
}

export function useChatState() {
  const context = useContext(ChatStateContext);
  if (context === undefined) {
    throw new Error('useChatState must be used within a ChatStateProvider');
  }
  return context;
}

