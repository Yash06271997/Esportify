import express from 'express';
import {
  getTournaments,
  getTournamentById,
  getMyTournaments,
  createTournament,
  updateTournament,
  deleteTournament,
} from '../controllers/tournamentController.js';
import { getOpenTeams } from '../controllers/teamController.js';
import { protect, organizer } from '../middleware/auth.js';

const router = express.Router();

// Public
router.get('/', getTournaments);

// Protected — organizer or admin sees their own tournaments
router.get('/my', protect, organizer, getMyTournaments);

// CRUD
router.post('/', protect, organizer, createTournament);
router.get('/:id', getTournamentById);
router.patch('/:id', protect, organizer, updateTournament);
router.delete('/:id', protect, organizer, deleteTournament);

// Public: open/recruiting teams for a tournament
router.get('/:id/open-teams', getOpenTeams);

export default router;
