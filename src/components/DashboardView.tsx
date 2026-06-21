import React from 'react';
import { User } from '../types';
import { PlayCircle, History, BookOpen, Video, Target, Clock, Building, FileText, ExternalLink, Lightbulb, Brain, Sparkles, Calendar as CalendarIcon } from 'lucide-react';
import { motion } from 'motion/react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';
import { Badges } from './Badges';
import { Logo } from './Logo';
import { CalendarWidget } from './CalendarWidget';
import { DailyGoalTracker } from './DailyGoalTracker';

interface DashboardViewProps {
  user: User;
  onNavigate: (view: any) => void;
  onUpdateUser?: (props: Partial<User>) => void;
}

export function DashboardView({ user, onNavigate, onUpdateUser }: DashboardViewProps) {
  const formatTimeSpent = (seconds?: number) => {
    if (!seconds) return "0m";
    const h = Math.floor(seconds / 3600);
    const m = Math.floor((seconds % 3600) / 60);
    if (h > 0) {
      if (m > 0) return `${h}h ${m}m`;
      return `${h}h`;
    }
    return `${m}m`;
  };

  const getRankInfo = (interviews: number) => {
    if (interviews < 5) return { level: 1, rank: 'Novice', next: 'Apprentice', max: 5, current: interviews, color: 'text-slate-400', bg: 'bg-slate-400' };
    if (interviews < 13) return { level: 2, rank: 'Apprentice', next: 'Professional', max: 13, current: interviews, color: 'text-blue-400', bg: 'bg-blue-400' };
    if (interviews < 20) return { level: 3, rank: 'Professional', next: 'Expert', max: 20, current: interviews, color: 'text-purple-400', bg: 'bg-purple-400' };
    if (interviews < 50) return { level: 4, rank: 'Expert', next: 'Master', max: 50, current: interviews, color: 'text-rose-400', bg: 'bg-rose-400' };
    return { level: 5, rank: 'Master', next: 'Grandmaster', max: 100, current: Math.min(interviews, 100), color: 'text-amber-400', bg: 'bg-amber-400' }; 
  };

  const rankInfo = getRankInfo(user.totalInterviews);

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-slate-800 border border-slate-700/50 shadow-xl overflow-hidden shrink-0 flex items-center justify-center shadow-blue-500/20">
             <Logo />
          </div>
          <div>
            <h1 className="text-3xl font-bold bg-clip-text text-transparent bg-gradient-to-r from-blue-400 to-purple-400">
              Welcome back, {user.fullName.split(' ')[0]}
            </h1>
            <p className="text-slate-400 mt-2 text-lg">Ready to crush your next interview?</p>
          </div>
        </div>
        <div className="flex gap-3 mt-4 md:mt-0">
          <button 
            onClick={() => onNavigate('setup')}
            className="flex items-center gap-2 bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold transition-all shadow-lg shadow-blue-500/20"
          >
            <PlayCircle size={20} />
            <span>Start Practice</span>
          </button>
        </div>
      </div>

      {/* Progress & Goals */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Rank Progress */}
        <motion.div initial={{ opacity: 0, y: 15 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <div className="flex justify-between items-end mb-2">
            <div>
              <div className="text-sm text-slate-400 font-medium uppercase tracking-wider mb-1">Professional Rank</div>
              <div className={`text-2xl font-bold flex items-center gap-2 ${rankInfo.color}`}>
                Level {rankInfo.level}: {rankInfo.rank}
              </div>
            </div>
            <div className="text-sm font-medium text-slate-400 text-right">
              <span className="text-white font-bold">{rankInfo.current}</span> / {rankInfo.max} 
              <span className="hidden sm:inline"> Interviews to {rankInfo.next}</span>
              <span className="sm:hidden"> to Next</span>
            </div>
          </div>
          <div className="h-3 w-full bg-slate-800 rounded-full overflow-hidden mt-4 shadow-inner">
            <div 
              className={`h-full rounded-full transition-all duration-1000 ${rankInfo.bg}`}
              style={{ width: `${(rankInfo.current / rankInfo.max) * 100}%` }}
            ></div>
          </div>
        </motion.div>

        {/* Daily Goal Tracker */}
        <DailyGoalTracker user={user} onUpdateGoal={(goal) => onUpdateUser?.({ dailyGoal: goal })} />
      </div>

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Video className="text-purple-400" />} title="Mock Interviews" value={user.totalInterviews.toString()} />
        <StatCard icon={<Target className="text-blue-400" />} title="Average Score" value={user.totalInterviews > 0 ? `${user.averageScore}%` : '-'} />
        <StatCard icon={<Clock className="text-emerald-400" />} title="Time Practiced" value={formatTimeSpent(user.timeSpentSeconds)} />
        <StatCard icon={<Building className="text-amber-400" />} title="Companies" value={user.companiesInterviewed ? user.companiesInterviewed.length.toString() : "0"} />
      </div>

      <Badges user={user} onNavigate={onNavigate} />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <motion.div initial={{ opacity: 0, scale: 0.95 }} animate={{ opacity: 1, scale: 1 }} transition={{ delay: 0.2 }} className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 flex flex-col">
          <h2 className="text-lg font-semibold text-white mb-6">Score Improvement</h2>
          <div className="flex-1 min-h-[250px] w-full h-full relative">
            {user.totalInterviews === 0 || !user.scoreHistory || user.scoreHistory.length === 0 ? (
              <div className="absolute inset-0 flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl text-slate-500">
                <Target className="mb-2 text-slate-600" size={32} />
                <p>No interview data yet</p>
                <p className="text-sm">Complete your first mock interview to see stats!</p>
              </div>
            ) : (
              <div className="absolute inset-0">
                <ResponsiveContainer width="100%" height="100%">
                  <AreaChart data={user.scoreHistory.map((score, i) => ({ name: `Attempt ${i + 1}`, score }))}>
                  <defs>
                    <linearGradient id="colorScore" x1="0" y1="0" x2="0" y2="1">
                      <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.4}/>
                      <stop offset="95%" stopColor="#3b82f6" stopOpacity={0.0}/>
                    </linearGradient>
                  </defs>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" vertical={false} />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px', color: '#f8fafc' }}
                    itemStyle={{ color: '#3b82f6', fontWeight: 'bold' }}
                  />
                  <Area type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} fillOpacity={1} fill="url(#colorScore)" activeDot={{ r: 6, fill: '#3b82f6', strokeWidth: 0 }} />
                </AreaChart>
              </ResponsiveContainer>
              </div>
            )}
          </div>
        </motion.div>

        {/* Actions & Meet */}
        <div className="flex flex-col gap-6">
            {/* Quick Actions */}
            <motion.div 
               initial={{ opacity: 0, x: 20 }} 
               animate={{ opacity: 1, x: 0 }} 
               transition={{ delay: 0.3 }}
               className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 flex flex-col gap-4 flex-1"
            >
              <h2 className="text-lg font-semibold text-white mb-2">Quick Actions</h2>
          
          <button 
            onClick={() => onNavigate('setup')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
              <PlayCircle size={24} />
            </div>
            <div>
              <div className="font-medium text-slate-200">Start New Interview</div>
              <div className="text-sm text-slate-400">Configure your next mock session</div>
            </div>
          </button>

          <button 
             onClick={() => onNavigate('suggestions')}
             className="flex items-center gap-3 p-4 rounded-xl border border-indigo-500/30 bg-indigo-500/10 hover:bg-slate-800 hover:border-indigo-500/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <Sparkles size={24} />
            </div>
            <div>
              <div className="font-medium text-slate-200">AI Career Coach</div>
              <div className="text-sm text-slate-400">Get personalized performance insights</div>
            </div>
          </button>

          <button 
             onClick={() => onNavigate('learner')}
             className="flex items-center gap-3 p-4 rounded-xl border border-emerald-500/30 bg-emerald-500/10 hover:bg-slate-800 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <Brain size={24} />
            </div>
            <div>
              <div className="font-medium text-slate-200">Auto-Learner Hub</div>
              <div className="text-sm text-slate-400">Auto-generate new resources & trends</div>
            </div>
          </button>
          
          <button 
             onClick={() => onNavigate('history')}
             className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-purple-500/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-purple-500/20 text-purple-400 group-hover:scale-110 transition-transform">
              <History size={24} />
            </div>
            <div>
              <div className="font-medium text-slate-200">View History</div>
              <div className="text-sm text-slate-400">Analyze past performance</div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('simulation')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-indigo-500/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-indigo-500/20 text-indigo-400 group-hover:scale-110 transition-transform">
              <Brain size={24} />
            </div>
            <div>
              <div className="font-medium text-slate-200">Mock Simulation</div>
              <div className="text-sm text-slate-400">Generate persona questions</div>
            </div>
          </button>

          <button 
            onClick={() => onNavigate('bank')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="font-medium text-slate-200">Practice Questions</div>
              <div className="text-sm text-slate-400">Browse study scenarios</div>
            </div>
          </button>
          
          <a 
            href="https://ais-pre-dy4l4r6gvgehsxaprdkgra-893539578143.asia-southeast1.run.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-between p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-blue-500/50 transition-all text-left group"
          >
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-blue-500/20 text-blue-400 group-hover:scale-110 transition-transform">
                <FileText size={24} />
              </div>
              <div>
                <div className="font-medium text-slate-200">Resume ATS Checker</div>
                <div className="text-sm text-slate-400">Analyze weaknesses & score</div>
              </div>
            </div>
            <ExternalLink size={18} className="text-slate-500 group-hover:text-blue-400 transition-colors" />
          </a>
          
        </motion.div>
        
        {/* Pro Tips Sidebar */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 flex flex-col gap-4 relative overflow-hidden">
          <div className="absolute top-0 right-0 p-6 opacity-5 pointer-events-none">
            <Lightbulb size={120} />
          </div>
          <div className="flex items-center gap-2 text-amber-400 mb-2 relative z-10">
            <Lightbulb size={20} />
            <h2 className="text-lg font-semibold text-white">Pro Tips</h2>
          </div>
          <div className="space-y-4 relative z-10">
            {[
              "Structure your answers using the STAR method: Situation, Task, Action, Result.",
              "Always listen carefully to the question before jumping into the solution.",
              "Don't be afraid to ask clarifying questions if the prompt is ambiguous.",
              "In technical interviews, think out loud so the interviewer can follow your logic.",
              "Prepare a few thoughtful questions to ask the interviewer at the end of the session.",
              "Focus on the 'I' rather than 'We' when discussing your specific contributions to a project.",
              "Take a deep breath and stay calm. It's perfectly fine to pause and gather your thoughts.",
            ].sort(() => 0.5 - Math.random()).slice(0, 3).map((tip, index) => (
              <p key={index} className="text-slate-300 text-sm italic leading-relaxed border-l-2 border-amber-500/50 pl-4 py-1">
                "{tip}"
              </p>
            ))}
          </div>
        </div>
        
        </div>
      </div>

      <div className="mt-8">
         <h2 className="text-xl font-bold text-white mb-6 flex items-center gap-2">
            <CalendarIcon className="text-blue-400" />
            Interview Schedule
         </h2>
         <CalendarWidget user={user} onNavigate={onNavigate} />
      </div>

    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true }}
      whileHover={{ y: -2, scale: 1.02 }}
      transition={{ type: 'spring', stiffness: 300 }}
      className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 flex items-center gap-4 hover:border-slate-700 hover:bg-slate-800/80 cursor-default"
    >
      <div className="p-3 bg-slate-800 rounded-lg shadow-sm">
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-400 font-medium">{title}</div>
        <div className="text-2xl font-bold text-white mt-0.5 tracking-tight">{value}</div>
      </div>
    </motion.div>
  )
}
