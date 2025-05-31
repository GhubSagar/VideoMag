// src/config/redis.js
import Redis from 'ioredis';
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });
export const redisConnection = new Redis(process.env.REDIS_URL, {
  maxRetriesPerRequest: null, // Required by BullMQ
});
