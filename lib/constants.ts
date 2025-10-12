export const DOCUMENT_PROCESSING = {
  CHUNK_SIZE: 2048,
  CHUNK_OVERLAP: 200,
  TOP_K_CHUNKS: 5,
  MAX_FILE_SIZE: 50 * 1024 * 1024,
  MIN_CHUNK_LENGTH: 50,
  ALLOWED_EXTENSIONS: ['pdf', 'txt', 'md', 'doc', 'docx'] as const,
  ALLOWED_MIME_TYPES: [
    'application/pdf',
    'text/plain',
    'text/markdown',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  ] as const,
} as const;

export const EMBEDDING = {
  MODEL: 'mistral-embed',
  BATCH_SIZE: 16, // Reduced from 32 to prevent "batch size too large" errors
  MAX_BATCH_TOKENS: 8000, // Maximum tokens per batch (~32KB of text)
  RETRY_ATTEMPTS: 3,
  RETRY_DELAY_MS: 1000,
  DIMENSIONS: 1024,
  MIN_BATCH_SIZE: 1, // Minimum batch size for retry fallback
} as const;

export const VECTOR_SEARCH = {
  MAX_CHUNKS_TO_SEARCH: 500,
  RELEVANCE_THRESHOLD: 0.3,
  MIN_SIMILARITY_SCORE: 0.2,
} as const;

export const API = {
  RATE_LIMIT_WINDOW_MS: 60 * 1000,
  RATE_LIMIT_MAX_REQUESTS: 20,
  RATE_LIMIT_UPLOAD: 10,
  RATE_LIMIT_PROCESSING: 10,
} as const;

export const CONVERSATION = {
  MAX_HISTORY_MESSAGES: 10,
  MAX_TITLE_LENGTH: 100,
  MAX_CONVERSATIONS_PER_PROJECT: 50,
} as const;

