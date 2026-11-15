import express from 'express';
import { submitContact, getContactMessages } from '../controllers/contactController.js';
import { protect, admin } from '../middleware/auth.js';

const router = express.Router();

router.post('/', submitContact);
router.get('/', protect, admin, getContactMessages);

export default router;
