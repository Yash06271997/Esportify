import mongoose from 'mongoose';

const matchSchema = mongoose.Schema(
  {
    tournament: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'Tournament',
    },
    round: { type: Number, required: true },       // 1 = Round 1, 2 = QF, etc.
    matchNumber: { type: Number, required: true }, // Position within the round
    teamA: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    teamB: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    scoreA: { type: Number, default: null },
    scoreB: { type: Number, default: null },
    winner: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Team',
      default: null,
    },
    scheduledAt: { type: Date, default: null },
    status: {
      type: String,
      enum: ['scheduled', 'ongoing', 'completed', 'bye'],
      default: 'scheduled',
    },
    // If this match feeds into a next match
    nextMatchId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'Match',
      default: null,
    },
    notes: { type: String },
  },
  { timestamps: true }
);

const Match = mongoose.model('Match', matchSchema);
export default Match;
