import { Router } from 'express';
import { analyze } from '../controllers/analyzeController';
import { validateUrl } from '../middleware/validateUrl';
import { apiRateLimiter } from '../middleware/rateLimiter';

const router = Router();

// POST /api/analyze
router.post('/', apiRateLimiter, validateUrl, analyze);

export default router;
