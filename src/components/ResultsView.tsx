import React, { useEffect, useState } from 'react';
import { InterviewSession } from '../types';
import { Trophy, TrendingUp, RefreshCcw, Share2, Target, MessageCircle, Code2 } from 'lucide-react';

interface ResultsViewProps {
  session: InterviewSession;
  onRetake: () => void;
  onDashboard: () => void;
  onSaveScore?: (score: any) => void;
}

export function ResultsView({ session, onRetake, onDashboard, onSaveScore }: ResultsViewProps) {
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<any>(null);

  useEffect(() => {
    let isMounted = true;
    const fetchEvaluation = async () => {
      try {
        const res = await fetch('/api/evaluate', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                company: session.company,
                role: session.role,
                history: session.history
            })
        });
        
        const textResponse = await res.text();
        let data;
        try {
            data = JSON.parse(textResponse);
        } catch (e) {
            console.error("Failed to parse evaluation response", textResponse);
            data = {
                crackProbability: "Needs Work",
                overallSummary: "We encountered a network error while connecting to the AI. Please try again.",
                speakingSkills: "N/A",
                technicalSkills: "N/A",
                deepDive: "N/A",
                improvements: ["Try again"]
            };
        }
        
        if (isMounted) {
            setEvaluation(data);
            if (onSaveScore) {
                onSaveScore(data);
            }
        }
      } catch (e) {
        console.error(e);
      } finally {
        if (isMounted) {
            setLoading(false);
        }
      }
    };

    fetchEvaluation();
    return () => { isMounted = false; };
  }, [session]);


  if (loading) {
    return (
        <div className="flex flex-col items-center justify-center min-h-[60vh] gap-6">
            <div className="w-16 h-16 border-4 border-blue-500/20 border-t-blue-500 rounded-full animate-spin"></div>
            <div className="text-xl font-medium animate-pulse text-blue-400">AI is analyzing your entire interview...</div>
            <p className="text-slate-500 text-sm">Evaluating speaking skills, technical depth, and final verdict.</p>
        </div>
    )
  }

  if (!evaluation) return null;

  const crackColor = 
    evaluation.crackProbability === 'Highly Likely' ? 'text-emerald-400 border-emerald-500/30 bg-emerald-500/10' :
    evaluation.crackProbability === 'Possible' ? 'text-amber-400 border-amber-500/30 bg-amber-500/10' :
    'text-rose-400 border-rose-500/30 bg-rose-500/10';

  return (
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12">
      
      {/* Top Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-2 border border-blue-500/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
            <Trophy size={48} className="text-blue-400" />
        </div>
        <div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-4">
                Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Verdict</span>
            </h1>
            <div className={`mx-auto inline-flex items-center gap-2 px-6 py-2 rounded-full border text-lg font-bold shadow-lg ${crackColor}`}>
                Probability of Cracking: {evaluation.crackProbability}
            </div>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8">
        
        {/* Core Analysis Cards */}
        <div className="lg:col-span-2 space-y-6">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Target size={120} />
                </div>
                <h2 className="text-xl font-bold text-white mb-4 relative z-10 flex items-center gap-2">
                    Overall Summary
                </h2>
                <p className="text-slate-300 leading-relaxed text-lg relative z-10">
                    {evaluation.overallSummary}
                </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4 text-purple-400">
                        <MessageCircle size={24} />
                        <h3 className="text-lg font-semibold text-white">Speaking Skills</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        {evaluation.speakingSkills}
                    </p>
                </div>
                
                <div className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg">
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <Code2 size={24} />
                        <h3 className="text-lg font-semibold text-white">Technical Skills</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        {evaluation.technicalSkills}
                    </p>
                </div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
            <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl">
                <div className="flex items-center gap-2 text-white mb-6">
                    <TrendingUp className="text-amber-400" />
                    <h2 className="text-xl font-bold">Top Improvements</h2>
                </div>
                <ul className="space-y-4">
                    {evaluation.improvements?.map((imp: string, i: number) => (
                        <li key={i} className="flex gap-3 text-slate-300">
                            <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-amber-400 text-xs font-bold font-mono">
                                {i + 1}
                            </span>
                            <span className="leading-snug">{imp}</span>
                        </li>
                    ))}
                </ul>
            </div>

            <div className="flex flex-col justify-center gap-3 mt-auto">
                <button onClick={onRetake} className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl font-bold transition-colors">
                    <RefreshCcw size={20} /> New Interview
                </button>
                <button className="w-full flex items-center justify-center gap-3 bg-blue-600/10 border border-blue-600/50 hover:bg-blue-600/20 text-blue-400 p-4 rounded-xl font-bold transition-colors">
                    <Share2 size={20} /> Share Verdict
                </button>
                <button onClick={onDashboard} className="w-full flex items-center justify-center gap-3 text-slate-400 hover:text-white p-4 font-medium transition-colors">
                    Back to Dashboard
                </button>
            </div>
        </div>
      </div>
      
      {/* Deep-Dive Analysis Section */}
      <div className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden">
          <div className="absolute top-0 right-0 p-8 opacity-5">
              <Target size={160} />
          </div>
          <div className="relative z-10">
              <div className="flex items-center gap-3 mb-6 pb-4 border-b border-slate-800">
                  <Target className="text-blue-400" size={28} />
                  <h2 className="text-2xl font-bold text-white tracking-tight">Deep-Dive Analysis</h2>
              </div>
              <div className="prose prose-invert max-w-none text-slate-300">
                  {evaluation.deepDive ? evaluation.deepDive.split('\n').map((paragraph: string, index: number) => (
                      paragraph.trim() ? <p key={index} className="mb-4 leading-relaxed text-lg">{paragraph}</p> : null
                  )) : (
                      <p className="italic text-slate-500">No detailed analysis available for this session.</p>
                  )}
              </div>
          </div>
      </div>
    </div>
  );
}
