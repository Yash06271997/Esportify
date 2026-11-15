import React, { useContext } from 'react';
import { Outlet, Link, useLocation, Navigate } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import {
  LayoutDashboard, Trophy, Plus, Users, Mail, ClipboardList,
  Bell, Settings, ShieldCheck, BarChart3, UserCog, Zap, UserPlus,
} from 'lucide-react';

const DashboardLayout = ({ roleRequired }) => {
  const { user, loading } = useContext(AuthContext);
  const location = useLocation();

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="text-center">
        <div className="w-8 h-8 border-2 border-violet-200 border-t-violet-600 rounded-full animate-spin mx-auto mb-3" />
        <p className="text-sm text-slate-500">Loading...</p>
      </div>
    </div>
  );

  if (!user) return <Navigate to="/login" state={{ from: location }} replace />;

  if (roleRequired === 'organizer' && user.role !== 'organizer' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  if (roleRequired === 'admin' && user.role !== 'admin') {
    return <Navigate to="/" replace />;
  }
  if (roleRequired === 'user' && user.role !== 'user') {
    return <Navigate to={user.role === 'admin' ? '/admin' : '/organizer'} replace />;
  }

  const userNavItems = [
    { label: 'Overview',       path: '/dashboard',                  icon: LayoutDashboard, exact: true },
    { label: 'My Teams',       path: '/dashboard/teams',            icon: Users },
    { label: 'Join Requests',  path: '/dashboard/join-requests',    icon: UserPlus },
    { label: 'Invitations',    path: '/dashboard/invitations',      icon: Mail },
    { label: 'Registrations',  path: '/dashboard/registrations',    icon: ClipboardList },
    { label: 'Notifications',  path: '/dashboard/notifications',    icon: Bell },
    { label: 'Profile',        path: '/dashboard/profile',          icon: Settings },
  ];

  const organizerNavItems = [
    { label: 'Overview',          path: '/organizer',                  icon: LayoutDashboard, exact: true },
    { label: 'My Tournaments',    path: '/organizer/tournaments',      icon: Trophy },
    { label: 'Create Tournament', path: '/organizer/tournaments/new',  icon: Plus },
    { label: 'Profile',           path: '/organizer/profile',          icon: Settings },
  ];

  const adminNavItems = [
    { label: 'Overview',       path: '/admin',                icon: BarChart3, exact: true },
    { label: 'Users',          path: '/admin/users',          icon: UserCog },
    { label: 'Tournaments',    path: '/admin/tournaments',    icon: Trophy },
    { label: 'Registrations',  path: '/admin/registrations',  icon: ClipboardList },
    { label: 'Profile',        path: '/admin/profile',        icon: Settings },
  ];

  const navItems =
    user.role === 'admin' ? adminNavItems
    : user.role === 'organizer' ? organizerNavItems
    : userNavItems;

  const roleMeta = {
    admin:     { label: 'Admin',     color: 'bg-red-100 text-red-700 border-red-200',     dot: 'bg-red-500' },
    organizer: { label: 'Organizer', color: 'bg-sky-100 text-sky-700 border-sky-200',     dot: 'bg-sky-500' },
    user:      { label: 'Player',    color: 'bg-violet-100 text-violet-700 border-violet-200', dot: 'bg-violet-500' },
  };
  const meta = roleMeta[user.role] || roleMeta.user;

  const isActive = (item) => {
    if (item.exact) return location.pathname === item.path;
    return location.pathname.startsWith(item.path);
  };

  return (
    <div className="flex flex-col md:flex-row gap-6">
      {/* Sidebar */}
      <aside className="w-full md:w-56 shrink-0">
        <div className="cyber-card p-4 sticky top-20">
          {/* User info */}
          <div className="mb-4 pb-4 border-b border-slate-100">
            <div className="flex items-center gap-2 mb-2">
              <div className={`w-8 h-8 rounded-full flex items-center justify-center ${meta.dot} text-white text-xs font-bold`}>
                {user.name?.[0]?.toUpperCase() || '?'}
              </div>
              <div className="min-w-0">
                <p className="font-bold text-sm text-slate-900 truncate">{user.name}</p>
                {user.username && (
                  <p className="text-xs text-slate-500 truncate">@{user.username}</p>
                )}
              </div>
            </div>
            <span className={`inline-flex items-center gap-1 px-2 py-0.5 text-xs font-semibold rounded-full border ${meta.color}`}>
              <ShieldCheck className="w-3 h-3" />
              {meta.label}
            </span>
            {user.playerId && (
              <p className="text-xs font-mono text-violet-600 mt-1.5 bg-violet-50 px-2 py-0.5 rounded">
                {user.playerId}
              </p>
            )}
          </div>

          {/* Nav items */}
          <nav className="flex flex-col gap-0.5">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = isActive(item);
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  className={`flex items-center gap-2.5 px-3 py-2.5 text-xs font-semibold rounded-lg transition-all duration-150 ${
                    active
                      ? 'bg-violet-50 text-violet-700'
                      : 'text-slate-600 hover:text-slate-900 hover:bg-slate-50'
                  }`}
                >
                  <Icon className={`w-4 h-4 shrink-0 ${active ? 'text-violet-600' : 'text-slate-400'}`} />
                  <span className="truncate">{item.label}</span>
                  {active && <div className="ml-auto w-1.5 h-1.5 rounded-full bg-violet-600" />}
                </Link>
              );
            })}
          </nav>

          {/* Footer */}
          <div className="mt-4 pt-4 border-t border-slate-100">
            <div className="flex items-center gap-1.5 text-slate-400">
              <Zap className="w-3 h-3 text-violet-500" />
              <span className="pixel-heading text-[7px] text-violet-500">Esportify</span>
            </div>
          </div>
        </div>
      </aside>

      {/* Content */}
      <div className="flex-1 min-w-0">
        <Outlet />
      </div>
    </div>
  );
};

export default DashboardLayout;
