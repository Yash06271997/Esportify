import React, { useState, useEffect } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import { Trophy, Swords, Calendar, ChevronLeft, AlertCircle, RefreshCw } from 'lucide-react';
import api from '../services/api';

const statusColors = {
  scheduled: 'cyber-badge-yellow',
  ongoing:   'cyber-badge-cyan',
  completed: 'cyber-badge-green',
  bye:       'cyber-badge-gray',
};

const roundLabel = (round, totalRounds) => {
  if (round === totalRounds) return 'Grand Final';
  if (round === totalRounds - 1) return 'Semi-Finals';
  if (round === totalRounds - 2) return 'Quarter-Finals';
  return `Round ${round}`;
};

const TournamentBracket = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [tournament, setTournament] = useState(null);
  const [matches, setMatches]       = useState([]);
  const [loading, setLoading]       = useState(true);
  const [error, setError]           = useState('');

  const refresh = async () => {
    setLoading(true);
    try {
      const [tRes, mRes] = await Promise.all([
        api.get(`/tournaments/${id}`),
        api.get(`/matches/tournaments/${id}/matches`),
      ]);
      setTournament(tRes.data);
      setMatches(mRes.data || []);
    } catch {
      setError('Failed to load bracket.');
    }
    setLoading(false);
  };

  useEffect(() => { refresh(); }, [id]);

  const totalRounds = matches.length > 0 ? Math.max(...matches.map(m => m.round)) : 0;
  const rounds = [...new Set(matches.map(m => m.round))].sort((a, b) => a - b);

  if (loading) return (
    <div className="cyber-card p-10 text-center">
      <div className="w-8 h-8 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-3"></div>
      <p className="text-cyber-muted text-sm font-mono">Loading bracket...</p>
    </div>
  );

  return (
    <div className="space-y-6">
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-text transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back
      </button>

      <div className="flex items-center justify-between border-b border-cyber-border pb-5">
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-2">TOURNAMENT BRACKET</p>
          <h1 className="text-2xl font-black text-cyber-text">
            {tournament?.name || 'Bracket'}
          </h1>
          {tournament && (
            <p className="text-sm text-cyber-muted mt-1">{tournament.game} · {tournament.format?.toUpperCase()}</p>
          )}
        </div>
        <button onClick={refresh} className="cyber-btn-ghost text-sm px-4 py-2">
          <RefreshCw className="w-4 h-4" />
        </button>
      </div>

      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-4 h-4 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {matches.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Swords className="w-12 h-12 text-cyber-purple/20 mx-auto mb-4" />
          <h2 className="text-xl font-black text-cyber-text mb-2">Bracket Not Available</h2>
          <p className="text-cyber-muted text-sm">The bracket has not been generated yet. Check back after registrations close.</p>
        </div>
      ) : (
        <div className="space-y-6">
          {rounds.map(round => {
            const roundMatches = matches.filter(m => m.round === round);
            return (
              <div key={round} className="cyber-card overflow-hidden">
                <div className="px-5 py-3 border-b border-cyber-border bg-cyber-surface">
                  <h2 className="font-black text-cyber-purple text-sm uppercase tracking-widest flex items-center gap-2">
                    <Trophy className="w-4 h-4" />
                    {roundLabel(round, totalRounds)}
                  </h2>
                </div>
                <div className="divide-y divide-cyber-border">
                  {roundMatches.map((match, idx) => (
                    <div key={match._id} className="px-5 py-4">
                      <div className="flex items-center gap-4">
                        <span className="text-xs text-cyber-muted font-mono w-6">M{idx + 1}</span>
                        <div className="flex-1 grid grid-cols-3 gap-2 items-center">
                          {/* Team A */}
                          <div className={`text-sm font-bold ${
                            match.winner?._id === match.teamA?._id ? 'text-cyber-green' :
                            match.status === 'completed' ? 'text-cyber-muted line-through' : 'text-cyber-text'
                          }`}>
                            {match.teamA?.name || <span className="text-cyber-muted italic">TBD</span>}
                            {match.scoreA !== null && (
                              <span className="ml-2 text-cyber-cyan font-mono text-xs">{match.scoreA}</span>
                            )}
                          </div>
                          {/* VS */}
                          <div className="text-center text-xs text-cyber-muted font-mono">VS</div>
                          {/* Team B */}
                          <div className={`text-sm font-bold text-right ${
                            match.winner?._id === match.teamB?._id ? 'text-cyber-green' :
                            match.status === 'completed' ? 'text-cyber-muted line-through' : 'text-cyber-text'
                          }`}>
                            {match.scoreB !== null && (
                              <span className="mr-2 text-cyber-cyan font-mono text-xs">{match.scoreB}</span>
                            )}
                            {match.teamB?.name || <span className="text-cyber-muted italic">TBD</span>}
                          </div>
                        </div>
                        <div className="flex flex-col items-end gap-1 ml-2">
                          <span className={`cyber-badge ${statusColors[match.status] || 'cyber-badge-gray'}`}>
                            {match.status}
                          </span>
                          {match.scheduledAt && (
                            <span className="text-[10px] font-mono text-cyber-muted flex items-center gap-1">
                              <Calendar className="w-2.5 h-2.5" />
                              {new Date(match.scheduledAt).toLocaleDateString()}
                            </span>
                          )}
                        </div>
                      </div>
                      {match.winner && match.status === 'completed' && (
                        <p className="text-xs text-cyber-green mt-1 ml-9 font-semibold">
                          🏆 Winner: {match.winner.name}
                        </p>
                      )}
                      {match.notes && (
                        <p className="text-xs text-cyber-muted mt-1 ml-9 italic">{match.notes}</p>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default TournamentBracket;
