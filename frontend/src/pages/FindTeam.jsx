import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Users, ChevronLeft, Crown, UserPlus, Clock, CheckCircle,
  AlertCircle, Trophy, Shield
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const statusLabel = (accepted, reqSize) => {
  if (accepted >= reqSize) return { text: 'Full', cls: 'cyber-badge-green' };
  return { text: 'Recruiting', cls: 'cyber-badge-yellow' };
};

const FindTeam = () => {
  const { id: tournamentId } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [requesting, setRequesting] = useState(null);
  const [success, setSuccess] = useState(null);
  const [myRequests, setMyRequests] = useState([]);

  const load = async () => {
    setLoading(true);
    setError(null);
    try {
      const [tRes, teamsRes] = await Promise.allSettled([
        api.get(`/tournaments/${tournamentId}`),
        api.get(`/tournaments/${tournamentId}/open-teams`),
      ]);
      if (tRes.status === 'fulfilled') setTournament(tRes.value.data);
      if (teamsRes.status === 'fulfilled') setTeams(teamsRes.value.data || []);

      // Only fetch my requests if logged in
      if (user) {
        const reqRes = await api.get('/teams/join-requests/mine').catch(() => null);
        if (reqRes) setMyRequests(reqRes.data || []);
      }
    } catch {
      setError('Failed to load teams.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, [tournamentId]);

  const handleRequest = async (teamId) => {
    setRequesting(teamId);
    setError(null);
    setSuccess(null);
    try {
      await api.post('/teams/join-requests/send', { teamId });
      setSuccess('Join request sent! The team leader will be notified.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to send join request.');
    }
    setRequesting(null);
  };

  const handleCancelRequest = async (reqId) => {
    try {
      await api.patch(`/teams/join-requests/${reqId}/cancel`);
      setSuccess('Join request cancelled.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel request.');
    }
  };

  const getMyRequestForTeam = (teamId) =>
    myRequests.find(r => String(r.team?._id || r.team) === String(teamId) && r.status === 'pending');

  const isMemberOfTeam = (team) =>
    (team.members || []).some(
      m => m.user && String(m.user._id || m.user) === String(user?._id) &&
        ['leader', 'accepted', 'pending'].includes(m.status)
    );

  if (loading) return (
    <div className="cyber-card p-10 text-center">
      <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-cyber-muted text-sm font-mono">Loading open teams...</p>
    </div>
  );

  const reqSize = tournament?.teamSize ?? 5;
  const formatLabel = `${reqSize}v${reqSize}`;

  return (
    <div className="space-y-6 max-w-3xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(`/tournaments/${tournamentId}`)}
        className="flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-text transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Tournament
      </button>

      {/* Header */}
      <div>
        <p className="pixel-heading text-cyber-cyan text-xs mb-2">FIND A TEAM</p>
        <h1 className="text-3xl font-black text-cyber-text">Join a Team</h1>
        {tournament && (
          <p className="text-cyber-muted text-sm mt-1">
            {tournament.name} &nbsp;·&nbsp; {tournament.game} &nbsp;·&nbsp;
            <span className="text-cyber-purple font-semibold">{formatLabel} format</span>
          </p>
        )}
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

      {/* Info */}
      <div className="cyber-card-purple p-4 text-xs text-cyber-muted">
        <p className="text-cyber-purple font-bold mb-1 flex items-center gap-1.5">
          <Shield className="w-3.5 h-3.5" /> How This Works
        </p>
        <ul className="space-y-1 list-disc list-inside">
          <li>These teams are actively looking for more players.</li>
          <li>Click <strong className="text-cyber-text">Request to Join</strong> to send a request to the team leader.</li>
          <li>The leader will accept or decline your request.</li>
          <li>You can only be in one team per tournament.</li>
        </ul>
      </div>

      {/* Teams */}
      {teams.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Users className="w-12 h-12 text-cyber-purple/30 mx-auto mb-4" />
          <p className="font-black text-cyber-text mb-2">No open teams yet</p>
          <p className="text-cyber-muted text-sm mb-6">
            Be the first! Create a team and other players will be able to request to join.
          </p>
          <Link to={`/dashboard/teams?tournament=${tournamentId}`} className="cyber-btn-primary text-sm px-6 py-2.5">
            <Users className="w-4 h-4" /> Create a Team
          </Link>
        </div>
      ) : (
        <div className="space-y-4">
          {teams.map(team => {
            const { text: sText, cls: sCls } = statusLabel(team.acceptedCount, team.requiredSize);
            const myReq = getMyRequestForTeam(team._id);
            const isMember = isMemberOfTeam(team);
            const isSelf = team.leader?._id === user?._id || team.leader === user?._id;
            const accepted = (team.members || []).filter(m => ['leader', 'accepted'].includes(m.status));

            return (
              <div key={team._id} className="cyber-card p-5">
                <div className="flex flex-col sm:flex-row justify-between gap-4">
                  {/* Team Info */}
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-1">
                      <h3 className="font-black text-cyber-text text-lg">{team.name}</h3>
                      <span className={`cyber-badge ${sCls}`}>{sText}</span>
                    </div>
                    <div className="flex items-center gap-2 text-xs text-cyber-muted mb-3">
                      <Crown className="w-3.5 h-3.5 text-cyber-yellow" />
                      <span>Leader: <strong className="text-cyber-text">{team.leader?.name || 'Unknown'}</strong></span>
                      <span className="font-mono text-cyber-muted">@{team.leader?.username || ''}</span>
                    </div>

                    {/* Player count bar */}
                    <div className="flex items-center gap-3 mb-3">
                      <div className="flex-1 h-2 bg-cyber-surface border border-cyber-border">
                        <div
                          className={`h-full transition-all ${team.acceptedCount >= team.requiredSize ? 'bg-cyber-green' : 'bg-cyber-purple'}`}
                          style={{ width: `${Math.min((team.acceptedCount / team.requiredSize) * 100, 100)}%` }}
                        ></div>
                      </div>
                      <span className="text-xs font-mono font-bold text-cyber-purple shrink-0">
                        {team.acceptedCount}/{team.requiredSize}
                      </span>
                    </div>

                    {/* Members */}
                    <div className="flex flex-wrap gap-1.5">
                      {accepted.map((m, i) => (
                        <span key={i} className="cyber-badge-gray text-xs flex items-center gap-1">
                          {m.status === 'leader' && <Crown className="w-3 h-3 text-cyber-yellow" />}
                          {m.user?.name || 'Player'}
                        </span>
                      ))}
                      {Array.from({ length: team.availableSlots }).map((_, i) => (
                        <span key={`empty-${i}`} className="border border-dashed border-cyber-border text-cyber-muted text-xs px-2 py-0.5 flex items-center gap-1 opacity-50">
                          <Users className="w-3 h-3" /> Open
                        </span>
                      ))}
                    </div>
                  </div>

                  {/* Action */}
                  <div className="flex flex-col justify-center items-end gap-2 shrink-0">
                    <div className="text-xs text-cyber-muted text-right">
                      <span className="font-mono font-bold text-cyber-purple">{team.availableSlots}</span> slot{team.availableSlots !== 1 ? 's' : ''} open
                    </div>
                    {isSelf ? (
                      <Link to={`/dashboard/teams/${team._id}`} className="cyber-btn-outline text-xs px-4 py-1.5">
                        <Trophy className="w-3.5 h-3.5" /> My Team
                      </Link>
                    ) : isMember ? (
                      <span className="cyber-badge-green text-xs py-1.5 px-3">Already Joined</span>
                    ) : myReq ? (
                      <div className="flex flex-col items-end gap-1">
                        <span className="cyber-badge-yellow text-xs py-1.5 px-3 flex items-center gap-1">
                          <Clock className="w-3 h-3" /> Request Pending
                        </span>
                        <button
                          onClick={() => handleCancelRequest(myReq._id)}
                          className="text-xs text-cyber-red hover:underline"
                        >
                          Cancel request
                        </button>
                      </div>
                    ) : team.acceptedCount >= team.requiredSize ? (
                      <span className="cyber-badge-gray text-xs py-1.5 px-3">Team Full</span>
                    ) : (
                      <button
                        onClick={() => handleRequest(team._id)}
                        disabled={requesting === team._id}
                        className="cyber-btn-primary text-xs px-4 py-1.5"
                      >
                        {requesting === team._id
                          ? <><div className="w-3.5 h-3.5 border-2 border-white/30 border-t-white rounded-full animate-spin" />Sending...</>
                          : <><UserPlus className="w-3.5 h-3.5" />Request to Join</>
                        }
                      </button>
                    )}
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}

      {/* Create own team CTA */}
      <div className="cyber-card p-5 border-t-2 border-cyber-purple">
        <p className="font-bold text-cyber-text text-sm mb-1">Prefer to lead your own team?</p>
        <p className="text-xs text-cyber-muted mb-3">Create a team and let other players request to join you.</p>
        <Link to={`/dashboard/teams/create?tournament=${tournamentId}`} className="cyber-btn-primary text-sm px-5 py-2">
          <Users className="w-4 h-4" /> Create a Team
        </Link>
      </div>
    </div>
  );
};

export default FindTeam;
