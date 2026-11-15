import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Trophy, Search, AlertCircle, Trash2, Edit2, RefreshCw } from 'lucide-react';
import api from '../services/api';

const statusMap = {
  upcoming:            { label: 'Upcoming',    cls: 'cyber-badge-yellow' },
  registration_open:   { label: 'Open',        cls: 'cyber-badge-green' },
  registration_closed: { label: 'Reg Closed',  cls: 'cyber-badge-gray' },
  ongoing:             { label: 'Live',         cls: 'cyber-badge-cyan' },
  completed:           { label: 'Ended',        cls: 'cyber-badge-gray' },
  cancelled:           { label: 'Cancelled',   cls: 'cyber-badge-red' },
};

const AdminTournaments = () => {
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [search, setSearch]           = useState('');
  const [status, setStatus]           = useState('');
  const [deletingId, setDeletingId]   = useState(null);

  const refresh = () => {
    setLoading(true); setError('');
    api.get('/tournaments')
      .then(({ data }) => setTournaments(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load tournaments.'))
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete tournament "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/tournaments/${id}`);
      setTournaments(prev => prev.filter(t => t._id !== id));
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete tournament.');
    }
    setDeletingId(null);
  };

  const filtered = tournaments.filter(t => {
    const q = search.toLowerCase();
    const matchSearch = !search || t.name?.toLowerCase().includes(q) || t.game?.toLowerCase().includes(q);
    const matchStatus = !status || t.status === status;
    return matchSearch && matchStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-2">ADMIN</p>
          <h1 className="text-3xl font-black text-cyber-text flex items-center gap-3">
            <Trophy className="w-7 h-7 text-cyber-purple" /> All Tournaments
          </h1>
          <p className="text-cyber-muted text-sm mt-1">View and manage all platform tournaments.</p>
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
          <input type="text" placeholder="Search by tournament name or game..."
            value={search} onChange={e => setSearch(e.target.value)} className="cyber-input pl-9" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="cyber-select sm:w-44">
          <option value="">All Statuses</option>
          {Object.entries(statusMap).map(([val, { label }]) => (
            <option key={val} value={val}>{label}</option>
          ))}
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4].map(i => <div key={i} className="cyber-card animate-pulse h-16"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cyber-card p-10 text-center">
          <Trophy className="w-10 h-10 text-cyber-purple/20 mx-auto mb-3" />
          <p className="text-cyber-muted">No tournaments found.</p>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Game</th>
                  <th>Status</th>
                  <th>Organizer</th>
                  <th>Start Date</th>
                  <th>Registrations</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(t => {
                  const s = statusMap[t.status] || { label: t.status, cls: 'cyber-badge-gray' };
                  return (
                    <tr key={t._id}>
                      <td>
                        <Link to={`/tournaments/${t._id}`}
                          className="font-bold text-cyber-text hover:text-cyber-purple transition-colors">
                          {t.name}
                        </Link>
                      </td>
                      <td className="text-xs text-cyber-muted uppercase font-mono">{t.game}</td>
                      <td><span className={`cyber-badge ${s.cls}`}>{s.label}</span></td>
                      <td className="text-xs text-cyber-muted">{t.organizer?.name || '—'}</td>
                      <td className="font-mono text-xs text-cyber-muted whitespace-nowrap">
                        {t.startDate ? new Date(t.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <Link to={`/organizer/tournaments/${t._id}/registrations`}
                          className="cyber-badge-purple hover:opacity-80 transition-opacity">
                          {t.activeRegistrations ?? 0}/{t.capacity}
                        </Link>
                      </td>
                      <td>
                        <div className="flex items-center gap-2">
                          <Link to={`/organizer/tournaments/${t._id}/edit`}
                            className="cyber-btn-ghost text-xs px-3 py-1.5">
                            <Edit2 className="w-3 h-3" /> Edit
                          </Link>
                          <button onClick={() => handleDelete(t._id, t.name)}
                            disabled={deletingId === t._id}
                            className="cyber-btn-danger text-xs px-3 py-1.5">
                            {deletingId === t._id ? '...' : <><Trash2 className="w-3 h-3" /> Delete</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 border-t border-cyber-border bg-cyber-surface text-xs text-cyber-muted font-mono">
            Showing {filtered.length} of {tournaments.length} tournaments
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminTournaments;
