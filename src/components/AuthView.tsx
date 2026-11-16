import React, { useState } from 'react';
import { User } from '../types';
import { Logo } from './Logo';
import {
  LogIn,
  UserPlus,
  AlertCircle,
  Eye,
  EyeOff,
  Loader2,
  Zap,
  ShieldCheck,
  FileText,
  Mic,
  BarChart3,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User, rememberMe: boolean) => void;
}

export function AuthView({ onLogin }: AuthViewProps) {
  const [isLogin, setIsLogin] = useState(true);
  const [isForgotPassword, setIsForgotPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [fullName, setFullName] = useState('');
  const [rememberMe, setRememberMe] = useState(true);
  const [passwordlessDemo, setPasswordlessDemo] = useState(false);
  const [loadingAction, setLoadingAction] = useState<
    null | 'submit' | 'guest' | 'google' | 'github'
  >(null);
  const [error, setError] = useState('');
  const [success, setSuccess] = useState('');

  const persistAndLogin = (userObj: User) => {
    const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');
    if (!usersDB[userObj.email]) {
      usersDB[userObj.email] = {
        password: password || 'demo-access',
        user: userObj,
      };
      localStorage.setItem('usersDB', JSON.stringify(usersDB));
    }
    onLogin(userObj, rememberMe);
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoadingAction('submit');

    setTimeout(() => {
      const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');

      if (isForgotPassword) {
        if (usersDB[trimmedEmail]) {
          setSuccess(
            `Password reset instructions sent to ${trimmedEmail}. Returning to sign in.`
          );
          setLoadingAction(null);
          setTimeout(() => setIsForgotPassword(false), 2200);
        } else {
          setError('No account found with that email address.');
          setLoadingAction(null);
        }
        return;
      }

      if (passwordlessDemo && isLogin) {
        const existingUser = usersDB[trimmedEmail]?.user;
        const quickUser: User = existingUser || {
          id: Math.random().toString(36).slice(2, 11),
          email: trimmedEmail,
          fullName: trimmedEmail.split('@')[0] || 'Candidate',
          joinDate: new Date().toISOString(),
          totalInterviews: 0,
          averageScore: 0,
          themePreference: 'amoled',
          authProvider: 'email',
        };
        setLoadingAction(null);
        persistAndLogin(quickUser);
        return;
      }

      if (isLogin) {
        if (usersDB[trimmedEmail]) {
          if (usersDB[trimmedEmail].password === password) {
            setLoadingAction(null);
            onLogin(usersDB[trimmedEmail].user, rememberMe);
            return;
          } else {
            setError('Incorrect password. Try again or enable Quick Demo Mode.');
            setLoadingAction(null);
            return;
          }
        } else {
          setError('Account not found. Switch to Create Account or use Instant Demo.');
          setLoadingAction(null);
          return;
        }
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          setLoadingAction(null);
          return;
        }
        if (usersDB[trimmedEmail]) {
          setError('Account already exists. Sign in instead.');
          setLoadingAction(null);
          return;
        }

        const newUser: User = {
          id: Math.random().toString(36).slice(2, 11),
          email: trimmedEmail,
          fullName: fullName.trim() || 'Candidate',
          joinDate: new Date().toISOString(),
          totalInterviews: 0,
          averageScore: 0,
          themePreference: 'amoled',
          authProvider: 'email',
        };

        usersDB[trimmedEmail] = {
          password,
          user: newUser,
        };
        localStorage.setItem('usersDB', JSON.stringify(usersDB));
        setLoadingAction(null);
        onLogin(newUser, rememberMe);
      }
    }, 450);
  };

  const handleInstantGuest = () => {
    setError('');
    setLoadingAction('guest');
    setTimeout(() => {
      const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');
      const guestEmail = 'demo@interviewcopilot.pro';
      const existing = usersDB[guestEmail]?.user;
      const guestUser: User = existing || {
        id: 'guest-pro',
        email: guestEmail,
        fullName: 'Alex Rivera',
        joinDate: new Date().toISOString(),
        totalInterviews: 0,
        averageScore: 0,
        themePreference: 'amoled',
        authProvider: 'guest',
      };
      setLoadingAction(null);
      persistAndLogin(guestUser);
    }, 450);
  };

  const handleFederatedQuickConnect = (provider: 'google' | 'github') => {
    setError('');
    setLoadingAction(provider);
    setTimeout(() => {
      const providerEmail =
        provider === 'google'
          ? 'candidate.google@interviewcopilot.pro'
          : 'dev.github@interviewcopilot.pro';
      const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');
      const existing = usersDB[providerEmail]?.user;
      const socialUser: User = existing || {
        id: `${provider}-${Math.random().toString(36).slice(2, 8)}`,
        email: providerEmail,
        fullName: provider === 'google' ? 'Jordan Lee' : 'Samir Patel',
        joinDate: new Date().toISOString(),
        totalInterviews: 0,
        averageScore: 0,
        themePreference: 'amoled',
        authProvider: provider,
      };
      setLoadingAction(null);
      persistAndLogin(socialUser);
    }, 550);
  };

  return (
    <div className="min-h-screen bg-black text-slate-100 flex flex-col lg:flex-row relative overflow-hidden">
      {/* Subtle AMOLED electric blue atmospheric backdrop */}
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-blue-600/15 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-cyan-500/10 blur-[150px]" />
      </div>

      {/* Left Showcase Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative z-10 flex-col justify-between p-12 border-r border-[#16223b] bg-gradient-to-br from-[#020612] via-black to-black">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl border border-blue-500/30 overflow-hidden shrink-0">
            <Logo />
          </div>
          <span className="text-lg font-bold tracking-tight text-white">
            Interview Copilot
          </span>
        </div>

        <div className="max-w-xl space-y-8 my-auto py-8">
          <div className="space-y-4">
            <p className="text-sm font-medium text-blue-400">
              Resume-Grounded AI Interview Studio
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-white leading-[1.12] [text-wrap:balance]">
              Practice with questions pulled straight from your resume.
            </h1>
            <p className="text-slate-400 text-base leading-relaxed">
              Upload your PDF, DOCX, or TXT resume and step into an adaptive voice
              or text interview engineered around your real projects, custom
              difficulty, and target company bar.
            </p>
          </div>

          {/* Animated Studio Preview Card (Clean AMOLED surface, no macOS dots) */}
          <div className="rounded-2xl border border-blue-500/20 bg-[#050912] p-6 space-y-5 shadow-2xl shadow-blue-950/30">
            <div className="flex items-center justify-between border-b border-[#16223b] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-blue-600/15 border border-blue-500/30 flex items-center justify-center text-blue-400">
                  <Mic size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-white">
                    Live Resume Probe
                  </div>
                  <div className="text-xs text-slate-400">
                    System Design · Hard Difficulty
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-cyan-400 tabular-nums">
                Turn 01 / 28:40
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-[#0a1120] border border-[#16223b] p-3.5 text-slate-200 leading-relaxed">
                “I noticed on your resume you scaled a Redis caching layer to cut
                checkout latency by 42%. How did you prevent cache stampedes
                during peak flash sales?”
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-xl bg-black border border-[#16223b] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <FileText size={13} className="text-blue-400" />
                    <span>Resume Hook</span>
                  </div>
                  <div className="text-sm font-semibold text-white tabular-nums">
                    94% Match
                  </div>
                </div>
                <div className="rounded-xl bg-black border border-[#16223b] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <BarChart3 size={13} className="text-cyan-400" />
                    <span>Depth Score</span>
                  </div>
                  <div className="text-sm font-semibold text-white tabular-nums">
                    88 / 100
                  </div>
                </div>
                <div className="rounded-xl bg-black border border-[#16223b] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-slate-400 mb-1">
                    <ShieldCheck size={13} className="text-emerald-400" />
                    <span>Verdict</span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-400">
                    Strong Hire
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs text-slate-400">
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
              <span>PDF, DOCX &amp; TXT Parsing</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
              <span>Voice + Camera Studio</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2 size={15} className="text-blue-400 shrink-0" />
              <span>Tabbed Q&amp;A Scorecard</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-slate-500 flex items-center gap-2">
          <span>Interview Copilot Pro</span>
          <span aria-hidden="true">·</span>
          <span>AMOLED Edition</span>
        </div>
      </div>

      {/* Right Auth Form Column */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6 bg-[#050912]/90 border border-[#16223b] rounded-2xl p-7 sm:p-8 shadow-2xl">
          <div className="flex flex-col items-center lg:items-start space-y-2">
            <div className="lg:hidden w-14 h-14 rounded-xl border border-blue-500/30 overflow-hidden mb-2">
              <Logo />
            </div>
            <h2 className="text-2xl font-bold tracking-tight text-white">
              {isForgotPassword
                ? 'Reset your password'
                : isLogin
                  ? 'Sign in to your studio'
                  : 'Create your account'}
            </h2>
            <p className="text-sm text-slate-400">
              {isForgotPassword
                ? 'Enter your account email to receive reset steps.'
                : isLogin
                  ? 'Resume-tailored mock interviews, scorecards, and progress tracking.'
                  : 'Start practicing with your personalized AI interviewer.'}
            </p>
          </div>

          {/* Instant Demo + Social Quick Connect */}
          {!isForgotPassword && (
            <div className="space-y-3">
              <button
                type="button"
                onClick={handleInstantGuest}
                disabled={loadingAction !== null}
                className="w-full py-3 px-4 rounded-xl amoled-btn-primary text-white font-semibold text-sm flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
              >
                {loadingAction === 'guest' ? (
                  <>
                    <Loader2 size={17} className="animate-spin" />
                    <span>Launching Guest Studio...</span>
                  </>
                ) : (
                  <>
                    <Zap size={17} />
                    <span>Instant Guest / Demo Login</span>
                    <ArrowRight size={15} />
                  </>
                )}
              </button>

              <div className="grid grid-cols-2 gap-3">
                <button
                  type="button"
                  onClick={() => handleFederatedQuickConnect('google')}
                  disabled={loadingAction !== null}
                  className="py-2.5 px-3 rounded-xl bg-[#0a1120] hover:bg-[#101b33] border border-[#16223b] hover:border-blue-500/40 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loadingAction === 'google' ? (
                    <Loader2 size={15} className="animate-spin text-blue-400" />
                  ) : (
                    <svg className="w-4 h-4" viewBox="0 0 24 24" aria-hidden="true">
                      <path
                        fill="#4285F4"
                        d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17Z"
                      />
                      <path
                        fill="#34A853"
                        d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.11-6.72-4.96H1.29v3.14C3.26 21.3 7.31 24 12 24Z"
                      />
                      <path
                        fill="#FBBC05"
                        d="M5.28 14.24c-.24-.72-.38-1.49-.38-2.24s.14-1.52.38-2.24V6.62H1.29C.47 8.24 0 10.06 0 12s.47 3.76 1.29 5.38l3.99-3.14Z"
                      />
                      <path
                        fill="#EA4335"
                        d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.31 0 3.26 2.7 1.29 6.62l3.99 3.14c.95-2.85 3.6-4.96 6.72-4.96Z"
                      />
                    </svg>
                  )}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFederatedQuickConnect('github')}
                  disabled={loadingAction !== null}
                  className="py-2.5 px-3 rounded-xl bg-[#0a1120] hover:bg-[#101b33] border border-[#16223b] hover:border-blue-500/40 text-slate-200 text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loadingAction === 'github' ? (
                    <Loader2 size={15} className="animate-spin text-blue-400" />
                  ) : (
                    <svg
                      className="w-4 h-4 fill-current text-white"
                      viewBox="0 0 24 24"
                      aria-hidden="true"
                    >
                      <path d="M12 .297c-6.63 0-12 5.373-12 12 0 5.303 3.438 9.8 8.205 11.385.6.113.82-.258.82-.577 0-.285-.01-1.04-.015-2.04-3.338.724-4.042-1.61-4.042-1.61C4.422 18.07 3.633 17.7 3.633 17.7c-1.087-.744.084-.729.084-.729 1.205.084 1.838 1.236 1.838 1.236 1.07 1.835 2.809 1.305 3.495.998.108-.776.417-1.305.76-1.605-2.665-.3-5.466-1.332-5.466-5.93 0-1.31.465-2.38 1.235-3.22-.135-.303-.54-1.523.105-3.176 0 0 1.005-.322 3.3 1.23.96-.267 1.98-.399 3-.405 1.02.006 2.04.138 3 .405 2.28-1.552 3.285-1.23 3.285-1.23.645 1.653.24 2.873.12 3.176.765.84 1.23 1.91 1.23 3.22 0 4.61-2.805 5.625-5.475 5.92.42.36.81 1.096.81 2.22 0 1.606-.015 2.896-.015 3.286 0 .315.21.69.825.57C20.565 22.092 24 17.592 24 12.297c0-6.627-5.373-12-12-12" />
                    </svg>
                  )}
                  <span>GitHub</span>
                </button>
              </div>

              <div className="relative flex py-2 items-center">
                <div className="flex-grow border-t border-[#16223b]" />
                <span className="flex-shrink mx-3 text-xs text-slate-500">
                  or continue with email
                </span>
                <div className="flex-grow border-t border-[#16223b]" />
              </div>
            </div>
          )}

          {error && (
            <div className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-rose-300 text-xs font-medium">
              <AlertCircle size={16} className="shrink-0" />
              <p>{error}</p>
            </div>
          )}

          {success && (
            <div className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-300 text-xs font-medium">
              <CheckCircle2 size={16} className="shrink-0" />
              <p>{success}</p>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-black border border-[#16223b] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                  placeholder="Arjun PV"
                />
              </div>
            )}

            <div>
              <label className="block text-xs font-medium text-slate-300 mb-1.5">
                Email Address
              </label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-black border border-[#16223b] rounded-xl px-4 py-3 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                placeholder="you@domain.com"
              />
            </div>

            {!isForgotPassword && !(passwordlessDemo && isLogin) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label className="block text-xs font-medium text-slate-300">
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                      }}
                      className="text-xs text-blue-400 hover:text-blue-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    type={showPassword ? 'text' : 'password'}
                    required={!passwordlessDemo}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-black border border-[#16223b] rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div>
                <label className="block text-xs font-medium text-slate-300 mb-1.5">
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-black border border-[#16223b] rounded-xl px-4 py-3 pr-11 text-sm text-white focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={
                      showConfirmPassword
                        ? 'Hide confirm password'
                        : 'Show confirm password'
                    }
                    onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-white cursor-pointer"
                  >
                    {showConfirmPassword ? (
                      <EyeOff size={17} />
                    ) : (
                      <Eye size={17} />
                    )}
                  </button>
                </div>
              </div>
            )}

            {/* Auth Toggles: Remember Me & Passwordless Quick Demo */}
            {!isForgotPassword && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 text-slate-400 cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#16223b] bg-black accent-blue-600 cursor-pointer"
                  />
                  <span>Remember me (7 days)</span>
                </label>

                {isLogin && (
                  <button
                    type="button"
                    onClick={() => setPasswordlessDemo(!passwordlessDemo)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      passwordlessDemo
                        ? 'bg-blue-600/20 border-blue-500/50 text-blue-300'
                        : 'bg-black border-[#16223b] text-slate-400 hover:text-white'
                    }`}
                  >
                    {passwordlessDemo
                      ? 'Password-less Mode: On'
                      : 'Quick Email Mode'}
                  </button>
                )}
              </div>
            )}

            <button
              type="submit"
              disabled={loadingAction !== null}
              className="w-full bg-[#0a1120] hover:bg-blue-600 border border-blue-500/40 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loadingAction === 'submit' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>
                    {isForgotPassword
                      ? 'Sending instructions...'
                      : isLogin
                        ? 'Signing in...'
                        : 'Creating account...'}
                  </span>
                </>
              ) : (
                <>
                  {!isForgotPassword &&
                    (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
                  <span>
                    {isForgotPassword
                      ? 'Send Reset Link'
                      : isLogin
                        ? passwordlessDemo
                          ? 'Continue without Password'
                          : 'Sign In'
                        : 'Create Account'}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#16223b]">
            <button
              type="button"
              onClick={() => {
                if (isForgotPassword) {
                  setIsForgotPassword(false);
                } else {
                  setIsLogin(!isLogin);
                  setError('');
                  setSuccess('');
                  setPassword('');
                  setConfirmPassword('');
                }
              }}
              className="text-xs font-medium text-slate-400 hover:text-blue-400 transition-colors cursor-pointer pt-2"
            >
              {isForgotPassword
                ? 'Back to Sign In'
                : isLogin
                  ? "Don't have an account? Create one"
                  : 'Already have an account? Sign in'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
