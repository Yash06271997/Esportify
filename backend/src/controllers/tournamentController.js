import Tournament from '../models/Tournament.js';
import Registration from '../models/Registration.js';

export const getTournaments = async (req, res, next) => {
  try {
    const filter = {};
    if (req.query.status) filter.status = req.query.status;
    if (req.query.game) filter.game = new RegExp(req.query.game, 'i');
    if (req.query.name) filter.name = new RegExp(req.query.name, 'i');

    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name email username')
      .sort({ startDate: 1 });

    // Attach active registration count to each tournament
    const withCounts = await Promise.all(
      tournaments.map(async (t) => {
        const activeRegistrations = await Registration.countDocuments({
          tournament: t._id,
          status: { $in: ['pending', 'approved'] },
        });
        const obj = t.toObject();
        obj.activeRegistrations = activeRegistrations;
        return obj;
      })
    );

    res.json(withCounts);
  } catch (error) {
    next(error);
  }
};

export const getTournamentById = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id)
      .populate('organizer', 'name email username');

    if (!tournament) {
      res.status(404);
      throw new Error('Tournament not found');
    }

    const activeRegistrations = await Registration.countDocuments({
      tournament: tournament._id,
      status: { $in: ['pending', 'approved'] },
    });

    const obj = tournament.toObject();
    obj.activeRegistrations = activeRegistrations;
    // Normalise teamSize: old documents without the field should default to 5
    if (obj.teamSize == null) obj.teamSize = 5;
    res.json(obj);
  } catch (error) {
    next(error);
  }
};

// Get tournaments created by the logged-in organizer / admin
export const getMyTournaments = async (req, res, next) => {
  try {
    const filter = req.user.role === 'admin'
      ? {}  // admin sees all
      : { organizer: req.user._id };

    const tournaments = await Tournament.find(filter)
      .populate('organizer', 'name email username')
      .sort({ createdAt: -1 });

    const withCounts = await Promise.all(
      tournaments.map(async (t) => {
        const activeRegistrations = await Registration.countDocuments({
          tournament: t._id,
          status: { $in: ['pending', 'approved'] },
        });
        const obj = t.toObject();
        obj.activeRegistrations = activeRegistrations;
        return obj;
      })
    );

    res.json(withCounts);
  } catch (error) {
    next(error);
  }
};

export const createTournament = async (req, res, next) => {
  try {
    const {
      name, game, description, bannerUrl, startDate, endDate,
      registrationDeadline, format, venueDetails, prizePool, entryFee,
      rules, eligibility, capacity, participationType, teamSize,
    } = req.body;

    if (!name || !game || !description || !startDate || !registrationDeadline || !capacity || !format) {
      res.status(400);
      throw new Error('Required fields: name, game, description, startDate, registrationDeadline, capacity, format');
    }

    // organizer is ALWAYS set from the authenticated user — never from req.body
    const tournament = await Tournament.create({
      organizer: req.user._id,
      name: name.trim(),
      game: game.trim(),
      description: description.trim(),
      bannerUrl,
      startDate,
      endDate,
      registrationDeadline,
      format,
      venueDetails,
      prizePool,
      entryFee,
      rules,
      eligibility,
      capacity: Number(capacity),
      participationType: participationType || 'team',
      teamSize: teamSize ? Number(teamSize) : 5,
      status: 'upcoming',
    });

    const populated = await Tournament.findById(tournament._id)
      .populate('organizer', 'name email username');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

export const updateTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      res.status(404);
      throw new Error('Tournament not found');
    }

    // Only the original organizer OR an admin can update
    const isOwner = tournament.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to update this tournament');
    }

    // NEVER allow the organizer field to be changed via an update — strip it
    const {
      organizer: _stripped, // discard silently
      name, game, description, bannerUrl, startDate, endDate,
      registrationDeadline, format, venueDetails, prizePool, entryFee,
      rules, eligibility, capacity, participationType, status, teamSize,
    } = req.body;

    if (name !== undefined) tournament.name = name;
    if (game !== undefined) tournament.game = game;
    if (description !== undefined) tournament.description = description;
    if (bannerUrl !== undefined) tournament.bannerUrl = bannerUrl;
    if (startDate !== undefined) tournament.startDate = startDate;
    if (endDate !== undefined) tournament.endDate = endDate;
    if (registrationDeadline !== undefined) tournament.registrationDeadline = registrationDeadline;
    if (format !== undefined) tournament.format = format;
    if (venueDetails !== undefined) tournament.venueDetails = venueDetails;
    if (prizePool !== undefined) tournament.prizePool = prizePool;
    if (entryFee !== undefined) tournament.entryFee = entryFee;
    if (rules !== undefined) tournament.rules = rules;
    if (eligibility !== undefined) tournament.eligibility = eligibility;
    if (capacity !== undefined) tournament.capacity = Number(capacity);
    if (participationType !== undefined) tournament.participationType = participationType;
    if (status !== undefined) tournament.status = status;
    if (teamSize !== undefined) tournament.teamSize = Number(teamSize);

    await tournament.save();
    const populated = await Tournament.findById(tournament._id)
      .populate('organizer', 'name email username');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

export const deleteTournament = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      res.status(404);
      throw new Error('Tournament not found');
    }

    const isOwner = tournament.organizer.toString() === req.user._id.toString();
    const isAdmin = req.user.role === 'admin';
    if (!isOwner && !isAdmin) {
      res.status(403);
      throw new Error('Not authorized to delete this tournament');
    }

    await Tournament.findByIdAndDelete(req.params.id);
    res.json({ message: 'Tournament removed' });
  } catch (error) {
    next(error);
  }
};
