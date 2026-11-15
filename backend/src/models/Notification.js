import mongoose from 'mongoose';

const notificationSchema = mongoose.Schema(
  {
    receiver: { type: mongoose.Schema.Types.ObjectId, required: true, ref: 'User', index: true },
    type: {
      type: String,
      enum: [
        'invitation_received',
        'invitation_accepted',
        'invitation_rejected',
        'invitation_cancelled',
        'team_member_joined',
        'join_request_received',
        'join_request_accepted',
        'join_request_rejected',
        'team_full',
        'registration_submitted',
        'registration_approved',
        'registration_rejected',
        'match_result',
        'match_scheduled',
        'tournament_update',
      ],
      required: true,
    },
    message: { type: String, required: true },
    relatedTeam: { type: mongoose.Schema.Types.ObjectId, ref: 'Team', default: null },
    relatedTournament: { type: mongoose.Schema.Types.ObjectId, ref: 'Tournament', default: null },
    relatedRegistration: { type: mongoose.Schema.Types.ObjectId, ref: 'Registration', default: null },
    isRead: { type: Boolean, default: false },
  },
  { timestamps: true }
);

const Notification = mongoose.model('Notification', notificationSchema);
export default Notification;
