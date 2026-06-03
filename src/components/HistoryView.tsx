import React, { useState } from 'react';
import { User, PastSession } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import { Building2, Briefcase, Activity, Calendar, Download, X, Target, CheckCircle2 } from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface HistoryViewProps {
  user: User;
  onNavigate: (v: any) => void;
}

export function HistoryView({ user, onNavigate }: HistoryViewProps) {
    const [selectedSession, setSelectedSession] = useState<PastSession | null>(null);
    const pastSessions = user.pastSessions || [];

    const getScoreColor = (score: number) => {
        if (score >= 80) return 'text-emerald-400';
        if (score >= 60) return 'text-amber-400';
        return 'text-rose-400';
    };

    const handleExportCSV = () => {
        if (!pastSessions.length) return;

        const headers = ['Date', 'Company', 'Role', 'Score', 'Probability'];
        const rows = pastSessions.map(session => [
            session.date ? format(parseISO(session.date), 'yyyy-MM-dd HH:mm:ss') : 'Unknown Date',
            `"${session.company.replace(/"/g, '""')}"`,
            `"${session.role.replace(/"/g, '""')}"`,
            session.score,
            `"${session.crackProbability}"`
        ]);

        const csvContent = [
            headers.join(','),
            ...rows.map(row => row.join(','))
        ].join('\n');

        const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
        const url = URL.createObjectURL(blob);
        const link = document.createElement('a');
        link.setAttribute('href', url);
        link.setAttribute('download', 'interview_history.csv');
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    };

  return (
    <div className="max-w-6xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold tracking-tight text-white">Interview History</h1>
          <p className="text-slate-400">Review your past mock interviews and track your progress.</p>
        </div>
        {pastSessions.length > 0 && (
          <button 
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-slate-800 hover:bg-slate-700 text-white px-4 py-2 rounded-xl font-medium transition-colors border border-slate-700"
          >
            <Download size={18} />
            Export CSV
          </button>
        )}
      </div>

      {pastSessions.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-2xl p-12 text-center shadow-lg">
            <div className="w-20 h-20 bg-slate-800 rounded-full flex items-center justify-center mx-auto mb-6">
                <Activity className="text-slate-500" size={32} />
            </div>
            <h3 className="text-xl font-bold text-white mb-2">No interviews yet</h3>
            <p className="text-slate-400 max-w-md mx-auto mb-8">
                You haven't completed any mock interviews. Your history and performance tracking will appear here once you finish your first session.
            </p>
            <button 
                onClick={() => onNavigate('setup')}
                className="bg-blue-600 hover:bg-blue-500 text-white px-6 py-3 rounded-xl font-bold shadow-lg shadow-blue-500/20 transition-all"
            >
                Start Your First Interview
            </button>
        </div>
      ) : (
        <div className="space-y-4">
            {pastSessions.map((session, i) => (
                <motion.div 
                    key={session.id || i}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: i * 0.05 }}
                    onClick={() => setSelectedSession(session)}
                    className="bg-slate-900 border border-slate-800 rounded-2xl p-6 shadow-lg flex flex-col md:flex-row gap-6 justify-between items-start md:items-center hover:border-slate-700 transition-colors cursor-pointer"
                >
                    <div className="flex flex-col gap-4 flex-1">
                        <div className="flex items-center gap-3">
                            <div className="w-12 h-12 bg-slate-800 rounded-xl flex items-center justify-center text-blue-400 shrink-0">
                                <Building2 size={24} />
                            </div>
                            <div>
                                <h3 className="text-lg font-bold text-white">{session.company}</h3>
                                <div className="flex items-center gap-2 text-sm text-slate-400 mt-0.5">
                                    <Briefcase size={14} />
                                    <span>{session.role}</span>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="flex items-center gap-6 w-full md:w-auto mt-4 md:mt-0 pt-4 md:pt-0 border-t md:border-t-0 border-slate-800 justify-between md:justify-end">
                        <div className="flex flex-col items-start md:items-end flex-initial">
                            <div className="flex items-center gap-2 text-slate-300">
                                <Calendar size={14} className="text-slate-500" />
                                <span className="text-sm font-medium">
                                    {session.date ? format(parseISO(session.date), 'MMM d, yyyy') : 'Unknown Date'}
                                </span>
                            </div>
                            <div className="flex items-center gap-2 text-sm text-slate-400 mt-1">
                                <span className={`px-2 py-0.5 rounded text-xs font-semibold ${
                                  session.crackProbability === 'Highly Likely' || session.crackProbability === 'High' ? 'bg-emerald-500/10 text-emerald-400 border border-emerald-500/20' : 
                                  session.crackProbability === 'Possible' || session.crackProbability === 'Moderate' ? 'bg-amber-500/10 text-amber-400 border border-amber-500/20' : 
                                  'bg-rose-500/10 text-rose-400 border border-rose-500/20'
                                }`}>
                                    {session.crackProbability} Probability
                                </span>
                            </div>
                        </div>

                        <div className="h-10 w-px bg-slate-800 hidden md:block mx-2"></div>

                        <div className="flex flex-col items-center justify-center min-w-[60px]">
                            <span className="text-xs font-semibold uppercase tracking-wider text-slate-500 mb-1">Score</span>
                            <div className={`text-2xl font-black ${getScoreColor(session.score)}`}>
                                {session.score}
                            </div>
                        </div>
                    </div>
                </motion.div>
            ))}
        </div>
      )}

      {/* Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-950/80 backdrop-blur-sm"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              onClick={(e) => e.stopPropagation()}
              className="bg-slate-900 border border-slate-800 rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] relative"
            >
              <button 
                onClick={() => setSelectedSession(null)}
                className="absolute top-4 right-4 text-slate-400 hover:text-white bg-slate-800 hover:bg-slate-700 p-2 rounded-full transition-colors"
              >
                <X size={20} />
              </button>

              <div className="flex items-center gap-4 mb-6 pr-12">
                <div className="w-16 h-16 bg-slate-800 rounded-2xl flex items-center justify-center text-blue-400 shrink-0">
                    <Building2 size={32} />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-white">{selectedSession.company}</h2>
                  <p className="text-slate-400 text-lg flex items-center gap-2 mt-1">
                    <Briefcase size={16} />
                    {selectedSession.role}
                  </p>
                </div>
              </div>
              
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-sm text-slate-400 mb-1">Score</div>
                  <div className={`text-xl font-bold ${getScoreColor(selectedSession.score)}`}>{selectedSession.score}/100</div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800">
                  <div className="text-sm text-slate-400 mb-1">Probability</div>
                  <div className={`text-sm font-bold ${
                     selectedSession.crackProbability === 'Highly Likely' || selectedSession.crackProbability === 'High' ? 'text-emerald-400' : 
                     selectedSession.crackProbability === 'Possible' || selectedSession.crackProbability === 'Moderate' ? 'text-amber-400' : 'text-rose-400'
                  }`}>
                    {selectedSession.crackProbability}
                  </div>
                </div>
                <div className="bg-slate-800/50 rounded-xl p-4 border border-slate-800 col-span-2">
                  <div className="text-sm text-slate-400 mb-1">Date</div>
                  <div className="text-slate-200">
                    {selectedSession.date ? format(parseISO(selectedSession.date), 'MMM d, yyyy h:mm a') : 'Unknown'}
                  </div>
                </div>
              </div>

              <div className="space-y-6">
                <div>
                  <h3 className="text-lg font-bold text-white mb-3">Overall Summary</h3>
                  <div className="bg-slate-800/30 p-4 rounded-xl border border-slate-800">
                    <p className="text-slate-300 leading-relaxed">
                      {selectedSession.overallSummary || "Summary details are not available for this session."}
                    </p>
                  </div>
                </div>

                {selectedSession.improvements && selectedSession.improvements.length > 0 && (
                  <div>
                    <h3 className="text-lg flex items-center gap-2 font-bold text-amber-400 mb-3">
                      <Target size={20} />
                      Areas for Improvement
                    </h3>
                    <ul className="space-y-2">
                      {selectedSession.improvements.map((item, idx) => (
                         <li key={idx} className="flex gap-3 text-slate-300">
                           <span className="text-amber-500/50 font-bold mt-0.5">•</span>
                           <span>{item}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                )}

                {selectedSession.studyTopics && selectedSession.studyTopics.length > 0 && (
                  <div>
                    <h3 className="text-lg flex items-center gap-2 font-bold text-emerald-400 mb-3">
                      <CheckCircle2 size={20} />
                      Recommended Study Topics
                    </h3>
                    <ul className="space-y-2">
                      {selectedSession.studyTopics.map((item, idx) => (
                         <li key={idx} className="flex gap-3 text-slate-300">
                           <span className="text-emerald-500/50 font-bold mt-0.5">•</span>
                           <span>{item}</span>
                         </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
