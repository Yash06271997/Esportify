import React, { useState, useEffect, useContext } from 'react';
import { useParams, useSearchParams, useNavigate, Link } from 'react-router-dom';
import {
  Users, Search, UserPlus, CheckCircle, Clock, XCircle,
  Crown, ChevronLeft, AlertCircle, Trophy, Send
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const statusColors = {
  leader:   { badge: 'cyber-badge-purple', icon: Crown,         label: 'Leader' },
  accepted: { badge: 'cyber-badge-green',  icon: CheckCircle,   label: 'Accepted' },
  pending:  { badge: 'cyber-badge-yellow', icon: Clock,         label: 'Pending' },
  rejected: { badge: 'cyber-badge-red',    icon: XCircle,       label: 'Rejected' },
};

const TeamDetail = () => {
  const { id } = useParams();
  const [sp] = useSearchParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [team, setTeam]           = useState(null);
  const [loading, setLoading]     = useState(true);
  const [searchQ, setSearchQ]     = useState('');
  const [results, setResults]     = useState([]);
  const [searching, setSearching] = useState(false);
  const [inviting, setInviting]   = useState(null);
  const [registering, setRegistering] = useState(false);
  const [error, setError]         = useState(null);
  const [success, setSuccess]     = useState(null);
  const [joinRequests, setJoinRequests] = useState([]);
  const [responding, setResponding] = useState(null);

  const refreshJoinRequests = (teamId) => {
    api.get(`/teams/${teamId}/join-requests`)
      .then(({ data }) => setJoinRequests(data || []))
      .catch(() => {});
  };

  const refresh = () => {
    setLoading(true);
    api.get(`/teams/${id}`)
      .then(({ data }) => {
        setTeam(data);
        // If user is leader, also load join requests
        if (data.leader?._id === user?._id || data.leader === user?._id) {
          refreshJoinRequests(id);
        }
      })
      .catch(() => setError('Failed to load team.'))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, [id]);

  const handleSearch = async (e) => {
    e.preventDefault();
    if (!searchQ.trim()) return;
    setSearching(true);
    setResults([]);
    try {
      const { data } = await api.get(`/teams/players/search?q=${encodeURIComponent(searchQ)}`);
      setResults(data);
    } catch {
      setError('Player search failed.');
    }
    setSearching(false);
  };

  const handleInvite = async (playerId) => {
    setInviting(playerId);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/teams/invitations/send', { teamId: id, receiverId: playerId });
      setSuccess('Invitation sent!');
      setResults([]);
      setSearchQ('');
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send invitation.');
    }
    setInviting(null);
  };

  const handleRegister = async () => {
    if (!window.confirm(`Submit team registration for this tournament? All ${reqTeamSize} members must have accepted.`)) return;
    setRegistering(true);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/teams/register', { teamId: id });
      setSuccess('Registration submitted! Awaiting organizer approval.');
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed.');
    }
    setRegistering(false);
  };

  const handleJoinRequestRespond = async (reqId, action) => {
    setResponding(reqId);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/teams/join-requests/${reqId}/respond`, { action });
      setSuccess(action === 'accept' ? 'Player added to team!' : 'Request declined.');
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${action} request.`);
    }
    setResponding(null);
  };

  if (loading) return (
    <div className="cyber-card p-10 text-center">
      <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-cyber-muted text-sm font-mono">Loading team...</p>
    </div>
  );

  if (!team) return (
    <div className="cyber-card p-10 text-center">
      <AlertCircle className="w-10 h-10 text-cyber-red mx-auto mb-3" />
      <p className="text-cyber-text font-bold">{error || 'Team not found.'}</p>
      <button onClick={() => navigate(-1)} className="cyber-btn-outline text-sm mt-4 px-5 py-2">Go Back</button>
    </div>
  );

  const isLeader = team.leader?._id === user?._id || team.leader === user?._id;
  const reqTeamSize = team.tournament?.teamSize || 5;
  const accepted = (team.members || []).filter(m => m.status === 'accepted' || m.status === 'leader').length;
  const isComplete = accepted >= reqTeamSize;
  const isRegistered = !!team.registrationId;

  // Build slots dynamically based on tournament team size
  const slots = Array.from({ length: reqTeamSize }, (_, i) => team.members?.[i] || null);

  return (
    <div className="space-y-6">
      {/* Back */}
      <button onClick={() => navigate('/dashboard/teams')}
        className="flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-text transition-colors">
        <ChevronLeft className="w-4 h-4" /> My Teams
      </button>

      {/* Header */}
      <div className="cyber-card p-6">
        <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
          <div>
            <div className="flex items-center gap-3 mb-1">
              <h1 className="text-2xl font-black text-cyber-text">{team.name}</h1>
              {isComplete
                ? <span className="cyber-badge-green">Complete</span>
                : <span className="cyber-badge-yellow">Incomplete</span>}
            </div>
            {team.tournament && (
              <div className="flex items-center gap-2 text-sm text-cyber-muted">
                <Trophy className="w-4 h-4 text-cyber-cyan" />
                <Link to={`/tournaments/${team.tournament._id}`} className="text-cyber-cyan hover:underline">
                  {team.tournament.name}
                </Link>
              </div>
            )}
          </div>

          {isLeader && isComplete && !isRegistered && (
            <button onClick={handleRegister} disabled={registering}
              className="cyber-btn-primary text-sm px-6 py-2.5">
              {registering ? (
                <><div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>Submitting...</>
              ) : (
                <><Send className="w-4 h-4" />Submit Registration</>
              )}
            </button>
          )}
          {isRegistered && (
            <span className="cyber-badge-green text-xs py-2 px-3">Registered ✓</span>
          )}
        </div>

        {/* Progress */}
        <div className="mt-4">
          <div className="flex justify-between text-xs text-cyber-muted mb-1.5">
            <span>Team Completion</span>
            <span className={`font-mono font-bold ${isComplete ? 'text-cyber-green' : 'text-cyber-purple'}`}>{accepted}/{reqTeamSize}</span>
          </div>
          <div className="h-2 bg-cyber-surface border border-cyber-border">
            <div
              className={`h-full transition-all duration-500 ${isComplete ? 'bg-cyber-green' : 'bg-cyber-purple'}`}
              style={{ width: `${Math.min((accepted / reqTeamSize) * 100, 100)}%` }}
            ></div>
          </div>
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

      {/* Member Slots */}
      <div className="cyber-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-cyber-border bg-cyber-surface">
          <h2 className="font-black text-cyber-text text-sm flex items-center gap-2">
            <Users className="w-4 h-4 text-cyber-purple" /> Team Roster ({reqTeamSize} Players Required)
          </h2>
        </div>
        <div className="divide-y divide-cyber-border">
          {slots.map((member, idx) => {
            if (!member) {
              return (
                <div key={idx} className="px-5 py-4 flex items-center gap-4 opacity-40">
                  <div className="w-9 h-9 border border-dashed border-cyber-border flex items-center justify-center">
                    <Users className="w-4 h-4 text-cyber-muted" />
                  </div>
                  <div>
                    <p className="text-xs text-cyber-muted font-mono">SLOT {idx + 1} — EMPTY</p>
                  </div>
                </div>
              );
            }
            const sc = statusColors[member.status] || { badge: 'cyber-badge-gray', icon: Users, label: member.status };
            const Icon = sc.icon;
            return (
              <div key={idx} className="px-5 py-4 flex items-center gap-4">
                <div className="w-9 h-9 bg-cyber-surface border border-cyber-border flex items-center justify-center shrink-0">
                  <span className="text-xs font-mono font-bold text-cyber-purple">{idx + 1}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-cyber-text text-sm">{member.user?.name || 'Player'}</p>
                    <span className={`cyber-badge ${sc.badge}`}>{sc.label}</span>
                  </div>
                  <p className="text-xs text-cyber-muted font-mono">
                    {member.user?.playerId || ''}{member.user?.inGameName ? ` • IGN: ${member.user.inGameName}` : ''}
                  </p>
                </div>
                <Icon className={`w-4 h-4 shrink-0 ${
                  member.status === 'leader' ? 'text-cyber-purple' :
                  member.status === 'accepted' ? 'text-cyber-green' :
                  member.status === 'pending' ? 'text-cyber-yellow' : 'text-cyber-red'
                }`} />
              </div>
            );
          })}
        </div>
      </div>

      {/* Invite Players — leader only, team incomplete, not registered */}
      {isLeader && !isComplete && !isRegistered && (
        <div className="cyber-card p-6">
          <h2 className="font-black text-cyber-text text-sm mb-4 flex items-center gap-2">
            <UserPlus className="w-4 h-4 text-cyber-cyan" /> Invite Players
          </h2>
          <form onSubmit={handleSearch} className="flex gap-3 mb-4">
            <div className="relative flex-1">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
              <input
                type="text"
                placeholder="Search by Player ID (ESP-10001) or username..."
                value={searchQ}
                onChange={e => setSearchQ(e.target.value)}
                className="cyber-input pl-9"
              />
            </div>
            <button type="submit" disabled={searching} className="cyber-btn-cyan text-sm px-5 py-2.5">
              {searching ? '...' : 'Search'}
            </button>
          </form>

          {results.length > 0 && (
            <div className="space-y-2">
              {results.map(p => (
                <div key={p._id} className="flex items-center justify-between cyber-card p-3">
                  <div>
                    <p className="font-bold text-cyber-text text-sm">{p.name}</p>
                    <p className="text-xs text-cyber-muted font-mono">
                      @{p.username} &nbsp;·&nbsp; {p.playerId}
                      {p.inGameName && ` · IGN: ${p.inGameName}`}
                    </p>
                  </div>
                  <button
                    onClick={() => handleInvite(p._id)}
                    disabled={inviting === p._id}
                    className="cyber-btn-primary text-xs px-4 py-1.5"
                  >
                    {inviting === p._id ? '...' : <><UserPlus className="w-3.5 h-3.5" />Invite</>}
                  </button>
                </div>
              ))}
            </div>
          )}

          {results.length === 0 && searchQ && !searching && (
            <p className="text-xs text-cyber-muted text-center py-4">No players found. Try a different query.</p>
          )}
        </div>
      )}

      {/* Join Requests — leader view, only if team not yet registered */}
      {isLeader && !isRegistered && (() => {
        const pendingReqs = joinRequests.filter(r => r.status === 'pending');
        if (pendingReqs.length === 0) return null;
        return (
          <div className="cyber-card overflow-hidden">
            <div className="px-5 py-3.5 border-b border-cyber-border bg-cyber-surface">
              <h2 className="font-black text-cyber-text text-sm flex items-center gap-2">
                <UserPlus className="w-4 h-4 text-cyber-cyan" />
                Join Requests
                <span className="cyber-badge-yellow text-xs">{pendingReqs.length} pending</span>
              </h2>
            </div>
            <div className="divide-y divide-cyber-border">
              {pendingReqs.map(req => (
                <div key={req._id} className="px-5 py-4 flex items-center justify-between gap-4">
                  <div>
                    <p className="font-bold text-cyber-text text-sm">{req.requester?.name || 'Player'}</p>
                    <p className="text-xs text-cyber-muted font-mono">
                      @{req.requester?.username || ''} &nbsp;·&nbsp; {req.requester?.playerId || ''}
                      {req.requester?.inGameName && ` · IGN: ${req.requester.inGameName}`}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <button
                      onClick={() => handleJoinRequestRespond(req._id, 'accept')}
                      disabled={responding === req._id || isComplete}
                      className="cyber-btn-primary text-xs px-3 py-1.5"
                    >
                      {responding === req._id ? '...' : <><CheckCircle className="w-3.5 h-3.5" />Accept</>}
                    </button>
                    <button
                      onClick={() => handleJoinRequestRespond(req._id, 'reject')}
                      disabled={responding === req._id}
                      className="cyber-btn-ghost text-xs px-3 py-1.5 text-cyber-red border-cyber-red/30 hover:bg-red-900/10"
                    >
                      {responding === req._id ? '...' : <><XCircle className="w-3.5 h-3.5" />Decline</>}
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })()}

      {/* Registration status */}
      {isRegistered && (
        <div className="cyber-card-purple p-5">
          <div className="flex items-center gap-3">
            <CheckCircle className="w-5 h-5 text-cyber-green" />
            <div>
              <p className="font-bold text-cyber-text">Registration Submitted</p>
              <p className="text-xs text-cyber-muted mt-0.5">Track your status in <Link to="/dashboard/registrations" className="text-cyber-purple">My Registrations</Link>.</p>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default TeamDetail;
