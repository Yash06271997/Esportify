import React, { useEffect, useState, useContext } from 'react';
import { Link } from 'react-router-dom';
import {
  Users, UserCheck, UserCog, Trophy, CalendarClock, Swords,
  CheckCircle2, ClipboardList, Clock4, ArrowRight, LayoutDashboard, AlertCircle, Zap
} from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const AdminDashboard = () => {
  const { user } = useContext(AuthContext);
  const [stats, setStats]   = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError]   = useState('');

  useEffect(() => {
    api.get('/admin/stats')
      .then(({ data }) => setStats(data))
      .catch(err => setError(err?.response?.data?.message || 'Failed to load admin stats.'))
      .finally(() => setLoading(false));
  }, []);

  const statCards = [
    { label: 'Total Users',           value: stats?.totalUsers,            color: 'border-t-cyber-purple', textColor: 'text-cyber-text' },
    { label: 'Participants',          value: stats?.totalParticipants,      color: 'border-t-cyber-cyan',   textColor: 'text-cyber-cyan' },
    { label: 'Organizers',           value: stats?.totalOrganizers,        color: 'border-t-cyber-magenta', textColor: 'text-cyber-magenta' },
    { label: 'Total Tournaments',    value: stats?.totalTournaments,       color: 'border-t-cyber-yellow',  textColor: 'text-cyber-yellow' },
    { label: 'Upcoming',             value: stats?.upcomingTournaments,    color: 'border-t-cyber-purple',  textColor: 'text-cyber-text' },
    { label: 'Ongoing',              value: stats?.ongoingTournaments,     color: 'border-t-cyber-green',   textColor: 'text-cyber-green' },
    { label: 'Completed',            value: stats?.completedTournaments,   color: 'border-t-cyber-muted',   textColor: 'text-cyber-muted' },
    { label: 'Total Registrations',  value: stats?.totalRegistrations,     color: 'border-t-cyber-cyan',    textColor: 'text-cyber-cyan' },
    { label: 'Pending Registrations',value: stats?.pendingRegistrations,   color: 'border-t-cyber-red',     textColor: 'text-cyber-red' },
  ];

  const quickLinks = [
    { title: 'Manage Users',          desc: 'View, suspend or reactivate accounts.',         to: '/admin/users',          color: 'text-cyber-purple' },
    { title: 'Manage Tournaments',    desc: 'Browse all tournaments across the platform.',    to: '/admin/tournaments',    color: 'text-cyber-cyan' },
    { title: 'Manage Registrations', desc: 'Review and approve team registrations.',         to: '/admin/registrations',  color: 'text-cyber-green' },
  ];

  return (
    <div className="space-y-8">
      {/* Header */}
      <div className="flex items-center gap-4 border-b border-cyber-border pb-6">
        <div className="bg-cyber-purple/20 border border-cyber-purple/40 p-3">
          <LayoutDashboard className="w-6 h-6 text-cyber-purple" />
        </div>
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-1">COMMAND CENTER</p>
          <h1 className="text-3xl font-black text-cyber-text">Admin Dashboard</h1>
          <p className="text-cyber-muted text-sm">
            Welcome, <span className="text-cyber-cyan font-bold">{user?.name || 'Admin'}</span>. Here's the platform overview.
          </p>
        </div>
      </div>

      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {/* Stats */}
      <div>
        <p className="text-xs text-cyber-muted uppercase tracking-widest mb-4 font-mono">Platform Statistics</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {loading
            ? Array.from({ length: 9 }).map((_, i) => (
                <div key={i} className="cyber-card animate-pulse h-20"></div>
              ))
            : statCards.map(({ label, value, color, textColor }) => (
                <div key={label} className={`cyber-card p-4 border-t-2 ${color}`}>
                  <p className="text-xs text-cyber-muted uppercase tracking-wider mb-1.5 leading-tight">{label}</p>
                  <p className={`text-3xl font-black ${textColor}`}>{value ?? 0}</p>
                </div>
              ))}
        </div>
      </div>

      {/* Quick Nav */}
      <div>
        <p className="text-xs text-cyber-muted uppercase tracking-widest mb-4 font-mono">Quick Navigation</p>
        <div className="grid md:grid-cols-3 gap-4">
          {quickLinks.map(({ title, desc, to, color }) => (
            <Link key={to} to={to}
              className="cyber-card p-5 hover:border-cyber-purple/50 hover:shadow-neon-purple transition-all group flex items-center justify-between gap-4">
              <div>
                <p className={`font-black text-sm ${color} mb-1`}>{title}</p>
                <p className="text-xs text-cyber-muted">{desc}</p>
              </div>
              <ArrowRight className="w-5 h-5 text-cyber-muted group-hover:text-cyber-purple transition-colors shrink-0" />
            </Link>
          ))}
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;
