import { Router } from 'express';
import { history, deleteHistory, clearAllHistory } from '../controllers/historyController';

const router = Router();

// GET /api/history
router.get('/', history);

// DELETE /api/history/:id
router.delete('/:id', deleteHistory);

// DELETE /api/history
router.delete('/', clearAllHistory);

export default router;
