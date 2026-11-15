import React from 'react';
import { BrowserRouter as Router, Routes, Route } from 'react-router-dom';
import { AuthProvider } from './context/AuthContext';

// Layouts
import MainLayout from './layouts/MainLayout';
import DashboardLayout from './layouts/DashboardLayout';

// Public Pages
import Home from './pages/Home';
import TournamentList from './pages/TournamentList';
import TournamentDetails from './pages/TournamentDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import NotFound from './pages/NotFound';
import About from './pages/About';
import Terms from './pages/Terms';
import Privacy from './pages/Privacy';
import Contact from './pages/Contact';

// Participant Dashboard Pages
import UserDashboard from './pages/UserDashboard';
import MyRegistrations from './pages/MyRegistrations';
import Profile from './pages/Profile';
import MyTeams from './pages/MyTeams';
import TeamDetail from './pages/TeamDetail';
import CreateTeam from './pages/CreateTeam';
import Invitations from './pages/Invitations';
import Notifications from './pages/Notifications';
import JoinRequests from './pages/JoinRequests';
import FindTeam from './pages/FindTeam';

// Organizer Dashboard Pages
import OrganizerDashboard from './pages/OrganizerDashboard';
import MyTournaments from './pages/MyTournaments';
import CreateEditTournament from './pages/CreateEditTournament';
import ManageRegistrations from './pages/ManageRegistrations';
import BracketManagement from './pages/BracketManagement';

// Admin Dashboard Pages
import AdminDashboard from './pages/AdminDashboard';
import AdminUsers from './pages/AdminUsers';
import AdminTournaments from './pages/AdminTournaments';
import AdminRegistrations from './pages/AdminRegistrations';
import TournamentBracket from './pages/TournamentBracket';

const App = () => {
  return (
    <AuthProvider>
      <Router>
        <Routes>
          <Route path="/" element={<MainLayout />}>
            {/* Public Routes */}
            <Route index element={<Home />} />
            <Route path="tournaments" element={<TournamentList />} />
            <Route path="tournaments/:id" element={<TournamentDetails />} />
            <Route path="tournaments/:id/bracket" element={<TournamentBracket />} />
            <Route path="tournaments/:id/find-team" element={<FindTeam />} />
            <Route path="login" element={<Login />} />
            <Route path="register" element={<Register />} />
            <Route path="about" element={<About />} />
            <Route path="terms" element={<Terms />} />
            <Route path="privacy" element={<Privacy />} />
            <Route path="contact" element={<Contact />} />

            {/* Participant Dashboard Routes */}
            <Route path="dashboard" element={<DashboardLayout roleRequired="user" />}>
              <Route index element={<UserDashboard />} />
              <Route path="registrations" element={<MyRegistrations />} />
              <Route path="profile" element={<Profile />} />
              <Route path="teams" element={<MyTeams />} />
              <Route path="teams/create" element={<CreateTeam />} />
              <Route path="teams/:id" element={<TeamDetail />} />
              <Route path="invitations" element={<Invitations />} />
              <Route path="join-requests" element={<JoinRequests />} />
              <Route path="notifications" element={<Notifications />} />
            </Route>

            {/* Organizer Dashboard Routes */}
            <Route path="organizer" element={<DashboardLayout roleRequired="organizer" />}>
              <Route index element={<OrganizerDashboard />} />
              <Route path="tournaments" element={<MyTournaments />} />
              <Route path="tournaments/new" element={<CreateEditTournament />} />
              <Route path="tournaments/:id/edit" element={<CreateEditTournament />} />
              <Route path="tournaments/:id/registrations" element={<ManageRegistrations />} />
              <Route path="tournaments/:id/bracket" element={<BracketManagement />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* Admin Dashboard Routes */}
            <Route path="admin" element={<DashboardLayout roleRequired="admin" />}>
              <Route index element={<AdminDashboard />} />
              <Route path="users" element={<AdminUsers />} />
              <Route path="tournaments" element={<AdminTournaments />} />
              <Route path="registrations" element={<AdminRegistrations />} />
              <Route path="profile" element={<Profile />} />
            </Route>

            {/* 404 */}
            <Route path="*" element={<NotFound />} />
          </Route>
        </Routes>
      </Router>
    </AuthProvider>
  );
};

export default App;
