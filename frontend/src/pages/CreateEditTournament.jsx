import React, { useEffect, useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import {
  Trophy, Calendar, MapPin, DollarSign, Users, FileText, Info,
  AlertCircle, CheckCircle, ChevronLeft
} from 'lucide-react';
import api from '../services/api';

const GAMES = ['Valorant', 'CS2', 'Counter-Strike', 'Dota 2', 'FIFA', 'EA SPORTS FC', 'Mobile Legends', 'PUBG Mobile'];

const INITIAL = {
  name: '', game: '', description: '', bannerUrl: '',
  startDate: '', endDate: '', registrationDeadline: '',
  format: 'online', venueDetails: '', prizePool: '',
  capacity: '', participationType: 'team', eligibility: '', rules: '', status: 'upcoming',
  teamSize: '5', // default for non-EA games; resets to '1' when EA game is selected
};

const isEaGame = (game) => {
  const g = (game || '').toLowerCase();
  return g.includes('ea sports') || g.includes('ea fc') || g.includes('fifa');
};

const toDate = (s) => (!s ? '' : s.slice(0, 10));

const SectionHeader = ({ icon: Icon, title, color = 'text-cyber-purple' }) => (
  <h2 className={`font-black text-cyber-text text-xs uppercase tracking-widest mb-5 pb-3 border-b border-cyber-border flex items-center gap-2`}>
    <Icon className={`w-4 h-4 ${color}`} />
    {title}
  </h2>
);

const Field = ({ label, error, required, children }) => (
  <div>
    <label className="cyber-label">{label}{required && ' *'}</label>
    {children}
    {error && <p className="text-xs text-cyber-red mt-1">{error}</p>}
  </div>
);

export default function CreateEditTournament() {
  const { id } = useParams();
  const navigate = useNavigate();
  const isEditing = Boolean(id);

  const [form, setForm]               = useState(INITIAL);
  const [loading, setLoading]         = useState(false);
  const [fetching, setFetching]       = useState(isEditing);
  const [error, setError]             = useState('');
  const [success, setSuccess]         = useState('');
  const [fieldErrors, setFieldErrors] = useState({});

  useEffect(() => {
    if (!isEditing) return;
    api.get(`/tournaments/${id}`)
      .then(({ data }) => {
        const t = data;
        const game = t.game || '';
        const ea = isEaGame(game);
        // Sanitise teamSize: if game is EA but stored value is not 1 or 2, default to 1
        let teamSize = t.teamSize?.toString() || '5';
        if (ea && !['1', '2'].includes(teamSize)) teamSize = '1';
        // If game is non-EA but stored value is out of normal range, default to 5
        if (!ea && !['1', '2', '3', '5'].includes(teamSize)) teamSize = '5';

        setForm({
          name: t.name || '', game, description: t.description || '',
          bannerUrl: t.bannerUrl || '', startDate: toDate(t.startDate),
          endDate: toDate(t.endDate), registrationDeadline: toDate(t.registrationDeadline),
          format: t.format || 'online', venueDetails: t.venueDetails || '',
          prizePool: t.prizePool || '', capacity: t.capacity?.toString() || '',
          participationType: t.participationType || 'team', eligibility: t.eligibility || '',
          rules: t.rules || '', status: t.status || 'upcoming',
          teamSize,
        });
      })
      .catch(err => setError(err?.response?.data?.message || 'Failed to load tournament.'))
      .finally(() => setFetching(false));
  }, [id, isEditing]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setForm(p => {
      const updated = { ...p, [name]: value };
      // When switching game, reset teamSize to safe default
      if (name === 'game') {
        const ea = isEaGame(value);
        // If was EA and now non-EA, reset to 5; if non-EA to EA, reset to 1
        if (!ea) updated.teamSize = '5';
        else if (!isEaGame(p.game)) updated.teamSize = '1';
      }
      return updated;
    });
    if (fieldErrors[name]) setFieldErrors(p => { const n = {...p}; delete n[name]; return n; });
  };

  const validate = () => {
    const e = {};
    if (!form.name.trim()) e.name = 'Tournament name is required.';
    if (!form.game.trim()) e.game = 'Game is required.';
    if (!form.description.trim()) e.description = 'Description is required.';
    if (!form.startDate) e.startDate = 'Start date is required.';
    if (!form.registrationDeadline) e.registrationDeadline = 'Registration deadline is required.';
    if (!form.capacity || isNaN(Number(form.capacity)) || Number(form.capacity) < 2)
      e.capacity = 'Maximum teams must be at least 2.';
    if (form.format === 'offline' && !form.venueDetails.trim())
      e.venueDetails = 'Venue details required for offline events.';
    if (form.startDate && form.endDate && form.endDate < form.startDate)
      e.endDate = 'End date must be on or after start date.';
    if (form.startDate && form.registrationDeadline && form.registrationDeadline > form.startDate)
      e.registrationDeadline = 'Deadline must be on or before start date.';
    return e;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(''); setSuccess('');
    const errs = validate();
    if (Object.keys(errs).length > 0) { setFieldErrors(errs); return; }
    setLoading(true);
    try {
      const payload = {
        name: form.name.trim(), game: form.game.trim(), description: form.description.trim(),
        bannerUrl: form.bannerUrl.trim() || undefined, startDate: form.startDate,
        endDate: form.endDate || undefined, registrationDeadline: form.registrationDeadline,
        format: form.format,
        venueDetails: form.format === 'offline' ? form.venueDetails.trim() : undefined,
        prizePool: form.prizePool.trim() || undefined, capacity: Number(form.capacity),
        participationType: form.participationType, eligibility: form.eligibility.trim() || undefined,
        rules: form.rules.trim() || undefined,
        teamSize: Number(form.teamSize) || 5,
        ...(isEditing && { status: form.status }),
      };
      if (isEditing) {
        await api.patch(`/tournaments/${id}`, payload);
        setSuccess('Tournament updated!');
      } else {
        await api.post('/tournaments', payload);
        setSuccess('Tournament created!');
      }
      setTimeout(() => navigate('/organizer/tournaments'), 1200);
    } catch (err) {
      setError(err?.response?.data?.message || 'Something went wrong.');
    }
    setLoading(false);
  };

  if (fetching) return (
    <div className="cyber-card p-10 text-center">
      <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-cyber-muted text-sm font-mono">Loading tournament data...</p>
    </div>
  );

  return (
    <div className="max-w-3xl mx-auto space-y-6">
      <button onClick={() => navigate('/organizer/tournaments')}
        className="flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-text transition-colors">
        <ChevronLeft className="w-4 h-4" /> My Tournaments
      </button>

      <div>
        <p className="pixel-heading text-cyber-purple text-xs mb-2">{isEditing ? 'EDITING' : 'NEW EVENT'}</p>
        <h1 className="text-3xl font-black text-cyber-text">
          {isEditing ? 'Edit Tournament' : 'Create Tournament'}
        </h1>
      </div>

      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}
      {success && (
        <div className="cyber-card border-cyber-green/50 p-4 flex items-center gap-3">
          <CheckCircle className="w-4 h-4 text-cyber-green shrink-0" />
          <p className="text-sm text-cyber-green">{success}</p>
        </div>
      )}

      <form onSubmit={handleSubmit} noValidate className="space-y-5">
        {/* Basic Info */}
        <div className="cyber-card p-6">
          <SectionHeader icon={Info} title="Basic Information" />
          <div className="space-y-4">
            <Field label="Tournament Name" error={fieldErrors.name} required>
              <input type="text" name="name" value={form.name} onChange={handleChange}
                className={`cyber-input ${fieldErrors.name ? 'border-red-700/70' : ''}`}
                placeholder="e.g. Valorant Champions Series 2026" />
            </Field>
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Game" error={fieldErrors.game} required>
                <input type="text" name="game" value={form.game} onChange={handleChange}
                  list="game-list"
                  className={`cyber-input ${fieldErrors.game ? 'border-red-700/70' : ''}`}
                  placeholder="Valorant, CS2, Dota 2..." />
                <datalist id="game-list">{GAMES.map(g => <option key={g} value={g} />)}</datalist>
              </Field>
              <Field label="Prize Pool" error={fieldErrors.prizePool}>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
                  <input type="text" name="prizePool" value={form.prizePool} onChange={handleChange}
                    className="cyber-input pl-9" placeholder="₹50,000 or Trophy" />
                </div>
              </Field>
            </div>
            <Field label="Description" error={fieldErrors.description} required>
              <textarea name="description" value={form.description} onChange={handleChange} rows={4}
                className={`cyber-input resize-y ${fieldErrors.description ? 'border-red-700/70' : ''}`}
                placeholder="Describe what this tournament is about..." />
            </Field>
            <Field label="Banner Image URL">
              <input type="url" name="bannerUrl" value={form.bannerUrl} onChange={handleChange}
                className="cyber-input" placeholder="https://example.com/banner.jpg" />
            </Field>
          </div>
        </div>

        {/* Schedule */}
        <div className="cyber-card p-6">
          <SectionHeader icon={Calendar} title="Schedule" color="text-cyber-cyan" />
          <div className="grid sm:grid-cols-3 gap-4">
            <Field label="Start Date" error={fieldErrors.startDate} required>
              <input type="date" name="startDate" value={form.startDate} onChange={handleChange}
                className={`cyber-input ${fieldErrors.startDate ? 'border-red-700/70' : ''}`} />
            </Field>
            <Field label="End Date" error={fieldErrors.endDate}>
              <input type="date" name="endDate" value={form.endDate} onChange={handleChange}
                className={`cyber-input ${fieldErrors.endDate ? 'border-red-700/70' : ''}`} />
            </Field>
            <Field label="Reg. Deadline" error={fieldErrors.registrationDeadline} required>
              <input type="date" name="registrationDeadline" value={form.registrationDeadline} onChange={handleChange}
                className={`cyber-input ${fieldErrors.registrationDeadline ? 'border-red-700/70' : ''}`} />
            </Field>
          </div>
        </div>

        {/* Format & Venue */}
        <div className="cyber-card p-6">
          <SectionHeader icon={MapPin} title="Format & Venue" color="text-cyber-magenta" />
          <div className="grid sm:grid-cols-2 gap-4">
            <Field label="Format" required>
              <select name="format" value={form.format} onChange={handleChange} className="cyber-select">
                <option value="online">Online</option>
                <option value="offline">Offline (LAN)</option>
              </select>
            </Field>
            <Field label="Participation Type">
              <select name="participationType" value={form.participationType} onChange={handleChange} className="cyber-select">
                <option value="team">Team</option>
                <option value="individual">Individual (Solo)</option>
              </select>
            </Field>
            {isEaGame(form.game) ? (
              <Field label="Team Size (players per team)">
                <select name="teamSize" value={form.teamSize} onChange={handleChange} className="cyber-select">
                  <option value="1">1v1 — Solo (1 player per team)</option>
                  <option value="2">2v2 — Duo (2 players per team)</option>
                </select>
                <p className="text-xs text-cyber-muted mt-1">Only 1v1 and 2v2 formats are supported for EA SPORTS FC / FIFA.</p>
              </Field>
            ) : (
              <Field label="Team Size (players per team)">
                <select name="teamSize" value={form.teamSize} onChange={handleChange} className="cyber-select">
                  <option value="5">5v5 — Full Squad (5 players per team)</option>
                  <option value="3">3v3 — Trio (3 players per team)</option>
                  <option value="2">2v2 — Duo (2 players per team)</option>
                  <option value="1">1v1 — Solo (1 player per team)</option>
                </select>
                <p className="text-xs text-cyber-muted mt-1">Set how many players are required per team for this tournament.</p>
              </Field>
            )}
            {form.format === 'offline' && (
              <div className="sm:col-span-2">
                <Field label="Venue Details" error={fieldErrors.venueDetails} required>
                  <input type="text" name="venueDetails" value={form.venueDetails} onChange={handleChange}
                    className={`cyber-input ${fieldErrors.venueDetails ? 'border-red-700/70' : ''}`}
                    placeholder="LAN Arena, Sector 18, Noida" />
                </Field>
              </div>
            )}
          </div>
        </div>

        {/* Capacity & Rules */}
        <div className="cyber-card p-6">
          <SectionHeader icon={FileText} title="Capacity, Eligibility & Rules" color="text-cyber-green" />
          <div className="space-y-4">
            <div className="grid sm:grid-cols-2 gap-4">
              <Field label="Maximum Teams" error={fieldErrors.capacity} required>
                <div className="relative">
                  <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
                  <input type="number" name="capacity" value={form.capacity} onChange={handleChange}
                    min={2} className={`cyber-input pl-9 ${fieldErrors.capacity ? 'border-red-700/70' : ''}`}
                    placeholder="e.g. 16" />
                </div>
              </Field>
              <Field label="Eligibility Criteria">
                <input type="text" name="eligibility" value={form.eligibility} onChange={handleChange}
                  className="cyber-input" placeholder="Open to all, 18+, etc." />
              </Field>
            </div>
            <Field label="Tournament Rules">
              <textarea name="rules" value={form.rules} onChange={handleChange} rows={5}
                className="cyber-input resize-y"
                placeholder="List rules, format details, anti-cheat policy..." />
            </Field>
          </div>
        </div>

        {/* Status — edit only */}
        {isEditing && (
          <div className="cyber-card p-6 border-cyber-cyan/30">
            <SectionHeader icon={Trophy} title="Tournament Status" color="text-cyber-cyan" />
            <div className="max-w-xs">
              <label className="cyber-label">Current Status</label>
              <select name="status" value={form.status} onChange={handleChange} className="cyber-select">
                <option value="upcoming">Upcoming</option>
                <option value="registration_open">Registration Open</option>
                <option value="registration_closed">Registration Closed</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
                <option value="cancelled">Cancelled</option>
              </select>
            </div>
          </div>
        )}

        {/* Actions */}
        <div className="flex gap-3 justify-end">
          <button type="button" onClick={() => navigate('/organizer/tournaments')}
            className="cyber-btn-ghost text-sm px-6 py-2.5">Cancel</button>
          <button type="submit" disabled={loading} className="cyber-btn-primary text-sm px-8 py-2.5">
            {loading
              ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                  {isEditing ? 'Saving...' : 'Creating...'}</>
              : isEditing ? 'Save Changes' : 'Create Tournament'}
          </button>
        </div>
      </form>
    </div>
  );
}
