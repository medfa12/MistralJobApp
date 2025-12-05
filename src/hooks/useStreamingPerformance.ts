import { useState, useCallback, useRef, useEffect } from 'react';

interface StreamingMetrics {
  tokensPerSecond: number;
  totalTokens: number;
  elapsedTime: number;
  isStreaming: boolean;
}

export function useStreamingPerformance() {
  const [metrics, setMetrics] = useState<StreamingMetrics>({
    tokensPerSecond: 0,
    totalTokens: 0,
    elapsedTime: 0,
    isStreaming: false,
  });

  const startTimeRef = useRef<number>(0);
  const tokenCountRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const resetTimeoutRef = useRef<NodeJS.Timeout>();
  const isStreamingRef = useRef<boolean>(false);

  useEffect(() => {
    return () => {
      if (animationFrameRef.current) {
        cancelAnimationFrame(animationFrameRef.current);
      }
      if (resetTimeoutRef.current) {
        clearTimeout(resetTimeoutRef.current);
      }
    };
  }, []);

  const startStreaming = useCallback(() => {
    if (isStreamingRef.current) return;

    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = undefined;
    }

    startTimeRef.current = performance.now();
    tokenCountRef.current = 0;
    isStreamingRef.current = true;

    setMetrics({
      tokensPerSecond: 0,
      totalTokens: 0,
      elapsedTime: 0,
      isStreaming: true,
    });

    const updateMetrics = () => {
      if (!isStreamingRef.current) return;

      const now = performance.now();
      const elapsed = (now - startTimeRef.current) / 1000;
      const tokens = tokenCountRef.current;
      const tokensPerSec = elapsed > 0 ? tokens / elapsed : 0;

      setMetrics({
        tokensPerSecond: Math.round(tokensPerSec * 10) / 10,
        totalTokens: tokens,
        elapsedTime: Math.round(elapsed * 10) / 10,
        isStreaming: true,
      });

      animationFrameRef.current = requestAnimationFrame(updateMetrics);
    };

    animationFrameRef.current = requestAnimationFrame(updateMetrics);
  }, []);

  const updateTokenCount = useCallback((countOrContent: string | number | { tokens: number; elapsedMs?: number; tps?: number }) => {
    if (typeof countOrContent === 'object' && countOrContent !== null && 'tokens' in countOrContent) {
      tokenCountRef.current = countOrContent.tokens;
      if (typeof countOrContent.elapsedMs === 'number') {
        startTimeRef.current = performance.now() - countOrContent.elapsedMs;
      }
      return;
    }

    const charCount = typeof countOrContent === 'number' ? countOrContent : countOrContent.length;
    const estimatedTokens = Math.ceil(charCount / 4);
    tokenCountRef.current = estimatedTokens;
  }, []);

  const stopStreaming = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

    isStreamingRef.current = false;

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const tokens = tokenCountRef.current;
    const tokensPerSec = elapsed > 0 ? tokens / elapsed : 0;

    setMetrics({
      tokensPerSecond: Math.round(tokensPerSec * 10) / 10,
      totalTokens: tokens,
      elapsedTime: Math.round(elapsed * 10) / 10,
      isStreaming: false,
    });

    resetTimeoutRef.current = setTimeout(() => {
      setMetrics({
        tokensPerSecond: 0,
        totalTokens: 0,
        elapsedTime: 0,
        isStreaming: false,
      });
      resetTimeoutRef.current = undefined;
    }, 2000);
  }, []);

  const resetMetrics = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = undefined;
    }

    isStreamingRef.current = false;
    startTimeRef.current = 0;
    tokenCountRef.current = 0;

    setMetrics({
      tokensPerSecond: 0,
      totalTokens: 0,
      elapsedTime: 0,
      isStreaming: false,
    });
  }, []);

  const getCurrentMetrics = useCallback(() => {
    if (!startTimeRef.current) {
      return {
        tokensPerSecond: 0,
        totalTokens: 0,
        elapsedTime: 0,
      };
    }

    const elapsed = (performance.now() - startTimeRef.current) / 1000;
    const tokens = tokenCountRef.current;
    const tokensPerSec = elapsed > 0 ? tokens / elapsed : 0;
    
    return {
      tokensPerSecond: Math.round(tokensPerSec * 10) / 10,
      totalTokens: tokens,
      elapsedTime: Math.round(elapsed * 10) / 10,
    };
  }, []);

  return {
    metrics,
    startStreaming,
    updateTokenCount,
    stopStreaming,
    resetMetrics,
    getCurrentMetrics,
  };
}
