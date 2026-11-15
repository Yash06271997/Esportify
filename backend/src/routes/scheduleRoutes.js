import express from 'express';
import { getTournamentSchedule, createSchedule, updateSchedule, deleteSchedule } from '../controllers/scheduleController.js';
import { protect, organizer } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/tournaments/:id', getTournamentSchedule);
router.post('/tournaments/:id', protect, organizer, createSchedule);
router.patch('/:scheduleId', protect, organizer, updateSchedule);
router.delete('/:scheduleId', protect, organizer, deleteSchedule);

export default router;
