import express from 'express';
import { getTournamentAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement } from '../controllers/announcementController.js';
import { protect, organizer } from '../middleware/auth.js';

const router = express.Router({ mergeParams: true });

router.get('/tournaments/:id', getTournamentAnnouncements);
router.post('/tournaments/:id', protect, organizer, createAnnouncement);
router.patch('/:id', protect, organizer, updateAnnouncement);
router.delete('/:id', protect, organizer, deleteAnnouncement);

export default router;
