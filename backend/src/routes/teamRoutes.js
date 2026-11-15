import express from 'express';
import {
  createTeam, getMyTeams, getTeam, searchPlayers,
  sendInvitation, getMyInvitations, respondToInvitation,
  cancelInvitation, registerTeam, getTeamInvitations,
  getOpenTeams, sendJoinRequest, getJoinRequests,
  getMyJoinRequests, respondToJoinRequest, cancelJoinRequest,
} from '../controllers/teamController.js';
import { protect } from '../middleware/auth.js';

const router = express.Router();

router.use(protect);

// IMPORTANT: All specific/static routes must come BEFORE parameterized routes
// to prevent Express matching "invitations", "my", "players" as team IDs

router.get('/players/search', searchPlayers);
router.get('/my', getMyTeams);

// Invitation routes — MUST be before /:id
router.post('/invitations/send', sendInvitation);
router.get('/invitations/mine', getMyInvitations);
router.patch('/invitations/:id/respond', respondToInvitation);
router.patch('/invitations/:id/cancel', cancelInvitation);

// Join Request routes
router.post('/join-requests/send', sendJoinRequest);
router.get('/join-requests/mine', getMyJoinRequests);
router.patch('/join-requests/:id/respond', respondToJoinRequest);
router.patch('/join-requests/:id/cancel', cancelJoinRequest);

// Open teams for a tournament (recruiting / incomplete teams)
router.get('/open/:tournamentId', getOpenTeams);

// Team registration
router.post('/register', registerTeam);

// Parameterized routes — MUST come AFTER all static routes
router.post('/', createTeam);
router.get('/:id', getTeam);
router.get('/:teamId/invitations', getTeamInvitations);
router.get('/:teamId/join-requests', getJoinRequests);

export default router;
