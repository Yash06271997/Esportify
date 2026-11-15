import React, { useContext, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { User, CheckCircle, AlertCircle, Lock, Gamepad2, Phone, Mail, Shield, AtSign } from 'lucide-react';

const Profile = () => {
  const { user, setUser } = useContext(AuthContext);

  const [form, setForm] = useState({
    name:          user?.name          || '',
    inGameName:    user?.inGameName    || '',
    contactNumber: user?.contactNumber || '',
    newPassword:   '',
  });
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(null);
  const [error, setError]     = useState(null);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => ({ ...p, [name]: value }));
    setSuccess(null); setError(null);
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true); setSuccess(null); setError(null);
    const payload = { name: form.name, inGameName: form.inGameName, contactNumber: form.contactNumber };
    if (form.newPassword.trim()) payload.password = form.newPassword.trim();
    try {
      const { data } = await api.patch('/auth/me', payload);
      const updated = { ...user, ...data };
      if (typeof setUser === 'function') setUser(updated);
      localStorage.setItem('userInfo', JSON.stringify(updated));
      setSuccess('Profile updated successfully!');
      setForm(p => ({ ...p, newPassword: '' }));
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update profile.');
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <div className="border-b border-cyber-border pb-5">
        <p className="pixel-heading text-cyber-purple text-xs mb-2">SETTINGS</p>
        <h1 className="text-3xl font-black text-cyber-text flex items-center gap-3">
          <User className="w-7 h-7 text-cyber-purple" /> My Profile
        </h1>
      </div>

      {/* Player ID Card */}
      {user?.playerId && (
        <div className="cyber-card-purple p-5 flex items-center gap-4">
          <div className="bg-cyber-purple/20 border border-cyber-purple/50 p-3">
            <Shield className="w-6 h-6 text-cyber-purple" />
          </div>
          <div>
            <p className="text-xs text-cyber-muted uppercase tracking-widest">Your Player ID</p>
            <p className="pixel-heading text-cyber-purple text-sm mt-0.5">{user.playerId}</p>
            <p className="text-xs text-cyber-muted mt-0.5">Share this to receive team invitations</p>
          </div>
        </div>
      )}

      {success && (
        <div className="cyber-card border-cyber-green/50 p-4 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-cyber-green shrink-0" />
          <p className="text-sm text-cyber-green">{success}</p>
        </div>
      )}
      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      <div className="cyber-card overflow-hidden">
        <div className="px-6 py-4 border-b border-cyber-border bg-cyber-surface">
          <h2 className="font-black text-cyber-text text-sm uppercase tracking-widest">Account Information</h2>
        </div>
        <form onSubmit={handleSubmit} className="p-6 space-y-5">
          {/* Read-only fields */}
          <div className="grid sm:grid-cols-2 gap-4">
            <div>
              <label className="cyber-label flex items-center gap-1.5"><Mail className="w-3.5 h-3.5" /> Email</label>
              <input type="email" value={user?.email || ''} readOnly
                className="cyber-input bg-cyber-surface/50 cursor-not-allowed opacity-60" />
              <p className="text-xs text-cyber-muted mt-1">Cannot be changed</p>
            </div>
            <div>
              <label className="cyber-label flex items-center gap-1.5"><AtSign className="w-3.5 h-3.5" /> Username</label>
              <input type="text" value={user?.username || ''} readOnly
                className="cyber-input bg-cyber-surface/50 cursor-not-allowed opacity-60" />
              <p className="text-xs text-cyber-muted mt-1">Cannot be changed</p>
            </div>
          </div>

          {/* Editable fields */}
          <div>
            <label className="cyber-label flex items-center gap-1.5"><User className="w-3.5 h-3.5" /> Full Name</label>
            <input type="text" name="name" value={form.name} onChange={handleChange}
              className="cyber-input" placeholder="Your full name" />
          </div>
          <div>
            <label className="cyber-label flex items-center gap-1.5"><Gamepad2 className="w-3.5 h-3.5" /> In-Game Name (IGN)</label>
            <input type="text" name="inGameName" value={form.inGameName} onChange={handleChange}
              className="cyber-input" placeholder="Your gaming alias" />
          </div>
          <div>
            <label className="cyber-label flex items-center gap-1.5"><Phone className="w-3.5 h-3.5" /> Contact Number</label>
            <input type="tel" name="contactNumber" value={form.contactNumber} onChange={handleChange}
              className="cyber-input" placeholder="+91 9876543210" />
          </div>

          <div className="border-t border-cyber-border pt-5">
            <p className="text-xs text-cyber-muted uppercase tracking-widest mb-3 flex items-center gap-1.5">
              <Lock className="w-3.5 h-3.5" /> Change Password (optional)
            </p>
            <input type="password" name="newPassword" value={form.newPassword} onChange={handleChange}
              className="cyber-input" placeholder="Leave blank to keep current password"
              autoComplete="new-password" />
          </div>

          <button type="submit" disabled={loading} className="cyber-btn-primary w-full py-3 text-sm">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Saving...</>
              : 'Save Changes'}
          </button>
        </form>
      </div>

      {/* Meta */}
      <div className="cyber-card p-5">
        <p className="text-xs text-cyber-muted uppercase tracking-widest mb-2">Account Role</p>
        <span className={`cyber-badge ${
          user?.role === 'admin' ? 'cyber-badge-red' :
          user?.role === 'organizer' ? 'cyber-badge-cyan' : 'cyber-badge-purple'
        }`}>
          {user?.role || 'user'}
        </span>
      </div>
    </div>
  );
};

export default Profile;
