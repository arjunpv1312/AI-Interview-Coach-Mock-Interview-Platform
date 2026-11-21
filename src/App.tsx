/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
  ViewState,
  User,
  InterviewSession,
  InterviewConfig,
  ThemeVariant,
  ColorMode,
} from './types';
import {
  INACTIVITY_LOCK_TIMEOUT_MS,
  clearVaultSession,
  consumeInactivityLockFlag,
  getVaultSession,
  getVaultUser,
  initializeVault,
  saveVaultSession,
  touchVaultSessionActivity,
  updateVaultUser,
} from './lib/CryptoVault';
import { prewarmOpeningTurn } from './lib/interviewPrewarm';
import { DashboardView } from './components/DashboardView';
import { SetupView } from './components/SetupView';
import { LiveInterviewView } from './components/LiveInterviewView';
import { ResultsView } from './components/ResultsView';
import { QuestionBankView } from './components/QuestionBankView';
import { AuthView } from './components/AuthView';
import { HistoryView } from './components/HistoryView';
import { SimulationView } from './components/SimulationView';
import { CertificateView } from './components/CertificateView';
import { SuggestionsView } from './components/SuggestionsView';
import { LearnerView } from './components/LearnerView';
import { SecurityView } from './components/SecurityView';
import { PublicCertificateView } from './components/PublicCertificateView';
import { GuideModal } from './components/GuideModal';
import { Logo } from './components/Logo';
import {
  UserCircle,
  LogOut,
  Globe,
  FileText,
  Palette,
  ShieldCheck,
  Lock,
  Sun,
  Moon,
  BookOpen,
  Menu,
  X,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const pageTransition = {
  duration: 0.3,
  ease: [0.16, 1, 0.3, 1] as const,
};

const COLOR_MODE_STORAGE_KEY = 'ic_color_mode';

function applyHtmlTheme(mode: ColorMode, variant?: ThemeVariant) {
  const root = document.documentElement;
  if (mode === 'dark') {
    root.classList.add('dark');
    root.classList.remove('light');
  } else {
    root.classList.remove('dark');
    root.classList.add('light');
  }
  if (variant) {
    root.dataset.theme = variant;
  } else if (!root.dataset.theme) {
    root.dataset.theme = 'obsidian-violet';
  }
}

export default function App() {
  const [view, setView] = useState<ViewState>('auth');
  const [vaultReady, setVaultReady] = useState(false);
  const [user, setUser] = useState<User | null>(null);
  const [sessionParams, setSessionParams] = useState<InterviewConfig | null>(
    null
  );
  const [setupPrefill, setSetupPrefill] =
    useState<Partial<InterviewConfig> | null>(null);
  const [currentSession, setCurrentSession] =
    useState<InterviewSession | null>(null);
  const [colorMode, setColorMode] = useState<ColorMode>(() => {
    try {
      const saved = localStorage.getItem(COLOR_MODE_STORAGE_KEY);
      return saved === 'light' ? 'light' : 'dark';
    } catch {
      return 'dark';
    }
  });
  const [themeDropdown, setThemeDropdown] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [guideOpen, setGuideOpen] = useState(false);
  const [lockNotice, setLockNotice] = useState<string | null>(null);
  const [idleSecondsRemaining, setIdleSecondsRemaining] = useState<number | null>(
    null
  );

  const lastActivityRef = useRef<number>(Date.now());
  const lastVaultTouchRef = useRef<number>(0);
  const themeMenuRef = useRef<HTMLDivElement>(null);

  const lockVaultWithNotice = useCallback((reason: string) => {
    clearVaultSession();
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel();
    }
    setUser(null);
    setSessionParams(null);
    setCurrentSession(null);
    setSetupPrefill(null);
    setThemeDropdown(false);
    setMobileMenuOpen(false);
    setGuideOpen(false);
    setIdleSecondsRemaining(null);
    setLockNotice(reason);
    setView('auth');
  }, []);

  const launchSetupWithPrefill = (prefill: Partial<InterviewConfig>) => {
    setSetupPrefill(prefill);
    setView('setup');
  };

  const handleUpdateUser = (updatedProps: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updatedProps };
      setUser(updatedUser);
      updateVaultUser(updatedUser).catch((err) =>
        console.warn('Encrypted vault update error:', err)
      );
    }
  };

  const handleThemeChange = (theme: ThemeVariant) => {
    applyHtmlTheme(colorMode, theme);
    handleUpdateUser({ themePreference: theme });
    setThemeDropdown(false);
  };

  const handleToggleColorMode = () => {
    const nextMode: ColorMode = colorMode === 'dark' ? 'light' : 'dark';
    setColorMode(nextMode);
    try {
      localStorage.setItem(COLOR_MODE_STORAGE_KEY, nextMode);
    } catch {
      // ignore storage errors
    }
    applyHtmlTheme(nextMode, user?.themePreference);
    if (user) {
      handleUpdateUser({ colorMode: nextMode });
    }
  };

  const navigateTo = (nextView: ViewState) => {
    if (nextView === 'setup') setSetupPrefill(null);
    setMobileMenuOpen(false);
    setThemeDropdown(false);
    setView(nextView);
  };

  // Close theme dropdown on Escape or outside click
  useEffect(() => {
    if (!themeDropdown) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setThemeDropdown(false);
    };
    const onPointerDown = (e: MouseEvent) => {
      if (
        themeMenuRef.current &&
        !themeMenuRef.current.contains(e.target as Node)
      ) {
        setThemeDropdown(false);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    window.addEventListener('mousedown', onPointerDown);
    return () => {
      window.removeEventListener('keydown', onKeyDown);
      window.removeEventListener('mousedown', onPointerDown);
    };
  }, [themeDropdown]);

  useEffect(() => {
    applyHtmlTheme(colorMode, 'obsidian-violet');

    const params = new URLSearchParams(window.location.search);
    if (params.get('cert')) {
      setView('public-cert');
      setVaultReady(true);
      return;
    }

    let active = true;
    const hydrateEncryptedVault = async () => {
      try {
        await initializeVault();
        const session = await getVaultSession();
        if (session) {
          const oneWeek = 7 * 24 * 60 * 60 * 1000;
          if (Date.now() - session.timestamp < oneWeek) {
            const dbUser = await getVaultUser(session.email);
            if (dbUser && active) {
              setUser(dbUser);
              lastActivityRef.current = Date.now();
              const resolvedMode = dbUser.colorMode || colorMode;
              setColorMode(resolvedMode);
              applyHtmlTheme(
                resolvedMode,
                dbUser.themePreference || 'obsidian-violet'
              );
              setView('dashboard');
            }
          } else {
            clearVaultSession();
          }
        } else if (consumeInactivityLockFlag() && active) {
          setLockNotice(
            'Your previous session was locked after 15 minutes of inactivity. Sign in again to unlock your encrypted vault.'
          );
        }
      } catch (e) {
        console.warn('Vault hydration error:', e);
        clearVaultSession();
      } finally {
        if (active) setVaultReady(true);
      }
    };

    hydrateEncryptedVault();
    return () => {
      active = false;
    };
  }, []);

  // 15-minute inactivity auto-lock monitor for client-side CryptoVault security
  useEffect(() => {
    if (!user) {
      setIdleSecondsRemaining(null);
      return;
    }

    lastActivityRef.current = Date.now();
    lastVaultTouchRef.current = Date.now();

    const recordActivity = () => {
      const now = Date.now();
      if (now - lastActivityRef.current >= INACTIVITY_LOCK_TIMEOUT_MS) {
        lockVaultWithNotice(
          'Vault auto-locked after 15 minutes of inactivity. Sign in again to continue.'
        );
        return;
      }

      lastActivityRef.current = now;
      setIdleSecondsRemaining(null);

      if (now - lastVaultTouchRef.current >= 30_000) {
        lastVaultTouchRef.current = now;
        touchVaultSessionActivity().catch(() => {});
      }
    };

    const checkInactivity = () => {
      const elapsed = Date.now() - lastActivityRef.current;
      const remainingMs = INACTIVITY_LOCK_TIMEOUT_MS - elapsed;
      if (remainingMs <= 0) {
        lockVaultWithNotice(
          'Vault auto-locked after 15 minutes of inactivity. Sign in again to continue.'
        );
        return;
      }
      if (remainingMs <= 60_000) {
        setIdleSecondsRemaining(Math.ceil(remainingMs / 1000));
      } else {
        setIdleSecondsRemaining(null);
      }
    };

    const handleVisibilityChange = () => {
      if (document.visibilityState === 'visible') {
        checkInactivity();
      }
    };

    const activityEvents: (keyof WindowEventMap)[] = [
      'mousemove',
      'mousedown',
      'keydown',
      'touchstart',
      'scroll',
      'click',
    ];

    activityEvents.forEach((evt) =>
      window.addEventListener(evt, recordActivity, { passive: true })
    );
    document.addEventListener('visibilitychange', handleVisibilityChange);
    const intervalId = setInterval(checkInactivity, 5000);

    return () => {
      activityEvents.forEach((evt) =>
        window.removeEventListener(evt, recordActivity)
      );
      document.removeEventListener('visibilitychange', handleVisibilityChange);
      clearInterval(intervalId);
    };
  }, [user, lockVaultWithNotice]);

  const handleStartInterview = (config: InterviewConfig) => {
    if ('speechSynthesis' in window) {
      const unlockUtterance = new SpeechSynthesisUtterance('');
      unlockUtterance.volume = 0;
      window.speechSynthesis.speak(unlockUtterance);
    }

    void prewarmOpeningTurn(config);
    setSessionParams(config);
    setView('live');
  };

  const handleCompleteInterview = (
    history: any[],
    tierMeta?: { baseTier: number; finalTier: number; peakTier: number }
  ) => {
    if (!sessionParams) return;
    const session: InterviewSession = {
      id: Math.random().toString(36).slice(2, 11),
      userId: user?.id || 'anon',
      company: sessionParams.company,
      role: sessionParams.role,
      type: sessionParams.type,
      difficulty: sessionParams.difficulty,
      experience: sessionParams.experience,
      baseTier: tierMeta?.baseTier,
      finalTier: tierMeta?.finalTier,
      peakTier: tierMeta?.peakTier,
      startTime: new Date().toISOString(),
      history,
      resumeProfile: sessionParams.resumeProfile || null,
    };
    setCurrentSession(session);
    setView('results');
  };

  const cancelInterview = () => {
    setView('dashboard');
    setSessionParams(null);
  };

  const themeOptions: { id: ThemeVariant; label: string; swatch: string }[] = [
    { id: 'obsidian-violet', label: 'Obsidian Violet', swatch: 'bg-violet-600' },
    { id: 'amethyst', label: 'Deep Amethyst', swatch: 'bg-purple-500' },
    { id: 'orchid', label: 'Velvet Orchid', swatch: 'bg-fuchsia-500' },
    { id: 'carbon-plum', label: 'Carbon Plum', swatch: 'bg-violet-800' },
  ];

  const navItems: { id: ViewState; label: string }[] = [
    { id: 'dashboard', label: 'Dashboard' },
    { id: 'setup', label: 'New Session' },
    { id: 'bank', label: 'Study Bank' },
    { id: 'history', label: 'History' },
    { id: 'suggestions', label: 'Insights' },
  ];

  if (!vaultReady) {
    return (
      <div className="min-h-screen bg-white text-[#140f1f] dark:bg-black dark:text-[#f5f3ff] flex flex-col items-center justify-center gap-4">
        <div className="w-11 h-11 rounded-xl border border-violet-300 dark:border-violet-500/30 bg-[#faf8ff] dark:bg-[#08050f] flex items-center justify-center text-violet-700 dark:text-violet-400">
          <Lock size={20} />
        </div>
        <div className="text-xs font-mono text-[#5a5170] dark:text-[#a69cbe]">
          Unlocking AES-256-GCM Encrypted Vault...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white text-[#140f1f] dark:bg-black dark:text-[#f5f3ff] font-sans selection:bg-violet-600/30 overflow-x-hidden relative flex flex-col transition-colors duration-200">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-3 focus:left-3 focus:z-[200] focus:px-4 focus:py-2 focus:rounded-lg focus:bg-violet-700 focus:text-white focus:text-xs focus:font-semibold"
      >
        Skip to main content
      </a>

      {/* Subtle Violet atmospheric depth */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[35%] -left-[15%] w-[60%] h-[60%] rounded-full bg-violet-500/10 dark:bg-violet-600/12 blur-[150px]" />
        <div className="absolute top-[55%] -right-[15%] w-[55%] h-[55%] rounded-full bg-purple-400/10 dark:bg-purple-500/10 blur-[160px]" />
      </div>

      {/* Top Bar */}
      {view !== 'live' && view !== 'auth' && view !== 'public-cert' && (
        <header className="border-b border-[#e4ddf5] dark:border-[#26193f] bg-white/90 dark:bg-black/90 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4 sm:gap-8">
            <button
              type="button"
              onClick={() => navigateTo('dashboard')}
              className="flex items-center gap-3 whitespace-nowrap shrink-0 cursor-pointer rounded-lg"
            >
              <div className="w-8 h-8 rounded-lg border border-violet-300 dark:border-violet-500/35 overflow-hidden shrink-0">
                <Logo />
              </div>
              <span className="font-bold text-base tracking-tight text-[#140f1f] dark:text-white">
                Interview Copilot
              </span>
            </button>

            <nav
              aria-label="Primary navigation"
              className="hidden md:flex items-center gap-6 text-sm font-medium"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer py-1 ${
                    view === item.id
                      ? 'text-violet-700 dark:text-violet-400 font-semibold border-b-2 border-violet-600 dark:border-violet-400'
                      : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white'
                  }`}
                >
                  {item.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-1.5 sm:gap-2 shrink-0">
              <button
                type="button"
                onClick={() => setGuideOpen(true)}
                className="p-2 rounded-lg text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white hover:bg-[#f3effb] dark:hover:bg-[#120b1f] transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium"
                aria-label="Open Platform Guide"
                title="Platform Guide & Accessibility"
              >
                <BookOpen size={17} />
                <span className="hidden xl:inline">Guide</span>
              </button>

              <button
                type="button"
                onClick={() => navigateTo('security')}
                className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                  view === 'security'
                    ? 'text-emerald-700 dark:text-emerald-400 bg-[#f3effb] dark:bg-[#120b1f]'
                    : 'text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white hover:bg-[#f3effb] dark:hover:bg-[#120b1f]'
                }`}
                aria-label="Live Encryption and Security Audit"
                title="Live Encryption & Security Audit"
              >
                <ShieldCheck size={17} />
                <span className="hidden xl:inline">Security</span>
              </button>

              <button
                type="button"
                onClick={handleToggleColorMode}
                className="p-2 rounded-lg text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white hover:bg-[#f3effb] dark:hover:bg-[#120b1f] transition-colors cursor-pointer"
                aria-label={
                  colorMode === 'dark'
                    ? 'Switch to White Light Mode'
                    : 'Switch to Black Dark Mode'
                }
                title={
                  colorMode === 'dark'
                    ? 'Switch to White Light Mode'
                    : 'Switch to Black Dark Mode'
                }
              >
                {colorMode === 'dark' ? <Sun size={17} /> : <Moon size={17} />}
              </button>

              <div className="relative" ref={themeMenuRef}>
                <button
                  type="button"
                  onClick={() => setThemeDropdown(!themeDropdown)}
                  aria-expanded={themeDropdown}
                  aria-haspopup="menu"
                  aria-label="Violet accent variants"
                  className="p-2 text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white rounded-lg hover:bg-[#f3effb] dark:hover:bg-[#120b1f] transition-colors cursor-pointer"
                  title="Violet Theme Variants"
                >
                  <Palette size={17} />
                </button>
                {themeDropdown && (
                  <div
                    role="menu"
                    aria-label="Select violet accent palette"
                    className="absolute right-0 mt-2 w-52 bg-white dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] rounded-xl shadow-2xl overflow-hidden z-[100]"
                  >
                    {themeOptions.map((opt) => (
                      <button
                        type="button"
                        role="menuitem"
                        key={opt.id}
                        onClick={() => handleThemeChange(opt.id)}
                        className="w-full text-left px-4 py-3 hover:bg-[#f3effb] dark:hover:bg-[#120b1f] text-xs font-medium text-[#140f1f] dark:text-[#f5f3ff] flex items-center gap-3 cursor-pointer"
                      >
                        <span
                          className={`w-3 h-3 rounded-full shrink-0 ${opt.swatch}`}
                        />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="hidden sm:flex items-center gap-2 text-xs font-medium text-[#362f47] dark:text-[#d8d0ea] pl-2 border-l border-[#e4ddf5] dark:border-[#26193f]">
                <UserCircle
                  size={18}
                  className="text-violet-700 dark:text-violet-400"
                />
                <span className="max-w-[110px] truncate">{user?.fullName}</span>
                <button
                  type="button"
                  onClick={() => {
                    clearVaultSession();
                    setUser(null);
                    setView('auth');
                  }}
                  className="p-2 text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white rounded-lg hover:bg-[#f3effb] dark:hover:bg-[#120b1f] transition-colors cursor-pointer"
                  aria-label="Sign out"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>

              <button
                type="button"
                onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
                aria-expanded={mobileMenuOpen}
                aria-label="Toggle mobile navigation"
                className="md:hidden p-2 rounded-lg text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white hover:bg-[#f3effb] dark:hover:bg-[#120b1f] cursor-pointer"
              >
                {mobileMenuOpen ? <X size={19} /> : <Menu size={19} />}
              </button>
            </div>
          </div>

          {/* Mobile Navigation Drawer */}
          {mobileMenuOpen && (
            <nav
              aria-label="Mobile navigation"
              className="md:hidden border-t border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-[#08050f] px-4 py-3 space-y-1"
            >
              {navItems.map((item) => (
                <button
                  key={item.id}
                  type="button"
                  onClick={() => navigateTo(item.id)}
                  className={`w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors ${
                    view === item.id
                      ? 'bg-violet-600/15 text-violet-700 dark:text-violet-300 font-semibold'
                      : 'text-[#362f47] dark:text-[#d8d0ea] hover:bg-[#f3effb] dark:hover:bg-[#120b1f]'
                  }`}
                >
                  {item.label}
                </button>
              ))}
              <button
                type="button"
                onClick={() => navigateTo('security')}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#362f47] dark:text-[#d8d0ea] hover:bg-[#f3effb] dark:hover:bg-[#120b1f] cursor-pointer"
              >
                Security Audit
              </button>
              <button
                type="button"
                onClick={() => {
                  setMobileMenuOpen(false);
                  setGuideOpen(true);
                }}
                className="w-full text-left px-3 py-2.5 rounded-lg text-sm font-medium text-[#362f47] dark:text-[#d8d0ea] hover:bg-[#f3effb] dark:hover:bg-[#120b1f] cursor-pointer"
              >
                Platform Guide
              </button>
              <div className="pt-2 mt-2 border-t border-[#e4ddf5] dark:border-[#26193f] flex items-center justify-between px-3 py-1">
                <span className="text-xs font-medium text-[#5a5170] dark:text-[#a69cbe] truncate">
                  {user?.fullName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearVaultSession();
                    setUser(null);
                    setMobileMenuOpen(false);
                    setView('auth');
                  }}
                  className="text-xs font-semibold text-rose-700 dark:text-rose-400 flex items-center gap-1.5 cursor-pointer"
                >
                  <LogOut size={14} />
                  <span>Sign Out</span>
                </button>
              </div>
            </nav>
          )}
        </header>
      )}

      {/* Pre-lock warning banner in final 60 seconds of inactivity */}
      {user && idleSecondsRemaining !== null && (
        <div
          role="status"
          aria-live="polite"
          className="relative z-40 bg-violet-100 dark:bg-violet-950/90 border-b border-violet-400 dark:border-violet-500/40 px-4 py-2.5 text-xs text-violet-950 dark:text-violet-100"
        >
          <div className="max-w-7xl mx-auto flex flex-wrap items-center justify-between gap-3">
            <div className="flex items-center gap-2 font-medium">
              <Lock
                size={14}
                className="text-violet-700 dark:text-violet-300 shrink-0"
              />
              <span>
                Inactivity detected — CryptoVault session will lock in{' '}
                <strong className="font-mono tabular-nums text-violet-800 dark:text-purple-300">
                  {idleSecondsRemaining}s
                </strong>
                .
              </span>
            </div>
            <button
              type="button"
              onClick={() => {
                lastActivityRef.current = Date.now();
                setIdleSecondsRemaining(null);
                touchVaultSessionActivity().catch(() => {});
              }}
              className="px-3 py-1 rounded-lg amoled-btn-primary text-white font-semibold cursor-pointer whitespace-nowrap"
            >
              Stay Signed In
            </button>
          </div>
        </div>
      )}

      {/* Main Content */}
      <main
        id="main-content"
        className={`relative z-10 flex-1 flex flex-col ${
          view === 'auth' || view === 'public-cert'
            ? 'p-0'
            : view === 'live'
              ? 'px-4 sm:px-6 py-4'
              : 'px-4 sm:px-6 py-8'
        }`}
      >
        <AnimatePresence mode="wait">
          {view === 'auth' && (
            <motion.div
              key="auth"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <AuthView
                lockNotice={lockNotice}
                onDismissLockNotice={() => setLockNotice(null)}
                colorMode={colorMode}
                onToggleColorMode={handleToggleColorMode}
                onLogin={async (u, rememberMe) => {
                  setLockNotice(null);
                  lastActivityRef.current = Date.now();
                  if (rememberMe) {
                    await saveVaultSession(u.email);
                  } else {
                    clearVaultSession();
                  }
                  const nextMode = u.colorMode || colorMode;
                  setColorMode(nextMode);
                  applyHtmlTheme(
                    nextMode,
                    u.themePreference || 'obsidian-violet'
                  );
                  setUser(u);
                  setView('dashboard');
                }}
              />
            </motion.div>
          )}
          {view === 'public-cert' && (
            <motion.div
              key="public-cert"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageTransition}
              className="flex-1 flex flex-col"
            >
              <PublicCertificateView />
            </motion.div>
          )}
          {view === 'dashboard' && user && (
            <motion.div
              key="dashboard"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={pageTransition}
            >
              <DashboardView
                user={user}
                colorMode={colorMode}
                onOpenGuide={() => setGuideOpen(true)}
                onNavigate={(nextView) => {
                  if (nextView === 'setup') setSetupPrefill(null);
                  setView(nextView);
                }}
                onUpdateUser={handleUpdateUser}
                onLaunchPrefill={launchSetupWithPrefill}
              />
            </motion.div>
          )}
          {view === 'setup' && (
            <motion.div
              key="setup"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={pageTransition}
            >
              <SetupView
                savedResume={user?.resumeProfile}
                prefillConfig={setupPrefill}
                onSaveResume={(resume) =>
                  handleUpdateUser({ resumeProfile: resume })
                }
                onStart={(cfg) => {
                  setSetupPrefill(null);
                  handleStartInterview(cfg);
                }}
                onCancel={() => {
                  setSetupPrefill(null);
                  cancelInterview();
                }}
              />
            </motion.div>
          )}
          {view === 'live' && sessionParams && (
            <motion.div
              key="live"
              initial={{ opacity: 0, scale: 0.98 }}
              animate={{ opacity: 1, scale: 1 }}
              exit={{ opacity: 0, scale: 0.98 }}
              transition={pageTransition}
              className="w-full flex justify-center"
            >
              <LiveInterviewView
                config={sessionParams}
                onComplete={handleCompleteInterview}
                onCancel={cancelInterview}
              />
            </motion.div>
          )}
          {view === 'results' && currentSession && user && (
            <motion.div
              key="results"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={pageTransition}
            >
              <ResultsView
                session={currentSession}
                onRetake={() => setView('setup')}
                onDashboard={() => setView('dashboard')}
                onSaveScore={async (score) => {
                  if (user && user.email) {
                    const latestUser = (await getVaultUser(user.email)) || user;
                    const newTotal = (latestUser.totalInterviews || 0) + 1;

                    let scoreNum = score.overallScore ?? 50;
                    if (scoreNum === 50) {
                      if (
                        score.crackProbability === 'Highly Likely' ||
                        score.crackProbability === 'High'
                      )
                        scoreNum = 90;
                      if (
                        score.crackProbability === 'Possible' ||
                        score.crackProbability === 'Moderate'
                      )
                        scoreNum = 70;
                      if (score.crackProbability === 'Needs Work') scoreNum = 40;
                    }

                    const newAvg = Math.round(
                      ((latestUser.averageScore || 0) *
                        (latestUser.totalInterviews || 0) +
                        scoreNum) /
                        newTotal
                    );

                    const updatedUser: User = {
                      ...latestUser,
                      totalInterviews: newTotal,
                      averageScore: newAvg,
                      scoreHistory: [
                        ...(latestUser.scoreHistory || []),
                        scoreNum,
                      ],
                      loginStreak: (latestUser.loginStreak || 0) + 1,
                    };

                    if (currentSession) {
                      const startTime = new Date(
                        currentSession.startTime
                      ).getTime();
                      const diffSeconds = (Date.now() - startTime) / 1000;
                      updatedUser.timeSpentSeconds =
                        (updatedUser.timeSpentSeconds || 0) + diffSeconds;

                      const companies = [
                        ...(updatedUser.companiesInterviewed || []),
                      ];
                      if (!companies.includes(currentSession.company)) {
                        companies.push(currentSession.company);
                      }
                      updatedUser.companiesInterviewed = companies;

                      const sessions = [...(updatedUser.pastSessions || [])];
                      sessions.unshift({
                        id: currentSession.id,
                        date: currentSession.startTime,
                        company: currentSession.company,
                        role: currentSession.role,
                        score: scoreNum,
                        crackProbability: score.crackProbability || 'Unknown',
                        overallSummary: score.overallSummary,
                        improvements: score.improvements,
                        studyTopics: score.studyTopics,
                        resumeUsed:
                          currentSession.resumeProfile?.fileName || undefined,
                        skillScores: score.skillScores,
                      });
                      updatedUser.pastSessions = sessions;
                    }

                    await updateVaultUser(updatedUser);
                    setUser(updatedUser);
                  }
                }}
              />
            </motion.div>
          )}
          {view === 'bank' && (
            <motion.div
              key="bank"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={pageTransition}
            >
              <QuestionBankView
                user={user}
                onNavigate={setView}
                onUpdateUser={handleUpdateUser}
                onPracticeQuestion={launchSetupWithPrefill}
              />
            </motion.div>
          )}
          {view === 'history' && user && (
            <motion.div
              key="history"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={pageTransition}
            >
              <HistoryView user={user} onNavigate={setView} />
            </motion.div>
          )}
          {view === 'simulation' && user && (
            <motion.div
              key="simulation"
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={pageTransition}
            >
              <SimulationView
                user={user}
                onNavigate={setView}
                onLaunchSession={launchSetupWithPrefill}
              />
            </motion.div>
          )}
          {view === 'certificate' && user && (
            <motion.div
              key="certificate"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageTransition}
            >
              <CertificateView user={user} onNavigate={setView} />
            </motion.div>
          )}
          {view === 'suggestions' && user && (
            <motion.div
              key="suggestions"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageTransition}
            >
              <SuggestionsView
                user={user}
                onNavigate={setView}
                onLaunchTopic={launchSetupWithPrefill}
              />
            </motion.div>
          )}
          {view === 'learner' && user && (
            <motion.div
              key="learner"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageTransition}
            >
              <LearnerView
                user={user}
                onNavigate={setView}
                onPracticeConcept={launchSetupWithPrefill}
              />
            </motion.div>
          )}
          {view === 'security' && user && (
            <motion.div
              key="security"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={pageTransition}
            >
              <SecurityView
                onNavigate={setView}
                onLockNow={() =>
                  lockVaultWithNotice(
                    'Vault locked manually. Sign in again to decrypt your session.'
                  )
                }
                onVaultWiped={() => {
                  setUser(null);
                  setSessionParams(null);
                  setCurrentSession(null);
                  setSetupPrefill(null);
                  setLockNotice(null);
                  setView('auth');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {view !== 'live' && view !== 'auth' && (
        <footer className="w-full mt-auto py-8 border-t border-[#e4ddf5] dark:border-[#26193f] bg-white dark:bg-black text-center text-[#5a5170] dark:text-[#a69cbe] relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/arjun-pv1312"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#faf8ff] dark:bg-[#08050f] hover:bg-violet-600 hover:text-white rounded-xl transition-all border border-[#e4ddf5] dark:border-[#26193f]"
                aria-label="LinkedIn"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  viewBox="0 0 24 24"
                  fill="currentColor"
                  className="w-4 h-4"
                >
                  <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
                </svg>
              </a>
              <a
                href="https://personal-portfolio--serenayt06.replit.app"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#faf8ff] dark:bg-[#08050f] hover:bg-violet-600 hover:text-white rounded-xl transition-all border border-[#e4ddf5] dark:border-[#26193f]"
                aria-label="Portfolio"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://ais-pre-dy4l4r6gvgehsxaprdkgra-893539578143.asia-southeast1.run.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#faf8ff] dark:bg-[#08050f] hover:bg-violet-600 hover:text-white rounded-xl transition-all border border-[#e4ddf5] dark:border-[#26193f]"
                aria-label="AI Resume Analyzer"
              >
                <FileText className="w-4 h-4" />
              </a>
            </div>
            <div className="text-xs text-[#5a5170] dark:text-[#a69cbe]">
              Created by Arjun PV · Interview Copilot Pro · AES-256-GCM Encrypted
            </div>
          </div>
        </footer>
      )}

      <GuideModal
        isOpen={guideOpen}
        onClose={() => setGuideOpen(false)}
        onNavigate={navigateTo}
        colorMode={colorMode}
        onToggleColorMode={handleToggleColorMode}
      />
    </div>
  );
}
