import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

const userSchema = mongoose.Schema(
  {
    name: { type: String, required: true, trim: true },
    username: {
      type: String,
      required: false,  // Optional — only required for participants, not organizers
      unique: true,
      sparse: true,     // sparse index allows multiple documents with no username
      trim: true,
      lowercase: true,
      minlength: 3,
    },
    playerId: {
      type: String,
      unique: true,
      sparse: true, // auto-assigned after creation
    },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true },
    contactNumber: { type: String, trim: true },
    inGameName: { type: String, trim: true },
    role: {
      type: String,
      enum: ['user', 'organizer', 'admin'],
      default: 'user',
    },
    status: {
      type: String,
      enum: ['active', 'suspended'],
      default: 'active',
    },
    // Notifications unread count (denormalized for quick badge)
    unreadNotifications: { type: Number, default: 0 },
  },
  { timestamps: true }
);

// Password hashing — Mongoose 8: async pre-save hooks do not need to call next()
userSchema.pre('save', async function () {
  if (!this.isModified('password')) return;
  const salt = await bcrypt.genSalt(10);
  this.password = await bcrypt.hash(this.password, salt);
});

userSchema.methods.matchPassword = async function (enteredPassword) {
  return await bcrypt.compare(enteredPassword, this.password);
};

const User = mongoose.model('User', userSchema);
export default User;
