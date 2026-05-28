import React from 'react';
import { User } from '../types';
import { PlayCircle, History, BookOpen, Video, Target, Clock, Building } from 'lucide-react';
import { 
  LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer 
} from 'recharts';

interface DashboardViewProps {
  user: User;
  onNavigate: (view: any) => void;
}

export function DashboardView({ user, onNavigate }: DashboardViewProps) {
  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in duration-500">
      
      {/* Header */}
      <div className="flex flex-col md:flex-row justify-between items-start md:items-end gap-6 pb-4">
        <div className="flex items-center gap-6">
          <div className="w-24 h-24 rounded-2xl bg-white/5 p-2 border border-slate-700/50 shadow-xl overflow-hidden shrink-0 flex items-center justify-center">
             <img src="/src/assets/images/tutor_logo_1779982364511.png" alt="Tutor Logo" className="w-full h-full object-cover rounded-xl" />
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

      {/* Stats Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <StatCard icon={<Video className="text-purple-400" />} title="Mock Interviews" value={user.totalInterviews.toString()} />
        <StatCard icon={<Target className="text-blue-400" />} title="Average Score" value={user.totalInterviews > 0 ? `${user.averageScore}%` : '-'} />
        <StatCard icon={<Clock className="text-emerald-400" />} title="Hours Practiced" value={user.totalInterviews > 0 ? "4.5h" : "0h"} />
        <StatCard icon={<Building className="text-amber-400" />} title="Companies" value={user.totalInterviews > 0 ? "3" : "0"} />
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        
        {/* Chart */}
        <div className="lg:col-span-2 bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-6">Score Improvement</h2>
          <div className="h-64">
            {user.totalInterviews === 0 || !user.scoreHistory || user.scoreHistory.length === 0 ? (
              <div className="w-full h-full flex flex-col items-center justify-center border-2 border-dashed border-slate-700/50 rounded-xl text-slate-500">
                <Target className="mb-2 text-slate-600" size={32} />
                <p>No interview data yet</p>
                <p className="text-sm">Complete your first mock interview to see stats!</p>
              </div>
            ) : (
              <ResponsiveContainer width="100%" height="100%">
                <LineChart data={user.scoreHistory.map((score, i) => ({ name: `Attempt ${i + 1}`, score }))}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#1e293b" />
                  <XAxis dataKey="name" stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} />
                  <YAxis stroke="#64748b" fontSize={12} tickLine={false} axisLine={false} domain={[0, 100]} />
                  <Tooltip 
                    contentStyle={{ backgroundColor: '#0f172a', border: '1px solid #1e293b', borderRadius: '8px' }}
                  />
                  <Line type="monotone" dataKey="score" stroke="#3b82f6" strokeWidth={3} dot={{ r: 4, fill: '#3b82f6', strokeWidth: 2, stroke: '#1e293b' }} />
                </LineChart>
              </ResponsiveContainer>
            )}
          </div>
        </div>

        {/* Quick Actions */}
        <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-6 flex flex-col gap-4">
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
             onClick={() => onNavigate('results')}
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
            onClick={() => onNavigate('bank')}
            className="flex items-center gap-3 p-4 rounded-xl border border-slate-700 bg-slate-800/50 hover:bg-slate-800 hover:border-emerald-500/50 transition-all text-left group"
          >
            <div className="p-2 rounded-lg bg-emerald-500/20 text-emerald-400 group-hover:scale-110 transition-transform">
              <BookOpen size={24} />
            </div>
            <div>
              <div className="font-medium text-slate-200">Practice Questions</div>
              <div className="text-sm text-slate-400">Browse the question bank</div>
            </div>
          </button>
          
        </div>
      </div>
    </div>
  );
}

function StatCard({ icon, title, value }: { icon: React.ReactNode, title: string, value: string }) {
  return (
    <div className="bg-slate-900/50 backdrop-blur-sm border border-slate-800 rounded-xl p-5 flex items-center gap-4">
      <div className="p-3 bg-slate-800 rounded-lg">
        {icon}
      </div>
      <div>
        <div className="text-sm text-slate-400 font-medium">{title}</div>
        <div className="text-2xl font-bold text-white mt-0.5">{value}</div>
      </div>
    </div>
  )
}
