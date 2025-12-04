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
  const lastUpdateRef = useRef<number>(0);
  const animationFrameRef = useRef<number>();
  const resetTimeoutRef = useRef<NodeJS.Timeout>();

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
    if (resetTimeoutRef.current) {
      clearTimeout(resetTimeoutRef.current);
      resetTimeoutRef.current = undefined;
    }

    startTimeRef.current = performance.now();
    tokenCountRef.current = 0;
    lastUpdateRef.current = performance.now();

    setMetrics({
      tokensPerSecond: 0,
      totalTokens: 0,
      elapsedTime: 0,
      isStreaming: true,
    });

    const updateMetrics = () => {
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

  const updateTokenCount = useCallback((countOrContent: string | number) => {
    const charCount = typeof countOrContent === 'number' ? countOrContent : countOrContent.length;
    const estimatedTokens = Math.ceil(charCount / 4);
    tokenCountRef.current = estimatedTokens;
  }, []);

  const stopStreaming = useCallback(() => {
    if (animationFrameRef.current) {
      cancelAnimationFrame(animationFrameRef.current);
    }

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

    startTimeRef.current = 0;
    tokenCountRef.current = 0;
    lastUpdateRef.current = 0;

    setMetrics({
      tokensPerSecond: 0,
      totalTokens: 0,
      elapsedTime: 0,
      isStreaming: false,
    });
  }, []);

  const getCurrentMetrics = useCallback(() => {
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
