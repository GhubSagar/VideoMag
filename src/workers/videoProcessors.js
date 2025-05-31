// src/workers/videoProcessor.js
import dotenv from 'dotenv';
dotenv.config({ path: './src/.env' }); //  Load .env variables
import { connectToDatabase } from '../config/mongodb.js';
import { Worker } from 'bullmq';
import { Job } from '../models/jobModel.js';
import { redisConnection } from '../config/redis.js';
import { downloadVideo } from '../utils/downloadVideo.js';
import { transcodeVideo } from '../utils/transcode.js';
import { generateThumbnails } from '../utils/generateThumbnails.js';
import { generateSubtitles } from '../utils/generateSubtitles.js';
import { generateSegments } from '../utils/generateSegments.js';
import { uploadToR2 } from '../services/storageServices.js';
import fs from 'fs';
import path from 'path';
import nodemailer from 'nodemailer';


// Initialize MongoDB connection
await connectToDatabase();
const worker = new Worker('video-processing', async (job) => {
  const { sourceUrl } = job.data;
  // Update job status to "in-progress"
  await Job.findOneAndUpdate({ jobId: job.id }, { status: 'in-progress' });
  try {
    const jobRecord = await Job.findOne({ jobId: job.id });
    const token = jobRecord.token;
  // 1. Download video
  const inputPath = await downloadVideo(sourceUrl);
  console.log(`Downloaded video to: ${inputPath}`);
  // 2. Transcode video (example: 720p)
  const outputTranscode = `./temp/720p_${Date.now()}.mp4`;
  await transcodeVideo(inputPath, outputTranscode);

  // 3. Generate thumbnail
  const thumbnailFilename = `thumbnail_${Date.now()}.png`;
  if (!fs.existsSync('./temp')) fs.mkdirSync('./temp');
  const thumbnailPath = await generateThumbnails(inputPath, './temp', thumbnailFilename);

  
  // 4. Generate subtitles
  // First create temp directory
  const subtitleDir = path.join('./temp', `subtitles_${Date.now()}`);
  const subtitlePath = path.join(subtitleDir, 'subtitles.vtt');
  // Ensure base temp directory exists
if (!fs.existsSync('./temp')) {
  fs.mkdirSync('./temp', { recursive: true });
}
  await generateSubtitles(inputPath, subtitlePath);

  // 5. Generate segments
  const segmentDir = path.join('./temp', `segments_${Date.now()}`);
  const playlistPath = await generateSegments(inputPath, segmentDir);
  const segmentFiles = fs.readdirSync(segmentDir);
  await Promise.all(segmentFiles.map(file => 
    uploadToR2(path.join(segmentDir, file), process.env.R2_BUCKET, token)
  ));

  // 6. Upload processed files to R2
  // const transcodedUrl = await uploadToR2(outputTranscode, process.env.R2_BUCKET);
  // const thumbnailUrl = await uploadToR2(thumbnailPath, process.env.R2_BUCKET);
  // const subtitleUrl = await uploadToR2(subtitlePath, process.env.R2_BUCKET);
  // const playlistUrl = await uploadToR2(playlistPath, process.env.R2_BUCKET);

  const transcodedUrl = await uploadToR2(outputTranscode, process.env.R2_BUCKET, token);
  const thumbnailUrl = await uploadToR2(thumbnailPath, process.env.R2_BUCKET, token);
  const subtitleUrl = await uploadToR2(subtitlePath, process.env.R2_BUCKET, token);
  const playlistUrl = await uploadToR2(playlistPath, process.env.R2_BUCKET, token);

  // 7. Cleanup temporary files
  fs.unlinkSync(inputPath);
  fs.unlinkSync(outputTranscode);
  fs.unlinkSync(thumbnailPath);
  fs.unlinkSync(subtitlePath);
  fs.rmdirSync(subtitleDir, { recursive: true });
  fs.rmdirSync(segmentDir, { recursive: true });
   // Update job status to "completed" and save results
    await Job.findOneAndUpdate(
      { jobId: job.id },
      {
        status: 'completed',
        transcodedUrl,
        thumbnailUrl,
        subtitleUrl,
        playlistUrl,
      }
    );

    // After updating job status to "completed"
 // const jobRecord = await Job.findOne({ jobId: job.id });
  const transporter = nodemailer.createTransport({
  service: 'gmail', // or your email provider
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASS,
  },
});
await transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: jobRecord.email,
  subject: 'Your VideoMag files are ready!',
  text: `Your files are ready! Visit https://yourwebsite.com and enter your token: ${jobRecord.token}`,
});

//   return { transcodedUrl, thumbnailUrl,subtitleUrl, playlistUrl };
}catch (error) {
    // Update job status to "failed" and save error message
    await Job.findOneAndUpdate({ jobId: job.id }, { status: 'failed', error: error.message });
    throw error;
  }
}, { connection: redisConnection });

worker.on('completed', (job) => {
  console.log(`Job ${job.id} completed!`);
});

worker.on('failed', (job, err) => {
  console.error(`Job ${job.id} failed: ${err.message}`);
});

