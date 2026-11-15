import Team from '../models/Team.js';
import TeamInvitation from '../models/TeamInvitation.js';
import JoinRequest from '../models/JoinRequest.js';
import Tournament from '../models/Tournament.js';
import Registration from '../models/Registration.js';
import Notification from '../models/Notification.js';
import User from '../models/User.js';

// ─── Helper ─────────────────────────────────────────────────────────────────
const createNotification = async (receiverId, type, message, extras = {}) => {
  await Notification.create({ receiver: receiverId, type, message, ...extras });
  await User.findByIdAndUpdate(receiverId, { $inc: { unreadNotifications: 1 } });
};

// ─── Create Team ─────────────────────────────────────────────────────────────
export const createTeam = async (req, res, next) => {
  try {
    const { name, tournamentId } = req.body;
    if (!name || !tournamentId) { res.status(400); throw new Error('Team name and tournament are required'); }

    const tournament = await Tournament.findById(tournamentId);
    if (!tournament) { res.status(404); throw new Error('Tournament not found'); }

    // Check deadline
    if (new Date(tournament.registrationDeadline) < new Date()) {
      res.status(400); throw new Error('Registration deadline has passed');
    }

    // One team per leader per tournament
    const existing = await Team.findOne({ tournament: tournamentId, leader: req.user._id });
    if (existing) { res.status(400); throw new Error('You already have a team for this tournament'); }

    // Check if player is already in another team for this tournament as member
    const memberOfTeam = await Team.findOne({
      tournament: tournamentId,
      'members.user': req.user._id,
      'members.status': 'accepted',
    });
    if (memberOfTeam) { res.status(400); throw new Error('You are already a member of a team for this tournament'); }

    const team = await Team.create({
      name: name.trim(),
      tournament: tournamentId,
      leader: req.user._id,
      members: [{ user: req.user._id, status: 'leader', joinedAt: new Date() }],
    });

    const populated = await Team.findById(team._id)
      .populate('tournament', 'name game registrationDeadline teamSize')
      .populate('members.user', 'name username playerId inGameName');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// ─── Get My Teams ─────────────────────────────────────────────────────────────
export const getMyTeams = async (req, res, next) => {
  try {
    const teams = await Team.find({
      $or: [
        { leader: req.user._id },
        { 'members.user': req.user._id },
      ],
    })
      .populate('tournament', 'name game status registrationDeadline startDate teamSize')
      .populate('members.user', 'name username playerId inGameName')
      .populate('registrationId', 'status rejectionReason')
      .sort({ createdAt: -1 });
    res.json(teams);
  } catch (error) {
    next(error);
  }
};

// ─── Get Single Team ─────────────────────────────────────────────────────────
export const getTeam = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.id)
      .populate('tournament', 'name game status registrationDeadline startDate capacity teamSize')
      .populate('leader', 'name username playerId inGameName')
      .populate('members.user', 'name username playerId inGameName')
      .populate('registrationId', 'status rejectionReason');

    if (!team) { res.status(404); throw new Error('Team not found'); }

    // Only members / admin can view
    const isMember = team.members.some(m => m.user?._id?.toString() === req.user._id.toString());
    const isLeader = team.leader._id.toString() === req.user._id.toString();
    if (!isMember && !isLeader && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized to view this team');
    }

    res.json(team);
  } catch (error) {
    next(error);
  }
};

// ─── Search Players ───────────────────────────────────────────────────────────
export const searchPlayers = async (req, res, next) => {
  try {
    const { q } = req.query;
    if (!q || q.trim().length < 2) { return res.json([]); }

    const regex = new RegExp(q.trim(), 'i');
    const players = await User.find({
      role: 'user',
      status: 'active',
      _id: { $ne: req.user._id },
      $or: [{ username: regex }, { playerId: regex }, { name: regex }],
    })
      .select('name username playerId inGameName')
      .limit(10)
      .lean();

    res.json(players);
  } catch (error) {
    next(error);
  }
};

// ─── Send Invitation ─────────────────────────────────────────────────────────
export const sendInvitation = async (req, res, next) => {
  try {
    const { teamId, receiverId } = req.body;
    if (!teamId || !receiverId) { res.status(400); throw new Error('teamId and receiverId are required'); }

    const team = await Team.findById(teamId).populate('tournament');
    if (!team) { res.status(404); throw new Error('Team not found'); }

    // Only leader can invite
    if (team.leader.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Only the team leader can send invitations');
    }

    // Cannot invite yourself
    if (receiverId === req.user._id.toString()) { res.status(400); throw new Error('You cannot invite yourself'); }

    // Team must not be full — use tournament.teamSize (defaults to 5)
    const reqTeamSize = team.tournament?.teamSize || 5;
    const acceptedCount = team.members.filter(m => ['leader', 'accepted'].includes(m.status)).length;
    if (acceptedCount >= reqTeamSize) {
      res.status(400); throw new Error(`Team is already full (${reqTeamSize}/${reqTeamSize})`);
    }

    // Check receiver exists and is a participant
    const receiver = await User.findById(receiverId);
    if (!receiver || receiver.role !== 'user') { res.status(404); throw new Error('Player not found'); }
    if (receiver.status === 'suspended') { res.status(400); throw new Error('This player account is suspended'); }

    // Prevent duplicate pending invitation for same team+receiver
    const existingInvite = await TeamInvitation.findOne({ team: teamId, receiver: receiverId, status: 'pending' });
    if (existingInvite) { res.status(400); throw new Error('A pending invitation already exists for this player'); }

    // Player cannot be already a member
    const alreadyMember = team.members.some(m => m.user?.toString() === receiverId && ['leader', 'accepted'].includes(m.status));
    if (alreadyMember) { res.status(400); throw new Error('This player is already in your team'); }

    // Check if receiver is in another team for same tournament
    const inOtherTeam = await Team.findOne({
      tournament: team.tournament._id,
      _id: { $ne: teamId },
      'members.user': receiverId,
      'members.status': { $in: ['leader', 'accepted'] },
    });
    if (inOtherTeam) { res.status(400); throw new Error('This player is already in another team for this tournament'); }

    // Check deadline
    if (new Date(team.tournament.registrationDeadline) < new Date()) {
      res.status(400); throw new Error('Registration deadline has passed');
    }

    // Create invitation
    const invitation = await TeamInvitation.create({
      team: teamId,
      tournament: team.tournament._id,
      sender: req.user._id,
      receiver: receiverId,
    });

    // Add pending slot in team.members
    team.members.push({ user: receiverId, status: 'pending' });
    await team.save();

    // Notify receiver
    await createNotification(
      receiverId,
      'invitation_received',
      `${req.user.name} invited you to join team "${team.name}" for ${team.tournament.name}`,
      { relatedTeam: teamId, relatedTournament: team.tournament._id }
    );

    const populated = await TeamInvitation.findById(invitation._id)
      .populate('team', 'name')
      .populate('tournament', 'name game')
      .populate('sender', 'name username playerId')
      .populate('receiver', 'name username playerId');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// ─── Get My Invitations ───────────────────────────────────────────────────────
export const getMyInvitations = async (req, res, next) => {
  try {
    const invitations = await TeamInvitation.find({ receiver: req.user._id })
      .populate('team', 'name members')
      .populate('tournament', 'name game startDate')
      .populate('sender', 'name username playerId')
      .sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

// ─── Respond to Invitation ────────────────────────────────────────────────────
export const respondToInvitation = async (req, res, next) => {
  try {
    // Support both { action: 'accept'|'reject' } and { status: 'accepted'|'rejected' }
    let action = req.body.action;
    if (!action && req.body.status) {
      action = req.body.status === 'accepted' ? 'accept' : 'reject';
    }
    if (!['accept', 'reject'].includes(action)) { res.status(400); throw new Error('action must be accept or reject'); }

    const invitation = await TeamInvitation.findById(req.params.id)
      .populate('team')
      .populate('tournament');
    if (!invitation) { res.status(404); throw new Error('Invitation not found'); }
    if (invitation.receiver.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized');
    }
    if (invitation.status !== 'pending') { res.status(400); throw new Error('Invitation is no longer pending'); }

    const team = invitation.team;

    if (action === 'accept') {
      // Check deadline
      if (new Date(invitation.tournament.registrationDeadline) < new Date()) {
        invitation.status = 'cancelled';
        await invitation.save();
        res.status(400); throw new Error('Registration deadline has passed');
      }

      // Check team not already full
      const reqTeamSize = team.tournament?.teamSize || 5;
      const acceptedCount = team.members.filter(m => ['leader', 'accepted'].includes(m.status)).length;
      if (acceptedCount >= reqTeamSize) {
        invitation.status = 'cancelled';
        await invitation.save();
        res.status(400); throw new Error('Team is already full');
      }

      // Check not already in another team for same tournament
      const inOtherTeam = await Team.findOne({
        tournament: team.tournament,
        _id: { $ne: team._id },
        'members.user': req.user._id,
        'members.status': { $in: ['leader', 'accepted'] },
      });
      if (inOtherTeam) { res.status(400); throw new Error('You are already in another team for this tournament'); }

      // Update member status in team
      const memberIdx = team.members.findIndex(m => m.user?.toString() === req.user._id.toString());
      if (memberIdx !== -1) {
        team.members[memberIdx].status = 'accepted';
        team.members[memberIdx].joinedAt = new Date();
      }

      // Check if team is now complete
      const newAccepted = team.members.filter(m => ['leader', 'accepted'].includes(m.status)).length;
      if (newAccepted >= reqTeamSize) team.isComplete = true;
      await team.save();

      invitation.status = 'accepted';
      await invitation.save();

      // Notify leader
      await createNotification(
        team.leader,
        'invitation_accepted',
        `${req.user.name} accepted your invitation to team "${team.name}"`,
        { relatedTeam: team._id, relatedTournament: team.tournament }
      );

    } else {
      // Reject: remove pending slot
      team.members = team.members.filter(
        m => !(m.user?.toString() === req.user._id.toString() && m.status === 'pending')
      );
      await team.save();

      invitation.status = 'rejected';
      await invitation.save();

      // Notify leader
      await createNotification(
        team.leader,
        'invitation_rejected',
        `${req.user.name} declined your invitation to team "${team.name}"`,
        { relatedTeam: team._id, relatedTournament: team.tournament }
      );
    }

    res.json({ message: `Invitation ${action}ed`, status: invitation.status });
  } catch (error) {
    next(error);
  }
};

// ─── Cancel Invitation (Leader) ───────────────────────────────────────────────
export const cancelInvitation = async (req, res, next) => {
  try {
    const invitation = await TeamInvitation.findById(req.params.id).populate('team');
    if (!invitation) { res.status(404); throw new Error('Invitation not found'); }

    const team = invitation.team;
    if (team.leader.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Only the team leader can cancel invitations');
    }
    if (invitation.status !== 'pending') { res.status(400); throw new Error('Invitation is not pending'); }

    // Remove pending slot from team
    team.members = team.members.filter(
      m => !(m.user?.toString() === invitation.receiver.toString() && m.status === 'pending')
    );
    await team.save();

    invitation.status = 'cancelled';
    await invitation.save();

    // Notify receiver
    await createNotification(
      invitation.receiver,
      'invitation_cancelled',
      `Your invitation to team "${team.name}" was cancelled by the leader`,
      { relatedTeam: team._id }
    );

    res.json({ message: 'Invitation cancelled' });
  } catch (error) {
    next(error);
  }
};

// ─── Register Team for Tournament ─────────────────────────────────────────────
export const registerTeam = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    if (!teamId) { res.status(400); throw new Error('teamId is required'); }

    const team = await Team.findById(teamId)
      .populate('tournament')
      .populate('members.user', 'name username playerId inGameName contactNumber');
    if (!team) { res.status(404); throw new Error('Team not found'); }

    // Only leader can register
    if (team.leader.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Only the team leader can submit registration');
    }

    const tournament = team.tournament;

    // Check deadline
    if (new Date(tournament.registrationDeadline) < new Date()) {
      res.status(400); throw new Error('Registration deadline has passed');
    }

    // Check team is complete
    const reqTeamSize = tournament.teamSize || 5;
    const acceptedMembers = team.members.filter(m => ['leader', 'accepted'].includes(m.status));
    if (acceptedMembers.length < reqTeamSize) {
      res.status(400); throw new Error(`Team is not complete. ${acceptedMembers.length}/${reqTeamSize} players joined.`);
    }

    // Check capacity
    const activeCount = await Registration.countDocuments({
      tournament: tournament._id,
      status: { $in: ['pending', 'approved'] },
    });
    if (activeCount >= tournament.capacity) {
      res.status(400); throw new Error('Tournament has reached maximum team capacity');
    }

    // Prevent duplicate registration for same team
    if (team.registrationId) {
      res.status(400); throw new Error('This team is already registered');
    }

    // Prevent leader from registering twice for same tournament
    const existingReg = await Registration.findOne({
      user: req.user._id,
      tournament: tournament._id,
      status: { $nin: ['cancelled', 'withdrawn', 'rejected'] },
    });
    if (existingReg) { res.status(400); throw new Error('You have already registered for this tournament'); }

    const registration = await Registration.create({
      team: teamId,
      user: req.user._id,
      tournament: tournament._id,
      teamName: team.name,
      status: 'pending',
    });

    // Link registration back to team
    team.registrationId = registration._id;
    await team.save();

    // Notify all team members
    for (const m of team.members) {
      if (m.user && m.user._id.toString() !== req.user._id.toString()) {
        await createNotification(
          m.user._id,
          'registration_submitted',
          `Team "${team.name}" has been registered for ${tournament.name}`,
          { relatedTeam: teamId, relatedTournament: tournament._id, relatedRegistration: registration._id }
        );
      }
    }

    res.status(201).json(registration);
  } catch (error) {
    next(error);
  }
};

// ─── Get Invitations Sent by Leader ──────────────────────────────────────────
export const getTeamInvitations = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) { res.status(404); throw new Error('Team not found'); }
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }

    const invitations = await TeamInvitation.find({ team: req.params.teamId })
      .populate('receiver', 'name username playerId inGameName')
      .sort({ createdAt: -1 });
    res.json(invitations);
  } catch (error) {
    next(error);
  }
};

// ─── Get Open / Recruiting Teams for a Tournament ────────────────────────────
// Returns incomplete teams for a given tournament so Participants can browse and request to join.
// Works with both /teams/open/:tournamentId and /tournaments/:id/open-teams
export const getOpenTeams = async (req, res, next) => {
  try {
    const tournamentId = req.params.tournamentId || req.params.id;
    const tournament = await Tournament.findById(tournamentId).select('teamSize name game');
    if (!tournament) { res.status(404); throw new Error('Tournament not found'); }

    const reqSize = tournament.teamSize || 5;

    // Find all teams for this tournament that are not yet registered
    const teams = await Team.find({ tournament: tournamentId, registrationId: null })
      .populate('leader', 'name username playerId')
      .populate('members.user', 'name username playerId')
      .lean();

    // Filter to only recruiting teams (accepted count < reqSize)
    const openTeams = teams.filter(team => {
      const accepted = (team.members || []).filter(m => ['leader', 'accepted'].includes(m.status)).length;
      return accepted < reqSize;
    }).map(team => {
      const accepted = (team.members || []).filter(m => ['leader', 'accepted'].includes(m.status)).length;
      return {
        ...team,
        acceptedCount: accepted,
        requiredSize: reqSize,
        availableSlots: reqSize - accepted,
        isComplete: accepted >= reqSize,
      };
    });

    res.json(openTeams);
  } catch (error) {
    next(error);
  }
};

// ─── Send Join Request (Player → Team) ───────────────────────────────────────
export const sendJoinRequest = async (req, res, next) => {
  try {
    const { teamId } = req.body;
    if (!teamId) { res.status(400); throw new Error('teamId is required'); }

    const team = await Team.findById(teamId).populate('tournament');
    if (!team) { res.status(404); throw new Error('Team not found'); }

    // Cannot request to join your own team
    if (team.leader.toString() === req.user._id.toString()) {
      res.status(400); throw new Error('You are the leader of this team');
    }

    const tournament = team.tournament;

    // Check deadline
    if (new Date(tournament.registrationDeadline) < new Date()) {
      res.status(400); throw new Error('Registration deadline has passed');
    }

    // Check team not already registered
    if (team.registrationId) {
      res.status(400); throw new Error('This team has already registered for the tournament');
    }

    const reqSize = tournament.teamSize || 5;
    const acceptedCount = (team.members || []).filter(m => ['leader', 'accepted'].includes(m.status)).length;
    if (acceptedCount >= reqSize) {
      res.status(400); throw new Error('This team is already full');
    }

    // Check requester is not already a member of this team
    const alreadyMember = (team.members || []).some(
      m => m.user?.toString() === req.user._id.toString() && ['leader', 'accepted', 'pending'].includes(m.status)
    );
    if (alreadyMember) { res.status(400); throw new Error('You are already in this team'); }

    // Check requester not in another team for same tournament
    const inOtherTeam = await Team.findOne({
      tournament: tournament._id,
      _id: { $ne: teamId },
      'members.user': req.user._id,
      'members.status': { $in: ['leader', 'accepted'] },
    });
    if (inOtherTeam) { res.status(400); throw new Error('You are already a member of another team for this tournament'); }

    // Prevent duplicate pending join request
    const existingReq = await JoinRequest.findOne({ team: teamId, requester: req.user._id, status: 'pending' });
    if (existingReq) { res.status(400); throw new Error('You already have a pending join request for this team'); }

    const joinReq = await JoinRequest.create({
      team: teamId,
      tournament: tournament._id,
      requester: req.user._id,
    });

    // Notify leader
    await createNotification(
      team.leader,
      'join_request_received',
      `${req.user.name} wants to join your team "${team.name}" for ${tournament.name}`,
      { relatedTeam: teamId, relatedTournament: tournament._id }
    );

    const populated = await JoinRequest.findById(joinReq._id)
      .populate('team', 'name')
      .populate('tournament', 'name game')
      .populate('requester', 'name username playerId inGameName');

    res.status(201).json(populated);
  } catch (error) {
    next(error);
  }
};

// ─── Get Join Requests for a Team (Leader view) ───────────────────────────────
export const getJoinRequests = async (req, res, next) => {
  try {
    const team = await Team.findById(req.params.teamId);
    if (!team) { res.status(404); throw new Error('Team not found'); }
    if (team.leader.toString() !== req.user._id.toString() && req.user.role !== 'admin') {
      res.status(403); throw new Error('Not authorized');
    }

    const requests = await JoinRequest.find({ team: req.params.teamId })
      .populate('requester', 'name username playerId inGameName')
      .sort({ createdAt: -1 });

    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// ─── Get My Outgoing Join Requests (Requester view) ───────────────────────────
export const getMyJoinRequests = async (req, res, next) => {
  try {
    const requests = await JoinRequest.find({ requester: req.user._id })
      .populate('team', 'name members leader')
      .populate('tournament', 'name game startDate teamSize')
      .sort({ createdAt: -1 });
    res.json(requests);
  } catch (error) {
    next(error);
  }
};

// ─── Respond to Join Request (Leader) ─────────────────────────────────────────
export const respondToJoinRequest = async (req, res, next) => {
  try {
    const { action } = req.body; // 'accept' | 'reject'
    if (!['accept', 'reject'].includes(action)) {
      res.status(400); throw new Error('action must be accept or reject');
    }

    const joinReq = await JoinRequest.findById(req.params.id)
      .populate('team')
      .populate('tournament');
    if (!joinReq) { res.status(404); throw new Error('Join request not found'); }
    if (joinReq.status !== 'pending') { res.status(400); throw new Error('Join request is no longer pending'); }

    const team = joinReq.team;

    // Only leader can respond
    if (team.leader.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Only the team leader can respond to join requests');
    }

    const tournament = joinReq.tournament;

    if (action === 'accept') {
      // Check deadline
      if (new Date(tournament.registrationDeadline) < new Date()) {
        joinReq.status = 'cancelled';
        await joinReq.save();
        res.status(400); throw new Error('Registration deadline has passed');
      }

      const reqSize = tournament.teamSize || 5;
      // Atomic capacity check
      const acceptedCount = (team.members || []).filter(m => ['leader', 'accepted'].includes(m.status)).length;
      if (acceptedCount >= reqSize) {
        joinReq.status = 'cancelled';
        await joinReq.save();
        res.status(400); throw new Error('Team is already full');
      }

      // Check requester not already in another team
      const inOtherTeam = await Team.findOne({
        tournament: tournament._id,
        _id: { $ne: team._id },
        'members.user': joinReq.requester,
        'members.status': { $in: ['leader', 'accepted'] },
      });
      if (inOtherTeam) {
        joinReq.status = 'cancelled';
        await joinReq.save();
        res.status(400); throw new Error('This player is already in another team for this tournament');
      }

      // Add requester to team
      const existingSlot = (team.members || []).findIndex(m => m.user?.toString() === joinReq.requester.toString());
      if (existingSlot !== -1) {
        team.members[existingSlot].status = 'accepted';
        team.members[existingSlot].joinedAt = new Date();
      } else {
        team.members.push({ user: joinReq.requester, status: 'accepted', joinedAt: new Date() });
      }

      // Check if now complete
      const newAccepted = (team.members || []).filter(m => ['leader', 'accepted'].includes(m.status)).length;
      if (newAccepted >= reqSize) {
        team.isComplete = true;
        // Notify all members that team is full
        for (const m of team.members) {
          if (m.user && m.user.toString() !== req.user._id.toString() && m.status !== 'pending') {
            await createNotification(
              m.user,
              'team_full',
              `Team "${team.name}" is now full and ready to register for ${tournament.name}!`,
              { relatedTeam: team._id, relatedTournament: tournament._id }
            );
          }
        }
      }

      await team.save();
      joinReq.status = 'accepted';
      await joinReq.save();

      // Notify requester
      await createNotification(
        joinReq.requester,
        'join_request_accepted',
        `Your request to join team "${team.name}" was accepted! You are now a team member.`,
        { relatedTeam: team._id, relatedTournament: tournament._id }
      );

      // Cancel any other pending join requests from this user for same tournament
      await JoinRequest.updateMany(
        {
          requester: joinReq.requester,
          tournament: tournament._id,
          _id: { $ne: joinReq._id },
          status: 'pending',
        },
        { status: 'cancelled' }
      );

    } else {
      // Reject
      joinReq.status = 'rejected';
      await joinReq.save();

      // Notify requester
      await createNotification(
        joinReq.requester,
        'join_request_rejected',
        `Your request to join team "${team.name}" was not accepted.`,
        { relatedTeam: team._id, relatedTournament: tournament._id }
      );
    }

    res.json({ message: `Join request ${action}ed`, status: joinReq.status });
  } catch (error) {
    next(error);
  }
};

// ─── Cancel Join Request (Requester cancels their own) ───────────────────────
export const cancelJoinRequest = async (req, res, next) => {
  try {
    const joinReq = await JoinRequest.findById(req.params.id).populate('team', 'name');
    if (!joinReq) { res.status(404); throw new Error('Join request not found'); }
    if (joinReq.requester.toString() !== req.user._id.toString()) {
      res.status(403); throw new Error('Not authorized');
    }
    if (joinReq.status !== 'pending') { res.status(400); throw new Error('Join request is not pending'); }

    joinReq.status = 'cancelled';
    await joinReq.save();

    res.json({ message: 'Join request cancelled' });
  } catch (error) {
    next(error);
  }
};
