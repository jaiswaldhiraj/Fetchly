import { Router } from 'express';
import { download } from '../controllers/downloadController';
import { validateUrl } from '../middleware/validateUrl';
import { strictRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// GET /api/download (for direct browser/download manager links)
router.get('/', strictRateLimiter, validateUrl, download);

// POST /api/download
router.post('/', strictRateLimiter, validateUrl, download);

export default router;
