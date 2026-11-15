import React, { useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import { Users, Plus, Trophy, ChevronRight, AlertCircle } from 'lucide-react';
import api from '../services/api';

const MyTeams = () => {
  const [teams, setTeams] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  useEffect(() => {
    api.get('/teams/my')
      .then(({ data }) => setTeams(data))
      .catch(() => setError('Failed to load teams.'))
      .finally(() => setLoading(false));
  }, []);

  const getCompletion = (team) => {
    const accepted = (team.members || []).filter(m =>
      m.status === 'accepted' || m.status === 'leader'
    ).length;
    const total = team.tournament?.teamSize || 5;
    return { count: accepted, total, pct: Math.min((accepted / total) * 100, 100) };
  };

  if (loading) return (
    <div className="space-y-4">
      {[1,2,3].map(i => (
        <div key={i} className="cyber-card animate-pulse h-28"></div>
      ))}
    </div>
  );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center border-b border-cyber-border pb-5">
        <div>
          <p className="pixel-heading text-cyber-purple text-xs mb-2">YOUR SQUADS</p>
          <h1 className="text-3xl font-black text-cyber-text">My Teams</h1>
        </div>
        <Link to="/dashboard/teams/create" className="cyber-btn-primary text-sm px-5 py-2.5">
          <Plus className="w-4 h-4" /> Create Team
        </Link>
      </div>

      {error && (
        <div className="cyber-card border-red-700/50 p-4 flex items-center gap-3">
          <AlertCircle className="w-5 h-5 text-cyber-red shrink-0" />
          <p className="text-sm text-cyber-red">{error}</p>
        </div>
      )}

      {teams.length === 0 ? (
        <div className="cyber-card p-12 text-center">
          <Users className="w-12 h-12 text-cyber-purple/30 mx-auto mb-4" />
          <p className="font-black text-cyber-text mb-2">No teams yet</p>
          <p className="text-cyber-muted text-sm mb-6">Create a team for a tournament and invite your squad to compete.</p>
          <Link to="/dashboard/teams/create" className="cyber-btn-primary text-sm px-6 py-2.5">
            <Plus className="w-4 h-4" /> Create Your First Team
          </Link>
        </div>
      ) : (
        <div className="space-y-3">
          {teams.map(team => {
            const { count, total, pct } = getCompletion(team);
            const isComplete = count >= total;
            return (
              <Link key={team._id} to={`/dashboard/teams/${team._id}`}
                className="cyber-card p-5 flex items-center gap-5 hover:border-cyber-purple/50 hover:shadow-neon-purple transition-all group">
                {/* Icon */}
                <div className="shrink-0 w-12 h-12 bg-cyber-surface border border-cyber-border flex items-center justify-center">
                  <Users className="w-5 h-5 text-cyber-purple" />
                </div>

                {/* Info */}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-0.5">
                    <h3 className="font-black text-cyber-text truncate">{team.name}</h3>
                    {isComplete
                      ? <span className="cyber-badge-green text-[10px]">Complete</span>
                      : <span className="cyber-badge-yellow text-[10px]">Incomplete</span>}
                  </div>
                  <p className="text-xs text-cyber-muted truncate">
                    {team.tournament?.name || 'No tournament linked'} &nbsp;•&nbsp;
                    <span className="text-cyber-cyan font-mono">{team.game || team.tournament?.game || ''}</span>
                  </p>

                  {/* Progress bar */}
                  <div className="mt-2.5 flex items-center gap-2">
                    <div className="flex-1 h-1 bg-cyber-surface border border-cyber-border">
                      <div
                        className={`h-full transition-all ${isComplete ? 'bg-cyber-green' : 'bg-cyber-purple'}`}
                        style={{ width: `${pct}%` }}
                      ></div>
                    </div>
                    <span className={`text-xs font-mono ${isComplete ? 'text-cyber-green' : 'text-cyber-muted'}`}>
                      {count}/{total}
                    </span>
                  </div>
                </div>

                {/* Arrow */}
                <ChevronRight className="w-5 h-5 text-cyber-muted group-hover:text-cyber-purple transition-colors shrink-0" />
              </Link>
            );
          })}
        </div>
      )}

      {/* Info box */}
      <div className="cyber-card-purple p-5">
        <h3 className="pixel-heading text-cyber-purple text-xs mb-3">HOW TEAM REGISTRATION WORKS</h3>
        <ol className="space-y-2 text-xs text-cyber-muted">
          {[
            'Create a team for a specific tournament.',
            'Each tournament has a required team size (1v1, 2v2, or 5v5) — check the tournament details.',
            'As leader, invite the required number of players by their Player ID or username.',
            'All invited players must accept the invitation.',
            'Once all required members have joined, submit the registration.',
            'Wait for organizer approval.',
          ].map((step, i) => (
            <li key={i} className="flex items-start gap-2">
              <span className="text-cyber-purple font-mono font-bold shrink-0">{i + 1}.</span>
              <span>{step}</span>
            </li>
          ))}
        </ol>
      </div>
    </div>
  );
};

export default MyTeams;
