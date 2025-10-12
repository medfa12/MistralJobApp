import { EMBEDDING, DOCUMENT_PROCESSING, VECTOR_SEARCH } from './constants';
import { withRetry } from './api-helpers';
import { logger } from './logger';

interface EmbeddingResponse {
  data: Array<{ embedding: number[] }>;
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
    throw new Error(`Mistral Embeddings API error: ${response.status} - ${errorText}`);
  }

  const data: EmbeddingResponse = await response.json();
  return data.data.map(item => item.embedding);
}

export async function createEmbeddings(
  chunks: string[],
  apiKey: string
): Promise<number[][]> {
  if (chunks.length === 0) {
    return [];
  }

  const allEmbeddings: number[][] = [];
  
  for (let i = 0; i < chunks.length; i += EMBEDDING.BATCH_SIZE) {
    const batch = chunks.slice(i, i + EMBEDDING.BATCH_SIZE);
    
    logger.debug('Creating embeddings', { 
      batchIndex: Math.floor(i / EMBEDDING.BATCH_SIZE),
      batchSize: batch.length 
    });
    
    const batchEmbeddings = await withRetry(
      () => fetchEmbeddings(batch, apiKey),
      EMBEDDING.RETRY_ATTEMPTS,
      EMBEDDING.RETRY_DELAY_MS
    );
    
    allEmbeddings.push(...batchEmbeddings);
  }
  
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

