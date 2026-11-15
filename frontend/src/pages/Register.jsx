import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, AlertCircle, CheckCircle, User, Briefcase } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

// ── Defined OUTSIDE Register so it never gets recreated on re-render ──────────
const Field = ({ name, label, type = 'text', placeholder, required, form, errors, onChange }) => (
  <div>
    <label className="cyber-label">{label}{required && ' *'}</label>
    <input
      type={type}
      name={name}
      value={form[name]}
      onChange={onChange}
      className={`cyber-input ${errors[name] ? 'border-red-400 focus:border-red-500 focus:ring-red-200' : ''}`}
      placeholder={placeholder}
    />
    {errors[name] && <p className="text-xs text-red-600 mt-1">{errors[name]}</p>}
  </div>
);

const Register = () => {
  const [form, setForm] = useState({
    name: '', username: '', email: '', contactNumber: '', inGameName: '',
    password: '', confirmPassword: '', role: 'user',
  });
  const [errors, setErrors]     = useState({});
  const [showPw, setShowPw]     = useState(false);
  const [apiError, setApiError] = useState(null);
  const [loading, setLoading]   = useState(false);
  const { register } = useContext(AuthContext);
  const navigate = useNavigate();

  const isParticipant = form.role === 'user';

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(f => ({ ...f, [name]: value }));
    if (errors[name]) setErrors(p => { const e = { ...p }; delete e[name]; return e; });
  };

  // When switching roles, clear fields that are participant-only
  const handleRoleChange = (e) => {
    const newRole = e.target.value;
    setForm(f => ({
      ...f,
      role: newRole,
      // Clear participant-only fields when switching to organizer
      ...(newRole === 'organizer' ? { username: '', inGameName: '' } : {}),
    }));
    // Clear any validation errors for those fields
    setErrors(prev => {
      const next = { ...prev };
      if (newRole === 'organizer') {
        delete next.username;
        delete next.inGameName;
      }
      return next;
    });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Full name is required';

    // Username — required only for participants
    if (isParticipant) {
      if (!form.username.trim())             e.username = 'Username is required';
      else if (form.username.length < 3)     e.username = 'Username must be at least 3 characters';
      else if (!/^[a-z0-9_]+$/i.test(form.username)) e.username = 'Only letters, numbers and underscores';
    }

    if (!form.email.trim())    e.email = 'Email is required';
    else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) e.email = 'Invalid email address';

    if (!form.password)        e.password = 'Password is required';
    else if (form.password.length < 6) e.password = 'Minimum 6 characters';

    if (form.password !== form.confirmPassword) e.confirmPassword = 'Passwords do not match';

    if (form.contactNumber && !/^[+]?[\d\s\-]{7,15}$/.test(form.contactNumber))
      e.contactNumber = 'Invalid contact number';

    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;
    setLoading(true);
    try {
      // Build payload — omit username/inGameName for organizers
      const { confirmPassword, username, inGameName, ...base } = form;
      const data = isParticipant
        ? { ...base, username: username.trim(), inGameName: inGameName.trim() || undefined }
        : base;

      const userData = await register(data);
      navigate(userData.role === 'organizer' ? '/organizer' : '/dashboard');
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="py-8 flex items-center justify-center">
      <div className="w-full max-w-lg">
        <div className="cyber-card overflow-visible">
          {/* Top accent */}
          <div className="h-1.5 bg-gradient-to-r from-violet-600 via-sky-500 to-violet-600 rounded-t-xl" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 border-b border-slate-100 text-center">
            <Link to="/" className="inline-flex items-center gap-2 mb-4 group">
              <div className="bg-violet-700 p-1.5 rounded-lg shadow-sm group-hover:bg-violet-800 transition-colors">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="pixel-heading text-[11px] text-violet-700">Esportify</span>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Join Esportify</h1>
            <p className="text-slate-500 text-sm">Create your competitive gaming account</p>
          </div>

          <div className="px-8 py-7">
            {apiError && (
              <div className="alert-error mb-5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{apiError}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-4">

              {/* ── Account Type ── */}
              <div>
                <label className="cyber-label">Account Type *</label>
                <div className="grid grid-cols-2 gap-3">
                  {[
                    { value: 'user',      label: 'Participant', icon: User,      desc: 'Join teams & compete',    color: 'violet' },
                    { value: 'organizer', label: 'Organizer',   icon: Briefcase, desc: 'Create & manage events', color: 'sky' },
                  ].map(({ value, label, icon: Icon, desc, color }) => (
                    <label
                      key={value}
                      className={`cursor-pointer border-2 rounded-xl p-4 transition-all ${
                        form.role === value
                          ? color === 'violet'
                            ? 'border-violet-500 bg-violet-50'
                            : 'border-sky-500 bg-sky-50'
                          : 'border-slate-200 hover:border-slate-300 bg-white'
                      }`}
                    >
                      <input
                        type="radio"
                        name="role"
                        value={value}
                        checked={form.role === value}
                        onChange={handleRoleChange}
                        className="sr-only"
                      />
                      <div className="flex items-center gap-2 mb-1">
                        <Icon className={`w-4 h-4 ${
                          form.role === value
                            ? color === 'violet' ? 'text-violet-600' : 'text-sky-600'
                            : 'text-slate-400'
                        }`} />
                        <span className={`text-sm font-bold ${
                          form.role === value ? 'text-slate-900' : 'text-slate-500'
                        }`}>{label}</span>
                      </div>
                      <p className="text-xs text-slate-500">{desc}</p>
                    </label>
                  ))}
                </div>

                {/* Role-specific hint */}
                {isParticipant ? (
                  <p className="text-xs text-violet-600 mt-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3" />
                    You'll receive a unique Player ID (ESP-XXXXX) on signup
                  </p>
                ) : (
                  <p className="text-xs text-sky-600 mt-2 flex items-center gap-1.5">
                    <CheckCircle className="w-3 h-3" />
                    Organizers can create and manage tournaments
                  </p>
                )}
              </div>

              {/* ── Full Name (always shown) ── */}
              <Field
                name="name"
                label="Full Name"
                placeholder={isParticipant ? 'John Doe' : 'Your Name or Organisation'}
                required
                form={form}
                errors={errors}
                onChange={handleChange}
              />

              {/* ── Participant-only: Username ── */}
              {isParticipant && (
                <Field
                  name="username"
                  label="Username"
                  placeholder="player_one"
                  required
                  form={form}
                  errors={errors}
                  onChange={handleChange}
                />
              )}

              {/* ── Email (always shown) ── */}
              <Field
                name="email"
                label="Email Address"
                type="email"
                placeholder="you@example.com"
                required
                form={form}
                errors={errors}
                onChange={handleChange}
              />

              {/* ── Contact Number (always shown) ── */}
              <Field
                name="contactNumber"
                label="Contact Number"
                type="tel"
                placeholder="+91 9876543210"
                form={form}
                errors={errors}
                onChange={handleChange}
              />

              {/* ── Participant-only: In-Game Name ── */}
              {isParticipant && (
                <Field
                  name="inGameName"
                  label="In-Game Name"
                  placeholder="Your IGN"
                  form={form}
                  errors={errors}
                  onChange={handleChange}
                />
              )}

              {/* ── Password ── */}
              <div>
                <label className="cyber-label">Password *</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    name="password"
                    value={form.password}
                    onChange={handleChange}
                    className={`cyber-input pr-10 ${errors.password ? 'border-red-400' : ''}`}
                    placeholder="Min. 6 characters"
                    autoComplete="new-password"
                  />
                  <button type="button" onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700">
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
                {errors.password && <p className="text-xs text-red-600 mt-1">{errors.password}</p>}
              </div>

              {/* ── Confirm Password ── */}
              <div>
                <label className="cyber-label">Confirm Password *</label>
                <input
                  type="password"
                  name="confirmPassword"
                  value={form.confirmPassword}
                  onChange={handleChange}
                  className={`cyber-input ${errors.confirmPassword ? 'border-red-400' : ''}`}
                  placeholder="Repeat password"
                  autoComplete="new-password"
                />
                {errors.confirmPassword && <p className="text-xs text-red-600 mt-1">{errors.confirmPassword}</p>}
              </div>

              <button type="submit" disabled={loading} className="cyber-btn-primary w-full py-3 text-sm mt-2">
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Creating Account...
                  </>
                ) : 'Create Account'}
              </button>
            </form>

            <p className="mt-5 text-center text-sm text-slate-500">
              Already have an account?{' '}
              <Link to="/login" className="text-violet-700 hover:text-violet-800 font-semibold">Sign In</Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Register;
