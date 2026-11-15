import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Trophy, Swords, Calendar, ChevronLeft, AlertCircle,
  CheckCircle, Zap, Play, RefreshCw, Trash2, Clock
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const statusColors = {
  scheduled: 'cyber-badge-yellow',
  ongoing:   'cyber-badge-cyan',
  completed: 'cyber-badge-green',
  bye:       'cyber-badge-gray',
};

const roundLabel = (round, totalRounds) => {
  if (round === totalRounds) return 'Grand Final';
  if (round === totalRounds - 1) return 'Semi-Finals';
  if (round === totalRounds - 2) return 'Quarter-Finals';
  return `Round ${round}`;
};

const BracketManagement = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [matches, setMatches]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [generating, setGenerating] = useState(false);
  const [deleting, setDeleting]     = useState(false);
  const [error, setError]           = useState('');
  const [success, setSuccess]       = useState('');

  // Modal state for updating a match
  const [editMatch, setEditMatch] = useState(null);
  const [editForm, setEditForm]   = useState({ scoreA: '', scoreB: '', scheduledAt: '', status: '', notes: '' });
  const [saving, setSaving]       = useState(false);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      const [tRes, mRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/matches/tournaments/${id}/matches`),
      ]);
      setTournament(tRes.data);
      setMatches(mRes.data || []);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to load bracket data.');
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [id]);

  const handleGenerate = async () => {
    if (!window.confirm('Generate bracket from all approved registrations? This cannot be undone (delete first to regenerate).')) return;
    setGenerating(true); setError(''); setSuccess('');
    try {
      const { data } = await api.post(`/matches/tournaments/${id}/bracket`);
      setSuccess(data.message || 'Bracket generated!');
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to generate bracket.');
    }
    setGenerating(false);
  };

  const handleDelete = async () => {
    if (!window.confirm('Delete the entire bracket? All match data will be lost.')) return;
    setDeleting(true); setError(''); setSuccess('');
    try {
      await api.delete(`/matches/tournaments/${id}/bracket`);
      setSuccess('Bracket deleted.');
      setMatches([]);
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to delete bracket.');
    }
    setDeleting(false);
  };

  const openEdit = (match) => {
    setEditMatch(match);
    setEditForm({
      scoreA: match.scoreA ?? '',
      scoreB: match.scoreB ?? '',
      scheduledAt: match.scheduledAt ? new Date(match.scheduledAt).toISOString().slice(0, 16) : '',
      status: match.status || 'scheduled',
      notes: match.notes || '',
    });
  };

  const handleSave = async () => {
    if (!editMatch) return;
    setSaving(true);
    setError(''); setSuccess('');
    try {
      const payload = {
        status: editForm.status,
        notes: editForm.notes,
      };
      if (editForm.scheduledAt) payload.scheduledAt = editForm.scheduledAt;
      if (editForm.scoreA !== '') payload.scoreA = Number(editForm.scoreA);
      if (editForm.scoreB !== '') payload.scoreB = Number(editForm.scoreB);

      await api.patch(`/matches/matches/${editMatch._id}`, payload);
      setSuccess('Match updated!');
      setEditMatch(null);
      await refresh();
    } catch (err) {
      setError(err?.response?.data?.message || 'Failed to update match.');
    }
    setSaving(false);
  };

  const totalRounds = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0;
  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);

  if (loading) return (
    <div className="cyber-card p-10 text-center">
      <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-cyber-muted text-sm font-mono">Loading bracket...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/organizer/tournaments')}
        className="flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-text transition-colors">
        <ChevronLeft className="w-4 h-4" /> My Tournaments
      </button>

      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-2">BRACKET</p>
          <h1 className="text-2xl font-black text-cyber-text">Match Management</h1>
          {tournament && (
            <p className="text-sm text-cyber-muted mt-1">
              <Link to={`/tournaments/${tournament._id}`} className="text-cyber-cyan hover:underline">
                {tournament.name}
              </Link> · {tournament.game}
            </p>
          )}
        </div>
        <div className="flex gap-3">
          {matches.length === 0 ? (
            <button onClick={handleGenerate} disabled={generating}
              className="cyber-btn-primary text-sm px-5 py-2.5">
              {generating
                ? <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />Generating...</>
                : <><Zap className="w-4 h-4" />Generate Bracket</>}
            </button>
          ) : (
            <>
              <button onClick={() => refresh()} className="cyber-btn-ghost text-sm px-4 py-2">
                <RefreshCw className="w-4 h-4" />
              </button>
              <button onClick={handleDelete} disabled={deleting}
                className="cyber-btn-danger text-sm px-4 py-2">
                {deleting ? '...' : <><Trash2 className="w-4 h-4" />Delete Bracket</>}
              </button>
            </>
          )}
        </div>
      </div>

      {/* Alerts */}
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

      {/* Empty state */}
      {matches.length === 0 && !loading && (
        <div className="cyber-card p-12 text-center">
          <Swords className="w-12 h-12 text-cyber-purple/30 mx-auto mb-4" />
          <h2 className="text-xl font-black text-cyber-text mb-2">No Bracket Yet</h2>
          <p className="text-cyber-muted text-sm mb-5">
            Approve team registrations first, then generate the bracket.
          </p>
          <Link to={`/organizer/tournaments/${id}/registrations`} className="cyber-btn-cyan text-sm px-5 py-2.5">
            Manage Registrations
          </Link>
        </div>
      )}

      {/* Bracket rounds */}
      {rounds.map(round => {
        const roundMatches = matches.filter(m => m.round === round);
        return (
          <div key={round} className="cyber-card overflow-hidden">
            <div className="px-5 py-3 border-b border-cyber-border bg-cyber-surface flex items-center gap-2">
              <Trophy className="w-4 h-4 text-cyber-purple" />
              <h2 className="font-black text-cyber-text text-sm uppercase tracking-widest">
                {roundLabel(round, totalRounds)}
              </h2>
              <span className="text-xs text-cyber-muted ml-2">({roundMatches.length} matches)</span>
            </div>
            <div className="divide-y divide-cyber-border">
              {roundMatches.map(match => (
                <div key={match._id} className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    {/* Teams */}
                    <div className="flex items-center gap-3 mb-1">
                      <span className={`font-bold text-sm ${
                        match.winner?._id === match.teamA?._id ? 'text-cyber-green' : 'text-cyber-text'
                      }`}>
                        {match.teamA?.name || 'TBD'}
                      </span>
                      <span className="text-cyber-muted text-xs font-mono">vs</span>
                      <span className={`font-bold text-sm ${
                        match.winner?._id === match.teamB?._id ? 'text-cyber-green' : 'text-cyber-text'
                      }`}>
                        {match.teamB?.name || 'TBD'}
                      </span>
                    </div>

                    {/* Score */}
                    {(match.scoreA !== null || match.scoreB !== null) && (
                      <p className="text-xs font-mono text-cyber-cyan mb-1">
                        Score: {match.scoreA ?? '—'} – {match.scoreB ?? '—'}
                        {match.winner && <span className="text-cyber-green ml-2">Winner: {match.winner.name}</span>}
                      </p>
                    )}

                    <div className="flex items-center gap-3 flex-wrap">
                      <span className={`cyber-badge ${statusColors[match.status] || 'cyber-badge-gray'}`}>
                        {match.status}
                      </span>
                      {match.scheduledAt && (
                        <span className="text-xs font-mono text-cyber-muted flex items-center gap-1">
                          <Calendar className="w-3 h-3" />
                          {new Date(match.scheduledAt).toLocaleString()}
                        </span>
                      )}
                    </div>
                    {match.notes && <p className="text-xs text-cyber-muted mt-1 italic">{match.notes}</p>}
                  </div>

                  {/* Edit button — not for bye matches */}
                  {match.status !== 'bye' && (
                    <button onClick={() => openEdit(match)}
                      className="cyber-btn-ghost text-xs px-4 py-2 shrink-0">
                      <Play className="w-3.5 h-3.5" /> Update
                    </button>
                  )}
                </div>
              ))}
            </div>
          </div>
        );
      })}

      {/* Edit Match Modal */}
      {editMatch && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="cyber-card w-full max-w-md p-6 space-y-4">
            <h3 className="font-black text-cyber-text">
              Update Match: {editMatch.teamA?.name || 'TBD'} vs {editMatch.teamB?.name || 'TBD'}
            </h3>

            <div>
              <label className="cyber-label">Scheduled Date & Time</label>
              <input type="datetime-local" value={editForm.scheduledAt}
                onChange={e => setEditForm(f => ({ ...f, scheduledAt: e.target.value }))}
                className="cyber-input" />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="cyber-label">Score — {editMatch.teamA?.name || 'Team A'}</label>
                <input type="number" min="0" value={editForm.scoreA}
                  onChange={e => setEditForm(f => ({ ...f, scoreA: e.target.value }))}
                  className="cyber-input" placeholder="0" />
              </div>
              <div>
                <label className="cyber-label">Score — {editMatch.teamB?.name || 'Team B'}</label>
                <input type="number" min="0" value={editForm.scoreB}
                  onChange={e => setEditForm(f => ({ ...f, scoreB: e.target.value }))}
                  className="cyber-input" placeholder="0" />
              </div>
            </div>

            <div>
              <label className="cyber-label">Match Status</label>
              <select value={editForm.status}
                onChange={e => setEditForm(f => ({ ...f, status: e.target.value }))}
                className="cyber-select">
                <option value="scheduled">Scheduled</option>
                <option value="ongoing">Ongoing</option>
                <option value="completed">Completed</option>
              </select>
              {editForm.status === 'completed' && (
                <p className="text-xs text-cyber-yellow mt-1.5 flex items-center gap-1">
                  <Clock className="w-3 h-3" />
                  Winner is determined by the higher score. Ties go to Team A.
                </p>
              )}
            </div>

            <div>
              <label className="cyber-label">Notes (optional)</label>
              <input type="text" value={editForm.notes}
                onChange={e => setEditForm(f => ({ ...f, notes: e.target.value }))}
                className="cyber-input" placeholder="e.g. Match postponed due to..." />
            </div>

            <div className="flex gap-3 pt-2">
              <button onClick={handleSave} disabled={saving}
                className="cyber-btn-primary text-sm px-5 py-2.5 flex-1">
                {saving ? 'Saving...' : 'Save Changes'}
              </button>
              <button onClick={() => setEditMatch(null)}
                className="cyber-btn-ghost text-sm px-5 py-2.5">
                Cancel
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default BracketManagement;
