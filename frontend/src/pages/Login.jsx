import React, { useState, useContext } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Zap, Eye, EyeOff, AlertCircle, ShieldCheck } from 'lucide-react';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
  const [email, setEmail]       = useState('');
  const [password, setPassword] = useState('');
  const [showPw, setShowPw]     = useState(false);
  const [error, setError]       = useState(null);
  const [loading, setLoading]   = useState(false);
  const { login } = useContext(AuthContext);
  const navigate  = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError(null);
    setLoading(true);
    try {
      const userData = await login(email, password);
      const dest =
        userData.role === 'admin'     ? '/admin' :
        userData.role === 'organizer' ? '/organizer' :
                                        '/dashboard';
      navigate(dest, { replace: true });
    } catch (err) {
      setError(err.response?.data?.message || 'Invalid credentials. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-[80vh] flex items-center justify-center py-8">
      <div className="w-full max-w-md">

        {/* Card */}
        <div className="cyber-card overflow-visible">
          {/* Top accent bar */}
          <div className="h-1.5 bg-gradient-to-r from-violet-600 via-sky-500 to-violet-600 rounded-t-xl" />

          {/* Header */}
          <div className="px-8 pt-8 pb-6 text-center border-b border-slate-100">
            <Link to="/" className="inline-flex items-center gap-2 mb-5 group">
              <div className="bg-violet-700 p-2 rounded-lg shadow-sm group-hover:bg-violet-800 transition-colors">
                <Zap className="w-5 h-5 text-white" />
              </div>
              <span className="pixel-heading text-[11px] text-violet-700">Esportify</span>
            </Link>
            <h1 className="text-2xl font-black text-slate-900 mb-1">Welcome Back</h1>
            <p className="text-slate-500 text-sm">Sign in to your account to continue</p>
          </div>

          {/* Form */}
          <div className="px-8 py-7">
            {error && (
              <div className="alert-error mb-5 text-sm">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-5">
              <div>
                <label className="cyber-label">Email or Username</label>
                <input
                  type="text"
                  required
                  value={email}
                  onChange={e => setEmail(e.target.value)}
                  className="cyber-input"
                  placeholder="you@example.com or username"
                  autoComplete="username"
                />
              </div>

              <div>
                <label className="cyber-label">Password</label>
                <div className="relative">
                  <input
                    type={showPw ? 'text' : 'password'}
                    required
                    value={password}
                    onChange={e => setPassword(e.target.value)}
                    className="cyber-input pr-10"
                    placeholder="••••••••"
                    autoComplete="current-password"
                  />
                  <button
                    type="button"
                    onClick={() => setShowPw(!showPw)}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-700 transition-colors"
                  >
                    {showPw ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="cyber-btn-primary w-full py-3 text-sm"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/40 border-t-white rounded-full animate-spin" />
                    Signing In...
                  </>
                ) : 'Sign In'}
              </button>
            </form>

            <p className="mt-6 text-center text-sm text-slate-500">
              Don't have an account?{' '}
              <Link to="/register" className="text-violet-700 hover:text-violet-800 font-semibold">
                Create Account
              </Link>
            </p>

            {/* Admin Access link */}
            <div className="mt-5 pt-5 border-t border-slate-100 text-center">
              <div className="inline-flex items-center gap-2 px-4 py-2.5 bg-slate-50 border border-slate-200 rounded-lg">
                <ShieldCheck className="w-4 h-4 text-slate-500" />
                <div className="text-left">
                  <p className="text-xs font-semibold text-slate-700">Admin Access</p>
                  <p className="text-[11px] text-slate-400 leading-tight">
                    Admins use this same login form.{' '}
                    <Link to="/register" className="text-violet-600 hover:underline">
                      Not an admin? Sign up here.
                    </Link>
                  </p>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Footer note */}
        <p className="text-center text-xs text-slate-400 mt-4">
          By signing in, you agree to our{' '}
          <Link to="/terms" className="text-violet-600 hover:underline">Terms</Link> and{' '}
          <Link to="/privacy" className="text-violet-600 hover:underline">Privacy Policy</Link>.
        </p>
      </div>
    </div>
  );
};

export default Login;
