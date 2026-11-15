import React, { useState } from 'react';
import { X, AlertCircle, CheckCircle, Users, User } from 'lucide-react';
import api from '../services/api';

const EMPTY_PLAYER = { fullName: '', contactNumber: '', inGameName: '' };

const TeamRegistrationForm = ({ tournament, onSuccess, onClose }) => {
  const [teamName, setTeamName] = useState('');
  const [players, setPlayers] = useState(Array(5).fill(null).map(() => ({ ...EMPTY_PLAYER })));
  const [errors, setErrors] = useState({});
  const [submitting, setSubmitting] = useState(false);
  const [apiError, setApiError] = useState(null);
  const [success, setSuccess] = useState(false);

  const validate = () => {
    const newErrors = {};
    if (!teamName.trim()) newErrors.teamName = 'Team name is required.';
    players.forEach((p, i) => {
      if (!p.fullName.trim()) newErrors[`p${i}_fullName`] = 'Full name is required.';
      if (!p.contactNumber.trim()) {
        newErrors[`p${i}_contactNumber`] = 'Contact number is required.';
      } else if (!/^[+]?[\d\s\-]{7,15}$/.test(p.contactNumber.trim())) {
        newErrors[`p${i}_contactNumber`] = 'Enter a valid contact number.';
      }
      if (!p.inGameName.trim()) newErrors[`p${i}_inGameName`] = 'In-game name is required.';
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const updatePlayer = (index, field, value) => {
    const newPlayers = [...players];
    newPlayers[index] = { ...newPlayers[index], [field]: value };
    setPlayers(newPlayers);
    // Clear error for this field
    const key = `p${index}_${field}`;
    if (errors[key]) setErrors(prev => { const e = { ...prev }; delete e[key]; return e; });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError(null);
    if (!validate()) return;

    setSubmitting(true);
    try {
      await api.post(`/registrations/tournaments/${tournament._id}/register`, {
        teamName: teamName.trim(),
        players: players.map(p => ({
          fullName: p.fullName.trim(),
          contactNumber: p.contactNumber.trim(),
          inGameName: p.inGameName.trim(),
        })),
      });
      setSuccess(true);
      setTimeout(() => onSuccess(), 1500);
    } catch (err) {
      setApiError(err.response?.data?.message || 'Registration failed. Please try again.');
    }
    setSubmitting(false);
  };

  return (
    <div className="nb-card w-full max-w-2xl max-h-[90vh] overflow-y-auto bg-white">
      {/* Header */}
      <div className="bg-yellow-400 border-b-2 border-black p-5 flex justify-between items-start sticky top-0 z-10">
        <div>
          <h2 className="font-black text-xl uppercase">Register Your Team</h2>
          <p className="text-sm font-medium">{tournament.name}</p>
        </div>
        <button onClick={onClose} className="border-2 border-black bg-white p-1 hover:bg-red-100 transition-colors">
          <X className="w-5 h-5" />
        </button>
      </div>

      {success ? (
        <div className="p-8 text-center">
          <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
          <h3 className="font-black text-xl uppercase mb-2">Registration Submitted!</h3>
          <p className="text-gray-600">Your team is now pending organizer approval.</p>
        </div>
      ) : (
        <form onSubmit={handleSubmit} className="p-6 space-y-6">
          {apiError && (
            <div className="border-2 border-red-500 bg-red-50 p-4 flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-red-500 shrink-0" />
              <p className="text-sm font-bold text-red-700">{apiError}</p>
            </div>
          )}

          {/* Team Name */}
          <div>
            <label className="nb-label">Team Name *</label>
            <input
              type="text"
              value={teamName}
              onChange={e => { setTeamName(e.target.value); if (errors.teamName) setErrors(p => { const e = {...p}; delete e.teamName; return e; }); }}
              className={`nb-input ${errors.teamName ? 'border-red-500 bg-red-50' : ''}`}
              placeholder="Enter your team name"
            />
            {errors.teamName && <p className="text-red-600 text-xs font-bold mt-1">{errors.teamName}</p>}
          </div>

          {/* Players */}
          <div className="space-y-4">
            <h3 className="font-black uppercase tracking-wide flex items-center gap-2 border-b-2 border-black pb-2">
              <Users className="w-5 h-5" /> Player Roster (5 Players Required)
            </h3>

            {players.map((player, i) => (
              <div key={i} className="border-2 border-black p-4 bg-gray-50">
                <div className="flex items-center gap-2 mb-3">
                  <div className="w-7 h-7 bg-black text-yellow-400 flex items-center justify-center font-black text-sm shrink-0">
                    {i + 1}
                  </div>
                  <h4 className="font-black uppercase text-sm">Player {i + 1}</h4>
                </div>

                <div className="grid md:grid-cols-3 gap-3">
                  <div>
                    <label className="nb-label text-xs">Full Name *</label>
                    <input
                      type="text"
                      value={player.fullName}
                      onChange={e => updatePlayer(i, 'fullName', e.target.value)}
                      className={`nb-input text-sm ${errors[`p${i}_fullName`] ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="Full name"
                    />
                    {errors[`p${i}_fullName`] && <p className="text-red-600 text-xs font-bold mt-1">{errors[`p${i}_fullName`]}</p>}
                  </div>
                  <div>
                    <label className="nb-label text-xs">Contact Number *</label>
                    <input
                      type="tel"
                      value={player.contactNumber}
                      onChange={e => updatePlayer(i, 'contactNumber', e.target.value)}
                      className={`nb-input text-sm ${errors[`p${i}_contactNumber`] ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="+91 9876543210"
                    />
                    {errors[`p${i}_contactNumber`] && <p className="text-red-600 text-xs font-bold mt-1">{errors[`p${i}_contactNumber`]}</p>}
                  </div>
                  <div>
                    <label className="nb-label text-xs">In-Game Name *</label>
                    <input
                      type="text"
                      value={player.inGameName}
                      onChange={e => updatePlayer(i, 'inGameName', e.target.value)}
                      className={`nb-input text-sm ${errors[`p${i}_inGameName`] ? 'border-red-500 bg-red-50' : ''}`}
                      placeholder="IGN / Gamer tag"
                    />
                    {errors[`p${i}_inGameName`] && <p className="text-red-600 text-xs font-bold mt-1">{errors[`p${i}_inGameName`]}</p>}
                  </div>
                </div>
              </div>
            ))}
          </div>

          {/* Submit */}
          <div className="flex gap-3 pt-2 border-t-2 border-black">
            <button type="button" onClick={onClose} className="nb-btn-secondary flex-1">Cancel</button>
            <button
              type="submit"
              disabled={submitting}
              className="nb-btn-primary flex-1 flex items-center justify-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {submitting ? (
                <>
                  <div className="w-4 h-4 border-2 border-black border-t-transparent rounded-full animate-spin"></div>
                  Submitting...
                </>
              ) : 'Submit Team Registration'}
            </button>
          </div>
        </form>
      )}
    </div>
  );
};

export default TeamRegistrationForm;
