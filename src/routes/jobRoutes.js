// // src/routes/jobRoutes.js
import express from 'express';
import {
  enqueueVideoProcessing,
  getJobStatus,
  getJobByToken,
} from '../controller/videoController.js';

const router = express.Router();

// POST /jobs - enqueue new job (uses controller)
router.post('/', enqueueVideoProcessing);

// GET /jobs/:id - get job status (uses controller)
router.get('/:id', getJobStatus);

// GET /jobs/token/:token - get job by token (uses controller)
router.get('/token/:token', getJobByToken);

export { router };
