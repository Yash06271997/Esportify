import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useSearchParams, Link } from 'react-router-dom';
import { Users, Trophy, AlertCircle, ChevronLeft, Info, CheckCircle } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

// ─── Helper ──────────────────────────────────────────────────────────────────
const formatLabel = (size) => `${size}v${size}`;

// ─── Component ───────────────────────────────────────────────────────────────
const CreateTeam = () => {
  const [sp] = useSearchParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  // If a tournament ID was passed via ?tournament=<id>, we are in "direct" mode.
  // The dropdown is hidden and that specific tournament is used automatically.
  const presetId = sp.get('tournament') || '';

  const [name, setName] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  // ── Direct mode: single tournament fetched by ID ──────────────────────────
  const [presetTournament, setPresetTournament] = useState(null);
  const [presetLoading, setPresetLoading] = useState(!!presetId);
  const [presetError, setPresetError] = useState(null);

  // ── Dropdown mode: list of all eligible tournaments ───────────────────────
  const [tournaments, setTournaments] = useState([]);
  const [tournamentId, setTournamentId] = useState('');

  // Load data depending on mode
  useEffect(() => {
    if (presetId) {
      // Direct mode — fetch just this tournament
      setPresetLoading(true);
      api.get(`/tournaments/${presetId}`)
        .then(({ data }) => {
          // Guard: tournament must exist and not be closed/past deadline
          if (!data) throw new Error('Tournament not found.');
          if (['cancelled', 'completed', 'registration_closed'].includes(data.status)) {
            throw new Error(`Tournament registration is not open (status: ${data.status}).`);
          }
          if (data.registrationDeadline && new Date(data.registrationDeadline) < new Date()) {
            throw new Error('Registration deadline for this tournament has already passed.');
          }
          setPresetTournament(data);
        })
        .catch(err => setPresetError(err.response?.data?.message || err.message || 'Failed to load tournament.'))
        .finally(() => setPresetLoading(false));
    } else {
      // Dropdown mode — fetch all eligible tournaments
      Promise.allSettled([
        api.get('/tournaments?status=registration_open'),
        api.get('/tournaments?status=upcoming'),
      ]).then(([openRes, upcomingRes]) => {
        const now = new Date();
        const open = openRes.status === 'fulfilled' ? openRes.value.data : [];
        const upcoming = upcomingRes.status === 'fulfilled' ? upcomingRes.value.data : [];
        const all = [...open, ...upcoming];
        const seen = new Set();
        const eligible = all.filter(t => {
          if (seen.has(t._id)) return false;
          seen.add(t._id);
          if (['cancelled', 'completed', 'registration_closed', 'ongoing'].includes(t.status)) return false;
          if (t.registrationDeadline && new Date(t.registrationDeadline) < now) return false;
          return true;
        });
        setTournaments(eligible);
      });
    }
  }, [presetId]);

  // Resolved tournament (either preset or dropdown-selected)
  const activeTournament = presetId
    ? presetTournament
    : (tournaments.find(t => t._id === tournamentId) || null);

  const teamSize = activeTournament?.teamSize ?? 5;
  const additionalNeeded = teamSize - 1;

  // ── Submit ────────────────────────────────────────────────────────────────
  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    if (!name.trim()) return setError('Team name is required.');
    const tid = presetId || tournamentId;
    if (!tid) return setError('Please select a tournament.');
    setLoading(true);
    try {
      const { data } = await api.post('/teams', { name: name.trim(), tournamentId: tid });
      navigate(`/dashboard/teams/${data._id}`);
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to create team.');
    }
    setLoading(false);
  };

  // ── Render ────────────────────────────────────────────────────────────────
  return (
    <div className="max-w-lg mx-auto space-y-6">
      {/* Back button */}
      <button
        onClick={() => presetId ? navigate(`/tournaments/${presetId}`) : navigate('/dashboard/teams')}
        className="flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-text transition-colors"
      >
        <ChevronLeft className="w-4 h-4" />
        {presetId ? 'Back to Tournament' : 'My Teams'}
      </button>

      {/* Heading */}
      <div>
        <p className="pixel-heading text-cyber-purple text-xs mb-2">NEW SQUAD</p>
        <h1 className="text-3xl font-black text-cyber-text">Create a Team</h1>
        <p className="text-cyber-muted text-sm mt-1">
          {activeTournament
            ? `${formatLabel(teamSize)} format — ${teamSize} player${teamSize !== 1 ? 's' : ''} required.`
            : 'Select a tournament to see the required team size.'}
        </p>
      </div>

      {/* ── DIRECT MODE: loading / error state ─────────────────────────── */}
      {presetId && presetLoading && (
        <div className="cyber-card p-10 text-center">
          <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-3" />
          <p className="text-cyber-muted text-sm font-mono">Loading tournament...</p>
        </div>
      )}

      {presetId && presetError && (
        <div className="cyber-card border-red-700/50 p-5 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-cyber-red mx-auto" />
          <p className="text-sm text-cyber-red font-bold">{presetError}</p>
          <Link to="/tournaments" className="cyber-btn-outline text-sm px-5 py-2">
            Browse Tournaments
          </Link>
        </div>
      )}

      {/* ── MAIN FORM (shown when tournament is resolved) ───────────────── */}
      {(!presetId || (!presetLoading && !presetError && presetTournament)) && (
        <div className="cyber-card p-6">
          {error && (
            <div className="flex items-center gap-3 border border-red-700/50 bg-red-900/10 p-3 mb-4">
              <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
              <p className="text-sm text-cyber-red">{error}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">

            {/* ── DIRECT MODE: show locked tournament info card ─────────── */}
            {presetId && presetTournament && (
              <div>
                <label className="cyber-label">Tournament</label>
                <div className="cyber-card p-4 border-cyber-purple/40 bg-cyber-surface flex items-center gap-3">
                  <Trophy className="w-5 h-5 text-cyber-purple shrink-0" />
                  <div className="flex-1 min-w-0">
                    <p className="font-black text-cyber-text truncate">{presetTournament.name}</p>
                    <p className="text-xs text-cyber-muted font-mono mt-0.5">
                      {presetTournament.game}
                      &nbsp;·&nbsp;
                      <span className="text-cyber-purple font-semibold">{formatLabel(teamSize)}</span>
                      &nbsp;·&nbsp;
                      {teamSize} player{teamSize !== 1 ? 's' : ''} per team
                    </p>
                  </div>
                  <CheckCircle className="w-4 h-4 text-cyber-green shrink-0" />
                </div>
              </div>
            )}

            {/* ── DROPDOWN MODE: show tournament selector ───────────────── */}
            {!presetId && (
              <div>
                <label className="cyber-label">Tournament *</label>
                <div className="relative">
                  <Trophy className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
                  <select
                    value={tournamentId}
                    onChange={e => setTournamentId(e.target.value)}
                    className="cyber-select pl-9"
                    required
                  >
                    <option value="">Select a tournament...</option>
                    {tournaments.map(t => (
                      <option key={t._id} value={t._id}>
                        {t.name} — {t.game} ({formatLabel(t.teamSize ?? 5)})
                      </option>
                    ))}
                  </select>
                </div>
                {tournaments.length === 0 && (
                  <p className="text-xs text-cyber-muted mt-1.5">No open tournaments at the moment.</p>
                )}
              </div>
            )}

            {/* Team Name */}
            <div>
              <label className="cyber-label">Team Name *</label>
              <div className="relative">
                <Users className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
                <input
                  type="text"
                  value={name}
                  onChange={e => setName(e.target.value)}
                  className="cyber-input pl-9"
                  placeholder="e.g. Shadow Squad"
                  required
                />
              </div>
            </div>

            {/* Dynamic format info box */}
            <div className="cyber-card-purple p-4 text-xs text-cyber-muted space-y-1">
              <p className="text-cyber-purple font-bold mb-1 flex items-center gap-1.5">
                <Info className="w-3.5 h-3.5" /> Team Format
              </p>
              {activeTournament ? (
                <>
                  <p>• This is a <strong className="text-cyber-text">{formatLabel(teamSize)}</strong> tournament requiring <strong className="text-cyber-text">{teamSize} player{teamSize !== 1 ? 's' : ''}</strong> per team.</p>
                  <p>• You are automatically the team leader (Slot 1).</p>
                  {additionalNeeded > 0
                    ? <p>• After creating, invite <strong className="text-cyber-text">{additionalNeeded}</strong> more player{additionalNeeded !== 1 ? 's' : ''} to complete the roster.</p>
                    : <p>• This is a solo format — no additional players needed.</p>}
                  <p>• You can create only one team per tournament.</p>
                </>
              ) : (
                <p>• Select a tournament above to see the required team format.</p>
              )}
            </div>

            <button
              type="submit"
              disabled={loading || (presetId ? !presetTournament : !tournamentId)}
              className="cyber-btn-primary w-full py-3 text-sm"
            >
              {loading
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Creating...</>
                : <><Users className="w-4 h-4" />Create Team</>}
            </button>
          </form>
        </div>
      )}
    </div>
  );
};

export default CreateTeam;
