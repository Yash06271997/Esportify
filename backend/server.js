import express from 'express';
import dotenv from 'dotenv';
import cors from 'cors';
import { connectDB } from './src/config/db.js';
import { errorHandler } from './src/middleware/error.js';

// Routes
import authRoutes from './src/routes/authRoutes.js';
import tournamentRoutes from './src/routes/tournamentRoutes.js';
import registrationRoutes from './src/routes/registrationRoutes.js';
import scheduleRoutes from './src/routes/scheduleRoutes.js';
import announcementRoutes from './src/routes/announcementRoutes.js';
import adminRoutes from './src/routes/adminRoutes.js';
import contactRoutes from './src/routes/contactRoutes.js';
import teamRoutes from './src/routes/teamRoutes.js';
import matchRoutes from './src/routes/matchRoutes.js';
import notificationRoutes from './src/routes/notificationRoutes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// ─── CORS ─────────────────────────────────────────────────────────────────────
// FRONTEND_URL is set in production (Render env var) to the Vercel deployment URL.
// Falls back to localhost for local development.
const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  process.env.FRONTEND_URL,
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    // Allow requests with no origin (e.g. curl, Render health checks, same-origin)
    if (!origin) return callback(null, true);
    if (allowedOrigins.some(o => origin.startsWith(o))) return callback(null, true);
    callback(new Error(`CORS: origin ${origin} not allowed`));
  },
  credentials: true,
}));

app.use(express.json());

connectDB();

app.use('/api/auth', authRoutes);
app.use('/api/tournaments', tournamentRoutes);
app.use('/api/registrations', registrationRoutes);
app.use('/api/schedule', scheduleRoutes);
app.use('/api/announcements', announcementRoutes);
app.use('/api/admin', adminRoutes);
app.use('/api/contact', contactRoutes);
app.use('/api/teams', teamRoutes);
app.use('/api/matches', matchRoutes);
app.use('/api/notifications', notificationRoutes);

app.get('/', (req, res) => res.send('Esportify API is running...'));

app.use(errorHandler);

app.listen(PORT, () => console.log(`Esportify server running on port ${PORT}`));
