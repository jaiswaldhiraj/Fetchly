import { createClient, RedisClientType } from 'redis';
import { config } from './index';

let redisClient: RedisClientType | null = null;
let isConnected = false;
let isConnecting = false;
let lastConnectAttempt = 0;
const RETRY_COOLDOWN_MS = 60000; // 1 minute cooldown between reconnection attempts if Redis is offline

export async function getRedisClient(): Promise<RedisClientType | null> {
  if (redisClient && isConnected) return redisClient;
  if (isConnecting) return null;
  if (!isConnected && Date.now() - lastConnectAttempt < RETRY_COOLDOWN_MS) {
    return null;
  }

  isConnecting = true;
  lastConnectAttempt = Date.now();

  try {
    let errorLogged = false;
    const client = createClient({
      url: config.redisUrl,
      socket: {
        reconnectStrategy: (retries) => {
          if (retries >= 3) {
            if (!errorLogged) {
              console.warn('[Redis] Could not connect after 3 attempts — caching disabled.');
              errorLogged = true;
            }
            return false; // stop retrying
          }
          return 500; // wait 500ms between retries
        },
      },
    }) as RedisClientType;

    client.on('error', (err) => {
      if (!errorLogged) {
        console.warn('[Redis] Error:', err.message);
      }
      isConnected = false;
    });

    client.on('connect', () => {
      console.log('[Redis] Connected');
      isConnected = true;
    });

    client.on('disconnect', () => {
      console.warn('[Redis] Disconnected');
      isConnected = false;
    });

    await client.connect();
    redisClient = client;
    return client;
  } catch (err) {
    console.warn('[Redis] Could not connect — caching disabled:', (err as Error).message);
    return null;
  } finally {
    isConnecting = false;
  }
}

export async function disconnectRedis(): Promise<void> {
  if (redisClient && isConnected) {
    await redisClient.disconnect();
    redisClient = null;
    isConnected = false;
  }
}
