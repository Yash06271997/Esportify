import React, { useState, useEffect, useContext } from 'react';
import { Bell, CheckCheck, Users, Trophy, Zap, AlertCircle, Swords } from 'lucide-react';
import api from '../services/api';
import { AuthContext } from '../context/AuthContext';

const iconMap = {
  invitation_received:   { icon: Users,   color: 'text-cyber-cyan' },
  invitation_accepted:   { icon: CheckCheck, color: 'text-cyber-green' },
  invitation_rejected:   { icon: AlertCircle, color: 'text-cyber-red' },
  invitation_cancelled:  { icon: AlertCircle, color: 'text-cyber-muted' },
  registration_submitted:{ icon: Trophy,  color: 'text-cyber-purple' },
  registration_approved: { icon: Trophy,  color: 'text-cyber-green' },
  registration_rejected: { icon: Trophy,  color: 'text-cyber-red' },
  match_result:          { icon: Swords,  color: 'text-cyber-yellow' },
  match_scheduled:       { icon: Zap,     color: 'text-cyber-cyan' },
  tournament_update:     { icon: Zap,     color: 'text-cyber-magenta' },
  default:               { icon: Bell,    color: 'text-cyber-purple' },
};

const Notifications = () => {
  const { updateUser } = useContext(AuthContext);
  const [notifications, setNotifications] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = () => {
    api.get('/notifications')
      .then(({ data }) => setNotifications(data))
      .catch(() => {})
      .finally(() => setLoading(false));
  };

  useEffect(refresh, []);

  const markAllRead = async () => {
    await api.patch('/notifications/read-all').catch(() => {});
    setNotifications(n => n.map(x => ({ ...x, isRead: true })));
    // Update navbar badge count
    updateUser({ unreadNotifications: 0 });
  };

  const markOne = async (id) => {
    await api.patch(`/notifications/${id}/read`).catch(() => {});
    setNotifications(n => n.map(x => x._id === id ? { ...x, isRead: true } : x));
    // Decrement badge
    updateUser(prev => ({
      unreadNotifications: Math.max(0, (prev?.unreadNotifications || 1) - 1),
    }));
  };

  const unread = notifications.filter(n => !n.isRead).length;

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-end border-b border-cyber-border pb-5">
        <div>
          <p className="pixel-heading text-cyber-magenta text-xs mb-2">ALERTS</p>
          <h1 className="text-3xl font-black text-cyber-text flex items-center gap-3">
            Notifications
            {unread > 0 && (
              <span className="bg-cyber-red text-white text-xs font-bold rounded-full px-2 py-0.5">
                {unread}
              </span>
            )}
          </h1>
        </div>
        {unread > 0 && (
          <button onClick={markAllRead} className="cyber-btn-ghost text-xs px-4 py-2">
            <CheckCheck className="w-3.5 h-3.5" /> Mark all read
          </button>
        )}
      </div>

      {loading ? (
        <div className="space-y-3">
          {[1,2,3].map(i => <div key={i} className="cyber-card animate-pulse h-16"></div>)}
        </div>
      ) : notifications.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Bell className="w-10 h-10 text-cyber-purple/30 mx-auto mb-3" />
          <p className="text-cyber-muted text-sm">No notifications yet.</p>
        </div>
      ) : (
        <div className="space-y-2">
          {notifications.map(n => {
            const { icon: Icon, color } = iconMap[n.type] || iconMap.default;
            return (
              <div
                key={n._id}
                onClick={() => !n.isRead && markOne(n._id)}
                className={`cyber-card p-4 flex items-start gap-4 transition-all ${
                  n.isRead
                    ? 'opacity-60'
                    : 'border-cyber-purple/30 hover:border-cyber-purple/60 cursor-pointer'
                }`}
              >
                <div className="shrink-0 p-2 bg-cyber-surface border border-cyber-border mt-0.5">
                  <Icon className={`w-4 h-4 ${color}`} />
                </div>
                <div className="flex-1 min-w-0">
                  <p className={`text-sm ${n.isRead ? 'text-cyber-muted' : 'text-cyber-text font-semibold'}`}>
                    {n.message}
                  </p>
                  <p className="text-[10px] text-cyber-muted/50 font-mono mt-1">
                    {new Date(n.createdAt).toLocaleString()}
                  </p>
                </div>
                {!n.isRead && (
                  <div className="shrink-0 w-2 h-2 bg-cyber-purple rounded-full mt-1.5 shadow-neon-purple"></div>
                )}
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default Notifications;
