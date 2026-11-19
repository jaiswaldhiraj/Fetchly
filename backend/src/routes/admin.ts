import { Router } from 'express';
import { adminStats } from '../controllers/adminController';
import { requireAdminKey } from '../middleware/security';

const router = Router();

// GET /api/admin/stats
router.get('/stats', requireAdminKey, adminStats);

export default router;
