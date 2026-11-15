import Announcement from '../models/Announcement.js';
import Tournament from '../models/Tournament.js';

export const getTournamentAnnouncements = async (req, res, next) => {
  try {
    const announcements = await Announcement.find({ tournament: req.params.id })
      .populate('organizer', 'name gamerTag')
      .sort({ createdAt: -1 });
    res.json(announcements);
  } catch (error) {
    next(error);
  }
};

export const createAnnouncement = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) {
      res.status(404);
      throw new Error('Tournament not found');
    }

    if (tournament.organizer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to add announcement');
    }

    const { title, message } = req.body;
    
    const announcement = await Announcement.create({
      tournament: req.params.id,
      organizer: req.user._id,
      title,
      message
    });

    res.status(201).json(announcement);
  } catch (error) {
    next(error);
  }
};

export const updateAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      res.status(404);
      throw new Error('Announcement not found');
    }

    if (announcement.organizer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to update announcement');
    }

    const updatedAnnouncement = await Announcement.findByIdAndUpdate(req.params.id, req.body, { new: true });
    res.json(updatedAnnouncement);
  } catch (error) {
    next(error);
  }
};

export const deleteAnnouncement = async (req, res, next) => {
  try {
    const announcement = await Announcement.findById(req.params.id);
    if (!announcement) {
      res.status(404);
      throw new Error('Announcement not found');
    }

    if (announcement.organizer.toString() !== req.user._id.toString()) {
      res.status(403);
      throw new Error('Not authorized to delete announcement');
    }

    await Announcement.findByIdAndDelete(req.params.id);
    res.json({ message: 'Announcement removed' });
  } catch (error) {
    next(error);
  }
};
