import React, { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { Zap, Trophy, Users, Calendar, ArrowRight, Target, Globe, ShieldCheck } from 'lucide-react';
import api from '../services/api';

const GAME_ICONS = { valorant: '🎯', cs2: '💣', 'counter-strike': '💣', 'dota 2': '⚔️', dota: '⚔️', fifa: '⚽', 'ea sports fc': '⚽' };
const getIcon = (game) => {
  if (!game) return '🎮';
  const g = game.toLowerCase();
  return Object.entries(GAME_ICONS).find(([k]) => g.includes(k))?.[1] ?? '🎮';
};

const statusMap = {
  upcoming: { label: 'Upcoming', cls: 'cyber-badge-yellow' },
  registration_open: { label: 'Registration Open', cls: 'cyber-badge-green' },
  registration_closed: { label: 'Reg Closed', cls: 'cyber-badge-gray' },
  ongoing: { label: 'Live', cls: 'cyber-badge-cyan' },
  completed: { label: 'Ended', cls: 'cyber-badge-gray' },
  cancelled: { label: 'Cancelled', cls: 'cyber-badge-red' },
};

const Home = () => {
  const [featured, setFeatured] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    api.get('/tournaments').then(({ data }) => {
      setFeatured(data.filter(t => !['completed', 'cancelled'].includes(t.status)).slice(0, 3));
    }).catch(() => {}).finally(() => setLoading(false));
  }, []);

  return (
    <div className="space-y-20">

      {/* ─── HERO ─────────────────────────────────────────────────── */}
      <section className="relative bg-hero-gradient bg-dots bg-dots min-h-[520px] flex items-center overflow-hidden rounded-2xl">
        <div className="relative z-10 max-w-3xl">
          <div className="inline-flex items-center gap-2 cyber-badge-purple mb-6 text-xs py-1.5 px-3">
            <Zap className="w-3 h-3" />
            <span className="font-mono">ESPORTIFY — NOW LIVE</span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black leading-[1.05] tracking-tight mb-6">
            <span className="text-cyber-text">COMPETE.</span><br />
            <span className="text-cyber-purple">WIN.</span>{' '}
            <span className="text-cyber-cyan">DOMINATE.</span>
          </h1>

          <p className="text-cyber-muted text-lg max-w-xl mb-8 leading-relaxed">
            The centralized esports tournament platform. Form 5-player teams, send invitations, track registrations — all in one place.
          </p>

          <div className="flex flex-wrap gap-4">
            <Link to="/tournaments" className="cyber-btn-primary px-7 py-3 text-sm">
              <Trophy className="w-4 h-4" />
              Browse Tournaments
              <ArrowRight className="w-4 h-4" />
            </Link>
            <Link to="/register" className="cyber-btn-cyan px-7 py-3 text-sm">
              <Users className="w-4 h-4" />
              Get Started Free
            </Link>
          </div>

          {/* Stats row */}
          <div className="flex flex-wrap gap-8 mt-10 pt-8 border-t border-cyber-border/50">
            {[
              { val: '5-Player', label: 'Team Format' },
              { val: 'Real-time', label: 'Invitations' },
              { val: 'Instant', label: 'Status Tracking' },
            ].map(s => (
              <div key={s.label}>
                <p className="pixel-heading text-cyber-purple text-xs">{s.val}</p>
                <p className="text-cyber-muted text-xs mt-1">{s.label}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ─── HOW IT WORKS ──────────────────────────────────────────── */}
      <section>
        <div className="text-center mb-12">
          <p className="pixel-heading text-cyber-cyan text-xs mb-3">THE WORKFLOW</p>
          <h2 className="text-3xl font-black text-cyber-text">How Esportify Works</h2>
        </div>
        <div className="grid md:grid-cols-3 gap-6">
          {[
            { icon: ShieldCheck, step: '01', title: 'Create Account & Get Player ID', desc: 'Sign up as a Participant and receive your unique Player ID (e.g. ESP-10001) instantly.', color: 'text-cyber-purple' },
            { icon: Users, step: '02', title: 'Create Team & Invite Players', desc: 'Search players by ID or username, send invitations, and form your 5-player squad.', color: 'text-cyber-cyan' },
            { icon: Trophy, step: '03', title: 'Register & Compete', desc: 'Once 5 players accept, the Team Leader submits the registration for organizer approval.', color: 'text-cyber-magenta' },
          ].map(({ icon: Icon, step, title, desc, color }) => (
            <div key={step} className="cyber-card p-6 hover:border-cyber-purple/50 transition-all group">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <div className={`pixel-heading text-3xl ${color} mb-2`}>{step}</div>
                  <Icon className={`w-6 h-6 ${color}`} />
                </div>
                <div>
                  <h3 className="font-bold text-cyber-text mb-2 leading-snug">{title}</h3>
                  <p className="text-cyber-muted text-sm leading-relaxed">{desc}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ─── FEATURED TOURNAMENTS ──────────────────────────────────── */}
      <section>
        <div className="flex justify-between items-end mb-8">
          <div>
            <p className="pixel-heading text-cyber-purple text-xs mb-2">LIVE EVENTS</p>
            <h2 className="text-3xl font-black text-cyber-text">Featured Tournaments</h2>
          </div>
          <Link to="/tournaments" className="cyber-btn-outline text-xs px-4 py-2 hidden sm:flex">
            View All <ArrowRight className="w-4 h-4" />
          </Link>
        </div>

        {loading ? (
          <div className="grid md:grid-cols-3 gap-6">
            {[1,2,3].map(i => (
              <div key={i} className="cyber-card animate-pulse">
                <div className="h-40 bg-cyber-surface border-b border-cyber-border"></div>
                <div className="p-5 space-y-3">
                  <div className="h-4 bg-cyber-surface rounded w-3/4"></div>
                  <div className="h-3 bg-cyber-surface rounded w-1/2"></div>
                </div>
              </div>
            ))}
          </div>
        ) : featured.length === 0 ? (
          <div className="cyber-card p-12 text-center">
            <span className="text-5xl mb-4 block">🎮</span>
            <p className="font-bold text-cyber-muted">No upcoming tournaments yet. Check back soon.</p>
          </div>
        ) : (
          <div className="grid md:grid-cols-3 gap-6">
            {featured.map(t => {
              const s = statusMap[t.status] || { label: t.status, cls: 'cyber-badge-gray' };
              return (
                <Link key={t._id} to={`/tournaments/${t._id}`}
                  className="cyber-card hover:border-cyber-purple/50 hover:shadow-neon-purple hover:-translate-y-1 transition-all group flex flex-col">
                  <div className="h-40 bg-cyber-surface border-b border-cyber-border relative flex items-center justify-center overflow-hidden">
                    {t.bannerUrl ? (
                      <img src={t.bannerUrl} alt={t.name} className="w-full h-full object-cover opacity-60 group-hover:opacity-80 transition-opacity" />
                    ) : (
                      <span className="text-5xl opacity-30">{getIcon(t.game)}</span>
                    )}
                    <div className="absolute inset-0 bg-gradient-to-t from-cyber-card to-transparent"></div>
                    <div className="absolute top-3 left-3">
                      <span className={`cyber-badge ${s.cls}`}>{s.label}</span>
                    </div>
                    <div className="absolute top-3 right-3">
                      <span className="cyber-badge-gray">{t.format}</span>
                    </div>
                  </div>
                  <div className="p-5 flex-1 flex flex-col">
                    <p className="text-xs font-mono text-cyber-cyan mb-1 uppercase">{t.game}</p>
                    <h3 className="font-black text-cyber-text text-lg leading-snug mb-3 line-clamp-2 group-hover:text-cyber-purple transition-colors">
                      {t.name}
                    </h3>
                    <div className="space-y-1.5 text-xs text-cyber-muted mb-4">
                      <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />{new Date(t.startDate).toLocaleDateString()}</div>
                      <div className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5" />{t.prizePool || 'TBA'}</div>
                      <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />Max {t.capacity} teams</div>
                    </div>
                    <div className="mt-auto pt-3 border-t border-cyber-border/50 text-xs text-cyber-purple font-semibold tracking-wide">
                      VIEW DETAILS →
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </section>

      {/* ─── GAMES ──────────────────────────────────────────────────── */}
      <section className="cyber-card p-8">
        <div className="text-center mb-8">
          <p className="pixel-heading text-cyber-magenta text-xs mb-2">ARENAS</p>
          <h2 className="text-2xl font-black text-cyber-text">Supported Games</h2>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-4">
          {[
            { name: 'Valorant', icon: '🎯', color: 'hover:border-red-500/50' },
            { name: 'CS2', icon: '💣', color: 'hover:border-orange-500/50' },
            { name: 'Dota 2', icon: '⚔️', color: 'hover:border-yellow-500/50' },
            { name: 'FIFA / EA FC', icon: '⚽', color: 'hover:border-green-500/50' },
            { name: 'More Games', icon: '🎮', color: 'hover:border-cyber-purple/50' },
          ].map(g => (
            <Link
              key={g.name}
              to={`/tournaments?game=${encodeURIComponent(g.name)}`}
              className={`cyber-card p-4 text-center border border-cyber-border ${g.color} hover:shadow-neon-purple transition-all group`}
            >
              <div className="text-3xl mb-2">{g.icon}</div>
              <p className="text-xs font-bold text-cyber-muted group-hover:text-cyber-text transition-colors">{g.name}</p>
            </Link>
          ))}
        </div>
      </section>
    </div>
  );
};

export default Home;
