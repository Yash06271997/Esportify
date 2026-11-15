import mongoose from 'mongoose';

// Updated Registration model — teams now registered via Team document
const registrationSchema = mongoose.Schema(
  {
    // Team-based registration (new primary approach)
    team: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    // Legacy: individual user who submitted (also = team leader for new registrations)
    user: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Tournament',
    },
    teamName: { type: String },
    // Legacy manual player list (kept for backward compat)
    players: [
      {
        fullName: { type: String },
        contactNumber: { type: String },
        inGameName: { type: String },
      },
    ],
    status: {
      type: String,
      enum: ['pending', 'approved', 'rejected', 'waitlisted', 'cancelled', 'withdrawn'],
      default: 'pending',
    },
    rejectionReason: { type: String, default: null },
    registrationDate: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

// Prevent duplicate active registrations for same user+tournament
registrationSchema.index(
  { user: 1, tournament: 1 },
  {
    unique: true,
    partialFilterExpression: { status: { $nin: ['cancelled', 'withdrawn', 'rejected'] } },
  }
);

const Registration = mongoose.model('Registration', registrationSchema);
export default Registration;
