import React, { useState, useEffect } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { Sun, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';
import { DotGrid } from '../components/common/DotGrid';
import { AuthInitializingScreen } from '../components/common/AuthInitializingScreen';

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  owner_admin: '/',
  sales_exec: '/sales-overview',
  survey_tech: '/field',
  engineering_lead: '/engineering',
  warehouse_mgr: '/inventory',
  install_tech: '/installations',
  support_exec: '/service',
  accountant: '/finance',
};

export const LoginPage: React.FC = () => {
  const { showToast, login, isAuthenticated, isInitializing, currentUser } = useApp();
  const navigate = useNavigate();
  const location = useLocation();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(true);

  // If already authenticated, redirect user immediately to their destination or dashboard
  useEffect(() => {
    if (!isInitializing && isAuthenticated) {
      const destination = location.state?.from?.pathname || ROLE_DASHBOARDS[currentUser.role] || '/';
      navigate(destination, { replace: true });
    }
  }, [isInitializing, isAuthenticated, currentUser, location.state, navigate]);

  if (isInitializing) {
    return <AuthInitializingScreen />;
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    const user = await login(email, password, rememberMe);
    
    if (!user) {
      setError('Invalid email or password.');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      const destination = location.state?.from?.pathname || ROLE_DASHBOARDS[user.role] || '/';
      navigate(destination, { replace: true });
      setIsLoading(false);
    }, 400);
  };

  return (
    <main className="relative min-h-screen overflow-hidden bg-sand-100 selection:bg-navy selection:text-white" style={{ fontFamily: 'Cambria, Georgia, serif' }}>
      <DotGrid
        baseColor="#D8D0C4"
        activeColor="#183153"
        dotSize={1.5}
        gap={18}
        proximity={110}
        glow={0.45}
      />
      <div className="pointer-events-none absolute inset-0 bg-gradient-to-br from-sand-50/90 via-sand-100/45 to-sand/70" />

      <div className="relative z-10 min-h-screen">
        <nav className="mx-auto flex max-w-[1440px] items-center justify-between px-6 py-5 sm:px-10 lg:px-14">
          <Link to="/login" className="flex items-center gap-3">
            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-amber text-charcoal shadow-card">
              <Sun className="h-5 w-5 fill-current" />
            </div>
            <div>
              <div className="text-xl font-bold leading-none text-charcoal">SolarOS</div>
              <div className="mt-1 text-[10px] font-bold uppercase tracking-[0.22em] text-amber">Enterprise</div>
            </div>
          </Link>
          <button
            type="button"
            onClick={() => document.getElementById('sign-in')?.scrollIntoView({ behavior: 'smooth', block: 'center' })}
            className="rounded-xl border border-warmGrey/80 bg-white/80 px-4 py-2 text-xs font-bold text-navy shadow-card backdrop-blur-sm transition-colors hover:bg-white"
          >
            Sign In
          </button>
        </nav>

        <div className="mx-auto grid min-h-[calc(100vh-81px)] max-w-[1440px] items-center gap-12 px-6 pb-12 pt-8 sm:px-10 lg:grid-cols-[minmax(0,1.15fr)_420px] lg:px-14 lg:pb-16">
          <section className="max-w-3xl">
            <div className="mb-6 inline-flex items-center gap-2 rounded-full border border-warmGrey/70 bg-white/70 px-3 py-1.5 text-xs font-semibold text-navy shadow-card backdrop-blur-sm">
              <span className="h-2 w-2 rounded-full bg-sage" />
              SunPower Solutions Operating System
            </div>
            <h1 className="max-w-2xl text-5xl font-bold leading-[1.02] tracking-tight text-charcoal sm:text-6xl lg:text-[72px]">
              Power every solar project with clarity.
            </h1>
            <p className="mt-6 max-w-xl text-lg leading-8 text-mutedGrey-dark">
              One secure workspace for sales, operations, finance, installations and customer service.
            </p>

            <div className="mt-8 grid max-w-2xl grid-cols-1 gap-3 sm:grid-cols-3">
              {[
                ['Live operations', 'Plans, surveys and installations'],
                ['Financial control', 'Orders, payments and profitability'],
                ['One connected team', 'Role-based enterprise access'],
              ].map(([title, description]) => (
                <div key={title} className="rounded-xl border border-warmGrey/70 bg-white/65 p-4 shadow-card backdrop-blur-sm">
                  <div className="text-sm font-bold text-charcoal">{title}</div>
                  <div className="mt-1 text-xs leading-5 text-mutedGrey">{description}</div>
                </div>
              ))}
            </div>
          </section>

          <div id="sign-in" className="w-full max-w-md justify-self-end">
            <div className="mb-5 text-left">
              <h2 className="text-2xl font-bold text-charcoal">Sign in to SolarOS</h2>
              <p className="mt-1 text-sm text-mutedGrey">Access your role-based dashboard</p>
            </div>

            <div className="rounded-2xl border border-warmGrey/80 bg-white/92 p-6 shadow-[0_20px_50px_-20px_rgba(24,49,83,0.22)] backdrop-blur-md sm:p-7">
          {error && (
            <div className="mb-6 p-3.5 bg-terracotta-50 border border-terracotta/30 rounded-xl flex items-start space-x-3 animate-in slide-in-from-top-2">
              <AlertCircle className="w-5 h-5 text-terracotta shrink-0 mt-0.5" />
              <div className="text-sm text-terracotta">
                <p className="font-semibold">Authentication Failed</p>
                <p className="text-xs mt-0.5">{error}</p>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label htmlFor="email" className="block text-xs font-semibold text-charcoal mb-1.5">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedGrey" />
                <input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="vikram.rao@sunpowersolutions.in"
                  className="w-full pl-11 pr-4 py-3 text-sm bg-sand-50 border border-warmGrey/60 rounded-xl text-charcoal placeholder:text-mutedGrey focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
                  autoComplete="email"
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-1.5">
                <label htmlFor="password" className="block text-xs font-semibold text-charcoal">
                  Password
                </label>

              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 w-5 h-5 text-mutedGrey" />
                <input
                  id="password"
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Enter your password"
                  className="w-full pl-11 pr-12 py-3 text-sm bg-sand-50 border border-warmGrey/60 rounded-xl text-charcoal placeholder:text-mutedGrey focus:outline-none focus:ring-2 focus:ring-navy focus:border-transparent transition-all"
                  autoComplete="current-password"
                  disabled={isLoading}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3.5 top-1/2 -translate-y-1/2 text-mutedGrey hover:text-charcoal transition-colors"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                >
                  {showPassword ? <EyeOff className="w-5 h-5" /> : <Eye className="w-5 h-5" />}
                </button>
              </div>
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between">
              <label className="flex items-center space-x-2 cursor-pointer">
                <input
                  type="checkbox"
                  checked={rememberMe}
                  onChange={(e) => setRememberMe(e.target.checked)}
                  className="w-4 h-4 rounded border-warmGrey text-navy focus:ring-navy focus:ring-2"
                />
                <span className="text-xs text-charcoal">Remember me</span>
              </label>
              <button
                type="button"
                className="text-xs text-navy hover:underline font-medium"
              >
                Forgot password?
              </button>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3 bg-navy text-white text-sm font-semibold rounded-xl hover:bg-navy-light focus:outline-none focus:ring-2 focus:ring-navy focus:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed transition-all flex items-center justify-center space-x-2"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin h-5 w-5" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z" />
                  </svg>
                  <span>Signing in...</span>
                </>
              ) : (
                <>
                  <span>Sign In</span>
                  <CheckCircle className="w-4 h-4" />
                </>
              )}
            </button>
          </form>

            </div>
          </div>
        </div>
      </div>
    </main>
  );
};