import React, { useState } from 'react';
import { ColorMode, User } from '../types';
import { Logo } from './Logo';
import {
  authenticateVaultUser,
  ensureFederatedOrDemoUser,
  getVaultUsers,
  registerVaultUser,
} from '../lib/CryptoVault';
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
  Lock,
  Sun,
  Moon,
} from 'lucide-react';

interface AuthViewProps {
  onLogin: (user: User, rememberMe: boolean) => void;
  lockNotice?: string | null;
  onDismissLockNotice?: () => void;
  colorMode: ColorMode;
  onToggleColorMode: () => void;
}

export function AuthView({
  onLogin,
  lockNotice,
  onDismissLockNotice,
  colorMode,
  onToggleColorMode,
}: AuthViewProps) {
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setSuccess('');

    const trimmedEmail = email.trim().toLowerCase();
    if (!trimmedEmail) {
      setError('Please enter a valid email address.');
      return;
    }

    setLoadingAction('submit');

    try {
      if (isForgotPassword) {
        const users = await getVaultUsers();
        if (users[trimmedEmail]) {
          setSuccess(
            `Account verified for ${trimmedEmail} inside your local AES-256-GCM vault. Returning to sign in.`
          );
          setTimeout(() => setIsForgotPassword(false), 2000);
        } else {
          setError('No account found with that email address.');
        }
        return;
      }

      if (passwordlessDemo && isLogin) {
        const quickUser: User = {
          id: Math.random().toString(36).slice(2, 11),
          email: trimmedEmail,
          fullName: trimmedEmail.split('@')[0] || 'Candidate',
          joinDate: new Date().toISOString(),
          totalInterviews: 0,
          averageScore: 0,
          themePreference: 'obsidian-violet',
          colorMode,
          authProvider: 'email',
        };
        const resolved = await ensureFederatedOrDemoUser(
          quickUser,
          'quick-demo-vault'
        );
        onLogin(resolved, rememberMe);
        return;
      }

      if (isLogin) {
        const result = await authenticateVaultUser(trimmedEmail, password);
        if (!result.ok || !result.user) {
          setError(result.error || 'Authentication failed.');
          return;
        }
        onLogin(result.user, rememberMe);
      } else {
        if (password !== confirmPassword) {
          setError('Passwords do not match.');
          return;
        }
        const newUser: User = {
          id: Math.random().toString(36).slice(2, 11),
          email: trimmedEmail,
          fullName: fullName.trim() || 'Candidate',
          joinDate: new Date().toISOString(),
          totalInterviews: 0,
          averageScore: 0,
          themePreference: 'obsidian-violet',
          colorMode,
          authProvider: 'email',
        };
        const reg = await registerVaultUser(newUser, password);
        if (!reg.ok) {
          setError(reg.error || 'Registration failed.');
          return;
        }
        onLogin(newUser, rememberMe);
      }
    } catch {
      setError('Encryption vault error while processing credentials.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleInstantGuest = async () => {
    setError('');
    setLoadingAction('guest');
    try {
      const guestUser: User = {
        id: 'guest-pro',
        email: 'demo@interviewcopilot.pro',
        fullName: 'Alex Rivera',
        joinDate: new Date().toISOString(),
        totalInterviews: 0,
        averageScore: 0,
        themePreference: 'obsidian-violet',
        colorMode,
        authProvider: 'guest',
      };
      const resolved = await ensureFederatedOrDemoUser(
        guestUser,
        'guest-vault-key'
      );
      onLogin(resolved, rememberMe);
    } catch {
      setError('Could not initialize encrypted demo vault.');
    } finally {
      setLoadingAction(null);
    }
  };

  const handleFederatedQuickConnect = async (provider: 'google' | 'github') => {
    setError('');
    setLoadingAction(provider);
    try {
      const providerEmail =
        provider === 'google'
          ? 'candidate.google@interviewcopilot.pro'
          : 'dev.github@interviewcopilot.pro';
      const socialUser: User = {
        id: `${provider}-${Math.random().toString(36).slice(2, 8)}`,
        email: providerEmail,
        fullName: provider === 'google' ? 'Jordan Lee' : 'Samir Patel',
        joinDate: new Date().toISOString(),
        totalInterviews: 0,
        averageScore: 0,
        themePreference: 'obsidian-violet',
        colorMode,
        authProvider: provider,
      };
      const resolved = await ensureFederatedOrDemoUser(
        socialUser,
        `${provider}-vault-key`
      );
      onLogin(resolved, rememberMe);
    } catch {
      setError('Could not establish encrypted quick-connect profile.');
    } finally {
      setLoadingAction(null);
    }
  };

  return (
    <div className="min-h-screen bg-white text-[#140f1f] dark:bg-black dark:text-[#f5f3ff] flex flex-col lg:flex-row relative overflow-hidden">
      <div className="fixed inset-0 pointer-events-none">
        <div className="absolute -top-40 -left-40 w-[520px] h-[520px] rounded-full bg-violet-500/12 dark:bg-violet-600/16 blur-[140px]" />
        <div className="absolute bottom-0 right-0 w-[480px] h-[480px] rounded-full bg-purple-400/10 dark:bg-purple-500/12 blur-[150px]" />
      </div>

      {/* Left Showcase Panel */}
      <div className="hidden lg:flex lg:w-[52%] relative z-10 flex-col justify-between p-12 border-r border-[#e4ddf5] dark:border-[#26193f] bg-gradient-to-br from-[#faf8ff] via-white to-[#f5f3ff] dark:from-[#080412] dark:via-black dark:to-black">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl border border-violet-300 dark:border-violet-500/35 overflow-hidden shrink-0">
              <Logo />
            </div>
            <span className="text-lg font-bold tracking-tight text-[#140f1f] dark:text-white">
              Interview Copilot
            </span>
          </div>

          <button
            type="button"
            onClick={onToggleColorMode}
            aria-label={
              colorMode === 'dark'
                ? 'Switch to White Light Mode'
                : 'Switch to Black Dark Mode'
            }
            className="px-3 py-1.5 rounded-lg border border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-[#08050f] text-xs font-semibold text-[#362f47] dark:text-[#d8d0ea] hover:border-violet-500 flex items-center gap-1.5 cursor-pointer"
          >
            {colorMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
            <span>{colorMode === 'dark' ? 'White Mode' : 'Dark Mode'}</span>
          </button>
        </div>

        <div className="max-w-xl space-y-8 my-auto py-8">
          <div className="space-y-4">
            <p className="text-sm font-semibold text-violet-700 dark:text-violet-400">
              Zero-Knowledge Resume-Grounded Studio
            </p>
            <h1 className="text-4xl xl:text-5xl font-extrabold tracking-tight text-[#140f1f] dark:text-white leading-[1.12] [text-wrap:balance]">
              Practice with questions pulled straight from your resume.
            </h1>
            <p className="text-[#5a5170] dark:text-[#a69cbe] text-base leading-relaxed">
              Upload your PDF, DOCX, or TXT resume with zero server retention.
              All profile records, resumes, and interview transcripts stay
              AES-256-GCM encrypted locally inside your browser vault.
            </p>
          </div>

          <div className="rounded-2xl border border-[#e4ddf5] dark:border-violet-500/25 bg-white dark:bg-[#08050f] p-6 space-y-5 shadow-xl shadow-violet-500/5 dark:shadow-violet-950/30">
            <div className="flex items-center justify-between border-b border-[#e4ddf5] dark:border-[#26193f] pb-4">
              <div className="flex items-center gap-3">
                <div className="w-9 h-9 rounded-lg bg-violet-100 dark:bg-violet-600/20 border border-violet-300 dark:border-violet-500/35 flex items-center justify-center text-violet-700 dark:text-violet-400">
                  <Mic size={18} />
                </div>
                <div>
                  <div className="text-sm font-semibold text-[#140f1f] dark:text-white">
                    Live Resume Probe
                  </div>
                  <div className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
                    System Design · Hard Difficulty
                  </div>
                </div>
              </div>
              <span className="text-xs font-mono text-purple-700 dark:text-purple-400 tabular-nums">
                Turn 01 / 28:40
              </span>
            </div>

            <div className="space-y-3 text-sm">
              <div className="rounded-xl bg-[#faf8ff] dark:bg-[#120b1f] border border-[#e4ddf5] dark:border-[#26193f] p-3.5 text-[#140f1f] dark:text-[#e9e4f5] leading-relaxed">
                “I noticed on your resume you scaled a Redis caching layer to cut
                checkout latency by 42%. How did you prevent cache stampedes
                during peak flash sales?”
              </div>
              <div className="grid grid-cols-3 gap-3 pt-1">
                <div className="rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#5a5170] dark:text-[#a69cbe] mb-1">
                    <FileText
                      size={13}
                      className="text-violet-700 dark:text-violet-400"
                    />
                    <span>Resume Hook</span>
                  </div>
                  <div className="text-sm font-semibold text-[#140f1f] dark:text-white tabular-nums">
                    94% Match
                  </div>
                </div>
                <div className="rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#5a5170] dark:text-[#a69cbe] mb-1">
                    <BarChart3
                      size={13}
                      className="text-purple-700 dark:text-purple-400"
                    />
                    <span>Depth Score</span>
                  </div>
                  <div className="text-sm font-semibold text-[#140f1f] dark:text-white tabular-nums">
                    88 / 100
                  </div>
                </div>
                <div className="rounded-xl bg-[#faf8ff] dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] p-3">
                  <div className="flex items-center gap-1.5 text-xs text-[#5a5170] dark:text-[#a69cbe] mb-1">
                    <ShieldCheck
                      size={13}
                      className="text-emerald-600 dark:text-emerald-400"
                    />
                    <span>Vault Cipher</span>
                  </div>
                  <div className="text-sm font-semibold text-emerald-700 dark:text-emerald-400">
                    AES-256-GCM
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-3 gap-4 text-xs text-[#5a5170] dark:text-[#a69cbe]">
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-violet-700 dark:text-violet-400 shrink-0"
              />
              <span>AES-256-GCM Vault</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-violet-700 dark:text-violet-400 shrink-0"
              />
              <span>PBKDF2-SHA-256 Auth</span>
            </div>
            <div className="flex items-center gap-2">
              <CheckCircle2
                size={15}
                className="text-violet-700 dark:text-violet-400 shrink-0"
              />
              <span>Zero Server Retention</span>
            </div>
          </div>
        </div>

        <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] flex items-center gap-2">
          <Lock size={12} className="text-violet-700 dark:text-violet-400" />
          <span>End-to-End Encrypted Local Vault</span>
          <span aria-hidden="true">·</span>
          <span>15m Inactivity Auto-Lock</span>
        </div>
      </div>

      {/* Right Auth Form Column */}
      <div className="flex-1 relative z-10 flex items-center justify-center p-6 sm:p-10">
        <div className="w-full max-w-md space-y-6 bg-[#faf8ff] dark:bg-[#08050f]/95 border border-[#e4ddf5] dark:border-[#26193f] rounded-2xl p-7 sm:p-8 shadow-2xl">
          <div className="flex items-center justify-between lg:hidden mb-2">
            <div className="w-12 h-12 rounded-xl border border-violet-300 dark:border-violet-500/35 overflow-hidden">
              <Logo />
            </div>
            <button
              type="button"
              onClick={onToggleColorMode}
              className="px-3 py-1.5 rounded-lg border border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-black text-xs font-semibold text-[#362f47] dark:text-[#d8d0ea] flex items-center gap-1.5 cursor-pointer"
            >
              {colorMode === 'dark' ? <Sun size={14} /> : <Moon size={14} />}
              <span>{colorMode === 'dark' ? 'White Mode' : 'Dark Mode'}</span>
            </button>
          </div>

          <div className="space-y-2">
            <h2 className="text-2xl font-bold tracking-tight text-[#140f1f] dark:text-white">
              {isForgotPassword
                ? 'Reset your password'
                : isLogin
                  ? 'Sign in to your encrypted studio'
                  : 'Create your encrypted account'}
            </h2>
            <p className="text-sm text-[#5a5170] dark:text-[#a69cbe]">
              {isForgotPassword
                ? 'Verify your account email inside the local vault.'
                : isLogin
                  ? 'PBKDF2 hashed credentials and AES-256-GCM encrypted resume vault.'
                  : 'Your profile and resume are encrypted locally before saving.'}
            </p>
          </div>

          {lockNotice && (
            <div
              role="status"
              className="p-3.5 rounded-xl bg-violet-600/10 border border-violet-500/40 text-violet-900 dark:text-violet-200 text-xs flex items-start justify-between gap-3"
            >
              <div className="flex items-start gap-2.5">
                <Lock
                  size={15}
                  className="text-violet-700 dark:text-violet-400 shrink-0 mt-0.5"
                />
                <span className="leading-relaxed">{lockNotice}</span>
              </div>
              {onDismissLockNotice && (
                <button
                  type="button"
                  onClick={onDismissLockNotice}
                  className="text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white text-xs font-semibold shrink-0 cursor-pointer"
                >
                  Dismiss
                </button>
              )}
            </div>
          )}

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
                    <span>Unlocking Encrypted Demo Vault...</span>
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
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#120b1f] hover:bg-[#f3effb] dark:hover:bg-[#1b112e] border border-[#e4ddf5] dark:border-[#26193f] hover:border-violet-500/50 text-[#140f1f] dark:text-[#e9e4f5] text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loadingAction === 'google' ? (
                    <Loader2
                      size={15}
                      className="animate-spin text-violet-600 dark:text-violet-400"
                    />
                  ) : (
                    <span className="w-4 h-4 rounded-full bg-violet-700 dark:bg-violet-500 text-white text-[10px] font-bold flex items-center justify-center">
                      G
                    </span>
                  )}
                  <span>Google</span>
                </button>

                <button
                  type="button"
                  onClick={() => handleFederatedQuickConnect('github')}
                  disabled={loadingAction !== null}
                  className="py-2.5 px-3 rounded-xl bg-white dark:bg-[#120b1f] hover:bg-[#f3effb] dark:hover:bg-[#1b112e] border border-[#e4ddf5] dark:border-[#26193f] hover:border-violet-500/50 text-[#140f1f] dark:text-[#e9e4f5] text-xs font-semibold flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
                >
                  {loadingAction === 'github' ? (
                    <Loader2
                      size={15}
                      className="animate-spin text-violet-600 dark:text-violet-400"
                    />
                  ) : (
                    <svg
                      className="w-4 h-4 fill-current text-[#140f1f] dark:text-white"
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
                <div className="flex-grow border-t border-[#e4ddf5] dark:border-[#26193f]" />
                <span className="flex-shrink mx-3 text-xs text-[#5a5170] dark:text-[#a69cbe]">
                  or continue with email
                </span>
                <div className="flex-grow border-t border-[#e4ddf5] dark:border-[#26193f]" />
              </div>
            </div>
          )}

          <div aria-live="polite" className="space-y-3">
            {error && (
              <div
                role="alert"
                className="p-3.5 bg-rose-500/10 border border-rose-500/40 rounded-xl flex items-center gap-2.5 text-rose-700 dark:text-rose-300 text-xs font-medium"
              >
                <AlertCircle size={16} className="shrink-0" />
                <p>{error}</p>
              </div>
            )}

            {success && (
              <div
                role="status"
                className="p-3.5 bg-emerald-500/10 border border-emerald-500/40 rounded-xl flex items-center gap-2.5 text-emerald-700 dark:text-emerald-300 text-xs font-medium"
              >
                <CheckCircle2 size={16} className="shrink-0" />
                <p>{success}</p>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {!isLogin && !isForgotPassword && (
              <div>
                <label
                  htmlFor="auth-fullname"
                  className="block text-xs font-medium text-[#362f47] dark:text-[#d8d0ea] mb-1.5"
                >
                  Full Name
                </label>
                <input
                  id="auth-fullname"
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl px-4 py-3 text-sm text-[#140f1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                  placeholder="Arjun PV"
                />
              </div>
            )}

            <div>
              <label
                htmlFor="auth-email"
                className="block text-xs font-medium text-[#362f47] dark:text-[#d8d0ea] mb-1.5"
              >
                Email Address
              </label>
              <input
                id="auth-email"
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl px-4 py-3 text-sm text-[#140f1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                placeholder="you@domain.com"
              />
            </div>

            {!isForgotPassword && !(passwordlessDemo && isLogin) && (
              <div className="space-y-1.5">
                <div className="flex items-center justify-between">
                  <label
                    htmlFor="auth-password"
                    className="block text-xs font-medium text-[#362f47] dark:text-[#d8d0ea]"
                  >
                    Password
                  </label>
                  {isLogin && (
                    <button
                      type="button"
                      onClick={() => {
                        setIsForgotPassword(true);
                        setError('');
                      }}
                      className="text-xs text-violet-700 dark:text-violet-400 hover:text-violet-600 dark:hover:text-violet-300 transition-colors cursor-pointer"
                    >
                      Forgot password?
                    </button>
                  )}
                </div>
                <div className="relative">
                  <input
                    id="auth-password"
                    type={showPassword ? 'text' : 'password'}
                    required={!passwordlessDemo}
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl px-4 py-3 pr-11 text-sm text-[#140f1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
                    placeholder="••••••••"
                  />
                  <button
                    type="button"
                    aria-label={showPassword ? 'Hide password' : 'Show password'}
                    onClick={() => setShowPassword(!showPassword)}
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white cursor-pointer"
                  >
                    {showPassword ? <EyeOff size={17} /> : <Eye size={17} />}
                  </button>
                </div>
              </div>
            )}

            {!isLogin && !isForgotPassword && (
              <div>
                <label
                  htmlFor="auth-confirm-password"
                  className="block text-xs font-medium text-[#362f47] dark:text-[#d8d0ea] mb-1.5"
                >
                  Confirm Password
                </label>
                <div className="relative">
                  <input
                    id="auth-confirm-password"
                    type={showConfirmPassword ? 'text' : 'password'}
                    required
                    minLength={6}
                    value={confirmPassword}
                    onChange={(e) => setConfirmPassword(e.target.value)}
                    className="w-full bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl px-4 py-3 pr-11 text-sm text-[#140f1f] dark:text-white focus:outline-none focus:ring-2 focus:ring-violet-500 transition-all"
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
                    className="absolute right-3.5 top-1/2 -translate-y-1/2 text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white cursor-pointer"
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

            {!isForgotPassword && (
              <div className="flex flex-wrap items-center justify-between gap-2 pt-1 text-xs">
                <label className="flex items-center gap-2 text-[#5a5170] dark:text-[#a69cbe] cursor-pointer select-none">
                  <input
                    type="checkbox"
                    checked={rememberMe}
                    onChange={(e) => setRememberMe(e.target.checked)}
                    className="w-4 h-4 rounded border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-black accent-violet-600 cursor-pointer"
                  />
                  <span>Remember encrypted session (7d)</span>
                </label>

                {isLogin && (
                  <button
                    type="button"
                    aria-pressed={passwordlessDemo}
                    onClick={() => setPasswordlessDemo(!passwordlessDemo)}
                    className={`px-2.5 py-1 rounded-lg border text-xs font-medium transition-colors cursor-pointer ${
                      passwordlessDemo
                        ? 'bg-violet-600/15 border-violet-500/50 text-violet-700 dark:text-violet-300'
                        : 'bg-white dark:bg-black border-[#e4ddf5] dark:border-[#26193f] text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
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
              className="w-full bg-[#140f1f] dark:bg-[#120b1f] hover:bg-violet-700 dark:hover:bg-violet-600 border border-violet-500/40 text-white font-semibold py-3 px-4 rounded-xl flex items-center justify-center gap-2 transition-all disabled:opacity-60 cursor-pointer"
            >
              {loadingAction === 'submit' ? (
                <>
                  <Loader2 size={18} className="animate-spin" />
                  <span>
                    {isForgotPassword
                      ? 'Checking encrypted vault...'
                      : isLogin
                        ? 'Decrypting vault...'
                        : 'Encrypting account...'}
                  </span>
                </>
              ) : (
                <>
                  {!isForgotPassword &&
                    (isLogin ? <LogIn size={18} /> : <UserPlus size={18} />)}
                  <span>
                    {isForgotPassword
                      ? 'Verify Account'
                      : isLogin
                        ? passwordlessDemo
                          ? 'Continue without Password'
                          : 'Sign In Securely'
                        : 'Create Encrypted Account'}
                  </span>
                </>
              )}
            </button>
          </form>

          <div className="pt-2 text-center border-t border-[#e4ddf5] dark:border-[#26193f]">
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
              className="text-xs font-medium text-[#5a5170] dark:text-[#a69cbe] hover:text-violet-700 dark:hover:text-violet-400 transition-colors cursor-pointer pt-2"
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
