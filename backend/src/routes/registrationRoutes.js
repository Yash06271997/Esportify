import express from 'express';
import { 
  registerForTournament, 
  getMyRegistrations, 
  getTournamentRegistrations, 
  updateRegistrationStatus, 
  cancelRegistration 
} from '../controllers/registrationController.js';
import { protect, organizer } from '../middleware/auth.js';

const router = express.Router();

router.get('/me', protect, getMyRegistrations);
router.post('/tournaments/:id/register', protect, registerForTournament);
router.get('/tournaments/:id/registrations', protect, organizer, getTournamentRegistrations);
router.patch('/:id/status', protect, organizer, updateRegistrationStatus);
router.delete('/:id', protect, cancelRegistration);

// Note: We use some aliases here that differ slightly from the router base path. 
// Typically router is mounted at /api/registrations. 
// So the ones for tournaments might be better placed in tournamentRoutes or handled here.
// Let's modify server.js to use this router as app.use('/api', registrationRoutes) or similar.
// For now, I will assume it's mounted at /api/registrations.

export default router;
