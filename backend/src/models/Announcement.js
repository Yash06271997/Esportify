import mongoose from 'mongoose';

const announcementSchema = mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Tournament',
    },
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
  },
  { timestamps: true }
);

const Announcement = mongoose.model('Announcement', announcementSchema);
export default Announcement;
