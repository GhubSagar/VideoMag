import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' });  //  Load .env variables
import { r2Client } from '../config/r2.js';  // Use renamed config
import { PutObjectCommand } from '@aws-sdk/client-s3';
import fs from 'fs';
import path from 'path';

// export const uploadToR2 = async (filePath, bucket = process.env.R2_BUCKET) => {
//   if (!bucket) {
//     throw new Error('R2_BUCKET environment variable is not set');
//   }
//   const fileContent = fs.readFileSync(filePath);
//   const key = `processed/${Date.now()}_${path.basename(filePath)}`;
//   //const key = `processed/${token}/${path.basename(filePath)}`;
//   const command = new PutObjectCommand({
//     Bucket: bucket,
//     Key: key,
//     Body: fileContent,
//     ACL: 'public-read',
//   });

//   await r2Client.send(command);
//   //return `https://${process.env.R2_BUCKET}.${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com/${key}`;
//   return `${process.env.R2_PUBLIC_URL}/${key}`;
// };

export const uploadToR2 = async (filePath, bucket = process.env.R2_BUCKET, token = '') => {
  if (!bucket) {
    throw new Error('R2_BUCKET environment variable is not set');
  }
  const fileContent = fs.readFileSync(filePath);
  const key = token
    ? `processed/${token}/${path.basename(filePath)}`
    : `processed/${Date.now()}_${path.basename(filePath)}`;

  const command = new PutObjectCommand({
    Bucket: bucket,
    Key: key,
    Body: fileContent,
    ACL: 'public-read',
  });

  await r2Client.send(command);
  return `${process.env.R2_PUBLIC_URL}/${key}`;
};