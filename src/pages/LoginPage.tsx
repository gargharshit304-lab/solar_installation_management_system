import React, { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Sun, Mail, Lock, Eye, EyeOff, AlertCircle, CheckCircle } from 'lucide-react';
import { useApp } from '../context/AppContext';
import { UserRole } from '../types';

const DEMO_PASSWORD = 'solaros2026';

const ROLE_DASHBOARDS: Record<UserRole, string> = {
  owner_admin: '/',
  sales_exec: '/customers',
  survey_tech: '/surveys',
  warehouse_mgr: '/inventory',
  install_tech: '/installations',
  support_exec: '/service',
  accountant: '/finance',
};

export const LoginPage: React.FC = () => {
  const { usersList, switchRole, showToast, login } = useApp();
  const navigate = useNavigate();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const [rememberMe, setRememberMe] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');

    if (!email || !password) {
      setError('Please enter both email and password');
      return;
    }

    setIsLoading(true);
    
    const user = await login(email, password);
    
    if (!user) {
      setError('Invalid email or password. Demo password: solaros2026');
      setIsLoading(false);
      return;
    }

    setTimeout(() => {
      switchRole(user.role);
      showToast(`Welcome back, ${user.name}!`, 'success');
      
      const dashboardRoute = ROLE_DASHBOARDS[user.role] || '/';
      navigate(dashboardRoute, { replace: true });
      setIsLoading(false);
    }, 500);
  };

  return (
    <div className="min-h-screen bg-sand flex items-center justify-center p-4 selection:bg-navy selection:text-white">
      <div className="w-full max-w-md">
        {/* Logo & Brand */}
        <div className="text-center mb-8">
          <Link to="/" className="inline-flex items-center space-x-3 mb-6">
            <div className="w-14 h-14 rounded-2xl bg-amber flex items-center justify-center text-charcoal shadow-lg">
              <Sun className="w-7 h-7 fill-current" />
            </div>
            <div className="text-left">
              <div className="font-bold text-2xl tracking-tight text-charcoal">SolarOS</div>
              <div className="text-xs font-semibold uppercase tracking-wider text-amber">Enterprise</div>
            </div>
          </Link>
          <h1 className="text-xl font-bold text-charcoal">Sign In to Your Dashboard</h1>
          <p className="text-sm text-mutedGrey mt-1">SunPower Solutions Operating System</p>
        </div>

        {/* Login Card */}
        <div className="bg-white rounded-2xl border border-warmGrey shadow-card p-6 sm:p-8">
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
                <span className="text-xs text-navy font-medium cursor-pointer hover:underline">
                  Demo: solaros2026
                </span>
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

          {/* Demo Accounts Quick Access */}
          <div className="mt-8 pt-6 border-t border-warmGrey/60">
            <p className="text-xs text-mutedGrey text-center mb-4">Quick Demo Access</p>
            <div className="grid grid-cols-2 gap-2">
              {usersList.map(user => (
                <button
                  key={user.id}
                  type="button"
                  onClick={() => {
                    setEmail(user.email);
                    setPassword(DEMO_PASSWORD);
                  }}
                  className="p-2.5 text-xs text-charcoal hover:bg-sand-100 rounded-xl border border-warmGrey/60 transition-colors text-left"
                >
                  <div className="font-medium truncate">{user.name}</div>
                  <div className="text-[10px] text-mutedGrey truncate">{user.roleTitle}</div>
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center mt-6 text-xs text-mutedGrey">
          <p>SunPower Solutions &copy; 2026 &mdash; Enterprise Solar Installation Management</p>
        </div>
      </div>
    </div>
  );
};