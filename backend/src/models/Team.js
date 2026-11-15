import mongoose from 'mongoose';

const teamSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Tournament',
    },
    leader: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    members: [
      {
        user: { type: mongoose.Schema.Types.ObjectId, ref: 'User' },
        status: {
          type: String,
          enum: ['leader', 'accepted', 'pending', 'rejected'],
          default: 'pending',
        },
        joinedAt: { type: Date },
      },
    ],
    isComplete: { type: Boolean, default: false },
    registrationId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Registration',
      default: null,
    },
  },
  { timestamps: true }
);

// Prevent a leader from creating 2 teams for same tournament
teamSchema.index({ tournament: 1, leader: 1 }, { unique: true });

const Team = mongoose.model('Team', teamSchema);
export default Team;
