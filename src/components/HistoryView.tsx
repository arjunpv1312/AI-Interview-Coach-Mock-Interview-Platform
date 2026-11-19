import React, { useState, useEffect } from 'react';
import { User, PastSession } from '../types';
import { motion, AnimatePresence } from 'motion/react';
import {
  Building2,
  Calendar,
  Download,
  X,
  Target,
  CheckCircle2,
  FileText,
  Search,
  Activity,
} from 'lucide-react';
import { format, parseISO } from 'date-fns';

interface HistoryViewProps {
  user: User;
  onNavigate: (v: any) => void;
}

export function HistoryView({ user, onNavigate }: HistoryViewProps) {
  const [selectedSession, setSelectedSession] = useState<PastSession | null>(
    null
  );
  const [query, setQuery] = useState('');
  const pastSessions = user.pastSessions || [];

  useEffect(() => {
    if (!selectedSession) return;
    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        setSelectedSession(null);
      }
    };
    window.addEventListener('keydown', onKeyDown);
    return () => window.removeEventListener('keydown', onKeyDown);
  }, [selectedSession]);

  const filteredSessions = pastSessions.filter((s) => {
    if (!query.trim()) return true;
    const q = query.toLowerCase();
    return (
      s.company.toLowerCase().includes(q) ||
      s.role.toLowerCase().includes(q) ||
      (s.resumeUsed && s.resumeUsed.toLowerCase().includes(q))
    );
  });

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-emerald-700 dark:text-emerald-400';
    if (score >= 60) return 'text-violet-700 dark:text-violet-400';
    return 'text-rose-700 dark:text-rose-400';
  };

  const getProbColor = (prob: string) => {
    if (prob === 'Highly Likely' || prob === 'High') {
      return 'text-emerald-700 dark:text-emerald-400';
    }
    if (prob === 'Possible' || prob === 'Moderate') {
      return 'text-violet-700 dark:text-violet-400';
    }
    return 'text-rose-700 dark:text-rose-400';
  };

  const handleExportCSV = () => {
    if (!pastSessions.length) return;

    const headers = ['Date', 'Company', 'Role', 'Score', 'Probability', 'Resume'];
    const rows = pastSessions.map((session) => [
      session.date
        ? format(parseISO(session.date), 'yyyy-MM-dd HH:mm:ss')
        : 'Unknown Date',
      `"${session.company.replace(/"/g, '""')}"`,
      `"${session.role.replace(/"/g, '""')}"`,
      session.score,
      `"${session.crackProbability}"`,
      `"${(session.resumeUsed || 'None').replace(/"/g, '""')}"`,
    ]);

    const csvContent = [
      headers.join(','),
      ...rows.map((row) => row.join(',')),
    ].join('\n');

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', 'interview_history.csv');
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="max-w-6xl mx-auto space-y-6 pb-12">
      <div className="flex flex-col md:flex-row md:items-end justify-between gap-4 border-b border-[#e4ddf5] dark:border-[#26193f] pb-6">
        <div>
          <p className="text-xs font-medium text-violet-700 dark:text-violet-400 mb-1.5">
            Encrypted Performance Log
          </p>
          <h1 className="text-3xl font-bold tracking-tight text-[#140f1f] dark:text-white">
            Interview History
          </h1>
          <p className="text-[#5a5170] dark:text-[#a69cbe] text-sm mt-1">
            Inspect past mock sessions, resume-grounded breakdowns, and score
            progression.
          </p>
        </div>
        {pastSessions.length > 0 && (
          <button
            type="button"
            onClick={handleExportCSV}
            className="flex items-center gap-2 bg-white dark:bg-black hover:bg-[#f6f3fd] dark:hover:bg-[#120b24] text-violet-700 dark:text-violet-300 px-4 py-2.5 rounded-xl text-xs font-semibold transition-colors border border-violet-500/40 cursor-pointer whitespace-nowrap self-start md:self-auto"
          >
            <Download size={15} />
            <span>Export CSV</span>
          </button>
        )}
      </div>

      {pastSessions.length > 0 && (
        <div className="relative">
          <Search
            size={16}
            className="absolute left-4 top-1/2 -translate-y-1/2 text-[#5a5170] dark:text-[#a69cbe]"
          />
          <input
            type="text"
            aria-label="Filter interview history"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Filter history by company, role, or resume filename..."
            className="w-full bg-white dark:bg-[#08050f] border border-[#e4ddf5] dark:border-[#26193f] rounded-xl py-3 pl-11 pr-4 text-sm text-[#140f1f] dark:text-white placeholder:text-[#5a5170] dark:placeholder:text-[#a69cbe] focus:ring-2 focus:ring-violet-500 outline-none"
          />
        </div>
      )}

      {pastSessions.length === 0 ? (
        <div className="amoled-surface rounded-2xl p-12 text-center">
          <div className="w-16 h-16 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-2xl flex items-center justify-center mx-auto mb-5 text-violet-700 dark:text-violet-400">
            <Activity size={28} />
          </div>
          <h3 className="text-xl font-bold text-[#140f1f] dark:text-white mb-2">
            No completed interviews yet
          </h3>
          <p className="text-sm text-[#5a5170] dark:text-[#a69cbe] max-w-md mx-auto mb-7">
            Your AES-256-GCM encrypted interview archive will appear here as
            soon as you finish your first mock session.
          </p>
          <button
            type="button"
            onClick={() => onNavigate('setup')}
            className="amoled-btn-primary text-white px-6 py-3 rounded-xl text-sm font-bold transition-all cursor-pointer"
          >
            Start Your First Interview
          </button>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredSessions.map((session, i) => (
            <motion.button
              type="button"
              key={session.id || i}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: i * 0.03 }}
              onClick={() => setSelectedSession(session)}
              className="w-full text-left amoled-surface rounded-2xl p-5 flex flex-col md:flex-row gap-5 justify-between items-start md:items-center hover:border-violet-500/50 transition-colors cursor-pointer"
            >
              <div className="flex items-center gap-4 min-w-0">
                <div className="w-11 h-11 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl flex items-center justify-center text-violet-700 dark:text-violet-400 shrink-0">
                  <Building2 size={20} />
                </div>
                <div className="min-w-0">
                  <h3 className="text-base font-bold text-[#140f1f] dark:text-white truncate">
                    {session.company}
                  </h3>
                  <div className="flex flex-wrap items-center gap-2 text-xs text-[#5a5170] dark:text-[#a69cbe] mt-1">
                    <span>{session.role}</span>
                    {session.resumeUsed && (
                      <>
                        <span aria-hidden="true">·</span>
                        <span className="text-violet-700 dark:text-violet-300">
                          Resume: {session.resumeUsed}
                        </span>
                      </>
                    )}
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between md:justify-end gap-6 w-full md:w-auto pt-3 md:pt-0 border-t md:border-t-0 border-[#e4ddf5] dark:border-[#26193f]">
                <div className="text-left md:text-right">
                  <div className="flex items-center gap-1.5 text-xs text-[#362f47] dark:text-[#d8d0ea] font-mono tabular-nums">
                    <Calendar
                      size={13}
                      className="text-[#5a5170] dark:text-[#a69cbe]"
                    />
                    <span>
                      {session.date
                        ? format(parseISO(session.date), 'MMM d, yyyy')
                        : 'Unknown Date'}
                    </span>
                  </div>
                  <div
                    className={`text-xs font-semibold mt-1 ${getProbColor(
                      session.crackProbability
                    )}`}
                  >
                    {session.crackProbability} Probability
                  </div>
                </div>

                <div className="h-9 w-px bg-[#e4ddf5] dark:bg-[#26193f] hidden md:block" />

                <div className="text-right min-w-[64px]">
                  <div className="text-[11px] text-[#5a5170] dark:text-[#a69cbe]">
                    Score
                  </div>
                  <div
                    className={`text-2xl font-extrabold font-mono tabular-nums ${getScoreColor(
                      session.score
                    )}`}
                  >
                    {session.score}
                  </div>
                </div>
              </div>
            </motion.button>
          ))}

          {filteredSessions.length === 0 && (
            <div className="amoled-surface rounded-2xl p-8 text-center text-sm text-[#5a5170] dark:text-[#a69cbe]">
              No sessions match &quot;{query}&quot;.
            </div>
          )}
        </div>
      )}

      {/* Session Detail Modal */}
      <AnimatePresence>
        {selectedSession && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/75 backdrop-blur-sm"
            onClick={() => setSelectedSession(null)}
          >
            <motion.div
              role="dialog"
              aria-modal="true"
              aria-labelledby="history-modal-title"
              initial={{ opacity: 0, scale: 0.97, y: 16 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.97, y: 16 }}
              onClick={(e) => e.stopPropagation()}
              className="amoled-surface rounded-2xl p-6 md:p-8 max-w-2xl w-full shadow-2xl overflow-y-auto max-h-[90vh] relative custom-scrollbar"
            >
              <button
                type="button"
                aria-label="Close session summary"
                onClick={() => setSelectedSession(null)}
                className="absolute top-4 right-4 text-[#5a5170] dark:text-[#a69cbe] hover:text-[#140f1f] dark:hover:text-white bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] p-2 rounded-lg transition-colors cursor-pointer"
              >
                <X size={18} />
              </button>

              <div className="flex items-center gap-4 mb-6 pr-12">
                <div className="w-12 h-12 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl flex items-center justify-center text-violet-700 dark:text-violet-400 shrink-0">
                  <Building2 size={24} />
                </div>
                <div>
                  <h2
                    id="history-modal-title"
                    className="text-2xl font-bold text-[#140f1f] dark:text-white"
                  >
                    {selectedSession.company}
                  </h2>
                  <p className="text-[#5a5170] dark:text-[#a69cbe] text-sm mt-0.5">
                    {selectedSession.role}
                    {selectedSession.resumeUsed
                      ? ` · Resume: ${selectedSession.resumeUsed}`
                      : ''}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
                <div className="bg-white dark:bg-black rounded-xl p-4 border border-[#e4ddf5] dark:border-[#26193f]">
                  <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] mb-1">
                    Score
                  </div>
                  <div
                    className={`text-xl font-bold font-mono tabular-nums ${getScoreColor(
                      selectedSession.score
                    )}`}
                  >
                    {selectedSession.score}/100
                  </div>
                </div>
                <div className="bg-white dark:bg-black rounded-xl p-4 border border-[#e4ddf5] dark:border-[#26193f]">
                  <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] mb-1">
                    Outcome
                  </div>
                  <div
                    className={`text-sm font-bold ${getProbColor(
                      selectedSession.crackProbability
                    )}`}
                  >
                    {selectedSession.crackProbability}
                  </div>
                </div>
                <div className="bg-white dark:bg-black rounded-xl p-4 border border-[#e4ddf5] dark:border-[#26193f] col-span-2">
                  <div className="text-xs text-[#5a5170] dark:text-[#a69cbe] mb-1">
                    Completed
                  </div>
                  <div className="text-sm text-[#140f1f] dark:text-[#d8d0ea] font-mono tabular-nums">
                    {selectedSession.date
                      ? format(
                          parseISO(selectedSession.date),
                          'MMM d, yyyy h:mm a'
                        )
                      : 'Unknown'}
                  </div>
                </div>
              </div>

              {selectedSession.skillScores && (
                <div className="mb-6 bg-white dark:bg-black border border-[#e4ddf5] dark:border-[#26193f] rounded-xl p-4 space-y-3">
                  <div className="text-xs font-bold text-violet-700 dark:text-violet-400">
                    Skill Dimension Breakdown
                  </div>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                    {[
                      {
                        label: 'Technical Depth',
                        val: selectedSession.skillScores.technicalDepth,
                      },
                      {
                        label: 'Resume Alignment',
                        val: selectedSession.skillScores.resumeAlignment,
                      },
                      {
                        label: 'System Architecture',
                        val: selectedSession.skillScores.systemArchitecture,
                      },
                      {
                        label: 'Communication',
                        val: selectedSession.skillScores.communication,
                      },
                      {
                        label: 'Problem Solving',
                        val: selectedSession.skillScores.problemSolving,
                      },
                    ].map((s) => (
                      <div key={s.label} className="space-y-1">
                        <div className="flex justify-between text-xs">
                          <span className="text-[#362f47] dark:text-[#d8d0ea]">
                            {s.label}
                          </span>
                          <span className="font-mono tabular-nums text-violet-700 dark:text-violet-300">
                            {s.val}%
                          </span>
                        </div>
                        <div className="h-1.5 bg-[#f2ecfc] dark:bg-[#140e24] rounded-full overflow-hidden">
                          <div
                            className="h-full bg-gradient-to-r from-violet-600 to-purple-500 rounded-full"
                            style={{ width: `${Math.min(100, s.val)}%` }}
                          />
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              <div className="space-y-5">
                <div>
                  <h3 className="text-sm font-bold text-[#140f1f] dark:text-white mb-2 flex items-center gap-2">
                    <FileText
                      size={15}
                      className="text-violet-700 dark:text-violet-400"
                    />
                    <span>Executive Summary</span>
                  </h3>
                  <div className="bg-white dark:bg-black p-4 rounded-xl border border-[#e4ddf5] dark:border-[#26193f]">
                    <p className="text-sm text-[#362f47] dark:text-[#d8d0ea] leading-relaxed">
                      {selectedSession.overallSummary ||
                        'Summary details are not available for this session.'}
                    </p>
                  </div>
                </div>

                {selectedSession.improvements &&
                  selectedSession.improvements.length > 0 && (
                    <div>
                      <h3 className="text-sm flex items-center gap-2 font-bold text-violet-700 dark:text-purple-400 mb-2">
                        <Target size={15} />
                        <span>Priority Improvements</span>
                      </h3>
                      <ul className="space-y-2 text-xs text-[#362f47] dark:text-[#d8d0ea] bg-white dark:bg-black p-4 rounded-xl border border-[#e4ddf5] dark:border-[#26193f]">
                        {selectedSession.improvements.map((item, idx) => (
                          <li key={idx} className="flex gap-2.5">
                            <span className="text-violet-700 dark:text-violet-400 font-bold">
                              •
                            </span>
                            <span>{item}</span>
                          </li>
                        ))}
                      </ul>
                    </div>
                  )}

                {selectedSession.studyTopics &&
                  selectedSession.studyTopics.length > 0 && (
                    <div>
                      <h3 className="text-sm flex items-center gap-2 font-bold text-emerald-700 dark:text-emerald-400 mb-2">
                        <CheckCircle2 size={15} />
                        <span>Recommended Study Topics</span>
                      </h3>
                      <ul className="space-y-2 text-xs text-[#362f47] dark:text-[#d8d0ea] bg-white dark:bg-black p-4 rounded-xl border border-[#e4ddf5] dark:border-[#26193f]">
                        {selectedSession.studyTopics.map((item, idx) => (
                          <li key={idx} className="flex gap-2.5">
                            <span className="text-emerald-700 dark:text-emerald-400 font-bold">
                              •
                            </span>
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
