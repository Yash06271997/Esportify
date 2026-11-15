import mongoose from 'mongoose';

const teamInvitationSchema = mongoose.Schema(
  {
    team: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Team' },
    tournament: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'Tournament' },
    sender: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Team Leader
    receiver: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User' }, // Invited player
    status: {
      type: String,
      enum: ['pending', 'accepted', 'rejected', 'cancelled'],
      default: 'pending',
    },
  },
  { timestamps: true }
);

// Prevent duplicate pending invitations for same team+receiver
teamInvitationSchema.index({ team: 1, receiver: 1, status: 1 });

const TeamInvitation = mongoose.model('TeamInvitation', teamInvitationSchema);
export default TeamInvitation;
