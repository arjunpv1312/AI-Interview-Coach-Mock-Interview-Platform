import React, { useEffect, useState, useRef } from 'react';
import { InterviewSession } from '../types';
import { Trophy, TrendingUp, RefreshCcw, Share2, Target, MessageCircle, Code2, Award, BookOpen, Download } from 'lucide-react';
import { motion, useMotionValue, useTransform, animate } from 'motion/react';
import html2canvas from 'html2canvas';
import jsPDF from 'jspdf';

function AnimatedScore({ score }: { score: number }) {
  const count = useMotionValue(0);
  const rounded = useTransform(count, Math.round);

  useEffect(() => {
    const animation = animate(count, score, { duration: 2, ease: "easeOut" });
    return animation.stop;
  }, [score]);

  // Determine color based on score
  const colorClass = 
    score >= 80 ? 'text-emerald-400 drop-shadow-[0_0_15px_rgba(52,211,153,0.5)]' :
    score >= 60 ? 'text-amber-400 drop-shadow-[0_0_15px_rgba(251,191,36,0.5)]' :
    'text-rose-400 drop-shadow-[0_0_15px_rgba(244,63,94,0.5)]';

  return (
    <div className="flex flex-col items-center justify-center p-6 bg-slate-800/50 rounded-3xl border border-slate-700 w-48 h-48 mx-auto shadow-2xl relative overflow-hidden group">
        <div className="absolute inset-0 bg-gradient-to-b from-transparent to-slate-900/50" />
        <div className="relative z-10 flex flex-col items-center justify-center gap-2 text-center">
            <span className="text-sm font-semibold text-slate-400 uppercase tracking-widest">Overall Score</span>
            <div className="flex items-baseline justify-center gap-1">
                <motion.span className={`text-6xl font-black ${colorClass}`}>
                    {rounded}
                </motion.span>
                <span className="text-xl font-bold text-slate-500">/ 100</span>
            </div>
            <Award className={`mt-2 ${colorClass.split(' ')[0]} opacity-70`} size={24} />
        </div>
        
        {/* Animated border rings */}
        <motion.div 
            className="absolute inset-0 border-2 rounded-3xl"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: [0, 0.5, 0], scale: [0.8, 1.1, 1.2] }}
            transition={{ duration: 2, repeat: Infinity, ease: "easeOut" }}
            style={{ borderColor: score >= 80 ? '#34d399' : score >= 60 ? '#fbbf24' : '#f43f5e' }}
        />
    </div>
  );
}

interface ResultsViewProps {
  session: InterviewSession;
  onRetake: () => void;
  onDashboard: () => void;
  onSaveScore?: (score: any) => void;
}

export function ResultsView({ session, onRetake, onDashboard, onSaveScore }: ResultsViewProps) {
  const [loading, setLoading] = useState(true);
  const [evaluation, setEvaluation] = useState<any>(null);
  const [downloading, setDownloading] = useState(false);
  const reportRef = useRef<HTMLDivElement>(null);
  const savedScoreRef = React.useRef(false);

  const handleDownloadPDF = async () => {
    if (!reportRef.current) return;
    try {
      setDownloading(true);
      const canvas = await html2canvas(reportRef.current, {
        scale: 2,
        useCORS: true,
        backgroundColor: '#0f172a' // match slate-900 or similar
      });
      const imgData = canvas.toDataURL('image/png');
      const pdf = new jsPDF('p', 'mm', 'a4');
      
      const pdfWidth = pdf.internal.pageSize.getWidth();
      const pdfHeight = (canvas.height * pdfWidth) / canvas.width;
      
      let heightLeft = pdfHeight;
      let position = 0;
      
      pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
      heightLeft -= pdf.internal.pageSize.getHeight();
      
      while (heightLeft >= 0) {
        position = heightLeft - pdfHeight;
        pdf.addPage();
        pdf.addImage(imgData, 'PNG', 0, position, pdfWidth, pdfHeight);
        heightLeft -= pdf.internal.pageSize.getHeight();
      }
      
      pdf.save('interview-report.pdf');
    } catch (error) {
      console.error('Failed to download PDF', error);
    } finally {
      setDownloading(false);
    }
  };

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
                overallScore: 0,
                overallSummary: "We encountered a network error while connecting to the AI. Please try again.",
                speakingSkills: "N/A",
                technicalSkills: "N/A",
                deepDive: "N/A",
                improvements: ["Try again"]
            };
        }
        
        if (isMounted) {
            setEvaluation(data);
            if (onSaveScore && !savedScoreRef.current) {
                savedScoreRef.current = true;
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
    <div className="max-w-5xl mx-auto space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-700 pb-12" ref={reportRef}>
      
      {/* Top Header */}
      <div className="text-center space-y-6">
        <div className="inline-flex items-center justify-center p-4 bg-blue-500/10 rounded-full mb-2 border border-blue-500/20 shadow-[0_0_40px_-10px_rgba(59,130,246,0.3)]">
            <Trophy size={48} className="text-blue-400" />
        </div>
        <div>
            <h1 className="text-3xl lg:text-5xl font-extrabold text-white tracking-tight mb-8">
                Interview <span className="text-transparent bg-clip-text bg-gradient-to-r from-blue-400 to-purple-400">Verdict</span>
            </h1>
            
            <div className="flex flex-col md:flex-row items-center justify-center gap-8 mb-4">
                <AnimatedScore score={evaluation.overallScore || 0} />
            </div>

            <div className={`mx-auto mt-6 inline-flex items-center gap-2 px-6 py-2 rounded-full border text-lg font-bold shadow-lg ${crackColor}`}>
                Probability of Cracking: {evaluation.crackProbability}
            </div>
        </div>
      </div>

      <motion.div 
        className="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-8"
        initial="hidden"
        animate="visible"
        variants={{
          visible: {
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.3
            }
          }
        }}
      >
        
        {/* Core Analysis Cards */}
        <div className="lg:col-span-2 space-y-6">
            <motion.div 
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
            >
                <div className="absolute top-0 right-0 p-8 opacity-10">
                    <Target size={120} />
                </div>
                <h2 className="text-xl font-bold text-white mb-4 relative z-10 flex items-center gap-2">
                    Overall Summary
                </h2>
                <p className="text-slate-300 leading-relaxed text-lg relative z-10">
                    {evaluation.overallSummary}
                </p>
            </motion.div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <motion.div 
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg"
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                    }}
                >
                    <div className="flex items-center gap-3 mb-4 text-purple-400">
                        <MessageCircle size={24} />
                        <h3 className="text-lg font-semibold text-white">Speaking Skills</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        {evaluation.speakingSkills}
                    </p>
                </motion.div>
                
                <motion.div 
                    className="bg-slate-900/80 border border-slate-800 rounded-2xl p-6 shadow-lg"
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                    }}
                >
                    <div className="flex items-center gap-3 mb-4 text-emerald-400">
                        <Code2 size={24} />
                        <h3 className="text-lg font-semibold text-white">Technical Skills</h3>
                    </div>
                    <p className="text-slate-400 leading-relaxed">
                        {evaluation.technicalSkills}
                    </p>
                </motion.div>
            </div>
        </div>

        {/* Sidebar */}
        <div className="flex flex-col gap-6">
            <motion.div 
                className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl"
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
            >
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
            </motion.div>

            {evaluation.studyTopics && evaluation.studyTopics.length > 0 && (
                <motion.div 
                    className="bg-slate-900 border border-slate-700 rounded-2xl p-6 shadow-xl"
                    variants={{
                        hidden: { opacity: 0, y: 20 },
                        visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                    }}
                >
                    <div className="flex items-center gap-2 text-white mb-6">
                        <BookOpen className="text-blue-400" />
                        <h2 className="text-xl font-bold">Recommended Study</h2>
                    </div>
                    <ul className="space-y-4">
                        {evaluation.studyTopics.map((topic: string, i: number) => (
                            <li key={i} className="flex gap-3 text-slate-300">
                                <span className="shrink-0 flex items-center justify-center w-6 h-6 rounded-full bg-slate-800 text-blue-400 text-xs font-bold font-mono">
                                    {i + 1}
                                </span>
                                <span className="leading-snug">{topic}</span>
                            </li>
                        ))}
                    </ul>
                </motion.div>
            )}

            <motion.div 
                className="flex flex-col justify-center gap-3 mt-auto"
                data-html2canvas-ignore="true"
                variants={{
                    hidden: { opacity: 0, y: 20 },
                    visible: { opacity: 1, y: 0, transition: { duration: 0.6, ease: "easeOut" } }
                }}
            >
                <button onClick={onRetake} className="w-full flex items-center justify-center gap-3 bg-slate-800 hover:bg-slate-700 text-white p-4 rounded-xl font-bold transition-colors">
                    <RefreshCcw size={20} /> New Interview
                </button>
                <button 
                  onClick={handleDownloadPDF} 
                  disabled={downloading}
                  className="w-full flex items-center justify-center gap-3 bg-indigo-600/10 border border-indigo-600/50 hover:bg-indigo-600/20 text-indigo-400 disabled:opacity-50 p-4 rounded-xl font-bold transition-colors"
                >
                    {downloading ? (
                      <div className="w-5 h-5 border-2 border-indigo-400 border-t-transparent rounded-full animate-spin"></div>
                    ) : (
                      <Download size={20} />
                    )} 
                    {downloading ? 'Generating PDF...' : 'Download Report'}
                </button>
                <button className="w-full flex items-center justify-center gap-3 bg-blue-600/10 border border-blue-600/50 hover:bg-blue-600/20 text-blue-400 p-4 rounded-xl font-bold transition-colors">
                    <Share2 size={20} /> Share Verdict
                </button>
                <button onClick={onDashboard} className="w-full flex items-center justify-center gap-3 text-slate-400 hover:text-white p-4 font-medium transition-colors">
                    Back to Dashboard
                </button>
            </motion.div>
        </div>
      </motion.div>
      
      {/* Deep-Dive Analysis Section */}
      <motion.div 
          className="bg-slate-900 border border-slate-700 rounded-2xl p-6 md:p-8 shadow-xl relative overflow-hidden"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.6, ease: "easeOut", delay: 1 }}
      >
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
      </motion.div>
    </div>
  );
}
