import mongoose from 'mongoose';

const tournamentSchema = mongoose.Schema(
  {
    organizer: {
      type: mongoose.Schema.Types.ObjectId,
      required: true,
      ref: 'User',
    },
    name:        { type: String, required: true },
    game:        { type: String, required: true },
    description: { type: String, required: true },
    bannerUrl:   { type: String },
    startDate:   { type: Date, required: true },
    endDate:     { type: Date },
    registrationDeadline: { type: Date, required: true },
    format:      { type: String, enum: ['online', 'offline'], required: true },
    venueDetails:{ type: String },
    prizePool:   { type: String },
    entryFee:    { type: String },
    rules:       { type: String },
    eligibility: { type: String },
    capacity:    { type: Number, required: true, min: 2 },

    // Team size per tournament (1=solo, 2=duo, 5=five-man squad etc.)
    teamSize: {
      type: Number,
      default: 5,
      min: 1,
      max: 10,
    },

    participationType: {
      type: String,
      enum: ['individual', 'team'],
      default: 'team',
    },
    status: {
      type: String,
      enum: ['upcoming', 'registration_open', 'registration_closed', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
  },
  { timestamps: true }
);

const Tournament = mongoose.model('Tournament', tournamentSchema);
export default Tournament;
