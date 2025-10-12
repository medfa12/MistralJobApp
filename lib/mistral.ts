import type { NextApiRequest } from 'next';

const toSingleTrimmedValue = (value?: string | string[]): string | undefined => {
  if (!value) return undefined;
  const candidate = Array.isArray(value) ? value[0] : value;
  if (typeof candidate !== 'string') return undefined;
  const trimmed = candidate.trim();
  return trimmed.length > 0 ? trimmed : undefined;
};

/**
 * Attempts to locate a Mistral API key in the request payload.
 * Looks at headers, body (if parsed), and query parameters.
 */
export const getMistralApiKeyFromRequest = (
  req: NextApiRequest
): string | undefined => {
  const headerKey =
    toSingleTrimmedValue(req.headers['x-mistral-api-key'] as string | string[]) ||
    toSingleTrimmedValue(req.headers['x-api-key'] as string | string[]);

  if (headerKey) {
    return headerKey;
  }

  // req.body may be undefined (e.g., for GET requests or when body parsing is disabled)
  const body = req.body as Record<string, unknown> | undefined;
  if (body && typeof body === 'object') {
    const bodyKey = toSingleTrimmedValue(body.apiKey as string | string[]);
    if (bodyKey) {
      return bodyKey;
    }
  }

  const queryKey = toSingleTrimmedValue(req.query.apiKey);
  if (queryKey) {
    return queryKey;
  }

  return undefined;
};
