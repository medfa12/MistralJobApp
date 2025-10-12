import { EMBEDDING, DOCUMENT_PROCESSING, VECTOR_SEARCH } from './constants';
import { withRetry } from './api-helpers';
import { logger } from './logger';

interface EmbeddingResponse {
  data: Array<{ embedding: number[] }>;
}

interface BatchSizeError extends Error {
  isBatchSizeError: boolean;
}

function isBatchSizeError(error: any): boolean {
  const errorString = error?.message?.toLowerCase() || '';
  return (
    errorString.includes('batch size too large') ||
    errorString.includes('batch_error') ||
    (errorString.includes('400') && errorString.includes('batch'))
  );
}

/**
 * Calculates optimal batch size based on content length to avoid API limits
 */
function calculateOptimalBatchSize(chunks: string[]): number {
  if (chunks.length === 0) return EMBEDDING.BATCH_SIZE;
  
  // Estimate average tokens per chunk (rough estimate: 1 token ≈ 4 characters)
  const avgChunkLength = chunks.reduce((sum, chunk) => sum + chunk.length, 0) / chunks.length;
  const avgTokensPerChunk = Math.ceil(avgChunkLength / 4);
  
  // Calculate how many chunks can fit in MAX_BATCH_TOKENS
  const optimalSize = Math.floor(EMBEDDING.MAX_BATCH_TOKENS / avgTokensPerChunk);
  
  // Clamp between MIN_BATCH_SIZE and BATCH_SIZE
  return Math.max(
    EMBEDDING.MIN_BATCH_SIZE,
    Math.min(optimalSize, EMBEDDING.BATCH_SIZE)
  );
}

async function fetchEmbeddings(chunks: string[], apiKey: string): Promise<number[][]> {
  const response = await fetch('https://api.mistral.ai/v1/embeddings', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: EMBEDDING.MODEL,
      input: chunks,
    }),
  });

  if (!response.ok) {
    const errorText = await response.text();
    const error: any = new Error(`Mistral Embeddings API error: ${response.status} - ${errorText}`);
    error.isBatchSizeError = isBatchSizeError(error);
    throw error;
  }

  const data: EmbeddingResponse = await response.json();
  return data.data.map(item => item.embedding);
}

/**
 * Processes a batch with automatic retry and size reduction on batch size errors
 */
async function processBatchWithFallback(
  batch: string[],
  apiKey: string,
  currentBatchSize: number
): Promise<number[][]> {
  try {
    return await withRetry(
      () => fetchEmbeddings(batch, apiKey),
      EMBEDDING.RETRY_ATTEMPTS,
      EMBEDDING.RETRY_DELAY_MS
    );
  } catch (error: any) {
    // If it's a batch size error and we can split further, try with smaller batches
    if (error.isBatchSizeError && batch.length > 1) {
      const newBatchSize = Math.max(EMBEDDING.MIN_BATCH_SIZE, Math.floor(batch.length / 2));
      
      logger.warn('Batch size too large, retrying with smaller batches', {
        originalSize: batch.length,
        newSize: newBatchSize,
        error: error.message,
      });
      
      // Recursively process with smaller batches
      const results: number[][] = [];
      for (let i = 0; i < batch.length; i += newBatchSize) {
        const smallBatch = batch.slice(i, i + newBatchSize);
        const smallBatchResults = await processBatchWithFallback(smallBatch, apiKey, newBatchSize);
        results.push(...smallBatchResults);
      }
      return results;
    }
    
    // If it's not a batch size error or we can't split further, rethrow
    throw error;
  }
}

export async function createEmbeddings(
  chunks: string[],
  apiKey: string
): Promise<number[][]> {
  if (chunks.length === 0) {
    return [];
  }

  // Calculate optimal batch size based on content
  const optimalBatchSize = calculateOptimalBatchSize(chunks);
  
  logger.info('Starting embedding creation', {
    totalChunks: chunks.length,
    optimalBatchSize,
    defaultBatchSize: EMBEDDING.BATCH_SIZE,
    estimatedBatches: Math.ceil(chunks.length / optimalBatchSize),
  });

  const allEmbeddings: number[][] = [];
  let batchIndex = 0;
  
  for (let i = 0; i < chunks.length; i += optimalBatchSize) {
    const batch = chunks.slice(i, i + optimalBatchSize);
    
    // Calculate batch statistics for logging
    const batchTotalChars = batch.reduce((sum, chunk) => sum + chunk.length, 0);
    const estimatedTokens = Math.ceil(batchTotalChars / 4);
    
    logger.debug('Processing embedding batch', { 
      batchIndex,
      batchSize: batch.length,
      totalChars: batchTotalChars,
      estimatedTokens,
      progress: `${i + batch.length}/${chunks.length}`,
    });
    
    const batchEmbeddings = await processBatchWithFallback(batch, apiKey, optimalBatchSize);
    
    allEmbeddings.push(...batchEmbeddings);
    batchIndex++;
  }
  
  logger.info('Embedding creation completed', {
    totalChunks: chunks.length,
    totalBatches: batchIndex,
    embeddingsCreated: allEmbeddings.length,
  });
  
  return allEmbeddings;
}

export function cosineSimilarity(vectorA: number[], vectorB: number[]): number {
  const dotProduct = vectorA.reduce((sum, val, i) => sum + val * vectorB[i], 0);
  const magnitudeA = Math.sqrt(vectorA.reduce((sum, val) => sum + val * val, 0));
  const magnitudeB = Math.sqrt(vectorB.reduce((sum, val) => sum + val * val, 0));
  
  return dotProduct / (magnitudeA * magnitudeB);
}

interface ScoredChunk<T> {
  chunk: T;
  score: number;
}

export function findTopKSimilar<T extends { embedding: number[] }>(
  queryEmbedding: number[],
  chunks: T[],
  topK = DOCUMENT_PROCESSING.TOP_K_CHUNKS
): ScoredChunk<T>[] {
  const minHeap: ScoredChunk<T>[] = [];
  
  for (const chunk of chunks) {
    const score = cosineSimilarity(queryEmbedding, chunk.embedding);
    
    if (score < VECTOR_SEARCH.RELEVANCE_THRESHOLD) {
      continue;
    }
    
    if (minHeap.length < topK) {
      minHeap.push({ chunk, score });
      if (minHeap.length === topK) {
        minHeap.sort((a, b) => a.score - b.score);
      }
    } else if (score > minHeap[0].score) {
      minHeap[0] = { chunk, score };
      let idx = 0;
      while (idx * 2 + 1 < minHeap.length) {
        const left = idx * 2 + 1;
        const right = idx * 2 + 2;
        let smallest = idx;
        
        if (left < minHeap.length && minHeap[left].score < minHeap[smallest].score) {
          smallest = left;
        }
        if (right < minHeap.length && minHeap[right].score < minHeap[smallest].score) {
          smallest = right;
        }
        
        if (smallest === idx) break;
        
        [minHeap[idx], minHeap[smallest]] = [minHeap[smallest], minHeap[idx]];
        idx = smallest;
      }
    }
  }
  
  return minHeap.sort((a, b) => b.score - a.score);
}

