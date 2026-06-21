/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState, useEffect } from 'react';
import { ViewState, User, InterviewSession } from './types';
import { mockQuestions } from './data';
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
import { UserCircle, LogOut, Globe, FileText, Palette, Sparkles, Cpu, ShieldCheck } from 'lucide-react';
import { AnimatePresence, motion } from 'motion/react';

export const pageTransition = { duration: 0.5, ease: [0.16, 1, 0.3, 1] };

export default function App() {
  const [view, setView] = useState<ViewState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [sessionParams, setSessionParams] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [themeDropdown, setThemeDropdown] = useState(false);

  const handleThemeChange = (theme: 'default' | 'midnight' | 'forest' | 'sunset') => {
     document.documentElement.dataset.theme = theme;
     handleUpdateUser({ themePreference: theme });
     setThemeDropdown(false);
  };

  const handleUpdateUser = (updatedProps: Partial<User>) => {
     if (user) {
         const updatedUser = { ...user, ...updatedProps };
         setUser(updatedUser);
         const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');
         if (usersDB[user.email]) {
             usersDB[user.email].user = updatedUser;
             localStorage.setItem('usersDB', JSON.stringify(usersDB));
         }
     }
  };

  React.useEffect(() => {
    document.documentElement.classList.remove('light');
    localStorage.setItem('theme', 'dark');
    
    const params = new URLSearchParams(window.location.search);
    if (params.get('cert')) {
      setView('public-cert');
      return;
    }
    
    const authDataStr = localStorage.getItem('authData');
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        const now = new Date().getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        if (now - authData.timestamp < oneWeek) {
          const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');
          if (usersDB[authData.email]) {
            const dbUser = usersDB[authData.email].user;
            setUser(dbUser);
            if (dbUser.themePreference) {
              document.documentElement.dataset.theme = dbUser.themePreference;
            }
            setView('dashboard');
          }
        } else {
          localStorage.removeItem('authData');
        }
      } catch (e) {
        localStorage.removeItem('authData');
      }
    }
  }, []);

  const handleStartInterview = (config: any) => {
    // Unlock Web Speech API on direct user interaction
    const unlockUtterance = new SpeechSynthesisUtterance('');
    unlockUtterance.volume = 0;
    window.speechSynthesis.speak(unlockUtterance);

    setSessionParams(config);
    setView('live');
  };

  const handleCompleteInterview = (history: any[]) => {
    const session: InterviewSession = {
        id: Math.random().toString(36).substr(2, 9),
        userId: user?.id || 'anon',
        company: sessionParams.company,
        role: sessionParams.role,
        type: sessionParams.type,
        difficulty: sessionParams.difficulty,
        startTime: new Date().toISOString(),
        history: history
    };
    setCurrentSession(session);
    setView('results');
  };

  const cancelInterview = () => {
    setView('dashboard');
    setSessionParams(null);
  };

  return (
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans selection:bg-blue-500/30 overflow-x-hidden relative flex flex-col">
      
      {/* Background Glow Orbs */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0">
        <div className="absolute -top-[40%] -left-[20%] w-[70%] h-[70%] rounded-full bg-blue-900/20 blur-[120px] animate-pulse [animation-duration:10s]"></div>
        <div className="absolute top-[60%] -right-[10%] w-[60%] h-[60%] rounded-full bg-indigo-900/10 blur-[120px] animate-pulse [animation-duration:12s] [animation-delay:2s]"></div>
      </div>

      {/* Navigation */}
      {(view !== 'live' && view !== 'auth' && view !== 'public-cert') && (
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-50 transition-colors relative">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
        <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
          <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-100 shadow-lg shadow-blue-500/20 overflow-hidden shrink-0">
            <Logo />
          </div>
          <span className="font-bold text-lg tracking-tight">Interview Copilot</span>
        </div>
            
            <div className="flex items-center gap-6">
              <button onClick={() => setView('dashboard')} className={`text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'}`}>Dashboard</button>
              <button onClick={() => setView('bank')} className={`text-sm font-medium transition-colors ${view === 'bank' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'}`}>Study Scenarios</button>
              <button onClick={() => setView('history')} className={`text-sm font-medium transition-colors ${view === 'history' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'}`}>History</button>
              <button onClick={() => setView('suggestions')} className={`text-sm font-medium transition-colors flex items-center gap-1 ${view === 'suggestions' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'}`}><Sparkles size={14} /> Insights</button>
              <button onClick={() => setView('learner')} className={`text-sm font-medium transition-colors flex items-center gap-1 ${view === 'learner' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-100'}`}><Cpu size={14} /> Learner AI</button>
              
              <div className="h-6 w-px bg-slate-800 mx-2"></div>

              <button 
                  onClick={() => setView('security')} 
                  className={`text-sm font-medium transition-colors flex items-center gap-1 ${view === 'security' ? 'text-emerald-400' : 'text-slate-400 hover:text-slate-100'}`}
                  title="Run High Secure Malware & Safety Test"
              >
                  <ShieldCheck size={16} /> Security
              </button>
              
              <div className="relative">
                <button 
                  onClick={() => setThemeDropdown(!themeDropdown)}
                  className="p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors flex items-center gap-2"
                  title="Change Theme"
                >
                  <Palette size={18} />
                </button>
                {themeDropdown && (
                  <div className="absolute right-0 mt-2 w-48 bg-slate-800 border border-slate-700 rounded-xl shadow-xl overflow-hidden z-[100] animate-in fade-in zoom-in duration-200">
                    <button onClick={() => handleThemeChange('default')} className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm flex items-center gap-3">
                       <span className="w-3 h-3 rounded-full bg-slate-500"></span> Cosmic Slate
                    </button>
                    <button onClick={() => handleThemeChange('midnight')} className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm flex items-center gap-3">
                       <span className="w-3 h-3 rounded-full bg-blue-600"></span> Midnight Blue
                    </button>
                    <button onClick={() => handleThemeChange('forest')} className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm flex items-center gap-3">
                       <span className="w-3 h-3 rounded-full bg-emerald-500"></span> Emerald Forest
                    </button>
                    <button onClick={() => handleThemeChange('sunset')} className="w-full text-left px-4 py-3 hover:bg-slate-700 text-sm flex items-center gap-3">
                       <span className="w-3 h-3 rounded-full bg-rose-500"></span> Crimson Sunset
                    </button>
                  </div>
                )}
              </div>
              
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <UserCircle size={20} className="text-slate-400" />
                <span className="hidden sm:inline">{user?.fullName}</span>
                <button onClick={() => { 
                  localStorage.removeItem('authData');
                  setUser(null); 
                  setView('auth'); 
                }} className="ml-4 p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors" title="Log Out">
                  <LogOut size={18} />
                </button>
              </div>
            </div>
          </div>
        </nav>
      )}

      {/* Main Content Area */}
      <main className={`px-4 sm:px-6 py-8 relative ${view === 'live' ? 'py-4' : ''} ${(view === 'auth' || view === 'public-cert') ? 'py-0 px-0' : ''} flex-1 flex flex-col`}>
        <AnimatePresence mode="wait">
          {view === 'auth' && (
            <motion.div key="auth" initial={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.98, filter: 'blur(4px)' }} transition={pageTransition} className="flex-1 flex flex-col">
              <AuthView onLogin={(u) => {
                localStorage.setItem('authData', JSON.stringify({ email: u.email, timestamp: new Date().getTime() }));
                setUser(u);
                setView('dashboard');
              }} />
            </motion.div>
          )}
          {view === 'public-cert' && (
            <motion.div key="public-cert" initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={pageTransition} className="flex-1 flex flex-col">
              <PublicCertificateView />
            </motion.div>
          )}
          {view === 'dashboard' && user && (
            <motion.div key="dashboard" initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }} transition={pageTransition}>
              <DashboardView user={user} onNavigate={setView} onUpdateUser={handleUpdateUser} />
            </motion.div>
          )}
          {view === 'setup' && (
            <motion.div key="setup" initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }} transition={pageTransition}>
              <SetupView onStart={handleStartInterview} onCancel={cancelInterview} />
            </motion.div>
          )}
          {view === 'live' && (
            <motion.div key="live" initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} transition={pageTransition} className="w-full flex justify-center">
              <LiveInterviewView 
                 config={sessionParams} 
                 onComplete={handleCompleteInterview} 
                 onCancel={cancelInterview} 
              />
            </motion.div>
          )}
          {view === 'results' && currentSession && user && (
            <motion.div key="results" initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }} transition={pageTransition}>
              <ResultsView 
                 session={currentSession} 
                 onRetake={() => setView('setup')} 
                 onDashboard={() => setView('dashboard')}
                 onSaveScore={(score) => {
                     if (user && user.email) {
                         const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');
                         if (usersDB[user.email]) {
                             const dbUser = usersDB[user.email].user;
                             const newTotal = (dbUser.totalInterviews || 0) + 1;
                             
                             let scoreNum = score.overallScore ?? 50;
                             if (scoreNum === 50) {
                                 if (score.crackProbability === 'Highly Likely' || score.crackProbability === 'High') scoreNum = 90;
                                 if (score.crackProbability === 'Possible' || score.crackProbability === 'Moderate') scoreNum = 70;
                                 if (score.crackProbability === 'Needs Work') scoreNum = 40;
                             }

                             const newAvg = Math.round((((dbUser.averageScore || 0) * (dbUser.totalInterviews || 0)) + scoreNum) / newTotal);
                             
                             dbUser.totalInterviews = newTotal;
                             dbUser.averageScore = newAvg;
                             dbUser.scoreHistory = [...(dbUser.scoreHistory || []), scoreNum];
                             
                             if (currentSession) {
                                 const startTime = new Date(currentSession.startTime).getTime();
                                 const endTime = new Date().getTime();
                                 const diffSeconds = (endTime - startTime) / 1000;
                                 dbUser.timeSpentSeconds = (dbUser.timeSpentSeconds || 0) + diffSeconds;
                                 
                                 if (!dbUser.companiesInterviewed) dbUser.companiesInterviewed = [];
                                 if (!dbUser.companiesInterviewed.includes(currentSession.company)) {
                                     dbUser.companiesInterviewed.push(currentSession.company);
                                 }

                                 if (!dbUser.pastSessions) dbUser.pastSessions = [];
                                 dbUser.pastSessions.unshift({
                                     id: currentSession.id,
                                     date: currentSession.startTime,
                                     company: currentSession.company,
                                     role: currentSession.role,
                                     score: scoreNum,
                                     crackProbability: score.crackProbability || 'Unknown',
                                     overallSummary: score.overallSummary,
                                     improvements: score.improvements,
                                     studyTopics: score.studyTopics
                                 });
                             }
                             
                             dbUser.loginStreak = 7; // Mock streak for presentation
                             usersDB[user.email].user = dbUser;
                             localStorage.setItem('usersDB', JSON.stringify(usersDB));
                             setUser(dbUser);
                         }
                     }
                 }}
              />
            </motion.div>
          )}
          {view === 'bank' && (
            <motion.div key="bank" initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }} transition={pageTransition}>
              <QuestionBankView onNavigate={setView} />
            </motion.div>
          )}
          {view === 'history' && user && (
            <motion.div key="history" initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }} transition={pageTransition}>
              <HistoryView user={user} onNavigate={setView} />
            </motion.div>
          )}
          {view === 'simulation' && user && (
            <motion.div key="simulation" initial={{ opacity: 0, y: 15, filter: 'blur(4px)' }} animate={{ opacity: 1, y: 0, filter: 'blur(0px)' }} exit={{ opacity: 0, y: -15, filter: 'blur(4px)' }} transition={pageTransition}>
              <SimulationView onNavigate={setView} />
            </motion.div>
          )}
          {view === 'certificate' && user && (
            <motion.div key="certificate" initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} transition={pageTransition}>
              <CertificateView user={user} onNavigate={setView} />
            </motion.div>
          )}
          {view === 'suggestions' && user && (
            <motion.div key="suggestions" initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} transition={pageTransition}>
              <SuggestionsView user={user} onNavigate={setView} />
            </motion.div>
          )}
          {view === 'learner' && user && (
            <motion.div key="learner" initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} transition={pageTransition}>
              <LearnerView onNavigate={setView} />
            </motion.div>
          )}
          {view === 'security' && user && (
            <motion.div key="security" initial={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} animate={{ opacity: 1, scale: 1, filter: 'blur(0px)' }} exit={{ opacity: 0, scale: 0.95, filter: 'blur(4px)' }} transition={pageTransition}>
              <SecurityView onNavigate={setView} />
            </motion.div>
          )}
        </AnimatePresence>
      </main>
      
      {/* Elegantly styled Footer / Contact links */}
      <footer className="w-full mt-auto py-10 border-t border-slate-800/80 bg-gradient-to-b from-transparent to-slate-950 text-center text-slate-400">
        <div className="flex flex-col items-center justify-center space-y-6">
          <div className="flex items-center gap-6">
            <a 
               href="https://www.linkedin.com/in/arjun-pv1312" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="p-3 bg-slate-800/50 hover:bg-[#0A66C2] hover:text-white rounded-full transition-all duration-300 shadow-lg group border border-slate-700/50 hover:border-transparent"
               aria-label="LinkedIn"
            >
               <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="currentColor" className="w-5 h-5 group-hover:scale-110 transition-transform">
                 <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/>
               </svg>
            </a>
            
            <a 
               href="https://personal-portfolio--serenayt06.replit.app" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="p-3 bg-slate-800/50 hover:bg-emerald-600 hover:text-white rounded-full transition-all duration-300 shadow-lg group border border-slate-700/50 hover:border-transparent"
               aria-label="Portfolio"
               title="Portfolio"
            >
               <Globe className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>

            <a 
               href="https://ais-pre-dy4l4r6gvgehsxaprdkgra-893539578143.asia-southeast1.run.app/" 
               target="_blank" 
               rel="noopener noreferrer" 
               className="p-3 bg-slate-800/50 hover:bg-amber-600 hover:text-white rounded-full transition-all duration-300 shadow-lg group border border-slate-700/50 hover:border-transparent"
               aria-label="AI Resume Analyzer"
               title="AI Resume Analyzer"
            >
               <FileText className="w-5 h-5 group-hover:scale-110 transition-transform" />
            </a>
          </div>
          
          <div className="flex flex-col items-center">
            <span className="text-sm font-semibold tracking-wide text-slate-300">Created by Arjun PV</span>
            <span className="text-xs text-slate-500 mt-1">Elevating the interview experience.</span>
          </div>
        </div>
      </footer>
    </div>
  );
}
