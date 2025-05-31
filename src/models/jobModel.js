import mongoose from 'mongoose';

const jobSchema = new mongoose.Schema(
  {
    jobId: { type: String, required: true, unique: true },
    sourceUrl: { type: String, required: true },
    status: { type: String, enum: ['pending', 'in-progress', 'completed', 'failed'], default: 'pending' },
    transcodedUrl: { type: String },
    thumbnailUrl: { type: String },
    subtitleUrl: { type: String },
    playlistUrl: { type: String },
    error: { type: String },
    token: { type: String, required: true, unique: true }, // <-- Add this
    email: { type: String, required: true }, // <-- Add this
  },
  { timestamps: true }
);

export const Job = mongoose.model('Job', jobSchema);
