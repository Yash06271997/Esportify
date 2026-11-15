import Notification from '../models/Notification.js';
import User from '../models/User.js';

export const getMyNotifications = async (req, res, next) => {
  try {
    const notifications = await Notification.find({ receiver: req.user._id })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();
    res.json(notifications);
  } catch (error) {
    next(error);
  }
};

export const markAllRead = async (req, res, next) => {
  try {
    await Notification.updateMany({ receiver: req.user._id, isRead: false }, { isRead: true });
    await User.findByIdAndUpdate(req.user._id, { unreadNotifications: 0 });
    res.json({ message: 'All notifications marked as read' });
  } catch (error) {
    next(error);
  }
};

export const markOneRead = async (req, res, next) => {
  try {
    const notification = await Notification.findById(req.params.id);
    if (!notification || notification.receiver.toString() !== req.user._id.toString()) {
      res.status(404); throw new Error('Notification not found');
    }
    if (!notification.isRead) {
      notification.isRead = true;
      await notification.save();
      await User.findByIdAndUpdate(req.user._id, { $inc: { unreadNotifications: -1 } });
    }
    res.json(notification);
  } catch (error) {
    next(error);
  }
};
