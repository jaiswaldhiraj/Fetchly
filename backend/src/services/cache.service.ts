import { getRedisClient } from '../config/redis';
import { config } from '../config';

// ─────────────────────────────────────────────────────────
//  Cache Service — Redis with graceful no-op fallback
// ─────────────────────────────────────────────────────────

export async function cacheGet<T>(key: string): Promise<T | null> {
  try {
    const client = await getRedisClient();
    if (!client) return null;

    const value = await client.get(key);
    if (!value) return null;

    return JSON.parse(value) as T;
  } catch {
    return null;
  }
}

export async function cacheSet(
  key: string,
  value: unknown,
  ttlSeconds: number = config.cacheTtl
): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;

    await client.setEx(key, ttlSeconds, JSON.stringify(value));
  } catch {
    // silently degrade
  }
}

export async function cacheDel(key: string): Promise<void> {
  try {
    const client = await getRedisClient();
    if (!client) return;
    await client.del(key);
  } catch {
    // silently degrade
  }
}

export function makeCacheKey(prefix: string, ...parts: string[]): string {
  return `fetchly:${prefix}:${parts.join(':')}`;
}
