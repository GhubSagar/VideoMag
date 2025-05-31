// src/workers/videoQueue.js
import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';

export const videoQueue = new Queue('video-processing', {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
  },
});
