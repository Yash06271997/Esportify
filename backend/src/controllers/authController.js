import User from '../models/User.js';
import jwt from 'jsonwebtoken';

const generateToken = (id) => jwt.sign({ id }, process.env.JWT_SECRET, { expiresIn: '30d' });

/** Generate next Player ID like ESP-10001 */
const generatePlayerId = async () => {
  const last = await User.findOne({ playerId: { $exists: true, $ne: null } })
    .sort({ playerId: -1 })
    .lean();
  if (!last || !last.playerId) return 'ESP-10001';
  const num = parseInt(last.playerId.split('-')[1], 10);
  return `ESP-${num + 1}`;
};

export const registerUser = async (req, res, next) => {
  try {
    const { name, username, email, password, role, inGameName, contactNumber } = req.body;

    const safeRole = ['user', 'organizer'].includes(role) ? role : 'user';
    const isParticipant = safeRole === 'user';

    // Common required fields
    if (!name || !email || !password) {
      res.status(400);
      throw new Error('Name, email and password are required');
    }

    // Participant-only required fields
    if (isParticipant && !username) {
      res.status(400);
      throw new Error('Username is required for participants');
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      res.status(400);
      throw new Error('Please enter a valid email address');
    }

    if (password.length < 6) {
      res.status(400);
      throw new Error('Password must be at least 6 characters');
    }

    // Check email and (for participants) username uniqueness
    const checks = [User.findOne({ email: email.toLowerCase().trim() })];
    if (isParticipant && username) {
      checks.push(User.findOne({ username: username.toLowerCase().trim() }));
    }
    const [emailExists, usernameExists] = await Promise.all(checks);

    if (emailExists) { res.status(400); throw new Error('An account with this email already exists'); }
    if (isParticipant && usernameExists) { res.status(400); throw new Error('This username is already taken'); }

    // Generate Player ID only for participants
    let playerId = null;
    if (isParticipant) {
      playerId = await generatePlayerId();
    }

    const userData = {
      name: name.trim(),
      email: email.toLowerCase().trim(),
      password,
      role: safeRole,
      contactNumber,
      playerId,
    };

    // Only set username and inGameName for participants
    if (isParticipant) {
      userData.username = username.toLowerCase().trim();
      if (inGameName) userData.inGameName = inGameName;
    }

    const user = await User.create(userData);

    res.status(201).json({
      _id: user._id,
      name: user.name,
      username: user.username,
      email: user.email,
      role: user.role,
      playerId: user.playerId,
      inGameName: user.inGameName,
      contactNumber: user.contactNumber,
      token: generateToken(user._id),
    });
  } catch (error) {
    next(error);
  }
};

export const loginUser = async (req, res, next) => {
  try {
    const { email, password } = req.body;
    // Support login by email OR by username
    const identifier = email?.toLowerCase()?.trim();
    const user = await User.findOne({
      $or: [{ email: identifier }, { username: identifier }],
    });

    if (user && (await user.matchPassword(password))) {
      if (user.status === 'suspended') {
        res.status(403);
        throw new Error('Your account has been suspended. Please contact support.');
      }
      res.json({
        _id: user._id,
        name: user.name,
        username: user.username,
        email: user.email,
        role: user.role,
        playerId: user.playerId,
        inGameName: user.inGameName,
        contactNumber: user.contactNumber,
        unreadNotifications: user.unreadNotifications,
        token: generateToken(user._id),
      });
    } else {
      res.status(401);
      throw new Error('Invalid email or password');
    }
  } catch (error) {
    next(error);
  }
};

export const getMe = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id).select('-password');
    res.json(user);
  } catch (error) {
    next(error);
  }
};

export const updateProfile = async (req, res, next) => {
  try {
    const user = await User.findById(req.user._id);
    if (!user) { res.status(404); throw new Error('User not found'); }

    user.name = req.body.name || user.name;
    user.inGameName = req.body.inGameName !== undefined ? req.body.inGameName : user.inGameName;
    user.contactNumber = req.body.contactNumber !== undefined ? req.body.contactNumber : user.contactNumber;

    if (req.body.password) {
      if (req.body.password.length < 6) { res.status(400); throw new Error('Password must be at least 6 characters'); }
      user.password = req.body.password;
    }

    const updatedUser = await user.save();
    res.json({
      _id: updatedUser._id,
      name: updatedUser.name,
      username: updatedUser.username,
      email: updatedUser.email,
      role: updatedUser.role,
      playerId: updatedUser.playerId,
      inGameName: updatedUser.inGameName,
      contactNumber: updatedUser.contactNumber,
      token: generateToken(updatedUser._id),
    });
  } catch (error) {
    next(error);
  }
};
