import React, { useEffect, useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { PlusCircle, Edit2, Trash2, Trophy, Calendar, Users, AlertCircle, Swords } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const statusMap = {
  upcoming:            { label: 'Upcoming', cls: 'cyber-badge-yellow' },
  registration_open:   { label: 'Open', cls: 'cyber-badge-green' },
  registration_closed: { label: 'Reg Closed', cls: 'cyber-badge-gray' },
  ongoing:             { label: 'Live', cls: 'cyber-badge-cyan' },
  completed:           { label: 'Ended', cls: 'cyber-badge-gray' },
  cancelled:           { label: 'Cancelled', cls: 'cyber-badge-red' },
};

const MyTournaments = () => {
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState('');
  const [deletingId, setDeletingId]   = useState(null);

  const refresh = async () => {
    setLoading(true);
    setError('');
    try {
      // Use the /my endpoint which filters by authenticated organizer
      const { data } = await api.get('/tournaments/my');
      setTournaments(Array.isArray(data) ? data : []);
    } catch {
      setError('Failed to load tournaments.');
    }
    setLoading(false);
  };

  useEffect(() => { if (user) refresh(); }, [user]);

  const handleDelete = async (id, name) => {
    if (!window.confirm(`Delete "${name}"? This cannot be undone.`)) return;
    setDeletingId(id);
    try {
      await api.delete(`/tournaments/${id}`);
      await refresh();
    } catch (err) {
      alert(err?.response?.data?.message || 'Failed to delete tournament.');
    }
    setDeletingId(null);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cyber-border pb-5">
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-2">YOUR EVENTS</p>
          <h1 className="text-3xl font-black text-cyber-text">My Tournaments</h1>
        </div>
        <Link to="/organizer/tournaments/new" className="cyber-btn-primary text-sm px-5 py-2.5 self-start sm:self-auto">
          <PlusCircle className="w-4 h-4" /> Create Tournament
        </Link>
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
      ) : tournaments.length === 0 ? (
        <div className="cyber-card p-14 text-center">
          <Trophy className="w-14 h-14 text-cyber-purple/20 mx-auto mb-4" />
          <h2 className="text-xl font-black text-cyber-text mb-2">No Tournaments Yet</h2>
          <p className="text-cyber-muted text-sm mb-6">Create your first tournament to get started!</p>
          <Link to="/organizer/tournaments/new" className="cyber-btn-primary text-sm px-6 py-2.5">
            <PlusCircle className="w-4 h-4" /> Create Tournament
          </Link>
        </div>
      ) : (
        <div className="cyber-card overflow-hidden">
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>#</th>
                  <th>Tournament</th>
                  <th>Status</th>
                  <th>Registrations</th>
                  <th>Start Date</th>
                  <th>Actions</th>
                </tr>
              </thead>
              <tbody>
                {tournaments.map((t, idx) => {
                  const s = statusMap[t.status] || { label: t.status, cls: 'cyber-badge-gray' };
                  return (
                    <tr key={t._id}>
                      <td className="text-cyber-muted font-mono">{idx + 1}</td>
                      <td>
                        <Link to={`/tournaments/${t._id}`}
                          className="font-bold text-cyber-text hover:text-cyber-purple transition-colors">
                          {t.name}
                        </Link>
                        {t.game && <p className="text-xs text-cyber-muted uppercase mt-0.5">{t.game}</p>}
                      </td>
                      <td><span className={`cyber-badge ${s.cls}`}>{s.label}</span></td>
                      <td>
                        <span className="text-xs font-mono text-cyber-cyan">
                          {t.activeRegistrations ?? 0} / {t.capacity}
                        </span>
                      </td>
                      <td className="font-mono text-xs text-cyber-muted whitespace-nowrap">
                        {t.startDate ? new Date(t.startDate).toLocaleDateString() : '—'}
                      </td>
                      <td>
                        <div className="flex items-center gap-2 flex-wrap">
                          <Link to={`/organizer/tournaments/${t._id}/registrations`}
                            className="cyber-btn-cyan text-xs px-3 py-1.5">
                            <Users className="w-3 h-3" /> Registrations
                          </Link>
                          <Link to={`/organizer/tournaments/${t._id}/bracket`}
                            className="cyber-btn-outline text-xs px-3 py-1.5">
                            <Swords className="w-3 h-3" /> Bracket
                          </Link>
                          <Link to={`/organizer/tournaments/${t._id}/edit`}
                            className="cyber-btn-ghost text-xs px-3 py-1.5">
                            <Edit2 className="w-3 h-3" /> Edit
                          </Link>
                          <button onClick={() => handleDelete(t._id, t.name)}
                            disabled={deletingId === t._id}
                            className="cyber-btn-danger text-xs px-3 py-1.5">
                            {deletingId === t._id
                              ? '...'
                              : <><Trash2 className="w-3 h-3" /> Delete</>}
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </div>
      )}

      {!loading && tournaments.length > 0 && (
        <p className="text-xs text-cyber-muted font-mono">
          {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} total
        </p>
      )}
    </div>
  );
};

export default MyTournaments;
