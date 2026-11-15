import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Bell, CheckCircle, XCircle, Users, Trophy, AlertCircle, Clock } from 'lucide-react';
import api from '../services/api';

const Invitations = () => {
  const [invitations, setInvitations] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [responding, setResponding]   = useState(null);
  const [error, setError]             = useState(null);

  const refresh = () => {
    setLoading(true);
    api.get('/teams/invitations/mine')
      .then(({ data }) => setInvitations(data))
      .catch(() => setError('Failed to load invitations.'))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const respond = async (invId, status) => {
    setResponding(invId + status);
    setError(null);
    try {
      await api.patch(`/teams/invitations/${invId}/respond`, { status });
      refresh();
    } catch (err) {
      setError(err.response?.data?.message || `Failed to ${status} invitation.`);
    }
    setResponding(null);
  };

  const pending   = invitations.filter(i => i.status === 'pending');
  const resolved  = invitations.filter(i => i.status !== 'pending');

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <p className="pixel-heading text-cyber-cyan text-xs mb-2">INBOX</p>
        <h1 className="text-3xl font-black text-cyber-text">Team Invitations</h1>
      </div>

      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2].map(i => <div key={i} className="cyber-card animate-pulse h-24"></div>)}
        </div>
      ) : (
        <>
          {/* Pending */}
          <div>
            <h2 className="font-black text-cyber-text text-sm mb-3 flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyber-yellow" />
              Pending ({pending.length})
            </h2>
            {pending.length === 0 ? (
              <div className="cyber-card p-8 text-center">
                <Bell className="w-10 h-10 text-cyber-purple/30 mx-auto mb-3" />
                <p className="text-cyber-muted text-sm">No pending invitations.</p>
              </div>
            ) : (
              <div className="space-y-3">
                {pending.map(inv => (
                  <div key={inv._id} className="cyber-card p-5 border-l-2 border-cyber-yellow">
                    <div className="flex flex-col sm:flex-row justify-between items-start gap-4">
                      <div>
                        <div className="flex items-center gap-2 mb-1">
                          <Users className="w-4 h-4 text-cyber-cyan" />
                          <span className="font-black text-cyber-text">{inv.team?.name}</span>
                        </div>
                        <p className="text-xs text-cyber-muted">
                          Invited by <span className="text-cyber-purple font-bold">{inv.sender?.name || 'Unknown'}</span>
                          {' '}(@{inv.sender?.username || '—'})
                        </p>
                        {inv.tournament && (
                          <div className="flex items-center gap-1.5 text-xs text-cyber-muted mt-1">
                            <Trophy className="w-3 h-3 text-cyber-yellow" />
                            <Link to={`/tournaments/${inv.tournament._id}`} className="text-cyber-cyan hover:underline">
                              {inv.tournament.name}
                            </Link>
                            &nbsp;·&nbsp; {inv.tournament.game}
                          </div>
                        )}
                        <p className="text-[10px] text-cyber-muted/50 font-mono mt-1.5">
                          {new Date(inv.createdAt).toLocaleString()}
                        </p>
                      </div>
                      <div className="flex gap-2 shrink-0">
                        <button
                          onClick={() => respond(inv._id, 'accepted')}
                          disabled={!!responding}
                          className="cyber-btn-success text-xs px-4 py-2">
                          {responding === inv._id + 'accepted'
                            ? '...'
                            : <><CheckCircle className="w-3.5 h-3.5" />Accept</>}
                        </button>
                        <button
                          onClick={() => respond(inv._id, 'rejected')}
                          disabled={!!responding}
                          className="cyber-btn-danger text-xs px-4 py-2">
                          {responding === inv._id + 'rejected'
                            ? '...'
                            : <><XCircle className="w-3.5 h-3.5" />Decline</>}
                        </button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* History */}
          {resolved.length > 0 && (
            <div>
              <h2 className="font-black text-cyber-text text-sm mb-3 flex items-center gap-2">
                <CheckCircle className="w-4 h-4 text-cyber-muted" />
                History ({resolved.length})
              </h2>
              <div className="space-y-2">
                {resolved.map(inv => {
                  const isAccepted = inv.status === 'accepted';
                  return (
                    <div key={inv._id}
                      className={`cyber-card p-4 flex justify-between items-center border-l-2 ${
                        isAccepted ? 'border-cyber-green' : 'border-cyber-red'
                      } opacity-70`}>
                      <div>
                        <p className="font-bold text-cyber-text text-sm">{inv.team?.name}</p>
                        <p className="text-xs text-cyber-muted">from {inv.sender?.name} · {inv.tournament?.name}</p>
                      </div>
                      <span className={isAccepted ? 'cyber-badge-green' : 'cyber-badge-red'}>
                        {inv.status}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Invitations;
