import { NextApiRequest, NextApiResponse } from 'next';
import { API } from './constants';

interface RateLimitEntry {
  count: number;
  resetTime: number;
}

const rateLimitMap = new Map<string, RateLimitEntry>();

function getClientIdentifier(req: NextApiRequest): string {
  const forwarded = req.headers['x-forwarded-for'];
  const ip = typeof forwarded === 'string' 
    ? forwarded.split(',')[0] 
    : req.socket.remoteAddress || 'unknown';
  
  return `${ip}:${req.url}`;
}

function cleanupExpiredEntries() {
  const now = Date.now();
  for (const [key, entry] of rateLimitMap.entries()) {
    if (now > entry.resetTime) {
      rateLimitMap.delete(key);
    }
  }
}

export function checkRateLimit(
  req: NextApiRequest,
  res: NextApiResponse,
  maxRequests: number = API.RATE_LIMIT_MAX_REQUESTS,
  windowMs: number = API.RATE_LIMIT_WINDOW_MS
): boolean {
  const identifier = getClientIdentifier(req);
  const now = Date.now();
  
  if (rateLimitMap.size > 10000) {
    cleanupExpiredEntries();
  }
  
  const entry = rateLimitMap.get(identifier);
  
  if (!entry || now > entry.resetTime) {
    rateLimitMap.set(identifier, {
      count: 1,
      resetTime: now + windowMs,
    });
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', (maxRequests - 1).toString());
    return true;
  }
  
  if (entry.count >= maxRequests) {
    res.setHeader('X-RateLimit-Limit', maxRequests.toString());
    res.setHeader('X-RateLimit-Remaining', '0');
    res.setHeader('Retry-After', Math.ceil((entry.resetTime - now) / 1000).toString());
    return false;
  }
  
  entry.count++;
  res.setHeader('X-RateLimit-Limit', maxRequests.toString());
  res.setHeader('X-RateLimit-Remaining', (maxRequests - entry.count).toString());
  return true;
}

