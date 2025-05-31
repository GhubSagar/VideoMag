import { 
  createProcessingJob,
  retrieveJobStatus 
} from '../services/videoServices.js';
import { Job } from '../models/jobModel.js';

export const enqueueVideoProcessing = async (req, res) => {
  try {
    const { sourceUrl, email } = req.body;
    //const result = await createProcessingJob(req.body.sourceUrl);
    const result = await createProcessingJob(sourceUrl, email);
    res.status(201).json(result);
  } catch (error) {
    res.status(400).json({ error: error.message });
  }
};

export const getJobStatus = async (req, res) => {
  try {
    const job = await retrieveJobStatus(req.params.id);
    res.json(job);
  } catch (error) {
    res.status(404).json({ error: error.message });
  }
};

export const getJobByToken = async (req, res) => {
  try {
    const job = await Job.findOne({ token: req.params.token });
    if (!job) return res.status(404).json({ error: 'Invalid token' });
    if (job.status !== 'completed') return res.status(202).json({ status: job.status });
    res.json({
      transcodedUrl: job.transcodedUrl,
      thumbnailUrl: job.thumbnailUrl,
      subtitleUrl: job.subtitleUrl,
      playlistUrl: job.playlistUrl,
    });
  } catch (error) {
    res.status(500).json({ error: error.message });
  }
};
