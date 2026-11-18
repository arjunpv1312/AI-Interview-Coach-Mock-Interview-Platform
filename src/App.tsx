/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import {
  ViewState,
  User,
  InterviewSession,
  InterviewConfig,
  ThemeVariant,
} from './types';
import {
  clearVaultSession,
  getVaultSession,
  getVaultUser,
  initializeVault,
  saveVaultSession,
  updateVaultUser,
} from './lib/CryptoVault';
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
import { Logo } from './components/Logo';
import {
  UserCircle,
  LogOut,
  Globe,
  FileText,
  Palette,
  ShieldCheck,
  Lock,
} from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const pageTransition = {
  duration: 0.35,
  ease: [0.16, 1, 0.3, 1] as const,
};

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
  const [themeDropdown, setThemeDropdown] = useState(false);

  const launchSetupWithPrefill = (prefill: Partial<InterviewConfig>) => {
    setSetupPrefill(prefill);
    setView('setup');
  };

  const handleThemeChange = (theme: ThemeVariant) => {
    document.documentElement.dataset.theme = theme;
    handleUpdateUser({ themePreference: theme });
    setThemeDropdown(false);
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

  useEffect(() => {
    document.documentElement.classList.add('dark');
    document.documentElement.classList.remove('light');
    if (!document.documentElement.dataset.theme) {
      document.documentElement.dataset.theme = 'amoled';
    }

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
              document.documentElement.dataset.theme =
                dbUser.themePreference || 'amoled';
              setView('dashboard');
            }
          } else {
            clearVaultSession();
          }
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

  const handleStartInterview = (config: InterviewConfig) => {
    if ('speechSynthesis' in window) {
      const unlockUtterance = new SpeechSynthesisUtterance('');
      unlockUtterance.volume = 0;
      window.speechSynthesis.speak(unlockUtterance);
    }

    setSessionParams(config);
    setView('live');
  };

  const handleCompleteInterview = (history: any[]) => {
    if (!sessionParams) return;
    const session: InterviewSession = {
      id: Math.random().toString(36).slice(2, 11),
      userId: user?.id || 'anon',
      company: sessionParams.company,
      role: sessionParams.role,
      type: sessionParams.type,
      difficulty: sessionParams.difficulty,
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
    { id: 'amoled', label: 'AMOLED Electric Blue', swatch: 'bg-blue-500' },
    { id: 'cobalt', label: 'Deep Cobalt Noir', swatch: 'bg-indigo-500' },
    { id: 'cyan', label: 'Arctic Cyan Black', swatch: 'bg-cyan-400' },
    { id: 'obsidian', label: 'Obsidian Sapphire', swatch: 'bg-blue-700' },
  ];

  if (!vaultReady) {
    return (
      <div className="min-h-screen bg-black text-slate-100 flex flex-col items-center justify-center gap-4">
        <div className="w-11 h-11 rounded-xl border border-blue-500/30 bg-[#050912] flex items-center justify-center text-blue-400">
          <Lock size={20} className="animate-pulse" />
        </div>
        <div className="text-xs font-mono text-slate-400">
          Unlocking AES-256-GCM Encrypted Vault...
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-slate-100 font-sans selection:bg-blue-600/30 overflow-x-hidden relative flex flex-col">
      {/* Subtle AMOLED blue atmospheric lighting */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[35%] -left-[15%] w-[60%] h-[60%] rounded-full bg-blue-600/10 blur-[150px]" />
        <div className="absolute top-[55%] -right-[15%] w-[55%] h-[55%] rounded-full bg-cyan-500/8 blur-[160px]" />
      </div>

      {/* Top Bar (3-Zone Contract) */}
      {view !== 'live' && view !== 'auth' && view !== 'public-cert' && (
        <header className="border-b border-[#16223b] bg-black/90 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between gap-8">
            <button
              type="button"
              onClick={() => setView('dashboard')}
              className="flex items-center gap-3 whitespace-nowrap shrink-0 cursor-pointer"
            >
              <div className="w-8 h-8 rounded-lg border border-blue-500/30 overflow-hidden shrink-0">
                <Logo />
              </div>
              <span className="font-bold text-base tracking-tight text-white">
                Interview Copilot
              </span>
            </button>

            <nav className="hidden md:flex items-center gap-6 text-sm font-medium">
              <button
                type="button"
                onClick={() => setView('dashboard')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  view === 'dashboard'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Dashboard
              </button>
              <button
                type="button"
                onClick={() => setView('setup')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  view === 'setup'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                New Session
              </button>
              <button
                type="button"
                onClick={() => setView('bank')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  view === 'bank'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Study Bank
              </button>
              <button
                type="button"
                onClick={() => setView('history')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  view === 'history'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                History
              </button>
              <button
                type="button"
                onClick={() => setView('suggestions')}
                className={`whitespace-nowrap shrink-0 transition-colors cursor-pointer ${
                  view === 'suggestions'
                    ? 'text-blue-400'
                    : 'text-slate-400 hover:text-white'
                }`}
              >
                Insights
              </button>
            </nav>

            <div className="flex items-center gap-3 shrink-0">
              <button
                type="button"
                onClick={() => setView('security')}
                className={`p-2 rounded-lg transition-colors cursor-pointer flex items-center gap-1.5 text-xs font-medium ${
                  view === 'security'
                    ? 'text-emerald-400 bg-[#0a1120]'
                    : 'text-slate-400 hover:text-white hover:bg-[#0a1120]'
                }`}
                title="Live Encryption & Security Audit"
              >
                <ShieldCheck size={17} />
                <span className="hidden lg:inline">Security</span>
              </button>

              <div className="relative">
                <button
                  type="button"
                  onClick={() => setThemeDropdown(!themeDropdown)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0a1120] transition-colors cursor-pointer"
                  title="AMOLED Blue Theme Variants"
                >
                  <Palette size={17} />
                </button>
                {themeDropdown && (
                  <div className="absolute right-0 mt-2 w-56 bg-[#050912] border border-[#16223b] rounded-xl shadow-2xl overflow-hidden z-[100]">
                    {themeOptions.map((opt) => (
                      <button
                        type="button"
                        key={opt.id}
                        onClick={() => handleThemeChange(opt.id)}
                        className="w-full text-left px-4 py-3 hover:bg-[#0a1120] text-xs font-medium text-slate-200 flex items-center gap-3 cursor-pointer"
                      >
                        <span
                          className={`w-3 h-3 rounded-full ${opt.swatch}`}
                        />
                        <span>{opt.label}</span>
                      </button>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2 text-xs font-medium text-slate-300 pl-2 border-l border-[#16223b]">
                <UserCircle size={18} className="text-blue-400" />
                <span className="hidden sm:inline max-w-[120px] truncate">
                  {user?.fullName}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    clearVaultSession();
                    setUser(null);
                    setView('auth');
                  }}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-[#0a1120] transition-colors cursor-pointer"
                  title="Sign Out"
                >
                  <LogOut size={16} />
                </button>
              </div>
            </div>
          </div>
        </header>
      )}

      {/* Main Content */}
      <main
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
                onLogin={async (u, rememberMe) => {
                  if (rememberMe) {
                    await saveVaultSession(u.email);
                  } else {
                    clearVaultSession();
                  }
                  document.documentElement.dataset.theme =
                    u.themePreference || 'amoled';
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
                onVaultWiped={() => {
                  setUser(null);
                  setSessionParams(null);
                  setCurrentSession(null);
                  setView('auth');
                }}
              />
            </motion.div>
          )}
        </AnimatePresence>
      </main>

      {view !== 'live' && view !== 'auth' && (
        <footer className="w-full mt-auto py-8 border-t border-[#16223b] bg-black text-center text-slate-400 relative z-10">
          <div className="flex flex-col items-center justify-center space-y-4">
            <div className="flex items-center gap-4">
              <a
                href="https://www.linkedin.com/in/arjun-pv1312"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#050912] hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-[#16223b]"
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
                className="p-2.5 bg-[#050912] hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-[#16223b]"
                aria-label="Portfolio"
              >
                <Globe className="w-4 h-4" />
              </a>
              <a
                href="https://ais-pre-dy4l4r6gvgehsxaprdkgra-893539578143.asia-southeast1.run.app/"
                target="_blank"
                rel="noopener noreferrer"
                className="p-2.5 bg-[#050912] hover:bg-blue-600 hover:text-white rounded-xl transition-all border border-[#16223b]"
                aria-label="AI Resume Analyzer"
              >
                <FileText className="w-4 h-4" />
              </a>
            </div>
            <div className="text-xs text-slate-500">
              Created by Arjun PV · Interview Copilot Pro · AES-256-GCM Encrypted
            </div>
          </div>
        </footer>
      )}
    </div>
  );
}
