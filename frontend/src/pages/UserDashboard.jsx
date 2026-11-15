import React, { useContext, useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';
import {
  Trophy, ClipboardList, CheckCircle, Clock, Users, Bell, Zap,
  AlertCircle, ArrowRight, Shield
} from 'lucide-react';

const regStatusMap = {
  pending: 'cyber-badge-yellow',
  approved: 'cyber-badge-green',
  rejected: 'cyber-badge-red',
  cancelled: 'cyber-badge-gray',
  withdrawn: 'cyber-badge-gray',
};

// ── Defined OUTSIDE UserDashboard so it never gets recreated on re-render ──
const StatCard = ({ icon: Icon, label, value, color, bg, loading }) => (
  <div className={`cyber-card p-5 border-t-2 ${color}`}>
    <div className="flex items-start justify-between">
      <div>
        <p className="text-xs text-cyber-muted uppercase tracking-widest mb-2">{label}</p>
        {loading
          ? <div className="h-8 w-16 bg-cyber-surface animate-pulse rounded"></div>
          : <p className={`text-4xl font-black ${bg}`}>{value}</p>}
      </div>
      <div className={`p-2.5 ${bg === 'text-cyber-text' ? 'bg-cyber-surface' : ''}`}>
        <Icon className={`w-6 h-6 ${bg}`} />
      </div>
    </div>
  </div>
);

const UserDashboard = () => {
  const { user } = useContext(AuthContext);
  const [registrations, setRegistrations] = useState([]);
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    Promise.allSettled([
      api.get('/registrations/me'),
      api.get('/teams/my'),
    ]).then(([regRes, teamRes]) => {
      if (regRes.status === 'fulfilled') setRegistrations(regRes.value.data || []);
      if (teamRes.status === 'fulfilled') setTeams(teamRes.value.data || []);
    }).finally(() => setLoading(false));
  }, []);

  const total    = registrations.length;
  const pending  = registrations.filter(r => r.status === 'pending').length;
  const approved = registrations.filter(r => r.status === 'approved').length;
  const recent   = [...registrations].sort((a, b) => new Date(b.createdAt) - new Date(a.createdAt)).slice(0, 5);

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-cyber-border pb-6">
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-2">PARTICIPANT HQ</p>
          <h1 className="text-3xl font-black text-cyber-text">
            Welcome, <span className="text-cyber-cyan">{user?.name || 'Player'}</span>
          </h1>
          {user?.playerId && (
            <div className="mt-2 inline-flex items-center gap-2 cyber-badge-purple text-xs py-1.5 px-3">
              <Shield className="w-3 h-3" />
              Player ID: <span className="font-mono font-bold">{user.playerId}</span>
            </div>
          )}
          {user?.username && (
            <p className="text-cyber-muted text-sm mt-1 font-mono">@{user.username}</p>
          )}
        </div>
        <div className="flex gap-3">
          <Link to="/tournaments" className="cyber-btn-cyan text-xs px-4 py-2">
            <Trophy className="w-3.5 h-3.5" /> Browse Events
          </Link>
          <Link to="/dashboard/notifications" className="cyber-btn-ghost text-xs px-4 py-2 relative">
            <Bell className="w-3.5 h-3.5" />
            {user?.unreadNotifications > 0 && (
              <span className="absolute -top-1 -right-1 bg-cyber-red text-white text-[9px] font-bold rounded-full w-4 h-4 flex items-center justify-center">
                {user.unreadNotifications}
              </span>
            )}
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        <StatCard icon={ClipboardList} label="Total Registrations" value={total} color="border-cyber-purple" bg="text-cyber-text" loading={loading} />
        <StatCard icon={Clock} label="Pending" value={pending} color="border-cyber-yellow" bg="text-cyber-yellow" loading={loading} />
        <StatCard icon={CheckCircle} label="Approved" value={approved} color="border-cyber-green" bg="text-cyber-green" loading={loading} />
      </div>

      {/* Quick Actions */}
      <div className="grid sm:grid-cols-3 gap-4">
        {[
          { to: '/dashboard/teams', icon: Users, label: 'My Teams', desc: `${teams.length} team${teams.length !== 1 ? 's' : ''}`, color: 'text-cyber-purple', border: 'hover:border-cyber-purple/50' },
          { to: '/dashboard/invitations', icon: Bell, label: 'Invitations', desc: 'View incoming invites', color: 'text-cyber-cyan', border: 'hover:border-cyber-cyan/50' },
          { to: '/dashboard/registrations', icon: ClipboardList, label: 'Registrations', desc: 'Track your status', color: 'text-cyber-magenta', border: 'hover:border-cyber-magenta/50' },
        ].map(({ to, icon: Icon, label, desc, color, border }) => (
          <Link key={to} to={to}
            className={`cyber-card p-5 group transition-all ${border} hover:shadow-neon-purple`}>
            <Icon className={`w-6 h-6 ${color} mb-3 group-hover:scale-110 transition-transform`} />
            <p className="font-bold text-cyber-text text-sm">{label}</p>
            <p className="text-xs text-cyber-muted mt-0.5">{desc}</p>
            <p className={`text-xs ${color} mt-2 font-semibold`}>Go →</p>
          </Link>
        ))}
      </div>

      {/* Recent Registrations */}
      <div className="cyber-card overflow-hidden">
        <div className="px-5 py-3.5 border-b border-cyber-border flex justify-between items-center bg-cyber-surface">
          <h2 className="font-black text-cyber-text text-sm flex items-center gap-2">
            <Zap className="w-4 h-4 text-cyber-purple" /> Recent Registrations
          </h2>
          <Link to="/dashboard/registrations" className="text-xs text-cyber-purple hover:text-cyber-purple-bright font-semibold">
            View All →
          </Link>
        </div>

        {loading ? (
          <div className="p-5 space-y-3">
            {[1,2,3].map(i => <div key={i} className="h-10 bg-cyber-surface animate-pulse"></div>)}
          </div>
        ) : recent.length === 0 ? (
          <div className="p-10 text-center">
            <Trophy className="w-10 h-10 text-cyber-purple/30 mx-auto mb-3" />
            <p className="text-cyber-muted text-sm mb-4">No registrations yet. Find a tournament!</p>
            <Link to="/tournaments" className="cyber-btn-primary text-xs px-5 py-2">
              Browse Tournaments <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="cyber-table">
              <thead>
                <tr>
                  <th>Team Name</th>
                  <th>Tournament</th>
                  <th>Status</th>
                  <th>Date</th>
                </tr>
              </thead>
              <tbody>
                {recent.map(reg => (
                  <tr key={reg._id}>
                    <td className="font-bold text-cyber-text">{reg.teamName || reg.team?.name || '—'}</td>
                    <td>
                      {reg.tournament ? (
                        <Link to={`/tournaments/${reg.tournament._id || reg.tournament}`}
                          className="text-cyber-purple hover:text-cyber-purple-bright transition-colors">
                          {reg.tournament.name || '—'}
                        </Link>
                      ) : '—'}
                    </td>
                    <td>
                      <span className={`cyber-badge ${regStatusMap[reg.status] || 'cyber-badge-gray'}`}>
                        {reg.status}
                      </span>
                    </td>
                    <td className="font-mono text-xs text-cyber-muted">
                      {reg.createdAt ? new Date(reg.createdAt).toLocaleDateString() : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

export default UserDashboard;
