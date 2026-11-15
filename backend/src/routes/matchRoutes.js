import express from 'express';
import {
  generateBracket,
  getTournamentMatches,
  updateMatch,
  deleteBracket,
} from '../controllers/matchController.js';
import { protect, organizer } from '../middleware/auth.js';

const router = express.Router();

// Public — anyone can view bracket/matches
router.get('/tournaments/:id/matches', getTournamentMatches);

// Protected — organizer or admin
router.post('/tournaments/:id/bracket', protect, organizer, generateBracket);
router.delete('/tournaments/:id/bracket', protect, organizer, deleteBracket);
router.patch('/matches/:matchId', protect, organizer, updateMatch);

export default router;
