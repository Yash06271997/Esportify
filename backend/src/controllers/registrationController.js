import Registration from '../models/Registration.js';
import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const notify = async (receiverId, type, message, extras = {}) => {
  await Notification.create({ receiver: receiverId, type, message, ...extras });
  await User.findByIdAndUpdate(receiverId, { $inc: { unreadNotifications: 1 } });
};

// Legacy manual registration (kept for backward compat / direct route)
export const registerForTournament = async (req, res, next) => {
  try {
    const tournamentId = req.params.id;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) { res.status(404); throw new Error('Tournament not found'); }

    if (new Date(tournament.registrationDeadline) < new Date()) {
      res.status(400); throw new Error('Registration deadline has passed');
    }

    const { teamName, players } = req.body;
    const reqSize = tournament.teamSize || 5;
    if (!teamName || !players || players.length !== reqSize) {
      res.status(400); throw new Error(`Team name and exactly ${reqSize} players are required`);
    }
    for (const p of players) {
      if (!p.fullName || !p.contactNumber || !p.inGameName) {
        res.status(400); throw new Error('All player fields (name, contact, IGN) are required');
      }
    }

    const registrationCount = await Registration.countDocuments({
      tournament: tournamentId, status: { $in: ['pending', 'approved'] },
    });
    if (registrationCount >= tournament.capacity) {
      res.status(400); throw new Error('Tournament is at full capacity');
    }

    const existingRegistration = await Registration.findOne({
      user: req.user._id, tournament: tournamentId,
      status: { $nin: ['cancelled', 'withdrawn', 'rejected'] },
    });
    if (existingRegistration) { res.status(400); throw new Error('You have already registered for this tournament'); }

    const registration = await Registration.create({
      user: req.user._id, tournament: tournamentId, teamName, players, status: 'pending',
    });
    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
};

export const getMyRegistrations = async (req, res, next) => {
  try {
    const registrations = await Registration.find({ user: req.user._id })
      .populate('tournament', 'name game status startDate')
      .populate('team', 'name members isComplete')
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

export const getTournamentRegistrations = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) { res.status(404); throw new Error('Tournament not found'); }

    if (tournament.organizer.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized to view these registrations');
    }

    const registrations = await Registration.find({ tournament: req.params.id })
      .populate('user', 'name email username playerId inGameName')
      .populate({
        path: 'team',
        populate: { path: 'members.user', select: 'name username playerId inGameName contactNumber' },
      })
      .sort({ createdAt: -1 });
    res.json(registrations);
  } catch (error) {
    next(error);
  }
};

export const updateRegistrationStatus = async (req, res, next) => {
  try {
    const { status, rejectionReason } = req.body;
    const registration = await Registration.findById(req.params.id)
      .populate('tournament')
      .populate('user', 'name');

    if (!registration) { res.status(404); throw new Error('Registration not found'); }

    if (
      registration.tournament.organizer.toString() !== req.user._id.toString() &&
      req.user.role !== 'admin'
    ) {
      res.status(403); throw new Error('Not authorized to update this registration');
    }

    const validStatuses = ['pending', 'approved', 'rejected', 'withdrawn', 'waitlisted'];
    if (!validStatuses.includes(status)) { res.status(400); throw new Error('Invalid status'); }

    registration.status = status;
    if (rejectionReason) registration.rejectionReason = rejectionReason;
    const updated = await registration.save();

    // Notify the team leader
    const notifType = status === 'approved' ? 'registration_approved'
      : status === 'rejected' ? 'registration_rejected'
      : 'registration_submitted';

    const msgMap = {
      approved: `Your team "${registration.teamName}" registration for ${registration.tournament.name} has been APPROVED! 🎉`,
      rejected: `Your team "${registration.teamName}" registration for ${registration.tournament.name} was rejected.${rejectionReason ? ` Reason: ${rejectionReason}` : ''}`,
      withdrawn: `Your team "${registration.teamName}" registration for ${registration.tournament.name} has been withdrawn.`,
    };
    if (msgMap[status]) {
      await notify(registration.user._id, notifType, msgMap[status], {
        relatedTournament: registration.tournament._id,
        relatedRegistration: registration._id,
      });
    }

    res.json(updated);
  } catch (error) {
    next(error);
  }
};

export const cancelRegistration = async (req, res, next) => {
  try {
    const registration = await Registration.findById(req.params.id);
    if (!registration) { res.status(404); throw new Error('Registration not found'); }

    if (registration.user.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized to cancel this registration');
    }

    registration.status = 'cancelled';
    await registration.save();

    // Unlink from team
    if (registration.team) {
      await Team.findByIdAndUpdate(registration.team, { registrationId: null });
    }

    res.json({ message: 'Registration cancelled successfully' });
  } catch (error) {
    next(error);
  }
};
