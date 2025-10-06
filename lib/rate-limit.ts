import { NextApiRequest, NextApiResponse } from 'next';

interface RateLimitRecord {
  count: number;
  resetTime: number;
}

const rateLimit = new Map<string, RateLimitRecord>();

export interface RateLimitOptions {
  limit?: number;        // Max requests
  windowMs?: number;     // Time window in milliseconds
  keyGenerator?: (req: NextApiRequest) => string;
  skipSuccessfulRequests?: boolean;
  skipFailedRequests?: boolean;
}

export function createRateLimiter(options: RateLimitOptions = {}) {
  const {
    limit = 10,
    windowMs = 60000,
    keyGenerator = (req) => {
      const ip = req.headers['x-forwarded-for'] || 
                 req.headers['x-real-ip'] || 
                 req.socket.remoteAddress || 
                 'unknown';
      const ipString = Array.isArray(ip) ? ip[0] : ip;
      return `${ipString}-${req.url}`;
    },
    skipSuccessfulRequests = false,
    skipFailedRequests = false,
  } = options;

  return async (
    req: NextApiRequest,
    res: NextApiResponse,
    next: () => Promise<void>
  ) => {
    const key = keyGenerator(req);
    const now = Date.now();

    // Clean up old records periodically (1% chance)
    if (Math.random() < 0.01) {
      for (const [k, v] of rateLimit.entries()) {
        if (now > v.resetTime) {
          rateLimit.delete(k);
        }
      }
    }

    const record = rateLimit.get(key);

    if (!record || now > record.resetTime) {
      rateLimit.set(key, {
        count: 1,
        resetTime: now + windowMs
      });
      
      // Set rate limit headers
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', (limit - 1).toString());
      res.setHeader('X-RateLimit-Reset', new Date(now + windowMs).toISOString());
      
      return next();
    }

    if (record.count >= limit) {
      const retryAfter = Math.ceil((record.resetTime - now) / 1000);
      
      res.setHeader('Retry-After', retryAfter.toString());
      res.setHeader('X-RateLimit-Limit', limit.toString());
      res.setHeader('X-RateLimit-Remaining', '0');
      res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());
      
      return res.status(429).json({
        success: false,
        error: 'Too many requests',
        message: `Rate limit exceeded. Try again in ${retryAfter} seconds.`,
        retryAfter
      });
    }

    record.count++;
    
    // Set rate limit headers
    res.setHeader('X-RateLimit-Limit', limit.toString());
    res.setHeader('X-RateLimit-Remaining', (limit - record.count).toString());
    res.setHeader('X-RateLimit-Reset', new Date(record.resetTime).toISOString());

    return next();
  };
}

// Helper wrapper for API routes
export function withRateLimit(
  handler: (req: NextApiRequest, res: NextApiResponse) => Promise<void>,
  options?: RateLimitOptions
) {
  const limiter = createRateLimiter(options);
  
  return async (req: NextApiRequest, res: NextApiResponse) => {
    await limiter(req, res, async () => {
      await handler(req, res);
    });
  };
}

// Pre-configured rate limiters for common use cases
export const authRateLimit = (handler: any) => 
  withRateLimit(handler, {
    limit: 5,        // 5 attempts
    windowMs: 60000  // per minute
  });

export const strictAuthRateLimit = (handler: any) => 
  withRateLimit(handler, {
    limit: 3,         // 3 attempts
    windowMs: 3600000 // per hour
  });

export const apiRateLimit = (handler: any) => 
  withRateLimit(handler, {
    limit: 60,       // 60 requests
    windowMs: 60000  // per minute
  });

export const uploadRateLimit = (handler: any) => 
  withRateLimit(handler, {
    limit: 5,         // 5 uploads
    windowMs: 3600000 // per hour
  });

