import mongoose from 'mongoose';

const scheduleSchema = mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Tournament',
    },
    title: { type: String, required: true },
    date: { type: Date, required: true },
    participants: { type: String }, // Optional text field for who is playing
    location: { type: String },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'cancelled'],
      default: 'scheduled',
    },
    results: { type: String },
  },
  { timestamps: true }
);

const Schedule = mongoose.model('Schedule', scheduleSchema);
export default Schedule;
