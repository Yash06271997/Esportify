import React, { useState, useEffect } from 'react';
import { Link, useSearchParams } from 'react-router-dom';
import { Search, Filter, Calendar, Trophy, Users, X } from 'lucide-react';
import api from '../services/api';

const GAMES = ['', 'Valorant', 'CS2', 'Counter-Strike', 'Dota 2', 'FIFA', 'EA SPORTS FC'];
const STATUSES = ['', 'upcoming', 'registration_open', 'ongoing', 'completed', 'cancelled'];

const statusMap = {
  upcoming: { label: 'Upcoming', cls: 'cyber-badge-yellow' },
  registration_open: { label: 'Open', cls: 'cyber-badge-green' },
  registration_closed: { label: 'Closed', cls: 'cyber-badge-gray' },
  ongoing: { label: 'Live', cls: 'cyber-badge-cyan' },
  completed: { label: 'Ended', cls: 'cyber-badge-gray' },
  cancelled: { label: 'Cancelled', cls: 'cyber-badge-red' },
};

const getIcon = (game) => {
  if (!game) return '🎮';
  const g = game.toLowerCase();
  if (g.includes('valorant')) return '🎯';
  if (g.includes('cs') || g.includes('counter')) return '💣';
  if (g.includes('dota')) return '⚔️';
  if (g.includes('fifa') || g.includes('fc') || g.includes('ea')) return '⚽';
  return '🎮';
};

const TournamentList = () => {
  const [searchParams] = useSearchParams();
  const [tournaments, setTournaments] = useState([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState(searchParams.get('name') || '');
  const [game, setGame] = useState(searchParams.get('game') || '');
  const [status, setStatus] = useState(searchParams.get('status') || '');

  useEffect(() => {
    const t = setTimeout(fetchTournaments, 400);
    return () => clearTimeout(t);
  }, [search, game, status]);

  const fetchTournaments = async () => {
    setLoading(true);
    try {
      const params = new URLSearchParams();
      if (status) params.append('status', status);
      if (search) params.append('name', search);
      if (game) params.append('game', game);
      const { data } = await api.get(`/tournaments?${params}`);
      setTournaments(data);
    } catch {}
    setLoading(false);
  };

  const hasFilters = search || game || status;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="border-b border-cyber-border pb-6">
        <p className="pixel-heading text-cyber-cyan text-xs mb-2">EVENTS</p>
        <h1 className="text-4xl font-black text-cyber-text">Tournaments</h1>
        <p className="text-cyber-muted mt-1">Discover and join competitive events.</p>
      </div>

      {/* Game Quick Filters */}
      <div className="flex flex-wrap gap-2">
        {['', 'Valorant', 'CS2', 'Dota 2', 'FIFA'].map(g => (
          <button key={g || 'all'} onClick={() => setGame(g)}
            className={`text-xs px-3 py-1.5 border font-semibold transition-all ${
              game === g
                ? 'bg-cyber-purple border-cyber-purple text-white shadow-neon-purple'
                : 'border-cyber-border text-cyber-muted hover:border-cyber-purple/50 hover:text-cyber-text'
            }`}>
            {g || 'All Games'}
          </button>
        ))}
      </div>

      {/* Search + Filter Bar */}
      <div className="cyber-card p-4 flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-cyber-muted" />
          <input type="text" placeholder="Search by name..." value={search}
            onChange={e => setSearch(e.target.value)} className="cyber-input pl-9" />
        </div>
        <select value={status} onChange={e => setStatus(e.target.value)} className="cyber-select sm:w-44">
          {STATUSES.map(s => <option key={s} value={s}>{s ? statusMap[s]?.label || s : 'All Statuses'}</option>)}
        </select>
        {hasFilters && (
          <button onClick={() => { setSearch(''); setGame(''); setStatus(''); }}
            className="cyber-btn-ghost text-xs px-3">
            <X className="w-4 h-4" /> Clear
          </button>
        )}
      </div>

      {/* Count */}
      {!loading && (
        <p className="text-xs text-cyber-muted font-mono">
          {tournaments.length} tournament{tournaments.length !== 1 ? 's' : ''} found
        </p>
      )}

      {/* Grid */}
      {loading ? (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {[1,2,3,4,5,6].map(i => (
            <div key={i} className="cyber-card animate-pulse">
              <div className="h-40 bg-cyber-surface border-b border-cyber-border"></div>
              <div className="p-5 space-y-3">
                <div className="h-4 bg-cyber-surface rounded w-3/4"></div>
                <div className="h-3 bg-cyber-surface rounded w-1/2"></div>
              </div>
            </div>
          ))}
        </div>
      ) : tournaments.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <span className="text-5xl mb-4 block">🔍</span>
          <p className="font-bold text-cyber-muted">No tournaments found. Try adjusting your filters.</p>
          {hasFilters && <button onClick={() => { setSearch(''); setGame(''); setStatus(''); }} className="cyber-btn-outline mt-4 text-xs px-4 py-2">Clear Filters</button>}
        </div>
      ) : (
        <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
          {tournaments.map(t => {
            const s = statusMap[t.status] || { label: t.status, cls: 'cyber-badge-gray' };
            return (
              <Link key={t._id} to={`/tournaments/${t._id}`}
                className="cyber-card hover:border-cyber-purple/50 hover:shadow-neon-purple hover:-translate-y-0.5 transition-all group flex flex-col">
                <div className="h-40 bg-cyber-surface border-b border-cyber-border relative flex items-center justify-center overflow-hidden">
                  {t.bannerUrl ? (
                    <img src={t.bannerUrl} alt={t.name} className="w-full h-full object-cover" />
                  ) : (
                    <span className="text-5xl opacity-20">{getIcon(t.game)}</span>
                  )}
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none"></div>
                  <div className="absolute top-3 left-3"><span className={`cyber-badge ${s.cls}`}>{s.label}</span></div>
                  <div className="absolute top-3 right-3"><span className="cyber-badge-gray uppercase">{t.format}</span></div>
                </div>
                <div className="p-5 flex-1 flex flex-col">
                  <p className="text-xs font-mono text-cyber-cyan mb-1 uppercase">{t.game}</p>
                  <h3 className="font-black text-cyber-text text-base leading-snug mb-3 line-clamp-2 group-hover:text-cyber-purple transition-colors">
                    {t.name}
                  </h3>
                  <div className="space-y-1 text-xs text-cyber-muted">
                    <div className="flex items-center gap-2"><Calendar className="w-3.5 h-3.5" />{new Date(t.startDate).toLocaleDateString()}</div>
                    <div className="flex items-center gap-2"><Trophy className="w-3.5 h-3.5" />{t.prizePool || 'TBA'}</div>
                    <div className="flex items-center gap-2"><Users className="w-3.5 h-3.5" />Max {t.capacity} teams</div>
                  </div>
                  <div className="mt-auto pt-3 border-t border-cyber-border/50 flex justify-between items-center">
                    <span className="text-xs text-cyber-muted">{t.organizer?.name || 'Organizer info unavailable'}</span>
                    <span className="text-xs text-cyber-purple font-semibold">VIEW →</span>
                  </div>
                </div>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TournamentList;
