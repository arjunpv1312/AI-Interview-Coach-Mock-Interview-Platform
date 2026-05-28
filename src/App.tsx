/**
 * @license
 * SPDX-License-Identifier: Apache-2.0
 */
import React, { useState } from 'react';
import { ViewState, User, InterviewSession } from './types';
import { mockQuestions } from './data';
import { DashboardView } from './components/DashboardView';
import { SetupView } from './components/SetupView';
import { LiveInterviewView } from './components/LiveInterviewView';
import { ResultsView } from './components/ResultsView';
import { QuestionBankView } from './components/QuestionBankView';
import { AuthView } from './components/AuthView';
import { UserCircle, LogOut } from 'lucide-react';

export default function App() {
  const [view, setView] = useState<ViewState>('auth');
  const [user, setUser] = useState<User | null>(null);
  const [sessionParams, setSessionParams] = useState<any>(null);
  const [currentSession, setCurrentSession] = useState<InterviewSession | null>(null);

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
    <div className="min-h-screen bg-slate-950 bg-gradient-to-br from-slate-950 via-slate-900 to-indigo-950 text-slate-100 font-sans selection:bg-blue-500/30">
      
      {/* Navigation */}
      {(view !== 'live' && view !== 'auth') && (
        <nav className="border-b border-slate-800 bg-slate-950/50 backdrop-blur-lg sticky top-0 z-50">
          <div className="max-w-7xl mx-auto px-6 h-16 flex items-center justify-between">
            <div className="flex items-center gap-3 cursor-pointer" onClick={() => setView('dashboard')}>
              <div className="w-8 h-8 rounded-lg bg-blue-600 flex items-center justify-center font-bold text-white shadow-lg shadow-blue-500/20">
                AI
              </div>
              <span className="font-bold text-lg tracking-tight">InterviewCoach</span>
            </div>
            
            <div className="flex items-center gap-6">
              <button onClick={() => setView('dashboard')} className={`text-sm font-medium transition-colors ${view === 'dashboard' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>Dashboard</button>
              <button onClick={() => setView('bank')} className={`text-sm font-medium transition-colors ${view === 'bank' ? 'text-blue-400' : 'text-slate-400 hover:text-white'}`}>Question Bank</button>
              
              <div className="h-6 w-px bg-slate-800 mx-2"></div>
              
              <div className="flex items-center gap-2 text-sm font-medium text-slate-300">
                <UserCircle size={20} className="text-slate-400" />
                <span className="hidden sm:inline">{user?.fullName}</span>
                <button onClick={() => { 
                  localStorage.removeItem('authData');
                  setUser(null); 
                  setView('auth'); 
                }} className="ml-4 p-2 text-slate-400 hover:text-white rounded-lg hover:bg-slate-800 transition-colors" title="Log Out">
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
    </div>
  );
}
