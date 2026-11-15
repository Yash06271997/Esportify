/**
 * Admin Bootstrap Script - Run ONCE to create the initial admin account.
 * Usage: node scripts/createAdmin.js
 *
 * Set ADMIN_NAME, ADMIN_EMAIL, ADMIN_PASSWORD in backend/.env before running.
 * After running, remove or comment out those env vars for security.
 */

import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import { dirname, join } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

dotenv.config({ path: join(__dirname, '../.env') });

const userSchema = new mongoose.Schema({
  name: String,
  username: { type: String, unique: true },
  email: { type: String, unique: true },
  password: String,
  role: { type: String, enum: ['user', 'organizer', 'admin'], default: 'user' },
  status: { type: String, default: 'active' },
  contactNumber: String,
}, { timestamps: true });

const User = mongoose.model('User', userSchema);

async function createAdmin() {
  try {
    await mongoose.connect(process.env.MONGO_URI);
    console.log('Connected to MongoDB');

    const adminEmail = process.env.ADMIN_EMAIL;
    const adminName = process.env.ADMIN_NAME || 'Platform Admin';
    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminEmail || !adminPassword) {
      console.error('ERROR: ADMIN_EMAIL and ADMIN_PASSWORD must be set in .env');
      process.exit(1);
    }

    // Derive username from email (before the @)
    const adminUsername = (process.env.ADMIN_USERNAME || adminEmail.split('@')[0])
      .toLowerCase()
      .replace(/[^a-z0-9_]/g, '_')
      .substring(0, 20);

    const existing = await User.findOne({ email: adminEmail.toLowerCase() });
    if (existing) {
      if (existing.role === 'admin') {
        console.log(`Admin with email ${adminEmail} already exists. Skipping.`);
      } else {
        // Upgrade existing user to admin
        existing.role = 'admin';
        await existing.save();
        console.log(`Upgraded user ${adminEmail} to admin role.`);
      }
      await mongoose.disconnect();
      return;
    }

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(adminPassword, salt);

    await User.create({
      name: adminName,
      username: adminUsername,
      email: adminEmail.toLowerCase(),
      password: hashedPassword,
      role: 'admin',
      status: 'active',
    });

    console.log(`✅ Admin account created: ${adminEmail} (username: ${adminUsername})`);
    console.log('IMPORTANT: Remove ADMIN_EMAIL and ADMIN_PASSWORD from .env after setup.');
    await mongoose.disconnect();
  } catch (err) {
    console.error('Error creating admin:', err.message);
    process.exit(1);
  }
}

createAdmin();
