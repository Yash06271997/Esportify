import Schedule from '../models/Schedule.js';
import Tournament from '../models/Tournament.js';

export const getTournamentSchedule = async (req, res, next) => {
  try {
    const schedules = await Schedule.find({ tournament: req.params.id }).sort({ date: 1 });
    res.json(schedules);
  } catch (error) {
    next(error);
  }
};

export const createSchedule = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      res.status(404);
      throw new Error('Tournament not found');
    }

    if (tournament.organizer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to add schedule');
    }

    const { title, date, participants, location, status, results } = req.body;
    
    const schedule = await Schedule.create({
      tournament: req.params.id,
      title,
      date,
      participants,
      location,
      status: status || 'scheduled',
      results
    });

    res.status(201).json(schedule);
  } catch (error) {
    next(error);
  }
};

export const updateSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.scheduleId).populate('tournament');
    if (!schedule) {
      res.status(404);
      throw new Error('Schedule not found');
    }

    if (schedule.tournament.organizer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update schedule');
    }

    const updatedSchedule = await Schedule.findByIdAndUpdate(req.params.scheduleId, req.body, { new: true });
    res.json(updatedSchedule);
  } catch (error) {
    next(error);
  }
};

export const deleteSchedule = async (req, res, next) => {
  try {
    const schedule = await Schedule.findById(req.params.scheduleId).populate('tournament');
    if (!schedule) {
      res.status(404);
      throw new Error('Schedule not found');
    }

    if (schedule.tournament.organizer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete schedule');
    }

    await Schedule.findByIdAndDelete(req.params.scheduleId);
    res.json({ message: 'Schedule removed' });
  } catch (error) {
    next(error);
  }
};
