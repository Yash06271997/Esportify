import React, { useEffect, useState, useContext } from 'react';
import { Search, Users, AlertCircle, RefreshCw, UserX, UserCheck } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AdminUsers = () => {
  const { user: currentUser } = useContext(AuthContext);
  const [users, setUsers]             = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [actionLoading, setAction]    = useState(null);
  const [search, setSearch]           = useState('');
  const [roleFilter, setRoleFilter]   = useState('');

  const fetchUsers = () => {
    setLoading(true); setError('');
    api.get('/admin/users')
      .then(({ data }) => setUsers(data))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load users.'))
      .finally(() => setLoading(false));
  };

  useEffect(fetchUsers, []);

  const handleStatusChange = async (userId, newStatus, userName) => {
    const action = newStatus === 'suspended' ? 'suspend' : 'reactivate';
    if (!window.confirm(`${action.charAt(0).toUpperCase() + action.slice(1)} account of "${userName}"?`)) return;
    setAction(userId);
    try {
      await api.patch(`/admin/users/${userId}/status`, { status: newStatus });
      setUsers(prev => prev.map(u => u._id === userId ? { ...u, status: newStatus } : u));
    } catch (err) {
      alert(err?.response?.data?.message || `Failed to ${action} user.`);
    }
    setAction(null);
  };

  const filtered = users.filter(u => {
    const q = search.toLowerCase();
    const matchSearch = !search ||
      u.name?.toLowerCase().includes(q) ||
      u.email?.toLowerCase().includes(q) ||
      u.username?.toLowerCase().includes(q) ||
      u.playerId?.toLowerCase().includes(q);
    const matchRole = !roleFilter || u.role === roleFilter;
    return matchSearch && matchRole;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-2">ADMIN</p>
          <h1 className="text-3xl font-black text-cyber-text flex items-center gap-3">
            <Users className="w-7 h-7 text-cyber-purple" /> User Management
          </h1>
          <p className="text-cyber-muted text-sm mt-1">View and manage all platform users.</p>
        </div>
        <button onClick={fetchUsers} className="cyber-btn-ghost text-sm px-4 py-2 self-start sm:self-auto">
          <RefreshCw className="w-4 h-4" /> Refresh
        </button>
      </div>

      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
          <button onClick={fetchUsers} className="ml-auto cyber-btn-ghost text-xs px-3 py-1">Retry</button>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input type="text" placeholder="Search by name, email, username, or Player ID..."
            value={search} onChange={e => setSearch(e.target.value)} className="cyber-input pl-9" />
        </div>
        <select value={roleFilter} onChange={e => setRoleFilter(e.target.value)} className="cyber-select sm:w-44">
          <option value="">All Roles</option>
          <option value="user">Participant</option>
          <option value="organizer">Organizer</option>
          <option value="admin">Admin</option>
        </select>
      </div>

      {loading ? (
        <div className="space-y-2">
          {[1,2,3,4,5].map(i => <div key={i} className="cyber-card animate-pulse h-14"></div>)}
        </div>
      ) : filtered.length === 0 ? (
        <div className="cyber-card p-10 text-center">
          <Users className="w-10 h-10 text-cyber-purple/20 mx-auto mb-3" />
          <p className="text-cyber-muted">No users found. Try adjusting your filters.</p>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Username / Player ID</th>
                  <th>Email</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th>Joined</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map(u => (
                  <tr key={u._id}>
                    <td className="font-bold text-cyber-text whitespace-nowrap">{u.name || '—'}</td>
                    <td>
                      <p className="font-mono text-xs text-cyber-muted">@{u.username || '—'}</p>
                      {u.playerId && <p className="font-mono text-xs text-cyber-purple">{u.playerId}</p>}
                    </td>
                    <td className="text-cyber-muted text-xs whitespace-nowrap">{u.email}</td>
                    <td>
                      <span className={`cyber-badge ${
                        u.role === 'admin' ? 'cyber-badge-red' :
                        u.role === 'organizer' ? 'cyber-badge-cyan' : 'cyber-badge-purple'
                      }`}>{u.role}</span>
                    </td>
                    <td>
                      <span className={u.status === 'suspended' ? 'cyber-badge-red' : 'cyber-badge-green'}>
                        {u.status || 'active'}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-cyber-muted whitespace-nowrap">
                      {u.createdAt ? new Date(u.createdAt).toLocaleDateString() : '—'}
                    </td>
                    <td>
                      {u._id === currentUser?._id ? (
                        <span className="text-xs text-cyber-muted italic">You</span>
                      ) : u.role === 'admin' ? (
                        <span className="text-xs text-cyber-muted">—</span>
                      ) : u.status === 'suspended' ? (
                        <button
                          onClick={() => handleStatusChange(u._id, 'active', u.name)}
                          disabled={actionLoading === u._id}
                          className="cyber-btn-success text-xs px-3 py-1.5">
                          {actionLoading === u._id ? '...' : <><UserCheck className="w-3.5 h-3.5" />Reactivate</>}
                        </button>
                      ) : (
                        <button
                          onClick={() => handleStatusChange(u._id, 'suspended', u.name)}
                          disabled={actionLoading === u._id}
                          className="cyber-btn-danger text-xs px-3 py-1.5">
                          {actionLoading === u._id ? '...' : <><UserX className="w-3.5 h-3.5" />Suspend</>}
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-5 py-2.5 border-t border-cyber-border bg-cyber-surface text-xs text-cyber-muted font-mono">
            Showing {filtered.length} of {users.length} users
          </div>
        </div>
      )}
    </div>
  );
};

export default AdminUsers;
