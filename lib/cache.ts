interface CacheEntry<T> {
  data: T;
  expiry: number;
}

class SimpleCache {
  private cache: Map<string, CacheEntry<any>>;
  private maxSize: number;

  constructor(maxSize = 1000) {
    this.cache = new Map();
    this.maxSize = maxSize;
  }

  set<T>(key: string, data: T, ttlSeconds = 300): void {
    if (this.cache.size >= this.maxSize) {
      const firstKey = this.cache.keys().next().value;
      if (firstKey) {
        this.cache.delete(firstKey);
      }
    }

    this.cache.set(key, {
      data,
      expiry: Date.now() + ttlSeconds * 1000,
    });
  }

  get<T>(key: string): T | null {
    const entry = this.cache.get(key);
    
    if (!entry) {
      return null;
    }

    if (Date.now() > entry.expiry) {
      this.cache.delete(key);
      return null;
    }

    return entry.data as T;
  }

  delete(key: string): void {
    this.cache.delete(key);
  }

  clear(): void {
    this.cache.clear();
  }

  cleanup(): void {
    const now = Date.now();
    for (const [key, entry] of this.cache.entries()) {
      if (now > entry.expiry) {
        this.cache.delete(key);
      }
    }
  }
}

export const cache = new SimpleCache();

setInterval(() => {
  cache.cleanup();
}, 60000);

export function getCacheKey(...parts: (string | number | undefined)[]): string {
  return parts.filter(Boolean).join(':');
}

