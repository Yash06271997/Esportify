import express from 'express';
import { 
  getPlatformStats, 
  getAllUsers, 
  updateUserStatus, 
  getAllTournaments, 
  getAllRegistrations 
} from '../controllers/adminController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.use(protect, admin);

router.get('/stats', getPlatformStats);
router.get('/users', getAllUsers);
router.patch('/users/:id/status', updateUserStatus);
router.get('/tournaments', getAllTournaments);
router.get('/registrations', getAllRegistrations);

export default router;
