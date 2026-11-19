import { Router } from 'express';
import { audio } from '../controllers/downloadController';
import { validateUrl } from '../middleware/validateUrl';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/audio (for direct browser/download manager links)
router.get('/', strictRateLimiter, validateUrl, audio);

// POST /api/audio
router.post('/', strictRateLimiter, validateUrl, audio);

export default router;
