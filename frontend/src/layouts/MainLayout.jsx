import React, { useContext, useState, useEffect } from 'react';
import { Outlet, Link, useNavigate, useLocation } from 'react-router-dom';
import { Zap, LogOut, LayoutDashboard, Trophy, Menu, X, Bell } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const MainLayout = () => {
  const { user, logout } = useContext(AuthContext);
  const navigate = useNavigate();
  const location = useLocation();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const [unread, setUnread] = useState(0);

  useEffect(() => {
    if (user) setUnread(user.unreadNotifications || 0);
  }, [user]);

  useEffect(() => {
    const onScroll = () => setScrolled(window.scrollY > 10);
    window.addEventListener('scroll', onScroll);
    return () => window.removeEventListener('scroll', onScroll);
  }, []);

  useEffect(() => { setMobileOpen(false); }, [location]);

  const handleLogout = () => { logout(); navigate('/'); };

  const getDashboardPath = () => {
    if (!user) return '/login';
    if (user.role === 'organizer') return '/organizer';
    if (user.role === 'admin') return '/admin';
    return '/dashboard';
  };

  const isActive = (path) =>
    path === '/' ? location.pathname === '/' : location.pathname.startsWith(path);

  const navLinks = [
    { to: '/tournaments', label: 'Tournaments' },
    { to: '/about', label: 'About' },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-cyber-bg text-cyber-text">
      {/* ── NAVBAR ── */}
      <header className={`sticky top-0 z-50 transition-all duration-200 ${scrolled ? 'shadow-lg' : 'shadow-sm'}`}
        style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 40%, #6d28d9 100%)' }}>
        <div className="max-w-7xl mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-16">

            {/* Logo */}
            <Link to="/" className="flex items-center gap-2.5 group">
              <div className="bg-white/15 border border-white/25 p-1.5 rounded-lg group-hover:bg-white/25 transition-colors">
                <Zap className="w-4 h-4 text-white" />
              </div>
              <span className="pixel-heading text-[11px] text-white drop-shadow-sm">
                Esportify
              </span>
            </Link>

            {/* Desktop Nav Links */}
            <nav className="hidden md:flex items-center gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2 text-sm font-semibold rounded-lg transition-all duration-150 ${
                    isActive(link.to)
                      ? 'bg-white/20 text-white'
                      : 'text-violet-100 hover:text-white hover:bg-white/10'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
            </nav>

            {/* Auth Buttons */}
            <div className="hidden md:flex items-center gap-2">
              {user ? (
                <>
                  {user.role === 'user' && (
                    <Link
                      to="/dashboard/notifications"
                      className="relative p-2 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
                    >
                      <Bell className="w-5 h-5" />
                      {unread > 0 && (
                        <span className="absolute top-0.5 right-0.5 bg-rose-400 text-white text-[10px] min-w-[16px] h-4 flex items-center justify-center rounded-full font-bold px-0.5">
                          {unread > 9 ? '9+' : unread}
                        </span>
                      )}
                    </Link>
                  )}
                  <Link
                    to={getDashboardPath()}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-all"
                  >
                    <LayoutDashboard className="w-3.5 h-3.5" />
                    Dashboard
                  </Link>
                  <button
                    onClick={handleLogout}
                    className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-violet-200 hover:text-white hover:bg-white/10 transition-all"
                  >
                    <LogOut className="w-3.5 h-3.5" />
                    Logout
                  </button>
                </>
              ) : (
                <>
                  <Link to="/login" className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg text-violet-100 hover:text-white hover:bg-white/10 transition-all">
                    Login
                  </Link>
                  <Link to="/register" className="inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-2 rounded-lg bg-white text-violet-700 hover:bg-violet-50 transition-all shadow-sm">
                    Sign Up
                  </Link>
                </>
              )}
            </div>

            {/* Mobile toggle */}
            <button
              onClick={() => setMobileOpen(!mobileOpen)}
              className="md:hidden p-2 text-violet-200 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            >
              {mobileOpen ? <X className="w-5 h-5" /> : <Menu className="w-5 h-5" />}
            </button>
          </div>
        </div>

        {/* Mobile Menu */}
        {mobileOpen && (
          <div className="md:hidden border-t border-white/15" style={{ background: 'rgba(76,29,149,0.97)' }}>
            <div className="max-w-7xl mx-auto px-4 py-3 flex flex-col gap-1">
              {navLinks.map(link => (
                <Link
                  key={link.to}
                  to={link.to}
                  className={`px-4 py-2.5 text-sm font-semibold rounded-lg ${
                    isActive(link.to)
                      ? 'bg-white/20 text-white'
                      : 'text-violet-100 hover:bg-white/10 hover:text-white'
                  }`}
                >
                  {link.label}
                </Link>
              ))}
              <div className="border-t border-white/15 pt-2 mt-1 flex flex-col gap-1">
                {user ? (
                  <>
                    <Link to={getDashboardPath()} className="text-center text-xs font-semibold py-2.5 px-4 rounded-lg bg-white/15 border border-white/25 text-white hover:bg-white/25 transition-all">
                      Dashboard
                    </Link>
                    <button onClick={handleLogout} className="text-center text-xs font-semibold py-2.5 px-4 rounded-lg text-violet-200 hover:bg-white/10 hover:text-white transition-all">
                      Logout
                    </button>
                  </>
                ) : (
                  <>
                    <Link to="/login" className="text-center text-xs font-semibold py-2.5 px-4 rounded-lg text-violet-100 hover:bg-white/10 hover:text-white transition-all">Login</Link>
                    <Link to="/register" className="text-center text-xs font-semibold py-2.5 px-4 rounded-lg bg-white text-violet-700 hover:bg-violet-50 transition-all">Sign Up</Link>
                  </>
                )}
              </div>
            </div>
          </div>
        )}
      </header>

      {/* ── MAIN ── */}
      <main className="flex-1 w-full max-w-7xl mx-auto px-4 sm:px-6 py-8">
        <Outlet />
      </main>

      {/* ── FOOTER ── */}
      <footer style={{ background: 'linear-gradient(135deg, #4c1d95 0%, #5b21b6 40%, #6d28d9 100%)' }} className="mt-auto">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 py-10">
          <div className="flex flex-col md:flex-row justify-between gap-8">
            {/* Brand */}
            <div className="max-w-xs">
              <div className="flex items-center gap-2 mb-3">
                <div className="bg-white/15 border border-white/25 p-1.5 rounded-lg">
                  <Zap className="w-4 h-4 text-white" />
                </div>
                <span className="pixel-heading text-[11px] text-white">Esportify</span>
              </div>
              <p className="text-violet-200 text-sm leading-relaxed">
                The centralized esports tournament platform. Form teams, compete, and track your competitive journey.
              </p>
            </div>

            {/* Links */}
            <div className="flex flex-wrap gap-10">
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-4">Platform</h4>
                <div className="flex flex-col gap-2">
                  {[['/', 'Home'], ['/tournaments', 'Tournaments'], ['/about', 'About']].map(([to, label]) => (
                    <Link key={to} to={to} className="text-sm text-violet-200 hover:text-white transition-colors">{label}</Link>
                  ))}
                </div>
              </div>
              <div>
                <h4 className="text-xs font-bold uppercase tracking-widest text-violet-300 mb-4">Legal</h4>
                <div className="flex flex-col gap-2">
                  {[['/terms', 'Terms'], ['/privacy', 'Privacy'], ['/contact', 'Contact']].map(([to, label]) => (
                    <Link key={to} to={to} className="text-sm text-violet-200 hover:text-white transition-colors">{label}</Link>
                  ))}
                </div>
              </div>
            </div>
          </div>

          <div className="border-t border-white/15 mt-8 pt-6 flex flex-col sm:flex-row justify-between items-center gap-2 text-xs text-violet-300">
            <span>© {new Date().getFullYear()} Esportify. All rights reserved.</span>
            <span className="text-white/60 pixel-heading text-[8px]">Built for competitors</span>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default MainLayout;
