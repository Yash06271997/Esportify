import mongoose from 'mongoose';

// A player-initiated request to join an open (incomplete) team.
// Distinct from TeamInvitation (leader-initiated).
const joinRequestSchema = mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Team' },
    tournament: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tournament' },
    requester: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' },
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending requests for same team+requester
joinRequestSchema.index({ team: 1, requester: 1, status: 1 });

const JoinRequest = mongoose.model('JoinRequest', joinRequestSchema);
export default JoinRequest;
