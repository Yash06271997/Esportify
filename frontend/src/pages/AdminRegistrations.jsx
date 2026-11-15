import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { ClipboardList, Search, AlertCircle, CheckCircle, XCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const regStatusMap = {
  pending:   'cyber-badge-yellow',
  approved:  'cyber-badge-green',
  rejected:  'cyber-badge-red',
  cancelled: 'cyber-badge-gray',
  withdrawn: 'cyber-badge-gray',
};

const AdminRegistrations = () => {
  const [registrations, setReg]       = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [statusFilter, setStatusFilter] = useState('');
  const [updating, setUpdating]       = useState(null);

  const refresh = () => {
    setLoading(true); setError('');
    api.get('/admin/registrations')
      .then(({ data }) => setReg(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load registrations.'))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const updateStatus = async (regId, status) => {
    setUpdating(regId + status);
    try {
      await api.patch(`/registrations/${regId}/status`, { status });
      await refresh();
    } catch (err) {
      alert(err.response?.data?.message || 'Failed to update status');
    }
    setUpdating(null);
  };

  const filtered = registrations.filter(r => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      r.teamName?.toLowerCase().includes(q) ||
      r.team?.name?.toLowerCase().includes(q) ||
      r.tournament?.name?.toLowerCase().includes(q);
    const matchStatus = !statusFilter || r.status === statusFilter;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-2">ADMIN</p>
          <h1 className="text-3xl font-black text-cyber-text flex items-center gap-3">
            <ClipboardList className="w-7 h-7 text-cyber-purple" /> All Registrations
          </h1>
          <p className="text-cyber-muted text-sm mt-1">Review and manage all team registrations.</p>
        </div>
        <button onClick={refresh} className="cyber-btn-ghost text-sm px-4 py-2 self-start">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input type="text" placeholder="Search by team or tournament..."
            value={search} onChange={e => setSearch(e.target.value)} className="cyber-input pl-9" />
        </div>
        <select value={statusFilter} onChange={e => setStatusFilter(e.target.value)} className="cyber-select sm:w-44">
          <option value="">All Statuses</option>
          {['pending', 'approved', 'rejected', 'cancelled', 'withdrawn'].map(s => (
            <option key={s} value={s}>{s.charAt(0).toUpperCase() + s.slice(1)}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3].map(i => <div key={i} className="cyber-card animate-pulse h-16"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cyber-card p-10 text-center">
          <ClipboardList className="w-10 h-10 text-cyber-purple/20 mx-auto mb-3" />
          <p className="text-cyber-muted">No registrations found.</p>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Team</th>
                  <th>Tournament</th>
                  <th>Leader</th>
                  <th>Status</th>
                  <th>Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(reg => (
                  <tr key={reg._id}>
                    <td className="font-bold text-cyber-text">
                      {reg.teamName || reg.team?.name || '—'}
                    </td>
                    <td>
                      {reg.tournament ? (
                        <Link to={`/tournaments/${reg.tournament._id}`}
                          className="text-cyber-cyan hover:underline text-sm">
                          {reg.tournament.name}
                        </Link>
                      ) : '—'}
                    </td>
                    <td className="text-xs text-cyber-muted">
                      {reg.user?.name || '—'}
                      {reg.user?.playerId && (
                        <p className="font-mono text-cyber-purple">{reg.user.playerId}</p>
                      )}
                    </td>
                    <td>
                      <span className={`cyber-badge ${regStatusMap[reg.status] || 'cyber-badge-gray'}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-cyber-muted whitespace-nowrap">
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      <div className="flex items-center gap-2">
                        {(reg.status === 'pending' || reg.status === 'rejected') && (
                          <button
                            onClick={() => updateStatus(reg._id, 'approved')}
                            disabled={!!updating}
                            className="cyber-btn-success text-xs px-3 py-1.5">
                            {updating === reg._id + 'approved' ? '...' :
                              <><CheckCircle className="w-3.5 h-3.5" />Approve</>}
                          </button>
                        )}
                        {(reg.status === 'pending' || reg.status === 'approved') && (
                          <button
                            onClick={() => updateStatus(reg._id, 'rejected')}
                            disabled={!!updating}
                            className="cyber-btn-danger text-xs px-3 py-1.5">
                            {updating === reg._id + 'rejected' ? '...' :
                              <><XCircle className="w-3.5 h-3.5" />Reject</>}
                          </button>
                        )}
                        {!['pending', 'approved', 'rejected'].includes(reg.status) && (
                          <span className="text-cyber-muted text-xs">—</span>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 border-t border-cyber-border bg-cyber-surface text-xs text-cyber-muted font-mono">
            Showing {filtered.length} of {registrations.length} registrations
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminRegistrations;
