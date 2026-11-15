import Match from '../models/Match.js';
import Registration from '../models/Registration.js';
import Tournament from '../models/Tournament.js';
import Team from '../models/Team.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

const notify = async (receiverId, type, message, extras = {}) => {
  try {
    await Notification.create({ receiver: receiverId, type, message, ...extras });
    await User.findByIdAndUpdate(receiverId, { $inc: { unreadNotifications: 1 } });
  } catch {}
};

// ─── Generate Bracket ─────────────────────────────────────────────────────────
// Creates a single-elimination bracket from all approved registrations
export const generateBracket = async (req, res, next) => {
  try {
    const { id: tournamentId } = req.params;
    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) { res.status(404); throw new Error('Tournament not found'); }

    // Only organizer of this tournament or admin
    const isOwner = tournament.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }

    // Get approved teams
    const approvedRegs = await Registration.find({
      tournament: tournamentId,
      status: 'approved',
    }).populate('team', 'name');

    if (approvedRegs.length < 2) {
      res.status(400); throw new Error('Need at least 2 approved teams to generate a bracket');
    }

    // Check for existing bracket
    const existing = await Match.countDocuments({ tournament: tournamentId });
    if (existing > 0) {
      res.status(400); throw new Error('Bracket already exists for this tournament. Delete it before regenerating.');
    }

    // Shuffle teams for fair seeding
    const teams = approvedRegs.map(r => r.team._id);
    for (let i = teams.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [teams[i], teams[j]] = [teams[j], teams[i]];
    }

    // Build single-elimination bracket
    // Round up to next power of 2 to handle byes
    const totalSlots = Math.pow(2, Math.ceil(Math.log2(teams.length)));
    const paddedTeams = [...teams, ...Array(totalSlots - teams.length).fill(null)];

    const matches = [];
    let matchNumber = 1;
    const round1Matches = [];

    // Round 1
    for (let i = 0; i < paddedTeams.length; i += 2) {
      const teamA = paddedTeams[i];
      const teamB = paddedTeams[i + 1];
      const isBye = !teamA || !teamB;

      const match = new Match({
        tournament: tournamentId,
        round: 1,
        matchNumber: matchNumber++,
        teamA: teamA || null,
        teamB: teamB || null,
        status: isBye ? 'bye' : 'scheduled',
        winner: isBye ? (teamA || teamB) : null,
      });
      await match.save();
      round1Matches.push(match);
      matches.push(match);
    }

    // Build subsequent rounds
    let prevRoundMatches = round1Matches;
    let round = 2;

    while (prevRoundMatches.length > 1) {
      const nextRoundMatches = [];
      for (let i = 0; i < prevRoundMatches.length; i += 2) {
        const match = new Match({
          tournament: tournamentId,
          round,
          matchNumber: matchNumber++,
          teamA: null,
          teamB: null,
          status: 'scheduled',
        });
        await match.save();
        nextRoundMatches.push(match);
        matches.push(match);

        // Link previous round matches to this one
        await Match.findByIdAndUpdate(prevRoundMatches[i]._id, { nextMatchId: match._id });
        if (prevRoundMatches[i + 1]) {
          await Match.findByIdAndUpdate(prevRoundMatches[i + 1]._id, { nextMatchId: match._id });
        }
      }
      prevRoundMatches = nextRoundMatches;
      round++;
    }

    // For bye matches — auto-advance winners to next round immediately
    for (const byeMatch of round1Matches.filter(m => m.status === 'bye')) {
      if (byeMatch.nextMatchId && byeMatch.winner) {
        const nextMatch = await Match.findById(byeMatch.nextMatchId);
        if (nextMatch) {
          if (!nextMatch.teamA) nextMatch.teamA = byeMatch.winner;
          else nextMatch.teamB = byeMatch.winner;
          await nextMatch.save();
        }
      }
    }

    const populated = await Match.find({ tournament: tournamentId })
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('winner', 'name')
      .sort({ round: 1, matchNumber: 1 });

    res.status(201).json({
      message: `Bracket generated with ${matches.length} matches`,
      matches: populated,
    });
  } catch (error) {
    next(error);
  }
};

// ─── Get Bracket / Matches ────────────────────────────────────────────────────
export const getTournamentMatches = async (req, res, next) => {
  try {
    const matches = await Match.find({ tournament: req.params.id })
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('winner', 'name')
      .sort({ round: 1, matchNumber: 1 });
    res.json(matches);
  } catch (error) {
    next(error);
  }
};

// ─── Update Match (schedule, scores, winner) ──────────────────────────────────
export const updateMatch = async (req, res, next) => {
  try {
    const match = await Match.findById(req.params.matchId)
      .populate('tournament');
    if (!match) { res.status(404); throw new Error('Match not found'); }

    const tournament = match.tournament;
    const isOwner = tournament.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }

    const { scheduledAt, scoreA, scoreB, status, notes } = req.body;

    if (scheduledAt !== undefined) match.scheduledAt = scheduledAt;
    if (scoreA !== undefined) match.scoreA = Number(scoreA);
    if (scoreB !== undefined) match.scoreB = Number(scoreB);
    if (status !== undefined) match.status = status;
    if (notes !== undefined) match.notes = notes;

    // If scores are set and match is being completed, determine winner
    if (
      match.status === 'completed' &&
      match.scoreA !== null && match.scoreB !== null &&
      match.teamA && match.teamB
    ) {
      match.winner = match.scoreA >= match.scoreB ? match.teamA : match.teamB;

      // Advance winner to next match
      if (match.nextMatchId) {
        const nextMatch = await Match.findById(match.nextMatchId);
        if (nextMatch) {
          if (!nextMatch.teamA) nextMatch.teamA = match.winner;
          else nextMatch.teamB = match.winner;
          await nextMatch.save();
        }
      }

      // Notify team members of the result
      const winnerTeam = await Team.findById(match.winner).populate('members.user', '_id');
      const loserTeamId = match.winner.toString() === match.teamA.toString() ? match.teamB : match.teamA;
      const loserTeam  = await Team.findById(loserTeamId).populate('members.user', '_id');

      const notifyMembers = async (team, msg) => {
        for (const m of (team?.members || [])) {
          if (m.user?._id) {
            await notify(m.user._id, 'match_result', msg, { relatedTournament: tournament._id });
          }
        }
      };
      await notifyMembers(winnerTeam, `🏆 Your team won the match in ${tournament.name}! Advancing to the next round.`);
      await notifyMembers(loserTeam,  `Your team was eliminated from ${tournament.name}. Better luck next time!`);
    }

    await match.save();

    const populated = await Match.findById(match._id)
      .populate('teamA', 'name')
      .populate('teamB', 'name')
      .populate('winner', 'name');

    res.json(populated);
  } catch (error) {
    next(error);
  }
};

// ─── Delete Bracket ───────────────────────────────────────────────────────────
export const deleteBracket = async (req, res, next) => {
  try {
    const tournament = await Tournament.findById(req.params.id);
    if (!tournament) { res.status(404); throw new Error('Tournament not found'); }

    const isOwner = tournament.organizer.toString() === req.user._id.toString();
    if (!isOwner && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }

    await Match.deleteMany({ tournament: req.params.id });
    res.json({ message: 'Bracket deleted' });
  } catch (error) {
    next(error);
  }
};
