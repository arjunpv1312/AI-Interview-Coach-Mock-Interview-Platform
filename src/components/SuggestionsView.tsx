import React, { useState, useEffect } from 'react';
import { User, InterviewConfig } from '../types';
import {
  ArrowLeft,
  Sparkles,
  AlertCircle,
  RefreshCcw,
  TrendingUp,
  TrendingDown,
  BookOpen,
  FileText,
  PlayCircle,
} from 'lucide-react';
import { motion } from 'motion/react';

interface SuggestionsViewProps {
  user: User;
  onNavigate: (view: any) => void;
  onLaunchTopic?: (prefill: Partial<InterviewConfig>) => void;
}

export function SuggestionsView({
  user,
  onNavigate,
  onLaunchTopic,
}: SuggestionsViewProps) {
  const [loading, setLoading] = useState(true);
  const [data, setData] = useState<any>(null);
  const [error, setError] = useState(false);

  useEffect(() => {
    fetchInsights();
  }, []);

  const fetchInsights = async () => {
    setLoading(true);
    setError(false);

    try {
      const userDetails = `
        Name: ${user.fullName}
        Total Interviews: ${user.totalInterviews}
        Average Score: ${user.averageScore}
        Score Trajectory: ${user.scoreHistory ? user.scoreHistory.join(', ') : 'None'}
      `;

      let historyStr =
        'No past sessions yet. Focus guidance on the candidate resume and core interview readiness.';
      if (user.pastSessions && user.pastSessions.length > 0) {
        historyStr = user.pastSessions
          .slice(0, 5)
          .map(
            (s) =>
              `Session [${s.company} - ${s.role}]: Score ${s.score}. Improvements: ${s.improvements?.join(', ')}`
          )
          .join('\n');
      }

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          userDetails,
          historyStr,
          resumeProfile: user.resumeProfile || null,
        }),
      });

      const result = await res.json();
      setData(result);
    } catch {
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12">
      <div className="flex flex-wrap items-center justify-between gap-4 border-b border-[#16223b] pb-6">
        <div className="flex items-center gap-4">
          <button
            type="button"
            onClick={() => onNavigate('dashboard')}
            className="p-2.5 bg-black border border-[#16223b] hover:border-blue-500/40 rounded-xl text-slate-400 hover:text-white transition-colors cursor-pointer"
          >
            <ArrowLeft size={18} />
          </button>
          <div>
            <h1 className="text-2xl sm:text-3xl font-bold text-white flex items-center gap-2.5">
              <Sparkles className="text-blue-400" size={24} />
              <span>AI Career Coach</span>
            </h1>
            <p className="text-slate-400 text-sm mt-1">
              Actionable coaching synthesized from your encrypted score history
              {user.resumeProfile
                ? ` and active resume (${user.resumeProfile.fileName})`
                : ''}
              .
            </p>
          </div>
        </div>

        <button
          type="button"
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2.5 bg-black hover:bg-[#0a1120] border border-blue-500/40 text-blue-300 text-xs font-semibold rounded-xl transition-colors disabled:opacity-50 cursor-pointer whitespace-nowrap"
        >
          <RefreshCcw size={14} className={loading ? 'animate-spin' : ''} />
          <span>Refresh Insights</span>
        </button>
      </div>

      {user.resumeProfile && (
        <div className="amoled-surface rounded-2xl p-4 flex items-center gap-3 text-xs text-slate-300">
          <FileText size={16} className="text-cyan-400 shrink-0" />
          <span>
            Resume-grounded coaching active for{' '}
            <strong className="text-white">
              {user.resumeProfile.candidateName}
            </strong>{' '}
            · {user.resumeProfile.skills.slice(0, 6).join(', ')}
          </span>
        </div>
      )}

      {loading ? (
        <div className="amoled-surface rounded-2xl h-64 flex flex-col items-center justify-center space-y-3">
          <div className="w-9 h-9 border-2 border-blue-500/30 border-t-blue-500 rounded-full animate-spin" />
          <p className="text-xs font-medium text-blue-300">
            Analyzing interview patterns and resume alignment...
          </p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/30 p-6 rounded-2xl flex items-center justify-between gap-4 text-rose-300">
          <div className="flex items-center gap-3">
            <AlertCircle size={24} />
            <div>
              <h3 className="font-bold text-sm">Analysis Unavailable</h3>
              <p className="text-xs opacity-80">
                Could not generate coaching insights right now.
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={fetchInsights}
            className="px-4 py-2 rounded-lg bg-black border border-rose-500/40 text-xs font-semibold text-white cursor-pointer"
          >
            Retry
          </button>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            className="amoled-surface rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-emerald-400 flex items-center gap-2">
              <TrendingUp size={18} />
              <span>Core Strengths</span>
            </h2>
            <ul className="space-y-3 text-sm text-slate-300">
              {data.strengths?.map((str: string, i: number) => (
                <li key={i} className="flex gap-2.5 leading-relaxed">
                  <span className="text-emerald-400 font-bold">•</span>
                  <span>{str}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.05 }}
            className="amoled-surface rounded-2xl p-6 space-y-4"
          >
            <h2 className="text-base font-bold text-rose-400 flex items-center gap-2">
              <TrendingDown size={18} />
              <span>Priority Growth Areas</span>
            </h2>
            <ul className="space-y-3 text-sm text-slate-300">
              {data.weaknesses?.map((wk: string, i: number) => (
                <li key={i} className="flex gap-2.5 leading-relaxed">
                  <span className="text-rose-400 font-bold">•</span>
                  <span>{wk}</span>
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.1 }}
            className="md:col-span-2 amoled-surface rounded-2xl p-6 space-y-5"
          >
            <h2 className="text-base font-bold text-blue-400 flex items-center gap-2">
              <BookOpen size={18} />
              <span>Targeted Study Plan</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.studyPlan?.map((plan: any, i: number) => (
                <div
                  key={i}
                  className="bg-black p-5 rounded-xl border border-[#16223b] flex flex-col justify-between gap-4"
                >
                  <div className="space-y-2.5">
                    <div className="text-xs font-mono text-blue-400">
                      0{i + 1}. Focus Area
                    </div>
                    <h3 className="font-bold text-white text-base">
                      {plan.topic}
                    </h3>
                    <p className="text-xs text-slate-400 leading-relaxed">
                      {plan.reason}
                    </p>
                    <div className="pt-2 border-t border-[#16223b] text-xs text-cyan-300 leading-relaxed">
                      <span className="block text-[11px] font-semibold text-slate-500 mb-1">
                        Recommended Action
                      </span>
                      {plan.actionableSteps}
                    </div>
                  </div>
                  <button
                    type="button"
                    onClick={() =>
                      onLaunchTopic
                        ? onLaunchTopic({ focusTopics: plan.topic })
                        : onNavigate('setup')
                    }
                    className="w-full py-2 rounded-lg bg-[#050912] hover:bg-[#0a1120] border border-blue-500/30 text-xs font-semibold text-blue-300 flex items-center justify-center gap-1.5 transition-colors cursor-pointer"
                  >
                    <PlayCircle size={14} />
                    <span>Practice This Focus</span>
                  </button>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div
            initial={{ y: 12, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            transition={{ delay: 0.15 }}
            className="md:col-span-2 amoled-surface rounded-2xl p-6 bg-gradient-to-r from-[#050b18] via-black to-[#041222] border-blue-500/30"
          >
            <h2 className="text-sm font-bold text-blue-400 mb-2">
              Coach Recommendation
            </h2>
            <p className="text-base text-slate-100 leading-relaxed">
              {data.overallAdvice}
            </p>
          </motion.div>
        </div>
      ) : null}
    </div>
  );
}
