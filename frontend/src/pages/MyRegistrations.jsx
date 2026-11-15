import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { ClipboardList, Trash2, AlertCircle, Trophy, Users, ArrowRight } from 'lucide-react';

const regStatusMap = {
  pending:   'cyber-badge-yellow',
  approved:  'cyber-badge-green',
  rejected:  'cyber-badge-red',
  cancelled: 'cyber-badge-gray',
  withdrawn: 'cyber-badge-gray',
};

const MyRegistrations = () => {
  const { user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [loading, setLoading]             = useState(true);
  const [error, setError]                 = useState(null);
  const [cancelling, setCancelling]       = useState(null);

  const refresh = async () => {
    try {
      setLoading(true);
      setError(null);
      const { data } = await api.get('/registrations/me');
      setRegistrations(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load registrations.');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => { refresh(); }, []);

  const handleCancel = async (reg) => {
    if (!window.confirm(`Cancel registration for "${reg.tournament?.name || 'this tournament'}"?`)) return;
    setCancelling(reg._id);
    try {
      await api.delete(`/registrations/${reg._id}`);
      await refresh();
    } catch {
      alert('Failed to cancel registration.');
    }
    setCancelling(null);
  };

  return (
    <div className="space-y-6">
      <div className="border-b border-cyber-border pb-5">
        <p className="pixel-heading text-cyber-purple text-xs mb-2">HISTORY</p>
        <h1 className="text-3xl font-black text-cyber-text flex items-center gap-3">
          <ClipboardList className="w-7 h-7 text-cyber-purple" /> My Registrations
        </h1>
        <p className="text-cyber-muted text-sm mt-1">Track all your tournament registrations.</p>
      </div>

      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="cyber-card animate-pulse h-16"></div>)}
        </div>
      ) : registrations.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Trophy className="w-12 h-12 text-cyber-purple/30 mx-auto mb-4" />
          <h2 className="text-xl font-black text-cyber-text mb-2">No Registrations Yet</h2>
          <p className="text-cyber-muted text-sm mb-6">Find a tournament, build your team, and compete!</p>
          <Link to="/tournaments" className="cyber-btn-primary text-sm px-6 py-2.5">
            Browse Tournaments <ArrowRight className="w-4 h-4" />
          </Link>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="px-5 py-3.5 border-b border-cyber-border bg-cyber-surface flex justify-between items-center">
            <h2 className="font-black text-cyber-text text-sm">All Registrations — {registrations.length} total</h2>
          </div>
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Tournament</th>
                  <th>Status</th>
                  <th>Registered On</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {registrations.map(reg => (
                  <tr key={reg._id}>
                    <td>
                      <div className="font-bold text-cyber-text">{reg.teamName || reg.team?.name || '—'}</div>
                      {reg.team && (
                        <Link to={`/dashboard/teams/${reg.team._id || reg.team}`}
                          className="text-xs text-cyber-purple hover:underline flex items-center gap-1 mt-0.5">
                          <Users className="w-3 h-3" /> View Team
                        </Link>
                      )}
                    </td>
                    <td>
                      {reg.tournament ? (
                        <Link to={`/tournaments/${reg.tournament._id || reg.tournament}`}
                          className="text-cyber-cyan hover:underline">
                          {reg.tournament.name || '—'}
                        </Link>
                      ) : '—'}
                    </td>
                    <td>
                      <div>
                        <span className={`cyber-badge ${regStatusMap[reg.status] || 'cyber-badge-gray'}`}>
                          {reg.status}
                        </span>
                        {reg.status === 'rejected' && reg.rejectionReason && (
                          <p className="text-xs text-cyber-red mt-1" title={reg.rejectionReason}>
                            Reason: {reg.rejectionReason.substring(0, 50)}{reg.rejectionReason.length > 50 ? '…' : ''}
                          </p>
                        )}
                      </div>
                    </td>
                    <td className="font-mono text-xs text-cyber-muted whitespace-nowrap">
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {(reg.status === 'pending' || reg.status === 'approved') ? (
                        <button
                          onClick={() => handleCancel(reg)}
                          disabled={cancelling === reg._id}
                          className="cyber-btn-danger text-xs px-3 py-1.5"
                        >
                          {cancelling === reg._id
                            ? '...'
                            : <><Trash2 className="w-3.5 h-3.5" /> Cancel</>}
                        </button>
                      ) : (
                        <span className="text-cyber-muted text-xs">—</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  );
};

export default MyRegistrations;
