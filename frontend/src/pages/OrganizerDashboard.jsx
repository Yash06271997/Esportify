import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import { Trophy, PlusCircle, Calendar, Settings, AlertCircle, Layers, Users, ArrowRight } from 'lucide-react';

const statusMap = {
  upcoming:            { label: 'Upcoming', cls: 'cyber-badge-yellow' },
  registration_open:   { label: 'Open', cls: 'cyber-badge-green' },
  registration_closed: { label: 'Reg Closed', cls: 'cyber-badge-gray' },
  ongoing:             { label: 'Live', cls: 'cyber-badge-cyan' },
  completed:           { label: 'Ended', cls: 'cyber-badge-gray' },
  cancelled:           { label: 'Cancelled', cls: 'cyber-badge-red' },
};

const OrganizerDashboard = () => {
  const { user } = useContext(AuthContext);
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading]         = useState(true);
  const [error, setError]             = useState(null);

  useEffect(() => {
    api.get('/tournaments/my')
      .then(({ data }) => setTournaments(Array.isArray(data) ? data : []))
      .catch(() => setError('Failed to load tournaments.'))
      .finally(() => setLoading(false));
  }, [user]);

  const total     = tournaments.length;
  const active    = tournaments.filter(t => ['upcoming', 'registration_open', 'ongoing'].includes(t.status)).length;
  const completed = tournaments.filter(t => t.status === 'completed').length;
  const recent    = [...tournaments].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4 border-b border-cyber-border pb-6">
        <div>
          <p className="pixel-heading text-cyber-cyan text-xs mb-2">CONTROL CENTER</p>
          <h1 className="text-3xl font-black text-cyber-text flex items-center gap-3">
            <Layers className="w-7 h-7 text-cyber-cyan" /> Organizer Dashboard
          </h1>
          <p className="text-cyber-muted text-sm mt-1">Manage your tournaments and registrations.</p>
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

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {[
          { label: 'Total Tournaments', value: total,     border: 'border-t-cyber-purple', textColor: 'text-cyber-text' },
          { label: 'Active / Open',     value: active,    border: 'border-t-cyber-cyan',   textColor: 'text-cyber-cyan' },
          { label: 'Completed',         value: completed, border: 'border-t-cyber-green',  textColor: 'text-cyber-green' },
        ].map(({ label, value, border, textColor }) => (
          <div key={label} className={`cyber-card p-5 border-t-2 ${border}`}>
            <p className="text-xs text-cyber-muted uppercase tracking-widest mb-2">{label}</p>
            {loading
              ? <div className="h-10 w-16 bg-cyber-surface animate-pulse rounded"></div>
              : <p className={`text-5xl font-black ${textColor}`}>{value}</p>}
          </div>
        ))}
      </div>

      {/* Quick links */}
      <div className="grid sm:grid-cols-2 gap-4">
        <Link to="/organizer/tournaments" className="cyber-card p-5 hover:border-cyber-purple/50 hover:shadow-neon-purple transition-all group flex items-center gap-4">
          <Trophy className="w-6 h-6 text-cyber-purple group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-bold text-cyber-text">My Tournaments</p>
            <p className="text-xs text-cyber-muted">View & manage all tournaments</p>
          </div>
          <ArrowRight className="w-4 h-4 text-cyber-muted ml-auto" />
        </Link>
        <Link to="/organizer/tournaments/new" className="cyber-card p-5 hover:border-cyber-cyan/50 hover:shadow-neon-cyan transition-all group flex items-center gap-4">
          <PlusCircle className="w-6 h-6 text-cyber-cyan group-hover:scale-110 transition-transform" />
          <div>
            <p className="font-bold text-cyber-text">Create Tournament</p>
            <p className="text-xs text-cyber-muted">Set up a new event</p>
          </div>
          <ArrowRight className="w-4 h-4 text-cyber-muted ml-auto" />
        </Link>
      </div>

      {/* Recent Tournaments */}
      <div className="cyber-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-cyber-border bg-cyber-surface flex justify-between items-center">
          <h2 className="font-black text-cyber-text text-sm flex items-center gap-2">
            <Trophy className="w-4 h-4 text-cyber-purple" /> Recent Tournaments
          </h2>
          <Link to="/organizer/tournaments" className="text-xs text-cyber-purple font-semibold">View All →</Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-14 bg-cyber-surface animate-pulse"></div>)}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-12 text-center">
            <Trophy className="w-10 h-10 text-cyber-purple/20 mx-auto mb-4" />
            <h2 className="text-xl font-black text-cyber-text mb-2">No Tournaments Yet</h2>
            <p className="text-cyber-muted text-sm mb-5">Create your first tournament to start accepting registrations!</p>
            <Link to="/organizer/tournaments/new" className="cyber-btn-primary text-sm px-6 py-2.5">
              <PlusCircle className="w-4 h-4" /> Create Tournament
            </Link>
          </div>
        ) : (
          <div className="divide-y divide-cyber-border">
            {recent.map(t => {
              const s = statusMap[t.status] || { label: t.status, cls: 'cyber-badge-gray' };
              return (
                <div key={t._id}
                  className="px-5 py-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:bg-cyber-surface/50 transition-colors">
                  <div className="flex-1 min-w-0">
                    <div className="flex items-center gap-2 flex-wrap mb-1">
                      <h3 className="font-black text-cyber-text text-sm truncate">{t.name}</h3>
                      <span className={`cyber-badge ${s.cls}`}>{s.label}</span>
                    </div>
                    <p className="text-xs text-cyber-muted flex items-center gap-1.5">
                      <Calendar className="w-3 h-3" />
                      {t.startDate ? new Date(t.startDate).toLocaleDateString() : 'No date set'}
                      &nbsp;·&nbsp; {t.game}
                    </p>
                  </div>
                  <div className="flex items-center gap-2">
                    <Link to={`/organizer/tournaments/${t._id}/registrations`}
                      className="cyber-btn-cyan text-xs px-3 py-1.5">
                      <Users className="w-3.5 h-3.5" /> Registrations
                    </Link>
                    <Link to={`/organizer/tournaments/${t._id}/edit`}
                      className="cyber-btn-ghost text-xs px-3 py-1.5">
                      <Settings className="w-3.5 h-3.5" /> Edit
                    </Link>
                  </div>
                </div>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
};

export default OrganizerDashboard;
