import React, { useState, useEffect } from 'react';
import { User } from '../types';
import { ArrowLeft, Sparkles, AlertCircle, RefreshCcw, TrendingUp, TrendingDown, BookOpen, Clock } from 'lucide-react';
import { motion } from 'motion/react';

interface SuggestionsViewProps {
  user: User;
  onNavigate: (view: any) => void;
}

export function SuggestionsView({ user, onNavigate }: SuggestionsViewProps) {
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
      
      let historyStr = "No past sessions yet. Need more data to provide fully accurate insights.";
      if (user.pastSessions && user.pastSessions.length > 0) {
        historyStr = user.pastSessions.slice(0, 5).map(s => 
          `Session [${s.company} - ${s.role}]: Score ${s.score}. Improvements: ${s.improvements?.join(',')}`
        ).join('\n');
      }

      const res = await fetch('/api/insights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ userDetails, historyStr })
      });
      
      const result = await res.json();
      setData(result);
    } catch (err) {
      console.error(err);
      setError(true);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-5xl mx-auto space-y-6 pb-12 animate-in fade-in duration-500">
      <div className="flex items-center justify-between mb-8">
        <button 
          onClick={() => onNavigate('dashboard')}
          className="flex items-center gap-2 text-slate-400 hover:text-white transition-colors p-2 -ml-2 rounded-lg hover:bg-slate-800"
        >
          <ArrowLeft size={20} /> Back to Dashboard
        </button>
        <button
          onClick={fetchInsights}
          disabled={loading}
          className="flex items-center gap-2 px-4 py-2 bg-indigo-500/20 text-indigo-400 hover:bg-indigo-500/30 rounded-xl transition-colors disabled:opacity-50"
        >
          <RefreshCcw size={16} className={loading ? "animate-spin" : ""} />
          Refresh Insights
        </button>
      </div>

      <div className="flex flex-col md:flex-row gap-4 items-start md:items-center">
        <div className="p-3 bg-indigo-500/20 rounded-xl">
          <Sparkles className="text-indigo-400" size={32} />
        </div>
        <div>
          <h1 className="text-3xl font-bold text-white">AI Career Coach</h1>
          <p className="text-slate-400">Personalized data-driven insights tailored to your interview performance.</p>
        </div>
      </div>

      {loading ? (
        <div className="h-64 flex flex-col items-center justify-center space-y-4">
          <div className="w-10 h-10 border-4 border-indigo-500/30 border-t-indigo-500 rounded-full animate-spin" />
          <p className="text-indigo-400 font-medium animate-pulse">Analyzing your interview patterns...</p>
        </div>
      ) : error ? (
        <div className="bg-rose-500/10 border border-rose-500/20 p-6 rounded-2xl flex items-center gap-4 text-rose-400">
          <AlertCircle size={32} />
          <div>
            <h3 className="font-bold text-lg">Analysis Failed</h3>
            <p className="text-sm opacity-80">We encountered a problem generating your insights. Please try again later.</p>
          </div>
        </div>
      ) : data ? (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-8">
          
          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} className="bg-emerald-500/10 border border-emerald-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-emerald-400 mb-4 items-center flex gap-2">
              <TrendingUp /> Core Strengths
            </h2>
            <ul className="space-y-3">
              {data.strengths?.map((str: string, i: number) => (
                <li key={i} className="flex gap-3 text-slate-300">
                  <span className="text-emerald-500 mt-1">•</span> {str}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.1}} className="bg-rose-500/10 border border-rose-500/20 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-rose-400 mb-4 items-center flex gap-2">
              <TrendingDown /> Areas for Growth
            </h2>
            <ul className="space-y-3">
              {data.weaknesses?.map((wk: string, i: number) => (
                <li key={i} className="flex gap-3 text-slate-300">
                  <span className="text-rose-500 mt-1">•</span> {wk}
                </li>
              ))}
            </ul>
          </motion.div>

          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.2}} className="md:col-span-2 bg-slate-800/40 border border-slate-700/50 rounded-2xl p-6">
            <h2 className="text-xl font-bold text-indigo-400 mb-6 items-center flex gap-2">
              <BookOpen /> Recommended Study Plan
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              {data.studyPlan?.map((plan: any, i: number) => (
                <div key={i} className="bg-slate-900/50 p-5 rounded-xl border border-slate-700/50 hover:border-indigo-500/30 transition-colors">
                  <h3 className="font-bold text-white mb-2 text-lg">{plan.topic}</h3>
                  <p className="text-sm text-slate-400 mb-4 border-l-2 border-indigo-500/50 pl-3">{plan.reason}</p>
                  <div className="text-indigo-300/90 text-sm font-medium">
                    <span className="block text-xs uppercase tracking-wider text-slate-500 mb-1">Action</span>
                    {plan.actionableSteps}
                  </div>
                </div>
              ))}
            </div>
          </motion.div>

          <motion.div initial={{y: 20, opacity: 0}} animate={{y: 0, opacity: 1}} transition={{delay: 0.3}} className="md:col-span-2 bg-gradient-to-r from-indigo-900/40 to-blue-900/40 border border-indigo-500/30 rounded-2xl p-8 relative overflow-hidden">
             <Sparkles className="absolute right-0 top-0 text-white/5 w-64 h-64 -translate-y-1/4 translate-x-1/4 pointer-events-none" />
             <h2 className="text-xl font-bold text-white mb-2">Coach's Advice</h2>
             <p className="text-lg text-indigo-200 leading-relaxed font-serif italic">"{data.overallAdvice}"</p>
          </motion.div>

        </div>
      ) : null}
    </div>
  );
}
