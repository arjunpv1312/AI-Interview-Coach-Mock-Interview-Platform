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
import { UserCircle, LogOut, Globe, FileText, Sun, Moon } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [sessionParams, setSessionParams] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);
  const [isLightMode, setIsLightMode] = useState(() => {
    return localStorage.getItem('theme') === 'light';
  });

  useEffect(() => {
    if (isLightMode) {
      document.documentElement.classList.add('light');
      localStorage.setItem('theme', 'light');
    } else {
      document.documentElement.classList.remove('light');
      localStorage.setItem('theme', 'dark');
    }
  }, [isLightMode]);

  React.useEffect(() => {
    const authDataStr = localStorage.getItem('authData');
    if (authDataStr) {
      try {
        const authData = JSON.parse(authDataStr);
        const now = new Date().getTime();
        const oneWeek = 7 * 24 * 60 * 60 * 1000;
        
        if (now - authData.timestamp < oneWeek) {
          const usersDB = JSON.parse(localStorage.getItem('usersDB') || '{}');
          if (usersDB[authData.email]) {
            setUser(usersDB[authData.email].user);
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
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-slate-950 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      {(view !== 'live' && view !== 'auth') && (
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-50 transition-colors">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-slate-800 flex items-center justify-center font-bold text-slate-100 shadow-lg shadow-blue-500/20 overflow-hidden">
                <img src="/src/assets/images/interview_copilot_logo_v2_1779985371209.png" alt="Interview Copilot" className="w-full h-full object-cover" />
              </div>
              <span className="font-bold text-lg tracking-tight">Interview Copilot</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button 
                onClick={() => setIsLightMode(!isLightMode)} 
                className="p-2 text-slate-400 hover:text-slate-100 rounded-lg hover:bg-slate-800 transition-colors"
                title={isLightMode ? "Switch to Dark Mode" : "Switch to Light Mode"}
              >
                {isLightMode ? <Moon size={18} /> : <Sun size={18} />}
              </button>
              
              <div className="h-6 w-px bg-slate-800 mx-2"></div>

              <button onClick={() => setView('dashboard')} className={`text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'}`}>Dashboard</button>
              <button onClick={() => setView('bank')} className={`text-sm font-medium transition-colors ${view === 'bank' ? 'text-blue-400' : 'text-slate-400 hover:text-slate-100'}`}>Question Bank</button>
              
              <div className="h-6 w-px bg-slate-800 mx-2"></div>
              
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
      <main className={`px-4 sm:px-6 py-8 ${view === 'live' ? 'py-4' : ''} ${view === 'auth' ? 'py-0 px-0' : ''}`}>
        {view === 'auth' && (
          <AuthView onLogin={(u) => {
            localStorage.setItem('authData', JSON.stringify({ email: u.email, timestamp: new Date().getTime() }));
            setUser(u);
            setView('dashboard');
          }} />
        )}
        {view === 'dashboard' && user && <DashboardView user={user} onNavigate={setView} />}
        {view === 'setup' && <SetupView onStart={handleStartInterview} onCancel={cancelInterview} />}
        {view === 'live' && (
           <LiveInterviewView 
              config={sessionParams} 
              onComplete={handleCompleteInterview} 
              onCancel={cancelInterview} 
           />
        )}
        {view === 'results' && currentSession && user && (
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
                          
                          // Simple weighted average for the mock score assuming evaluating gives a score out of 100
                          // Actually, the AI Returns a probability. We can map "High" to 90, "Moderate" to 70, "Needs Work" to 40.
                          let scoreNum = 50;
                          if (score.crackProbability === 'High') scoreNum = 90;
                          if (score.crackProbability === 'Moderate') scoreNum = 70;
                          if (score.crackProbability === 'Needs Work') scoreNum = 40;

                          const newAvg = Math.round((((dbUser.averageScore || 0) * (dbUser.totalInterviews || 0)) + scoreNum) / newTotal);
                          
                          dbUser.totalInterviews = newTotal;
                          dbUser.averageScore = newAvg;
                          dbUser.scoreHistory = [...(dbUser.scoreHistory || []), scoreNum];
                          
                          usersDB[user.email].user = dbUser;
                          localStorage.setItem('usersDB', JSON.stringify(usersDB));
                          setUser(dbUser);
                      }
                  }
              }}
           />
        )}
        {view === 'bank' && <QuestionBankView onNavigate={setView} />}
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
