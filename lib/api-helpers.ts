import type { NextApiResponse } from 'next';

export function apiError(
  res: NextApiResponse,
  status: number,
  message: string,
  details?: unknown
) {
  const isProduction = process.env.NODE_ENV === 'production';
  
  return res.status(status).json({
    error: message,
    ...((!isProduction && details) ? { details } : {}),
  });
}

export function apiSuccess<T>(res: NextApiResponse, data: T, status = 200) {
  return res.status(status).json({
    success: true,
    ...data,
  });
}

export async function withRetry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  let lastError: Error | undefined;
  
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      return await fn();
    } catch (error) {
      lastError = error instanceof Error ? error : new Error(String(error));
      
      if (attempt < maxAttempts) {
        await new Promise(resolve => setTimeout(resolve, delayMs * attempt));
      }
    }
  }
  
  throw lastError;
}

export function sanitizeTextForContext(text: string, maxLength = 10000): string {
  return text
    .replace(/[<>]/g, '')
    .replace(/\0/g, '')
    .slice(0, maxLength)
    .trim();
}

