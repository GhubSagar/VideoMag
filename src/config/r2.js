// // src/config/r2.js
import dotenv from 'dotenv';
import { S3Client } from '@aws-sdk/client-s3';
dotenv.config({ path: './src/.env' });
export const r2Client = new S3Client({
  region: 'auto',
  endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
  credentials: {
    accessKeyId: process.env.R2_ACCESS_KEY,
    secretAccessKey: process.env.R2_SECRET_KEY,
  },
});
