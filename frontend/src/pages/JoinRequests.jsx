import React, { useState, useEffect, useContext } from 'react';
import { Link } from 'react-router-dom';
import { Users, Clock, CheckCircle, XCircle, AlertCircle, Trophy } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const statusMap = {
  pending:   { badge: 'cyber-badge-yellow', label: 'Pending',   icon: Clock },
  accepted:  { badge: 'cyber-badge-green',  label: 'Accepted',  icon: CheckCircle },
  rejected:  { badge: 'cyber-badge-red',    label: 'Declined',  icon: XCircle },
  cancelled: { badge: 'cyber-badge-gray',   label: 'Cancelled', icon: XCircle },
};

const JoinRequests = () => {
  const { user } = useContext(AuthContext);
  const [requests, setRequests] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [success, setSuccess] = useState(null);
  const [acting, setActing] = useState(null);

  const load = async () => {
    setLoading(true);
    try {
      const { data } = await api.get('/teams/join-requests/mine');
      setRequests(data || []);
    } catch {
      setError('Failed to load join requests.');
    }
    setLoading(false);
  };

  useEffect(() => { load(); }, []);

  const handleCancel = async (reqId) => {
    setActing(reqId);
    setError(null);
    setSuccess(null);
    try {
      await api.patch(`/teams/join-requests/${reqId}/cancel`);
      setSuccess('Request cancelled.');
      load();
    } catch (err) {
      setError(err.response?.data?.message || 'Failed to cancel.');
    }
    setActing(null);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cyber-border pb-6">
        <p className="pixel-heading text-cyber-cyan text-xs mb-2">RECRUITMENT</p>
        <h1 className="text-3xl font-black text-cyber-text">My Join Requests</h1>
        <p className="text-cyber-muted text-sm mt-1">Teams you've requested to join.</p>
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

      {loading ? (
        <div className="cyber-card p-10 text-center">
          <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-3"></div>
          <p className="text-cyber-muted text-sm font-mono">Loading...</p>
        </div>
      ) : requests.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Users className="w-12 h-12 text-cyber-purple/30 mx-auto mb-4" />
          <p className="font-black text-cyber-text mb-2">No join requests yet</p>
          <p className="text-cyber-muted text-sm mb-6">
            Browse open tournaments and find a team to join.
          </p>
          <Link to="/tournaments" className="cyber-btn-primary text-sm px-6 py-2.5">
            Browse Tournaments
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {requests.map(req => {
            const s = statusMap[req.status] || statusMap.cancelled;
            const StatusIcon = s.icon;
            const teamName = req.team?.name || 'Unknown Team';
            const tournamentName = req.tournament?.name || 'Unknown Tournament';
            const game = req.tournament?.game || '';
            return (
              <div key={req._id} className="cyber-card p-5 flex items-center justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <p className="font-bold text-cyber-text">{teamName}</p>
                    <span className={`cyber-badge ${s.badge}`}>{s.label}</span>
                  </div>
                  <div className="flex items-center gap-2 text-xs text-cyber-muted">
                    <Trophy className="w-3.5 h-3.5 text-cyber-cyan" />
                    <span>{tournamentName}</span>
                    {game && <span className="font-mono text-cyber-cyan">· {game}</span>}
                  </div>
                  <p className="text-xs text-cyber-muted mt-1 font-mono">
                    Requested {new Date(req.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div className="flex items-center gap-2 shrink-0">
                  <StatusIcon className={`w-4 h-4 ${
                    req.status === 'accepted' ? 'text-cyber-green' :
                    req.status === 'pending' ? 'text-cyber-yellow' :
                    'text-cyber-red'
                  }`} />
                  {req.status === 'pending' && (
                    <button
                      onClick={() => handleCancel(req._id)}
                      disabled={acting === req._id}
                      className="cyber-btn-ghost text-xs px-3 py-1.5"
                    >
                      {acting === req._id ? '...' : 'Cancel'}
                    </button>
                  )}
                  {req.status === 'accepted' && req.team?._id && (
                    <Link to={`/dashboard/teams/${req.team._id}`} className="cyber-btn-cyan text-xs px-3 py-1.5">
                      View Team
                    </Link>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default JoinRequests;
