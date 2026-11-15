import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import api from '../services/api';
import {
  CheckCircle, XCircle, Users, ChevronLeft, AlertCircle, Trophy,
  ChevronDown, ChevronUp
} from 'lucide-react';

const regStatusMap = {
  pending:   'cyber-badge-yellow',
  approved:  'cyber-badge-green',
  rejected:  'cyber-badge-red',
  cancelled: 'cyber-badge-gray',
  withdrawn: 'cyber-badge-gray',
};

const ManageRegistrations = () => {
  const { id } = useParams();
  const navigate = useNavigate();

  const [tournament, setTournament]   = useState(null);
  const [registrations, setReg]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [updating, setUpdating]       = useState(null);
  const [expanded, setExpanded]       = useState(null);
  const [rejectModal, setRejectModal] = useState(null); // regId
  const [reason, setReason]           = useState('');

  const refresh = async () => {
    try {
      const [tRes, rRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/registrations/tournaments/${id}/registrations`),
      ]);
      setTournament(tRes.data);
      setReg(rRes.data);
    } catch {}
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [id]);

  const updateStatus = async (regId, status, rejectionReason = '') => {
    setUpdating(regId + status);
    try {
      await api.patch(`/registrations/${regId}/status`, { status, rejectionReason });
      await refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
    setUpdating(null);
    setRejectModal(null);
    setReason('');
  };

  if (loading) return (
    <div className="cyber-card p-10 text-center">
      <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-cyber-muted text-sm font-mono">Loading registrations...</p>
    </div>
  );

  if (!tournament) return (
    <div className="cyber-card p-10 text-center">
      <AlertCircle className="w-10 h-10 text-cyber-red mx-auto mb-3" />
      <p className="text-cyber-text font-bold">Tournament not found.</p>
      <button onClick={() => navigate(-1)} className="cyber-btn-outline text-sm mt-4 px-5 py-2">Go Back</button>
    </div>
  );

  const pending  = registrations.filter(r => r.status === 'pending').length;
  const approved = registrations.filter(r => r.status === 'approved').length;

  return (
    <div className="space-y-6">
      <button onClick={() => navigate('/organizer/tournaments')}
        className="flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-text transition-colors">
        <ChevronLeft className="w-4 h-4" /> My Tournaments
      </button>

      <div>
        <p className="pixel-heading text-cyber-cyan text-xs mb-2">MANAGE</p>
        <h1 className="text-2xl font-black text-cyber-text mb-1">Registrations</h1>
        <div className="flex items-center gap-2 text-sm text-cyber-muted">
          <Trophy className="w-4 h-4 text-cyber-cyan" />
          <Link to={`/tournaments/${tournament._id}`} className="text-cyber-cyan hover:underline">
            {tournament.name}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-3 gap-4">
        {[
          { label: 'Total', value: registrations.length, color: 'text-cyber-text', border: 'border-t-cyber-purple' },
          { label: 'Pending', value: pending, color: 'text-cyber-yellow', border: 'border-t-cyber-yellow' },
          { label: 'Approved', value: approved, color: 'text-cyber-green', border: 'border-t-cyber-green' },
        ].map(s => (
          <div key={s.label} className={`cyber-card p-4 border-t-2 ${s.border}`}>
            <p className="text-xs text-cyber-muted uppercase tracking-widest mb-1">{s.label}</p>
            <p className={`text-3xl font-black ${s.color}`}>{s.value}</p>
          </div>
        ))}
      </div>

      {/* Reject Modal */}
      {rejectModal && (
        <div className="fixed inset-0 z-50 bg-black/70 flex items-center justify-center p-4">
          <div className="cyber-card w-full max-w-sm p-6">
            <h3 className="font-black text-cyber-text mb-3">Reject Registration</h3>
            <p className="text-xs text-cyber-muted mb-3">Provide a reason (optional — will be shown to participant):</p>
            <textarea
              value={reason}
              onChange={e => setReason(e.target.value)}
              className="cyber-input resize-none h-24 mb-4"
              placeholder="e.g. Team roster incomplete..."
            />
            <div className="flex gap-3">
              <button onClick={() => updateStatus(rejectModal, 'rejected', reason)}
                className="cyber-btn-danger text-sm px-5 py-2.5 flex-1">Confirm Reject</button>
              <button onClick={() => { setRejectModal(null); setReason(''); }}
                className="cyber-btn-ghost text-sm px-5 py-2.5">Cancel</button>
            </div>
          </div>
        </div>
      )}

      {/* Registrations */}
      {registrations.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Users className="w-10 h-10 text-cyber-purple/30 mx-auto mb-3" />
          <p className="text-cyber-muted">No registrations yet.</p>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-cyber-border bg-cyber-surface">
            <h2 className="font-black text-cyber-text text-sm">All Registrations ({registrations.length})</h2>
          </div>
          <div className="divide-y divide-cyber-border">
            {registrations.map(reg => (
              <div key={reg._id}>
                {/* Row */}
                <div className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 mb-0.5">
                      <p className="font-bold text-cyber-text text-sm">{reg.teamName || reg.team?.name || 'Unknown Team'}</p>
                      <span className={`cyber-badge ${regStatusMap[reg.status] || 'cyber-badge-gray'}`}>{reg.status}</span>
                    </div>
                    <p className="text-xs text-cyber-muted">
                      Leader: {reg.user?.name || '—'} &nbsp;·&nbsp;
                      <span className="font-mono">{reg.user?.playerId || reg.user?.email || ''}</span>
                    </p>
                    <p className="text-xs text-cyber-muted/50 font-mono mt-0.5">
                      {new Date(reg.createdAt).toLocaleDateString()}
                    </p>
                    {reg.status === 'rejected' && reg.rejectionReason && (
                      <p className="text-xs text-cyber-red mt-1">Reason: {reg.rejectionReason}</p>
                    )}
                  </div>

                  <div className="flex items-center gap-2 shrink-0">
                    {/* Expand team roster */}
                    {reg.team?.members && (
                      <button onClick={() => setExpanded(expanded === reg._id ? null : reg._id)}
                        className="cyber-btn-ghost text-xs px-3 py-1.5">
                        <Users className="w-3.5 h-3.5" />
                        {expanded === reg._id ? <ChevronUp className="w-3.5 h-3.5" /> : <ChevronDown className="w-3.5 h-3.5" />}
                      </button>
                    )}
                    {/* Approve */}
                    {(reg.status === 'pending' || reg.status === 'rejected') && (
                      <button onClick={() => updateStatus(reg._id, 'approved')}
                        disabled={!!updating}
                        className="cyber-btn-success text-xs px-3 py-1.5">
                        {updating === reg._id + 'approved'
                          ? '...'
                          : <><CheckCircle className="w-3.5 h-3.5" /> Approve</>}
                      </button>
                    )}
                    {/* Reject */}
                    {(reg.status === 'pending' || reg.status === 'approved') && (
                      <button onClick={() => setRejectModal(reg._id)}
                        disabled={!!updating}
                        className="cyber-btn-danger text-xs px-3 py-1.5">
                        <XCircle className="w-3.5 h-3.5" /> Reject
                      </button>
                    )}
                  </div>
                </div>

                {/* Team Roster Expansion */}
                {expanded === reg._id && reg.team?.members && (
                  <div className="border-t border-cyber-border bg-cyber-surface px-5 py-4">
                    <p className="text-xs text-cyber-muted uppercase tracking-widest mb-3">Team Roster</p>
                    <div className="space-y-2">
                      {reg.team.members.map((m, i) => (
                        <div key={i} className="flex items-center gap-3 text-sm">
                          <span className="text-xs font-mono text-cyber-muted w-5">{i+1}.</span>
                          <span className="font-bold text-cyber-text">{m.user?.name || '—'}</span>
                          <span className="font-mono text-xs text-cyber-purple">{m.user?.playerId || ''}</span>
                          {m.user?.inGameName && <span className="text-xs text-cyber-muted">IGN: {m.user.inGameName}</span>}
                          <span className={`ml-auto cyber-badge ${
                            m.status === 'leader' ? 'cyber-badge-purple' :
                            m.status === 'accepted' ? 'cyber-badge-green' :
                            m.status === 'pending' ? 'cyber-badge-yellow' : 'cyber-badge-red'
                          }`}>{m.status}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageRegistrations;
