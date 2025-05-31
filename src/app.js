// src/app.js
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });
import express from 'express';
import { router as jobRoutes } from './routes/jobRoutes.js';
import { errorHandler } from './utils/errorHandler.js';
import rateLimit from 'express-rate-limit';
import cors from 'cors';

const app = express();
app.use(cors({
    origin: process.env.FRONTEND_ORIGIN
  }));
app.use(express.json());
app.use('/jobs', rateLimit({ windowMs: 15*60*1000, max: 60}));
app.use('/jobs', jobRoutes);
app.use(errorHandler);

export { app };
