import User from '../models/User.js';
import Tournament from '../models/Tournament.js';
import Registration from '../models/Registration.js';

export const getPlatformStats = async (req, res, next) => {
  try {
    const totalUsers = await User.countDocuments();
    const totalParticipants = await User.countDocuments({ role: 'user' });
    const totalOrganizers = await User.countDocuments({ role: 'organizer' });
    
    const tournaments = await Tournament.find();
    const upcomingTournaments = tournaments.filter(t => t.status === 'upcoming').length;
    const ongoingTournaments = tournaments.filter(t => t.status === 'ongoing').length;
    const completedTournaments = tournaments.filter(t => t.status === 'completed').length;
    
    const registrations = await Registration.find();
    const pendingRegistrations = registrations.filter(r => r.status === 'pending').length;
    const rejectedOrWithdrawn = registrations.filter(r => ['rejected', 'withdrawn', 'cancelled'].includes(r.status)).length;
    
    res.json({
      totalUsers,
      totalParticipants,
      totalOrganizers,
      totalTournaments: tournaments.length,
      upcomingTournaments,
      ongoingTournaments,
      completedTournaments,
      totalRegistrations: registrations.length,
      pendingRegistrations,
      rejectedOrWithdrawn,
    });
  } catch (error) {
    next(error);
  }
};

export const getAllUsers = async (req, res, next) => {
  try {
    const users = await User.find().select('-password');
    res.json(users);
  } catch (error) {
    next(error);
  }
};

export const updateUserStatus = async (req, res, next) => {
  try {
    const user = await User.findById(req.params.id);
    if (!user) {
      res.status(404);
      throw new Error('User not found');
    }
    // Prevent admin from suspending themselves
    if (user._id.toString() === req.user._id.toString()) {
      res.status(400);
      throw new Error('Cannot change your own status');
    }
    
    user.status = req.body.status || user.status;
    const updatedUser = await user.save();
    res.json(updatedUser);
  } catch (error) {
    next(error);
  }
};

export const getAllTournaments = async (req, res, next) => {
  try {
    const tournaments = await Tournament.find().populate('organizer', 'name email');
    res.json(tournaments);
  } catch (error) {
    next(error);
  }
};

export const getAllRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find()
      .populate('user', 'name email username playerId')
      .populate('tournament', 'name game')
      .populate({
        path: 'team',
        select: 'name members',
        populate: { path: 'members.user', select: 'name username playerId inGameName' },
      })
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};
