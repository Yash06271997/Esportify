import express from 'express';
import { getMyNotifications, markAllRead, markOneRead } from '../controllers/notificationController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);
router.get('/', getMyNotifications);
router.patch('/read-all', markAllRead);
router.patch('/:id/read', markOneRead);

export default router;
