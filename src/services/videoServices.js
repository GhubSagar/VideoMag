import { nanoid } from 'nanoid';
import { videoQueue } from '../workers/videoQueue.js';
import { Job } from '../models/jobModel.js';
import nodemailer from 'nodemailer';

export const createProcessingJob = async (sourceUrl,email) => {
  if (!sourceUrl || !email) throw new Error('VideoUrl and Email are required are required');
  const token = nanoid(10);
  const job = await videoQueue.add('process-video', { sourceUrl });
  await Job.create({ 
    jobId: job.id, 
    sourceUrl, 
    status: 'pending' ,
    token,
    email
  });

  // Send notification to developer
  const transporter = nodemailer.createTransport({
    service: 'gmail', // or your email provider
    auth: {
      user: process.env.EMAIL_USER,
      pass: process.env.EMAIL_PASS,
    },
  });

  // await transporter.sendMail({
  //   from: process.env.EMAIL_USER,
  //   to: process.env.DEV_EMAIL, // Add DEV_EMAIL to your .env
  //   subject: 'New VideoMag Job Request',
  //   text: `A new job has been created.\n\nJob ID: ${job.id}\nToken: ${token}\nUser Email: ${email}\nSource URL: ${sourceUrl}`,
  // });

  // Send notification to developer (async, don't await)
transporter.sendMail({
  from: process.env.EMAIL_USER,
  to: process.env.EMAIL_USER,
  subject: 'New VideoMag Job Request',
  text: `A new job has been created.\n\nJob ID: ${job.id}\nToken: ${token}\nUser Email: ${email}\nSource URL: ${sourceUrl}`,
}).catch(err => {
  console.error('Developer notification email failed:', err);
});
  
  return {
    token,
    jobId: job.id,
    statusUrl: `/jobs/${job.id}`
  };
};

export const retrieveJobStatus = async (jobId) => {
  const job = await Job.findOne({ jobId });
  if (!job) throw new Error('Job not found');
  return job;
};
