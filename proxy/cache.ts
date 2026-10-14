interface CacheEntry {
  value: unknown;
  expiresAt: number;
}

const store = new Map<string, CacheEntry>();
// Track in-flight requests to deduplicate simultaneous calls for the same key
const inflight = new Map<string, Promise<unknown>>();

export function getCache<T>(key: string): T | null {
  const entry = store.get(key);
  if (!entry) return null;
  if (Date.now() > entry.expiresAt) {
    store.delete(key);
    return null;
  }
  return entry.value as T;
}

export function setCache(key: string, value: unknown, ttlSeconds: number): void {
  store.set(key, { value, expiresAt: Date.now() + ttlSeconds * 1000 });
}

export async function dedupe<T>(key: string, fn: () => Promise<T>): Promise<T> {
  const cached = getCache<T>(key);
  if (cached !== null) return cached;

  if (inflight.has(key)) {
    return inflight.get(key) as Promise<T>;
  }

  const promise = fn().finally(() => inflight.delete(key));
  inflight.set(key, promise);
  return promise;
}
