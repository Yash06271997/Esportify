import React, { useState, useEffect, useContext } from 'react';
import { useParams, Link, useNavigate } from 'react-router-dom';
import {
  Calendar, Trophy, Users, MapPin, AlertCircle, CheckCircle,
  Info, ChevronLeft, Clock, Megaphone, ListOrdered, ArrowRight, Swords
} from 'lucide-react';
import { AuthContext } from '../context/AuthContext';
import api from '../services/api';

const statusMap = {
  upcoming: { label: 'Upcoming', cls: 'cyber-badge-yellow' },
  registration_open: { label: 'Registration Open', cls: 'cyber-badge-green' },
  registration_closed: { label: 'Reg Closed', cls: 'cyber-badge-gray' },
  ongoing: { label: 'Live', cls: 'cyber-badge-cyan' },
  completed: { label: 'Ended', cls: 'cyber-badge-gray' },
  cancelled: { label: 'Cancelled', cls: 'cyber-badge-red' },
};

const regStatusMap = {
  pending: 'cyber-badge-yellow',
  approved: 'cyber-badge-green',
  rejected: 'cyber-badge-red',
  cancelled: 'cyber-badge-gray',
  withdrawn: 'cyber-badge-gray',
};

const TournamentDetails = () => {
  const { id } = useParams();
  const { user } = useContext(AuthContext);
  const navigate = useNavigate();

  const [tournament, setTournament] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [myRegistration, setMyRegistration] = useState(null);
  const [announcements, setAnnouncements] = useState([]);
  const [schedules, setSchedules] = useState([]);

  useEffect(() => {
    const load = async () => {
      try {
        const { data } = await api.get(`/tournaments/${id}`);
        setTournament(data);

        const [annRes, schRes] = await Promise.allSettled([
          api.get(`/announcements/tournaments/${id}`),
          api.get(`/schedule/tournaments/${id}`),
        ]);
        if (annRes.status === 'fulfilled') setAnnouncements(annRes.value.data);
        if (schRes.status === 'fulfilled') setSchedules(schRes.value.data);

        if (user?.role === 'user') {
          const regRes = await api.get('/registrations/me');
          const reg = regRes.data.find(r =>
            (r.tournament?._id?.toString() || r.tournament?.toString() || r.tournament) === id
          );
          setMyRegistration(reg || null);
        }
      } catch {
        setError('Failed to load tournament details.');
      }
      setLoading(false);
    };
    load();
  }, [id, user]);

  if (loading) return (
    <div className="flex items-center justify-center min-h-[60vh]">
      <div className="cyber-card p-10 text-center">
        <div className="w-10 h-10 border-2 border-cyber-purple/30 border-t-cyber-purple rounded-full animate-spin mx-auto mb-4"></div>
        <p className="font-mono text-cyber-muted text-sm">Loading tournament...</p>
      </div>
    </div>
  );

  if (!tournament) return (
    <div className="cyber-card p-10 text-center">
      <AlertCircle className="w-12 h-12 text-cyber-red mx-auto mb-4" />
      <p className="font-black text-cyber-text mb-4">{error || 'Tournament not found.'}</p>
      <Link to="/tournaments" className="cyber-btn-outline text-sm px-5 py-2">← Back to Tournaments</Link>
    </div>
  );

  const isDeadlinePassed = new Date(tournament.registrationDeadline) < new Date();
  const isClosed = ['completed', 'cancelled'].includes(tournament.status);
  const activeCount = tournament.activeRegistrations ?? 0;
  const isFull = activeCount >= tournament.capacity;
  const s = statusMap[tournament.status] || { label: tournament.status, cls: 'cyber-badge-gray' };

  const renderRegButton = () => {
    if (!user) return (
      <Link to="/login" className="cyber-btn-primary text-sm px-6 py-2.5">
        <Users className="w-4 h-4" /> Login to Register
      </Link>
    );
    if (user.role === 'organizer' || user.role === 'admin') return (
      <span className="cyber-badge-gray text-xs">Organizers cannot register</span>
    );
    if (myRegistration) return (
      <div className="flex items-center gap-3 cyber-card px-4 py-2.5 border-cyber-green">
        <CheckCircle className="w-4 h-4 text-cyber-green" />
        <span className="text-sm font-bold text-cyber-text">Registered</span>
        <span className={`cyber-badge ${regStatusMap[myRegistration.status] || 'cyber-badge-gray'}`}>
          {myRegistration.status}
        </span>
      </div>
    );
    if (isClosed) return <span className="cyber-badge-gray text-xs">Tournament {tournament.status}</span>;
    if (isDeadlinePassed) return (
      <div className="flex items-center gap-2 cyber-card border-red-700/50 px-4 py-2.5 text-cyber-red text-sm font-bold">
        <AlertCircle className="w-4 h-4" /> Registration Closed
      </div>
    );
    if (isFull) return <span className="cyber-badge-red text-xs py-2 px-3">Tournament Full</span>;
    return (
      <Link
        to={`/dashboard/teams/create?tournament=${id}`}
        className="cyber-btn-primary text-sm px-6 py-2.5"
      >
        <Users className="w-4 h-4" /> Register Your Team <ArrowRight className="w-4 h-4" />
      </Link>
    );
  };

  return (
    <div className="space-y-6 max-w-6xl mx-auto">
      {/* Back */}
      <button onClick={() => navigate(-1)}
        className="flex items-center gap-1.5 text-sm text-cyber-muted hover:text-cyber-text transition-colors">
        <ChevronLeft className="w-4 h-4" /> Back to Tournaments
      </button>

      {/* Banner */}
      <div className="cyber-card overflow-hidden">
        <div className="h-56 md:h-72 bg-cyber-surface relative flex items-center justify-center overflow-hidden">
          {tournament.bannerUrl ? (
            <img src={tournament.bannerUrl} alt={tournament.name} className="w-full h-full object-cover" />
          ) : (
            <span className="text-8xl opacity-10">🎮</span>
          )}
          <div className="absolute inset-0 bg-gradient-to-t from-black/60 via-black/10 to-transparent pointer-events-none"></div>
          <div className="absolute bottom-0 left-0 w-full p-6">
            <div className="flex flex-wrap gap-2 mb-3">
              <span className={`cyber-badge ${s.cls}`}>{s.label}</span>
              <span className="cyber-badge-cyan">{tournament.game}</span>
              <span className="cyber-badge-gray uppercase">{tournament.format}</span>
            </div>
            <h1 className="text-3xl md:text-4xl font-black text-white leading-tight drop-shadow-md">
              {tournament.name}
            </h1>
            <p className="text-white/70 text-sm mt-1 drop-shadow-sm">by {tournament.organizer?.name || 'Organizer information unavailable'}</p>
          </div>
        </div>

        {/* Action bar */}
        <div className="p-5 border-t border-cyber-border flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-cyber-surface">
          <div className="flex flex-wrap gap-4 text-xs font-mono text-cyber-muted">
            <span className="flex items-center gap-1.5">
              <Calendar className="w-3.5 h-3.5 text-cyber-cyan" />
              {new Date(tournament.startDate).toLocaleDateString()}
            </span>
            <span className={`flex items-center gap-1.5 ${isDeadlinePassed ? 'text-cyber-red' : ''}`}>
              <Clock className="w-3.5 h-3.5" />
              Deadline: {new Date(tournament.registrationDeadline).toLocaleDateString()}
            </span>
            <span className="flex items-center gap-1.5">
              <Users className="w-3.5 h-3.5 text-cyber-purple" />
              {activeCount}/{tournament.capacity} Teams
            </span>
          </div>
          <div>{renderRegButton()}</div>
        </div>
      </div>

      {/* Body */}
      <div className="grid md:grid-cols-3 gap-6">
        {/* Main content */}
        <div className="md:col-span-2 space-y-5">
          {/* Description */}
          <div className="cyber-card p-6">
            <h2 className="font-black text-cyber-text text-sm uppercase tracking-widest mb-4 pb-3 border-b border-cyber-border flex items-center gap-2">
              <Info className="w-4 h-4 text-cyber-cyan" /> About This Tournament
            </h2>
            <p className="text-cyber-muted leading-relaxed whitespace-pre-wrap text-sm">{tournament.description}</p>
          </div>

          {/* Rules */}
          {tournament.rules && (
            <div className="cyber-card p-6">
              <h2 className="font-black text-cyber-text text-sm uppercase tracking-widest mb-4 pb-3 border-b border-cyber-border flex items-center gap-2">
                <ListOrdered className="w-4 h-4 text-cyber-magenta" /> Rules & Guidelines
              </h2>
              <p className="text-cyber-muted leading-relaxed whitespace-pre-wrap text-sm">{tournament.rules}</p>
            </div>
          )}

          {/* Schedule */}
          {schedules.length > 0 && (
            <div className="cyber-card p-6">
              <h2 className="font-black text-cyber-text text-sm uppercase tracking-widest mb-4 pb-3 border-b border-cyber-border flex items-center gap-2">
                <Calendar className="w-4 h-4 text-cyber-purple" /> Schedule
              </h2>
              <div className="space-y-3">
                {schedules.map(sch => (
                  <div key={sch._id} className="flex justify-between items-start border border-cyber-border p-3 hover:border-cyber-purple/40 transition-colors">
                    <div>
                      <p className="font-bold text-cyber-text text-sm">{sch.title}</p>
                      {sch.participants && <p className="text-xs text-cyber-muted mt-0.5">{sch.participants}</p>}
                    </div>
                    <div className="text-right shrink-0 ml-4">
                      <p className="text-xs font-mono text-cyber-cyan">{new Date(sch.date).toLocaleDateString()}</p>
                      <span className="cyber-badge-gray mt-1">{sch.status}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Announcements */}
          {announcements.length > 0 && (
            <div className="cyber-card p-6">
              <h2 className="font-black text-cyber-text text-sm uppercase tracking-widest mb-4 pb-3 border-b border-cyber-border flex items-center gap-2">
                <Megaphone className="w-4 h-4 text-cyber-yellow" /> Announcements
              </h2>
              <div className="space-y-4">
                {announcements.map(a => (
                  <div key={a._id} className="border-l-2 border-cyber-purple pl-4">
                    <h3 className="font-bold text-cyber-text text-sm">{a.title}</h3>
                    <p className="text-xs text-cyber-muted mt-1">{a.message}</p>
                    <p className="text-xs text-cyber-muted/50 mt-1.5 font-mono">{new Date(a.createdAt).toLocaleDateString()}</p>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Find a Team — only for participants, only if reg is open and teamSize > 1 */}
          {user?.role === 'user' && !myRegistration && !isClosed && !isDeadlinePassed && (tournament.teamSize ?? 5) > 1 && (
            <div className="cyber-card p-6 border-t-2 border-cyber-cyan">
              <h2 className="font-black text-cyber-text text-sm uppercase tracking-widest mb-2 flex items-center gap-2">
                <Users className="w-4 h-4 text-cyber-cyan" /> Find a Team to Join
              </h2>
              <p className="text-xs text-cyber-muted mb-4">
                Don't have a full team yet? Browse teams that are actively looking for players.
              </p>
              <Link to={`/tournaments/${id}/find-team`} className="cyber-btn-cyan text-sm px-5 py-2.5">
                <Users className="w-4 h-4" /> Browse Open Teams
              </Link>
            </div>
          )}
        </div>

        {/* Sidebar */}
        <div className="space-y-4">
          <div className="cyber-card p-5">
            <h3 className="font-black text-cyber-text text-xs uppercase tracking-widest mb-4 pb-3 border-b border-cyber-border">
              Tournament Info
            </h3>
            <div className="space-y-3">
              {[
                { icon: Calendar, label: 'Start Date', value: new Date(tournament.startDate).toLocaleDateString(), color: 'text-cyber-cyan' },
                { icon: Clock, label: 'Reg Deadline', value: new Date(tournament.registrationDeadline).toLocaleDateString(), color: isDeadlinePassed ? 'text-cyber-red' : 'text-cyber-yellow' },
                { icon: Trophy, label: 'Prize Pool', value: tournament.prizePool || 'TBA', color: 'text-cyber-yellow' },
                { icon: MapPin, label: 'Format', value: tournament.format?.toUpperCase(), color: 'text-cyber-magenta' },
                { icon: Users, label: 'Team Size', value: (() => { const ts = tournament.teamSize ?? 5; return `${ts}v${ts} (${ts} player${ts !== 1 ? 's' : ''} per team)`; })(), color: 'text-cyber-cyan' },
                { icon: Users, label: 'Capacity', value: `${tournament.capacity} Teams`, color: 'text-cyber-purple' },
              ].map(({ icon: Icon, label, value, color }) => (
                <div key={label} className="flex items-start gap-3">
                  <Icon className={`w-4 h-4 mt-0.5 shrink-0 ${color}`} />
                  <div>
                    <p className="text-xs text-cyber-muted uppercase tracking-wider">{label}</p>
                    <p className="text-sm font-bold text-cyber-text">{value}</p>
                  </div>
                </div>
              ))}
            </div>

            {tournament.venueDetails && (
              <div className="mt-4 pt-4 border-t border-cyber-border">
                <p className="text-xs text-cyber-muted uppercase tracking-wider mb-1">Venue</p>
                <p className="text-sm text-cyber-text">{tournament.venueDetails}</p>
              </div>
            )}
            {tournament.eligibility && (
              <div className="mt-3 pt-3 border-t border-cyber-border">
                <p className="text-xs text-cyber-muted uppercase tracking-wider mb-1">Eligibility</p>
                <p className="text-sm text-cyber-text">{tournament.eligibility}</p>
              </div>
            )}
            {tournament.entryFee != null && (
              <div className="mt-3 pt-3 border-t border-cyber-border">
                <p className="text-xs text-cyber-muted uppercase tracking-wider mb-1">Entry Fee</p>
                <p className="text-sm text-cyber-text font-bold">{tournament.entryFee === 0 ? 'Free' : `₹${tournament.entryFee}`}</p>
              </div>
            )}

            {/* Capacity bar */}
            <div className="mt-4 pt-4 border-t border-cyber-border">
              <div className="flex justify-between text-xs text-cyber-muted mb-1.5">
                <span>Teams Registered</span>
                <span className="font-mono">{activeCount}/{tournament.capacity}</span>
              </div>
              <div className="h-1.5 bg-cyber-surface border border-cyber-border">
                <div
                  className="h-full bg-cyber-purple transition-all"
                  style={{ width: `${Math.min(100, (activeCount / tournament.capacity) * 100)}%` }}
                ></div>
              </div>
            </div>
          </div>

          {/* Register CTA */}
          {!myRegistration && !isClosed && !isDeadlinePassed && !isFull && user?.role === 'user' && (
            <div className="cyber-card-purple p-5">
              <h3 className="pixel-heading text-cyber-purple text-xs mb-3">READY TO COMPETE?</h3>
              <p className="text-xs text-cyber-muted mb-3 leading-relaxed">
                {(() => {
                  const ts = tournament.teamSize ?? 5;
                  const additional = ts - 1;
                  return additional > 0
                    ? `Create a ${ts}v${ts} team, invite ${additional} more player${additional !== 1 ? 's' : ''}, and submit your registration.`
                    : 'This is a solo (1v1) tournament. Create your team and submit your registration immediately.';
                })()}
              </p>
              <div className="flex flex-col gap-2">
                <Link to={`/dashboard/teams/create?tournament=${id}`} className="cyber-btn-primary w-full text-sm py-2.5 justify-center">
                  Create My Team <ArrowRight className="w-4 h-4" />
                </Link>
                {(tournament.teamSize ?? 5) > 1 && (
                  <Link to={`/tournaments/${id}/find-team`} className="cyber-btn-outline w-full text-sm py-2.5 justify-center">
                    <Users className="w-4 h-4" /> Find a Team to Join
                  </Link>
                )}
              </div>
            </div>
          )}

          {/* Bracket link */}
          {['ongoing', 'completed'].includes(tournament.status) && (
            <div className="cyber-card p-5">
              <h3 className="pixel-heading text-cyber-cyan text-xs mb-3">BRACKET</h3>
              <p className="text-xs text-cyber-muted mb-4">View the match bracket and results.</p>
              <Link to={`/tournaments/${id}/bracket`} className="cyber-btn-cyan w-full text-sm py-2.5 justify-center">
                <Swords className="w-4 h-4" /> View Bracket
              </Link>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default TournamentDetails;
